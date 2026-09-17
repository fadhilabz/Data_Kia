// components/pnc/table/PncTable.jsx
//
// Tabel spreadsheet rekap PNC seluruh Puskesmas untuk satu periode.
// Meniru pola AncTable (komponen modular yang dipakai admin/dataAnc),
// tapi rumus % dan struktur kolom disesuaikan untuk data PNC.

"use client";

import {
  PNC_COLUMNS,
  getColAbs,
  getColDenominator,
  formatPercent,
} from "@/lib/ibu/pnc/pncColumns";
import { PNC_FIELDS } from "@/lib/ibu/pnc/pncFields";
import React from "react";

// ---- Bangun struktur header 3 baris (Grup -> Label Kolom -> Abs/%) ----
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

export default function PncTable({
  reportList = [],
  searchQuery = "",
  zoomLevel = 100,
}) {
  const headerRuns = buildHeaderRuns(PNC_COLUMNS);

  const filteredList = reportList.filter((row) =>
    (row.nama || row.id || "")
      .toLowerCase()
      .includes((searchQuery || "").toLowerCase()),
  );

  // ---- Hitung baris TOTAL ----
  const totalBulin = reportList.reduce(
    (sum, row) => sum + (Number(row[PNC_FIELDS.BULIN]) || 0),
    0,
  );

  const totalsByCol = PNC_COLUMNS.map((col) => {
    const totalAbs = reportList.reduce(
      (sum, row) => sum + getColAbs(row, col),
      0,
    );
    let totalDenom;
    if (col.denominatorKey) {
      totalDenom = reportList.reduce(
        (sum, row) => sum + (Number(row[col.denominatorKey]) || 0),
        0,
      );
    } else {
      totalDenom = totalBulin;
    }
    return { key: col.key, totalAbs, totalDenom };
  });

  const cellStyle = { fontSize: `${zoomLevel}%` };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
      <table className="border-collapse w-full text-xs" style={cellStyle}>
        <thead className="sticky top-0 z-10 bg-emerald-50">
          <tr>
            <th
              rowSpan={3}
              className="border border-gray-300 px-2 py-2 min-w-[2.5rem] bg-emerald-100"
            >
              NO
            </th>
            <th
              rowSpan={3}
              className="border border-gray-300 px-3 py-2 min-w-[12rem] bg-emerald-100 text-left"
            >
              NAMA PUSKESMAS
            </th>
            <th
              rowSpan={3}
              className="border border-gray-300 px-2 py-2 min-w-[4rem] bg-emerald-100"
            >
              BULIN
            </th>
            {headerRuns.map((run, idx) =>
              run.group ? (
                <th
                  key={`group-${idx}`}
                  colSpan={run.cols.length * 2}
                  className="border border-gray-300 px-2 py-2 bg-emerald-100"
                >
                  {run.group}
                </th>
              ) : (
                <th
                  key={`solo-${idx}`}
                  rowSpan={2}
                  colSpan={2}
                  className="border border-gray-300 px-2 py-2 bg-emerald-100 min-w-[9rem]"
                >
                  {run.cols[0].label}
                </th>
              ),
            )}
          </tr>
          <tr>
            {headerRuns
              .filter((run) => run.group)
              .flatMap((run, runIdx) =>
                run.cols.map((col, colIdx) => (
                  <th
                    key={`sub-${runIdx}-${colIdx}`}
                    colSpan={2}
                    className="border border-gray-300 px-2 py-1 bg-emerald-50 min-w-[7rem]"
                  >
                    {col.label}
                  </th>
                )),
              )}
          </tr>
          <tr>
            {PNC_COLUMNS.map((col) => (
              <React.Fragment key={`${col.key}-hdr`}>
                <th className="border border-gray-300 px-2 py-1 bg-emerald-50 min-w-[3.5rem]">
                  Abs
                </th>
                <th className="border border-gray-300 px-2 py-1 bg-emerald-50 min-w-[3.5rem]">
                  %
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredList.length === 0 && (
            <tr>
              <td
                colSpan={3 + PNC_COLUMNS.length * 2}
                className="border border-gray-300 px-3 py-6 text-center text-gray-400"
              >
                Belum ada data laporan PNC untuk periode ini.
              </td>
            </tr>
          )}

          {filteredList.map((row, idx) => {
            const bulin = Number(row[PNC_FIELDS.BULIN]) || 0;
            return (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {idx + 1}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-left font-medium">
                  {row.nama || row.id}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {bulin}
                </td>
                {PNC_COLUMNS.map((col) => {
                  const abs = getColAbs(row, col);
                  const denom = getColDenominator(row, col);
                  return (
                    <React.Fragment key={`${row.id}-${col.key}`}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {abs}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {formatPercent(abs, denom)}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="bg-emerald-100 font-bold">
            <td className="border border-gray-300 px-2 py-2" colSpan={2}>
              TOTAL
            </td>
            <td className="border border-gray-300 px-2 py-2 text-center">
              {totalBulin}
            </td>
            {totalsByCol.map((t) => (
              <React.Fragment key={`${t.key}-total`}>
                <td className="border border-gray-300 px-2 py-2 text-center">
                  {t.totalAbs}
                </td>
                <td className="border border-gray-300 px-2 py-2 text-center">
                  {formatPercent(t.totalAbs, t.totalDenom)}
                </td>
              </React.Fragment>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
