import { SensorData } from "../types";

export class SensorService {
    static async updateSensorData(deviceId: string, data: Partial<SensorData>): Promise<void> {
        console.log("Mock: Updating sensor data for", deviceId, data);
        return Promise.resolve();
    }

    static async getSensorData(deviceId: string): Promise<SensorData | null> {
        return {
            deviceId,
            timestamp: new Date().toISOString(),
            soilMoisture: 38.5,
            temperature: 24.2,
            humidity: 65,
            nitrogen: 185,
            phosphorus: 48,
            potassium: 215,
            isOnline: true
        };
    }
}
