// hooks/pnc/usePncExport.js
// Custom Hook export data laporan PNC ke Excel (.xlsx) menggunakan exceljs.
// Gaya visual (warna, font, border) IDENTIK dengan hooks/anc/useAncExport.js.
// Struktur header 3-tingkat mengikuti PNC_COLUMNS (lib/pnc/pncColumns.js) —
// pakai fungsi buildHeaderRuns yang sama polanya dengan PncTable.jsx, supaya
// hasil Excel konsisten dengan tampilan tabel di layar.

import { useState, useCallback } from "react";
import {
  PNC_COLUMNS,
  getColAbs,
  getColDenominator,
} from "@/lib/ibu/pnc/pncColumns";
import { PNC_FIELDS } from "@/lib/ibu/pnc/pncFields";
import { namaBulan } from "@/lib/ibu/pnc/pncConfig";

// ---- Bangun struktur header 3 baris (Grup -> Label Kolom -> Abs/%) ----
// Sama persis logic buildHeaderRuns() di PncTable.jsx.
function buildHeaderRuns(columns) {
  const runs = [];
  let i = 0;
  while (i < columns.length) {
    const col = columns[i];
    if (col.group) {
      let j = i;
      const groupCols = [];
      while (j < columns.length && columns[j].group === col.group) {
        groupCols.push(columns[j]);
        j++;
      }
      runs.push({ group: col.group, cols: groupCols });
      i = j;
    } else {
      runs.push({ group: null, cols: [col] });
      i++;
    }
  }
  return runs;
}

function pctValue(abs, denom) {
  if (!denom || denom <= 0) return null; // null -> ditulis "-" di cell
  return Math.round((abs / denom) * 100 * 10) / 10;
}

export function usePncExport() {
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
        const sheetName = `PNC ${bulanLabel}`;
        const worksheet = workbook.addWorksheet(sheetName);

        const headerRuns = buildHeaderRuns(PNC_COLUMNS);
        const totalCols = 3 + PNC_COLUMNS.length * 2; // NO, NAMA, BULIN + (Abs+%) per kolom
        const endColLetter = worksheet.getColumn(totalCols).letter;

        // 1. Title Banner (Baris 1)
        worksheet.mergeCells(`A1:${endColLetter}1`);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = `LAPORAN PELAYANAN PNC KOTA BAUBAU - PERIODE ${activePeriode?.namaPeriode || `${bulanLabel} ${tahunLabel}`}`;
        titleCell.font = {
          name: "Arial",
          size: 14,
          bold: true,
          color: { argb: "FFFFFFFF" },
        };
        titleCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF004D40" },
        };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getRow(1).height = 30;
        worksheet.addRow([]); // Baris 2 kosong pemisah

        // 2. Header Baris 3: NO/NAMA/BULIN (rowspan 3) + Grup / Label kolom
        const h1Row = worksheet.addRow([]);
        h1Row.height = 24;
        worksheet.mergeCells(`A3:A5`);
        worksheet.getCell("A3").value = "NO";
        worksheet.mergeCells(`B3:B5`);
        worksheet.getCell("B3").value = "NAMA PUSKESMAS";
        worksheet.mergeCells(`C3:C5`);
        worksheet.getCell("C3").value = "BULIN";

        let colCursor = 4; // kolom D = mulai PNC_COLUMNS (setelah NO/NAMA/BULIN)
        const soloColStart = {}; // key -> start col letter, untuk merge Abs/% row3-5 solo cols

        headerRuns.forEach((run) => {
          if (run.group) {
            const span = run.cols.length * 2;
            const startLetter = worksheet.getColumn(colCursor).letter;
            const endLetter = worksheet.getColumn(colCursor + span - 1).letter;
            worksheet.mergeCells(`${startLetter}3:${endLetter}3`);
            worksheet.getCell(`${startLetter}3`).value = run.group;
            colCursor += span;
          } else {
            const startLetter = worksheet.getColumn(colCursor).letter;
            const endLetter = worksheet.getColumn(colCursor + 1).letter;
            worksheet.mergeCells(`${startLetter}3:${endLetter}4`); // rowspan 2, colspan 2
            worksheet.getCell(`${startLetter}3`).value = run.cols[0].label;
            colCursor += 2;
          }
        });

        // 3. Header Baris 4: label kolom untuk grup saja (solo sudah di-merge di atas)
        colCursor = 4;
        headerRuns.forEach((run) => {
          if (run.group) {
            run.cols.forEach((col) => {
              const startLetter = worksheet.getColumn(colCursor).letter;
              const endLetter = worksheet.getColumn(colCursor + 1).letter;
              worksheet.mergeCells(`${startLetter}4:${endLetter}4`);
              worksheet.getCell(`${startLetter}4`).value = col.label;
              colCursor += 2;
            });
          } else {
            colCursor += 2;
          }
        });

        // 4. Header Baris 5: Abs / % untuk SEMUA kolom
        colCursor = 4;
        const r5 = worksheet.getRow(5);
        PNC_COLUMNS.forEach(() => {
          r5.getCell(colCursor).value = "Abs";
          r5.getCell(colCursor + 1).value = "%";
          colCursor += 2;
        });
        r5.height = 20;
        worksheet.getRow(3).height = 24;
        worksheet.getRow(4).height = 22;

        // Styling header (baris 3-5)
        [3, 4, 5].forEach((rowNum) => {
          const row = worksheet.getRow(rowNum);
          for (let c = 1; c <= totalCols; c++) {
            const cell = row.getCell(c);
            cell.font = {
              name: "Arial",
              size: 9,
              bold: true,
              color: { argb: "FFFFFFFF" },
            };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF00695C" },
            };
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
            };
            cell.border = {
              top: { style: "thin", color: { argb: "FFB2DFDB" } },
              left: { style: "thin", color: { argb: "FFB2DFDB" } },
              bottom: { style: "thin", color: { argb: "FF004D40" } },
              right: { style: "thin", color: { argb: "FFB2DFDB" } },
            };
          }
        });

        // 5. Populate Data Rows (Baris 6+)
        puskesmasList.forEach((pkm, idx) => {
          const bulin = Number(pkm[PNC_FIELDS.BULIN]) || 0;
          const rowValues = [
            idx + 1,
            pkm.nama || pkm.namaPuskesmas || `Puskesmas ${idx + 1}`,
            bulin,
          ];

          PNC_COLUMNS.forEach((col) => {
            const abs = getColAbs(pkm, col);
            const denom = getColDenominator(pkm, col);
            rowValues.push(abs);
            rowValues.push(pctValue(abs, denom));
          });

          const row = worksheet.addRow(rowValues);
          row.height = 20;
          const isEven = idx % 2 === 0;
          const bgColor = isEven ? "FFFFFFFF" : "FFF2F7F7";

          row.eachCell((cell, colNum) => {
            cell.font = { name: "Arial", size: 9 };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: bgColor },
            };
            cell.border = {
              top: { style: "thin", color: { argb: "FFE0E0E0" } },
              left: { style: "thin", color: { argb: "FFE0E0E0" } },
              bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
              right: { style: "thin", color: { argb: "FFE0E0E0" } },
            };

            if (colNum === 1) {
              cell.alignment = { horizontal: "center", vertical: "middle" };
            } else if (colNum === 2) {
              cell.alignment = { horizontal: "left", vertical: "middle" };
              cell.font = { name: "Arial", size: 9, bold: true };
            } else {
              cell.alignment = { horizontal: "right", vertical: "middle" };
              // Kolom % (genap dari kolom D dst) yang null -> tampilkan "-"
              if (cell.value === null) cell.value = "-";
            }
          });
        });

        // Auto-fit width
        worksheet.columns.forEach((col) => {
          let maxLen = 8;
          col.eachCell({ includeEmpty: false }, (cell) => {
            const s =
              cell.value !== null && cell.value !== undefined
                ? String(cell.value)
                : "";
            if (s.length > maxLen) maxLen = s.length;
          });
          col.width = Math.min(Math.max(maxLen + 2, 8), 30);
        });

        // Generate Buffer & Trigger Browser Download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `Laporan_Lengkap_PNC_Baubau_${tahunLabel}_${bulanLabel}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error exporting Excel PNC:", err);
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
