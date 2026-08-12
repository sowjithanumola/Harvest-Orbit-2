import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, CheckCircle2, Info, Thermometer, Droplets, Sun, CloudRain, 
  Download, Share2, Printer, Calendar, MapPin, Sprout, ShieldAlert
} from 'lucide-react';
import { AnalysisResult, SensorData } from '../types';
import { motion } from 'motion/react';
import { useTheme } from './ThemeContext';

export function FieldSummarySection({ result, sensorData }: { result: AnalysisResult | null, sensorData: SensorData | null }) {
  const { theme } = useTheme();

  if (!result) {
    return (
      <div className="theme-card p-12 rounded-3xl mt-8 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-20 h-20 bg-harvest-green/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Sprout className="text-harvest-green" size={40} />
        </div>
        <h2 className="text-2xl font-bold theme-text-primary mb-3">Agricultural Intelligence Report</h2>
        <p className="theme-text-secondary max-w-md">Select a field and run "Analyze Field Health" to generate a professional, data-driven agricultural intelligence report.</p>
      </div>
    );
  }

  const { assessment, alerts, action_items, executive_summary = "", real_metrics } = result;
  const historicalData = real_metrics?.historical || [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'excellent': case 'low': return 'text-emerald-600 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20';
      case 'good': return 'text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/20';
      case 'moderate': return 'text-amber-600 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20';
      case 'high': case 'poor': case 'critical': return 'text-rose-600 bg-rose-100 border-rose-200 dark:text-rose-400 dark:bg-rose-400/10 dark:border-rose-400/20';
      default: return 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-400/10 dark:border-slate-400/20';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="theme-card rounded-3xl mt-8 overflow-hidden shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none transition-colors duration-300"
    >
      {/* Header */}
      <div className="bg-harvest-green/5 p-8 border-b border-[var(--border)] print:bg-emerald-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-harvest-green text-xs font-bold uppercase tracking-[0.2em] mb-2 print:text-emerald-700">
              <ShieldAlert size={14} />
              Agricultural Intelligence Report
            </div>
            <h1 className="text-3xl font-extrabold theme-text-primary tracking-tight print:text-slate-900">
              {result.plot_name} <span className="theme-text-secondary font-normal ml-2">Assessment</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <button className="p-2.5 theme-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Share2 size={18} className="theme-text-secondary" />
            </button>
            <button 
              onClick={handlePrint}
              className="p-2.5 theme-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Printer size={18} className="theme-text-secondary" />
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-harvest-green hover:bg-harvest-green-dark rounded-xl transition-all text-white font-bold shadow-lg shadow-harvest-green/20"
            >
              <Download size={18} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-12 print:p-4">
        {/* Section 1: Executive Summary */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-harvest-green/10 rounded-lg print:bg-emerald-100">
              <TrendingUp className="text-harvest-green print:text-emerald-700" size={20} />
            </div>
            <h2 className="text-xl font-bold theme-text-primary print:text-slate-900">Executive Summary</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 prose dark:prose-invert prose-emerald max-w-none print:prose-slate">
              <div className="theme-text-primary leading-relaxed space-y-4 text-sm md:text-base print:text-slate-700">
                {executive_summary.split('\n').map((para, i) => para && <p key={i}>{para}</p>)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-[var(--border)] print:bg-slate-50 print:border-slate-200">
                <p className="text-xs font-bold theme-text-secondary uppercase tracking-widest mb-4">Core Health Matrix</p>
                <div className="space-y-4">
                  {[
                    { label: 'Crop Health', value: assessment.crop_health, icon: Sprout },
                    { label: 'Temp Risk', value: assessment.temp_risk, icon: Thermometer },
                    { label: 'Water Stress', value: assessment.water_stress, icon: CloudRain },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 theme-text-secondary text-sm print:text-slate-600">
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${getStatusColor(item.value)}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-5 rounded-2xl bg-harvest-green/5 border border-harvest-green/10 print:bg-emerald-50">
                <div className="flex items-center gap-2 text-harvest-green text-xs font-bold uppercase tracking-widest mb-2 print:text-emerald-700">
                  <Info size={14} />
                  Intelligence Freshness
                </div>
                <p className="text-[11px] theme-text-secondary leading-relaxed print:text-slate-600 font-medium">
                  Last Satellite Pass: {real_metrics?.observationDate || 'N/A'}<br/>
                  Sensor Sync: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Intelligence Charts */}
        <section className="print:break-before-page">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-500/10 rounded-lg print:bg-blue-100">
              <TrendingUp className="text-blue-500 print:text-blue-700" size={20} />
            </div>
            <h2 className="text-xl font-bold theme-text-primary print:text-slate-900">Historical Analysis Trends</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl theme-card shadow-sm print:bg-white print:border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold theme-text-secondary uppercase tracking-widest print:text-slate-600">Temperature Delta</h3>
                <div className="flex gap-4 text-[10px] uppercase font-bold tracking-widest print:hidden">
                  <span className="text-blue-500">● Air (2m)</span>
                  <span className="text-rose-500">● Surface (LST)</span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="colorAir" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSurf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                    <XAxis dataKey="date" stroke={theme === 'dark' ? '#475569' : '#94a3b8'} fontSize={10} tickFormatter={(val) => val.slice(-4)} />
                    <YAxis stroke={theme === 'dark' ? '#475569' : '#94a3b8'} fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                          border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`, 
                          borderRadius: '12px',
                          color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                      }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="airTemp" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAir)" name="Air Temp" />
                    <Area type="monotone" dataKey="surfaceTemp" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorSurf)" name="Surface Temp" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-2xl theme-card shadow-sm print:bg-white print:border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold theme-text-secondary uppercase tracking-widest print:text-slate-600">Precipitation & Humidity</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                    <XAxis dataKey="date" stroke={theme === 'dark' ? '#475569' : '#94a3b8'} fontSize={10} tickFormatter={(val) => val.slice(-4)} />
                    <YAxis yAxisId="left" stroke={theme === 'dark' ? '#475569' : '#94a3b8'} fontSize={10} />
                    <YAxis yAxisId="right" orientation="right" stroke={theme === 'dark' ? '#475569' : '#94a3b8'} fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                          border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`, 
                          borderRadius: '12px' 
                      }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Bar yAxisId="left" dataKey="precip" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Rain (mm)" />
                    <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={2} dot={false} name="Humidity (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Assessment & Risk Analysis */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 print:break-before-page">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg print:bg-amber-50">
                <AlertTriangle className="text-amber-500 print:text-amber-700" size={20} />
              </div>
              <h2 className="text-xl font-bold theme-text-primary print:text-slate-900">Environmental Alerts</h2>
            </div>
            <div className="space-y-4">
              {alerts.length > 0 ? alerts.map((alert, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border flex gap-4 items-start print:bg-slate-50 transition-colors ${getStatusColor(alert.severity)}`}>
                  <AlertTriangle className="mt-1 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">{alert.type}</h4>
                    <p className="text-xs opacity-90 leading-relaxed print:text-slate-700">{alert.message}</p>
                  </div>
                </div>
              )) : (
                <div className="p-10 rounded-2xl border border-harvest-green/20 bg-harvest-green/5 text-harvest-green text-center flex flex-col items-center gap-3 print:bg-emerald-50">
                  <CheckCircle2 size={40} className="opacity-50" />
                  <p className="font-bold text-sm">Optimal environmental conditions detected. No active alerts.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-harvest-green/10 rounded-lg print:bg-emerald-100">
                <CheckCircle2 className="text-harvest-green print:text-emerald-700" size={20} />
              </div>
              <h2 className="text-xl font-bold theme-text-primary print:text-slate-900">Actionable Recommendations</h2>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-[var(--border)] rounded-2xl p-8 space-y-5 print:bg-slate-50 print:border-slate-200">
              {action_items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <div className="w-6 h-6 rounded-full bg-harvest-green/10 flex items-center justify-center flex-shrink-0 group-hover:bg-harvest-green group-hover:text-white transition-all text-harvest-green text-[10px] font-black print:bg-emerald-100 print:text-emerald-700">
                    {idx + 1}
                  </div>
                  <p className="text-sm theme-text-primary leading-relaxed pt-0.5 print:text-slate-700 font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer: Data Sources */}
        <footer className="pt-12 border-t border-[var(--border)] text-[10px] theme-text-secondary flex flex-col md:flex-row justify-between gap-6 uppercase font-bold tracking-[0.2em] print:border-slate-200 print:text-slate-400">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <span className="flex items-center gap-2"><MapPin size={12}/> NASA POWER LARC / MODIS</span>
            <span className="flex items-center gap-2"><Droplets size={12}/> Harvest Orbit IoT Mesh</span>
            <span className="flex items-center gap-2 text-harvest-green print:text-emerald-700"><Info size={12}/> Harvest Orbit Intelligence</span>
          </div>
          <div>
            System Reference: HO-RE-2026-{Math.floor(Math.random() * 10000)}
          </div>
        </footer>
      </div>
    </motion.div>
  );
}
