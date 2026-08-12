
import { useState, useEffect } from "react";
import { MapPin, Loader2, Info } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { ApiClient } from "../lib/apiClient";
import { APIError } from "../types";

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
    const [error, setError] = useState<APIError | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        let mounted = true;
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                if (!mounted) return;
                const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCoords(newCoords);
                
                try {
                    const data = await ApiClient.get<{
                        airTemperature: string, 
                        surfaceTemperature: string, 
                        humidity: string, 
                        precipitation: string,
                        observationDate: string,
                        windSpeed?: string
                    }>(`/api/weather?coordinates=${newCoords.lat},${newCoords.lng}`);
                    if (mounted) setWeather(data);
                } catch (err: any) {
                    if (mounted) setError(err as APIError);
                } finally {
                    if (mounted) setLoading(false);
                }
            },
            (err) => {
                if (mounted) {
                    setError({ code: "GEOLOCATION_ERROR", message: "Location access denied or unavailable." });
                    setLoading(false);
                }
            },
            { timeout: 10000 }
        );
        return () => { mounted = false; };
    }, []);

    if (loading) return (
        <div className="theme-card p-12 flex flex-col items-center justify-center gap-4 rounded-3xl shadow-sm border border-[var(--border)]">
            <Loader2 className="w-8 h-8 animate-spin text-harvest-green" />
            <p className="text-sm font-medium theme-text-secondary animate-pulse text-center">🛰️ Syncing NASA Satellite & Live Weather APIs...</p>
        </div>
    );

    if (error) return (
        <div className="theme-card p-8 flex flex-col items-center justify-center gap-3 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10">
            <Info className="text-red-500 w-8 h-8" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">{error.message}</p>
            <button onClick={() => window.location.reload()} className="text-xs font-bold uppercase tracking-widest text-red-500 hover:underline">Retry Connection</button>
        </div>
    );

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
