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
import { db, auth, provider } from "./lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "firebase/auth";
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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState("");
  
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
  const [isGuest, setIsGuest] = useState(false);
  const [apiError, setApiError] = useState<APIError | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) setIsGuest(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user && !isGuest || !activeDeviceId.trim()) return;
    
    const unsub = onSnapshot(doc(db, "sensors", activeDeviceId.trim()), (doc) => {
      if (doc.exists()) {
        setSensorData(doc.data() as SensorData);
      } else {
        setSensorData(null);
      }
    }, (error) => {
        console.error("Firestore error:", error);
    });
    return () => unsub();
  }, [user, isGuest, activeDeviceId]);

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      let msg = "Google login failed.";
      if (error.code === 'auth/popup-closed-by-user') msg = "Login popup was closed before completion.";
      if (error.code === 'auth/popup-blocked') msg = "Popup was blocked by your browser.";
      setAuthError(msg);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
    } catch (error: any) {
        let msg = "Authentication failed.";
        if (error.code === 'auth/invalid-email') msg = "Invalid email format.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') msg = "Invalid email or password.";
        if (error.code === 'auth/email-already-in-use') msg = "This email is already registered.";
        setAuthError(msg);
    } finally {
        setAuthLoading(false);
    }
  };

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

  if (!user && !isGuest) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 transition-colors duration-300">
              <div className="flex flex-col items-center gap-2">
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-full uppercase tracking-widest border border-amber-200 dark:border-amber-800">
                    Scientific Research Prototype
                </span>
                <h1 className="text-4xl font-extrabold text-harvest-green tracking-tight">Harvest Orbit</h1>
              </div>

              <div className="theme-card p-8 rounded-3xl w-full max-w-sm space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-harvest-green" />
                  
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">Agronomist Access</h2>
                    <p className="text-xs theme-text-secondary leading-relaxed">
                        Securely monitor global telemetry and local field sensors.
                    </p>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div className="relative">
                          <Mail className="absolute left-3 top-3 w-5 h-5 theme-text-secondary" />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Researcher Email" className="w-full p-3 pl-10 theme-input rounded-xl outline-none focus:ring-2 focus:ring-harvest-green/50" required />
                      </div>
                      <div className="relative">
                          <Lock className="absolute left-3 top-3 w-5 h-5 theme-text-secondary" />
                          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Access Key" className="w-full p-3 pl-10 theme-input rounded-xl outline-none focus:ring-2 focus:ring-harvest-green/50" required />
                      </div>
                      <button type="submit" disabled={authLoading} className="w-full bg-harvest-green text-white py-3 rounded-xl font-bold hover:bg-harvest-green-dark transition-colors disabled:opacity-50 shadow-lg shadow-harvest-green/20">
                          {isLoginMode ? "Secure Login" : "Create Account"}
                      </button>
                  </form>

                  {authError && <p className="text-red-500 text-sm font-medium text-center">{authError}</p>}
                  
                  <div className="text-center">
                    <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-[11px] theme-text-secondary hover:text-harvest-green underline">
                        {isLoginMode ? "Need researcher credentials? Sign up" : "Already registered? Login here"}
                    </button>
                  </div>

                  <div className="border-t border-[var(--border)] pt-6 space-y-3">
                      <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 theme-card text-slate-900 dark:text-slate-100 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm border-[var(--border)]">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" /> 
                          <span className="theme-text-primary">Continue with Google</span>
                      </button>
                      
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-[var(--card-bg)] px-2 theme-text-secondary tracking-widest">Or Recommended</span></div>
                      </div>

                      <button onClick={() => setIsGuest(true)} className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-xl">
                          Enter as Guest Analyst
                      </button>
                  </div>

                  <div className="pt-4 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] theme-text-secondary leading-tight">
                        <strong>Security Note:</strong> All authentication is handled securely by Google Firebase. We do not store or see your passwords.
                    </p>
                  </div>
              </div>

              <p className="text-[10px] theme-text-secondary text-center max-w-xs opacity-60">
                This scientific tool is part of the Harvest Orbit Research Initiative. Data provided is for informational purposes for agricultural professionals.
              </p>
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
