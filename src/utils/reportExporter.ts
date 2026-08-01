import JSZip from "jszip";
import { Activity, Student } from "../types";
import { getAccessToken } from "../gdrive";

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

function replaceParagraphWithTable(p: Element, leftText1: string, rightText1: string, leftText2: string, rightText2: string, leftText3: string, rightText3: string) {
  const doc = p.ownerDocument;
  const tblXml = `
    <w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:tblPr>
        <w:tblW w:w="9000" w:type="dxa"/>
        <w:jc w:val="center"/>
        <w:tblBorders>
          <w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="0" w:type="dxa"/>
          <w:left w:w="108" w:type="dxa"/>
          <w:bottom w:w="0" w:type="dxa"/>
          <w:right w:w="108" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4500"/>
        <w:gridCol w:w="4500"/>
      </w:tblGrid>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:t>${leftText1}</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:t>${rightText1}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:spacing w:before="1000"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/><w:b/><w:u w:val="single"/></w:rPr><w:t>${leftText2}</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:spacing w:before="1000"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/><w:b/><w:u w:val="single"/></w:rPr><w:t>${rightText2}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:t>${leftText3}</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:t>${rightText3}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
  `;
  const parser = new DOMParser();
  const tblDoc = parser.parseFromString(tblXml, "application/xml");
  const newTbl = tblDoc.documentElement;
  
  if (p.parentNode && newTbl) {
    const importedNode = doc.importNode(newTbl, true);
    p.parentNode.insertBefore(importedNode, p);
    p.parentNode.removeChild(p);
  }
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

/**
 * Fetch image from Google Drive as ArrayBuffer using OAuth token.
 * Returns null if token unavailable or fetch fails.
 */
async function fetchDriveImageAsBuffer(fileId: string): Promise<{ buffer: ArrayBuffer; mimeType: string } | null> {
  if (!fileId || fileId.startsWith("data:") || fileId.startsWith("http")) return null;

  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) return null;
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();
    return { buffer, mimeType };
  } catch {
    return null;
  }
}

/**
 * Build a <w:drawing> XML string that references an embedded image by relationship ID.
 * cx/cy are in EMUs (English Metric Units). 1cm ≈ 360000 EMU.
 */
function buildDrawingXml(rId: string, cx = 5400000, cy = 3600000): string {
  return `<w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
      <wp:extent cx="${cx}" cy="${cy}"/>
      <wp:effectExtent l="0" t="0" r="0" b="0"/>
      <wp:docPr id="1" name="Foto Kegiatan"/>
      <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
          <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:nvPicPr>
              <pic:cNvPr id="0" name="Foto"/>
              <pic:cNvPicPr/>
            </pic:nvPicPr>
            <pic:blipFill>
              <a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
              <a:stretch><a:fillRect/></a:stretch>
            </pic:blipFill>
            <pic:spPr>
              <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
              <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            </pic:spPr>
          </pic:pic>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  </w:drawing>`;
}

/**
 * Find a paragraph containing specific text and replace its content with a drawing XML node.
 */
function replaceParagraphWithImage(xmlDoc: Document, placeholder: string, drawingXml: string): boolean {
  const paragraphs = xmlDoc.getElementsByTagName("w:p");
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    if (p.textContent && p.textContent.includes(placeholder)) {
      // Clear all runs in this paragraph
      const runs = p.getElementsByTagName("w:r");
      while (runs.length > 0) {
        runs[0].parentNode?.removeChild(runs[0]);
      }
      // Parse the drawing XML and append
      const parser = new DOMParser();
      const drawingDoc = parser.parseFromString(`<root xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${drawingXml}</root>`, "application/xml");
      const drawingNode = drawingDoc.documentElement.firstChild;
      if (drawingNode) {
        const run = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:r");
        const imported = xmlDoc.importNode(drawingNode, true);
        run.appendChild(imported);
        p.appendChild(run);
      }
      return true;
    }
  }
  return false;
}

/**
 * Read existing relationships from word/_rels/document.xml.rels and return next available rId number.
 */
async function getNextRId(zip: JSZip): Promise<number> {
  const relsPath = "word/_rels/document.xml.rels";
  const relsText = await zip.file(relsPath)?.async("text") || "";
  const matches = relsText.match(/Id="rId(\d+)"/g) || [];
  let maxId = 0;
  matches.forEach(m => {
    const num = parseInt(m.replace(/[^0-9]/g, ""), 10);
    if (num > maxId) maxId = num;
  });
  return maxId + 1;
}

/**
 * Add image to ZIP and register relationship. Returns the rId string.
 */
async function addImageToZip(
  zip: JSZip,
  imageBuffer: ArrayBuffer,
  mimeType: string,
  imageIndex: number,
  startRId: number
): Promise<string> {
  const ext = mimeType.includes("png") ? "png" : mimeType.includes("gif") ? "gif" : "jpg";
  const imageName = `foto_kegiatan_${imageIndex}.${ext}`;
  const imagePath = `word/media/${imageName}`;

  zip.file(imagePath, imageBuffer);

  const rId = `rId${startRId}`;
  const relsPath = "word/_rels/document.xml.rels";
  let relsText = await zip.file(relsPath)?.async("text") || `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;

  const newRel = `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${imageName}"/>`;
  relsText = relsText.replace("</Relationships>", `${newRel}</Relationships>`);
  zip.file(relsPath, relsText);

  return rId;
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
  // Use import.meta.env.BASE_URL to support Vite base path config (e.g. /Ekspram26/)
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const templateUrl = `${base}/template_laporan/LAPORAN_BULANAN_Template.docx`;
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

  // Remove all "{dan seterusnya sesuai jumlah data}" rows across all tables
  const allTrsForCleanup = xmlDoc.getElementsByTagName("w:tr");
  for (let i = allTrsForCleanup.length - 1; i >= 0; i--) {
    const tr = allTrsForCleanup[i];
    if (tr.textContent && tr.textContent.includes("{dan seterusnya")) {
      tr.parentNode?.removeChild(tr);
    }
  }
  
  // Also search for it in paragraphs and remove the paragraph if found
  const allParagraphs = xmlDoc.getElementsByTagName("w:p");
  for (let i = allParagraphs.length - 1; i >= 0; i--) {
    const p = allParagraphs[i];
    if (p.textContent && p.textContent.includes("{dan seterusnya")) {
      p.parentNode?.removeChild(p);
    }
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

  // Helper to remove a table and its title paragraph if no students
  const removeEmptyAttendanceTable = (type: "PUTRA" | "PUTRI") => {
    const allDocParagraphs = xmlDoc.getElementsByTagName("w:p");
    for (let i = 0; i < allDocParagraphs.length; i++) {
      const p = allDocParagraphs[i];
      if (p.textContent && p.textContent.trim() === type) {
        const prev = p.previousSibling;
        if (prev && prev.nodeName === "w:p" && prev.textContent?.trim() === "DAFTAR HADIR") {
          // Found it! Delete 'DAFTAR HADIR'
          prev.parentNode?.removeChild(prev);
          // Find the next table
          let next = p.nextSibling;
          while (next) {
            if (next.nodeName === "w:tbl") {
              next.parentNode?.removeChild(next);
              break;
            }
            next = next.nextSibling;
          }
          p.parentNode?.removeChild(p); // Delete 'PUTRA'/'PUTRI'
          break;
        }
      }
    }
  };

  if (siswaList.length === 0) {
    removeEmptyAttendanceTable("PUTRA");
  }
  if (siswiList.length === 0) {
    removeEmptyAttendanceTable("PUTRI");
  }

  // Remove all explicit page breaks to prevent blank pages
  const pageBreaks = xmlDoc.getElementsByTagName("w:br");
  for (let i = pageBreaks.length - 1; i >= 0; i--) {
    if (pageBreaks[i].getAttribute("w:type") === "page") {
      pageBreaks[i].parentNode?.removeChild(pageBreaks[i]);
    }
  }

  // Also remove all soft page breaks, as Google Docs misinterprets them as hard page breaks!
  const softBreaks = xmlDoc.getElementsByTagName("w:lastRenderedPageBreak");
  for (let i = softBreaks.length - 1; i >= 0; i--) {
    softBreaks[i].parentNode?.removeChild(softBreaks[i]);
  }

  // Safely force Putra, Putri, and Dokumentasi to start on new pages using pageBreakBefore
  const pNodes = xmlDoc.getElementsByTagName("w:p");
  const docParagraphsForBreaks: Element[] = [];
  for (let i = 0; i < pNodes.length; i++) {
    docParagraphsForBreaks.push(pNodes[i]);
  }
  
  // Iterate backwards safely on the static array
  for (let i = docParagraphsForBreaks.length - 1; i >= 0; i--) {
    const p = docParagraphsForBreaks[i];
    if (!p.parentNode) continue; // Skip if this node was already deleted
    
    const text = p.textContent?.trim();
    if (text === "PUTRA" || text === "PUTRI" || text === "DOKUMENTASI KEGIATAN") {
      const titleP = p.previousSibling;
      if (titleP && titleP.nodeName === "w:p") {
        let pPr = (titleP as Element).getElementsByTagName("w:pPr")[0];
        if (!pPr) {
          pPr = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:pPr");
          titleP.insertBefore(pPr, titleP.firstChild);
        }
        let pbb = pPr.getElementsByTagName("w:pageBreakBefore")[0];
        if (!pbb) {
          pbb = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:pageBreakBefore");
          pPr.appendChild(pbb);
        }
        
        // Clean up empty paragraphs BEFORE titleP to prevent them from causing blank pages
        let prev = titleP.previousSibling;
        while (prev && prev.nodeName === "w:p" && (!prev.textContent || prev.textContent.trim() === "")) {
          const toDelete = prev;
          prev = prev.previousSibling;
          // Only delete if it doesn't contain images/drawings
          if (toDelete.getElementsByTagName("w:drawing").length === 0 && toDelete.getElementsByTagName("v:shape").length === 0) {
            toDelete.parentNode?.removeChild(toDelete);
          }
        }
      }
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
    "{tanggal kegiatan 1 [tanggal/bulan/tahun]}": activitiesForAttendance[0] ? formatDDMMYY(activitiesForAttendance[0].tanggal) : ""
  };

  // ==========================================
  // B. REBUILD SIGNATURES WITH TABLE
  // ==========================================
  const allDocParagraphs = xmlDoc.getElementsByTagName("w:p");
  let sigTitleP = null;
  let sigNameP = null;
  let sigNipP = null;
  
  for (let i = 0; i < allDocParagraphs.length; i++) {
    const p = allDocParagraphs[i];
    const text = p.textContent || "";
    if (text.includes("Wakasek Bid. Kesiswaan") && text.includes("Pelatih Pramuka")) {
      sigTitleP = p;
    } else if (text.includes("Maya Kusmayanti") && text.includes("Vicky Umbara")) {
      sigNameP = p;
    } else if (text.includes("NIP.") && text.includes("NTA.")) {
      sigNipP = p;
    }
  }

  if (sigTitleP) {
     let nipStr = "NIP. 198105072010012015";
     let ntaStr = "NTA. 09 19 25 830606 00001";
     if (sigNipP) {
        const text = sigNipP.textContent || "";
        const nipMatch = text.match(/NIP\.\s*\d+/);
        const ntaMatch = text.match(/NTA\.\s*[\d\s]+/);
        if (nipMatch) nipStr = nipMatch[0];
        if (ntaMatch) ntaStr = ntaMatch[0];
     }
     
     replaceParagraphWithTable(sigTitleP, "Wakasek Bid. Kesiswaan", "Pelatih Pramuka", kamabigusName, pembinaName, nipStr, ntaStr);
     if (sigNameP && sigNameP.parentNode) sigNameP.parentNode.removeChild(sigNameP);
     if (sigNipP && sigNipP.parentNode) sigNipP.parentNode.removeChild(sigNipP);
  }

  // ==========================================
  // C. FIX TABLE COLUMN WIDTHS
  // ==========================================
  // The template has distorted column widths for the Putra and Putri tables due to the long placeholders.
  // We will force them back to the correct widths from example.docx.
  const allTables = xmlDoc.getElementsByTagName("w:tbl");
  if (allTables.length >= 3) {
    const applyWidthsToTable = (tbl: Element, correctWidths: string[]) => {
      const doc = tbl.ownerDocument;
      
      // Force Fixed Layout to prevent AutoFit from breaking our widths
      let tblPr = tbl.getElementsByTagName("w:tblPr")[0];
      if (!tblPr) {
        tblPr = doc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:tblPr");
        tbl.insertBefore(tblPr, tbl.firstChild);
      }
      let tblLayout = tblPr.getElementsByTagName("w:tblLayout")[0];
      if (!tblLayout) {
        tblLayout = doc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:tblLayout");
        tblPr.appendChild(tblLayout);
      }
      tblLayout.setAttribute("w:type", "fixed");

      // Fix w:tblGrid
      const grid = tbl.getElementsByTagName("w:tblGrid")[0];
      if (grid) {
        const cols = grid.getElementsByTagName("w:gridCol");
        if (cols.length === correctWidths.length) {
          for (let i = 0; i < correctWidths.length; i++) {
            cols[i].setAttribute("w:w", correctWidths[i]);
          }
        }
      }
      
      // Fix w:tcW for all cells
      const rows = tbl.getElementsByTagName("w:tr");
      for (let r = 0; r < rows.length; r++) {
        const cells = rows[r].getElementsByTagName("w:tc");
        if (cells.length === correctWidths.length) {
          for (let c = 0; c < correctWidths.length; c++) {
            const tcPr = cells[c].getElementsByTagName("w:tcPr")[0];
            if (tcPr) {
              const tcW = tcPr.getElementsByTagName("w:tcW")[0];
              if (tcW) {
                tcW.setAttribute("w:w", correctWidths[c]);
                tcW.setAttribute("w:type", "dxa");
              }
            }
          }
        } else if (cells.length === 5 && r === 0 && correctWidths.length === 6) {
           const headerWidths = ["3980", "1120", "1180", "2300", "1180"];
           for (let c = 0; c < 5; c++) {
             const tcPr = cells[c].getElementsByTagName("w:tcPr")[0];
             if (tcPr) {
               const tcW = tcPr.getElementsByTagName("w:tcW")[0];
               if (tcW) {
                 tcW.setAttribute("w:w", headerWidths[c]);
                 tcW.setAttribute("w:type", "dxa");
               }
             }
           }
        }
      }
    };

    for (let i = 0; i < allTables.length; i++) {
      const tbl = allTables[i];
      const text = tbl.textContent || "";
      
      // Identify Pelatih table by its unique headers
      if (text.includes("WAKTU") && text.includes("KETERANGAN MATERI")) {
        applyWidthsToTable(tbl, ["560", "1800", "1380", "2840", "1840"]);
      }
      // Identify Putra and Putri attendance tables by their headers
      else if (text.includes("Nama") && text.includes("Kelas") && text.includes("Tanggal")) {
        applyWidthsToTable(tbl, ["3980", "1120", "1180", "1160", "1140", "1180"]);
      }
    }
  }

  // ==========================================
  // D. EMBED PHOTOS & DYNAMIC DOCUMENTATION BLOCKS
  // ==========================================
  let nextRId = await getNextRId(zip);

  const docParagraphs = xmlDoc.getElementsByTagName("w:p");
  let dateP: Element | null = null;
  let imageP: Element | null = null;
  let captionP: Element | null = null;
  let footerP: Element | null = null;

  for (let i = 0; i < docParagraphs.length; i++) {
    const text = docParagraphs[i].textContent || "";
    if (text.includes("{tanggal kegiatan 1 dengan format")) {
      dateP = docParagraphs[i];
    } else if (text.includes("{gambar kegiatan 1}")) {
      imageP = docParagraphs[i];
    } else if (text.includes("Gambar 1.0")) {
      captionP = docParagraphs[i];
    } else if (text.includes("{jumlah dokumentasi menyesuaikan kegiatan yang ada}")) {
      footerP = docParagraphs[i];
    }
  }

  if (dateP && imageP && captionP) {
    const parent = dateP.parentNode;
    if (parent) {
      const maxActivities = Math.min(filteredActivities.length, 4);
      for (let i = 0; i < maxActivities; i++) {
        const act = filteredActivities[i];
        
        const newDateP = dateP.cloneNode(true) as Element;
        const newImageP = imageP.cloneNode(true) as Element;
        const newCaptionP = captionP.cloneNode(true) as Element;

        // Replace text in newDateP
        replaceAllPlaceholdersInElement(newDateP, {
          "{tanggal kegiatan 1 dengan format [hari, tanggal + nama bulan + tahun]}": formatHariTanggalBulanTahun(act.tanggal)
        });

        // Prepare newImageP
        while (newImageP.firstChild) {
          newImageP.removeChild(newImageP.firstChild);
        }

        // Prepare newCaptionP
        while (newCaptionP.firstChild) {
          newCaptionP.removeChild(newCaptionP.firstChild);
        }

        const fotosToProcess = [];
        if (act.foto) fotosToProcess.push(act.foto);
        if (act.foto2) fotosToProcess.push(act.foto2);

        for (let f = 0; f < fotosToProcess.length; f++) {
          const fotoData = fotosToProcess[f];
          let rId: string | null = null;

          if (!fotoData.startsWith("data:") && !fotoData.startsWith("http")) {
            const result = await fetchDriveImageAsBuffer(fotoData);
            if (result) {
              rId = await addImageToZip(zip, result.buffer, result.mimeType, nextRId, nextRId);
              nextRId++;
            }
          } else if (fotoData.startsWith("data:")) {
            const [header, base64Data] = fotoData.split(",");
            const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
            const binary = atob(base64Data);
            const buffer = new ArrayBuffer(binary.length);
            const view = new Uint8Array(buffer);
            for (let j = 0; j < binary.length; j++) view[j] = binary.charCodeAt(j);
            rId = await addImageToZip(zip, buffer, mimeType, nextRId, nextRId);
            nextRId++;
          }

          if (rId) {
             const scale = fotosToProcess.length > 1 ? 0.32 : 1.0; 
             const cx = Math.floor(5400000 * scale);
             const cy = Math.floor(3600000 * scale);
             const drawingXml = buildDrawingXml(rId, cx, cy); 
             
             const parser = new DOMParser();
             const drawingDoc = parser.parseFromString(`<root xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${drawingXml}</root>`, "application/xml");
             const drawingNode = drawingDoc.documentElement.firstChild;
             
             if (drawingNode) {
               const r = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:r");
               const imported = xmlDoc.importNode(drawingNode, true);
               r.appendChild(imported);
               newImageP.appendChild(r);

               // Add caption text for this image
               const rCaption = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:r");
               const rPrCaption = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:rPr");
               const rFonts = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:rFonts");
               rFonts.setAttribute("w:ascii", "Times New Roman");
               rFonts.setAttribute("w:hAnsi", "Times New Roman");
               rPrCaption.appendChild(rFonts);
               rCaption.appendChild(rPrCaption);

               const tCaption = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:t");
               tCaption.textContent = `Gambar ${i + 1}.${f}`;
               rCaption.appendChild(tCaption);
               newCaptionP.appendChild(rCaption);

               if (f === 0 && fotosToProcess.length > 1) {
                  // Add Tab for Image
                  const rTabImg = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:r");
                  const tabImg = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:tab");
                  rTabImg.appendChild(tabImg);
                  newImageP.appendChild(rTabImg);

                  // Add Tab for Caption
                  const rTabCap = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:r");
                  const tabCap = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:tab");
                  rTabCap.appendChild(tabCap);
                  newCaptionP.appendChild(rTabCap);
               }
             }
          }
        }
        
        // Add tab stops to the newImageP
        const pPrImg = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:pPr");
        const tabsImg = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:tabs");
        const tabImg = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:tab");
        tabImg.setAttribute("w:val", "center");
        tabImg.setAttribute("w:pos", "5198");
        tabsImg.appendChild(tabImg);
        pPrImg.appendChild(tabsImg);
        newImageP.insertBefore(pPrImg, newImageP.firstChild);

        // Add tab stops to the newCaptionP
        const pPrCap = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:pPr");
        const tabsCap = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:tabs");
        const tabCap = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:tab");
        tabCap.setAttribute("w:val", "center");
        tabCap.setAttribute("w:pos", "5198");
        tabsCap.appendChild(tabCap);
        pPrCap.appendChild(tabsCap);
        newCaptionP.insertBefore(pPrCap, newCaptionP.firstChild);
        
        
        if (footerP) {
          parent.insertBefore(newDateP, footerP);
          parent.insertBefore(newImageP, footerP);
          parent.insertBefore(newCaptionP, footerP);
          
          const emptyP = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:p");
          parent.insertBefore(emptyP, footerP);
        } else {
          parent.appendChild(newDateP);
          parent.appendChild(newImageP);
          parent.appendChild(newCaptionP);
        }
      }

      parent.removeChild(dateP);
      parent.removeChild(imageP);
      parent.removeChild(captionP);
      if (footerP) parent.removeChild(footerP);
    }
  }

  // Clear any left-over placeholders in globalReplacements just in case
  for (let i = 0; i < 4; i++) {
    globalReplacements[`{gambar kegiatan ${i + 1}}`] = "";
    globalReplacements[`{tanggal kegiatan ${i + 1} dengan format [hari, tanggal + nama bulan + tahun]}`] = "";
  }
  globalReplacements["{jumlah dokumentasi menyesuaikan kegiatan yang ada}"] = "";

  // Iterate over all paragraphs and run replacements
  const paragraphs = xmlDoc.getElementsByTagName("w:p");
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    // If the paragraph has tabs (like signatures), process run-by-run to avoid destroying tab alignment
    if (p.getElementsByTagName("w:tab").length > 0) {
      const runs = p.getElementsByTagName("w:r");
      for (let j = 0; j < runs.length; j++) {
        replaceAllPlaceholdersInElement(runs[j], globalReplacements);
      }
    } else {
      replaceAllPlaceholdersInElement(p, globalReplacements);
    }
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
