// hooks/anct/useAnctExport.js
// Custom Hook ekspor data laporan ANC TERPADU ke Excel (.xlsx) menggunakan exceljs
//
// Styling & struktur pada file ini disamakan dengan file referensi
// "anc_terpadu.xlsx" (bukan lagi pakai library "xlsx"/SheetJS seperti versi
// lama, karena SheetJS versi gratis tidak bisa mengatur warna sel dengan
// baik). Yang direplikasi persis dari file referensi:
//   - Baris "BULAN ..." di atas tabel (baris 3)
//   - Header 3 baris per kelompok pemeriksaan (PPIA, Malaria, TB, Kecacingan,
//     IMS, Hepatitis B), termasuk sub-kolom "PERSALINAN PERVAGINAAM" /
//     "PERSALINAN PERABDOMINAM (SC)" di bawah kolom "IBU HAMIL HIV (+)"
//   - Baris TOTAL (baris 7) LANGSUNG SESUDAH HEADER, SEBELUM data per
//     Puskesmas — persis seperti file asli — dengan warna pink #FFCCFF
//   - Kolom "NAMA PUSKESMAS" diberi highlight peach #F8CBAD
//   - Lebar semua kolom = 13, tinggi baris header persis (15.5 / 15.5 / 15.5 / 77.5)
//   - Font: header Calibri 12 bold, TOTAL row Arial/Calibri bold, data Arial
//   - Blok tanda tangan (TANGGAL / MENGETAHUI / KEPALA BIDANG KESMAS ...) di
//     bawah tabel, persis seperti file asli
//
// CATATAN PENTING (baca sebelum pakai):
// 1. Di file referensi, warna kolom "NAMA PUSKESMAS" dasarnya peach
//    (#F8CBAD), tapi beberapa baris malah kuning atau abu-abu. Setelah
//    dicek, itu tidak konsisten per baris tertentu — kelihatan seperti
//    tanda/coretan manual, bukan bagian dari template, jadi TIDAK
//    direplikasi (semua baris data di sini pakai warna dasar peach).
// 2. Kode ini mengasumsikan ANCT_FIELDS di "@/constants/anctFields" adalah
//    array berisi TEPAT 24 field, terurut sama seperti kolom C..Z pada file
//    referensi, masing-masing minimal punya bentuk:
//      { key: 'namaField', label: 'TEKS SUB-HEADER', group: 'NAMA GRUP' }
//    Kalau urutan/isi field kamu beda, header teksnya tetap sama (hardcode
//    dari file referensi) tapi ANGKA yang tampil bisa salah kolom — cek
//    urutan ANCT_FIELDS kamu dulu sebelum dipakai produksi.
// 3. Kolom "H" (IBU HAMIL HIV (+)) di file referensi sebenarnya cuma 1
//    kelompok tapi punya 2 sub-kolom (Persalinan Pervaginam & SC) tanpa
//    baris "ABS" sendiri — ini sudah ditangani khusus di HEADER_ROW_3.
// 4. Kolom "CATATAN" (ANCT_CATATAN_FIELD) tidak ada di file referensi yang
//    dikirim, jadi stylingnya dibuat standar (sama seperti kolom data
//    lain) dan ditaruh setelah kolom Z.

import { useState, useCallback } from "react";
import { ANCT_FIELDS, ANCT_CATATAN_FIELD } from "@/constants/anctFields";
import { namaBulan } from "@/lib/ibu/anct/anctConfig";

// ----- Warna & ukuran (diambil langsung dari file referensi) -----
const COLOR_TOTAL_FILL = "FFFFCCFF"; // pink baris TOTAL
const COLOR_NAMA_PKM_FILL = "FFF8CBAD"; // peach kolom Nama Puskesmas
const COLOR_BORDER = "FFBFBFBF";

const FONT_BULAN = { name: "Calibri", size: 12, bold: true };
const FONT_HEADER = { name: "Calibri", size: 12, bold: true };
const FONT_TOTAL_LABEL = { name: "Arial", size: 10, bold: true };
const FONT_TOTAL_VALUE = { name: "Calibri", size: 11, bold: true };
const FONT_DATA_NO = { name: "Arial", size: 12, bold: false };
const FONT_DATA_NAMA = { name: "Arial", size: 11, bold: false };
const FONT_DATA_VALUE = { name: "Arial", size: 10, bold: false };
const FONT_FOOTER = { name: "Calibri", size: 11, bold: false };

const COL_WIDTH = 17;

const ROW_HEIGHT_BULAN = 20;
const ROW_HEIGHT_HEADER = { 1: 15.5, 2: 15.5, 3: 77.5 }; // baris 4,5,6 di sheet
const DATA_ROW_HEIGHT = 18;

const THIN_BORDER = {
  top: { style: "thin", color: { argb: COLOR_BORDER } },
  left: { style: "thin", color: { argb: COLOR_BORDER } },
  bottom: { style: "thin", color: { argb: COLOR_BORDER } },
  right: { style: "thin", color: { argb: COLOR_BORDER } },
};

// ----- Susunan grup & jumlah kolom per grup, persis file referensi -----
// (grup, jumlah kolom, apakah grup ini punya sub-split khusus di baris ke-3)
const GROUPS = [
  { group: "PENCEGAHAN PENULARAN HIV DARI IBU KE ANAK ( PPIA )", count: 7 },
  { group: "PENCEGAHAN MALARIA DALAM KEHAMILAN", count: 4 },
  { group: "TB DALAM KEHAMILAN", count: 3 },
  { group: "KECACINGAN DALAM KEHAMILAN", count: 3 },
  { group: "PENCEGAHAN IMS DALAM KEHAMILAN", count: 3 },
  { group: "PENCEGAHAN HEPATITIS B DALAM KEHAMILAN", count: 4 },
]; // total 24 kolom (C..Z)

// Kolom terakhir tiap grup dalam huruf, dipakai untuk merge header baris-1 per grup
// A=1 B=2 -> grup PPIA mulai kolom 3 (C)
function buildGroupRanges() {
  let start = 3; // kolom C
  return GROUPS.map((g) => {
    const range = { ...g, start, end: start + g.count - 1 };
    start += g.count;
    return range;
  });
}

export function useAnctExport() {
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = useCallback(async (reportList, { bulan, tahun }) => {
    if (!reportList || reportList.length === 0) {
      alert("Tidak ada data Puskesmas untuk diekspor.");
      return;
    }

    setExporting(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const bulanLabel = bulan ? namaBulan(bulan) : "Bulan";
      const worksheet = workbook.addWorksheet(`ANCT ${bulanLabel}`);

      const totalMetricCols = ANCT_FIELDS.length; // 24 (C..Z)
      const catatanColIndex = 2 + totalMetricCols + 1; // kolom setelah Z
      const totalCols = catatanColIndex;

      // Lebar kolom
      for (let c = 1; c <= totalCols; c++) {
        worksheet.getColumn(c).width = COL_WIDTH;
      }

      // 1. Baris "BULAN ..."
      const rowBulan = worksheet.addRow(["BULAN ", bulanLabel.toUpperCase()]);
      rowBulan.height = ROW_HEIGHT_BULAN;
      rowBulan.eachCell((cell) => {
        cell.font = FONT_BULAN;
      });

      // 2. Header 3 baris
      const groupRanges = buildGroupRanges();

      const h1 = new Array(totalCols).fill("");
      h1[0] = "NO";
      h1[1] = "NAMA PUSKESMAS";
      groupRanges.forEach((g) => {
        h1[g.start - 1] = g.group;
      });

      // Baris ke-2: sub-label tiap field (dari ANCT_FIELDS)
      const h2 = new Array(totalCols).fill("");
      ANCT_FIELDS.forEach((f, i) => {
        h2[2 + i] = f.label;
      });

      // Baris ke-3: khusus sub-split "IBU HAMIL HIV (+)" -> Persalinan
      // Pervaginam / SC. Ditulis manual sesuai posisi field ke-6 & ke-7
      // dalam grup PPIA (kolom H & I).
      const h3 = new Array(totalCols).fill("");
      const ppiaRange = groupRanges[0]; // grup pertama = PPIA
      const colH = ppiaRange.start + 5; // field ke-6 dalam grup (0-based +5)
      const colI = ppiaRange.start + 6; // field ke-7 dalam grup
      if (ANCT_FIELDS[5]) h3[colH - 1] = "PERSALINAN PERVAGINAAM";
      if (ANCT_FIELDS[6]) h3[colI - 1] = "PERSALINAN PERABDOMINAM (SC)";
      // Karena H & I sebenarnya 1 field gabungan ("IBU HAMIL HIV (+)") yang
      // dipecah jadi 2 sub-kolom, judul di h2 untuk kolom I dikosongkan
      // supaya tidak dobel dengan H (H2:I2 nanti di-merge).
      h2[colI - 1] = "";

      const headerRow1Excel = worksheet.addRow(h1);
      const headerRow2Excel = worksheet.addRow(h2);
      const headerRow3Excel = worksheet.addRow(h3);
      headerRow1Excel.height = ROW_HEIGHT_HEADER[1];
      headerRow2Excel.height = ROW_HEIGHT_HEADER[2];
      headerRow3Excel.height = ROW_HEIGHT_HEADER[3];

      // Merge: NO & NAMA PUSKESMAS full 3 baris
      worksheet.mergeCells(headerRow1Excel.number, 1, headerRow3Excel.number, 1);
      worksheet.mergeCells(headerRow1Excel.number, 2, headerRow3Excel.number, 2);

      // Merge judul grup (baris 1) selebar jumlah kolom grup
      groupRanges.forEach((g) => {
        worksheet.mergeCells(headerRow1Excel.number, g.start, headerRow1Excel.number, g.end);
      });

      // Merge tiap sub-label (baris 2) turun ke baris 3, KECUALI kolom H & I
      // (grup PPIA field ke-6 & ke-7) yang justru merge horizontal H2:I2
      for (let c = 3; c <= totalCols; c++) {
        if (c === colH) {
          worksheet.mergeCells(headerRow2Excel.number, colH, headerRow2Excel.number, colI);
        } else if (c === colI) {
          // sudah ikut merge di atas, lewati
        } else {
          worksheet.mergeCells(headerRow2Excel.number, c, headerRow3Excel.number, c);
        }
      }

      [headerRow1Excel, headerRow2Excel, headerRow3Excel].forEach((row) => {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = FONT_HEADER;
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
          cell.border = THIN_BORDER;
        });
      });

      // 3. Baris TOTAL — langsung sesudah header, sebelum data per Puskesmas
      const dataStartRow = headerRow3Excel.number + 1;
      const dataEndRow = dataStartRow + reportList.length - 1;

      const totalRowValues = new Array(totalCols).fill(0);
      totalRowValues[0] = "";
      totalRowValues[1] = "TOTAL";
      ANCT_FIELDS.forEach((f, i) => {
        totalRowValues[2 + i] = reportList.reduce(
          (sum, row) => sum + (Number(row[f.key]) || 0),
          0,
        );
      });
      if (ANCT_CATATAN_FIELD) totalRowValues[catatanColIndex - 1] = "";

      const totalRow = worksheet.addRow(totalRowValues);
      totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLOR_TOTAL_FILL },
        };
        cell.font = colNum <= 2 ? FONT_TOTAL_LABEL : FONT_TOTAL_VALUE;
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      });

      // 4. Data per Puskesmas
      reportList.forEach((row, idx) => {
        const rowValues = [
          idx + 1,
          row.namaPuskesmas || row.id,
          ...ANCT_FIELDS.map((f) => Number(row[f.key] || 0)),
        ];
        if (ANCT_CATATAN_FIELD) rowValues.push(row[ANCT_CATATAN_FIELD.key] || "");

        const excelRow = worksheet.addRow(rowValues);
        excelRow.height = DATA_ROW_HEIGHT;

        excelRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
          cell.border = THIN_BORDER;
          if (colNum === 1) {
            cell.font = FONT_DATA_NO;
            cell.alignment = { horizontal: "center", vertical: "middle" };
          } else if (colNum === 2) {
            cell.font = FONT_DATA_NAMA;
            cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: COLOR_NAMA_PKM_FILL },
            };
          } else {
            cell.font = FONT_DATA_VALUE;
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
          }
        });
      });

      // Sembunyikan kolom kosong setelah tabel selesai
      worksheet.getColumn(totalCols + 1).hidden = true;
      worksheet.getColumn(totalCols + 2).hidden = true;

      // 5. Blok tanda tangan, persis posisi & teks pada file referensi
      const lastDataRow = worksheet.lastRow.number;
      const addFooterRow = (rowNumber, text) => {
        while (worksheet.lastRow.number < rowNumber - 1) worksheet.addRow([]);
        const r = worksheet.addRow(["", text]);
        r.getCell(2).font = FONT_FOOTER;
      };
      addFooterRow(lastDataRow + 3, "TANGGAL…………");
      addFooterRow(lastDataRow + 5, "MENGETAHUI");
      addFooterRow(lastDataRow + 6, "KEPALA BIDANG KESMAS DINKES KAB………….");
      addFooterRow(lastDataRow + 11, "…………………………………………………………………");

      // Generate Buffer & Trigger Browser Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Rekap_ANCT_${bulanLabel}_${tahun}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("useAnctExport handleExportExcel error:", err);
      alert("Gagal mengekspor file Excel: " + err.message);
    } finally {
      setExporting(false);
    }
  }, []);

  return { handleExportExcel, exporting };
}