import { Bell, Search, User, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  user?: any;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userEmail = user?.email || "user@example.com";
  const displayName = user?.displayName || "AAIB Officer";
  const initials = displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 ml-64">
      <h2 className="text-xl font-bold text-gray-800">Agriculture Insurance Dashboard</h2>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#1a4d2e] outline-none w-64"
          />
        </div>

        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors text-orange-500">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 pr-3 py-2 rounded-lg transition-colors"
          >
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-500 truncate max-w-[120px]">{userEmail}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1a4d2e] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800">{displayName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
              
              <button 
                onClick={() => {
                  setShowUserMenu(false);
                  // Could add profile view here
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <User size={16} />
                View Profile
              </button>

              <button 
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout?.();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
