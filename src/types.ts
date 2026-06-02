/**
 * Types representing Scout Administration Application "SiLapor Pramuka"
 */

export interface Student {
  id: string;
  name: string;
  regu: string; // Scout Patrol / Team (e.g., Eagle, Orchid)
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

export type ScreenType = "LOGIN" | "ADMIN_PANEL" | "DASHBOARD" | "INPUT_STEP1" | "INPUT_STEP2" | "INPUT_STEP3" | "REVIEW" | "GENERATE";

export interface DashboardStats {
  totalKegiatanBulanIni: number;
  rataKehadiranSiswa: number; // percentage
  rataKehadiranSiswi: number; // percentage
  totalSiswa: number;
  totalSiswi: number;
}
