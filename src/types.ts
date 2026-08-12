export interface SensorData {
  deviceId: string;
  temperature: number;
  humidity: number;
  heatIndex: number;
  soilMoisture?: number;
  timestamp: any; // Firestore timestamp
  isOnline: boolean;
}

export interface APIError {
  code: string;
  message: string;
  status?: number;
}

export interface FieldNode {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'connecting';
  data: SensorData | null;
  lastUpdated: Date | null;
}

export interface HistoricalData {
  date: string;
  airTemp: number;
  surfaceTemp: number;
  precip: number;
  humidity: number;
  solarRadiation?: number;
}

export interface AnalysisResult {
  plot_name: string;
  executive_summary: string;
  assessment: {
    crop_health: string;
    temp_risk: string;
    water_stress: string;
    vegetation_condition: string;
    environmental_risk: string;
    justification: string;
  };
  alerts: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }[];
  action_items: string[];
  real_metrics?: {
    airTemp: number;
    surfaceTemp: number;
    humidity: number;
    precip: number;
    ndvi: number;
    observationDate: string;
    historical?: HistoricalData[];
  };
}
