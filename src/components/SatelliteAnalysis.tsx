
import { useTheme } from "./ThemeContext";
import { Satellite, Thermometer, Leaf, Droplets, AlertTriangle } from "lucide-react";
import { SensorData } from "../types";

interface AnalysisResult {
  plot_name: string;
  crop_type: string;
  ndvi_score: number;
  health_status: string;
  alert_triggered: boolean;
  diagnosis: string;
  action_items: string[];
  farmer_summary: string;
  real_metrics?: {
    airTemp: number;
    surfaceTemp: number;
    humidity: number;
    precip: number;
    ndvi: number;
    observationDate: string;
  };
}

export const SatelliteAnalysis = ({ result, sensorData }: { result: AnalysisResult | null, sensorData: (SensorData & { isOffline: boolean }) | null }) => {
    const { theme } = useTheme();

    // Use analysis data if available, then sensor data, then default
    const airTemp = result?.real_metrics ? result.real_metrics.airTemp.toFixed(1) : (sensorData?.temperature?.toFixed(1) ?? "--");
    const surfaceTemp = result?.real_metrics ? result.real_metrics.surfaceTemp.toFixed(1) : "--";
    const vegetation = result?.real_metrics ? (result.real_metrics.ndvi * 100).toFixed(0) : (result ? (result.ndvi_score * 100).toFixed(0) : "--");
    const moisture = result?.real_metrics ? result.real_metrics.humidity.toFixed(1) : (sensorData?.humidity?.toFixed(1) ?? "--");
    const anomalies = result ? "None Detected" : (sensorData?.isOffline ? "Sensor Offline" : "None Detected");

    const formattedDate = result?.real_metrics?.observationDate ? 
        new Date(result.real_metrics.observationDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : result?.real_metrics?.observationDate;

    return (
        <div className={`border p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white shadow'}`}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Satellite className="text-blue-500" /> {result ? `Analysis for ${result.plot_name}` : "Current Satellite/Sensor Analysis"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                   <div className="flex items-center gap-2 text-slate-500 mb-1 font-medium text-xs uppercase tracking-tight"><Thermometer className="w-3 h-3" /> Air Temp</div>
                   <div className="text-lg font-bold">{airTemp} {airTemp !== "--" && "°C"}</div>
                   <div className="text-[10px] text-slate-400">Atmospheric (2m)</div>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
                   <div className="flex items-center gap-2 text-blue-500 mb-1 font-medium text-xs uppercase tracking-tight"><Satellite className="w-3 h-3" /> Surface Temp</div>
                   <div className="text-lg font-bold text-blue-600">{surfaceTemp} {surfaceTemp !== "--" && "°C"}</div>
                   <div className="text-[10px] text-blue-400">NASA Satellite (Skin)</div>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                   <div className="flex items-center gap-2 text-slate-500 mb-1 font-medium text-xs uppercase tracking-tight"><Leaf className="w-3 h-3" /> Vegetation</div>
                   <div className="text-lg font-bold">{vegetation} {vegetation !== "--" && "%"}</div>
                   <div className="text-[10px] text-slate-400">Estimated NDVI</div>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                   <div className="flex items-center gap-2 text-slate-500 mb-1 font-medium text-xs uppercase tracking-tight"><Droplets className="w-3 h-3" /> Humidity</div>
                   <div className="text-lg font-bold">{moisture}%</div>
                   <div className="text-[10px] text-slate-400">Relative Humidity</div>
                </div>
            </div>
            {formattedDate && (
                <p className="mt-4 text-[10px] text-slate-500 text-right">
                    Satellite Observation: {formattedDate}
                </p>
            )}
            {!result && !sensorData && <p className="mt-4 text-sm text-slate-500">Run an analysis or wait for sensor data to see live readings.</p>}
        </div>
    );
};
