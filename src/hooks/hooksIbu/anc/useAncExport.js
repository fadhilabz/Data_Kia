// hooks/useAncExport.js
// Custom Hook ekspor data laporan ANC ke Excel (.xlsx) menggunakan exceljs
//
// Styling & struktur pada file ini SUDAH DISAMAKAN dengan file referensi
// "Buku1.xlsx" yang diberikan (bukan lagi mengikuti desain "title banner"
// versi sebelumnya). Yang direplikasi persis dari file referensi:
//   - Teks & susunan merge header 3 baris (baris 1-3), tanpa baris judul/banner
//   - Baris TOTAL (baris 4) berwarna hijau #00B050, font Arial 14
//   - Kolom "NAMA PUSKESMAS" selalu diberi highlight peach #F8CBAD
//   - Lebar semua kolom = 13, tinggi baris header persis (16 / 31.5 / 310.5 / 18)
//   - Font data = Arial 14 (sesuai file asli), font header = Calibri 12 bold
//   - Kolom rasio/cakupan (%) dibuat sebagai FORMULA Excel (bukan angka statis),
//     persis seperti pada file asli, dengan format angka "0.00"
//
// CATATAN PENTING (baca sebelum pakai):
// 1. Di file referensi, beberapa sel data individual punya highlight warna
//    acak (misalnya beberapa sel di kolom AJ, AV-AY, BH, BM kadang hijau).
//    Setelah dicek, pola ini TIDAK konsisten per-kolom/per-baris — sangat
//    terlihat seperti coretan/tanda manual dari pembuat file, bukan bagian
//    dari template. Karena tidak ada polanya, warna acak itu TIDAK
//    direplikasi di sini (kalau memang itu perlu, kasih tahu saya persisnya
//    baris & kolom mana yang harus selalu disorot, nanti saya tambahkan).
// 2. Tinggi baris data di file asli juga tidak konsisten (52.5 / 17.5 / 35 /
//    70 berganti-ganti tanpa pola) — kemungkinan besar sisa resize manual.
//    Karena baris data dibuat dinamis (jumlah Puskesmas bisa berubah-ubah),
//    di sini dipakai satu tinggi baris tetap (20) untuk semua baris data
//    supaya rapi. Kalau butuh tinggi tertentu, tinggal ubah DATA_ROW_HEIGHT.
// 3. Tiga formula di file asli (kolom T, V, AO) mereferensikan sheet
//    eksternal yang datanya sudah hilang ("[1]SASARAN!#REF!"), jadi rumus
//    itu error (#DIV/0!). Di sini formula itu "diperbaiki" supaya
//    membagi ke kolom D (SASARAN BUMIL) di baris yang sama — silakan
//    sesuaikan lagi kalau pembaginya seharusnya bukan D.
// 4. Pengambilan nilai mentah tiap kolom TETAP memakai ANC_FIELDS +
//    getFieldValue seperti kode lama, dengan asumsi urutan ANC_FIELDS
//    persis mengikuti urutan kolom C..BZ pada file referensi (76 field).
//    Kolom-kolom hasil formula (F, H, K, M, N, P, R, T, V, AO, AY, AZ, BZ)
//    akan DITIMPA dengan rumus Excel setelah baris ditulis, jadi nilai dari
//    ANC_FIELDS untuk kolom-kolom itu (kalau ada) tidak dipakai.

import { useState, useCallback } from "react";
import { ANC_FIELDS, getFieldValue } from "@/constants/ancFields";
import { namaBulan } from "@/lib/ibu/anc/ancConfig";

// ----- Konstanta warna & ukuran (diambil langsung dari file referensi) -----
const COLOR_HEADER_FONT = "FF000000"; // teks header hitam
const COLOR_TOTAL_FILL = "FF00B050"; // hijau baris TOTAL
const COLOR_NAMA_PKM_FILL = "FFF8CBAD"; // peach kolom Nama Puskesmas
const COLOR_BORDER = "FFBFBFBF"; // abu-abu tipis untuk border

const FONT_HEADER = { name: "Calibri", size: 12, bold: true };
const FONT_TOTAL_LABEL = { name: "Arial", size: 14, bold: true };
const FONT_TOTAL_VALUE = { name: "Arial", size: 14, bold: false };
const FONT_DATA = { name: "Arial", size: 14, bold: false };

const COL_WIDTH = 13; // semua kolom lebar 13, sama persis dengan file asli

const HEADER_ROW_HEIGHTS = { 1: 16, 2: 31.5, 3: 310.5 }; // persis file asli
const TOTAL_ROW_HEIGHT = 28; // persis file asli
const DATA_ROW_HEIGHT = 20; // lihat CATATAN #2 di atas

const THIN_BORDER = {
  top: { style: "thin", color: { argb: COLOR_BORDER } },
  left: { style: "thin", color: { argb: COLOR_BORDER } },
  bottom: { style: "thin", color: { argb: COLOR_BORDER } },
  right: { style: "thin", color: { argb: COLOR_BORDER } },
};

// ----- Teks header 3 baris, persis kata demi kata dari file referensi -----
// "" berarti sel itu adalah bagian dari sel gabungan (merge) di sebelah kirinya.
const HEADER_ROW_1 = [
  "NO", "NAMA PUSKESMAS", "JUMLAH", "", "SASARAN WUS", "BUKU KIA (K1 AKSES)",
  "PELAYANAN KUNJUNGAN IBU HAMIL", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
  "PELAYANAN KUNJUNGAN IBU HAMIL DENGAN 12 T", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
  "STATUS IBU HAMIL", "", "", "", "", "",
  "IBU HAMIL DENGAN ANEMIA", "", "", "", "",
  "STATUS GIZI BUMIL", "", "", "",
  "IBU HAMIL DENGAN PREEKLAMSI", "", "",
  "PELAYANAN KOMPLIKASI MATERNAL", "", "", "", "", "", "", "", "", "",
  "JLH BUMIL YANG MENGIKUTI KELAS BUMIL MINIMAL 4 X (SELURUH KUNJUNGAN BUMIL)",
  "IBU HAMIL DENGAN 4T",
  "DETEKSI RESTI IBU HAMIL", "",
  "RUJUKAN", "",
  "JUMLAH KAB/KOTA DENGAN PUSK MAMPU PONED SESUAI STANDAR", "", "",
];

const HEADER_ROW_2 = [
  "", "", "PENDUDUK", "SASARAN BUMIL", "", "", "K 1 ", "", "", "", "", "",
  "K1 AKSES (K 1 MURNI + K1>12 MINGGU (otomatis terisi)", "CAKUPAN K 1 AKSES  ( % ) ",
  "K1 OLEH DOKTER (K1 AKSES)", "", "K5 OLEH DOKTER/ USG", "", "K6", "", "K8", "",
  "IBU HAMIL DI PERIKSA TB/BB", "IBU HAMIL DI PERIKSA TD (TENSI)",
  "IBU HAMIL DIPERIKSA STATUS GIZI (UKUR LILA)", "IBU HAMIL DIUKUR TFU",
  "IBU HAMIL DIPERIKSA DJJ", "IBU HAMIL DI PERIKSA STATUS TT", "IBU HAMIL DIBERI TTD",
  "TES LABORATORIUM", "", "", "", "", "",
  "IBU HAMIL DI TATA LAKSANA KASUS", "IBU HAMIL DILAKUKAN TEMU WICARA",
  "JML IBU HAMIL ANC DENGAN USG (K1 AKSES)", "JML IBU HAMIL SKRINING KESEHATAN JIWA",
  "CAKUPAN ANC SESUAI STANDAR 12 T", "",
  "SKRINING STATUS  TT PADA IBU HAMIL (JUMLAH TT BUMIL)", "", "", "", "",
  "PEMBERIAN TTD 180 TAB  PADA BUMIL (MINIMAL K6/K8)",
  "RINGAN", "SEDANG", "BERAT", "TOTAL", "", "", "", "", "", "", "", "", "",
  "JUMLAH IBU HAMIL MENGALAMI KEGUGURAN",
  "JUMLAH BUMIL DGN PENYAKIT PENYERTA NON OBSTETRIK",
  "IBU HAMIL PROTEIN URIN (+) ", "JUMLAH IBU HAMIL DENGAN MALARIA",
  "IBU HAMIL DENGAN HYPERTENSI DALAM KEHAMILAN", "JUMLAH IBU HAMIL DENGAN OBESITAS",
  "JUMLAH IBU HAMIL DENGAN INFEKSI", "JUMLAH IBU HAMIL MENGALAMI GANGGUAN JANTUNG",
  "JUMLAH IBU HAMIL DENGAN PENYAKIT DIABETES MELITUS", "JUMLAH IBU HAMIL DENGAN TUBERCOLOSIS",
  "", "", "DETEKSI RESTI O/ TENAGA KESEHATAN", "DETEKSI RESTI O/ MASYARAKAT",
  "MATERNAL", "NEONATAL", "JUMLAH PKM", "PKM PONED", "",
];

const HEADER_ROW_3 = [
  "", "", "", "", "", "", "K 1 MURNI", "CAKUPAN K1 MURNI ( % )",
  "K1 TW 1 OLEH DOKTER + USG (K1 MURNI)", "K 1>12 MINGGU", "CAKUPAN K 1>12 MINGGU (% )",
  "BUMIL MEMILIKI BUKU KIA PADA ANC K1 (K1 MURNI)", "", "",
  "ABS", "CAKUPAN  ( % )", "ABS", "CAKUPAN  ( % )", "ABS", "CAKUPAN  ( % )", "ABS", "CAKUPAN  ( % )",
  "", "", "", "", "", "", "",
  "IBU HAMIL PERIKSA HB [TM1] ", "IBU HAMIL PERIKSA HB [TM3)", "IBU HAMIL PERIKSA GOL. DARAH",
  "IBU HAMIL PERIKSA HIV", "IBU HAMIL PERIKSA SIFILIS", "IBU HAMIL DI PERIKSA HEPATITIS",
  "", "", "", "", "ABS", "CAKUPAN  ( % )",
  "T 1", "T 2", "T 3", "T4", "T 5", "",
  "ABS", "ABS", "ABS", "ABS", "CAKUPAN (%)",
  " BUMIL KONSUMSI SUPLEMEN GIZI", " BUMIL KEK", "BUMIL KEK DAPAT MAKANAN TAMBAHAN",
  "JLH BUMIL KEK & RESIKO KEK DLM KURUN WKTU YG SAMA DISUATU WILAYAH (SELURUH BUMIL DIBULAN TERSEBUT)",
  "BUMIL DISKRINING PREEKLAMSIA", "BUMIL DENGAN PREEKLAMSIA",
  "BUMIL DENGAN PREEKLAMSIA YANG DAPAT TATA LAKSANA",
  "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
  "ABS", "ABS", "%",
];

// Daftar merge cell header, persis dari file referensi (kolom 1-based: A=1 ... BZ=78)
const HEADER_MERGES = [
  "A1:A3", "B1:B3", "C1:D1", "C2:C3", "D2:D3", "E1:E3", "F1:F3",
  "G1:V1", "G2:L2", "M2:M3", "N2:N3", "O2:P2", "Q2:R2", "S2:T2", "U2:V2",
  "W1:AM1", "AD2:AI2", "AJ2:AJ3", "AK2:AK3", "AL2:AL3", "AM2:AM3",
  "AN2:AO2", "AP2:AT2",
  "AP1:AU1", "AU2:AU3",
  "AV1:AZ1", "AY2:AZ2",
  "BA1:BD2",
  "BE1:BG2",
  "BH1:BQ1", "BH2:BH3", "BI2:BI3", "BJ2:BJ3", "BK2:BK3", "BL2:BL3",
  "BM2:BM3", "BN2:BN3", "BO2:BO3", "BP2:BP3", "BQ2:BQ3",
  "BR1:BR3", "BS1:BS3",
  "BT1:BU1", "BT2:BT3", "BU2:BU3",
  "BV1:BW1", "BV2:BV3", "BW2:BW3",
  "BX1:BZ1", "BY2:BZ2",
];

// Kolom (nomor, 1-based) yang formatnya persentase -> number format "0.00"
const PERCENT_COLS = [8, 11, 14, 16, 18, 20, 22, 41, 52, 78]; // H,K,N,P,R,T,V,AO,AZ,BZ

// Formula per-baris data (row = nomor baris exceljs). "=" tidak disertakan,
// exceljs pakai bentuk { formula: '...' }.
const ROW_FORMULAS = (r) => ({
  6: `M${r}`, // F: BUKU KIA (K1 AKSES) = K1 AKSES
  8: `G${r}/D${r}*100`, // H
  11: `J${r}/D${r}*100`, // K
  13: `G${r}+J${r}`, // M: K1 AKSES = K1 MURNI + K1>12 MINGGU
  14: `M${r}/D${r}*100`, // N
  16: `O${r}/D${r}*100`, // P
  18: `Q${r}/D${r}*100`, // R
  20: `S${r}/D${r}*100`, // T (diperbaiki, lihat CATATAN #3)
  22: `U${r}/D${r}*100`, // V (diperbaiki)
  41: `AN${r}/D${r}*100`, // AO (diperbaiki)
  51: `AX${r}+AW${r}+AV${r}`, // AY: total anemia
  52: `AY${r}/D${r}*100`, // AZ
  78: `BY${r}/BX${r}*100`, // BZ
});

// Formula baris TOTAL: kolom lain pakai SUM(dataStart:dataEnd),
// kecuali kolom rasio di bawah ini yang mereferensikan sel TOTAL itu sendiri.
const TOTAL_RATIO_FORMULAS = (totalRow) => ({
  8: `G${totalRow}/D${totalRow}*100`,
  11: `J${totalRow}/D${totalRow}*100`,
  14: `M${totalRow}/D${totalRow}*100`,
  16: `O${totalRow}/D${totalRow}*100`,
  18: `Q${totalRow}/D${totalRow}*100`,
  20: `S${totalRow}/D${totalRow}*100`,
  22: `U${totalRow}/D${totalRow}*100`,
  41: `AN${totalRow}/D${totalRow}*100`,
  52: `AY${totalRow}/D${totalRow}*100`,
  78: `BY${totalRow}/BX${totalRow}*100`,
});

export function useAncExport() {
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = useCallback(
    async (puskesmasList, activePeriode) => {
      if (!puskesmasList || puskesmasList.length === 0) {
        alert("Tidak ada data Puskesmas untuk diekspor.");
        return;
      }

      setExporting(true);

      try {
        const ExcelJS = (await import("exceljs")).default;
        const workbook = new ExcelJS.Workbook();
        const bulanLabel = activePeriode?.bulan
          ? namaBulan(activePeriode.bulan)
          : "Bulan";
        const tahunLabel = activePeriode?.tahun || "2026";
        const sheetName = `ANC ${bulanLabel}`;
        const worksheet = workbook.addWorksheet(sheetName);

        const totalCols = ANC_FIELDS.length + 2; // NO, NAMA PUSKESMAS + ANC_FIELDS

        // 1. Lebar kolom: semua 13, persis file asli
        for (let c = 1; c <= totalCols; c++) {
          worksheet.getColumn(c).width = COL_WIDTH;
        }

        // Sembunyikan 2 kolom kosong setelah tabel (biar tidak terlihat CA, CB dst)
        // Sembunyikan 2 kolom kosong setelah tabel (biar tidak terlihat CA, CB dst)
        worksheet.getColumn(totalCols + 1).hidden = true;
        worksheet.getColumn(totalCols + 2).hidden = true;

        // 2. Tulis 3 baris header (tanpa title banner, tanpa baris kosong pemisah)
        const r1 = worksheet.addRow(HEADER_ROW_1);
        const r2 = worksheet.addRow(HEADER_ROW_2);
        const r3 = worksheet.addRow(HEADER_ROW_3);
        r1.height = HEADER_ROW_HEIGHTS[1];
        r2.height = HEADER_ROW_HEIGHTS[2];
        r3.height = HEADER_ROW_HEIGHTS[3];

        HEADER_MERGES.forEach((range) => worksheet.mergeCells(range));

        [r1, r2, r3].forEach((row) => {
          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.font = { ...FONT_HEADER, color: { argb: COLOR_HEADER_FONT } };
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
            };
            cell.border = THIN_BORDER;
          });
        });

        // 3. Baris TOTAL (baris ke-4), langsung sesudah header, SEBELUM data per Puskesmas
        const dataStartRow = 5;
        const dataEndRow = dataStartRow + puskesmasList.length - 1;

        const totalRowValues = new Array(totalCols).fill(null);
        totalRowValues[0] = "TOTAL";
        const totalRow = worksheet.addRow(totalRowValues);
        totalRow.height = TOTAL_ROW_HEIGHT;
        worksheet.mergeCells(totalRow.number, 1, totalRow.number, 2); // A:B TOTAL

        const totalRatio = TOTAL_RATIO_FORMULAS(totalRow.number);
        for (let c = 3; c <= totalCols; c++) {
          const cell = totalRow.getCell(c);
          const colLetter = worksheet.getColumn(c).letter;
          if (totalRatio[c] !== undefined) {
            cell.value = { formula: totalRatio[c] };
          } else {
            cell.value = {
              formula: `SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`,
            };
          }
          if (PERCENT_COLS.includes(c)) cell.numFmt = "0.00";
        }

        totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
          cell.font = colNum === 1 ? FONT_TOTAL_LABEL : FONT_TOTAL_VALUE;
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLOR_TOTAL_FILL },
          };
          cell.alignment = {
            horizontal: "center",
            vertical: colNum === 1 ? "middle" : "top",
            wrapText: true,
          };
          cell.border = THIN_BORDER;
        });

        // 4. Baris data per Puskesmas (mulai baris 5)
        puskesmasList.forEach((pkm, idx) => {
          const rowValues = [
            idx + 1,
            pkm.namaPuskesmas || pkm.nama || `Puskesmas ${idx + 1}`,
            ...ANC_FIELDS.map((field) => getFieldValue(pkm, field, pkm)),
          ];

          const row = worksheet.addRow(rowValues);
          row.height = DATA_ROW_HEIGHT;

          const formulasForRow = ROW_FORMULAS(row.number);
          Object.entries(formulasForRow).forEach(([colNum, formula]) => {
            const cell = row.getCell(Number(colNum));
            cell.value = { formula };
          });

          row.eachCell({ includeEmpty: true }, (cell, colNum) => {
            cell.font = FONT_DATA;
            cell.border = THIN_BORDER;

            if (colNum === 1) {
              cell.alignment = { horizontal: "center", vertical: "middle" };
            } else if (colNum === 2) {
              cell.alignment = {
                horizontal: "left",
                vertical: "middle",
                wrapText: true,
              };
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: COLOR_NAMA_PKM_FILL },
              };
            } else {
              cell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
              };
            }

            if (PERCENT_COLS.includes(colNum)) cell.numFmt = "0.00";
          });
        });

        // Generate Buffer & Trigger Browser Download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `Laporan_Lengkap_ANC_Baubau_${tahunLabel}_${bulanLabel}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error exporting Excel:", err);
        alert("Gagal mengekspor file Excel: " + err.message);
      } finally {
        setExporting(false);
      }
    },
    [],
  );

  return {
    handleExportExcel,
    exportToExcel: handleExportExcel,
    exporting,
  };
}