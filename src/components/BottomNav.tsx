import React from "react";
import { ScreenType } from "../types";
import { LayoutDashboard, Compass, CalendarRange, FileText, PlusCircle, Users } from "lucide-react";

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onStartInput: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  onStartInput,
}) => {
  return (
    <nav className="border-t transition-colors duration-300 bg-white dark:bg-[#0c2016] border-gray-200 dark:border-pramuka-green-dark/40 py-2 px-1 pb-safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        
        {/* Dashboard Tab */}
        <button
          onClick={() => onNavigate("DASHBOARD")}
          id="btn-nav-dashboard"
          className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
            currentScreen === "DASHBOARD"
              ? "text-pramuka-green dark:text-pramuka-gold font-bold scale-105"
              : "text-gray-400 dark:text-emerald-800/60 hover:text-gray-600 dark:hover:text-emerald-700"
          }`}
          style={{ minWidth: "3.6rem", minHeight: "2.8rem" }}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-wide font-medium">Beranda</span>
        </button>

        {/* Start Input Tab (Floating Main Button Style) */}
        <button
          onClick={onStartInput}
          id="btn-nav-input"
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
            currentScreen.startsWith("INPUT_")
              ? "text-pramuka-green dark:text-pramuka-gold font-bold scale-105"
              : "text-gray-400 dark:text-emerald-800/60 hover:text-gray-600 dark:hover:text-emerald-700"
          }`}
          style={{ minWidth: "3.6rem", minHeight: "2.8rem" }}
        >
          <div className="relative">
            <PlusCircle className={`w-5 h-5 shrink-0 ${currentScreen.startsWith("INPUT_") ? "text-pramuka-gold dark:text-pramuka-gold" : ""}`} />
            {/* Quick badges of step progression if currently inputting */}
            {currentScreen.startsWith("INPUT_") && (
              <span className="absolute -top-1 -right-1.5 bg-pramuka-gold dark:bg-amber-500 text-white dark:text-slate-950 font-mono text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full animate-pulse">
                {currentScreen === "INPUT_STEP1" ? "1" : currentScreen === "INPUT_STEP2" ? "2" : "3"}
              </span>
            )}
          </div>
          <span className="text-[9px] tracking-wide font-medium">Catat</span>
        </button>

        {/* Admin Panel Tab */}
        <button
          onClick={() => onNavigate("ADMIN_PANEL")}
          id="btn-nav-admin"
          className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
            currentScreen === "ADMIN_PANEL"
              ? "text-pramuka-green dark:text-pramuka-gold font-bold scale-105"
              : "text-gray-400 dark:text-emerald-800/60 hover:text-gray-600 dark:hover:text-emerald-700"
          }`}
          style={{ minWidth: "3.6rem", minHeight: "2.8rem" }}
        >
          <Users className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-wide font-medium">Admin</span>
        </button>

        {/* Review Data Tab */}
        <button
          onClick={() => onNavigate("REVIEW")}
          id="btn-nav-review"
          className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
            currentScreen === "REVIEW"
              ? "text-pramuka-green dark:text-pramuka-gold font-bold scale-105"
              : "text-gray-400 dark:text-emerald-800/60 hover:text-gray-600 dark:hover:text-emerald-700"
          }`}
          style={{ minWidth: "3.6rem", minHeight: "2.8rem" }}
        >
          <CalendarRange className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-wide font-medium">Riwayat</span>
        </button>

        {/* Generate Page Tab */}
        <button
          onClick={() => onNavigate("GENERATE")}
          id="btn-nav-generate"
          className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
            currentScreen === "GENERATE"
              ? "text-pramuka-green dark:text-pramuka-gold font-bold scale-105"
              : "text-gray-400 dark:text-emerald-800/60 hover:text-gray-600 dark:hover:text-emerald-700"
          }`}
          style={{ minWidth: "3.6rem", minHeight: "2.8rem" }}
        >
          <FileText className="w-5 h-5 shrink-0" />
          <span className="text-[9px] tracking-wide font-medium">Laporan</span>
        </button>
      </div>
    </nav>
  );
};
