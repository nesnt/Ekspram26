import React, { useState } from "react";
import { PRESET_MATERIALS } from "../data";
import { BookOpen, Calendar, Clock, Image as ImageIcon, Sparkles, Trash2, ArrowRight, X } from "lucide-react";
import { getPhotoUrl } from "../gdrive";

interface FormKegiatanStep1Props {
  initialData: {
    tanggal: string;
    waktuMulai: string;
    waktuSelesai: string;
    materi: string;
    keterangan: string;
    foto?: string;
    rawFile?: File;
  };
  onNext: (data: {
    tanggal: string;
    waktuMulai: string;
    waktuSelesai: string;
    materi: string;
    keterangan: string;
    foto?: string;
    rawFile?: File;
  }) => void;
  onCancel: () => void;
}

export const FormKegiatanStep1: React.FC<FormKegiatanStep1Props> = ({
  initialData,
  onNext,
  onCancel,
}) => {
  const [tanggal, setTanggal] = useState(initialData.tanggal || new Date().toISOString().split("T")[0]);
  const [waktuMulai, setWaktuMulai] = useState(initialData.waktuMulai || "14:00");
  const [waktuSelesai, setWaktuSelesai] = useState(initialData.waktuSelesai || "16:00");
  const [materi, setMateri] = useState(initialData.materi || "");
  const [keterangan, setKeterangan] = useState(initialData.keterangan || "");
  const [foto, setFoto] = useState<string | undefined>(initialData.foto);
  const [rawFile, setRawFile] = useState<File | undefined>(initialData.rawFile);

  const [dragActive, setDragActive] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handlePresetSelect = (preset: { name: string; desc: string }) => {
    setMateri(preset.name);
    setKeterangan(preset.desc);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorText("Berkas harus berupa gambar (PNG/JPG)");
      return;
    }
    setErrorText("");
    setRawFile(file);

    // Show local preview instantly
    const localUrl = URL.createObjectURL(file);
    setFoto(localUrl);
  };

  const handleRemovePhoto = () => {
    setFoto(undefined);
    setRawFile(undefined);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleNextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal) {
      setErrorText("Pilih tanggal kegiatan!");
      return;
    }
    if (!materi.trim()) {
      setErrorText("Materi / Nama kegiatan wajib diisi!");
      return;
    }
    setErrorText("");
    onNext({
      tanggal,
      waktuMulai,
      waktuSelesai,
      materi,
      keterangan,
      foto,
      rawFile,
    });
  };

  return (
    <div className="animate-fade-in py-4 px-4 space-y-4 pb-10">
      
      {/* Step Progress Top Header */}
      <div className="bg-white dark:bg-[#0c1f14] p-3 rounded-2xl border border-gray-100 dark:border-pramuka-green-dark flex items-center justify-between">
        <div>
          <h2 className="font-sans font-black text-gray-800 dark:text-gray-100 text-base">Catat Kegiatan Baru</h2>
          <p className="text-[11px] text-gray-400 dark:text-emerald-700">Langkah 1 dari 3: Identitas Kegiatan</p>
        </div>
        
        {/* Step dots visual */}
        <div className="flex gap-1.5">
          <span className="w-5 h-2 rounded-full bg-pramuka-gold" />
          <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-emerald-950" />
          <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-emerald-950" />
        </div>
      </div>

      {errorText && (
        <div className="bg-red-50 dark:bg-rose-950/20 text-red-600 dark:text-rose-400 p-3 rounded-xl text-xs font-semibold border border-red-100 dark:border-rose-950/50 flex items-center gap-2">
          <span>⚠️</span>
          <p>{errorText}</p>
        </div>
      )}

      <form onSubmit={handleNextSubmit} className="space-y-4 pb-12">
        {/* Date & Time Fields */}
        <div className="bg-white dark:bg-[#0d2318] p-4 rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-gray-400 dark:text-emerald-700 flex items-center gap-1.5 border-b pb-2 border-gray-100 dark:border-emerald-950/40">
            <Calendar className="w-3.5 h-3.5" /> Tanggal & Waktu
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-emerald-200 mb-1">
              Tanggal Latihan
            </label>
            <div className="relative">
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pramuka-green dark:focus:ring-pramuka-gold focus:border-transparent flex items-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-emerald-300 block mb-1">
                Jam Mulai
              </label>
              <div className="relative flex items-center">
                <Clock className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="time"
                  value={waktuMulai}
                  onChange={(e) => setWaktuMulai(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-emerald-300 block mb-1">
                Jam Selesai
              </label>
              <div className="relative flex items-center">
                <Clock className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="time"
                  value={waktuSelesai}
                  onChange={(e) => setWaktuSelesai(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preset Materials Help Grid */}
        <div className="bg-white dark:bg-[#0d2318] p-4 rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm">
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-gray-400 dark:text-emerald-700 flex items-center gap-1.5 border-b pb-2 border-gray-100 dark:border-emerald-950/40">
            <Sparkles className="w-3.5 h-3.5 text-pramuka-gold" /> Rekomendasi Materi SKU
          </h3>
          <p className="text-[10px] text-gray-400 mt-1 mb-3">
            Pilih materi cepat di bawah untuk mengisi form otomatis sesuai kurikulum SKU Pramuka Penggalang:
          </p>

          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {PRESET_MATERIALS.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="p-2.5 text-left rounded-xl transition-all border text-xs cursor-pointer active:scale-95 bg-gray-50 dark:bg-emerald-950/20 border-gray-100 dark:border-emerald-950 text-gray-800 dark:text-emerald-100 hover:border-pramuka-green dark:hover:border-pramuka-gold"
              >
                <div className="font-bold flex items-center gap-1 text-pramuka-green dark:text-pramuka-gold truncate">
                  <BookOpen className="w-3 h-3 shrink-0" /> {preset.name}
                </div>
                <p className="text-[9px] text-gray-400 line-clamp-2 mt-0.5 leading-tight">
                  {preset.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Agenda / Materi content */}
        <div className="bg-white dark:bg-[#0d2318] p-4 rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-gray-400 dark:text-emerald-700 flex items-center gap-1.5 border-b pb-1 border-gray-100 dark:border-emerald-950/40">
            <BookOpen className="w-3.5 h-3.5" /> Materi Latihan
          </h3>

          <div>
            <label className="text-[11px] font-bold text-gray-500 dark:text-emerald-300 block mb-1">
              Topik / Materi Utama
            </label>
            <input
              type="text"
              placeholder="Contoh: Pionering Tiang Bendera"
              value={materi}
              onChange={(e) => setMateri(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pramuka-green"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 dark:text-emerald-300 block mb-1">
              Keterangan Latihan / Catatan
            </label>
            <textarea
              placeholder="Ketik rincian jalannya kegiatan, pembina pendamping, atau peralatan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pramuka-green"
            />
          </div>
        </div>

        {/* Upload Dokumentasi */}
        <div className="bg-white dark:bg-[#0d2318] p-4 rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-gray-400 dark:text-emerald-700 flex items-center gap-1.5 border-b pb-2 border-gray-100 dark:border-emerald-950/40">
            <ImageIcon className="w-3.5 h-3.5" /> Dokumentasi Foto
          </h3>

          {!foto ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative ${
                dragActive
                  ? "border-pramuka-gold bg-pramuka-gold/5"
                  : "border-gray-200 dark:border-emerald-900 hover:border-pramuka-green"
              }`}
            >
              <input
                type="file"
                id="file-photo-upload"
                onChange={handleFileChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Upload photo"
              />
              <div className="space-y-2 pointer-events-none flex flex-col items-center">
                <div className="bg-gray-50 dark:bg-emerald-950/20 p-2.5 rounded-full text-gray-400 dark:text-emerald-700">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-pramuka-green dark:text-pramuka-gold">Tarik foto kemari</span> atau klik untuk memotret/memilih berkas
                </div>
                <p className="text-[10px] text-gray-400 font-mono">PNG, JPG, JPEG (Maks. 5MB)</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-emerald-950/20 border border-gray-100 dark:border-emerald-900/60 p-2 max-w-sm mx-auto">
              <img
                src={getPhotoUrl(foto)}
                alt="Upload preview"
                className="w-full h-36 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                aria-label="Remove photo"
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-[10px] text-white py-1 px-2.5 rounded backdrop-blur-sm truncate font-mono text-center">
                Gambar dipilih (belum diunggah)
              </div>
            </div>
          )}
        </div>

        {/* Buttons Nav */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-50 dark:bg-[#0c1f14] hover:bg-gray-100 dark:hover:bg-emerald-950/40 text-gray-600 dark:text-emerald-100 border border-gray-200 dark:border-emerald-900 rounded-xl py-3 text-xs font-bold cursor-pointer transition-colors"
          >
            Batal
          </button>
          
          <button
            type="submit"
            className="flex-1 bg-pramuka-green dark:bg-pramuka-green-dark text-white border border-pramuka-green-light hover:border-pramuka-gold rounded-xl py-3 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
          >
            Lanjut ke Siswa <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
