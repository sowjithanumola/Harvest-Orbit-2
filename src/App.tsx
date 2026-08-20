/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Map, Mail, Lock, User as UserIcon, Loader2, ShieldCheck } from "lucide-react";
import { SensorData, AnalysisResult, APIError } from "./types";
import { SatelliteSection } from "./components/SatelliteSection";
import { GroundSensorSection } from "./components/GroundSensorSection";
import { FieldSummarySection } from "./components/FieldSummarySection";
import { MapComponent } from "./components/MapComponent";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import { ProfileModal } from "./components/ProfileModal";
import { SatelliteLocationView } from "./components/SatelliteLocationView";
import { PlanetaryVitalSigns } from "./components/PlanetaryVitalSigns";
import { ApiClient } from "./lib/apiClient";

export default function App() {
  return (
    <ThemeProvider>
        <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  
  const [activeDeviceId, setActiveDeviceId] = useState("FieldNode-01");
  const [formData, setFormData] = useState({
    fieldName: "",
    cropType: "",
    coordinates: "",
    ndviScore: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [apiError, setApiError] = useState<APIError | null>(null);

  // Mock sensor data fetching since Firebase is revoked
  useEffect(() => {
    if (!activeDeviceId.trim()) return;
    
    // Simulate real-time data
    const interval = setInterval(() => {
      setSensorData({
        deviceId: activeDeviceId,
        timestamp: new Date().toISOString(),
        soilMoisture: 35 + Math.random() * 5,
        temperature: 22 + Math.random() * 3,
        humidity: 60 + Math.random() * 10,
        nitrogen: 180 + Math.random() * 20,
        phosphorus: 45 + Math.random() * 5,
        potassium: 210 + Math.random() * 15,
        isOnline: true
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeDeviceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseLocation = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            coordinates: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          }));
          setLocLoading(false);
        },
        (error) => {
          setLocLoading(false);
          console.error("Geolocation error:", error);
        },
        { timeout: 10000 }
      );
    } else {
      setLocLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setApiError(null);

    try {
      const data = await ApiClient.post<AnalysisResult>("/api/analyze", {
          ...formData,
          deviceId: activeDeviceId
      });
      setResult(data);
    } catch (error: any) {
      console.error("Analysis Error:", error);
      setApiError(error as APIError);
    } finally {
      setLoading(false);
    }
  };

  const parseCoordinates = (coords: string): [number, number] | null => {
      if (typeof coords !== 'string' || !coords.includes(',')) return null;
      const parts = coords.split(',').map(c => parseFloat(c.trim()));
      const [lat, lng] = parts;
      return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null;
  };
  const coords = parseCoordinates(formData.coordinates);

  if (authLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-harvest-green" />
          </div>
      );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300">
      <header className="mb-12 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-harvest-green tracking-tight">Harvest Orbit</h1>
        <div className="flex gap-4">
            <button 
                onClick={() => setShowProfile(true)} 
                className="p-3 rounded-full theme-card hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
                <UserIcon size={20} />
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <div className="theme-card p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-4">📍 Field Location</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleUseLocation} disabled={locLoading} className="bg-harvest-green px-6 py-3 rounded-xl text-sm font-bold text-white hover:bg-harvest-green-dark transition-all shadow-lg shadow-harvest-green/20 disabled:opacity-50">
                        {locLoading ? "Detecting..." : "Detect My Position"}
                    </button>
                    <input 
                        className="theme-input px-4 py-2 rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-harvest-green" 
                        placeholder="Device ID (e.g. FieldNode-01)"
                        value={activeDeviceId}
                        onChange={(e) => setActiveDeviceId(e.target.value)}
                    />
                </div>
                <div className="mt-4 p-4 theme-input rounded-xl text-sm font-mono flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${sensorData ? 'bg-harvest-green animate-pulse' : 'bg-red-500'}`} />
                    <span className="theme-text-secondary">{formData.coordinates || "Pending location selection..."}</span>
                </div>
            </div>
            
            <SatelliteLocationView />
            <GroundSensorSection data={sensorData} />
        </div>

        <div className="space-y-8">
            <div className="theme-card p-6 rounded-2xl h-96 shadow-sm overflow-hidden relative">
                {coords ? (
                    <MapComponent lat={coords[0]} lng={coords[1]} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center theme-text-secondary gap-3 bg-slate-50 dark:bg-slate-900/50">
                        <Map size={48} className="opacity-20" />
                        <p className="font-medium">Select coordinates to view map</p>
                    </div>
                )}
            </div>
            
            <div className="theme-card p-8 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold mb-6">Field Intelligence Input</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest theme-text-secondary">Field Name</label>
                        <input name="fieldName" value={formData.fieldName} onChange={handleInputChange} placeholder="e.g. North Valley Corn" className="w-full p-4 theme-input rounded-xl outline-none focus:ring-2 focus:ring-harvest-green/50 transition-all" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest theme-text-secondary">Crop Type</label>
                        <input name="cropType" value={formData.cropType} onChange={handleInputChange} placeholder="e.g. Maize, Wheat, Soy" className="w-full p-4 theme-input rounded-xl outline-none focus:ring-2 focus:ring-harvest-green/50 transition-all" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest theme-text-secondary">Coordinates (lat, lng)</label>
                        <input name="coordinates" value={formData.coordinates} onChange={handleInputChange} placeholder="45.5231, -122.6765" className="w-full p-4 theme-input rounded-xl outline-none focus:ring-2 focus:ring-harvest-green/50 transition-all font-mono" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest theme-text-secondary">NDVI Score (Optional)</label>
                        <input name="ndviScore" type="number" step="0.01" value={formData.ndviScore} onChange={handleInputChange} placeholder="0.0 - 1.0" className="w-full p-4 theme-input rounded-xl outline-none focus:ring-2 focus:ring-harvest-green/50 transition-all" />
                    </div>
                    {apiError && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{apiError.message}</p>
                        </div>
                    )}
                    <button type="submit" className="w-full bg-harvest-green p-4 rounded-xl font-bold text-white hover:bg-harvest-green-dark transition-all shadow-lg shadow-harvest-green/20" disabled={loading}>
                    {loading ? "Processing AI Analysis..." : "Analyze Field Health"}
                    </button>
                </form>
            </div>
        </div>
      </div>

      <FieldSummarySection result={result} sensorData={sensorData} />
      <PlanetaryVitalSigns />
      {showProfile && <ProfileModal user={user} isGuest={isGuest} onClose={() => setShowProfile(false)} onExitGuest={() => setIsGuest(false)} />}
    </div>
  );
}
