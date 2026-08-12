import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
  });

  // Sensor Data Store
  let latestSensorData: Record<string, { data: any, lastUpdated: number }> = {};

  app.post("/api/sensor-data", (req, res) => {
    const { deviceId, ...data } = req.body;
    if (!deviceId) return res.status(400).json({ error: "deviceId required" });
    latestSensorData[deviceId] = { data, lastUpdated: Date.now() };
    res.status(200).json({ status: "ok" });
  });

  app.get("/api/sensor-data/:deviceId", (req, res) => {
    const { deviceId } = req.params;
    console.log(`Fetching data for device: ${deviceId}`);
    const nodeData = latestSensorData[deviceId];
    if (!nodeData) return res.status(404).json({ error: "Node not found" });
    
    // Check if offline (e.g., no update in 60s)
    const isOffline = Date.now() - nodeData.lastUpdated > 60000;
    res.json({ ...nodeData.data, isOffline });
  });

  // Gemini API Proxy Route
  app.post("/api/analyze", async (req, res) => {
    const { fieldName, cropType, coordinates, ndviScore } = req.body;

    if (!coordinates) {
      return res.status(400).json({ error: "Coordinates required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const [lat, lon] = coordinates.split(",").map((c: string) => c.trim());
    
    let nasaDataArr: any[] = [];
    try {
        // Fetch historical meteorological data from NASA POWER API (Last 14 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        
        const formatNASA = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
        const startStr = formatNASA(startDate);
        const endStr = formatNASA(endDate);
        
        const powerUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,TS,RH2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN&community=AG&longitude=${lon}&latitude=${lat}&start=${startStr}&end=${endStr}&format=JSON`;
        const powerRes = await fetch(powerUrl);
        const powerJson: any = await powerRes.json();
        
        if (powerJson.properties?.parameter) {
            const params = powerJson.properties.parameter;
            const dates = Object.keys(params.T2M).sort();
            nasaDataArr = dates.map(date => ({
                date,
                airTemp: params.T2M[date],
                surfaceTemp: params.TS[date],
                humidity: params.RH2M[date],
                precipitation: params.PRECTOTCORR[date],
                solarRadiation: params.ALLSKY_SFC_SW_DWN[date]
            }));
        }
    } catch (e) {
        console.error("NASA POWER fetch failed:", e);
    }

    const latest = nasaDataArr[nasaDataArr.length - 1] || {};
    const nodeData = latestSensorData["FieldNode-01"];
    const sensorInfo = nodeData ? `Local Sensor Temperature: ${nodeData.data.temperature}°C, Local Humidity: ${nodeData.data.humidity}%, Heat Index: ${nodeData.data.heatIndex}°C` : "No recent local sensor data";

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });

    const prompt = `
Analyze the following Earth Observation field report for a professional agricultural intelligence dashboard.

Plot Name: ${fieldName}
Crop Type: ${cropType}
Location: ${coordinates}
User Provided NDVI Score: ${ndviScore || "Not provided"}

Latest NASA Satellite Meteorological Data (Observed on ${latest.date || "N/A"}):
- Air Temperature (2m): ${latest.airTemp || "N/A"}°C
- Land Surface Temperature (Skin): ${latest.surfaceTemp || "N/A"}°C
- Humidity: ${latest.humidity || "N/A"}%
- Precipitation: ${latest.precipitation || "N/A"} mm/day
- Solar Radiation: ${latest.solarRadiation || "N/A"} kWh/m²/day

Historical Trend Summary (Last 14 days):
${nasaDataArr.map(d => `${d.date}: AirTemp=${d.airTemp}, SurfaceTemp=${d.surfaceTemp}, Precip=${d.precipitation}`).join('\n')}

Ground Sensor Data (ESP32):
${sensorInfo}

Provide a comprehensive diagnosis and recommendation report.
Analyze the data for:
1. Executive Summary: 3-5 professional, data-driven paragraphs.
2. Agricultural Assessment:
   - Crop Health (Excellent|Good|Moderate|Poor|Critical)
   - Temperature Risk (Low|Moderate|High)
   - Water Stress (Low|Moderate|High)
   - Detailed justification based on specific metrics.
3. Environmental Alerts: Detect anomalies (e.g. LST vs AirTemp divergence, heat stress, moisture deficiency).
4. Recommended Actions: Specific, actionable farming advice.

Format your response strictly in the following JSON structure:

{
  "plot_name": "String",
  "executive_summary": "String",
  "assessment": {
    "crop_health": "Excellent | Good | Moderate | Poor | Critical",
    "temp_risk": "Low | Moderate | High",
    "water_stress": "Low | Moderate | High",
    "vegetation_condition": "String",
    "environmental_risk": "String",
    "justification": "String"
  },
  "alerts": [
    { "type": "String", "severity": "low | medium | high", "message": "String" }
  ],
  "action_items": ["String"],
  "real_metrics": {
    "airTemp": Number,
    "surfaceTemp": Number,
    "humidity": Number,
    "precip": Number,
    "ndvi": Number,
    "observationDate": "String"
  }
}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are Harvest Orbit's Lead Satellite Agronomist AI.
Translate multispectral satellite data into plain-language, professional, and highly actionable farming advice.
Avoid generic filler. Every statement should be based on actual available data.`,
          responseMimeType: "application/json",
        },
      });

      const jsonText = response.text;
      if (!jsonText) throw new Error("No response from AI");
      const result = JSON.parse(jsonText);
      
      // Inject historical data for charts
      if (result.real_metrics) {
          result.real_metrics.historical = nasaDataArr;
      }
      
      res.json(result);
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to analyze field data" });
    }
  });

  // Weather Data Proxy Route
  app.get("/api/weather", async (req, res) => {
    const { coordinates } = req.query as { coordinates: string };
    if (!coordinates) return res.status(400).json({ error: "Coordinates required" });

    const [lat, lon] = coordinates.split(",").map(c => c.trim());
    
    try {
        // 1. Fetch Real-time data from Open-Meteo (Highest accuracy for current atmospheric conditions)
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,precipitation&timezone=auto`;
        const omRes = await fetch(openMeteoUrl);
        const omJson: any = await omRes.json();

        // 2. Fetch NASA Satellite data (Last available Land Surface Temperature)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const formatNASA = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
        const startStr = formatNASA(startDate);
        const endStr = formatNASA(endDate);
        const powerUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=TS&community=AG&longitude=${lon}&latitude=${lat}&start=${startStr}&end=${endStr}&format=JSON`;
        const powerRes = await fetch(powerUrl);
        const powerJson: any = await powerRes.json();

        let satelliteSurfTemp = "N/A";
        let nasaDate = "N/A";

        if (powerJson.properties?.parameter?.TS) {
            const tsParams = powerJson.properties.parameter.TS;
            const dates = Object.keys(tsParams).sort().reverse();
            const sanitize = (val: any) => (val === undefined || val === null || val < -900) ? undefined : val;
            
            for (const date of dates) {
                const ts = sanitize(tsParams[date]);
                if (ts !== undefined) {
                    satelliteSurfTemp = `${ts.toFixed(1)}°C`;
                    nasaDate = date;
                    break;
                }
            }
        }

        const liveAirTemp = omJson.current_weather?.temperature;
        const liveWind = omJson.current_weather?.windspeed;
        
        // Find current hour index for humidity/precip
        const now = new Date();
        const currentHourStr = now.toISOString().split(':')[0] + ':00';
        const hourIdx = omJson.hourly?.time?.findIndex((t: string) => t.startsWith(currentHourStr)) || 0;
        
        const liveHumidity = omJson.hourly?.relative_humidity_2m?.[hourIdx];
        const livePrecip = omJson.hourly?.precipitation?.[hourIdx];

        return res.json({
            airTemperature: liveAirTemp !== undefined ? `${liveAirTemp.toFixed(1)}°C` : "N/A",
            surfaceTemperature: satelliteSurfTemp,
            humidity: liveHumidity !== undefined ? `${liveHumidity}%` : "N/A",
            precipitation: livePrecip !== undefined ? `${livePrecip.toFixed(2)} mm` : "0.00 mm",
            observationDate: nasaDate,
            windSpeed: liveWind !== undefined ? `${liveWind} km/h` : "N/A"
        });

    } catch (e) {
        console.error("Weather fetch failed:", e);
    }

    // Fallback to local sensor or N/A
    const nodeData = latestSensorData["FieldNode-01"];
    res.json({
      airTemperature: nodeData ? `${nodeData.data.temperature.toFixed(1)}°C` : "N/A",
      surfaceTemperature: "N/A",
      humidity: nodeData ? `${nodeData.data.humidity.toFixed(1)}%` : "N/A",
      precipitation: "N/A",
      observationDate: "N/A"
    });
  });

  // Chat Bot Proxy Route
  app.post("/api/chat", async (req, res) => {
    const { message, history, context } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });
    
    const chat = ai.chats.create({
        model: "gemini-3.6-flash",
        config: {
            history: history || [],
        },
    });
    
    const prompt = `Answer the following question about the field, considering the provided context (Field Report and ESP32 Sensor data):
Question: ${message}
Context: ${JSON.stringify(context)}
`;
    
    try {
        const result = await chat.sendMessage(prompt);
        res.json({ response: result.text });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Chat error" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
