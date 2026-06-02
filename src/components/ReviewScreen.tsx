import React, { useState, useMemo } from "react";
import { Activity, Student } from "../types";
import { TunasKelapaIcon, TendaIcon, BintangTigaIcon } from "./Icons";
import { 
  Search, 
  Trash2, 
  Edit3, 
  Info, 
  FileSpreadsheet, 
  X, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  Filter,
  Users,
  AlertTriangle
} from "lucide-react";
import { getPhotoUrl } from "../gdrive";

interface ReviewScreenProps {
  activities: Activity[];
  siswaList: Student[];
  siswiList: Student[];
  onDeleteActivity: (id: string) => void;
  onEditActivity: (activity: Activity) => void;
  onNavigateToGenerate: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  activities,
  siswaList,
  siswiList,
  onDeleteActivity,
  onEditActivity,
  onNavigateToGenerate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      return act.materi.toLowerCase().includes(searchQuery.toLowerCase()) || 
             act.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
             act.tanggal.includes(searchQuery);
    }).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [activities, searchQuery]);

  // Helper to format date index to Indonesian words
  const formatIndoDate = (dateStr: string) => {
    if (!dateStr) return "";
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        return `${day} ${months[monthNum - 1]} ${year}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const handleConfirmDelete = (id: string) => {
    onDeleteActivity(id);
    setActivityToDelete(null);
  };

  return (
    <div className="animate-fade-in py-4 px-4 space-y-4 pb-10">
      
      {/* Page Title & Generate Shortcut */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-sans font-black text-gray-800 dark:text-gray-100 text-base">Daftar Latihan Pramuka</h2>
            <p className="text-[11px] text-gray-400 dark:text-emerald-700">Manajemen histori kegiatan mingguan</p>
          </div>
          
          <button
            onClick={onNavigateToGenerate}
            id="btn-shortcut-generate"
            className="bg-pramuka-gold text-pramuka-green-dark cursor-pointer font-bold px-3 py-2 rounded-xl hover:bg-amber-500 transition-colors text-[11px] flex items-center gap-1 shadow-sm active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" /> Cetak Laporan
          </button>
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari materi, keterangan, atau tanggal..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#0d2318] border border-gray-200 dark:border-emerald-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
        />
      </div>

      {/* Activity List table substitute (Bento style responsive list) */}
      <div className="space-y-3 pb-12">
        {filteredActivities.length === 0 ? (
          <div className="bg-white dark:bg-[#0d2318] p-10 rounded-2xl text-center border border-gray-100 dark:border-emerald-950/40 text-gray-400">
            <TendaIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-emerald-800 mb-2" />
            <p className="text-xs font-semibold">Tidak menemukan data kegiatan.</p>
            <p className="text-[10px] text-gray-400 mt-1">Coba gunakan kata kunci pencarian yang berbeda.</p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const siswaPresent = Object.values(act.absensiSiswa).filter(Boolean).length;
            const siswaTotal = siswaList.length;
            const siswiPresent = Object.values(act.absensiSiswi).filter(Boolean).length;
            const siswiTotal = siswiList.length;
            const totalHadir = siswaPresent + siswiPresent;
            const totalKapasitas = siswaTotal + siswiTotal;

            return (
              <div
                key={act.id}
                className="bg-white dark:bg-[#0d2318] rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm overflow-hidden"
              >
                {/* Card Top Strip info */}
                <div className="p-4 flex items-start justify-between gap-3 bg-gradient-to-br from-white to-gray-50/50 dark:from-[#0d2318] dark:to-[#0c2016]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-mono font-black bg-pramuka-green dark:bg-emerald-950 border border-pramuka-green-light dark:border-emerald-900 text-white dark:text-pramuka-gold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {act.tanggal}
                      </span>
                      <span className="text-[9px] font-mono text-gray-400 dark:text-emerald-800 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {act.waktuMulai} - {act.waktuSelesai}
                      </span>
                    </div>

                    <h3 className="font-sans font-extrabold text-[#111] dark:text-white text-[14px] leading-tight mt-1">
                      {act.materi}
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {act.keterangan || "Tidak ada rincian tambahan."}
                    </p>
                  </div>

                  {/* Right Picture thumb fallback */}
                  {act.foto ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 dark:border-emerald-900 flex-shrink-0 shadow-inner">
                      <img src={getPhotoUrl(act.foto)} alt="dokumentasi" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-emerald-950/20 text-gray-350 dark:text-emerald-800 flex items-center justify-center flex-shrink-0 border border-gray-100/50 dark:border-emerald-950/20">
                      <TendaIcon className="w-[22px] h-[22px]" />
                    </div>
                  )}
                </div>

                {/* Card Stats display strip */}
                <div className="px-4 py-2.5 bg-gray-50/30 dark:bg-[#0c1f14]/50 border-t border-gray-50 dark:border-emerald-950/30 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-extrabold">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Putra: {siswaPresent}/{siswaTotal}
                    </span>
                    <span className="flex items-center gap-1 text-pink-700 dark:text-pink-400 font-extrabold">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Putri: {siswiPresent}/{siswiTotal}
                    </span>
                  </div>

                  <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                    Presensi: {Math.round((totalHadir / totalKapasitas) * 100)}%
                  </span>
                </div>

                {/* Card Bottom action strip */}
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-[#0c1f15] border-t border-gray-100 dark:border-emerald-950/40 flex items-center justify-between">
                  {/* Detailed Attendance List trigger */}
                  <button
                    onClick={() => setSelectedActivity(act)}
                    className="text-pramuka-green dark:text-pramuka-gold cursor-pointer hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" /> Lihat Daftar Hadir
                  </button>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onEditActivity(act)}
                      aria-label="Edit activity"
                      className="text-slate-500 dark:text-emerald-600 hover:text-pramuka-green dark:hover:text-pramuka-gold p-1.5 rounded-lg active:scale-95 transition-all bg-white dark:bg-[#0d2318] border border-gray-200 dark:border-emerald-950 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActivityToDelete(act.id)}
                      aria-label="Delete activity"
                      className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg active:scale-95 transition-all bg-white dark:bg-[#0d2318] border border-gray-200 dark:border-emerald-950 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Delete Confirmation Bottomsheet */}
      {activityToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-fade-in p-4">
          <div className="bg-white dark:bg-[#0d2318] w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl border border-gray-100 dark:border-emerald-900 p-5 space-y-4">
            <div className="text-center space-y-2">
              <div className="bg-rose-50 dark:bg-rose-950/20 w-12 h-12 rounded-full flex items-center justify-center text-rose-500 mx-auto border border-rose-100 dark:border-rose-950">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-black text-gray-800 dark:text-slate-100 text-base">Hapus Data Kegiatan?</h3>
              <p className="text-xs text-gray-400 dark:text-emerald-300 leading-normal">
                Tindakan ini tidak bisa dibatalkan. Histori kehadiran dan foto dokumentasi kegiatan ini akan terhapus permanen dari memori internal.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActivityToDelete(null)}
                className="flex-1 bg-gray-50 dark:bg-[#0c1f14] hover:bg-gray-100 text-gray-500 dark:text-emerald-100 py-3 text-xs font-bold rounded-xl border border-gray-200 dark:border-emerald-900 cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={() => handleConfirmDelete(activityToDelete)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Beautiful Bottom-sheet Detail Daftar Hadir */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in">
          <div className="bg-white dark:bg-[#091711] w-full max-w-md rounded-t-[28px] max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-100 dark:border-pramuka-green-dark/60 flex flex-col justify-between">
            
            {/* Modal Header */}
            <div className="relative border-b border-gray-100 dark:border-emerald-950 p-4 shrink-0 bg-pramuka-green dark:bg-pramuka-green-dark text-white rounded-t-[28px]">
              <div className="absolute inset-0 scout-pattern opacity-10 pointer-events-none" />
              
              <button
                onClick={() => setSelectedActivity(null)}
                aria-label="Close detail modal"
                className="absolute right-4 top-4 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer text-pramuka-gold border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 relative z-10">
                <span className="text-[10px] bg-pramuka-gold text-pramuka-green-dark font-mono font-bold px-2 py-0.5 rounded">
                  Detail Daftar Absensi
                </span>
                <p className="text-xs text-white/85 font-mono mt-1 pr-10">
                  {formatIndoDate(selectedActivity.tanggal)} • {selectedActivity.waktuMulai} - {selectedActivity.waktuSelesai}
                </p>
                <h3 className="font-sans font-black text-white text-base leading-tight pr-10 mt-0.5">
                  {selectedActivity.materi}
                </h3>
              </div>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {selectedActivity.keterangan && (
                <div className="bg-gray-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-gray-100 dark:border-emerald-900/40 text-xs text-slate-800 dark:text-gray-300">
                  <h4 className="font-bold text-gray-500 dark:text-emerald-400 mb-1">Catatan Latihan:</h4>
                  <p className="leading-relaxed">{selectedActivity.keterangan}</p>
                </div>
              )}

              {/* Boys and Girls list columns */}
              <div className="space-y-4">
                {/* Boys (Putra) */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider font-extrabold text-teal-700 dark:text-teal-400 flex items-center justify-between border-b pb-1 mb-2 border-teal-100 dark:border-teal-950/60">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Absen Siswa (Putra)
                    </span>
                    <span>
                      {Object.values(selectedActivity.absensiSiswa).filter(Boolean).length} Hadir
                    </span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    {siswaList.map((st) => {
                      const present = selectedActivity.absensiSiswa[st.id];
                      return (
                        <div
                          key={st.id}
                          className={`p-2 rounded-xl text-xs border flex items-center justify-between ${
                            present
                              ? "bg-teal-50/50 border-teal-200 dark:bg-teal-950/20 dark:border-teal-950 text-teal-900 dark:text-teal-300"
                              : "bg-gray-50 text-gray-400 dark:bg-emerald-950/10 dark:border-emerald-950 border-gray-100"
                          }`}
                        >
                          <div className="truncate pr-1">
                            <p className="font-bold truncate">{st.name}</p>
                            <p className="text-[9px] text-gray-400 font-mono">{st.regu}</p>
                          </div>
                          {present ? (
                            <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300 dark:text-emerald-950 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Girls (Putri) */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider font-extrabold text-pink-700 dark:text-pink-400 flex items-center justify-between border-b pb-1 mb-2 border-pink-100 dark:border-pink-950/60">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Absen Siswi (Putri)
                    </span>
                    <span>
                      {Object.values(selectedActivity.absensiSiswi).filter(Boolean).length} Hadir
                    </span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    {siswiList.map((st) => {
                      const present = selectedActivity.absensiSiswi[st.id];
                      return (
                        <div
                          key={st.id}
                          className={`p-2 rounded-xl text-xs border flex items-center justify-between ${
                            present
                              ? "bg-pink-50/50 border-pink-200 dark:bg-pink-950/20 dark:border-pink-950 text-pink-900 dark:text-pink-300"
                              : "bg-gray-50 text-gray-400 dark:bg-emerald-950/10 dark:border-emerald-950 border-gray-100"
                          }`}
                        >
                          <div className="truncate pr-1">
                            <p className="font-bold truncate">{st.name}</p>
                            <p className="text-[9px] text-gray-400 font-mono">{st.regu}</p>
                          </div>
                          {present ? (
                            <CheckCircle className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300 dark:text-emerald-950 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom buttons */}
            <div className="p-4 bg-gray-50 dark:bg-[#0c1f15] border-t border-gray-100 dark:border-emerald-950/40 shrink-0">
              <button
                onClick={() => setSelectedActivity(null)}
                className="w-full bg-pramuka-green dark:bg-pramuka-green-dark border border-pramuka-green-light hover:border-pramuka-gold text-white text-xs font-bold py-3.5 rounded-xl cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
