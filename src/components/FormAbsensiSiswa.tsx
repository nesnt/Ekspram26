import React, { useState, useMemo } from "react";
import { Student } from "../types";
import { TunasKelapaIcon } from "./Icons";
import { Check, ClipboardList, Search, UserCheck, Users, ArrowRight, ArrowLeft } from "lucide-react";

interface FormAbsensiSiswaProps {
  step: 2 | 3;
  students: Student[];
  attendance: { [studentId: string]: boolean };
  onToggleAttendance: (studentId: string) => void;
  onSetAllAttendance: (status: boolean) => void;
  onBack: () => void;
  onNext: () => void; // For step 2 to 3
  onSave: () => void; // For step 3 saves the activity
}

export const FormAbsensiSiswa: React.FC<FormAbsensiSiswaProps> = ({
  step,
  students,
  attendance,
  onToggleAttendance,
  onSetAllAttendance,
  onBack,
  onNext,
  onSave,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PRESENT" | "ABSENT">("ALL");

  const totalStudents = students.length;
  const presentCount = useMemo(() => {
    return students.filter(student => attendance[student.id]).length;
  }, [students, attendance]);

  // Handle Search and Filter
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          st.regu.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchSearch) return false;
      
      const isPresent = !!attendance[st.id];
      if (filterType === "PRESENT") return isPresent;
      if (filterType === "ABSENT") return !isPresent;
      
      return true;
    });
  }, [students, attendance, searchQuery, filterType]);

  return (
    <div className="animate-fade-in py-4 px-4 space-y-4 pb-10">
      {/* Step Header */}
      <div className="bg-white dark:bg-[#0c1f14] p-3.5 rounded-2xl border border-gray-100 dark:border-pramuka-green-dark flex items-center justify-between shadow-sm">
        <div>
          <h2 className="font-sans font-black text-gray-800 dark:text-gray-100 text-base">
            {step === 2 ? "Absensi Siswa (Putra)" : "Absensi Siswi (Putri)"}
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-emerald-700">
            Langkah {step} dari 3: {step === 2 ? "Regu Putra (PA)" : "Regu Putri (PI)"}
          </p>
        </div>

        {/* Step progress dots */}
        <div className="flex gap-1.5 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-pramuka-green dark:bg-emerald-800" />
          <span className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? "w-5 bg-pramuka-gold" : "w-2 bg-pramuka-green"}`} />
          <span className={`h-2 rounded-full transition-all duration-300 ${step === 3 ? "w-5 bg-pramuka-gold" : "w-2 bg-gray-200 dark:bg-emerald-950"}`} />
        </div>
      </div>

      {/* Scout Attendance Statistics Quick Info */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-emerald-950/20 dark:to-teal-950/10 p-4 rounded-2xl border border-teal-100 dark:border-emerald-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 dark:bg-teal-700 text-white p-2.5 rounded-xl shadow-md">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-slate-100 text-xs">Rekapitulasi Kehadiran</h4>
            <p className="font-mono text-[14px] text-teal-700 dark:text-teal-400 font-extrabold mt-0.5">
              {presentCount} dari {totalStudents} Hadir <span className="text-[10px] text-gray-400 dark:text-emerald-500 font-normal">({totalStudents === 0 ? "0" : Math.round((presentCount / totalStudents) * 100)}%)</span>
            </p>
          </div>
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onSetAllAttendance(true)}
            className="bg-white dark:bg-emerald-900 text-teal-700 dark:text-teal-300 hover:bg-emerald-50 dark:hover:bg-emerald-800 border border-teal-200 dark:border-emerald-700 py-1.5 px-3 rounded-lg text-[10px] font-bold cursor-pointer active:scale-95 transition-all"
          >
            Hadir Semua
          </button>
          <button
            type="button"
            onClick={() => onSetAllAttendance(false)}
            className="bg-gray-100 dark:bg-emerald-950 text-gray-500 dark:text-gray-400 border border-transparent py-1.5 px-3 rounded-lg text-[10px] font-bold cursor-pointer active:scale-95 transition-all"
          >
            Absen Semua
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama anggota atau regu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0d2318] border border-gray-200 dark:border-emerald-900 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
          />
        </div>

        {/* Tabs of category: All, Present, Empty */}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer transition-colors ${
              filterType === "ALL"
                ? "bg-pramuka-green dark:bg-pramuka-gold text-white dark:text-slate-950"
                : "bg-gray-100 dark:bg-[#0c1f14] text-gray-500 dark:text-emerald-600 border border-gray-200 dark:border-emerald-950"
            }`}
          >
            Semua ({totalStudents})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("PRESENT")}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer transition-colors ${
              filterType === "PRESENT"
                ? "bg-teal-600 dark:bg-teal-500 text-white"
                : "bg-gray-100 dark:bg-[#0c1f14] text-gray-500 dark:text-emerald-600 border border-gray-200 dark:border-emerald-950"
            }`}
          >
            Hadir ({presentCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("ABSENT")}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer transition-colors ${
              filterType === "ABSENT"
                ? "bg-rose-600 dark:bg-rose-500 text-white"
                : "bg-gray-100 dark:bg-[#0c1f14] text-gray-500 dark:text-emerald-600 border border-gray-200 dark:border-emerald-950"
            }`}
          >
            Absen ({totalStudents - presentCount})
          </button>
        </div>
      </div>

      {/* Student List in grid layout (Optimized for Mobile view with beautiful cards) */}
      <div className="bg-white dark:bg-[#0d2318] p-4 rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <ClipboardList className="w-8 h-8 mx-auto opacity-30 mb-1" />
            <p className="text-xs">Tidak ada anggota pramuka yang cocok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
            {filteredStudents.map((st) => {
              const isPresent = !!attendance[st.id];
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onToggleAttendance(st.id)}
                  className={`p-2.5 rounded-xl text-left border cursor-pointer active:scale-95 transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                    isPresent
                      ? "bg-teal-50/70 border-teal-500 dark:bg-teal-950/20 dark:border-teal-500 text-teal-900 dark:text-teal-200"
                      : "bg-gray-50 dark:bg-emerald-950/10 border-gray-100 dark:border-[#1c382a] text-gray-800 dark:text-gray-300 hover:border-gray-200"
                  }`}
                  style={{ minHeight: "75px" }}
                >
                  {/* Watermark indicators */}
                  {isPresent && (
                    <div className="absolute right-2 top-2 bg-teal-500 text-white rounded-full p-0.5 animate-bounce shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div>
                    <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      isPresent 
                        ? "bg-teal-100/50 border-teal-400 text-teal-800 dark:bg-teal-950 dark:text-teal-400" 
                        : "bg-gray-100 border-gray-200 text-gray-400 dark:bg-emerald-950 dark:border-emerald-900"
                    }`}>
                      {st.regu}
                    </span>
                    <h4 className="font-sans font-extrabold text-[12px] tracking-tight leading-tight mt-1 px-0.5 line-clamp-1">
                      {st.name}
                    </h4>
                  </div>

                  <p className="text-[9px] font-semibold mt-1.5 font-mono text-gray-400 dark:text-emerald-800">
                    Tap untuk: {isPresent ? "Absen" : "Hadir"}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Buttons progression */}
      <div className="flex gap-3 pt-2 pb-12">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-50 dark:bg-[#0c1f14] hover:bg-gray-105 text-gray-600 dark:text-emerald-100 border border-gray-200 dark:border-emerald-900 rounded-xl py-3 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        {step === 2 ? (
          <button
            type="button"
            onClick={onNext}
            className="flex-1 bg-pramuka-green dark:bg-pramuka-green-dark text-white border border-pramuka-green-light hover:border-pramuka-gold rounded-xl py-3 text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer shadow-md"
          >
            Lanjut ke Siswi <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSave}
            className="flex-1 bg-pramuka-gold text-pramuka-green-dark border-2 border-pramuka-gold hover:bg-amber-500 rounded-xl py-3 text-xs font-black flex items-center justify-center gap-1 cursor-pointer shadow-md pulse-active"
          >
            <Check className="w-4 h-4 stroke-[3]" /> Simpan Laporan
          </button>
        )}
      </div>
    </div>
  );
};
