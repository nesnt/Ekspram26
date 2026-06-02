import React, { useState, useMemo } from "react";
import { Student } from "../types";
import { TunasKelapaIcon, TendaIcon } from "./Icons";
import { CLASS_OPTIONS } from "../data";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  Check,
  X,
  AlertTriangle,
  Filter,
  UserCheck,
  Award,
  BookOpen
} from "lucide-react";

interface AdminPanelScreenProps {
  students: Student[];
  onAddStudent: (student: { name: string; regu: string; type: "SISWA" | "SISWI"; kelas: string }) => void;
  onUpdateStudent: (id: string, updated: { name: string; regu: string; type: "SISWA" | "SISWI"; kelas: string }) => void;
  onDeleteStudent: (id: string) => void;
  onNavigateBack: () => void;
}

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onNavigateBack,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "SISWA" | "SISWI">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal / Form state for Add/Edit
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  
  // Field states for Create/Edit Form
  const [formName, setFormName] = useState("");
  const [formRegu, setFormRegu] = useState("");
  const [formType, setFormType] = useState<"SISWA" | "SISWI">("SISWA");
  const [formKelas, setFormKelas] = useState("X RPL 1");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const [errorText, setErrorText] = useState("");

  // Statistics
  const stats = useMemo(() => {
    const totalSiswa = students.filter(s => s.type === "SISWA").length;
    const totalSiswi = students.filter(s => s.type === "SISWI").length;
    const total = students.length;
    
    // Unique Regu Patrol sets
    const reguSet = new Set(students.map(s => s.regu));
    
    return {
      totalSiswa,
      totalSiswi,
      total,
      totalRegu: reguSet.size
    };
  }, [students]);

  // Filter student lists
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.regu.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      if (activeTab === "SISWA") return s.type === "SISWA";
      if (activeTab === "SISWI") return s.type === "SISWI";
      return true;
    });
  }, [students, searchQuery, activeTab]);

  // Handle opening add form
  const openAddModal = () => {
    setFormName("");
    setFormRegu("");
    setFormType(activeTab === "SISWI" ? "SISWI" : "SISWA");
    setFormKelas("X RPL 1");
    setErrorText("");
    setShowAddModal(true);
  };

  // Handle opening edit form
  const openEditModal = (student: Student) => {
    setSelectedStudentId(student.id);
    setFormName(student.name);
    setFormRegu(student.regu);
    setFormType(student.type);
    setFormKelas(student.kelas || "X RPL 1");
    setErrorText("");
    setShowEditModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorText("Nama anggota wajib diisi!");
      return;
    }
    if (!formRegu.trim()) {
      setErrorText("Nama Regu wajib diisi!");
      return;
    }

    onAddStudent({
      name: formName.trim(),
      regu: formRegu.trim(),
      type: formType,
      kelas: formKelas
    });
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    if (!formName.trim()) {
      setErrorText("Nama anggota wajib diisi!");
      return;
    }
    if (!formRegu.trim()) {
      setErrorText("Nama Regu wajib diisi!");
      return;
    }

    onUpdateStudent(selectedStudentId, {
      name: formName.trim(),
      regu: formRegu.trim(),
      type: formType,
      kelas: formKelas
    });
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="animate-fade-in py-4 px-4 space-y-4 pb-10">
      
      {/* Header section with back button */}
      <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-emerald-950/40">
        <div>
          <h2 className="font-sans font-black text-gray-800 dark:text-gray-100 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-pramuka-gold" /> Master Admin Anggota
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-emerald-700">Menejemen database siswa dan siswi pramuka</p>
        </div>

        <button
          onClick={onNavigateBack}
          id="btn-admin-panel-back"
          className="bg-gray-100 dark:bg-[#0c1f14] hover:bg-gray-200 text-gray-500 dark:text-emerald-100 border border-gray-200 dark:border-emerald-900 py-1.5 px-3 rounded-xl text-xs font-bold cursor-pointer"
        >
          Kembali
        </button>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white dark:bg-[#0d2318] p-2 rounded-xl text-center border border-gray-100 dark:border-emerald-950/40">
          <p className="text-[9px] text-gray-400 font-mono uppercase">Total</p>
          <p className="text-sm font-black text-pramuka-green dark:text-pramuka-gold">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#0d2318] p-2 rounded-xl text-center border border-gray-100 dark:border-emerald-950/40">
          <p className="text-[9px] text-gray-400 font-mono uppercase">PA (L)</p>
          <p className="text-sm font-black text-teal-600 dark:text-teal-400">{stats.totalSiswa}</p>
        </div>
        <div className="bg-white dark:bg-[#0d2318] p-2 rounded-xl text-center border border-gray-100 dark:border-emerald-950/40">
          <p className="text-[9px] text-gray-400 font-mono uppercase">PI (P)</p>
          <p className="text-sm font-black text-pink-500 dark:text-pink-400">{stats.totalSiswi}</p>
        </div>
        <div className="bg-white dark:bg-[#0d2318] p-2 rounded-xl text-center border border-gray-100 dark:border-emerald-950/40">
          <p className="text-[9px] text-gray-400 font-mono uppercase">Regu</p>
          <p className="text-sm font-black text-amber-600 dark:text-amber-400">{stats.totalRegu}</p>
        </div>
      </div>

      {/* Search Toolbar & Quick Add Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama/regu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0d2318] border border-gray-200 dark:border-emerald-900 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
          />
        </div>

        <button
          onClick={openAddModal}
          id="btn-add-student-trigger"
          className="bg-pramuka-green dark:bg-pramuka-green-dark text-white border border-pramuka-green-light hover:border-pramuka-gold hover:text-pramuka-gold p-2 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center font-bold text-xs gap-1 shadow-sm px-3 shrink-0"
        >
          <Plus className="w-4 h-4" /> <span>Tambah</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-gray-100/50 dark:bg-[#0c1f14] p-1 rounded-xl border border-gray-200 dark:border-emerald-950/40">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
            activeTab === "ALL"
              ? "bg-white dark:bg-emerald-950 text-pramuka-green dark:text-pramuka-gold shadow-sm"
              : "text-gray-500 dark:text-emerald-500 hover:text-gray-700"
          }`}
        >
          Semua ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab("SISWA")}
          className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
            activeTab === "SISWA"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-gray-500 dark:text-emerald-500 hover:text-gray-700"
          }`}
        >
          Putra (PA - {stats.totalSiswa})
        </button>
        <button
          onClick={() => setActiveTab("SISWI")}
          className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
            activeTab === "SISWI"
              ? "bg-pink-600 text-white shadow-sm"
              : "text-gray-500 dark:text-emerald-500 hover:text-gray-700"
          }`}
        >
          Putri (PI - {stats.totalSiswi})
        </button>
      </div>

      {/* CRUD Student Lists */}
      <div className="bg-white dark:bg-[#0d2318] rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm overflow-hidden">
        <div className="p-3 border-b border-gray-105 dark:border-emerald-950/40 flex justify-between items-center text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400">
          <span>Daftar Anggota ({filteredStudents.length})</span>
          <span>Aksi</span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <TendaIcon className="w-10 h-10 mx-auto opacity-20 mb-1" />
            <p className="text-xs">Tidak ada data anggota ditemukan.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-emerald-950/40 max-h-[350px] overflow-y-auto pr-0.5">
            {filteredStudents.map((student) => {
              const isPi = student.type === "SISWI";
              return (
                <div
                  key={student.id}
                  className="p-3 hover:bg-gray-50/50 dark:hover:bg-[#0c1f14]/50 flex items-center justify-between transition-colors"
                >
                  <div className="truncate pr-3 space-y-0.5 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-sans font-extrabold text-[#111] dark:text-white text-xs truncate">
                        {student.name}
                      </h4>
                      <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        isPi 
                          ? "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-100 dark:border-pink-950" 
                          : "bg-teal-50 text-teal-700 dark:bg-[#0d251d] dark:text-teal-400 border border-teal-100 dark:border-teal-950"
                      }`}>
                        {student.type === "SISWA" ? "PA" : "PI"}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-450 dark:text-gray-400 flex items-center gap-1 font-mono">
                      <span>{student.regu}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-pramuka-gold font-bold">{student.kelas}</span>
                      <span className="text-gray-300">•</span>
                      <span>ID: {student.id}</span>
                    </p>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-2shrink-0">
                    <button
                      onClick={() => openEditModal(student)}
                      aria-label="Edit student"
                      className="text-slate-450 hover:text-pramuka-green dark:hover:text-pramuka-gold p-1.5 rounded bg-gray-50 hover:bg-gray-100 dark:bg-emerald-950/25 border border-gray-105 dark:border-emerald-950 cursor-pointer text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setStudentToDelete(student)}
                      aria-label="Delete student"
                      className="text-rose-400 hover:text-rose-600 p-1.5 rounded bg-gray-50 hover:bg-gray-100 dark:bg-emerald-950/25 border border-gray-105 dark:border-emerald-950 cursor-pointer text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD MEMBER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in">
          <div className="bg-white dark:bg-[#091711] w-full max-w-sm rounded-t-[24px] max-h-[90vh] overflow-y-auto p-5 space-y-4 border-t border-gray-200 dark:border-emerald-900 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-emerald-950">
              <h3 className="font-sans font-black text-gray-800 dark:text-slate-100 text-sm">
                Tambah Anggota Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorText && (
              <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 p-2 rounded-xl text-[10px] font-bold border border-rose-100 dark:border-rose-950 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Type Category Selection */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1 uppercase">
                  Jenis Kelamin (Satuan Separasi)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType("SISWA")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center cursor-pointer ${
                      formType === "SISWA"
                        ? "bg-teal-55/40 border-teal-500 text-teal-800 dark:bg-teal-950/50"
                        : "bg-gray-50 dark:bg-emerald-950/10 border-gray-100 text-gray-550"
                    }`}
                  >
                    PUTRA (Siswa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("SISWI")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center cursor-pointer ${
                      formType === "SISWI"
                        ? "bg-pink-55/40 border-pink-500 text-pink-700 dark:bg-pink-950/50"
                        : "bg-gray-50 dark:bg-emerald-950/10 border-gray-100 text-gray-550"
                    }`}
                  >
                    PUTRI (Siswi)
                  </button>
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1 uppercase">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  placeholder="cth: Muhammad Azka"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none"
                  required
                />
              </div>

              {/* Patrol / Regu */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1 uppercase">
                  Nama Regu / Satuan
                </label>
                <input
                  type="text"
                  placeholder={formType === "SISWA" ? "cth: Regu Elang atau Garuda" : "cth: Regu Melati atau Mawar"}
                  value={formRegu}
                  onChange={(e) => setFormRegu(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none"
                  required
                />
              </div>

              {/* School Class Selection */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1 uppercase">
                  Kelas Siswa
                </label>
                <select
                  value={formKelas}
                  onChange={(e) => setFormKelas(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0c1f14]/50 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none"
                  required
                >
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls} className="text-gray-800 dark:text-emerald-100 dark:bg-[#0c1f14]">
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-50 dark:bg-[#0c1f14] border border-gray-200 dark:border-emerald-900 text-gray-500 py-3 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-pramuka-green text-white py-3 text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MEMBER */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in">
          <div className="bg-white dark:bg-[#091711] w-full max-w-sm rounded-t-[24px] max-h-[90vh] overflow-y-auto p-5 space-y-4 border-t border-gray-200 dark:border-emerald-900 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-emerald-950">
              <h3 className="font-sans font-black text-gray-800 dark:text-slate-100 text-sm">
                Ubah Data Anggota
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorText && (
              <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 p-2 rounded-xl text-[10px] font-bold border border-rose-100 dark:border-rose-950 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1 uppercase">
                  Jenis Kelamin (Satuan Separasi)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType("SISWA")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center cursor-pointer ${
                      formType === "SISWA"
                        ? "bg-teal-55/40 border-teal-500 text-teal-800 dark:bg-teal-950/50"
                        : "bg-gray-50 dark:bg-emerald-950/10 border-gray-100 text-gray-550"
                    }`}
                  >
                    PUTRA (Siswa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("SISWI")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center cursor-pointer ${
                      formType === "SISWI"
                        ? "bg-pink-55/40 border-pink-500 text-pink-700 dark:bg-pink-950/50"
                        : "bg-gray-50 dark:bg-emerald-950/10 border-gray-100 text-gray-550"
                    }`}
                  >
                    PUTRI (Siswi)
                  </button>
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1 uppercase">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none"
                  required
                />
              </div>

              {/* Patrol / Regu */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1 uppercase">
                  Nama Regu / Satuan
                </label>
                <input
                  type="text"
                  value={formRegu}
                  onChange={(e) => setFormRegu(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none"
                  required
                />
              </div>

              {/* School Class Selection */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1 uppercase">
                  Kelas Siswa
                </label>
                <select
                  value={formKelas}
                  onChange={(e) => setFormKelas(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0c1f14]/50 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none"
                  required
                >
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls} className="text-gray-800 dark:text-emerald-100 dark:bg-[#0c1f14]">
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-50 dark:bg-[#0c1f14] border border-gray-200 dark:border-emerald-900 text-gray-500 py-3 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-pramuka-green text-white py-3 text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-end justify-center animate-fade-in p-4">
          <div className="bg-white dark:bg-[#0d2318] w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl border border-gray-100 dark:border-emerald-900 p-5 space-y-4">
            <div className="text-center space-y-2">
              <div className="bg-rose-50 dark:bg-rose-950/20 w-12 h-12 rounded-full flex items-center justify-center text-rose-500 mx-auto border border-rose-100 dark:border-rose-950">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-black text-gray-800 dark:text-slate-100 text-base">Hapus Anggota?</h3>
              <p className="text-xs text-gray-400 dark:text-emerald-300 leading-normal">
                Apakah Anda yakin ingin menghapus <strong className="text-gray-700 dark:text-white">"{studentToDelete.name}"</strong> dari regu <strong className="text-white bg-slate-800 p-0.5 px-1.5 rounded text-[10px]">{studentToDelete.regu}</strong>? Anggota ini tidak akan muncul lagi di lembar absensi latihan rutin berikutnya.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 bg-gray-50 dark:bg-[#0c1f14] hover:bg-gray-100 text-gray-500 dark:text-emerald-100 py-3 text-xs font-bold rounded-xl border border-gray-200 dark:border-emerald-900 cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
