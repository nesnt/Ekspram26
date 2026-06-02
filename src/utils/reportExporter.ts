import JSZip from "jszip";
import { Activity, Student } from "../types";

// Indonesian Month Names
const indonesianMonths = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Indonesian Day Names
const indonesianDays = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
];

/**
 * Format date to dd/mm/yy (e.g. 12/03/26)
 */
function formatDDMMYY(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const yy = parts[0].substring(2); // Two-digit year
  const mm = parts[1];
  const dd = parts[2];
  return `${dd}/${mm}/${yy}`;
}

/**
 * Format date to "d Bulan YYYY" (e.g. 2 Mei 2026)
 */
function formatTanggalBulanTahun(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  const monthName = indonesianMonths[monthIdx] || "";
  return `${day} ${monthName} ${year}`;
}

/**
 * Format date to "Hari, d Bulan YYYY" (e.g. Sabtu, 2 Mei 2026)
 */
function formatHariTanggalBulanTahun(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  
  // Create date object in local timezone to avoid off-by-one errors
  const dateObj = new Date(y, m, d);
  const dayName = indonesianDays[dateObj.getDay()] || "";
  const monthName = indonesianMonths[m] || "";
  return `${dayName}, ${d} ${monthName} ${y}`;
}

/**
 * Helper to replace all occurrences of placeholders inside a single DOM Element (like w:p or w:tc).
 * Merges split text runs <w:t> in Word XML so that placeholders can be cleanly replaced.
 */
function replaceAllPlaceholdersInElement(element: Element, replacements: { [key: string]: string }): boolean {
  let text = element.textContent || "";
  let hasMatch = false;

  for (const [placeholder, value] of Object.entries(replacements)) {
    if (text.includes(placeholder)) {
      text = text.replaceAll(placeholder, value);
      hasMatch = true;
    }
  }

  if (hasMatch) {
    const tElements = element.getElementsByTagName("w:t");
    if (tElements.length > 0) {
      tElements[0].textContent = text;
      tElements[0].setAttribute("xml:space", "preserve");
      for (let i = 1; i < tElements.length; i++) {
        tElements[i].textContent = "";
      }
    }
    return true;
  }
  return false;
}

/**
 * Helper to replace all text in a cell with a new string
 */
function replaceCellText(cell: Element, text: string) {
  const tElements = cell.getElementsByTagName("w:t");
  if (tElements.length > 0) {
    tElements[0].textContent = text;
    tElements[0].setAttribute("xml:space", "preserve");
    for (let i = 1; i < tElements.length; i++) {
      tElements[i].textContent = "";
    }
  } else {
    // If no <w:t> exists, try to append one in a <w:p>
    const pElements = cell.getElementsByTagName("w:p");
    if (pElements.length > 0) {
      const rNode = cell.ownerDocument.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:r");
      const tNode = cell.ownerDocument.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:t");
      tNode.textContent = text;
      tNode.setAttribute("xml:space", "preserve");
      rNode.appendChild(tNode);
      pElements[0].appendChild(rNode);
    }
  }
}

/**
 * Find a row (<w:tr>) in the XML document that contains a specific text
 */
function findRowByText(xmlDoc: Document, text: string): Element | null {
  const rows = xmlDoc.getElementsByTagName("w:tr");
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.textContent && row.textContent.includes(text)) {
      return row;
    }
  }
  return null;
}

interface ExportReportParams {
  activities: Activity[];
  siswaList: Student[];
  siswiList: Student[];
  selectedBulan: string; // "01" - "12"
  selectedTahun: string; // "YYYY"
  pembinaName: string;
  kamabigusName: string;
  onProgress?: (progress: number) => void;
}

export async function exportReportToDocx({
  activities,
  siswaList,
  siswiList,
  selectedBulan,
  selectedTahun,
  pembinaName,
  kamabigusName,
  onProgress
}: ExportReportParams): Promise<Blob> {
  if (onProgress) onProgress(10);

  // 1. Fetch template from public folder
  const templateUrl = "/template_laporan/LAPORAN_BULANAN(Template).docx";
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error(`Gagal memuat template laporan. Hubungi administrator atau pastikan file template sudah ada di folder public/template_laporan.`);
  }
  
  if (onProgress) onProgress(30);
  const arrayBuffer = await response.arrayBuffer();

  // 2. Load zip content
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docXmlPath = "word/document.xml";
  const docXmlText = await zip.file(docXmlPath)?.async("text");
  if (!docXmlText) {
    throw new Error("Struktur file template Word tidak valid (word/document.xml tidak ditemukan).");
  }

  if (onProgress) onProgress(40);

  // 3. Parse XML string
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXmlText, "application/xml");

  // Get activities sorted by date for the selected month
  const filteredActivities = activities
    .filter((act) => {
      const parts = act.tanggal.split("-");
      return parts.length === 3 && parts[0] === selectedTahun && parts[1] === selectedBulan;
    })
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  // Attendance tables support up to 4 dates
  const activitiesForAttendance = filteredActivities.slice(0, 4);
  const selectedMonthName = indonesianMonths[parseInt(selectedBulan, 10) - 1] || "";

  // ==========================================
  // A. FIND AND DUPLICATE TABLE ROWS FIRST
  // ==========================================
  
  // 1. Trainer/Pelatih Row Template
  const pembinaRowTemplate = findRowByText(xmlDoc, "{judul kegiatan}");
  if (pembinaRowTemplate) {
    const parent = pembinaRowTemplate.parentNode;
    if (parent) {
      filteredActivities.forEach((act, idx) => {
        const clonedRow = pembinaRowTemplate.cloneNode(true) as Element;
        const cells = clonedRow.getElementsByTagName("w:tc");
        if (cells.length >= 4) {
          // Cell 0: Row number
          replaceCellText(cells[0], (idx + 1).toString());
          
          // Cell 1: Date, Cell 2: Time, Cell 3: Material
          const rowReplacements = {
            "{Tanggal tengan format [tanggal + nama bulan + tahun]}": formatTanggalBulanTahun(act.tanggal),
            "{waktu dengan format [jam mulai + “sd.” + jam selesai]}": `${act.waktuMulai} sd. ${act.waktuSelesai}`,
            "{waktu dengan format [jam mulai + \"sd.\" + jam selesai]}": `${act.waktuMulai} sd. ${act.waktuSelesai}`,
            "{waktu dengan format [jam mulai + ”sd.” + jam selesai]}": `${act.waktuMulai} sd. ${act.waktuSelesai}`,
            "{judul kegiatan}": act.materi
          };

          replaceAllPlaceholdersInElement(cells[1], rowReplacements);
          replaceAllPlaceholdersInElement(cells[2], rowReplacements);
          replaceAllPlaceholdersInElement(cells[3], rowReplacements);
        }
        parent.insertBefore(clonedRow, pembinaRowTemplate);
      });
      // Remove original row template
      parent.removeChild(pembinaRowTemplate);
    }
  }

  // Remove the "{dan seterusnya sesuai jumlah data}" row
  const danSeterusnyaRow = findRowByText(xmlDoc, "{dan seterusnya");
  if (danSeterusnyaRow) {
    danSeterusnyaRow.parentNode?.removeChild(danSeterusnyaRow);
  }

  if (onProgress) onProgress(60);

  // 2. Boys/Siswa Row Template
  const putraRowTemplate = findRowByText(xmlDoc, "{Nama Anggota putra}");
  if (putraRowTemplate) {
    const parent = putraRowTemplate.parentNode;
    if (parent) {
      // Sort boys alphabetically by name
      const sortedSiswa = [...siswaList].sort((a, b) => a.name.localeCompare(b.name));
      sortedSiswa.forEach((student) => {
        const clonedRow = putraRowTemplate.cloneNode(true) as Element;
        const cells = clonedRow.getElementsByTagName("w:tc");
        if (cells.length >= 6) {
          // Cell 0: Name
          replaceAllPlaceholdersInElement(cells[0], { "{Nama Anggota putra}": student.name });
          // Cell 1: Class
          replaceAllPlaceholdersInElement(cells[1], { "{Kelas}": student.kelas, "{kelas}": student.kelas });
          
          // Cells 2 to 5: Attendance checks for the first 4 meetings
          for (let i = 0; i < 4; i++) {
            const cell = cells[2 + i];
            if (i < activitiesForAttendance.length) {
              const act = activitiesForAttendance[i];
              const isPresent = act.absensiSiswa[student.id] === true;
              replaceCellText(cell, isPresent ? "✓" : ""); // Checkmark for present, empty for absent
            } else {
              replaceCellText(cell, "");
            }
          }
        }
        parent.insertBefore(clonedRow, putraRowTemplate);
      });
      parent.removeChild(putraRowTemplate);
    }
  }

  // 3. Girls/Siswi Row Template
  const putriRowTemplate = findRowByText(xmlDoc, "{Nama Anggota putri}");
  if (putriRowTemplate) {
    const parent = putriRowTemplate.parentNode;
    if (parent) {
      // Sort girls alphabetically by name
      const sortedSiswi = [...siswiList].sort((a, b) => a.name.localeCompare(b.name));
      sortedSiswi.forEach((student) => {
        const clonedRow = putriRowTemplate.cloneNode(true) as Element;
        const cells = clonedRow.getElementsByTagName("w:tc");
        if (cells.length >= 6) {
          // Cell 0: Name
          replaceAllPlaceholdersInElement(cells[0], { "{Nama Anggota putri}": student.name });
          // Cell 1: Class
          replaceAllPlaceholdersInElement(cells[1], { "{Kelas}": student.kelas, "{kelas}": student.kelas });
          
          // Cells 2 to 5: Attendance checks
          for (let i = 0; i < 4; i++) {
            const cell = cells[2 + i];
            if (i < activitiesForAttendance.length) {
              const act = activitiesForAttendance[i];
              const isPresent = act.absensiSiswi[student.id] === true;
              replaceCellText(cell, isPresent ? "✓" : "");
            } else {
              replaceCellText(cell, "");
            }
          }
        }
        parent.insertBefore(clonedRow, putriRowTemplate);
      });
      parent.removeChild(putriRowTemplate);
    }
  }

  if (onProgress) onProgress(80);

  // ==========================================
  // B. GLOBAL DOCUMENT PLACEHOLDERS
  // ==========================================
  const globalReplacements: { [key: string]: string } = {
    // Period details
    "{sesuai bulan dipilih}": selectedMonthName.toUpperCase(),
    "{sesuai tahun}": selectedTahun,
    "{sesuai bulan dengan format [bulan + tahun]}": `${selectedMonthName} ${selectedTahun}`,

    // Putra header dates (dd/mm/yy)
    "{tanggal kegiatan 1 format [tanggal/bulan/tahun]}": activitiesForAttendance[0] ? formatDDMMYY(activitiesForAttendance[0].tanggal) : "",
    "{tanggal kegiatan 2 [tanggal/bulan/tahun]}": activitiesForAttendance[1] ? formatDDMMYY(activitiesForAttendance[1].tanggal) : "",
    "{tanggal kegiatan 3 [tanggal/bulan/tahun]}": activitiesForAttendance[2] ? formatDDMMYY(activitiesForAttendance[2].tanggal) : "",
    "{tanggal kegiatan 4 [tanggal/bulan/tahun]}": activitiesForAttendance[3] ? formatDDMMYY(activitiesForAttendance[3].tanggal) : "",

    // Putri header dates (dd/mm/yy)
    "{tanggal kegiatan 1 [tanggal/bulan/tahun]}": activitiesForAttendance[0] ? formatDDMMYY(activitiesForAttendance[0].tanggal) : "",
    
    // Custom Dynamic Signatures (Replacing static names)
    "Maya Kusmayanti M, P.d": kamabigusName,
    "Maya Kusmayanti M, P.d.": kamabigusName,
    "Maya Kusmayanti M,": kamabigusName, // Split handle part 1
    "P.d": "",                          // Split handle part 2 (cleared since part 1 has the full name)
    "Vicky Umbara, S.Pd": pembinaName,

    // Documentation placeholder cleanups (as requested, photos are omitted for now)
    "{gambar kegiatan 1}": "",
    "{gambar kegiatan 2}": "",
    "{gambar kegiatan 3}": "",
    "{gambar kegiatan 4}": "",
    "{jumlah dokumentasi menyesuaikan kegiatan yang ada}": ""
  };

  // Add documentation date placeholders
  for (let i = 0; i < 4; i++) {
    const key = `{tanggal kegiatan ${i + 1} dengan format [hari, tanggal + nama bulan + tahun]}`;
    if (i < filteredActivities.length) {
      globalReplacements[key] = formatHariTanggalBulanTahun(filteredActivities[i].tanggal);
    } else {
      globalReplacements[key] = "";
    }
  }

  // Iterate over all paragraphs and run replacements
  const paragraphs = xmlDoc.getElementsByTagName("w:p");
  for (let i = 0; i < paragraphs.length; i++) {
    replaceAllPlaceholdersInElement(paragraphs[i], globalReplacements);
  }

  if (onProgress) onProgress(90);

  // 4. Serialize back to XML
  const serializer = new XMLSerializer();
  const newXmlText = serializer.serializeToString(xmlDoc);

  // 5. Update the ZIP with the modified document.xml
  zip.file(docXmlPath, newXmlText);

  // 6. Generate the binary file
  const outputBlob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });

  if (onProgress) onProgress(100);
  return outputBlob;
}
