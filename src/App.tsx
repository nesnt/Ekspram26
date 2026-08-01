import { useState, useEffect } from "react";
import { ScreenType, Activity, Student, UserRole } from "./types";
import {
  DEFAULT_ACTIVITIES,
  DEFAULT_SISWA,
  DEFAULT_SISWI
} from "./data";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { DashboardScreen } from "./components/DashboardScreen";
import { FormKegiatanStep1 } from "./components/FormKegiatanStep1";
import { FormAbsensiSiswa } from "./components/FormAbsensiSiswa";
import { ReviewScreen } from "./components/ReviewScreen";
import { GenerateScreen } from "./components/GenerateScreen";
import { LoginScreen } from "./components/LoginScreen";
import { AdminPanelScreen } from "./components/AdminPanelScreen";
import { StudentDetailScreen } from "./components/StudentDetailScreen";
import { UserManagementScreen } from "./components/UserManagementScreen";
import {
  Sparkles,
  Calendar,
  Award,
  CheckCircle,
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Printer,
  UserCog,
  LogOut,
  Moon,
  Sun,
  ArrowLeft
} from "lucide-react";
import { auth, db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { requestGoogleToken, uploadFileToGDrive } from "./gdrive";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("silapor_dark_mode");
    return saved === "true";
  });

  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("KRANI");
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("LOGIN");

  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [dbActivities, setDbActivities] = useState<any[]>([]);
  const [dbAbsensi, setDbAbsensi] = useState<any[]>([]);

  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalLoadingText, setGlobalLoadingText] = useState("");

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setLoggedInUser(data.username || firebaseUser.email?.split("@")[0] || "User");
            setCurrentUserRole((data.role as UserRole) || "KRANI");
          } else {
            setLoggedInUser(firebaseUser.email?.split("@")[0] || "User");
            setCurrentUserRole("KRANI");
          }
        });
        setCurrentScreen("DASHBOARD");
      } else {
        setLoggedInUser(null);
        setCurrentUserRole("KRANI");
        setCurrentScreen("LOGIN");
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen students (anggota)
  useEffect(() => {
    const q = query(collection(db, "anggota"), orderBy("nama", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.nama,
          regu: data.regu,
          type: data.tipe,
          kelas: data.kelas || "X RPL 1",
        });
      });
      setStudents(list);
    });
    return () => unsubscribe();
  }, []);

  // Compute reactive lists
  const siswaList = students.filter(s => s.type === "SISWA");
  const siswiList = students.filter(s => s.type === "SISWI");

  // Listen kegiatan
  useEffect(() => {
    if (students.length === 0) {
      setDbActivities([]);
      return;
    }

    const q = query(collection(db, "kegiatan"), orderBy("tanggal", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setDbActivities(list);
    });
    return () => unsubscribe();
  }, [students]);

  // Listen to absensi
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "absensi"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      setDbAbsensi(list);
    });
    return () => unsubscribe();
  }, []);

  // Merge dbActivities & dbAbsensi to activities state
  useEffect(() => {
    if (students.length === 0) return;

    const mapped: Activity[] = dbActivities.map((act) => {
      const absensiSiswa: { [studentId: string]: boolean } = {};
      const absensiSiswi: { [studentId: string]: boolean } = {};

      const relatedAbsensi = dbAbsensi.filter(a => a.kegiatan_id === act.id);

      relatedAbsensi.forEach(a => {
        const student = students.find(s => s.id === a.anggota_id);
        const isPresent = a.status === "HADIR";
        if (student) {
          if (student.type === "SISWA") {
            absensiSiswa[a.anggota_id] = isPresent;
          } else {
            absensiSiswi[a.anggota_id] = isPresent;
          }
        }
      });

      // default undefined students to true (present)
      students.forEach(s => {
        if (s.type === "SISWA") {
          if (absensiSiswa[s.id] === undefined) {
            absensiSiswa[s.id] = true;
          }
        } else {
          if (absensiSiswi[s.id] === undefined) {
            absensiSiswi[s.id] = true;
          }
        }
      });

      return {
        id: act.id,
        tanggal: act.tanggal,
        waktuMulai: act.waktuMulai,
        waktuSelesai: act.waktuSelesai,
        materi: act.judul,
        keterangan: act.catatan,
        foto: act.gdrive_photo_id,
        foto2: act.gdrive_photo_id2,
        absensiSiswa,
        absensiSiswi
      };
    });

    setActivities(mapped);
  }, [dbActivities, dbAbsensi, students]);

  // Sync dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("silapor_dark_mode", String(darkMode));
  }, [darkMode]);

  // Initial Form / Edit state container
  const [tempActivity, setTempActivity] = useState<{
    id?: string;
    tanggal: string;
    waktuMulai: string;
    waktuSelesai: string;
    materi: string;
    keterangan: string;
    foto?: string;
    foto2?: string;
    rawFile?: File;
    rawFile2?: File;
    absensiSiswa: { [studentId: string]: boolean };
    absensiSiswi: { [studentId: string]: boolean };
    isEditing: boolean;
  }>({
    tanggal: new Date().toISOString().split("T")[0],
    waktuMulai: "14:00",
    waktuSelesai: "16:00",
    materi: "",
    keterangan: "",
    absensiSiswa: {},
    absensiSiswi: {},
    isEditing: false,
  });

  // Action: Launch input step 1 (New)
  const startNewInput = () => {
    // pre-fill clean forms, initialize all present by default to save time!
    const defaultSiswaAbsen: { [ks: string]: boolean } = {};
    siswaList.forEach(s => { defaultSiswaAbsen[s.id] = true; });

    const defaultSiswiAbsen: { [ks: string]: boolean } = {};
    siswiList.forEach(s => { defaultSiswiAbsen[s.id] = true; });

    setTempActivity({
      tanggal: new Date().toISOString().split("T")[0],
      waktuMulai: "14:00",
      waktuSelesai: "16:00",
      materi: "",
      keterangan: "",
      foto: undefined,
      foto2: undefined,
      rawFile: undefined,
      rawFile2: undefined,
      absensiSiswa: defaultSiswaAbsen,
      absensiSiswi: defaultSiswiAbsen,
      isEditing: false,
    });
    setCurrentScreen("INPUT_STEP1");
  };

  // Action: Launch input step 1 (Prefilled for Edit)
  const startEditActivity = (act: Activity) => {
    setTempActivity({
      id: act.id,
      tanggal: act.tanggal,
      waktuMulai: act.waktuMulai,
      waktuSelesai: act.waktuSelesai,
      materi: act.materi,
      keterangan: act.keterangan,
      foto: act.foto,
      foto2: act.foto2,
      rawFile: undefined,
      rawFile2: undefined,
      absensiSiswa: { ...act.absensiSiswa },
      absensiSiswi: { ...act.absensiSiswi },
      isEditing: true,
    });
    setCurrentScreen("INPUT_STEP1");
  };

  // Step 1 -> 2 progression
  const handleStep1Next = (step1Data: {
    tanggal: string;
    waktuMulai: string;
    waktuSelesai: string;
    materi: string;
    keterangan: string;
    foto?: string;
    foto2?: string;
    rawFile?: File;
    rawFile2?: File;
  }) => {
    setTempActivity((prev) => ({
      ...prev,
      ...step1Data,
    }));
    setCurrentScreen("INPUT_STEP2");
  };

  // Step 2 -> 3 progression
  const handleStep2Next = () => {
    setCurrentScreen("INPUT_STEP3");
  };

  // Step 3 -> Save & persist!
  const handleSaveActivity = async () => {
    setIsGlobalLoading(true);
    setGlobalLoadingText("Menyimpan laporan kegiatan...");

    try {
      let gdrivePhotoId = tempActivity.foto || "";
      let gdrivePhotoId2 = tempActivity.foto2 || "";

      // If a raw local file was chosen in Step 1, upload it to Google Drive first!
      if (tempActivity.rawFile || tempActivity.rawFile2) {
        setGlobalLoadingText("Mengunggah foto ke Google Drive...");

        const token = await new Promise<string>((resolve, reject) => {
          requestGoogleToken((tok) => {
            if (tok) resolve(tok);
            else reject(new Error("Gagal mendapatkan izin Google Drive."));
          });
        });

        if (tempActivity.rawFile) {
          gdrivePhotoId = await uploadFileToGDrive(tempActivity.rawFile, token);
        }
        if (tempActivity.rawFile2) {
          gdrivePhotoId2 = await uploadFileToGDrive(tempActivity.rawFile2, token);
        }
      }

      setGlobalLoadingText("Menyimpan data presensi ke Firestore...");
      const batch = writeBatch(db);

      const kegiatanId = tempActivity.id || doc(collection(db, "kegiatan")).id;
      const kegiatanDocRef = doc(db, "kegiatan", kegiatanId);

      const kegiatanData = {
        id: kegiatanId,
        judul: tempActivity.materi,
        tanggal: tempActivity.tanggal,
        waktuMulai: tempActivity.waktuMulai,
        waktuSelesai: tempActivity.waktuSelesai,
        catatan: tempActivity.keterangan,
        gdrive_photo_id: gdrivePhotoId,
        gdrive_photo_id2: gdrivePhotoId2,
        dibuat_oleh: auth.currentUser?.uid || "unknown",
        created_at: serverTimestamp()
      };

      batch.set(kegiatanDocRef, kegiatanData, { merge: true });

      // Write absensi for all active students
      students.forEach(student => {
        const isPresent = student.type === "SISWA"
          ? !!tempActivity.absensiSiswa[student.id]
          : !!tempActivity.absensiSiswi[student.id];

        const absDocId = `${kegiatanId}_${student.id}`;
        batch.set(doc(db, "absensi", absDocId), {
          id: absDocId,
          kegiatan_id: kegiatanId,
          anggota_id: student.id,
          nama_anggota: student.name,
          status: isPresent ? "HADIR" : "ALFA",
          updated_at: serverTimestamp()
        }, { merge: true });
      });

      await batch.commit();

      setIsGlobalLoading(false);
      if (tempActivity.isEditing) {
        setShowSuccessToast("Laporan Latihan Pramuka Berhasil Diperbarui! ✓");
      } else {
        setShowSuccessToast("Kegiatan Latihan Baru Berhasil Disimpan! ✓");
      }

      setCurrentScreen("DASHBOARD");
      setTimeout(() => setShowSuccessToast(null), 4000);
    } catch (e: any) {
      console.error("Gagal menyimpan kegiatan:", e);
      setIsGlobalLoading(false);
      setShowSuccessToast("Gagal menyimpan: " + e.message);
      setTimeout(() => setShowSuccessToast(null), 4000);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      const batch = writeBatch(db);

      batch.delete(doc(db, "kegiatan", id));

      students.forEach(student => {
        const absDocId = `${id}_${student.id}`;
        batch.delete(doc(db, "absensi", absDocId));
      });

      await batch.commit();
      setShowSuccessToast("Kegiatan Latihan Berhasil Dihapus.");
      setTimeout(() => setShowSuccessToast(null), 3000);
    } catch (e) {
      console.error("Gagal menghapus kegiatan:", e);
      setShowSuccessToast("Gagal menghapus kegiatan.");
      setTimeout(() => setShowSuccessToast(null), 3000);
    }
  };

  // Quick toggler helper during absensi selection (Step 2 and 3)
  const toggleSiswaAttendance = (id: string) => {
    setTempActivity((prev) => {
      const copy = { ...prev.absensiSiswa };
      copy[id] = !copy[id];
      return { ...prev, absensiSiswa: copy };
    });
  };

  const toggleSiswiAttendance = (id: string) => {
    setTempActivity((prev) => {
      const copy = { ...prev.absensiSiswi };
      copy[id] = !copy[id];
      return { ...prev, absensiSiswi: copy };
    });
  };

  // Global "set all present" or "absent" shortcut helpers
  const setAllSiswaAttendance = (status: boolean) => {
    setTempActivity((prev) => {
      const copy = { ...prev.absensiSiswa };
      siswaList.forEach((s) => {
        copy[s.id] = status;
      });
      return { ...prev, absensiSiswa: copy };
    });
  };

  const setAllSiswiAttendance = (status: boolean) => {
    setTempActivity((prev) => {
      const copy = { ...prev.absensiSiswi };
      siswiList.forEach((s) => {
        copy[s.id] = status;
      });
      return { ...prev, absensiSiswi: copy };
    });
  };

  const handleAddStudent = async (newS: { name: string; regu: string; type: "SISWA" | "SISWI"; kelas: string }) => {
    try {
      const docRef = doc(collection(db, "anggota"));
      await setDoc(docRef, {
        nama: newS.name,
        regu: newS.regu,
        tipe: newS.type,
        kelas: newS.kelas,
        status_aktif: true,
        created_at: serverTimestamp()
      });
      setShowSuccessToast(`Anggota "${newS.name}" berhasil ditambahkan! ✓`);
      setTimeout(() => setShowSuccessToast(null), 3000);
    } catch (e) {
      console.error(e);
      setShowSuccessToast("Gagal menambahkan anggota.");
      setTimeout(() => setShowSuccessToast(null), 3000);
    }
  };

  const handleUpdateStudent = async (id: string, updatedS: { name: string; regu: string; type: "SISWA" | "SISWI"; kelas: string }) => {
    try {
      await updateDoc(doc(db, "anggota", id), {
        nama: updatedS.name,
        regu: updatedS.regu,
        tipe: updatedS.type,
        kelas: updatedS.kelas,
      });
      setShowSuccessToast(`Data "${updatedS.name}" berhasil diperbarui! ✓`);
      setTimeout(() => setShowSuccessToast(null), 3000);
    } catch (e) {
      console.error(e);
      setShowSuccessToast("Gagal memperbarui anggota.");
      setTimeout(() => setShowSuccessToast(null), 3000);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      const sToDelete = students.find(s => s.id === id);
      await deleteDoc(doc(db, "anggota", id));
      if (sToDelete) {
        setShowSuccessToast(`Anggota "${sToDelete.name}" berhasil dihapus.`);
      }
      setTimeout(() => setShowSuccessToast(null), 3000);
    } catch (e) {
      console.error(e);
      setShowSuccessToast("Gagal menghapus anggota.");
      setTimeout(() => setShowSuccessToast(null), 3000);
    }
  };

  const handleLoginSuccess = (user: string) => {
    setShowSuccessToast(`Selamat datang kembali, Kak ${user}! 👋`);
    setTimeout(() => setShowSuccessToast(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setShowSuccessToast("Berhasil keluar dari sesi pelaporan.");
      setTimeout(() => setShowSuccessToast(null), 3000);
    } catch (e) {
      console.error("Gagal logout:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] dark:bg-[#07130e] text-slate-800 dark:text-emerald-100 flex items-center justify-center transition-colors duration-300">



      {/* RENDER LOGIN SCREEN FULL SCREEN FOR DESKTOP & MOBILE IF NOT LOGGED IN */}
      {currentScreen === "LOGIN" ? (
        <div className="w-full max-w-[420px] h-screen md:h-[760px] md:rounded-[36px] overflow-hidden shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] bg-white dark:bg-pramuka-dark-bg border border-transparent md:border-emerald-900/40 dark:md:border-pramuka-green-dark flex flex-col justify-center relative transition-all duration-300">
          <div className={`absolute inset-0 pointer-events-none ${darkMode ? "scout-pattern-dark" : "scout-pattern"}`} />
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <>
          {/* MOBILE VIEW (Hides on lg screens) */}
          <div className="md:hidden w-full max-w-[420px] h-screen flex flex-col justify-between relative overflow-hidden bg-white dark:bg-pramuka-dark-bg">
            <Header
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              loggedInUser={loggedInUser}
              currentUserRole={currentUserRole}
              onLogout={handleLogout}
            />
            <main className="flex-1 bg-gray-50/50 dark:bg-pramuka-dark-bg/40 relative overflow-y-auto">
              <div className={`absolute inset-0 pointer-events-none ${darkMode ? "scout-pattern-dark" : "scout-pattern"}`} />
              
              {currentScreen === "DASHBOARD" && (
                <DashboardScreen
                  activities={activities}
                  siswaList={siswaList}
                  siswiList={siswiList}
                  onNavigate={(sc) => setCurrentScreen(sc)}
                  onViewActivityDetail={(act) => {
                    setCurrentScreen("REVIEW");
                  }}
                />
              )}

              {currentScreen === "ADMIN_PANEL" && (
                <AdminPanelScreen
                  students={students}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onNavigateBack={() => setCurrentScreen("DASHBOARD")}
                  onViewStudentDetail={(student) => {
                    setSelectedStudent(student);
                    setCurrentScreen("STUDENT_DETAIL");
                  }}
                  currentUserRole={currentUserRole}
                  onNavigateToUserManagement={() => setCurrentScreen("USER_MANAGEMENT")}
                />
              )}

              {currentScreen === "USER_MANAGEMENT" && (
                <UserManagementScreen
                  onNavigateBack={() => setCurrentScreen("ADMIN_PANEL")}
                />
              )}

              {currentScreen === "STUDENT_DETAIL" && selectedStudent && (
                <StudentDetailScreen
                  student={selectedStudent}
                  activities={activities}
                  onNavigateBack={() => setCurrentScreen("ADMIN_PANEL")}
                />
              )}

              {currentScreen === "INPUT_STEP1" && (
                <FormKegiatanStep1
                  initialData={tempActivity}
                  onNext={handleStep1Next}
                  onCancel={() => setCurrentScreen("DASHBOARD")}
                />
              )}

              {currentScreen === "INPUT_STEP2" && (
                <FormAbsensiSiswa
                  step={2}
                  students={siswaList}
                  attendance={tempActivity.absensiSiswa}
                  onToggleAttendance={toggleSiswaAttendance}
                  onSetAllAttendance={setAllSiswaAttendance}
                  onBack={() => setCurrentScreen("INPUT_STEP1")}
                  onNext={handleStep2Next}
                  onSave={() => { }}
                />
              )}

              {currentScreen === "INPUT_STEP3" && (
                <FormAbsensiSiswa
                  step={3}
                  students={siswiList}
                  attendance={tempActivity.absensiSiswi}
                  onToggleAttendance={toggleSiswiAttendance}
                  onSetAllAttendance={setAllSiswiAttendance}
                  onBack={() => setCurrentScreen("INPUT_STEP2")}
                  onNext={() => { }}
                  onSave={handleSaveActivity}
                />
              )}

              {currentScreen === "REVIEW" && (
                <ReviewScreen
                  activities={activities}
                  siswaList={siswaList}
                  siswiList={siswiList}
                  onDeleteActivity={handleDeleteActivity}
                  onEditActivity={startEditActivity}
                  onNavigateToGenerate={() => setCurrentScreen("GENERATE")}
                />
              )}

              {currentScreen === "GENERATE" && (
                <GenerateScreen
                  activities={activities}
                  siswaList={siswaList}
                  siswiList={siswiList}
                />
              )}
            </main>

            <BottomNav
              currentScreen={currentScreen}
              onNavigate={(screen) => setCurrentScreen(screen)}
              onStartInput={startNewInput}
            />
          </div>

          {/* DESKTOP VIEW (Visible on lg screens) */}
          <div className="hidden md:flex w-full h-screen bg-white dark:bg-pramuka-dark-bg flex-row transition-all duration-300">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-slate-50 dark:bg-[#0c1f14] border-r border-gray-200 dark:border-pramuka-green-dark/40 flex flex-col justify-between p-5">
              <div className="space-y-6">
                {/* Logo and Brand */}
                <div className="flex items-center gap-3">
                  <div className="bg-pramuka-green p-2 rounded-xl text-white">
                    <Sparkles className="w-5 h-5 text-pramuka-gold" />
                  </div>
                  <div>
                    <h1 className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-emerald-50">SIGAP 13</h1>
                    <p className="text-[10px] text-gray-400 dark:text-emerald-500 uppercase tracking-wider font-mono">Absensi Pramuka</p>
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-1">
                  <button
                    onClick={() => setCurrentScreen("DASHBOARD")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentScreen === "DASHBOARD"
                        ? "bg-pramuka-green text-white dark:bg-pramuka-green-dark"
                        : "text-slate-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#0d2618]"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={startNewInput}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ["INPUT_STEP1", "INPUT_STEP2", "INPUT_STEP3"].includes(currentScreen)
                        ? "bg-pramuka-green text-white dark:bg-pramuka-green-dark"
                        : "text-slate-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#0d2618]"
                    }`}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Catat Kegiatan & Absen</span>
                  </button>

                  <button
                    onClick={() => setCurrentScreen("ADMIN_PANEL")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ["ADMIN_PANEL", "USER_MANAGEMENT", "STUDENT_DETAIL"].includes(currentScreen)
                        ? "bg-pramuka-green text-white dark:bg-pramuka-green-dark"
                        : "text-slate-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#0d2618]"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Data Anggota</span>
                  </button>

                  <button
                    onClick={() => setCurrentScreen("REVIEW")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentScreen === "REVIEW"
                        ? "bg-pramuka-green text-white dark:bg-pramuka-green-dark"
                        : "text-slate-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#0d2618]"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Review Kegiatan</span>
                  </button>

                  <button
                    onClick={() => setCurrentScreen("GENERATE")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentScreen === "GENERATE"
                        ? "bg-pramuka-green text-white dark:bg-pramuka-green-dark"
                        : "text-slate-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#0d2618]"
                    }`}
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Laporan</span>
                  </button>

                  {currentUserRole === "PEMBINA" && (
                    <button
                      onClick={() => setCurrentScreen("USER_MANAGEMENT")}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentScreen === "USER_MANAGEMENT"
                          ? "bg-pramuka-green text-white dark:bg-pramuka-green-dark"
                          : "text-slate-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#0d2618]"
                      }`}
                    >
                      <UserCog className="w-4 h-4" />
                      <span>Kelola Pengguna</span>
                    </button>
                  )}
                </nav>
              </div>

              {/* Bottom Profile and Dark Mode */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-pramuka-green-dark/40">
                {/* Dark Mode toggle */}
                <div className="flex items-center justify-between px-3">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-emerald-500">Mode Gelap</span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-1.5 rounded-lg bg-gray-200 dark:bg-[#0d2618] text-slate-600 dark:text-pramuka-gold hover:opacity-80 transition-all cursor-pointer"
                  >
                    {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Profile Box */}
                <div className="flex items-center justify-between bg-slate-100 dark:bg-emerald-950/20 p-3 rounded-2xl border border-slate-200/50 dark:border-emerald-900/20">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold truncate text-slate-800 dark:text-white">Kak {loggedInUser}</p>
                    <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">{currentUserRole}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Keluar"
                    className="text-rose-500 hover:text-rose-600 p-1.5 rounded bg-white hover:bg-rose-50 dark:bg-emerald-950/50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-emerald-900 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </aside>

            {/* Desktop Content Panel */}
            <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-pramuka-dark-bg/20 relative overflow-hidden">
              {/* Header Top bar */}
              <header className="h-16 border-b border-gray-200 dark:border-pramuka-green-dark/30 px-6 flex items-center justify-between bg-white dark:bg-pramuka-dark-bg z-10">
                <div className="flex items-center gap-3">
                  {/* Back button simulation if inside a deep screen */}
                  {["USER_MANAGEMENT", "STUDENT_DETAIL"].includes(currentScreen) && (
                    <button
                      onClick={() => {
                        if (currentScreen === "USER_MANAGEMENT") setCurrentScreen("ADMIN_PANEL");
                        if (currentScreen === "STUDENT_DETAIL") setCurrentScreen("ADMIN_PANEL");
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-[#0c1f14] border border-gray-200 dark:border-emerald-900 text-slate-600 dark:text-emerald-100 hover:bg-slate-100 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <h2 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wide">
                    {currentScreen === "DASHBOARD" && "Dashboard Ringkasan"}
                    {currentScreen === "ADMIN_PANEL" && "Administrasi Anggota"}
                    {currentScreen === "USER_MANAGEMENT" && "Pengaturan Hak Akses Akun"}
                    {currentScreen === "STUDENT_DETAIL" && "Rincian Profil Anggota"}
                    {currentScreen === "INPUT_STEP1" && "Pencatatan Baru (Materi & Detail)"}
                    {currentScreen === "INPUT_STEP2" && "Absensi Anggota Putra (Siswa)"}
                    {currentScreen === "INPUT_STEP3" && "Absensi Anggota Putri (Siswi)"}
                    {currentScreen === "REVIEW" && "Riwayat Latihan Pramuka"}
                    {currentScreen === "GENERATE" && "Ekspor & Cetak Laporan"}
                  </h2>
                </div>
                <div className="text-[11px] font-bold font-mono bg-slate-100 dark:bg-emerald-950/40 border border-slate-200/50 dark:border-emerald-900/40 px-3 py-1 rounded-full text-slate-500 dark:text-emerald-400">
                  SMKN 13 BANDUNG • ABSENSI PRAMUKA DIGITAL
                </div>
              </header>

              {/* Inner screen area */}
              <main className="flex-1 overflow-y-auto p-6 relative">
                <div className={`absolute inset-0 pointer-events-none ${darkMode ? "scout-pattern-dark" : "scout-pattern"}`} />
                <div className="relative z-10 w-full">
                  {currentScreen === "DASHBOARD" && (
                    <DashboardScreen
                      activities={activities}
                      siswaList={siswaList}
                      siswiList={siswiList}
                      onNavigate={(sc) => setCurrentScreen(sc)}
                      onViewActivityDetail={(act) => {
                        setCurrentScreen("REVIEW");
                      }}
                    />
                  )}

                  {currentScreen === "ADMIN_PANEL" && (
                    <AdminPanelScreen
                      students={students}
                      onAddStudent={handleAddStudent}
                      onUpdateStudent={handleUpdateStudent}
                      onDeleteStudent={handleDeleteStudent}
                      onNavigateBack={() => setCurrentScreen("DASHBOARD")}
                      onViewStudentDetail={(student) => {
                        setSelectedStudent(student);
                        setCurrentScreen("STUDENT_DETAIL");
                      }}
                      currentUserRole={currentUserRole}
                      onNavigateToUserManagement={() => setCurrentScreen("USER_MANAGEMENT")}
                    />
                  )}

                  {currentScreen === "USER_MANAGEMENT" && (
                    <UserManagementScreen
                      onNavigateBack={() => setCurrentScreen("ADMIN_PANEL")}
                    />
                  )}

                  {currentScreen === "STUDENT_DETAIL" && selectedStudent && (
                    <StudentDetailScreen
                      student={selectedStudent}
                      activities={activities}
                      onNavigateBack={() => setCurrentScreen("ADMIN_PANEL")}
                    />
                  )}

                  {currentScreen === "INPUT_STEP1" && (
                    <FormKegiatanStep1
                      initialData={tempActivity}
                      onNext={handleStep1Next}
                      onCancel={() => setCurrentScreen("DASHBOARD")}
                    />
                  )}

                  {currentScreen === "INPUT_STEP2" && (
                    <FormAbsensiSiswa
                      step={2}
                      students={siswaList}
                      attendance={tempActivity.absensiSiswa}
                      onToggleAttendance={toggleSiswaAttendance}
                      onSetAllAttendance={setAllSiswaAttendance}
                      onBack={() => setCurrentScreen("INPUT_STEP1")}
                      onNext={handleStep2Next}
                      onSave={() => { }}
                    />
                  )}

                  {currentScreen === "INPUT_STEP3" && (
                    <FormAbsensiSiswa
                      step={3}
                      students={siswiList}
                      attendance={tempActivity.absensiSiswi}
                      onToggleAttendance={toggleSiswiAttendance}
                      onSetAllAttendance={setAllSiswiAttendance}
                      onBack={() => setCurrentScreen("INPUT_STEP2")}
                      onNext={() => { }}
                      onSave={handleSaveActivity}
                    />
                  )}

                  {currentScreen === "REVIEW" && (
                    <ReviewScreen
                      activities={activities}
                      siswaList={siswaList}
                      siswiList={siswiList}
                      onDeleteActivity={handleDeleteActivity}
                      onEditActivity={startEditActivity}
                      onNavigateToGenerate={() => setCurrentScreen("GENERATE")}
                    />
                  )}

                  {currentScreen === "GENERATE" && (
                    <GenerateScreen
                      activities={activities}
                      siswaList={siswaList}
                      siswiList={siswiList}
                    />
                  )}
                </div>
              </main>
            </div>
          </div>
        </>
      )}

      {/* Global Toast Notifications banner */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 bg-slate-900 border border-emerald-800 text-white p-3.5 rounded-2xl shadow-xl z-50 flex items-center gap-2.5 animate-fade-in text-[12px] font-sans font-bold leading-normal">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{showSuccessToast}</span>
        </div>
      )}

      {/* Global Fullscreen Loading Overlay */}
      {isGlobalLoading && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white text-xs font-bold gap-3.5">
          <span className="animate-spin text-pramuka-gold text-2xl">⏳</span>
          <span className="font-mono tracking-wide text-center px-4 leading-normal">{globalLoadingText}</span>
        </div>
      )}
    </div>
  );
}
