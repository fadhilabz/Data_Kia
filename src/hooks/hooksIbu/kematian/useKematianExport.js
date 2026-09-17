// hooks/kematian/useKematianExport.js
"use client";

import { useState } from "react";
import {
  KEMATIAN_FIELDS,
  KEMATIAN_CATATAN_FIELD,
  hitungJumlahKematianIbu,
} from "@/constants/kematianFields";
import { namaBulan } from "@/lib/ibu/kematian/kematianConfig";

export function useKematianExport() {
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async (reportList, { bulan, tahun }) => {
    if (!reportList || reportList.length === 0) return;
    setExporting(true);
    try {
      const XLSX = await import("xlsx");

      const headerRow = [
        "NO",
        "NAMA PUSKESMAS",
        ...KEMATIAN_FIELDS.map((f) => `${f.group} - ${f.label}`),
        "Jumlah Kematian Ibu",
        KEMATIAN_CATATAN_FIELD.label,
      ];

      const dataRows = reportList.map((row, idx) => [
        idx + 1,
        row.namaPuskesmas || row.id,
        ...KEMATIAN_FIELDS.map((f) => Number(row[f.key] || 0)),
        hitungJumlahKematianIbu(row),
        row[KEMATIAN_CATATAN_FIELD.key] || "",
      ]);

      const totalRow = [
        "",
        "TOTAL",
        ...KEMATIAN_FIELDS.map((f) =>
          reportList.reduce((sum, row) => sum + (Number(row[f.key]) || 0), 0),
        ),
        reportList.reduce((sum, row) => sum + hitungJumlahKematianIbu(row), 0),
        "",
      ];

      const sheetData = [headerRow, ...dataRows, totalRow];
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Kematian Ibu");

      const fileName = `Rekap_Kematian_Ibu_${namaBulan(bulan)}_${tahun}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("useKematianExport handleExportExcel error:", err);
    } finally {
      setExporting(false);
    }
  };

  return { handleExportExcel, exporting };
}
