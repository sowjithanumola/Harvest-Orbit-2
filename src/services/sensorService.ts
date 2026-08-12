import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { SensorData } from "../types";

export class SensorService {
    static async updateSensorData(deviceId: string, data: Partial<SensorData>): Promise<void> {
        const docRef = doc(db, "sensors", deviceId);
        const sensorData: SensorData = {
            deviceId,
            temperature: data.temperature || 0,
            humidity: data.humidity || 0,
            heatIndex: data.heatIndex || 0,
            soilMoisture: data.soilMoisture || 0,
            timestamp: Timestamp.now(),
            isOnline: true
        };
        await setDoc(docRef, sensorData, { merge: true });
    }

    static async getSensorData(deviceId: string): Promise<SensorData | null> {
        const docRef = doc(db, "sensors", deviceId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as SensorData;
        }
        return null;
    }
}
