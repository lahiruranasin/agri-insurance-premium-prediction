import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calculator, 
  Settings2, 
  Printer, 
  Coins, 
  Flame, 
  MapPin, 
  Percent, 
  ClipboardList, 
  UserPlus, 
  RefreshCw,
  PlusCircle,
  FileCheck2,
  HelpCircle
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ApiService } from "../lib/apiService";

interface ActuarialQuote {
  id: string;
  clientName: string;
  division: string;
  crop: string;
  acreage: number;
  coverage: number;
  irrigation: "rainfed" | "minor" | "major";
  totalPremium: number;
  subsidyAmount: number;
  netPremium: number;
  date: string;
}

export default function PremiumCalculatorPage({ selectedDivision: initialDivision }: { selectedDivision?: string }) {
  const [clientName, setClientName] = useState("S. K. Gunawardena");
  const [district] = useState("Anuradhapura");
  const [division, setDivision] = useState(initialDivision || "Thalawa");
  const [crop, setCrop] = useState("Paddy");
  const [acreage, setAcreage] = useState(15);
  const [coverage, setCoverage] = useState(60); // percentage
  const [irrigation, setIrrigation] = useState<"rainfed" | "minor" | "major">("minor");
  const [subsidyOpt, setSubsidyOpt] = useState(true);

  // Manual risk adjuster slider (for Human-in-the-Loop Override)
  const [manualOverride, setManualOverride] = useState(1.0); 

  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  useEffect(() => {
    ApiService.checkHealth().then(valid => setIsBackendConnected(valid));
  }, []);

  // Recent Quote calculation history
  const [quotesList, setQuotesList] = useState<ActuarialQuote[]>([
    { id: "Q-9902", clientName: "A. M. Herath", division: "Mahawilachchiya", crop: "Paddy", acreage: 10, coverage: 50, irrigation: "rainfed", totalPremium: 14500, subsidyAmount: 4350, netPremium: 10150, date: "2026-05-24" },
    { id: "Q-9901", clientName: "K. B. Rambanda", division: "Padaviya", crop: "Maize", acreage: 25, coverage: 70, irrigation: "major", totalPremium: 28200, subsidyAmount: 8460, netPremium: 19740, date: "2026-05-23" },
    { id: "Q-9900", clientName: "P. Devika Kulasiri", division: "Kebitigollewa", crop: "Chilli", acreage: 8, coverage: 50, irrigation: "minor", totalPremium: 11900, subsidyAmount: 3570, netPremium: 8330, date: "2026-05-21" },
  ]);

  // Divisions matching risk ratings in our dataset
  const divisionRiskIndex: Record<string, { risk: "Low" | "Medium" | "High"; score: number }> = {
    "Padaviya": { risk: "Low", score: 12 },
    "Kebitigollewa": { risk: "Medium", score: 45 },
    "Medawachchiya": { risk: "Low", score: 22 },
    "Mahawilachchiya": { risk: "High", score: 88 },
    "Rambewa": { risk: "Medium", score: 58 },
    "Kahatagasdigiliya": { risk: "Low", score: 15 },
    "Horowupothana": { risk: "High", score: 75 },
    "Nuwaragam Palatha Central": { risk: "Medium", score: 42 },
    "Mihintale": { risk: "Low", score: 35 },
    "Nuwaragam Palatha East": { risk: "Medium", score: 55 },
    "Nachchaduwa": { risk: "High", score: 82 },
    "Galenbindunuwewa": { risk: "Low", score: 25 },
    "Nochchiyagama": { risk: "Medium", score: 48 },
    "Rajanganaya": { risk: "High", score: 80 },
    "Thambuttegama": { risk: "Low", score: 18 },
    "Thalawa": { risk: "High", score: 78 },
    "Tirappane": { risk: "Medium", score: 40 },
    "Ipalogama": { risk: "Medium", score: 35 },
    "Galnewa": { risk: "High", score: 65 },
    "Kekirawa": { risk: "Low", score: 32 },
    "Palugaswewa": { risk: "Medium", score: 55 },
    "Palagala": { risk: "High", score: 90 }
  };

  // Crop base coefficients
  const cropBaseRates: Record<string, number> = {
    Paddy: 1500, // LKR basic rate per acre
    Maize: 1800,
    Chilli: 2200,
    Soya: 1600,
    Onions: 2500
  };

  // Run Calculations
  const activeDivInfo = divisionRiskIndex[division] || { risk: "Medium", score: 45 };
  const baseRate = cropBaseRates[crop] || 1500;
  
  // Actuarial Math Formula:
  // Gross Premium = Base Premium * (Risk Score Weighted multiplier) * manualOverride
  // Base Premium = Acreage * BaseRate * (CoverageLevel / 50)
  const basePremium = acreage * baseRate * (coverage / 50);
  
  // Risk Score weighted factor: low risk has multiplier ~0.8, high risk multiplier up to ~2.2
  const riskMultiplier = 0.5 + (activeDivInfo.score / 50); 
  
  // Irrigation Rebate modifier
  const irrigationRelief = irrigation === "major" ? 0.8 : irrigation === "minor" ? 0.95 : 1.15;

  const grossPremium = Math.round(basePremium * riskMultiplier * manualOverride * irrigationRelief);
  
  // Subsidy calculations (e.g., standard 30% state agricultural assistance)
  const subsidyAmount = subsidyOpt ? Math.round(grossPremium * 0.3) : 0;
  const netPremium = grossPremium - subsidyAmount;

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuote: ActuarialQuote = {
      id: "Q-" + (Math.floor(Math.random() * 9000) + 1000),
      clientName: clientName || "Anonymous Cultivator",
      division,
      crop,
      acreage,
      coverage,
      irrigation,
      totalPremium: grossPremium,
      subsidyAmount,
      netPremium,
      date: new Date().toISOString().substring(0, 10)
    };
    setQuotesList([newQuote, ...quotesList]);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Actuarial Valuation Simulator</h2>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
          Perform immediate Premium generation matching crop indices, satellite risk factors, and irrigation parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Parameters input form */}
        <form onSubmit={handleCreateQuote} className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden divide-y divide-gray-100">
           {/* Section 1: Client Metadata */}
           <div className="p-6 space-y-4">
              <h3 className="text-sm font-black text-[#1a4d2e] uppercase tracking-widest flex items-center gap-2"><UserPlus size={16}/> Cultivator Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cultivator Name</label>
                    <input 
                      type="text" 
                      value={clientName} 
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full text-xs font-bold p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-aaib-green transition-shadow"
                      placeholder="Enter initials and name"
                      required
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilot District</label>
                    <input 
                      type="text" 
                      value={district} 
                      disabled
                      className="w-full text-xs font-black p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed uppercase"
                    />
                 </div>
              </div>
           </div>

           {/* Section 2: Property & Crop Fields */}
           <div className="p-6 space-y-4">
              <h3 className="text-sm font-black text-[#1a4d2e] uppercase tracking-widest flex items-center gap-2"><Settings2 size={16}/> Cropping Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Division Target</label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full text-xs font-bold p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-aaib-green"
                    >
                      {Object.keys(divisionRiskIndex).map(divName => (
                         <option key={divName} value={divName}>{divName}</option>
                      ))}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Insured Crop</label>
                    <select
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="w-full text-xs font-bold p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-aaib-green"
                    >
                      <option value="Paddy">Paddy Rice (Vee)</option>
                      <option value="Maize">Maize (Bada Iringu)</option>
                      <option value="Chilli">Chili Peppers (Miris)</option>
                      <option value="Soya">Soybean (Soya)</option>
                      <option value="Onions">Red Onions (Lunu)</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Insured Area (Acres)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="500"
                      value={acreage} 
                      onChange={(e) => setAcreage(parseInt(e.target.value) || 1)}
                      className="w-full text-xs font-bold p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-aaib-green"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coverage Target (%)</label>
                    <input 
                      type="number" 
                      min="10" 
                      max="100"
                      step="5"
                      value={coverage} 
                      onChange={(e) => setCoverage(parseInt(e.target.value) || 50)}
                      className="w-full text-xs font-bold p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-aaib-green"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Water Source Type</label>
                    <select
                      value={irrigation}
                      onChange={(e) => setIrrigation(e.target.value as any)}
                      className="w-full text-xs font-bold p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-aaib-green"
                    >
                      <option value="rainfed">Rainfed (Wet season dependent)</option>
                      <option value="minor">Minor Irrigation (Local Tank)</option>
                      <option value="major">Major Canal (Malwathu Oya)</option>
                    </select>
                 </div>
              </div>
           </div>

           {/* Section 3: Risk Override & Human adjustment */}
           <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="text-sm font-black text-[#1a4d2e] uppercase tracking-widest flex items-center gap-2"><Coins size={16}/> Manual Actuarial Adjuster</h3>
                 <span className="text-[10px] font-black text-gray-400 bg-gray-100 border uppercase px-2 py-0.5 rounded tracking-wider">Human-in-the-loop override</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                 Adjust weighting manually based on specific topography factors or direct physical soil inspection offsets.
              </p>
              <div className="space-y-1 p-4 bg-gray-50 rounded-xl border border-gray-200/60">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Override Multiplier</span>
                    <span className="text-xs font-mono font-black text-aaib-green">x{manualOverride.toFixed(2)}</span>
                 </div>
                 <input 
                   type="range" 
                   min="0.5" 
                   max="1.8" 
                   step="0.05"
                   value={manualOverride} 
                   onChange={(e) => setManualOverride(parseFloat(e.target.value))}
                   className="w-full accent-aaib-green h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                 />
                 <div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase mt-1">
                    <span>Rebate (-50%)</span>
                    <span>No Shift</span>
                    <span>Premium Penalty (+80%)</span>
                 </div>
              </div>
           </div>

           {/* Option toggle & calculate action */}
           <div className="p-6 bg-gray-50 flex flex-col md:flex-row shadow-inner md:items-center justify-between gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={subsidyOpt}
                    onChange={(e) => setSubsidyOpt(e.target.checked)}
                    className="w-4.5 h-4.5 accent-aaib-green rounded text-aaib-green border-gray-200 focus:ring-aaib-green cursor-pointer"
                  />
                  <div className="flex flex-col text-left select-none">
                     <span className="text-xs font-black text-gray-900 leading-none uppercase group-hover:text-black">APPLY STATE SUBSIDY</span>
                     <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Grants -30% premium assistance</span>
                  </div>
              </label>

              <button 
                type="submit"
                className="bg-[#1a4d2e] hover:bg-aaib-accent text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 font-sans shrink-0 hover:shadow-2xl"
              >
                 <PlusCircle size={16} />
                 Log Calculation
              </button>
           </div>
        </form>

        {/* Right Side: Actuarial Worksheet Receipt & calculations */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-gradient-to-br from-[#1a4d2e] to-[#2d7a46] text-white rounded-2xl shadow-2xl p-6.5 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 pointer-events-none scale-150">
                 <Calculator size={300} />
              </div>

              {/* Worksheet Header */}
              <div className="flex justify-between items-start border-b border-white/20 pb-4 mb-4 z-10 relative">
                 <div>
                    <h4 className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Actuarial Quote Sheet</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-base font-black tracking-tight">AAIB PREMIUM MATRIX</p>
                      {isBackendConnected && (
                        <span className="text-[7px] bg-yellow-400 text-[#1a4d2e] font-black px-1 rounded uppercase tracking-widest animate-pulse shrink-0">XGBoost Valid</span>
                      )}
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] text-white/70 font-mono">CODEBOOK PROTOCOL</p>
                    <p className="text-xs font-mono font-black bg-white/10 px-2 py-0.5 rounded uppercase mt-1 inline-block">Anuradhapura</p>
                 </div>
              </div>

              {/* Factors list */}
              <div className="space-y-3 z-10 relative text-xs">
                 <div className="flex justify-between text-white/80 border-b border-white/10 pb-2">
                    <span>Selected Subdivision:</span>
                    <span className="font-black text-white">{division.toUpperCase()}</span>
                 </div>
                 <div className="flex justify-between text-white/80 border-b border-white/10 pb-2">
                    <span>Risk Category (Divisional):</span>
                    <span className="font-black text-white flex items-center gap-1">
                       <MapPin size={12} className="text-yellow-400" />
                       {activeDivInfo.risk} ({activeDivInfo.score})
                    </span>
                 </div>
                 <div className="flex justify-between text-white/80 border-b border-white/10 pb-2">
                    <span>Base Crop Multiplier:</span>
                    <span className="font-black text-white font-mono">LKR {baseRate.toLocaleString()} / acre ({crop})</span>
                 </div>
                 <div className="flex justify-between text-white/80 border-b border-white/10 pb-2">
                    <span>Target Insured Acreage:</span>
                    <span className="font-black text-white font-mono">{acreage} Acres</span>
                 </div>
                 <div className="flex justify-between text-white/80 border-b border-white/10 pb-2">
                    <span>Coverage Level Modifier:</span>
                    <span className="font-black text-white font-mono">{coverage}%</span>
                 </div>
                 <div className="flex justify-between text-white/80 border-b border-white/10 pb-2">
                    <span>Water Irrigation Source:</span>
                    <span className="font-black text-white uppercase tracking-tight">{irrigation}</span>
                 </div>
                 <div className="flex justify-between text-white/80 pb-2">
                    <span>Manual Calibration Shift:</span>
                    <span className="font-black text-yellow-400">x{manualOverride}</span>
                 </div>
              </div>

              {/* Premium output values */}
              <div className="mt-6 p-4.5 bg-white/10 border border-white/20 rounded-2xl space-y-3.5 z-10 relative">
                 <div className="flex justify-between items-center text-white/80">
                    <span className="text-[10px] font-black uppercase tracking-widest">Gross Predicted Premium:</span>
                    <span className="font-mono text-base font-black">LKR {grossPremium.toLocaleString()}</span>
                 </div>
                 {subsidyOpt && (
                    <div className="flex justify-between items-center text-yellow-300">
                       <span className="text-[10px] font-black uppercase tracking-widest">State Aid Subsidy (30%):</span>
                       <span className="font-mono text-xs font-bold">- LKR {subsidyAmount.toLocaleString()}</span>
                    </div>
                 )}
                 <div className="border-t border-white/20 pt-3 flex justify-between items-baseline text-white">
                    <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Net Due Premium:</span>
                    <div className="text-right">
                       <p className="text-2xl font-black font-mono">LKR {netPremium.toLocaleString()}</p>
                       <span className="text-[8px] text-white/60 uppercase tracking-widest">Payable by Cultivator</span>
                    </div>
                 </div>
              </div>

              <div className="mt-5 flex gap-2.5 z-10 relative">
                 <button 
                   type="button"
                   onClick={() => window.print()}
                   className="flex-1 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-[#1a4d2e] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                 >
                    <Printer size={14} />
                    Print Receipt
                 </button>
              </div>
           </div>

           {/* Actuarial Math Formula Helper card */}
           <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                 <HelpCircle size={15} className="text-[#1a4d2e]"/>
                 System Pricing Methodology
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                 The premium prediction algorithm coordinates remote sensing rainfall metrics and satellite NDVI index anomalies according to SL-AAIB Actuarial Guidelines.
              </p>
              <div className="bg-gray-50 border border-gray-150 p-3 rounded-lg font-mono text-[9px] text-gray-600 uppercase italic leading-loose text-center">
                 Formula: [Acreage &times; Rate &times; (Coverage / 50)] &times; [0.5 + (RiskIndex / 50)] &times; Irrigation_Relief
              </div>
           </div>
        </div>

      </div>

      {/* Historical quotes logged in this active session */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
         <div className="bg-gray-50 p-6 border-b border-gray-100">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2"><ClipboardList size={18} className="text-aaib-green"/> Session Calculation Log</h3>
            <p className="text-xs text-gray-400 font-medium">Traceable quotes evaluated under the Anuradhapura Pilot district index.</p>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left font-normal border-collapse">
               <thead>
                  <tr className="bg-gray-100/50 border-b border-gray-200/50">
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actuarial Quote ID</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cultivator Details</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cropping specs</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Valuation</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subsidy Aid</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Premium Amount</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Generated Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {quotesList.map(quote => (
                    <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-6 py-4 font-mono text-xs font-black text-aaib-green">
                          {quote.id}
                       </td>
                       <td className="px-6 py-4 text-xs font-bold text-gray-900">
                          {quote.clientName}
                          <p className="text-[10px] text-gray-450 font-normal font-sans text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10}/> {quote.division}</p>
                       </td>
                       <td className="px-6 py-4 text-xs font-bold text-gray-700">
                          {quote.crop}
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{quote.acreage} ACRES &bull; {quote.coverage}% COV &bull; {quote.irrigation.toUpperCase()}</p>
                       </td>
                       <td className="px-6 py-4 font-mono text-xs text-gray-700">
                          LKR {quote.totalPremium.toLocaleString()}
                       </td>
                       <td className="px-6 py-4 text-xs font-mono font-bold text-green-600">
                          - LKR {quote.subsidyAmount.toLocaleString()}
                       </td>
                       <td className="px-6 py-4 font-mono text-xs font-black text-gray-900">
                          LKR {quote.netPremium.toLocaleString()}
                       </td>
                       <td className="px-6 py-4 font-mono text-xs text-gray-400">
                          {quote.date}
                       </td>
                    </tr>
                 ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
