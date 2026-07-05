import React from "react";
import { TunasKelapaIcon } from "./Icons";
import { Sun, Moon, Sparkles, LogOut, User, ShieldCheck, ClipboardList } from "lucide-react";
import { UserRole } from "../types";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  gugusDepan?: string;
  loggedInUser: string | null;
  currentUserRole: UserRole;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  gugusDepan = "Gugus Depan 25049 - 25050",
  loggedInUser,
  currentUserRole,
  onLogout,
}) => {
  return (
    <header className="relative overflow-hidden border-b transition-colors duration-300 bg-pramuka-green text-white border-pramuka-green-dark p-4 shadow-md">
      {/* Visual texture background */}
      <div className="absolute inset-0 pointer-events-none scout-pattern opacity-10" />
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-pramuka-gold rounded-full opacity-10 filter blur-lg" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/10 p-1.5 rounded-full backdrop-blur-sm border border-white/20 shadow-inner text-pramuka-gold flex items-center justify-center">
            <TunasKelapaIcon className="w-8 h-8 " />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-sans font-extrabold text-lg tracking-tight leading-none text-white">
                SiGAP <span className="text-pramuka-gold">13</span>
              </h1>
              <Sparkles className="w-3.5 h-3.5 text-pramuka-gold animate-bounce" />
            </div>
            <p className="text-[10px] text-white/80 font-mono tracking-wider mt-0.5 uppercase">
              {gugusDepan}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            id="toggle-dark-mode"
            aria-label="Toggle Theme"
            className="relative p-2 rounded-xl transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 text-pramuka-gold focus:outline-none focus:ring-2 focus:ring-pramuka-gold cursor-pointer"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-pramuka-gold shrink-0 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-white shrink-0" />
            )}
          </button>

          {/* Logout Action */}
          {loggedInUser && (
            <button
              onClick={onLogout}
              id="btn-header-logout"
              title="Keluar Akun"
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 transition-all cursor-pointer flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Ribbon Banner for base info */}
      <div className="mt-2.5 flex items-center justify-between px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] text-emerald-100">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-pramuka-gold animate-pulse" />
          <span>SMKN 13 Bandung</span>
        </div>
        {loggedInUser && (
          <div className="flex items-center gap-1.5">
            <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
              currentUserRole === "PEMBINA"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
            }`}>
              {currentUserRole === "PEMBINA"
                ? <><ShieldCheck className="w-2.5 h-2.5" /> Pembina</>
                : <><ClipboardList className="w-2.5 h-2.5" /> Krani</>
              }
            </span>
            <span className="font-mono text-[10px] bg-white/10 px-1.5 py-0.2 rounded text-pramuka-gold capitalize flex items-center gap-1">
              <User className="w-3 h-3" /> Kak {loggedInUser}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
