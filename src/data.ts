import { Student, Activity } from "./types";

export const CLASS_OPTIONS = [
  "X RPL 1", "X RPL 2",
  "XI RPL 1", "XI RPL 2",
  "XII RPL 1", "XII RPL 2",
  
  "X TJKT 1", "X TJKT 2", "X TJKT 3",
  "XI TJKT 1", "XI TJKT 2", "XI TJKT 3",
  "XII TJKT 1", "XII TJKT 2", "XII TJKT 3",
  
  "X KA 1", "X KA 2", "X KA 3", "X KA 4", "X KA 5", "X KA 6",
  "XI KA 1", "XI KA 2", "XI KA 3", "XI KA 4", "XI KA 5", "XI KA 6",
  "XII KA 1", "XII KA 2", "XII KA 3", "XII KA 4", "XII KA 5", "XII KA 6",
  "XIII KA 1", "XIII KA 2", "XIII KA 3", "XIII KA 4", "XIII KA 5", "XIII KA 6"
];

export const SANGGA_OPTIONS = [
  "Penegas",
  "Pendobrak",
  "Perintis",
  "Pencoba",
  "Pelaksana",
];

export const DEFAULT_SISWA: Student[] = [
  { id: "b1", name: "Andi Pratama", regu: "Penegas", type: "SISWA", kelas: "X RPL 1" },
  { id: "b2", name: "Budi Santoso", regu: "Penegas", type: "SISWA", kelas: "X RPL 2" },
  { id: "b3", name: "Dika Wijaya", regu: "Pendobrak", type: "SISWA", kelas: "XI RPL 1" },
  { id: "b4", name: "Eko Prasetyo", regu: "Pendobrak", type: "SISWA", kelas: "XI TJKT 2" },
  { id: "b5", name: "Fahri Ramadhan", regu: "Perintis", type: "SISWA", kelas: "XII RPL 1" },
  { id: "b6", name: "Guntur Wibowo", regu: "Perintis", type: "SISWA", kelas: "X TJKT 1" },
  { id: "b7", name: "Hendra Lesmana", regu: "Pencoba", type: "SISWA", kelas: "XI KA 3" },
  { id: "b8", name: "Irfan Hakim", regu: "Pelaksana", type: "SISWA", kelas: "XII KA 5" },
];

export const DEFAULT_SISWI: Student[] = [
  { id: "g1", name: "Anisa Rahma", regu: "Penegas", type: "SISWI", kelas: "X RPL 1" },
  { id: "g2", name: "Bella Safira", regu: "Penegas", type: "SISWI", kelas: "X RPL 2" },
  { id: "g3", name: "Citra Lestari", regu: "Pendobrak", type: "SISWI", kelas: "XI RPL 1" },
  { id: "g4", name: "Dewi Sartika", regu: "Pendobrak", type: "SISWI", kelas: "XI TJKT 1" },
  { id: "g5", name: "Elia Purwanti", regu: "Perintis", type: "SISWI", kelas: "XII RPL 2" },
  { id: "g6", name: "Fitriani S.", regu: "Perintis", type: "SISWI", kelas: "X TJKT 2" },
  { id: "g7", name: "Gita Lestari", regu: "Pencoba", type: "SISWI", kelas: "XI KA 2" },
  { id: "g8", name: "Hesti Amelia", regu: "Pelaksana", type: "SISWI", kelas: "XII KA 6" },
];

export const PRESET_MATERIALS = [
  { name: "Pionering & Tandu Darurat", desc: "Membuat kaki tiga, menara pandang, dan merakit tandu darurat menggunakan tali pramuka." },
  { name: "Sandi Morse & Semaphore", desc: "Latihan mengirim dan menerima pesan jarak jauh menggunakan bendera dan peluit." },
  { name: "PBB (Peraturan Baris Berbaris)", desc: "Latihan disiplin barisan, langkah tegap, aba-aba, dan formasi barisan pramuka." },
  { name: "Mengenal Kompas & Navigasi", desc: "Menentukan arah mata angin, membaca peta pita, dan membidik sasaran tanda medan." },
  { name: "Pertolongan Pertama (P3K)", desc: "Penanganan pertama pada pingsan, luka gores, patah tulang, dan teknik pembalutan kasa." },
  { name: "Dasar Kemah & Tenda Dom", desc: "Cara mendirikan tenda dome, membuat parit tenda, dan packing perlengkapan pribadi." },
];

// Seed activities for demonstration on first load. Set them to May 2026 to fit current local date (May 21, 2026).
export const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    tanggal: "2026-05-09",
    waktuMulai: "14:00",
    waktuSelesai: "16:30",
    materi: "Sandi Morse & Semaphore",
    keterangan: "Latihan mengirim sandi antarlapangan menggunakan bendera Semaphore dan isyarat peluit Morse. Semua sangga aktif berpartisipasi.",
    absensiSiswa: { b1: true, b2: true, b3: true, b4: true, b5: false, b6: true, b7: true, b8: true },
    absensiSiswi: { g1: true, g2: true, g3: true, g4: true, g5: true, g6: false, g7: true, g8: false },
  },
  {
    id: "act-2",
    tanggal: "2026-05-16",
    waktuMulai: "14:00",
    waktuSelesai: "16:30",
    materi: "Pionering & Tandu Darurat",
    keterangan: "Praktik membuat kaki tiga untuk tiang bendera darurat serta merakit tandu penolong menggunakan tongkat bambu dan tali pramuka.",
    absensiSiswa: { b1: true, b2: true, b3: false, b4: true, b5: true, b6: true, b7: true, b8: false },
    absensiSiswi: { g1: true, g2: true, g3: true, g4: true, g5: true, g6: true, g7: true, g8: true },
  },
  {
    id: "act-3",
    tanggal: "2026-05-20",
    waktuMulai: "13:30",
    waktuSelesai: "15:30",
    materi: "PBB (Peraturan Baris Berbaris)",
    keterangan: "Latihan gerakan di tempat dan gerakan berjalan di lapangan sekolah dipimpin oleh Pratama Putra dan Pratama Putri secara bergantian.",
    absensiSiswa: { b1: true, b2: true, b3: true, b4: true, b5: true, b6: false, b7: true, b8: true },
    absensiSiswi: { g1: true, g2: false, g3: true, g4: true, g5: true, g6: true, g7: false, g8: true },
  }
];
