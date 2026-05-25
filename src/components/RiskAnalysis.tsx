import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie
} from "recharts";
import { 
  TrendingUp, 
  ShieldAlert, 
  Droplets, 
  Flame, 
  CloudRain, 
  Info, 
  Compass, 
  FileCheck2,
  CalendarDays,
  Target
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function RiskAnalysis() {
  const [selectedCrop, setSelectedCrop] = useState<"paddy" | "maize" | "chilli">("paddy");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"2026" | "five_year">("2026");

  // ═══════════════════════════════════════════════════════════════════
  // ML MODEL PREDICTIONS — Source: ML_Risk_ALL_Y_PD.csv
  // Algorithm: RandomForestRegressor (n_estimators=200, R²=0.956)
  // Features: freq, drought, elephants, insects, flood, fire, vol, trend
  // Risk_Score (0.75–1.25) mapped to 0–100 via ((s-0.75)/0.50)*100
  // Loss ratio derived: (risk/100)*20 to approximate damage % range
  // ═══════════════════════════════════════════════════════════════════
  const riskDistribution = [
    { name: "Mihintale", risk: 89.9, riskScore: 1.1997, loss: 18.0 },
    { name: "Horowpothana", risk: 89.9, riskScore: 1.1996, loss: 18.0 },
    { name: "Palugaswewa", risk: 89.9, riskScore: 1.1995, loss: 18.0 },
    { name: "Galnewa", risk: 89.9, riskScore: 1.1995, loss: 18.0 },
    { name: "Kahatagasdigiliya", risk: 89.9, riskScore: 1.1995, loss: 18.0 },
    { name: "Kebithigollewa", risk: 89.9, riskScore: 1.1993, loss: 18.0 },
    { name: "Kekirawa", risk: 89.9, riskScore: 1.1993, loss: 17.9 },
    { name: "Mahawilachchiya", risk: 89.8, riskScore: 1.1992, loss: 17.9 },
    { name: "Rambewa", risk: 89.8, riskScore: 1.1990, loss: 17.9 },
    { name: "Ipalogama", risk: 88.4, riskScore: 1.1922, loss: 17.7 },
    { name: "Tirappane", risk: 84.7, riskScore: 1.1737, loss: 16.9 },
    { name: "Medawachchiya", risk: 83.9, riskScore: 1.1693, loss: 16.8 },
    { name: "Galenbindunuwewa", risk: 83.8, riskScore: 1.1690, loss: 16.8 },
    { name: "Palagala", risk: 77.0, riskScore: 1.1348, loss: 15.4 },
    { name: "Nachchadoowa", risk: 74.9, riskScore: 1.1244, loss: 15.0 },
    { name: "Padaviya", risk: 36.4, riskScore: 0.9322, loss: 7.3 },
    { name: "N. Palatha Central", risk: 32.0, riskScore: 0.9098, loss: 6.4 },
    { name: "Rajanganaya", risk: 23.9, riskScore: 0.8693, loss: 4.8 },
    { name: "Thalawa", risk: 20.5, riskScore: 0.8523, loss: 4.1 },
    { name: "Nochchiyagama", risk: 20.1, riskScore: 0.8504, loss: 4.0 },
    { name: "Thambutthegama", risk: 14.5, riskScore: 0.8227, loss: 2.9 },
    { name: "N. Palatha East", risk: 10.6, riskScore: 0.8029, loss: 2.1 }
  ];

  // Rainfall history comparison data (Yala vs Maha cropping seasons)
  const seasonRainfallHistory = [
    { year: "2021", yala: 410, maha: 850, base: 600 },
    { year: "2022", yala: 320, maha: 940, base: 600 },
    { year: "2023", yala: 590, maha: 780, base: 600 },
    { year: "2024", yala: 260, maha: 1120, base: 600 },
    { year: "2025", yala: 480, maha: 690, base: 600 },
    { year: "2026 (Fcst)", yala: 310, maha: 980, base: 600 }
  ];

  // Specific risk factor contribution for Crops
  const cropRiskData = {
    paddy: [
      { name: "Drought Anomaly", value: 45, color: "#f59e0b" },
      { name: "Flood Inundation", value: 30, color: "#3b82f6" },
      { name: "Pest Intrusion", value: 15, color: "#ef4444" },
      { name: "Soil Degradation", value: 10, color: "#16a34a" }
    ],
    maize: [
      { name: "Drought Anomaly", value: 60, color: "#f59e0b" },
      { name: "Flood Inundation", value: 10, color: "#3b82f6" },
      { name: "Pest Intrusion", value: 20, color: "#ef4444" },
      { name: "Soil Degradation", value: 10, color: "#16a34a" }
    ],
    chilli: [
      { name: "Drought Anomaly", value: 35, color: "#f59e0b" },
      { name: "Flood Inundation", value: 40, color: "#3b82f6" },
      { name: "Pest Intrusion", value: 15, color: "#ef4444" },
      { name: "Soil Degradation", value: 10, color: "#16a34a" }
    ]
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Actuarial Risk & Predictive Modeling</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
            Analyze historical crop losses, real-time satellite moisture ratios, and climatic threat profiles.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Timeframe Toggles */}
          <button 
            onClick={() => setSelectedTimeframe("2026")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
              selectedTimeframe === "2026" 
                ? "bg-aaib-green border-aaib-green text-white shadow-md animate-pulse" 
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
             2026 Forecast
          </button>
          <button 
            onClick={() => setSelectedTimeframe("five_year")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
              selectedTimeframe === "five_year" 
                ? "bg-aaib-green border-aaib-green text-white shadow-md" 
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
             5-Year Trace
          </button>
        </div>
      </div>

      {/* Top row of live anomaly indices */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-100 px-2 py-0.5 rounded">Drought Anomaly</span>
               <Flame size={18} className="text-orange-500" />
            </div>
            <div className="mt-4">
               <p className="text-3xl font-black text-gray-900 leading-none">64.5%</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 border-t pt-1 flex items-center justify-between">
                  <span>Forecast status</span>
                  <span className="text-red-500 font-black">Elevated Threat</span>
               </p>
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded">Precipitation Spike</span>
               <CloudRain size={18} className="text-blue-500" />
            </div>
            <div className="mt-4">
               <p className="text-3xl font-black text-gray-900 leading-none">12.8%</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 border-t pt-1 flex items-center justify-between">
                  <span>Variance threshold</span>
                  <span className="text-green-600 font-black">Normal Range</span>
               </p>
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-100 px-2 py-0.5 rounded">Moisture Scale</span>
               <Droplets size={18} className="text-green-500" />
            </div>
            <div className="mt-4">
               <p className="text-3xl font-black text-gray-900 leading-none">41.2%</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 border-t pt-1 flex items-center justify-between">
                  <span>Soil Sensor Sync</span>
                  <span className="text-orange-500 font-black">Mild Drought</span>
               </p>
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-100 px-2 py-0.5 rounded">Aggregated Risk Index</span>
               <ShieldAlert size={18} className="text-red-500 animate-pulse" />
            </div>
            <div className="mt-4">
               <p className="text-3xl font-black text-red-600 leading-none">66.3</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 border-t pt-1 flex items-center justify-between">
                  <span>ML model mean (22 DS)</span>
                  <span className="text-orange-600 font-black">Elevated (15 of 22 High)</span>
               </p>
            </div>
         </div>
      </div>

      {/* Main Charts block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Large Chart: divisional Risk vs predicted Loss ratios */}
         <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
               <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Divisional Risk Variance Profiles</h3>
                  <p className="text-xs text-mono text-gray-400">Risk index (bars) contrasted with predicted seasonal loss ratios % (line)</p>
               </div>
               <div className="text-[10px] bg-gray-100 border border-gray-200 rounded px-2 py-1 flex gap-2">
                  <span className="font-bold flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#dc2626] rounded-sm"></span> Risk Scale</span>
                  <span className="font-bold flex items-center gap-1"><span className="w-2.5 h-1 bg-[#1a4d2e] rounded-sm"></span> Loss Ratio</span>
               </div>
            </div>

            <div className="h-[360px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                     <XAxis dataKey="name" angle={-45} textAnchor="end" fontSize={8} fontWeight={700} stroke="#475569" height={70} />
                     <YAxis fontSize={10} fontWeight={700} stroke="#475569" />
                     <Tooltip 
                       contentStyle={{ backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: 12, border: "none" }}
                       itemStyle={{ fontSize: 11, fontWeight: "bold" }}
                       labelStyle={{ fontSize: 12, fontWeight: "black", textTransform: 'uppercase' }}
                     />
                     <Bar dataKey="risk" name="Actuarial Risk Index (0-100)">
                        {riskDistribution.map((entry, index) => {
                          const cl = entry.risk > 70 ? "#dc2626" : entry.risk > 40 ? "#f59e0b" : "#16a34a";
                          return <Cell key={`cell-${index}`} fill={cl} />;
                        })}
                     </Bar>
                     <Line type="monotone" dataKey="loss" stroke="#1a4d2e" strokeWidth={3} name="Predicted Loss Ratio (%)" dot={{ r: 4, strokeWidth: 1 }} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Crop risk breakdown card */}
         <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
               <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Crop Threat Allocation</h3>
                  <p className="text-xs text-gray-400 font-medium">Climatic factors weighting for target premium simulation</p>
               </div>

               {/* Target Crop Toggles */}
               <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
                  {["paddy", "maize", "chilli"].map((crop) => (
                    <button 
                      key={crop}
                      onClick={() => setSelectedCrop(crop as "paddy" | "maize" | "chilli")}
                      className={cn(
                        "py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all text-center",
                        selectedCrop === crop 
                          ? "bg-white text-aaib-green shadow-md border border-gray-200/40" 
                          : "text-gray-500 hover:text-gray-900"
                      )}
                    >
                      {crop}
                    </button>
                  ))}
               </div>

               {/* Pie Chart display */}
               <div className="h-[220px] flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                          data={cropRiskData[selectedCrop]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {cropRiskData[selectedCrop].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text displaying active crop */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{selectedCrop}</p>
                     <p className="text-sm font-black text-gray-800 uppercase">Climatic</p>
                     <p className="text-sm font-black text-gray-800 uppercase">Impact</p>
                  </div>
               </div>
            </div>

            {/* Custom Pie Legend */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100">
               {cropRiskData[selectedCrop].map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tight">{entry.name}</span>
                     </div>
                     <span className="text-[10px] font-black text-gray-900 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {entry.value}%
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Climatic patterns over Maha (Wet) & Yala (Dry) Copping cycles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-4">
            <div>
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Seasonal Rainfall Trends - Anuradhapura</h3>
               <p className="text-xs text-gray-400">Total precipitation tracked across Maha and Yala cycles (mm baseline 600mm)</p>
            </div>

            <div className="h-[280px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={seasonRainfallHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorYala" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                           <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMaha" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                     <XAxis dataKey="year" fontSize={10} fontWeight={700} stroke="#475569" />
                     <YAxis fontSize={10} fontWeight={700} stroke="#475569" />
                     <Tooltip />
                     <Legend wrapperStyle={{ fontSize: 10, fontWeight: "bold", textTransform: 'uppercase' }} />
                     <Area type="monotone" dataKey="yala" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorYala)" name="Yala Season (Dry Cycle)" />
                     <Area type="monotone" dataKey="maha" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMaha)" name="Maha Season (Wet Cycle)" />
                     <Area type="monotone" dataKey="base" stroke="#cbd5e1" strokeWidth={1.5} fill="none" strokeDasharray="3 3" dot={false} name="Optimal Baseline" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Soil Moisture / Satellite Index Alert Checklist */}
         <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-5">
            <div>
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Pilot District Smart Alerts</h3>
               <p className="text-xs text-gray-400">Risk thresholds hit during the active pilot phase</p>
            </div>

            <div className="space-y-4">
               <div className="flex gap-4 p-4.5 rounded-xl border border-red-100 bg-red-50/50">
                  <Flame className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <div>
                     <p className="text-xs font-black text-red-950 uppercase tracking-tight">ML Model — High Risk Cluster Detected</p>
                     <p className="text-[10px] text-red-800 leading-relaxed mt-1">
                        <strong>Mihintale, Horowpothana, Palugaswewa, Galnewa</strong> predicted at Risk Index &gt;89 by the Random Forest model. Dominant damage drivers: drought frequency &amp; elephant intrusion ratios.
                     </p>
                     <span className="inline-block mt-2 font-mono text-[9px] bg-red-100 px-2 py-0.5 rounded text-red-600 font-bold uppercase tracking-widest">ML prediction: 15 of 22 divisions above threshold</span>
                  </div>
               </div>

               <div className="flex gap-4 p-4.5 rounded-xl border border-green-100 bg-green-50/50">
                  <CloudRain className="text-green-600 shrink-0 mt-0.5" size={18} />
                  <div>
                     <p className="text-xs font-black text-green-950 uppercase tracking-tight">ML Model — Low Risk Divisions Identified</p>
                     <p className="text-[10px] text-green-800 leading-relaxed mt-1">
                        <strong>N. Palatha East, Thambutthegama, Nochchiyagama</strong> predicted at Risk Index &lt;21. These divisions show lower historical damage ratios and lower claim volatility.
                     </p>
                     <span className="inline-block mt-2 font-mono text-[9px] bg-green-100 px-2 py-0.5 rounded text-green-600 font-bold uppercase tracking-widest">ML prediction: 7 divisions below baseline</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
