import React, { useState, useMemo } from "react";
import { Activity, Student } from "../types";
import { TunasKelapaIcon, TendaIcon, BintangTigaIcon } from "./Icons";
import { 
  Download, 
  Share2, 
  CheckCircle, 
  Printer, 
  Calendar, 
  Award, 
  CheckSquare, 
  Clock, 
  FileText, 
  Search,
  Sparkles,
  RefreshCw,
  Mail,
  Send,
  BookOpen,
  X
} from "lucide-react";

interface GenerateScreenProps {
  activities: Activity[];
  siswaList: Student[];
  siswiList: Student[];
}

export const GenerateScreen: React.FC<GenerateScreenProps> = ({
  activities,
  siswaList,
  siswiList,
}) => {
  const [selectedBulan, setSelectedBulan] = useState("05"); // default May as mock activities are in May
  const [selectedTahun, setSelectedTahun] = useState("2026");
  const [pembinaName, setPembinaName] = useState("Kak Heru Wijaya, S.Pd., L.T.");
  const [kamabigusName, setKamabigusName] = useState("Drs. H. Mulyadi, M.Pd. (Kepala Sekolah)");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Month words in Indonesian
  const namaBulanMap: { [key: string]: string } = {
    "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
    "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
    "09": "September", "10": "Oktober", "11": "November", "12": "Desember"
  };

  // Filter activities for selected month & year
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const parts = act.tanggal.split("-"); // YYYY-MM-DD
      if (parts.length === 3) {
        return parts[0] === selectedTahun && parts[1] === selectedBulan;
      }
      return false;
    }).sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  }, [activities, selectedBulan, selectedTahun]);

  // Compute stats for selected month
  const reportStats = useMemo(() => {
    const totalMeetings = filteredActivities.length;
    let totalSiswaPossible = 0;
    let totalSiswaPresent = 0;
    let totalSiswiPossible = 0;
    let totalSiswiPresent = 0;

    filteredActivities.forEach((act) => {
      siswaList.forEach((st) => {
        totalSiswaPossible++;
        if (act.absensiSiswa[st.id]) totalSiswaPresent++;
      });
      siswiList.forEach((st) => {
        totalSiswiPossible++;
        if (act.absensiSiswi[st.id]) totalSiswiPresent++;
      });
    });

    const avgSiswa = totalSiswaPossible > 0 ? Math.round((totalSiswaPresent / totalSiswaPossible) * 100) : 0;
    const avgSiswi = totalSiswiPossible > 0 ? Math.round((totalSiswiPresent / totalSiswiPossible) * 100) : 0;
    const avgCombined = Math.round((avgSiswa + avgSiswi) / 2) || 0;

    const totalHadir = totalSiswaPresent + totalSiswiPresent;
    const totalMaksimal = totalSiswaPossible + totalSiswiPossible;

    return {
      totalMeetings,
      avgSiswa,
      avgSiswi,
      avgCombined,
      totalHadir,
      totalMaksimal
    };
  }, [filteredActivities, siswaList, siswiList]);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <div className="animate-fade-in py-4 px-4 space-y-4 pb-10">
      {/* Title */}
      <div>
        <h2 className="font-sans font-black text-gray-800 dark:text-gray-100 text-base">Generate Laporan Bulanan</h2>
        <p className="text-[11px] text-gray-400 dark:text-emerald-700">Ekspor rekap absen & kegiatan resmi pramuka</p>
      </div>

      {/* Select Period Dropdowns */}
      <div className="bg-white dark:bg-[#0d2318] p-4 rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-gray-500 dark:text-emerald-300 block mb-1">
            Pilih Bulan
          </label>
          <select
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-950 rounded-xl px-2.5 py-2 text-xs text-gray-800 dark:text-gray-100 cursor-pointer focus:outline-none"
          >
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-500 dark:text-emerald-300 block mb-1">
            Pilih Tahun
          </label>
          <select
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
            className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-950 rounded-xl px-2.5 py-2 text-xs text-gray-800 dark:text-gray-100 cursor-pointer focus:outline-none"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Executive Report Summary Panel */}
      <div className="bg-white dark:bg-[#0d2318] p-4 rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm space-y-3.5">
        <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-gray-400 dark:text-emerald-700 flex items-center gap-1.5 border-b pb-2 border-gray-100 dark:border-emerald-950/40">
          <Award className="w-4 h-4 text-pramuka-gold" />
          Ringkasan Laporan — {namaBulanMap[selectedBulan]} {selectedTahun}
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100/30 dark:border-emerald-900/60">
            <span className="text-[10px] text-gray-400 dark:text-emerald-400 font-mono uppercase">Total Kegiatan</span>
            <p className="font-mono text-lg font-black text-pramuka-green dark:text-pramuka-gold mt-0.5">
              {reportStats.totalMeetings} Latihan
            </p>
          </div>

          <div className="bg-teal-50/50 dark:bg-teal-950/20 p-3 rounded-xl border border-teal-100/30 dark:border-teal-900/60">
            <span className="text-[10px] text-gray-400 dark:text-teal-400 font-mono uppercase">Rerata Presensi</span>
            <p className="font-mono text-lg font-black text-teal-600 dark:text-teal-400 mt-0.5">
              {reportStats.avgCombined}%
            </p>
          </div>
        </div>

        {/* Input Officers Signature config */}
        <div className="space-y-2 pt-1 border-t border-gray-50 dark:border-emerald-950/30">
          <div>
            <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Nama Pembina Pramuka (Tanda Tangan)</label>
            <input
              type="text"
              value={pembinaName}
              onChange={(e) => setPembinaName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-950 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Nama Kamabigus / Kepsek</label>
            <input
              type="text"
              value={kamabigusName}
              onChange={(e) => setKamabigusName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-950 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* High-Fidelity Mini Print Preview Card (looks exactly like the resulting PDF sheet!) */}
      <div className="bg-white p-5 rounded-2xl border-2 border-emerald-900 border-dashed text-slate-800 shadow-lg relative overflow-hidden dark:text-slate-800">
        {/* Coconut watermark shadow */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-[0.03] select-none pointer-events-none transform scale-150">
          <TunasKelapaIcon className="w-56 h-56 text-pramuka-green" />
        </div>

        {/* Mini Preview Sticker */}
        <div className="absolute right-0 top-0 bg-pramuka-gold text-slate-950 text-[9px] font-mono font-black py-1 px-3.5 uppercase tracking-wider rounded-bl-xl shadow-sm z-15 flex items-center gap-1">
          <Sparkles className="w-3 h-3 animate-spin-slow" /> Preview Laporan Cetak
        </div>

        {/* Formal Kop Lapor */}
        <div className="border-b-2 border-slate-950 pb-2.5 text-center relative z-10">
          <div className="flex justify-center mb-1">
            <TunasKelapaIcon className="w-7 h-7 text-emerald-900" />
          </div>
          <h4 className="font-serif font-extrabold text-[12px] uppercase leading-none tracking-tight">
            Gerakan Pramuka Indonesia
          </h4>
          <p className="text-[10px] font-bold font-serif uppercase tracking-wide mt-1 leading-none">
            Gugus Depan 11.025 - 11.026 - Pangkalan SMPN Merdeka
          </p>
          <p className="text-[8px] font-mono text-gray-500 uppercase mt-1 leading-none">
            REKAPITULASI LAPORAN BULANAN • PERIODE {namaBulanMap[selectedBulan]} {selectedTahun}
          </p>
        </div>

        {/* Mini Report Document Body */}
        <div className="py-3 text-[10px] leading-relaxed relative z-10 space-y-3.5">
          <div>
            <p className="font-semibold text-slate-800 text-[11px]">
              Telah diselenggarakan latihan rutin dengan rincian kegiatan sebagai berikut:
            </p>
          </div>

          {/* Table list simulation inside doc */}
          {filteredActivities.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-gray-200 text-gray-400 text-[9px]">
              *Tidak ada kegiatan latihan rutin tercatat pada periode bulan ini.
            </div>
          ) : (
            <div className="border border-slate-950 rounded overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-mono text-[8px] border-b border-slate-950">
                    <th className="p-1 border-r border-slate-950">Tgl</th>
                    <th className="p-1 border-r border-slate-950">Materi</th>
                    <th className="p-1 text-center">Kehadiran (PA/PI)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((act) => {
                    const pa = Object.values(act.absensiSiswa).filter(Boolean).length;
                    const pi = Object.values(act.absensiSiswi).filter(Boolean).length;
                    return (
                      <tr key={act.id} className="border-b border-slate-300 last:border-0 font-sans text-[8px]">
                        <td className="p-1 border-r border-slate-950 font-mono font-bold">{act.tanggal.substring(5)}</td>
                        <td className="p-1 border-r border-slate-950 truncate max-w-[120px] font-semibold">{act.materi}</td>
                        <td className="p-1 text-center font-mono">{pa} L / {pi} P</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Abstract signatures at footer */}
          <div className="grid grid-cols-2 text-center text-[8px] font-sans pt-3 border-t border-slate-200 gap-4 mt-2">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold underline mt-8 truncate">{pembinaName}</p>
              <p className="text-gray-400">Pembina Gugusdepan</p>
            </div>
            <div>
              <p>Menyetujui,</p>
              <p className="font-bold underline mt-8 truncate">{kamabigusName}</p>
              <p className="text-gray-400">Kamabigus / Kepala Sekolah</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Print / Download Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={handleDownload}
          id="btn-print-download"
          disabled={isDownloading}
          className="bg-pramuka-green dark:bg-pramuka-green-dark border border-pramuka-green-light hover:border-pramuka-gold text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-md active:scale-95 disabled:opacity-50"
        >
          {isDownloading ? (
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Memroses...</span>
            </div>
          ) : (
            <>
              <Download className="w-4 h-4 shrink-0" />
              <span>Download PDF</span>
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          id="btn-print-share"
          className="bg-white dark:bg-[#0c1f14] border border-gray-200 dark:border-emerald-900 text-gray-700 dark:text-emerald-100 font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-emerald-950/20 active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>Bagikan Laporan</span>
        </button>
      </div>

      {/* Web Printer Action banner if they are on a desktop */}
      <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/40 p-3.5 rounded-2xl flex items-center justify-between text-xs text-gray-600 dark:text-emerald-200 gap-3">
        <div className="flex items-center gap-2">
          <Printer className="w-4 h-4 text-pramuka-green dark:text-pramuka-gold shrink-0" />
          <p className="text-[11px] leading-tight">
            Ingin mencetak laporan fisik secara instant langsung ke printer? Gunakan tombol Cetak Cepat:
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer py-1.5 px-3 rounded-xl text-[10px] shrink-0 active:scale-95 transition-all"
        >
          Cetak Cepat
        </button>
      </div>

      {/* FEEDBACK STATUS 1: Download simulated success feedback toast */}
      {downloadSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-emerald-800 text-white px-4 py-3 rounded-xl shadow-2xl z-55 flex items-center gap-2.5 animate-fade-in text-xs font-bold leading-normal">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Laporan Berhasil Dibuat & Diunduh ke perangkat Anda! ✓</span>
        </div>
      )}

      {/* MODAL 1: Share menu overlay */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4">
          <div className="bg-white dark:bg-[#0d2318] w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl border border-gray-100 dark:border-emerald-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-emerald-950/40">
              <h3 className="font-sans font-black text-gray-800 dark:text-slate-100 text-sm">Bagikan Laporan Mingguan</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-650 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  alert("Tautan Berhasil disalin ke Clipboard!");
                }}
                className="p-3 text-center border border-gray-100 dark:border-emerald-950 hover:border-pramuka-gold rounded-xl cursor-pointer bg-slate-50 dark:bg-emerald-950/20"
              >
                <Send className="w-5 h-5 mx-auto text-sky-500 mb-1" />
                <p className="text-[9px] font-bold text-gray-500">Kirim Link</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  alert("Daftar Hadir Laporan Terkirim ke Grup WhatsApp!");
                }}
                className="p-3 text-center border border-gray-100 dark:border-emerald-950 hover:border-pramuka-gold rounded-xl cursor-pointer bg-slate-50 dark:bg-emerald-950/20"
              >
                <Share2 className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <p className="text-[9px] font-bold text-gray-500">WhatsApp</p>
              </button>

              <button
                type="button"
                className="p-3 text-center border border-gray-100 dark:border-emerald-950 hover:border-pramuka-gold rounded-xl cursor-pointer bg-slate-50 dark:bg-emerald-950/20"
                onClick={() => {
                  setShowShareModal(false);
                  alert("Terkirim ke Email Pengurus Kwartir Ranting!");
                }}
              >
                <Mail className="w-5 h-5 mx-auto text-[#f4a800] mb-1" />
                <p className="text-[9px] font-bold text-gray-500">Email Kwaran</p>
              </button>
            </div>
            
            <p className="text-[10px] text-gray-400 font-mono text-center">
              *Laporan dikompilasi ke format ZIP / PDF Ringkas sebelum dikirim.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
