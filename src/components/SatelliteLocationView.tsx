
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useTheme } from "./ThemeContext";

export const SatelliteLocationView = () => {
    const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
    const [weather, setWeather] = useState<{
        airTemperature: string, 
        surfaceTemperature: string, 
        humidity: string, 
        precipitation: string,
        observationDate: string,
        windSpeed?: string
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCoords(newCoords);
                fetch(`/api/weather?coordinates=${newCoords.lat},${newCoords.lng}`)
                    .then(res => res.json())
                    .then(data => setWeather(data))
                    .catch(err => console.error(err))
                    .finally(() => setLoading(false));
            },
            () => setLoading(false)
        );
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">🛰️ Syncing NASA Satellite & Live Weather APIs...</div>;
    if (!coords) return <div className="p-8 text-center text-rose-400">Location access required for intelligence synchronization.</div>;

    const formattedDate = weather?.observationDate && weather.observationDate !== "N/A" ? 
        new Date(weather.observationDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : "Latest Pass";

    return (
        <div className="theme-card p-6 rounded-3xl shadow-sm border border-[var(--border)]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
                    <MapPin className="text-harvest-green w-4 h-4" /> 
                    <span className="theme-text-primary">Intelligence Comparison</span>
                </h2>
                <div className="text-[10px] theme-text-secondary font-mono theme-input px-3 py-1 rounded-full border border-[var(--border)]">
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                    {/* NASA Satellite Data Card */}
                    <div className="p-5 rounded-2xl border border-accent-blue/10 bg-accent-blue/5 dark:bg-accent-blue/5 transition-all hover:border-accent-blue/30">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-black uppercase text-accent-blue tracking-tighter">NASA Satellite</span>
                            <span className="text-[9px] theme-text-secondary font-bold uppercase">{formattedDate}</span>
                        </div>
                        <p className="text-[10px] font-bold theme-text-secondary mb-1 uppercase tracking-wider">Surface Temp (LST)</p>
                        <p className="text-2xl font-black text-accent-blue tracking-tighter">
                            {weather?.surfaceTemperature === "N/A" ? "N/A" : weather?.surfaceTemperature}
                        </p>
                    </div>

                    {/* Local Weather Data Card */}
                    <div className="p-5 rounded-2xl border border-harvest-green/10 bg-harvest-green/5 dark:bg-harvest-green/5 transition-all hover:border-harvest-green/30">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-black uppercase text-harvest-green tracking-tighter">Live Weather</span>
                            <span className="text-[9px] text-harvest-green font-bold uppercase">Real-time</span>
                        </div>
                        <p className="text-[10px] font-bold theme-text-secondary mb-1 uppercase tracking-wider">Air Temperature</p>
                        <p className="text-2xl font-black text-harvest-green tracking-tighter">
                            {weather?.airTemperature || "N/A"}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 theme-input rounded-xl text-center">
                        <p className="text-[9px] font-bold theme-text-secondary uppercase mb-1">Humidity</p>
                        <p className="text-sm font-black theme-text-primary">{weather?.humidity || "N/A"}</p>
                    </div>
                    <div className="p-3 theme-input rounded-xl text-center">
                        <p className="text-[9px] font-bold theme-text-secondary uppercase mb-1">Wind</p>
                        <p className="text-sm font-black theme-text-primary">{weather?.windSpeed || "N/A"}</p>
                    </div>
                    <div className="p-3 theme-input rounded-xl text-center">
                        <p className="text-[9px] font-bold theme-text-secondary uppercase mb-1">Precip</p>
                        <p className="text-sm font-black theme-text-primary">{weather?.precipitation || "N/A"}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)]/40">
                    <p className="text-[11px] theme-text-secondary leading-relaxed font-medium">
                        <span className="font-bold text-harvest-green uppercase mr-2 italic">Diagnosis:</span> 
                        Comparing NASA's skin temperature (Land Surface) with Open-Meteo's atmospheric observations to identify canopy-to-air divergence.
                    </p>
                </div>
            </div>
        </div>
    );
};
