import React, { useMemo } from "react";
import { Activity, Student } from "../types";
import { TunasKelapaIcon, TendaIcon, BintangTigaIcon } from "./Icons";
import { 
  Calendar, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Smile, 
  TrendingUp,
  MapPin,
  ClipboardCheck,
  Award
} from "lucide-react";
import { getPhotoUrl } from "../gdrive";

interface DashboardScreenProps {
  activities: Activity[];
  siswaList: Student[];
  siswiList: Student[];
  onNavigate: (screen: "INPUT_STEP1" | "REVIEW" | "GENERATE") => void;
  onViewActivityDetail: (activity: Activity) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  activities,
  siswaList,
  siswiList,
  onNavigate,
  onViewActivityDetail,
}) => {
  // Calculate stats dynamically based on activities
  const stats = useMemo(() => {
    const totalActivities = activities.length;
    
    // Average attendance for boys
    let totalSiswaPresent = 0;
    let totalSiswaPossible = 0;
    
    // Average attendance for girls
    let totalSiswiPresent = 0;
    let totalSiswiPossible = 0;

    activities.forEach((act) => {
      // Boys
      siswaList.forEach((st) => {
        totalSiswaPossible++;
        if (act.absensiSiswa[st.id]) {
          totalSiswaPresent++;
        }
      });
      // Girls
      siswiList.forEach((st) => {
        totalSiswiPossible++;
        if (act.absensiSiswi[st.id]) {
          totalSiswiPresent++;
        }
      });
    });

    const avgSiswaPercent = totalSiswaPossible > 0 
      ? Math.round((totalSiswaPresent / totalSiswaPossible) * 100) 
      : 0;
      
    const avgSiswiPercent = totalSiswiPossible > 0 
      ? Math.round((totalSiswiPresent / totalSiswiPossible) * 100) 
      : 0;

    return {
      totalActivities,
      avgSiswaPercent,
      avgSiswiPercent,
      combinedAvg: Math.round(((avgSiswaPercent + avgSiswiPercent) / 2)) || 0,
    };
  }, [activities, siswaList, siswiList]);

  // Read latest 2 activities for listing
  const latestActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .slice(0, 2);
  }, [activities]);

  return (
    <div className="space-y-5 animate-fade-in py-4 px-4 pb-10">
      {/* Scout Motto Badge (Vibe check) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pramuka-green to-[#275d46] text-white p-4 rounded-2xl shadow-sm border border-pramuka-green-light">
        <div className="absolute inset-0 scout-pattern opacity-10 pointer-events-none" />
        <div className="absolute -right-6 -bottom-12 w-20 h-20 text-white/5 rotate-12">
          <TunasKelapaIcon className="w-full h-full" />
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-pramuka-gold p-2 rounded-xl text-pramuka-green-dark shadow-md">
            <TendaIcon className="w-5 h-5 text-pramuka-green" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-pramuka-gold/20 text-pramuka-gold border border-pramuka-gold/20 font-mono px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Motto Pramuka
              </span>
              <BintangTigaIcon className="scale-75" />
            </div>
            <h3 className="font-sans font-bold text-sm tracking-tight leading-snug mt-1">
              "Satyaku Kudarmakan, Darmaku Kubaktikan"
            </h3>
            <p className="text-[10px] text-emerald-100 flex items-center gap-1 mt-0.5 font-mono italic">
              — Tri Satya Pramuka
            </p>
          </div>
        </div>
      </div>

      {/* Grid Menu: Two Main Big Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Catat Kegiatan Button */}
        <button
          onClick={() => onNavigate("INPUT_STEP1")}
          id="btn-big-catat"
          className="relative group text-left p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-pramuka-green border-pramuka-green-light hover:border-pramuka-gold dark:bg-pramuka-green-dark dark:border-pramuka-green text-white cursor-pointer active:scale-95 flex flex-col justify-between overflow-hidden"
          style={{ minHeight: "130px" }}
        >
          <div className="absolute top-0 right-0 p-3 text-pramuka-gold/20 group-hover:text-pramuka-gold/30 transition-colors pointer-events-none">
            <TunasKelapaIcon className="w-16 h-16 transform rotate-12" />
          </div>
          
          <div className="bg-white/10 p-2.5 rounded-xl w-fit border border-white/10 text-pramuka-gold">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          
          <div className="relative z-10 mt-4">
            <div className="text-[11px] uppercase font-mono tracking-wider text-pramuka-gold font-bold">Langkah 1-3</div>
            <h4 className="font-sans font-bold text-base tracking-tight leading-tight mt-0.5">Catat Kegiatan & Absensi</h4>
          </div>
        </button>

        {/* Review Data Button */}
        <button
          onClick={() => onNavigate("REVIEW")}
          id="btn-big-review"
          className="relative group text-left p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-white dark:bg-[#0f281b] border-gray-200 dark:border-pramuka-green-dark hover:border-pramuka-green text-gray-800 dark:text-gray-100 cursor-pointer active:scale-95 flex flex-col justify-between overflow-hidden"
          style={{ minHeight: "130px" }}
        >
          <div className="absolute top-0 right-0 p-3 text-pramuka-green/5 dark:text-pramuka-gold/5 group-hover:text-pramuka-green/10 transition-colors pointer-events-none">
            <Users className="w-16 h-16 transform -rotate-12" />
          </div>

          <div className="bg-pramuka-gold/10 dark:bg-pramuka-gold/20 p-2.5 rounded-xl w-fit text-pramuka-gold dark:text-pramuka-gold">
            <Users className="w-5 h-5" />
          </div>

          <div className="relative z-10 mt-4">
            <div className="text-[11px] uppercase font-mono tracking-wider text-pramuka-green dark:text-pramuka-gold font-semibold">Tabel Riwayat</div>
            <h4 className="font-sans font-bold text-base tracking-tight leading-tight mt-0.5">Review Data Kegiatan</h4>
          </div>
        </button>
      </div>

      {/* Statistics Section */}
      <div className="bg-white dark:bg-[#0d2318] p-4 rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm">
        <h3 className="font-sans font-extrabold text-[#111] dark:text-white text-[13px] uppercase tracking-wider font-mono flex items-center gap-2 mb-3.5 border-b pb-2 border-gray-100 dark:border-emerald-950/40">
          <Calendar className="w-4 h-4 text-pramuka-green dark:text-pramuka-gold" />
          Statistik Bulan Ini
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {/* Total Meetings */}
          <div className="bg-gray-50 dark:bg-[#0c2015] p-3 rounded-xl border border-gray-100 dark:border-emerald-950 text-center flex flex-col justify-center">
            <p className="text-[10px] text-gray-400 dark:text-emerald-700 font-mono uppercase tracking-wider">Pertemuan</p>
            <p className="font-mono text-xl font-black text-pramuka-green dark:text-pramuka-gold mt-1">
              {stats.totalActivities}
            </p>
            <p className="text-[9px] text-gray-400 font-medium mt-0.5">Aktif</p>
          </div>

          {/* Average Boy Attendance */}
          <div className="bg-gray-50 dark:bg-[#0c2015] p-3 rounded-xl border border-gray-100 dark:border-emerald-950 text-center flex flex-col justify-center">
            <p className="text-[10px] text-gray-400 dark:text-emerald-700 font-mono uppercase tracking-wider">Siswa (PA)</p>
            <p className="font-mono text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {stats.avgSiswaPercent}%
            </p>
            <p className="text-[9px] text-gray-400 font-medium mt-0.5">Rata-rata</p>
          </div>

          {/* Average Girl Attendance */}
          <div className="bg-gray-50 dark:bg-[#0c2015] p-3 rounded-xl border border-gray-100 dark:border-emerald-950 text-center flex flex-col justify-center">
            <p className="text-[10px] text-gray-400 dark:text-emerald-700 font-mono uppercase tracking-wider">Siswi (PI)</p>
            <p className="font-mono text-xl font-black text-pink-600 dark:text-pink-400 mt-1">
              {stats.avgSiswiPercent}%
            </p>
            <p className="text-[9px] text-gray-400 font-medium mt-0.5">Rata-rata</p>
          </div>
        </div>

        {/* Combined Attendance Health Progress Bar */}
        <div className="mt-4 bg-gray-50 dark:bg-emerald-950/10 p-3 rounded-xl border border-gray-100 dark:border-emerald-950 text-xs text-gray-600 dark:text-emerald-200">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold text-gray-400 dark:text-emerald-700 mb-1.5">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" /> Kehadiran Keseluruhan
            </span>
            <span>{stats.combinedAvg}%</span>
          </div>
          <div className="w-full bg-gray-200/50 dark:bg-emerald-950 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-pramuka-green h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.combinedAvg}%` }}
            />
          </div>
          <p className="text-[9px] mt-1.5 text-gray-400 font-normal leading-relaxed">
            *Dihitung otomatis dari absensi Pramuka Siwan (PA) dan Siswi (PI) di setiap latihan rutin bulnan.
          </p>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-sans font-extrabold text-xs uppercase tracking-wider font-mono text-gray-400 dark:text-emerald-700 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Latihan Terakhir
          </h3>
          <button 
            onClick={() => onNavigate("REVIEW")}
            className="text-[11px] font-bold text-pramuka-green dark:text-pramuka-gold hover:underline flex items-center gap-0.5"
          >
            Lihat Semua <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {latestActivities.length === 0 ? (
          <div className="bg-white dark:bg-[#0d2318] p-6 rounded-2xl text-center border border-gray-100 dark:border-emerald-950/40 text-gray-400">
            <Smile className="w-8 h-8 mx-auto text-gray-300 dark:text-emerald-800 mb-2" />
            <p className="text-xs">Belum ada kegiatan yang tercatat bulan ini.</p>
            <button
              onClick={() => onNavigate("INPUT_STEP1")}
              className="mt-2 text-xs font-bold text-pramuka-green dark:text-pramuka-gold"
            >
              Mulai Catat Sekarang →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {latestActivities.map((act) => {
              // Calculate boys and girls counts
              const presentSiswaCount = Object.values(act.absensiSiswa).filter(Boolean).length;
              const totalSiswaCount = Object.keys(act.absensiSiswa).length || 8;
              const presentSiswiCount = Object.values(act.absensiSiswi).filter(Boolean).length;
              const totalSiswiCount = Object.keys(act.absensiSiswi).length || 8;

              return (
                <div
                  key={act.id}
                  onClick={() => onViewActivityDetail(act)}
                  className="bg-white dark:bg-[#0d2318] p-3.5 rounded-2xl border border-gray-100 dark:border-emerald-950/40 hover:border-pramuka-gold dark:hover:border-pramuka-gold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-pramuka-green lg:text-teal-400 border border-emerald-100 dark:border-emerald-900 px-2.5 py-0.5 rounded-full font-bold">
                        {act.tanggal}
                      </span>
                      <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-[14px] leading-tight mt-1.5 line-clamp-1">
                        {act.materi}
                      </h4>
                      <p className="text-[11px] text-gray-400 dark:text-gray-300 line-clamp-2 mt-1 leading-normal">
                        {act.keterangan || "Latihan pramuka rutin mingguan berjalan seru."}
                      </p>
                    </div>

                    {/* Left Thumbnail Preview if any */}
                    {act.foto ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 dark:border-emerald-950 flex-shrink-0">
                        <img src={getPhotoUrl(act.foto)} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-emerald-950/20 text-gray-300 dark:text-emerald-800 flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-emerald-950/30">
                        <TendaIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Attendance Pill counts */}
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-100 dark:border-emerald-950 text-[10px] font-mono font-bold text-gray-500">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/10 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-950/30">
                      PA (Siswa): {presentSiswaCount}/{totalSiswaCount}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/10 text-pink-700 dark:text-pink-300 border border-pink-100 dark:border-pink-950/30">
                      PI (Siswi): {presentSiswiCount}/{totalSiswiCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Report Ribbon Promo */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 p-4 rounded-2xl border border-amber-200/50 dark:border-emerald-950 flex items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-pramuka-gold text-white p-2 rounded-xl">
            <Award className="w-4 h-4 text-pramuka-green-dark" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-slate-100">Cetak Laporan Bulanan</h4>
            <p className="text-gray-400 dark:text-emerald-300 text-[10px]">Generate rekap absen & PDF resmi gugus depan.</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("GENERATE")}
          className="bg-pramuka-gold text-pramuka-green-dark cursor-pointer font-bold px-3 py-1.5 rounded-xl hover:bg-amber-500 transition-colors text-[11px] shadow-sm tracking-wide"
        >
          Cetak
        </button>
      </div>
    </div>
  );
};
