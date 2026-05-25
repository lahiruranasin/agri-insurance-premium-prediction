import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  SlidersHorizontal, 
  TrendingUp, 
  Percent, 
  HelpCircle,
  Database,
  ArrowRightLeft,
  Smartphone,
  Save,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function Settings() {
  const [profileName, setProfileName] = useState("Oshan Lahiru");
  const [role, setRole] = useState("AAIB Regional Underwriting Manager");
  const [office, setOffice] = useState("Anuradhapura District HQ, Sri Lanka");
  const [paddyRate, setPaddyRate] = useState(1500);
  const [maizeRate, setMaizeRate] = useState(1800);
  const [chilliRate, setChilliRate] = useState(2200);
  const [subsidyPercentage, setSubsidyPercentage] = useState(30);
  const [alertThreshold, setAlertThreshold] = useState(70);
  
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">System Settings & Calibration</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
             Calibrate core actuarial formulas, adjust crop insurance ceilings, and modify profile permissions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* Profile Card & Credentials */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-6">
           <h3 className="text-sm font-black text-aaib-green uppercase tracking-widest flex items-center gap-2">
              <User size={16} /> Regional Office Credentials
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operator Name</label>
                 <input 
                   type="text" 
                   value={profileName} 
                   onChange={(e) => setProfileName(e.target.value)}
                   className="w-full text-xs font-bold p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-aaib-green"
                   required
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff Role Designation</label>
                 <input 
                   type="text" 
                   value={role} 
                   onChange={(e) => setRole(e.target.value)}
                   className="w-full text-xs font-bold p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-aaib-green"
                   required
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stationed HQ Branch</label>
                 <input 
                   type="text" 
                   value={office} 
                   onChange={(e) => setOffice(e.target.value)}
                   className="w-full text-xs font-bold p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-aaib-green"
                   required
                 />
              </div>
           </div>
        </div>

        {/* Global Actuarial Constants sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* Section: Base Insurance Multipliers */}
           <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-6">
              <div>
                 <h3 className="text-sm font-black text-aaib-green uppercase tracking-widest flex items-center gap-2">
                    <SlidersHorizontal size={16} /> Base Crop Rates Config
                 </h3>
                 <p className="text-xs text-gray-400 mt-1 uppercase tracking-tight">Set basic underwriting valuation levels (LKR per acre)</p>
              </div>

              <div className="space-y-5">
                 {/* Paddy Slider */}
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                       <span className="uppercase tracking-tight">Paddy Rice (Vee)</span>
                       <span className="font-mono text-aaib-green">LKR {paddyRate}</span>
                    </div>
                    <input 
                      type="range" 
                      min="500" 
                      max="4000" 
                      step="100" 
                      value={paddyRate} 
                      onChange={(e) => setPaddyRate(parseInt(e.target.value))}
                      className="w-full accent-aaib-green h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                    />
                 </div>

                 {/* Maize Slider */}
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                       <span className="uppercase tracking-tight">Maize (Bada Iringu)</span>
                       <span className="font-mono text-aaib-green">LKR {maizeRate}</span>
                    </div>
                    <input 
                      type="range" 
                      min="500" 
                      max="4000" 
                      step="100" 
                      value={maizeRate} 
                      onChange={(e) => setMaizeRate(parseInt(e.target.value))}
                      className="w-full accent-aaib-green h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                    />
                 </div>

                 {/* Chilli Slider */}
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                       <span className="uppercase tracking-tight">Chilli Peppers (Miris)</span>
                       <span className="font-mono text-aaib-green">LKR {chilliRate}</span>
                    </div>
                    <input 
                      type="range" 
                      min="500" 
                      max="4000" 
                      step="100" 
                      value={chilliRate} 
                      onChange={(e) => setChilliRate(parseInt(e.target.value))}
                      className="w-full accent-aaib-green h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                    />
                 </div>
              </div>
           </div>

           {/* Section: Subsidies & Risk limits */}
           <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-6 justify-between flex flex-col">
              <div className="space-y-6">
                 <div>
                    <h3 className="text-sm font-black text-aaib-green uppercase tracking-widest flex items-center gap-2">
                       <Percent size={16} /> Regional Policy Variables
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-tight">Calibrate state subsidiary aids and satellite warnings</p>
                 </div>

                 <div className="space-y-5">
                    {/* State Subsidy Percentage */}
                    <div className="space-y-1.5">
                       <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span className="uppercase tracking-tight">National Subsidy Allocation %</span>
                          <span className="font-mono text-aaib-green">{subsidyPercentage}%</span>
                       </div>
                       <input 
                         type="range" 
                         min="10" 
                         max="60" 
                         step="5" 
                         value={subsidyPercentage} 
                         onChange={(e) => setSubsidyPercentage(parseInt(e.target.value))}
                         className="w-full accent-aaib-green h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                       />
                    </div>

                    {/* Threat Index Red Alert threshold */}
                    <div className="space-y-1.5">
                       <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span className="uppercase tracking-tight">Threat Index Red Alert Ceiling</span>
                          <span className="font-mono text-red-650 text-red-650 text-red-600">{alertThreshold}</span>
                       </div>
                       <input 
                         type="range" 
                         min="50" 
                         max="95" 
                         step="5" 
                         value={alertThreshold} 
                         onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                         className="w-full accent-aaib-green h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                       />
                    </div>
                 </div>
              </div>

              {/* Pilot parameters code explanation helper */}
              <div className="bg-gray-100/50 p-4 rounded-xl border border-gray-200/50 text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider">
                 Modifying variables will live-update calculations compiled relative to the Sri Lanka Ministry of Agricultural Protection Act 2026 guidelines.
              </div>
           </div>
        </div>

        {/* Satellite and API Data Connectors configuration */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                 <h3 className="text-sm font-black text-aaib-green uppercase tracking-widest flex items-center gap-2">
                    <Database size={16} /> Remote Sensing Integrations
                 </h3>
                 <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-tight">Manage spatial links with imagery constellations and weather telemetry sensors</p>
              </div>
              <div className="flex text-xs bg-gray-100 p-1 rounded-lg">
                 <span className="font-bold text-gray-700 hover:text-gray-900 bg-white shadow py-1 px-3.5 rounded cursor-pointer uppercase tracking-wider text-[9px]">API Config</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200/50 bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer">
                 <ArrowRightLeft className="text-[#1a4d2e] shrink-0 mt-0.5" size={18} />
                 <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide">Meteorological API Link (DoM SL)</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed mt-1">Live rainfall data ingested directly from Sri Lanka Department of Meteorology coordinates.</p>
                    <span className="inline-block mt-2 font-mono text-[8px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-black tracking-widest">CONNECTED &bull; RESPONSE 240MS</span>
                 </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200/50 bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer">
                 <Smartphone className="text-[#1a4d2e] shrink-0 mt-0.5" size={18} />
                 <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide">Farmers Portal SMS Push (Lanka Bell)</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed mt-1">Dynamic alert broadcast with local crop status parameters and policy due dates.</p>
                    <span className="inline-block mt-2 font-mono text-[8px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-black tracking-widest">READY &bull; SATELLITE GATEWAY OK</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Submission layout with save notification */}
        <div className="flex items-center justify-between py-4 border-t border-gray-200">
           <div className="flex items-center gap-2">
              <ShieldCheck className="text-[#1a4d2e]" size={18} />
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Authorized Operational Settings Group</p>
           </div>
           
           <div className="flex items-center gap-4">
              <AnimatePresence>
                 {savedSuccess && (
                   <motion.div 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0 }}
                     className="flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-xl"
                   >
                      <CheckCircle2 size={14} />
                      Config variables updated!
                   </motion.div>
                 )}
              </AnimatePresence>
              <button 
                type="submit"
                className="bg-[#1a4d2e] hover:bg-aaib-accent text-white font-black text-xs uppercase tracking-widest px-8 py-4.5 rounded-xl transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-2 font-sans shrink-0"
              >
                 <Save size={16} />
                 Store Changes
              </button>
           </div>
        </div>

      </form>
    </div>
  );
}
