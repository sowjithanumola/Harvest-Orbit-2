
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
        observationDate: string
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

    if (loading) return <div className="p-8 text-center text-slate-500">🛰️ Connecting to NASA GIBS & POWER APIs...</div>;
    if (!coords) return <div className="p-8 text-center text-red-400">Location access needed for satellite view.</div>;

    const formattedDate = weather?.observationDate ? 
        new Date(weather.observationDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : "N/A";

    return (
        <div className="theme-card p-5 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2">
                    <MapPin className="text-harvest-green w-4 h-4" /> 
                    <span className="theme-text-primary">Intelligence Comparison</span>
                </h2>
                <div className="text-[10px] theme-text-secondary font-mono theme-input px-2 py-1 rounded-md">
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* NASA Satellite Data Card */}
                    <div className="p-4 rounded-xl border border-accent-blue/10 bg-accent-blue/5 dark:bg-accent-blue/5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase text-accent-blue tracking-wider">NASA Satellite</span>
                            <span className="text-[10px] theme-text-secondary">{formattedDate.split(',')[0]}</span>
                        </div>
                        <p className="text-xs theme-text-secondary mb-1">Land Surface Temp</p>
                        <p className="text-2xl font-black text-accent-blue">
                            {weather?.surfaceTemperature === "N/A" ? "N/A" : weather?.surfaceTemperature}
                        </p>
                    </div>

                    {/* Local Weather Data Card */}
                    <div className="p-4 rounded-xl border border-harvest-green/10 bg-harvest-green/5 dark:bg-harvest-green/5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase text-harvest-green tracking-wider">Local Weather</span>
                            <span className="text-[10px] theme-text-secondary">Real-time</span>
                        </div>
                        <p className="text-xs theme-text-secondary mb-1">Air Temperature</p>
                        <p className="text-2xl font-black text-harvest-green">
                            {weather?.airTemperature || "N/A"}
                        </p>
                    </div>
                </div>

                <div className="p-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/50">
                    <p className="text-[11px] theme-text-secondary leading-relaxed">
                        <span className="font-bold text-harvest-green uppercase mr-1">Comparison:</span> 
                        Satellite skin temperature (LST) and atmospheric air temperature naturally vary due to surface emissivity and absorption.
                    </p>
                </div>
            </div>
        </div>
    );
};
