import { 
  LayoutDashboard, 
  Upload, 
  ShieldAlert, 
  Calculator, 
  FileText, 
  Settings,
  LogOut,
  Cpu
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "upload", label: "Data Upload", icon: Upload },
    { id: "analysis", label: "Risk Analysis", icon: ShieldAlert },
    { id: "training", label: "Model Training", icon: Cpu },
    { id: "calculator", label: "Premium Calculator", icon: Calculator },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#1a4d2e] text-white flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-6">
        <h1 className="text-sm font-bold leading-tight uppercase tracking-wider opacity-90">
          Data-Driven Agricultural Insurance Premium Prediction System
        </h1>
      </div>

      <nav className="flex-1 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 transition-colors text-sm font-medium",
                isActive 
                  ? "bg-[#2d7a46] border-l-4 border-white" 
                  : "hover:bg-[#2d7a46]/50 text-white/70 hover:text-white"
              )}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10 mt-auto">
        <button 
          onClick={onLogout}
          className="flex items-center gap-4 text-white/70 hover:text-white transition-colors text-sm font-medium w-full"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
