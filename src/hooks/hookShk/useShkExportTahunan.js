// hooks/hookShk/useShkExportTahunan.js
import { useState, useCallback } from 'react';
import { namaBulan, DAFTAR_BULAN_ID } from '@/lib/libShk/shkConfig';
import { SHK_FIELDS, getCakupanShk, calculateShkSummary } from '@/constants/shkFields';

export function useShkExportTahunan() {
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = useCallback(async (matrixData, allReportsFlat, tahun) => {
    if (!matrixData || matrixData.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    setExporting(true);
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();

      // ---- SHEET 1: Matriks BBL Dilakukan SHK per Bulan ----
      const ws1 = workbook.addWorksheet(`Cakupan ${tahun}`);
      const header1 = ['NO', 'NAMA PUSKESMAS', ...DAFTAR_BULAN_ID.map((b) => namaBulan(b)), 'TOTAL SETAHUN'];
      const r1 = ws1.addRow(header1);
      r1.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00695C' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      matrixData.forEach((pkm, idx) => {
        const rowValues = [
          idx + 1, pkm.nama,
          ...DAFTAR_BULAN_ID.map((b) => Number(pkm.perBulan[b].bblDilakukanShk || 0)),
          pkm.totalTahun.bblDilakukanShk,
        ];
        ws1.addRow(rowValues);
      });

      const totalRow1 = [
        '', 'TOTAL KOTA BAUBAU',
        ...DAFTAR_BULAN_ID.map((b) => matrixData.reduce((s, p) => s + Number(p.perBulan[b].bblDilakukanShk || 0), 0)),
        matrixData.reduce((s, p) => s + p.totalTahun.bblDilakukanShk, 0),
      ];
      const trow1 = ws1.addRow(totalRow1);
      trow1.font = { bold: true };
      ws1.columns.forEach((c) => (c.width = 12));
      ws1.getColumn(2).width = 24;

      // ---- SHEET 2: Matriks Positif HK per Bulan ----
      const ws2 = workbook.addWorksheet(`Positif HK ${tahun}`);
      const r2h = ws2.addRow(header1);
      r2h.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB71C1C' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      matrixData.forEach((pkm, idx) => {
        const rowValues = [
          idx + 1, pkm.nama,
          ...DAFTAR_BULAN_ID.map((b) => Number(pkm.perBulan[b].positifHk || 0)),
          pkm.totalTahun.positifHk,
        ];
        ws2.addRow(rowValues);
      });
      const totalRow2 = [
        '', 'TOTAL KOTA BAUBAU',
        ...DAFTAR_BULAN_ID.map((b) => matrixData.reduce((s, p) => s + Number(p.perBulan[b].positifHk || 0), 0)),
        matrixData.reduce((s, p) => s + p.totalTahun.positifHk, 0),
      ];
      const trow2 = ws2.addRow(totalRow2);
      trow2.font = { bold: true };
      ws2.columns.forEach((c) => (c.width = 12));
      ws2.getColumn(2).width = 24;

      // ---- SHEET 3: Rekap Total Setahun (semua indikator, se-Kota) ----
      const ws3 = workbook.addWorksheet(`Rekap Total ${tahun}`);
      ws3.addRow([`REKAP SHK SETAHUN — TAHUN ${tahun} (SE-KOTA BAUBAU)`]).font = { bold: true, size: 13 };
      ws3.addRow([]);
      const summary = calculateShkSummary(allReportsFlat);
      ws3.addRow(['Total Sasaran BBL (akumulasi 12 bulan)', summary.totals.sasaranBbl]);
      SHK_FIELDS.forEach((f) => {
        ws3.addRow([f.label, summary.totals[f.key]]);
      });
      ws3.addRow(['Cakupan BBL Dilakukan SHK (Setahun)', summary.cakupan !== null ? `${summary.cakupan}%` : '-']).font = { bold: true };
      ws3.getColumn(1).width = 45;
      ws3.getColumn(2).width = 14;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Rekap_Tahunan_SHK_Baubau_${tahun}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting rekap tahunan SHK:', err);
      alert('Gagal mengekspor file Excel: ' + err.message);
    } finally {
      setExporting(false);
    }
  }, []);

  return { handleExportExcel, exporting };
}