// hooks/sdm/useSdmExport.js
"use client";

import { useState } from "react";
import { SDM_FIELDS, SDM_COMPUTED_FIELDS } from "@/constants/sdmFields";
import { namaBulan } from "@/lib/ibu/sdm/sdmConfig";

export function useSdmExport() {
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async (reportList, { bulan, tahun }) => {
    if (!reportList || reportList.length === 0) return;
    setExporting(true);
    try {
      const XLSX = await import("xlsx");

      const semuaKolom = [...SDM_FIELDS, ...SDM_COMPUTED_FIELDS];

      const headerRow = [
        "NO",
        "NAMA PUSKESMAS",
        ...semuaKolom.map((f) => `${f.group} - ${f.label}`),
      ];

      const dataRows = reportList.map((row, idx) => [
        idx + 1,
        row.namaPuskesmas || row.id,
        ...semuaKolom.map((f) =>
          f.hitung ? f.hitung(row) : Number(row[f.key] || 0),
        ),
      ]);

      const totalRow = [
        "",
        "TOTAL",
        ...semuaKolom.map((f) =>
          reportList.reduce(
            (sum, row) =>
              sum + (f.hitung ? f.hitung(row) : Number(row[f.key]) || 0),
            0,
          ),
        ),
      ];

      const sheetData = [headerRow, ...dataRows, totalRow];
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap SDM");

      const fileName = `Rekap_SDM_${namaBulan(bulan)}_${tahun}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("useSdmExport handleExportExcel error:", err);
    } finally {
      setExporting(false);
    }
  };

  return { handleExportExcel, exporting };
}
