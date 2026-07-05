import React, { useState } from "react";
import { TunasKelapaIcon, BintangTigaIcon } from "./Icons";
import { Lock, User, Sparkles, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!email.trim() || !password.trim()) {
      setErrorText("Email dan kata sandi wajib diisi!");
      return;
    }

    setIsLoading(true);

    signInWithEmailAndPassword(auth, email.trim(), password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            onLoginSuccess(userData.username || user.email || "Pengurus");
          } else {
            onLoginSuccess(user.email || "Pengurus");
          }
        } catch (dbErr) {
          console.error("Gagal mengambil data user di Firestore:", dbErr);
          onLoginSuccess(user.email || "Pengurus");
        }
      })
      .catch((err: any) => {
        setIsLoading(false);
        if (
          err.code === "auth/invalid-credential" ||
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password"
        ) {
          setErrorText("Email atau kata sandi salah!");
        } else if (err.code === "auth/invalid-email") {
          setErrorText("Format email tidak valid.");
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
              SiGAP <span className="text-pramuka-gold">13</span>
            </h2>
            <Sparkles className="w-4 h-4 text-pramuka-gold" />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-emerald-550 font-mono tracking-wider uppercase mt-1">
            Sistem Catat & Lapor Gugus Depan SMKN 13
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
          {/* Email Input */}
          <div>
            <label className="text-[10px] font-bold font-mono text-gray-400 dark:text-emerald-300 uppercase tracking-wider block mb-1">
              Email
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cth: pembina@email.com"
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
                placeholder="Kata sandi akun"
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
