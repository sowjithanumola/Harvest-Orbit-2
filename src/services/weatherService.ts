export interface WeatherResult {
    airTemperature: string;
    surfaceTemperature: string;
    humidity: string;
    precipitation: string;
    observationDate: string;
    windSpeed: string;
    source: "OpenWeatherMap" | "Open-Meteo" | "NASA" | "Sensor" | "Unavailable";
}

export class WeatherService {
    static async getWeatherData(lat: string, lon: string): Promise<WeatherResult> {
        // Try OpenWeatherMap first
        const owmKey = process.env.OPENWEATHERMAP_API_KEY;
        if (owmKey) {
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${owmKey}&units=metric`;
                const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
                if (res.ok) {
                    const data: any = await res.json();
                    return {
                        airTemperature: `${data.main.temp.toFixed(1)}°C`,
                        surfaceTemperature: "N/A", // OWM doesn't provide skin temp
                        humidity: `${data.main.humidity}%`,
                        precipitation: `${(data.rain?.["1h"] || 0).toFixed(2)} mm`,
                        windSpeed: `${(data.wind?.speed * 3.6).toFixed(1)} km/h`,
                        observationDate: new Date().toISOString(),
                        source: "OpenWeatherMap"
                    };
                }
            } catch (e) {
                console.error("OpenWeatherMap failed:", e);
            }
        }

        // Fallback to Open-Meteo
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,precipitation&timezone=auto`;
            const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
            if (res.ok) {
                const data: any = await res.json();
                const now = new Date();
                const currentHourStr = now.toISOString().split(':')[0] + ':00';
                const hourIdx = data.hourly?.time?.findIndex((t: string) => t.startsWith(currentHourStr)) || 0;

                return {
                    airTemperature: `${data.current_weather.temperature.toFixed(1)}°C`,
                    surfaceTemperature: "N/A",
                    humidity: `${data.hourly.relative_humidity_2m[hourIdx]}%`,
                    precipitation: `${data.hourly.precipitation[hourIdx].toFixed(2)} mm`,
                    windSpeed: `${data.current_weather.windspeed.toFixed(1)} km/h`,
                    observationDate: new Date().toISOString(),
                    source: "Open-Meteo"
                };
            }
        } catch (e) {
            console.error("Open-Meteo failed:", e);
        }

        return {
            airTemperature: "N/A",
            surfaceTemperature: "N/A",
            humidity: "N/A",
            precipitation: "N/A",
            windSpeed: "N/A",
            observationDate: "N/A",
            source: "Unavailable"
        };
    }
}
