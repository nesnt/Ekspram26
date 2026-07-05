import React, { useState, useEffect } from "react";
import { AppUser, UserRole } from "../types";
import { TunasKelapaIcon } from "./Icons";
import {
  ArrowLeft,
  UserCog,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  ShieldCheck,
  ClipboardList,
  Eye,
  EyeOff,
  RefreshCw,
  Users,
} from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

interface UserManagementScreenProps {
  onNavigateBack: () => void;
}

const ROLE_LABELS: Record<UserRole, { label: string; color: string; bg: string; border: string }> = {
  PEMBINA: {
    label: "Pembina Pelatih",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-950",
  },
  KRANI: {
    label: "Krani",
    color: "text-teal-700 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/20",
    border: "border-teal-200 dark:border-teal-950",
  },
};

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ onNavigateBack }) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("KRANI");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Inline role update
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Realtime listener for users collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const list: AppUser[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          uid: d.id,
          username: data.username || "",
          email: data.email || "",
          role: data.role || "KRANI",
        });
      });
      list.sort((a, b) => a.username.localeCompare(b.username));
      setUsers(list);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formUsername.trim()) {
      setFormError("Username wajib diisi!");
      return;
    }
    if (!formEmail.trim() || !formEmail.includes("@")) {
      setFormError("Email tidak valid.");
      return;
    }
    if (formPassword.length < 6) {
      setFormError("Password minimal 6 karakter.");
      return;
    }

    setIsSaving(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, formEmail.trim(), formPassword);
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        username: formUsername.trim(),
        email: formEmail.trim(),
        role: formRole,
        created_at: serverTimestamp(),
      });
      showToast(`Akun "${formUsername.trim()}" berhasil dibuat sebagai ${ROLE_LABELS[formRole].label}! ✓`);
      setShowAddModal(false);
      setFormUsername("");
      setFormEmail("");
      setFormPassword("");
      setFormRole("KRANI");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setFormError("Email sudah digunakan. Coba email lain.");
      } else if (err.code === "auth/invalid-email") {
        setFormError("Format email tidak valid.");
      } else {
        setFormError("Gagal membuat akun: " + err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "users", userToDelete.uid));
      showToast(`Akun "${userToDelete.username}" berhasil dihapus.`);
      setUserToDelete(null);
    } catch (err: any) {
      showToast("Gagal menghapus: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleRole = async (user: AppUser) => {
    const newRole: UserRole = user.role === "PEMBINA" ? "KRANI" : "PEMBINA";
    setUpdatingRoleId(user.uid);
    try {
      await updateDoc(doc(db, "users", user.uid), { role: newRole });
      showToast(`Role "${user.username}" diubah ke ${ROLE_LABELS[newRole].label}. ✓`);
    } catch (err: any) {
      showToast("Gagal mengubah role: " + err.message);
    } finally {
      setUpdatingRoleId(null);
    }
  };

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
              <UserCog className="w-4 h-4 text-pramuka-gold" />
              Kelola Akun Pengguna
            </h2>
            <p className="text-[10px] text-gray-400 dark:text-emerald-700 font-mono">Hanya dapat diakses oleh Pembina Pelatih</p>
          </div>
        </div>
        <button
          onClick={() => {
            setFormUsername("");
            setFormEmail("");
            setFormPassword("");
            setFormRole("KRANI");
            setFormError("");
            setShowAddModal(true);
          }}
          className="bg-pramuka-green dark:bg-pramuka-green-dark text-white border border-pramuka-green-light hover:border-pramuka-gold p-2 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1 text-xs font-bold px-3 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Akun Baru
        </button>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-3 rounded-xl border ${ROLE_LABELS.PEMBINA.bg} ${ROLE_LABELS.PEMBINA.border} space-y-1`}>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className={`text-[11px] font-black ${ROLE_LABELS.PEMBINA.color}`}>Pembina Pelatih</span>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-emerald-300 leading-snug">
            Semua fitur + kelola akun & role pengguna
          </p>
        </div>
        <div className={`p-3 rounded-xl border ${ROLE_LABELS.KRANI.bg} ${ROLE_LABELS.KRANI.border} space-y-1`}>
          <div className="flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className={`text-[11px] font-black ${ROLE_LABELS.KRANI.color}`}>Krani</span>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-emerald-300 leading-snug">
            Catat kegiatan, absensi, dan laporan
          </p>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white dark:bg-[#0d2318] rounded-2xl border border-gray-100 dark:border-pramuka-green-dark shadow-sm overflow-hidden">
        <div className="p-3 border-b border-gray-100 dark:border-emerald-950/40 flex justify-between items-center">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400 dark:text-emerald-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Daftar Pengguna ({users.length})
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-gray-400">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin opacity-40 mb-2" />
            <p className="text-xs">Memuat data pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10 text-gray-400 space-y-1">
            <TunasKelapaIcon className="w-8 h-8 mx-auto opacity-20" />
            <p className="text-xs">Belum ada akun terdaftar.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-emerald-950/40">
            {users.map((user) => {
              const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.KRANI;
              const isSelf = auth.currentUser?.uid === user.uid;
              return (
                <div
                  key={user.uid}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-[#0c1f14]/50 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-sans font-extrabold text-gray-800 dark:text-white text-xs">
                        {user.username}
                      </span>
                      {isSelf && (
                        <span className="text-[8px] bg-pramuka-green/10 text-pramuka-green dark:text-pramuka-gold border border-pramuka-green/20 px-1.5 rounded font-bold">
                          Saya
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${roleInfo.bg} ${roleInfo.color} ${roleInfo.border}`}>
                        {roleInfo.label}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">{user.email}</span>
                    </div>
                  </div>

                  {!isSelf && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Toggle role button */}
                      <button
                        onClick={() => handleToggleRole(user)}
                        disabled={updatingRoleId === user.uid}
                        aria-label="Ganti role"
                        title={`Ubah ke ${user.role === "PEMBINA" ? "Krani" : "Pembina Pelatih"}`}
                        className={`p-1.5 rounded-lg border cursor-pointer text-xs transition-colors disabled:opacity-50 ${
                          user.role === "PEMBINA"
                            ? "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 border-amber-200 dark:border-amber-950 text-amber-600 dark:text-amber-400"
                            : "bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 border-teal-200 dark:border-teal-950 text-teal-600 dark:text-teal-400"
                        }`}
                      >
                        {updatingRoleId === user.uid
                          ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          : user.role === "PEMBINA"
                            ? <ClipboardList className="w-3.5 h-3.5" />
                            : <ShieldCheck className="w-3.5 h-3.5" />
                        }
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={() => setUserToDelete(user)}
                        aria-label="Hapus akun"
                        className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-emerald-950/25 border border-gray-100 dark:border-emerald-950 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in">
          <div className="bg-white dark:bg-[#091711] w-full max-w-sm rounded-t-[24px] max-h-[90vh] overflow-y-auto p-5 space-y-4 border-t border-gray-200 dark:border-emerald-900 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-emerald-950">
              <h3 className="font-sans font-black text-gray-800 dark:text-slate-100 text-sm">
                Tambah Akun Baru
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 p-2.5 rounded-xl text-[10px] font-bold border border-rose-100 dark:border-rose-950 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1.5 uppercase">
                  Role / Jabatan
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormRole("KRANI")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border text-center cursor-pointer transition-colors ${
                      formRole === "KRANI"
                        ? "bg-teal-50 border-teal-500 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
                        : "bg-gray-50 dark:bg-emerald-950/10 border-gray-200 text-gray-500"
                    }`}
                  >
                    Krani
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRole("PEMBINA")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border text-center cursor-pointer transition-colors ${
                      formRole === "PEMBINA"
                        ? "bg-amber-50 border-amber-500 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                        : "bg-gray-50 dark:bg-emerald-950/10 border-gray-200 text-gray-500"
                    }`}
                  >
                    Pembina Pelatih
                  </button>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1 uppercase">
                  Username / Nama Tampil
                </label>
                <input
                  type="text"
                  placeholder="cth: Kak Andi"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1 uppercase">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="cth: andi@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-[10px] font-black font-mono text-gray-400 block mb-1 uppercase">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 karakter"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl px-3 pr-10 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-50 dark:bg-[#0c1f14] border border-gray-200 dark:border-emerald-900 text-gray-500 py-3 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-pramuka-green text-white py-3 text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSaving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...</> : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-end justify-center animate-fade-in p-4">
          <div className="bg-white dark:bg-[#0d2318] w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl border border-gray-100 dark:border-emerald-900 p-5 space-y-4">
            <div className="text-center space-y-2">
              <div className="bg-rose-50 dark:bg-rose-950/20 w-12 h-12 rounded-full flex items-center justify-center text-rose-500 mx-auto border border-rose-100 dark:border-rose-950">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-black text-gray-800 dark:text-slate-100 text-base">Hapus Akun?</h3>
              <p className="text-xs text-gray-400 dark:text-emerald-300 leading-normal">
                Hapus akun <strong className="text-gray-700 dark:text-white">"{userToDelete.username}"</strong> dengan role <strong>{ROLE_LABELS[userToDelete.role]?.label}</strong>? Akun tidak bisa dipulihkan setelah dihapus.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 bg-gray-50 dark:bg-[#0c1f14] hover:bg-gray-100 text-gray-500 dark:text-emerald-100 py-3 text-xs font-bold rounded-xl border border-gray-200 dark:border-emerald-900 cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menghapus...</> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-emerald-800 text-white px-4 py-3 rounded-xl shadow-2xl z-[60] flex items-center gap-2 animate-fade-in text-xs font-bold">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};
