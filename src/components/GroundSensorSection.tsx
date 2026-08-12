import { Thermometer, Droplets, Wifi, Copy } from 'lucide-react';
import { SensorData } from '../types';

interface Props {
  data: (SensorData & { isOffline: boolean }) | null;
}

export function GroundSensorSection({ data }: Props) {
  const isOnline = data && !data.isOffline;
  
  return (
    <div className="theme-card p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-harvest-green">🌱 GROUND SENSOR</h2>
          {isOnline && <button onClick={() => navigator.clipboard.writeText(JSON.stringify(data))} className="theme-text-secondary hover:text-harvest-green transition-colors"><Copy size={16} /></button>}
      </div>
      <div className="flex items-center justify-between mb-8">
          <span className="font-bold">FieldNode-01</span>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
      </div>
      
      {isOnline && data ? (
        <div className="grid grid-cols-3 gap-4 text-center">
            <div className="theme-input p-3 rounded-xl">
                <Thermometer size={18} className="text-orange-500 mx-auto mb-2" />
                <span className="block text-[10px] theme-text-secondary font-bold uppercase mb-1">Temperature</span>
                <span className="text-sm font-bold">{data.temperature.toFixed(1)}°C</span>
            </div>
            <div className="theme-input p-3 rounded-xl">
                <Droplets size={18} className="text-accent-blue mx-auto mb-2" />
                <span className="block text-[10px] theme-text-secondary font-bold uppercase mb-1">Humidity</span>
                <span className="text-sm font-bold">{data.humidity.toFixed(1)}%</span>
            </div>
            <div className="theme-input p-3 rounded-xl">
                <Wifi size={18} className="text-harvest-green mx-auto mb-2" />
                <span className="block text-[10px] theme-text-secondary font-bold uppercase mb-1">Signal</span>
                <span className="text-sm font-bold text-harvest-green">Stable</span>
            </div>
        </div>
      ) : (
        <div className="theme-input p-10 rounded-xl text-center flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Wifi className="theme-text-secondary opacity-50" size={24} />
            </div>
            <p className="theme-text-secondary text-sm font-medium">Waiting for sensor data mesh connection...</p>
        </div>
      )}
    </div>
  );
}
