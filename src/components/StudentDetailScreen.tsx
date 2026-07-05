import React, { useState, useMemo } from "react";
import { Student, Activity } from "../types";
import { TunasKelapaIcon } from "./Icons";
import {
  ArrowLeft,
  User,
  BookOpen,
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Calendar,
  BarChart2,
  Clock,
} from "lucide-react";

interface StudentDetailScreenProps {
  student: Student;
  activities: Activity[];
  onNavigateBack: () => void;
}

const INDONESIAN_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const StudentDetailScreen: React.FC<StudentDetailScreenProps> = ({
  student,
  activities,
  onNavigateBack,
}) => {
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const currentTahun = String(now.getFullYear());

  const isPi = student.type === "SISWI";

  // All activities where this student is in the absensi map
  const allStudentActivities = useMemo(() => {
    return activities.filter((act) => {
      const map = isPi ? act.absensiSiswi : act.absensiSiswa;
      return map[student.id] !== undefined;
    });
  }, [activities, student, isPi]);

  // Filtered by selected month + current year
  const filteredActivities = useMemo(() => {
    return allStudentActivities
      .filter((act) => {
        const parts = act.tanggal.split("-");
        return parts[0] === currentTahun && parts[1] === selectedBulan;
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [allStudentActivities, selectedBulan, currentTahun]);

  // Stats for selected period
  const stats = useMemo(() => {
    const total = filteredActivities.length;
    const hadir = filteredActivities.filter((act) => {
      const map = isPi ? act.absensiSiswi : act.absensiSiswa;
      return map[student.id] === true;
    }).length;
    const alfa = total - hadir;
    const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, alfa, pct };
  }, [filteredActivities, student, isPi]);

  // Overall all-time stats
  const overallStats = useMemo(() => {    const total = allStudentActivities.length;
    const hadir = allStudentActivities.filter((act) => {
      const map = isPi ? act.absensiSiswi : act.absensiSiswa;
      return map[student.id] === true;
    }).length;
    const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, alfa: total - hadir, pct };
  }, [allStudentActivities, student, isPi]);

  // Accent colors based on gender
  const accentColor = isPi
    ? "text-pink-600 dark:text-pink-400"
    : "text-teal-600 dark:text-teal-400";
  const accentBg = isPi
    ? "bg-pink-600"
    : "bg-teal-600";
  const accentBorder = isPi
    ? "border-pink-200 dark:border-pink-950"
    : "border-teal-200 dark:border-teal-950";
  const accentLight = isPi
    ? "bg-pink-50 dark:bg-pink-950/20"
    : "bg-teal-50 dark:bg-teal-950/20";

  return (
    <div className="animate-fade-in py-4 px-4 space-y-4 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-emerald-950/40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateBack}
            className="bg-gray-100 dark:bg-[#0c1f14] hover:bg-gray-200 text-gray-500 dark:text-emerald-100 border border-gray-200 dark:border-emerald-900 p-1.5 rounded-xl cursor-pointer active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-sans font-black text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-pramuka-gold" />
              Statistik Kehadiran
            </h2>
            <p className="text-[10px] text-gray-400 dark:text-emerald-700 font-mono">Detail rekap per anggota</p>
          </div>
        </div>
      </div>

      {/* Student Identity Card */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${isPi ? "from-pink-600 to-pink-700" : "from-teal-600 to-teal-700"} text-white p-4 rounded-2xl shadow-md border ${isPi ? "border-pink-500" : "border-teal-500"}`}>
        <div className="absolute -right-4 -bottom-8 w-24 h-24 opacity-10 pointer-events-none">
          <TunasKelapaIcon className="w-full h-full" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-white/20 border border-white/30 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-sans font-black text-white text-base leading-tight truncate">
              {student.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] bg-white/20 border border-white/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                {isPi ? "PI (Putri)" : "PA (Putra)"}
              </span>
              <span className="text-[10px] text-white/80 font-mono">{student.regu}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <BookOpen className="w-3 h-3 text-white/70" />
              <span className="text-[10px] text-white/80 font-mono">{student.kelas}</span>
            </div>
          </div>
        </div>

        {/* All-time summary pill */}
        <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between">
          <span className="text-[10px] text-white/70 font-mono uppercase tracking-wider">Total Keseluruhan</span>
          <div className="flex items-center gap-3 text-xs font-mono font-bold">
            <span className="text-white">{overallStats.hadir}/{overallStats.total} hadir</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-white">{overallStats.pct}%</span>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="bg-white dark:bg-[#0d2318] p-3.5 rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm">
        <p className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400 dark:text-emerald-700 mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Filter Periode
        </p>
        <div>
          <label className="text-[10px] font-bold text-gray-400 dark:text-emerald-400 block mb-1">Bulan</label>
          <select
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-950 rounded-xl px-2.5 py-2 text-xs text-gray-800 dark:text-gray-100 focus:outline-none cursor-pointer"
          >
            {INDONESIAN_MONTHS.map((nama, idx) => (
              <option key={idx} value={String(idx + 1).padStart(2, "0")}>
                {nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Period Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-[#0d2318] p-3 rounded-xl border border-gray-100 dark:border-emerald-950/40 text-center">
          <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">Pertemuan</p>
          <p className={`font-mono text-xl font-black mt-1 text-pramuka-green dark:text-pramuka-gold`}>{stats.total}</p>
          <p className="text-[9px] text-gray-400 mt-0.5">bulan ini</p>
        </div>
        <div className={`bg-white dark:bg-[#0d2318] p-3 rounded-xl border ${accentBorder} text-center`}>
          <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">Hadir</p>
          <p className={`font-mono text-xl font-black mt-1 ${accentColor}`}>{stats.hadir}</p>
          <p className="text-[9px] text-gray-400 mt-0.5">kali hadir</p>
        </div>
        <div className="bg-white dark:bg-[#0d2318] p-3 rounded-xl border border-rose-100 dark:border-rose-950/40 text-center">
          <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">Alfa</p>
          <p className="font-mono text-xl font-black mt-1 text-rose-500 dark:text-rose-400">{stats.alfa}</p>
          <p className="text-[9px] text-gray-400 mt-0.5">tidak hadir</p>
        </div>
      </div>

      {/* Attendance Percentage Bar */}
      <div className={`${accentLight} p-4 rounded-2xl border ${accentBorder}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {stats.pct >= 75
              ? <TrendingUp className={`w-4 h-4 ${accentColor}`} />
              : <TrendingDown className="w-4 h-4 text-rose-500" />
            }
            <span className="text-[11px] font-bold font-mono text-gray-600 dark:text-emerald-200 uppercase tracking-wider">
              Tingkat Kehadiran
            </span>
          </div>
          <span className={`font-mono font-black text-lg ${stats.pct >= 75 ? accentColor : "text-rose-500"}`}>
            {stats.pct}%
          </span>
        </div>
        <div className="w-full bg-gray-200/60 dark:bg-emerald-950 h-3 rounded-full overflow-hidden">
          <div
            className={`${accentBg} h-full rounded-full transition-all duration-700`}
            style={{ width: `${stats.pct}%` }}
          />
        </div>
        <p className="text-[9px] text-gray-400 dark:text-emerald-700 mt-1.5 font-mono">
          {stats.pct >= 75
            ? "✓ Kehadiran memenuhi syarat minimum (≥75%)"
            : "⚠ Kehadiran di bawah syarat minimum (75%)"
          }
        </p>
      </div>

      {/* Per-Activity Detail List */}
      <div className="bg-white dark:bg-[#0d2318] rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm overflow-hidden">
        <div className="p-3 border-b border-gray-100 dark:border-emerald-950/40 flex justify-between items-center">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400 dark:text-emerald-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Riwayat Kegiatan ({filteredActivities.length})
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400">Status</span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-10 text-gray-400 space-y-1">
            <Award className="w-8 h-8 mx-auto opacity-20" />
            <p className="text-xs">Belum ada kegiatan pada periode ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-emerald-950/40">
            {filteredActivities.map((act) => {
              const map = isPi ? act.absensiSiswi : act.absensiSiswa;
              const isHadir = map[student.id] === true;
              return (
                <div
                  key={act.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-[#0c1f14]/50 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="font-sans font-bold text-gray-800 dark:text-gray-100 text-xs truncate">
                      {act.materi}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-pramuka-green dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 px-2 py-0.5 rounded-full font-bold">
                        {act.tanggal}
                      </span>
                      <span>{act.waktuMulai} – {act.waktuSelesai}</span>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 ${
                    isHadir
                      ? `${accentLight} ${accentColor} border ${accentBorder}`
                      : "bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-950/50"
                  }`}>
                    {isHadir
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> Hadir</>
                      : <><XCircle className="w-3.5 h-3.5" /> Alfa</>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Award badge if 100% */}
      {stats.total > 0 && stats.pct === 100 && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 p-4 rounded-2xl border border-amber-200/50 dark:border-emerald-950 flex items-center gap-3">
          <div className="bg-pramuka-gold text-white p-2 rounded-xl shrink-0">
            <Award className="w-5 h-5 text-pramuka-green-dark" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-800 dark:text-slate-100">Kehadiran Sempurna!</h4>
            <p className="text-[10px] text-gray-400 dark:text-emerald-300">
              {student.name} hadir di semua kegiatan bulan {INDONESIAN_MONTHS[parseInt(selectedBulan, 10) - 1]} {currentTahun}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
