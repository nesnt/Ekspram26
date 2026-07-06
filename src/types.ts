/**
 * Types representing Scout Administration Application "SiGAP 13"
 */

export type UserRole = "PEMBINA" | "KRANI";

export interface AppUser {
  uid: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface Student {
  id: string;
  name: string;
  regu: string; // Sangga (e.g., Penegas, Pendobrak, Perintis, Pencoba, Pelaksana)
  type: "SISWA" | "SISWI"; // Boy / Girl
  kelas: string; // School Class
}

export interface Activity {
  id: string;
  tanggal: string; // YYYY-MM-DD
  waktuMulai: string; // HH:MM
  waktuSelesai: string; // HH:MM
  materi: string;
  keterangan: string;
  foto?: string; // Base64 data url or fallback placeholder
  absensiSiswa: { [studentId: string]: boolean }; // student.id -> isPresent
  absensiSiswi: { [studentId: string]: boolean }; // student.id -> isPresent
}

export type ScreenType = "LOGIN" | "ADMIN_PANEL" | "DASHBOARD" | "INPUT_STEP1" | "INPUT_STEP2" | "INPUT_STEP3" | "REVIEW" | "GENERATE" | "STUDENT_DETAIL" | "USER_MANAGEMENT";

export interface DashboardStats {
  totalKegiatanBulanIni: number;
  rataKehadiranSiswa: number; // percentage
  rataKehadiranSiswi: number; // percentage
  totalSiswa: number;
  totalSiswi: number;
}
