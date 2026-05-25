import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Navigation, 
  Info,
  Layers,
  Activity
} from "lucide-react";

interface RiskMapProps {
  selectedDivision: string;
  onSelectDivision: (name: string) => void;
}

// Map geographical center coordinates of all 22 Anuradhapura divisions
export const DIVISION_COORDINATES: Record<string, { lat: number; lng: number; risk: "Low" | "Medium" | "High"; score: number }> = {
  "Padaviya": { lat: 8.8354, lng: 80.7483, risk: "Low", score: 12 },
  "Kebitigollewa": { lat: 8.6508, lng: 80.6019, risk: "Medium", score: 45 },
  "Medawachchiya": { lat: 8.5392, lng: 80.3012, risk: "Low", score: 22 },
  "Mahawilachchiya": { lat: 8.3582, lng: 80.1481, risk: "High", score: 88 },
  "Rambewa": { lat: 8.4485, lng: 80.4998, risk: "Medium", score: 58 },
  "Kahatagasdigiliya": { lat: 8.4735, lng: 80.6860, risk: "Low", score: 15 },
  "Horowupothana": { lat: 8.5638, lng: 80.8542, risk: "High", score: 75 },
  "Nuwaragam Palatha Central": { lat: 8.3512, lng: 80.4022, risk: "Medium", score: 42 },
  "Mihintale": { lat: 8.3551, lng: 80.5055, risk: "Low", score: 35 },
  "Nuwaragam Palatha East": { lat: 8.3411, lng: 80.4288, risk: "Medium", score: 55 },
  "Nachchaduwa": { lat: 8.2612, lng: 80.4851, risk: "High", score: 82 },
  "Galenbindunuwewa": { lat: 8.2238, lng: 80.7022, risk: "Low", score: 25 },
  "Nochchiyagama": { lat: 8.2435, lng: 80.1811, risk: "Medium", score: 48 },
  "Rajanganaya": { lat: 8.1512, lng: 80.1802, risk: "High", score: 80 },
  "Thambuttegama": { lat: 8.1722, lng: 80.3011, risk: "Low", score: 18 },
  "Thalawa": { lat: 8.1402, lng: 80.2522, risk: "High", score: 78 },
  "Tirappane": { lat: 8.1835, lng: 80.5211, risk: "Medium", score: 40 },
  "Ipalogama": { lat: 8.1022, lng: 80.4435, risk: "Medium", score: 35 },
  "Galnewa": { lat: 8.0195, lng: 80.4182, risk: "High", score: 65 },
  "Kekirawa": { lat: 8.0511, lng: 80.6011, risk: "Low", score: 32 },
  "Palugaswewa": { lat: 8.0822, lng: 80.6912, risk: "Medium", score: 55 },
  "Palagala": { lat: 8.0011, lng: 80.5422, risk: "High", score: 90 }
};

export default function RiskMap({ selectedDivision, onSelectDivision }: RiskMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Helper to generate dynamic colored custom HTML div-markers
  const createMarkerIcon = (risk: "Low" | "Medium" | "High", isSelected: boolean) => {
    const color = risk === "High" ? "#dc2626" : risk === "Medium" ? "#f59e0b" : "#16a34a"; // Tailwind red-600, amber-500, green-600
    const pingColor = risk === "High" ? "bg-red-500" : risk === "Medium" ? "bg-amber-500" : "bg-green-500";
    
    // Customize scale and styling if marker is active/selected
    const isSelectedClass = isSelected 
      ? "scale-125 ring-4 ring-[#1a4d2e]/40 z-[999]" 
      : "hover:scale-110";

    const dotHtml = `
      <div class="relative flex items-center justify-center transition-all duration-300 ${isSelectedClass}">
        <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full opacity-35 ${pingColor}"></span>
        <span class="relative h-5.5 w-5.5 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white" style="background-color: ${color}">
          ${isSelected ? '<span class="h-2 w-2 rounded-full bg-white animate-pulse"></span>' : ''}
        </span>
      </div>
    `;

    return L.divIcon({
      html: dotHtml,
      className: "custom-leaflet-marker",
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center over Anuradhapura District, Sri Lanka
    const map = L.map(mapContainerRef.current, {
      center: [8.33, 80.42],
      zoom: 9.5,
      zoomControl: false, // Custom positioned zoom controls
      scrollWheelZoom: true,
      doubleClickZoom: true,
      attributionControl: true
    });

    // Add custom styled Light Cartographic basemap (CARTO Light is highly professional and minimal)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 18
    }).addTo(map);

    // Add professional zoom controls on top-left
    L.control.zoom({
      position: "topleft"
    }).addTo(map);

    mapRef.current = map;

    // Load individual division markers
    const markers: Record<string, L.Marker> = {};
    Object.entries(DIVISION_COORDINATES).forEach(([name, data]) => {
      const isSelected = name === selectedDivision;
      const markerIcon = createMarkerIcon(data.risk, isSelected);

      const marker = L.marker([data.lat, data.lng], {
        icon: markerIcon
      })
      .addTo(map)
      .bindTooltip(
        `<div class="p-2 font-sans rounded-lg shadow-sm">
           <p class="text-xs font-black text-gray-900 leading-none uppercase">${name}</p>
           <p class="text-[10px] text-gray-500 font-bold tracking-tight mt-1">RL: <span class="${data.risk === "High" ? "text-red-600 font-black" : data.risk === "Medium" ? "text-amber-500 font-black" : "text-green-600 font-black"}">${data.risk}</span> (Index: ${data.score})</p>
         </div>`,
         { 
           permanent: false, 
           direction: "top",
           className: "rounded-lg border-0 shadow-lg"
         }
      );

      // Connect marker click event to select action
      marker.on("click", () => {
        onSelectDivision(name);
      });

      markers[name] = marker;
    });

    markersRef.current = markers;

    // Adjust maps bounds carefully
    const group = L.featureGroup(Object.values(markers));
    map.fitBounds(group.getBounds().pad(0.12));

    // Cleanup Leaflet maps instance on unmount to prevent container initialization error
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Center and fly to selected division when state or manual selection updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const selectedCoords = DIVISION_COORDINATES[selectedDivision];
    if (selectedCoords) {
      // Fly to the coordinates dynamically
      map.flyTo([selectedCoords.lat, selectedCoords.lng], 11, {
        animate: true,
        duration: 1.2
      });

      // Update all markers icons to highlight active selection
      Object.entries(markersRef.current).forEach(([name, marker]: [string, any]) => {
        const data = DIVISION_COORDINATES[name];
        if (data) {
          const isSelected = name === selectedDivision;
          marker.setIcon(createMarkerIcon(data.risk, isSelected));
          
          if (isSelected) {
            marker.openTooltip();
          }
        }
      });
    }
  }, [selectedDivision]);

  // Read current active selection details
  const activeDetail = DIVISION_COORDINATES[selectedDivision] || { risk: "Low", score: 10, lat: 8.35, lng: 80.40 };

  return (
    <div className="relative w-full h-[650px] bg-slate-50 rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col">
      {/* Dynamic Header */}
      <div className="bg-[#1a4d2e] p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-white/15 rounded-lg text-white">
              <Navigation size={15} className="rotate-45" />
           </div>
           <h3 className="text-white text-xs font-black uppercase tracking-wider">
             SL-AAIB Leaflet GIS Agricultural Risk Intelligence Map
           </h3>
        </div>
        <div className="flex gap-2">
           <span className="bg-white/10 px-2.5 py-1 rounded-md text-[10px] text-white/95 font-bold uppercase tracking-wide flex items-center gap-1">
              <Layers size={10} />
              Geospatial Vector Engine
           </span>
           <span className="bg-yellow-400 px-2.5 py-1 rounded-md text-[10px] text-aaib-green font-black uppercase tracking-tight">
              Anuradhapura Pilot
           </span>
        </div>
      </div>

      {/* Map View Pane */}
      <div className="flex-1 relative">
         <div 
           id="leaflet-gis-risk-map"
           ref={mapContainerRef} 
           className="w-full h-full z-10" 
         />

        {/* Legend Panel - Left floating */}
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 z-[1000] min-w-[200px]">
          <p className="text-[10px] font-black text-gray-900 border-b border-gray-100 pb-2 mb-3 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert size={12} className="text-aaib-green" />
            Risk Classifiers
          </p>
          <div className="space-y-2.5">
            {[
              { label: "Critical Hazard (XGBoost)", color: "#dc2626", score: "> 70", bg: "bg-red-500/10" },
              { label: "Elevated Hazard (XGBoost)", color: "#f59e0b", score: "40 - 70", bg: "bg-amber-500/10" },
              { label: "Moderate Hazard (XGBoost)", color: "#16a34a", score: "< 40", bg: "bg-green-500/10" }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center shrink-0" style={{ backgroundColor: item.color }}>
                   <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-700 leading-none">{item.label}</span>
                  <span className="text-[8px] text-gray-400 font-medium tracking-tighter mt-1">Index Margin: {item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Division detail card - Right Floating */}
        <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-gray-100 z-[1000] w-[280px] animate-in slide-in-from-right-4">
           <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-black/10 shrink-0 text-base",
                activeDetail.risk === "High" ? "bg-red-600" : activeDetail.risk === "Medium" ? "bg-amber-500" : "bg-green-600"
              )}>
                 {selectedDivision.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={8} /> Active Division Point
                </p>
                <h4 className="text-base font-black text-gray-900 leading-tight truncate">{selectedDivision}</h4>
              </div>
           </div>

           <div className="space-y-2.5">
              <div className="flex justify-between items-center bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                 <span className="text-[10px] font-bold text-gray-500 uppercase">Risk Level</span>
                 <span className={cn(
                   "text-[10px] font-black uppercase px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm",
                   activeDetail.risk === "High" 
                     ? "bg-red-50 text-red-700 border border-red-200" 
                     : activeDetail.risk === "Medium" 
                       ? "bg-amber-50 text-amber-700 border border-amber-200" 
                       : "bg-green-50 text-green-700 border border-green-200"
                 )}>
                   {activeDetail.risk === "High" && <ShieldAlert size={10} />}
                   {activeDetail.risk === "Medium" && <AlertTriangle size={10} />}
                   {activeDetail.risk === "Low" && <CheckCircle2 size={10} />}
                   {activeDetail.risk}
                 </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                 <span className="text-[10px] font-bold text-gray-500 uppercase">Scoring Index</span>
                 <span className="text-sm font-black text-gray-900 font-mono">
                    {activeDetail.score} <span className="text-[9px] text-gray-400 font-bold">/100</span>
                 </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                 <span className="text-[10px] font-bold text-gray-500 uppercase">Latitude</span>
                 <span className="text-[11px] font-bold text-gray-700 font-mono">
                    {activeDetail.lat.toFixed(4)}° N
                 </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                 <span className="text-[10px] font-bold text-gray-500 uppercase">Longitude</span>
                 <span className="text-[11px] font-bold text-gray-700 font-mono">
                    {activeDetail.lng.toFixed(4)}° E
                 </span>
              </div>
           </div>

           <div className="mt-4 p-2.5 bg-green-50/60 border border-green-100 rounded-xl flex gap-2">
              <Info size={14} className="text-aaib-green shrink-0 mt-0.5" />
              <p className="text-[9px] text-aaib-green/80 font-medium leading-relaxed">
                Selecting this division on the Leaflet map automatically recalibrates the base actuarial loading values on the Premium Calculator.
              </p>
           </div>
        </div>
      </div>

      {/* Map Status Bar */}
      <div className="bg-gray-50 p-3 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-between text-[10px] font-bold text-gray-500">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="uppercase tracking-wide text-[8px] text-gray-400">Leaflet Live Tile Stream: Active</span>
            </div>
            <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
               <span className="uppercase tracking-wide text-[8px] text-gray-400">Coordinates Projector: WGS 84</span>
            </div>
         </div>
         <p className="text-[9px] text-gray-400 font-bold italic">Coordinates dynamic to divisional secretariat centers</p>
      </div>
    </div>
  );
}
