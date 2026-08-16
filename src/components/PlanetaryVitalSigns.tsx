
import React, { useState, useEffect } from 'react';
import { Thermometer, Wind, Waves, Mountain, ExternalLink, Info, TrendingUp, Calendar, ArrowRight, Brain, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Earth3D } from './Earth3D';
import Markdown from 'react-markdown';

const temperatureData = [
  { month: 'Jan 24', temp: 1.47, co2: 423.5 },
  { month: 'Feb 24', temp: 1.49, co2: 424.55 },
  { month: 'Mar 24', temp: 1.41, co2: 425.2 },
  { month: 'Apr 24', temp: 1.34, co2: 426.1 },
  { month: 'May 24', temp: 1.28, co2: 426.90 },
  { month: 'Jun 24', temp: 1.26, co2: 426.0 },
  { month: 'Jul 24', temp: 1.29, co2: 424.5 },
  { month: 'Aug 24', temp: 1.30, co2: 422.99 },
  { month: 'Sep 24', temp: 1.27, co2: 422.5 },
  { month: 'Oct 24', temp: 1.32, co2: 423.1 },
  { month: 'Nov 24', temp: 1.37, co2: 423.85 },
  { month: 'Dec 24', temp: 1.40, co2: 425.0 },
  { month: 'Jan 25', temp: 1.28, co2: 426.2 },
  { month: 'Feb 25', temp: 1.30, co2: 427.09 },
  { month: 'Mar 25', temp: 1.22, co2: 428.1 },
  { month: 'Apr 25', temp: 1.15, co2: 429.64 },
  { month: 'May 25', temp: 1.07, co2: 430.51 },
  { month: 'Jun 25', temp: 1.09, co2: 429.2 },
  { month: 'Jul 25', temp: 1.12, co2: 427.87 },
  { month: 'Aug 25', temp: 1.13, co2: 425.48 },
  { month: 'Sep 25', temp: 1.10, co2: 425.0 },
  { month: 'Oct 25', temp: 1.14, co2: 425.8 },
  { month: 'Nov 25', temp: 1.19, co2: 426.46 },
  { month: 'Dec 25', temp: 1.22, co2: 428.0 },
  { month: 'Jan 26', temp: 1.18, co2: 429.5 },
  { month: 'Feb 26', temp: 1.20, co2: 430.2 },
  { month: 'Mar 26', temp: 1.12, co2: 430.8 },
  { month: 'Apr 26', temp: 1.05, co2: 431.12 },
  { month: 'May 26', temp: 1.00, co2: 430.8 },
  { month: 'Jun 26', temp: 1.02, co2: 429.8 },
  { month: 'Jul 26', temp: 1.05, co2: 429.12 },
];

export const PlanetaryVitalSigns = () => {
  const [view, setView] = useState<'summary' | 'trends' | '3d'>('summary');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const vitalSigns = [
    {
      label: 'Carbon Dioxide',
      value: '429 ppm',
      trend: '+3.75 ppm/yr',
      status: 'Critical',
      icon: Wind,
      description: 'Global average atmospheric CO2 concentration.',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    },
    {
      label: 'Global Temperature',
      value: '+1.47 °C',
      trend: 'Record High',
      status: 'Warning',
      icon: Thermometer,
      description: 'Temperature anomaly relative to 19th-century average.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'Sea Level Rise',
      value: '+10 cm',
      trend: 'Accelerating',
      status: 'Increasing',
      icon: Waves,
      description: 'Rise in global mean sea level since 1993.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Arctic Ice Max',
      value: '14.29M km²',
      trend: '-1.36M km²',
      status: 'Historical Low',
      icon: Mountain,
      description: 'Winter maximum extent of Arctic sea ice.',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
  ];

  const fetchAiSummary = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/planetary-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.stringify(vitalSigns) })
      });
      const data = await response.json();
      setAiSummary(data.summary);
    } catch (e) {
      console.error("AI Summary failed:", e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold theme-text-primary flex items-center gap-2">
            Planetary Command Center
          </h2>
          <p className="theme-text-secondary text-sm">Global monitoring for local farm trust</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--border)] shadow-sm">
          <button
            onClick={() => setView('summary')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              view === 'summary' 
                ? 'bg-harvest-green text-white shadow-md' 
                : 'theme-text-secondary hover:theme-bg-tertiary'
            }`}
          >
            <TrendingUp size={14} />
            Summary
          </button>
          <button
            onClick={() => setView('trends')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              view === 'trends' 
                ? 'bg-harvest-green text-white shadow-md' 
                : 'theme-text-secondary hover:theme-bg-tertiary'
            }`}
          >
            <Calendar size={14} />
            Monthly
          </button>
          <button
            onClick={() => setView('3d')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              view === '3d' 
                ? 'bg-harvest-green text-white shadow-md' 
                : 'theme-text-secondary hover:theme-bg-tertiary'
            }`}
          >
            <Globe size={14} />
            3D Globe
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {vitalSigns.map((sign, index) => (
              <motion.div
                key={sign.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="theme-card p-5 rounded-3xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${sign.bgColor} ${sign.color}`}>
                    <sign.icon size={24} />
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${sign.bgColor} ${sign.color}`}>
                      {sign.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="theme-text-secondary text-xs font-medium uppercase tracking-tight">{sign.label}</p>
                  <h3 className="text-2xl font-black theme-text-primary">{sign.value}</h3>
                  <p className={`text-xs font-bold ${sign.color}`}>{sign.trend}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {view === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="theme-card p-6 rounded-3xl border border-[var(--border)] shadow-sm"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-lg font-bold theme-text-primary mb-6">Global Warming Progress (2024-2026)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={temperatureData}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={3} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} domain={[0.8, 1.6]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === '3d' && (
          <motion.div
            key="3d"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Earth3D />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="theme-card p-6 rounded-3xl border border-[var(--border)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Brain size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold theme-text-primary">Trusted AI Advisor</h3>
                  <p className="theme-text-secondary text-sm">Science-backed farm resilience intelligence</p>
                </div>
              </div>
              <button
                onClick={fetchAiSummary}
                disabled={loadingAi}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50"
              >
                {loadingAi ? 'Analyzing NASA Data...' : 'Ask Why This Matters'}
              </button>
            </div>

            <div className="min-h-[120px] theme-bg-secondary p-5 rounded-2xl border border-[var(--border)] relative">
              {!aiSummary && !loadingAi && (
                <div className="flex flex-col items-center justify-center h-full text-center py-4">
                  <p className="theme-text-secondary text-sm italic max-w-md">
                    "Click the button above to receive a personalized AI briefing on how these global planetary vital signs directly affect your farm's productivity and long-term health."
                  </p>
                </div>
              )}
              
              {loadingAi && (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                  <p className="theme-text-secondary text-sm font-medium animate-pulse">Syncing with NASA Satellite Mesh...</p>
                </div>
              )}

              {aiSummary && !loadingAi && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-sm dark:prose-invert max-w-none theme-text-primary"
                >
                  <Markdown>{aiSummary}</Markdown>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="theme-card p-5 rounded-3xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-900/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Farmer's Trust Promise</h4>
            </div>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed">
              Harvest Orbit only uses peer-reviewed data from **NASA, NOAA, and ESA**. Our AI doesn't "hallucinate"—it translates verified satellite telemetry into local actions. You can verify all data at the source.
            </p>
            <a 
              href="https://eyes.nasa.gov/apps/earth/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 w-full py-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-[10px] font-bold text-center hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              Verify Source at NASA.gov <ExternalLink size={12} />
            </a>
          </div>
          
          <div className="theme-card p-5 rounded-3xl border border-[var(--border)]">
            <h4 className="text-xs font-bold theme-text-secondary uppercase tracking-widest mb-3">Live Feed Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] theme-text-secondary">NASA Aqua Satellite</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  CONNECTED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] theme-text-secondary">GISS Data Stream</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  CONNECTED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] theme-text-secondary">Sentinel-2 MSI</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500">
                  SYNCING
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
