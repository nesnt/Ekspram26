import { useState, useEffect } from "react";
import { ScreenType, Activity, Student } from "./types";
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
import { Sparkles, Calendar, Award, CheckCircle } from "lucide-react";
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
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("LOGIN");

  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  const [dbActivities, setDbActivities] = useState<any[]>([]);
  const [dbAbsensi, setDbAbsensi] = useState<any[]>([]);

  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalLoadingText, setGlobalLoadingText] = useState("");

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Find user username in Firestore if possible, otherwise use email name
        const userDocRef = doc(db, "users", firebaseUser.uid);
        onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setLoggedInUser(data.username || firebaseUser.email?.split("@")[0] || "User");
          } else {
            setLoggedInUser(firebaseUser.email?.split("@")[0] || "User");
          }
        });
        setCurrentScreen("DASHBOARD");
      } else {
        setLoggedInUser(null);
        setCurrentScreen("LOGIN");
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen and seed students (anggota)
  useEffect(() => {
    const q = query(collection(db, "anggota"), orderBy("nama", "asc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        console.log("Anggota empty, seeding...");
        try {
          const batch = writeBatch(db);
          const initial = [...DEFAULT_SISWA, ...DEFAULT_SISWI];
          initial.forEach(s => {
            batch.set(doc(db, "anggota", s.id), {
              nama: s.name,
              regu: s.regu,
              tipe: s.type,
              kelas: s.kelas,
              status_aktif: true,
              created_at: serverTimestamp()
            });
          });
          await batch.commit();
        } catch (e) {
          console.error("Gagal seeding anggota:", e);
        }
      } else {
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
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute reactive lists
  const siswaList = students.filter(s => s.type === "SISWA");
  const siswiList = students.filter(s => s.type === "SISWI");

  // Listen and seed kegiatan
  useEffect(() => {
    if (students.length === 0) return;

    const q = query(collection(db, "kegiatan"), orderBy("tanggal", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        console.log("Kegiatan empty, seeding activities...");
        try {
          const batch = writeBatch(db);
          DEFAULT_ACTIVITIES.forEach(act => {
            const kegiatanDocRef = doc(db, "kegiatan", act.id);
            batch.set(kegiatanDocRef, {
              id: act.id,
              judul: act.materi,
              tanggal: act.tanggal,
              waktuMulai: act.waktuMulai,
              waktuSelesai: act.waktuSelesai,
              catatan: act.keterangan,
              gdrive_photo_id: act.foto || "",
              dibuat_oleh: "system",
              created_at: serverTimestamp()
            });

            // Boys absensi
            Object.entries(act.absensiSiswa).forEach(([stdId, isPresent]) => {
              const absDocId = `${act.id}_${stdId}`;
              const std = students.find(s => s.id === stdId);
              batch.set(doc(db, "absensi", absDocId), {
                id: absDocId,
                kegiatan_id: act.id,
                anggota_id: stdId,
                nama_anggota: std ? std.name : "Anggota",
                status: isPresent ? "HADIR" : "ALFA",
                updated_at: serverTimestamp()
              });
            });

            // Girls absensi
            Object.entries(act.absensiSiswi).forEach(([stdId, isPresent]) => {
              const absDocId = `${act.id}_${stdId}`;
              const std = students.find(s => s.id === stdId);
              batch.set(doc(db, "absensi", absDocId), {
                id: absDocId,
                kegiatan_id: act.id,
                anggota_id: stdId,
                nama_anggota: std ? std.name : "Anggota",
                status: isPresent ? "HADIR" : "ALFA",
                updated_at: serverTimestamp()
              });
            });
          });
          await batch.commit();
        } catch (e) {
          console.error("Gagal seeding kegiatan:", e);
        }
      } else {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setDbActivities(list);
      }
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
    rawFile?: File;
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
      rawFile: undefined,
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
      rawFile: undefined,
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
    rawFile?: File;
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

      // If a raw local file was chosen in Step 1, upload it to Google Drive first!
      if (tempActivity.rawFile) {
        setGlobalLoadingText("Mengunggah foto ke Google Drive...");

        const token = await new Promise<string>((resolve, reject) => {
          requestGoogleToken((tok) => {
            if (tok) resolve(tok);
            else reject(new Error("Gagal mendapatkan izin Google Drive."));
          });
        });

        gdrivePhotoId = await uploadFileToGDrive(tempActivity.rawFile, token);
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
    <div className="min-h-screen bg-[#f3f6f4] dark:bg-[#07130e] text-slate-800 dark:text-emerald-100 flex items-center justify-center p-0 md:p-4 transition-colors duration-300">

      {/* Visual Ambient Scouting Wilderness Background elements for desktop */}
      <div className="fixed inset-0 pointer-events-none hidden md:block">
        <div className="absolute top-10 left-10 w-44 h-44 bg-pramuka-green rounded-full filter blur-3xl opacity-5 dark:opacity-10" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-pramuka-gold rounded-full filter blur-3xl opacity-5 dark:opacity-10" />

        {/* Floating clouds/stars representation on background margins */}
        <div className="absolute top-1/4 left-15 bg-white/20 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-900/10 p-4 rounded-2xl flex items-center gap-2.5 text-xs text-slate-450 shadow-sm animate-pulse">
          <Calendar className="w-5 h-5 text-pramuka-green" />
          <div className="font-mono">
            <p className="font-bold">SMKN 13 BANDUNG</p>
            <p className="text-[10px]">LAVOISIER || MARIA ANNE</p>
          </div>
        </div>

        <div className="absolute bottom-1/4 right-15 bg-white/20 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-900/10 p-4 rounded-2xl flex items-center gap-2.5 text-xs text-slate-450 shadow-sm animate-pulse" style={{ animationDelay: "1s" }}>
          <Award className="w-5 h-5 text-pramuka-gold" />
          <div className="font-mono">
            <p className="font-bold">Buah Batu</p>
            <p className="text-[10px]">Sistem absensi digital</p>
          </div>
        </div>
      </div>

      {/* Main Smartphone Frame Body Wrapper */}
      <div className="w-full md:max-w-[420px] h-screen md:h-[840px] md:rounded-[36px] overflow-hidden shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] bg-white dark:bg-pramuka-dark-bg border-4 border-transparent md:border-emerald-900/80 dark:md:border-pramuka-green-dark flex flex-col justify-between relative transition-all duration-300">

        {/* Header (Top) - Hide on Login Screen */}
        {currentScreen !== "LOGIN" && (
          <Header
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            loggedInUser={loggedInUser}
            onLogout={handleLogout}
          />
        )}

        {/* Dynamic Screen Mounting Center Section */}
        <main className="flex-1 bg-gray-50/50 dark:bg-pramuka-dark-bg/40 relative overflow-y-auto">

          {/* Ambient organic patterns on inner frame bg */}
          <div className={`absolute inset-0 pointer-events-none ${darkMode ? "scout-pattern-dark" : "scout-pattern"}`} />

          {currentScreen === "LOGIN" && (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          )}

          {currentScreen === "DASHBOARD" && (
            <DashboardScreen
              activities={activities}
              siswaList={siswaList}
              siswiList={siswiList}
              onNavigate={(sc) => setCurrentScreen(sc)}
              onViewActivityDetail={(act) => {
                // Navigate to review and instantly trigger details modal by simulation!
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
              onSave={() => { }} // not saved yet in step 2
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
              onNext={() => { }} // not needed in step 3
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

        {/* Global Toast Notifications banner */}
        {showSuccessToast && (
          <div className="absolute top-[80px] left-4 right-4 bg-slate-900 border border-emerald-800 text-white p-3.5 rounded-2xl shadow-xl z-50 flex items-center gap-2.5 animate-fade-in text-[12px] font-sans font-bold leading-normal">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{showSuccessToast}</span>
          </div>
        )}

        {/* Global Fullscreen Loading Overlay */}
        {isGlobalLoading && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white text-xs font-bold gap-3.5">
            <span className="animate-spin text-pramuka-gold text-2xl">⏳</span>
            <span className="font-mono tracking-wide text-center px-4 leading-normal">{globalLoadingText}</span>
          </div>
        )}

        {/* Navigation Bar (Bottom) - Hide on Login Screen */}
        {currentScreen !== "LOGIN" && (
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onStartInput={startNewInput}
          />
        )}
      </div>
    </div>
  );
}
