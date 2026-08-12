import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { NasaService } from "./src/services/nasaService";
import { WeatherService } from "./src/services/weatherService";
import { GeminiService } from "./src/services/geminiService";
import { SensorService } from "./src/services/sensorService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper: Coordinate validation
  const validateCoords = (coords: any) => {
    if (typeof coords !== 'string' || !coords.includes(",")) return null;
    const parts = coords.split(",").map(c => parseFloat(c.trim()));
    const [lat, lon] = parts;
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
    return { lat, lon };
  };

  // API Routes
  
  // 1. Analyze Field
  app.post("/api/analyze", async (req, res) => {
    const { fieldName, cropType, coordinates, ndviScore, deviceId = "FieldNode-01" } = req.body;
    
    const validated = validateCoords(coordinates);
    if (!validated) {
      return res.status(400).json({ 
        error: { code: "INVALID_COORDINATES", message: "Coordinates must be in 'lat, lon' format within valid ranges." } 
      });
    }

    try {
      // Parallel fetch NASA and Sensor data
      const [nasaData, sensorData] = await Promise.all([
        NasaService.fetchNasaData(validated.lat.toString(), validated.lon.toString()).catch(e => {
          console.error("NASA fetch failed in analyze:", e);
          return [];
        }),
        SensorService.getSensorData(deviceId).catch(e => {
          console.error("Sensor fetch failed in analyze:", e);
          return null;
        })
      ]);

      const latest: any = nasaData[0] || {};
      const sensorInfo = sensorData ? 
        `Local Sensor Temperature: ${sensorData.temperature}°C, Local Humidity: ${sensorData.humidity}%, Soil Moisture: ${sensorData.soilMoisture}%` : 
        "No recent local sensor data available.";

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
- Precipitation: ${latest.precip || "N/A"} mm/day
- Solar Radiation: ${latest.solarRadiation || "N/A"} kWh/m²/day

Historical Trend Summary (Last 14 days):
${nasaData.map(d => `${d.date}: AirTemp=${d.airTemp}, SurfaceTemp=${d.surfaceTemp}, Precip=${d.precip}`).join('\n')}

Ground Sensor Data (IoT):
${sensorInfo}

Provide a comprehensive diagnosis and recommendation report. Analyze crop health, temperature risk, water stress, and suggest specific actions.
`;

      const analysis = await GeminiService.analyzeField(prompt);
      
      // Inject the real metrics back into the response for the UI
      res.json({
        ...analysis,
        real_metrics: {
          airTemp: latest.airTemp || 0,
          surfaceTemp: latest.surfaceTemp || 0,
          humidity: latest.humidity || 0,
          precip: latest.precip || 0,
          ndvi: parseFloat(ndviScore) || 0,
          observationDate: latest.date || new Date().toISOString(),
          historical: nasaData
        }
      });
    } catch (error: any) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: { code: "ANALYSIS_FAILED", message: error.message || "An unexpected error occurred during analysis." } });
    }
  });

  // 2. Weather Synchronization
  app.get("/api/weather", async (req, res) => {
    const { coordinates } = req.query;
    const validated = validateCoords(coordinates as string);
    
    if (!validated) {
      return res.status(400).json({ error: "Invalid coordinates provided" });
    }

    try {
      const weather = await WeatherService.getWeatherData(validated.lat.toString(), validated.lon.toString());
      
      // Also attempt to get the latest Satellite Surface Temp from NASA for the comparison
      let satelliteTemp = "N/A";
      let nasaDate = "N/A";
      try {
          const nasaHistory = await NasaService.fetchNasaData(validated.lat.toString(), validated.lon.toString(), 7);
          if (nasaHistory.length > 0) {
              satelliteTemp = `${nasaHistory[0].surfaceTemp.toFixed(1)}°C`;
              nasaDate = nasaHistory[0].date;
          }
      } catch (e) {
          console.error("NASA Fetch in weather failed:", e);
      }

      res.json({
        ...weather,
        surfaceTemperature: satelliteTemp !== "N/A" ? satelliteTemp : weather.surfaceTemperature,
        observationDate: nasaDate !== "N/A" ? nasaDate : weather.observationDate
      });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // 3. Sensor Data Ingress (ESP32)
  app.post("/api/sensor-data", async (req, res) => {
    const { deviceId, temperature, humidity, soilMoisture, heatIndex } = req.body;
    if (!deviceId) return res.status(400).json({ error: "deviceId is required" });

    try {
      await SensorService.updateSensorData(deviceId, { temperature, humidity, soilMoisture, heatIndex });
      res.json({ success: true, message: "Sensor data synchronized to Firestore" });
    } catch (e: any) {
      console.error("Sensor Sync Error:", e);
      res.status(500).json({ error: "Failed to sync sensor data" });
    }
  });

  // 4. Chat Bot
  app.post("/api/chat", async (req, res) => {
    const { message, history, context } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
      const response = await GeminiService.getChatResponse(message, history || [], JSON.stringify(context) || "");
      res.json({ response });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Chat service unavailable" });
    }
  });

  // Vite/Production Middleware
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
