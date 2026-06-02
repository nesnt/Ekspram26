import React, { useState } from "react";
import { TunasKelapaIcon, TendaIcon, BintangTigaIcon } from "./Icons";
import { Lock, User, Sparkles, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("pembina");
  const [password, setPassword] = useState("pramuka123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateDemoAccounts = async () => {
    setIsLoading(true);
    setErrorText("");
    try {
      let registeredUser = false;
      // 1. Create pembina
      try {
        const cred = await createUserWithEmailAndPassword(auth, "pembina@sipra.com", "pramuka123");
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          username: "pembina",
          email: "pembina@sipra.com",
          role: "PEMBINA",
          created_at: new Date()
        });
        registeredUser = true;
      } catch (err: any) {
        if (err.code !== "auth/email-already-in-use") throw err;
      }

      // 2. Create admin
      try {
        const cred = await createUserWithEmailAndPassword(auth, "admin@sipra.com", "admin123");
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          username: "admin",
          email: "admin@sipra.com",
          role: "ADMIN",
          created_at: new Date()
        });
        registeredUser = true;
      } catch (err: any) {
        if (err.code !== "auth/email-already-in-use") throw err;
      }

      setIsLoading(false);
      setErrorText("");
      alert("Inisialisasi akun demo sukses! Anda otomatis masuk sebagai Pembina.");
      onLoginSuccess("pembina");
    } catch (err: any) {
      console.error("Gagal inisialisasi:", err);
      setIsLoading(false);
      setErrorText("Gagal inisialisasi: " + err.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!username.trim() || !password.trim()) {
      setErrorText("Nama pengguna dan kata sandi wajib diisi!");
      return;
    }

    setIsLoading(true);

    // If username doesn't look like an email, append default domain
    let emailInput = username.trim();
    if (!emailInput.includes("@")) {
      emailInput = `${emailInput}@sipra.com`;
    }

    signInWithEmailAndPassword(auth, emailInput, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        try {
          // Fetch additional profile data from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            onLoginSuccess(userData.username || user.email || "Pengurus");
          } else {
            // Fallback to local name
            onLoginSuccess(username.trim());
          }
        } catch (dbErr) {
          console.error("Gagal mengambil data user di Firestore:", dbErr);
          // Still succeed the login if Auth succeeded
          onLoginSuccess(username.trim());
        }
      })
      .catch((err: any) => {
        setIsLoading(false);
        // Translate common Firebase errors for better UX
        if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          setErrorText("Nama pengguna/email atau sandi salah!");
        } else if (err.code === "auth/invalid-email") {
          setErrorText("Format email/nama pengguna tidak valid.");
        } else {
          setErrorText("Gagal masuk: " + err.message);
        }
      });
  };

  return (
    <div className="animate-fade-in py-6 px-5 flex flex-col justify-between h-full min-h-[500px]">

      {/* Top Brand Logo Banner */}
      <div className="text-center space-y-3 pt-6">
        <div className="mx-auto bg-gradient-to-br from-pramuka-green to-pramuka-green-light p-3.5 rounded-full w-20 h-20 shadow-lg border-2 border-pramuka-gold flex items-center justify-center relative">
          <TunasKelapaIcon className="w-12 h-12 text-pramuka-gold animate-pulse" />
          <span className="absolute -top-1 -right-1 bg-pramuka-gold text-pramuka-green-dark border-2 border-white rounded-full p-1 text-[8px] font-black">
            HQ
          </span>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="font-sans font-black text-2xl tracking-tight text-gray-800 dark:text-white">
              SiLapor <span className="text-pramuka-gold">Pramuka</span>
            </h2>
            <Sparkles className="w-4 h-4 text-pramuka-gold" />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-emerald-550 font-mono tracking-wider uppercase mt-1">
            Sistem Catat & Lapor Gugus Depan
          </p>
          <div className="flex justify-center mt-1.5">
            <BintangTigaIcon className="scale-90" />
          </div>
        </div>
      </div>

      {/* Login Card Form */}
      <div className="bg-white dark:bg-[#0d2318] p-5 rounded-3xl border border-gray-100 dark:border-pramuka-green-dark shadow-xl space-y-4 my-6 relative overflow-hidden">
        {/* Subtle scout ribbon visual pattern inside card */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-pramuka-green via-pramuka-gold to-pramuka-green" />

        <div className="text-center">
          <h3 className="font-sans font-extrabold text-[#111] dark:text-white text-md">
            Masuk Pengurus Kwartir
          </h3>
          <p className="text-[10px] text-gray-400 dark:text-gray-300 mt-0.5">
            Gunakan akun pembina / pengurus terdaftar Anda
          </p>
        </div>

        {errorText && (
          <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl text-[11px] font-bold border border-rose-100 dark:border-rose-950/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <p className="leading-tight">{errorText}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Username Input */}
          <div>
            <label className="text-[10px] font-bold font-mono text-gray-400 dark:text-emerald-300 uppercase tracking-wider block mb-1">
              Nama Pengguna (Username)
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cth: pembina"
                required
                className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl pl-10 pr-3 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pramuka-green"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="text-[10px] font-bold font-mono text-gray-400 dark:text-emerald-300 uppercase tracking-wider block mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sandi rahasia"
                required
                className="w-full bg-gray-50 dark:bg-emerald-950/40 border border-gray-200 dark:border-emerald-900 rounded-xl pl-10 pr-10 py-2.5 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pramuka-green"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tips card so they know correct logins immediately */}
          <div className="bg-amber-50 dark:bg-emerald-950/20 border border-amber-100 dark:border-emerald-950/40 p-2.5 rounded-xl text-[10px] text-gray-550 dark:text-emerald-200">
            <span className="font-bold text-pramuka-gold">Demo Akses Cepet:</span>
            <div className="mt-1 font-mono flex flex-col gap-0.5">
              <span>• Username: <strong className="text-pramuka-green dark:text-teal-400">pembina</strong></span>
              <span>• Password: <strong className="text-pramuka-green dark:text-teal-400">pramuka123</strong></span>
            </div>
          </div>

          {/* Button to init accounts and seed database */}
          <button
            type="button"
            onClick={handleCreateDemoAccounts}
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl border border-amber-500 shadow-sm cursor-pointer active:scale-95 transition-all text-center"
          >
            ⚙️ Inisialisasi Akun & Database
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-pramuka-green dark:bg-pramuka-green-dark text-white border border-pramuka-green-light hover:border-pramuka-gold rounded-xl py-3 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md transform active:scale-95 transition-all mt-1"
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin text-white">⏳</span> Memvalidasi...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Scout Motto footer decoration */}
      <div className="text-center text-[10px] text-gray-450 dark:text-emerald-700/80 font-mono space-y-1">
        <p className="italic">"Satyaku Kudarmakan, Darmaku Kubaktikan"</p>
        <p className="text-[8px] uppercase tracking-widest text-gray-400">Pramuka SMKN 13 Bandung</p>
      </div>
    </div>
  );
};
