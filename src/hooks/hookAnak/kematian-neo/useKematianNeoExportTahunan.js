// hooks/hookAnak/kematian-neo/useKematianNeoExportTahunan.js
// Export rekap TAHUNAN Kematian Neonatal ke Excel — 2 sheet:
// 1. "Matriks Bulanan": Puskesmas x 12 Bulan (Jumlah Kematian Bayi 0-11 bln)
// 2. "Rekap Sebab Setahun": total tiap sebab kematian per grup umur, se-Kota
//    Baubau selama setahun penuh (SUM 12 bulan x semua puskesmas)

import { useState, useCallback } from 'react';
import { namaBulan, DAFTAR_BULAN_ID } from '@/lib/libAnak/kematian-neo/kematianNeoConfig';
import {
  KEMATIAN_NEO_GROUPS,
  getJumlahKematianNeonatal,
  getJumlahKematianBayi,
  calculateKematianNeoSummary,
} from '@/constants/kematianNeoFields';

export function useKematianNeoExportTahunan() {
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

      // ---- SHEET 1: Matriks Bulanan ----
      const ws1 = workbook.addWorksheet(`Matriks ${tahun}`);
      const headerRow1 = [
        'NO', 'NAMA PUSKESMAS',
        ...DAFTAR_BULAN_ID.map((b) => namaBulan(b)),
        'TOTAL SETAHUN',
      ];
      const r1 = ws1.addRow(headerRow1);
      r1.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB71C1C' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      matrixData.forEach((pkm, idx) => {
        const rowValues = [
          idx + 1,
          pkm.nama,
          ...DAFTAR_BULAN_ID.map((b) => getJumlahKematianBayi(pkm.perBulan[b])),
          pkm.totalTahun.jumlahKematianBayi,
        ];
        const row = ws1.addRow(rowValues);
        row.eachCell((cell, colNum) => {
          cell.alignment = { horizontal: colNum <= 2 ? 'left' : 'center', vertical: 'middle' };
          if (colNum === headerRow1.length) cell.font = { bold: true };
        });
      });

      // Baris total kota
      const totalRow = [
        '', 'TOTAL KOTA BAUBAU',
        ...DAFTAR_BULAN_ID.map((b) =>
          matrixData.reduce((sum, pkm) => sum + getJumlahKematianBayi(pkm.perBulan[b]), 0)
        ),
        matrixData.reduce((sum, pkm) => sum + pkm.totalTahun.jumlahKematianBayi, 0),
      ];
      const trow = ws1.addRow(totalRow);
      trow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE0E0' } };
      });

      ws1.columns.forEach((col) => { col.width = 14; });
      ws1.getColumn(2).width = 24;

      // ---- SHEET 2: Rekap Sebab Kematian Setahun ----
      const ws2 = workbook.addWorksheet(`Rekap Sebab ${tahun}`);
      const summary = calculateKematianNeoSummary(allReportsFlat);

      ws2.addRow([`REKAP SEBAB KEMATIAN NEONATAL & POST-NEONATAL — TAHUN ${tahun} (SE-KOTA BAUBAU)`]);
      ws2.getRow(1).font = { bold: true, size: 13 };
      ws2.addRow([]);

      KEMATIAN_NEO_GROUPS.forEach((group) => {
        const t = summary[group.key];
        ws2.addRow([group.label]).font = { bold: true };
        const header = ws2.addRow(['Sebab', 'Jumlah']);
        header.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB71C1C' } };
        });
        group.sebabList.forEach((s) => {
          ws2.addRow([s.label, t.sebab[s.key]]);
        });
        ws2.addRow(['Total (L+P)', t.abs]).font = { bold: true };
        ws2.addRow([]);
      });

      ws2.addRow(['Jumlah Kematian Neonatal (Setahun)', summary.jumlahKematianNeonatal]).font = { bold: true };
      ws2.addRow(['Jumlah Kematian Bayi 0-11 Bulan (Setahun)', summary.jumlahKematianBayi]).font = { bold: true };

      ws2.getColumn(1).width = 45;
      ws2.getColumn(2).width = 12;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Rekap_Tahunan_Kematian_Neonatal_Baubau_${tahun}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting rekap tahunan:', err);
      alert('Gagal mengekspor file Excel: ' + err.message);
    } finally {
      setExporting(false);
    }
  }, []);

  return { handleExportExcel, exporting };
}