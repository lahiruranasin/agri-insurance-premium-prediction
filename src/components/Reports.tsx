import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area,
  Legend
} from "recharts";
import { 
  FileDown, 
  FileText, 
  Calendar, 
  TrendingDown, 
  Layers, 
  Download, 
  CheckCircle, 
  Search, 
  Filter, 
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SystemReport {
  id: string;
  title: string;
  category: "underwriting" | "meteorological" | "drone_imagery" | "audit";
  size: string;
  date: string;
  author: string;
  downloadsCount: number;
  status: "ready" | "refreshing";
}

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  const [reportsList] = useState<SystemReport[]>(
    [
      { id: "REP-4011", title: "Anuradhapura Q1-2026 Actuarial Index Valuation", category: "underwriting", size: "3.4 MB", date: "2026-05-15", author: "SL-AAIB Actuary Dept", downloadsCount: 245, status: "ready" },
      { id: "REP-4009", title: "NDVI Thermal Satellite Moisture Anomaly Log - May", category: "meteorological", size: "8.1 MB", date: "2026-05-10", author: "Space Research Center SL", downloadsCount: 112, status: "ready" },
      { id: "REP-3992", title: "Thalawa & Galnewa Micro-Drainage Drone Survey Grid", category: "drone_imagery", size: "45.0 MB", date: "2026-05-01", author: "AeroAgrar Pilot Crew", downloadsCount: 88, status: "ready" },
      { id: "REP-3921", title: "AAIB Historical Loss Ratio Audit (2020-2025)", category: "audit", size: "2.8 MB", date: "2026-04-18", author: "Agri Ministry Auditor", downloadsCount: 412, status: "ready" },
      { id: "REP-3844", title: "Dry Zone Paddy Crop Deficit & Payout Simulations v2.4", category: "underwriting", size: "1.9 MB", date: "2026-04-12", author: "SL-AAIB Underwriters", downloadsCount: 190, status: "ready" }
    ]
  );

  // Simulated premium volume vs payout claims
  const seasonalHistoricalClaims = [
    { season: "2020 Maha", premiums: 120, payouts: 64 },
    { season: "2021 Yala", premiums: 95, payouts: 112 }, // Drought spike
    { season: "2021 Maha", premiums: 140, payouts: 25 },
    { season: "2022 Yala", premiums: 110, payouts: 55 },
    { season: "2022 Maha", premiums: 180, payouts: 90 },
    { season: "2023 Yala", premiums: 145, payouts: 130 }, // Inundation spike
    { season: "2023 Maha", premiums: 210, payouts: 42 },
    { season: "2024 Yala", premiums: 240, payouts: 195 }, // Drought
    { season: "2024 Maha", premiums: 310, payouts: 85 },
    { season: "2025 Yala", premiums: 290, payouts: 90 },
    { season: "2025 Maha", premiums: 420, payouts: 110 },
    { season: "2026 (Fcst)", premiums: 510, payouts: 160 }
  ];

  const filteredReports = reportsList.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategoryFilter === "all" || report.category === activeCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Decision Support & Reports</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
            Download certified crop damage audits, satellite yield assessments, and regional payout analytics.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#1a4d2e] hover:bg-aaib-accent text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl active:scale-95">
           <Layers size={14} />
           Compile Custom Audit Sheet
        </button>
      </div>

      {/* Aggregate Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg flex justify-between items-center">
            <div className="space-y-1">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilot Loss Ratio AVG</p>
               <h3 className="text-2xl font-black text-gray-900 font-mono">18.4%</h3>
               <p className="text-[9px] text-green-600 font-bold uppercase tracking-tight flex items-center gap-1">
                  <TrendingDown size={12}/> Below historic danger baseline 25%
               </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#1a4d2e] border border-green-100 font-black">
               18%
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg flex justify-between items-center">
            <div className="space-y-1">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Active Inception Liability</p>
               <h3 className="text-2xl font-black text-gray-900 font-mono">LKR 41.5 M</h3>
               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                  Covering 16 pilot agrarian collectives
               </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
               <ArrowUpRight size={18} />
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg flex justify-between items-center">
            <div className="space-y-1">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Settled Indemnity Claims</p>
               <h3 className="text-2xl font-black text-gray-900 font-mono">LKR 11.2 M</h3>
               <p className="text-[9px] text-red-500 font-bold uppercase tracking-tight flex items-center gap-1">
                  <ShieldAlert size={12}/> Drought claims finalized (2025 Maha)
               </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100">
               98%
            </div>
         </div>
      </div>

      {/* Underwriting premium pool vs payout claims chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-4">
         <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Historical Premium Pools vs Settled Claims (Million LKR)</h3>
            <p className="text-xs text-mono text-gray-400">Comparing total accumulated premiums with agricultural loss payout claims over dry and wet seasons</p>
         </div>

         <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={seasonalHistoricalClaims} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                     <linearGradient id="colPr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a4d2e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1a4d2e" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colPay" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="season" fontSize={9} fontWeight={700} stroke="#475569" />
                  <YAxis fontSize={9} fontWeight={700} stroke="#475569" />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 9, fontWeight: "extrabold", textTransform: 'uppercase' }} />
                  <Area type="monotone" dataKey="premiums" name="Inception Premium Pools (LKR)" stroke="#1a4d2e" strokeWidth={2.5} fillOpacity={1} fill="url(#colPr)" />
                  <Area type="monotone" dataKey="payouts" name="Settled Damage Payouts (LKR)" stroke="#dc2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colPay)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Reports Vault List with advanced categorization filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
         {/* Filter Bar */}
         <div className="bg-gray-50 border-b border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex bg-gray-200 p-1 rounded-xl gap-1 shrink-0">
               {[
                 { id: "all", label: "All Vaults" },
                 { id: "underwriting", label: "Underwriting Matrix" },
                 { id: "meteorological", label: "Moisture & Rainfall" },
                 { id: "drone_imagery", label: "Surveys" },
                 { id: "audit", label: "Audits" }
               ].map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={cn(
                      "text-[9px] font-black uppercase tracking-wider py-2 px-3 rounded-lg transition-all",
                      activeCategoryFilter === cat.id 
                        ? "bg-white text-aaib-green shadow-sm" 
                        : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                     {cat.label}
                  </button>
               ))}
            </div>

            {/* In-tab Search */}
            <div className="relative w-full md:max-w-xs">
               <input 
                 type="text" 
                 value={searchTerm} 
                 onChange={(e) => setSearchTerm(e.target.value)} 
                 placeholder="Search Vault reports..."
                 className="w-full text-xs font-bold p-3 pl-10 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-aaib-green"
               />
               <Search className="absolute left-3.5 top-3.5 text-gray-450 text-gray-400" size={14} />
            </div>
         </div>

         {/* Grid listing */}
         <div className="divide-y divide-gray-100">
           {filteredReports.map((report) => (
              <div key={report.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/40 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-aaib-card/30 rounded-2xl flex items-center justify-center text-[#1a4d2e] border border-aaib-green/5 shrink-0">
                       <FileText size={22} />
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] font-black text-aaib-green uppercase bg-aaib-card px-2 py-0.5 rounded border border-aaib-green/10">
                             {report.id}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-gray-400">
                             Vault: {report.category}
                          </span>
                       </div>
                       <h4 className="text-sm font-black text-gray-900 mt-1 uppercase tracking-tight">{report.title}</h4>
                       <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1 font-bold uppercase"><Calendar size={11} /> {report.date}</span>
                          <span>&bull;</span>
                          <span className="font-medium">Compiled by: <strong className="text-gray-600">{report.author}</strong></span>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 ml-auto sm:ml-0">
                    <div className="text-right hidden md:block">
                       <p className="text-xs font-black text-gray-900">{report.size}</p>
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{report.downloadsCount} times downloaded</p>
                    </div>
                    <button 
                      onClick={() => alert(`Initiating download for ${report.title} (${report.size})`)}
                      className="p-3.5 bg-gray-50 hover:bg-aaib-green hover:text-white rounded-xl text-gray-600 border border-gray-200 hover:border-aaib-green transition-all shadow-md flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider active:scale-95 shrink-0"
                    >
                       <Download size={14} />
                       Get PDF
                    </button>
                 </div>
              </div>
           ))}
           {filteredReports.length === 0 && (
              <div className="p-16 text-center text-gray-400 space-y-2">
                 <FileDown className="mx-auto text-gray-300" size={44} />
                 <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">No matching report found</p>
                 <p className="text-[11px] text-gray-500">Refine your search term or categorization tags in the vault manager.</p>
              </div>
           )}
         </div>
      </div>
    </div>
  );
}
