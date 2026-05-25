import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CloudCheck, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Database,
  CloudSun,
  MapPin,
  RefreshCw,
  Eye,
  Activity,
  Cpu
} from "lucide-react";
import { ApiService } from "../lib/apiService";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  division: string;
  date: string;
  status: "parsing" | "completed" | "error";
  recordsCount?: number;
}

export default function DataUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: "1", name: "Thalawa_Rainfall_2026.csv", size: "1.2 MB", type: "Meteorological Data", division: "Thalawa", date: "2026-05-20", status: "completed", recordsCount: 1450 },
    { id: "2", name: "Anuradhapura_NDVI_May26.xlsx", size: "4.8 MB", type: "Satellite Imagery (NDVI)", division: "Multiple (All 22)", date: "2026-05-18", status: "completed", recordsCount: 8900 },
    { id: "3", name: "Galnewa_SoilMoisture_Sensors.csv", size: "850 KB", type: "IoT Sensor Streams", division: "Galnewa", date: "2026-05-15", status: "completed", recordsCount: 2310 },
    { id: "4", name: "Padaviya_YieldRecord_2025.csv", size: "2.1 MB", type: "Historic Harvest Registry", division: "Padaviya", date: "2026-05-10", status: "completed", recordsCount: 4200 }
  ]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingFileName, setUploadingFileName] = useState<string>("");
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll server health on load
  useEffect(() => {
    const fetchHealth = async () => {
      const active = await ApiService.checkHealth();
      setIsBackendConnected(active);
    };
    fetchHealth();
    // Poll every 10 seconds gently
    const timer = setInterval(fetchHealth, 10000);
    return () => clearInterval(timer);
  }, []);

  const triggerRetraining = async () => {
    setIsRetraining(true);
    setRetrainSuccess(false);
    try {
      const res = await ApiService.retrainModel();
      setRetrainSuccess(true);
      setTimeout(() => setRetrainSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRetraining(false);
    }
  };

  const simulateUpload = async (name: string, sizeStr: string, actualFile?: File) => {
    setUploadingFileName(name);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            let processedRows = Math.floor(Math.random() * 5000) + 1000;
            
            if (actualFile && isBackendConnected) {
              const res = await ApiService.uploadDataset(actualFile);
              if (res.isBackendReal) {
                processedRows = res.rows_processed;
              }
            }

            setFiles(current => [
              {
                id: (current.length + 1).toString(),
                name,
                size: sizeStr,
                type: name.includes("rainfall") || name.includes("weather") ? "Meteorological Data" : "Satellite Imagery (NDVI)",
                division: "Anuradhapura District",
                date: new Date().toISOString().substring(0, 10),
                status: "completed",
                recordsCount: processedRows
              },
              ...current
            ]);
            setUploadProgress(null);
          }, 800);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      simulateUpload(file.name, sizeStr, file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      simulateUpload(file.name, sizeStr, file);
    }
  };

  const handleDeleteFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Predictive Data Management</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
            Feed environmental parameters, weather logs, and NDVI variables to the AAIB neural risk index.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider",
            isBackendConnected === true 
              ? "bg-green-50 border-green-200 text-green-700" 
              : isBackendConnected === false 
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-gray-50 border-gray-250 text-gray-400"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isBackendConnected === true ? "bg-green-500 animate-pulse" : isBackendConnected === false ? "bg-amber-500" : "bg-gray-300"
            )} />
            {isBackendConnected === true ? "XGBoost Engine: Connected" : "Local Simulator Mode"}
          </div>

          <button 
            type="button"
            onClick={triggerRetraining}
            disabled={isRetraining}
            className="flex items-center gap-2 bg-[#1a4d2e] hover:bg-aaib-accent text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-transparent transition-all active:scale-95 disabled:opacity-50"
          >
             <Cpu size={14} className={isRetraining ? "animate-spin" : ""} />
             {isRetraining ? "Retraining weights..." : "Retrain XGBoost"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {retrainSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-bold uppercase flex items-center gap-2"
          >
            <CheckCircle2 className="text-green-600" size={16} />
            Optimization complete: XGBoost regression pipeline executed successful updates across division databases!
          </motion.div>
        )}
      </AnimatePresence>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Drag/Drop card */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden bg-white shadow-xl hover:border-aaib-green/40 hover:shadow-2xl",
              isDragging ? "border-aaib-green bg-aaib-card/20 scale-[0.99]" : "border-gray-200"
            )}
            id="dropzone"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept=".csv,.xlsx,.xls,.json" 
              className="hidden" 
            />

            <AnimatePresence mode="wait">
              {uploadProgress !== null ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-md space-y-4 pointer-events-none"
                  key="uploading"
                >
                  <div className="w-16 h-16 bg-aaib-card rounded-2xl flex items-center justify-center text-aaib-green mx-auto animate-bounce">
                     <Database size={28} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider">Parsing Dataset</h4>
                    <p className="text-[10px] text-gray-400 mt-1 truncate">{uploadingFileName}</p>
                  </div>
                  <div className="relative pt-2">
                    <div className="flex mb-1.5 items-center justify-between">
                      <span className="text-[10px] font-black text-[#1a4d2e] uppercase">Status Tracker</span>
                      <span className="text-[10px] font-black text-[#1a4d2e]">{uploadProgress}%</span>
                    </div>
                    <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-gray-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-aaib-green transition-all duration-150"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-400 italic">Validating GeoJSON coords against 22 divisions...</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 max-w-sm"
                  key="idle"
                >
                  <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center text-gray-400 mx-auto group-hover:text-aaib-green transition-colors">
                     <Upload size={28} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">Upload New Dataset</h3>
                    <p className="text-xs text-gray-500">
                      Drag and drop your spreadsheet files here, or <span className="text-aaib-green font-bold hover:underline">browse locally</span>.
                    </p>
                  </div>
                  <div className="pt-2 text-[9px] text-gray-400 font-medium leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100 uppercase tracking-wider">
                     Supports XLS, XLSX, CSV, JSON (Min. requirement: coordinates / divisional tags)
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upload Status Metrics Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100">
                   <Activity size={18} />
                </div>
                <div>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Telemetry Engine</p>
                   <p className="text-xs font-black text-gray-900">HEALTHY (100%)</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                   <CloudSun size={18} />
                </div>
                <div>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Satellite Sync</p>
                   <p className="text-xs font-black text-gray-900">SYNCED (5M AGO)</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
                   <FileSpreadsheet size={18} />
                </div>
                <div>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Division Records</p>
                   <p className="text-xs font-black text-gray-900">16,860 LOGS</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right side Upload checklist and guidance */}
        <div className="space-y-6">
           <div className="bg-[#1a4d2e] text-white rounded-2xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-yellow-400">Import Checklist</h4>
              <p className="text-xs text-white/80 leading-relaxed">
                 To ensure the neural premium engine renders high fidelity prediction coordinates, confirm that your data structure contains standard columns:
              </p>
              <ul className="space-y-2 text-[11px] text-white/90">
                 <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-yellow-400 shrink-0" />
                    <span><strong>division_name</strong> (Exact match with the 22 divisions)</span>
                 </li>
                 <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-yellow-400 shrink-0" />
                    <span><strong>precipitation_mm</strong> or <strong>ndvi_index_value</strong></span>
                 </li>
                 <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-yellow-400 shrink-0" />
                    <span><strong>yield_metric_tons</strong> (For history databases)</span>
                 </li>
                 <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-yellow-400 shrink-0" />
                    <span><strong>timestamp_utc</strong> (Formatted YYYY-MM-DD)</span>
                 </li>
              </ul>
              <div className="pt-2 border-t border-white/10 text-[10px] text-white/60">
                 The training logs are integrated with the Agricultural & Agrarian Insurance Board of Sri Lanka standard codebook.
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Help & Templates</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                 Need test data? Download empty template sheets configured specifically for Anuradhapura crop insurance calibration:
              </p>
              <div className="space-y-2.5">
                 <button className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-left text-xs font-bold text-gray-700 uppercase">
                    <span>Weather Data Template</span>
                    <span className="text-aaib-green hover:underline text-[10px]">xlsx (12KB)</span>
                 </button>
                 <button className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-left text-xs font-bold text-gray-700 uppercase">
                    <span>NDVI Index Template</span>
                    <span className="text-aaib-green hover:underline text-[10px]">csv (8KB)</span>
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Uploaded History logs table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
         <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Ingested Datasets & Calibration Ledger</h3>
              <p className="text-xs text-gray-400 font-medium">Historical trace of system updates from field centers.</p>
            </div>
            <div className="flex bg-[#cbd5e1]/30 p-1.5 rounded-lg text-xs">
               <span className="font-bold text-gray-800 bg-white px-3 py-1 rounded shadow-sm">All Files</span>
               <span className="font-bold text-gray-500 hover:text-gray-900 px-3 py-1 cursor-pointer">Completed</span>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left font-normal border-collapse">
               <thead>
                  <tr className="bg-gray-100/50 border-b border-gray-200/50">
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dataset Details</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Classification Category</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Calibrated Subdivision</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Validated Rows</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Import Date</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {files.map(file => (
                       <motion.tr 
                        key={file.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50/50 transition-colors"
                       >
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-aaib-card/30 text-[#1a4d2e] rounded-xl flex items-center justify-center border border-aaib-green/10">
                                   <FileSpreadsheet size={18} />
                                </div>
                                <div>
                                   <p className="text-xs font-black text-gray-900">{file.name}</p>
                                   <p className="text-[10px] text-gray-400 font-medium">{file.size}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-[10px] font-bold uppercase tracking-tight text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200/40">
                                {file.type}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                <MapPin size={12} className="text-gray-400" />
                                {file.division}
                             </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs font-black text-gray-900">
                             {file.recordsCount?.toLocaleString() || "Generating..."}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">
                             {file.date}
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center justify-center gap-3">
                                <button className="p-1.5 text-gray-400 hover:text-aaib-green hover:bg-gray-100 rounded-lg transition-colors" title="View schema">
                                   <Eye size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                  title="Retract file"
                                >
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </td>
                       </motion.tr>
                    ))}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>
         {files.length === 0 && (
            <div className="p-12 text-center text-gray-400 space-y-2">
               <Database className="mx-auto text-gray-300" size={40} />
               <p className="text-xs font-bold">No datasets ingested yet.</p>
               <p className="text-[11px]">Upload custom xlsx sheets to populate calculations.</p>
            </div>
         )}
      </div>
    </div>
  );
}

import { cn } from "@/src/lib/utils";
