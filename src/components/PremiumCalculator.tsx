import { useState } from "react";

interface PremiumCalculatorProps {
  selectedDivision: string;
  onSelectDivision: (name: string) => void;
}

export default function PremiumCalculator({ selectedDivision, onSelectDivision }: PremiumCalculatorProps) {
  const [district, setDistrict] = useState("Anuradhapura");
  const [crop, setCrop] = useState("Paddy");
  const [area, setArea] = useState("25");
  const [coverage, setCoverage] = useState("50");
  const [prediction, setPrediction] = useState<{ risk: string, premium: string } | null>(null);

  const handleCalculate = () => {
    // Mock calculation
    setPrediction({
      risk: "78 (High)",
      premium: "LKR 18,500"
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-[#d1e2d4] px-4 py-2 border-b border-gray-200">
        <h3 className="text-xs font-bold text-[#1a4d2e] uppercase tracking-wider">Premium Calculator</h3>
      </div>
      
      <div className="p-6 space-y-5">
        <h4 className="text-lg font-bold text-gray-800">Calculate Premium</h4>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Select District</label>
            <select 
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a4d2e] outline-none"
            >
              <option>Anuradhapura</option>
              <option>Polonnaruwa</option>
              <option>Kurunegala</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Select Division</label>
            <select 
              value={selectedDivision}
              onChange={(e) => onSelectDivision(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a4d2e] outline-none"
            >
              <option>Thalawa</option>
              <option>Padaviya</option>
              <option>Kebitigollewa</option>
              <option>Medawachchiya</option>
              <option>Mahawilachchiya</option>
              <option>Rambewa</option>
              <option>Kahatagasdigiliya</option>
              <option>Horowupothana</option>
              <option>Nuwaragam Palatha Central</option>
              <option>Mihintale</option>
              <option>Nuwaragam Palatha East</option>
              <option>Nachchaduwa</option>
              <option>Nochchiyagama</option>
              <option>Rajanganaya</option>
              <option>Thambuttegama</option>
              <option>Tirappane</option>
              <option>Galenbindunuwewa</option>
              <option>Ipalogama</option>
              <option>Galnewa</option>
              <option>Kekirawa</option>
              <option>Palugaswewa</option>
              <option>Palagala</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Crop Type</label>
            <select 
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a4d2e] outline-none"
            >
              <option>Paddy</option>
              <option>Maize</option>
              <option>Chilli</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Insured Area (Acres)</label>
            <input 
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Enter acreage"
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a4d2e] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Coverage Level (%)</label>
            <input 
              type="number"
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
              placeholder="e.g. 50"
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a4d2e] outline-none"
            />
          </div>

          <button 
            onClick={handleCalculate}
            className="w-full py-3 bg-[#1a4d2e] hover:bg-[#2d7a46] text-white rounded-lg font-bold text-sm transition-colors mt-2 uppercase tracking-wide"
          >
            Generate Premium Prediction
          </button>
        </div>

        {prediction && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">Predicted Divisional Risk:</span>
              <span className="text-sm font-bold text-red-600">{prediction.risk}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">Calculated Premium:</span>
              <span className="text-sm font-bold text-gray-900">{prediction.premium}</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 mt-2">
              <input type="checkbox" id="human-in-loop" defaultChecked className="accent-[#1a4d2e]" />
              <label htmlFor="human-in-loop" className="text-xs font-medium text-gray-600">Manual Adjust (Human-in-the-Loop)</label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
