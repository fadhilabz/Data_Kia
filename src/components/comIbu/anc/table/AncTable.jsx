// components/anc/AncTable.jsx
// Komponen UI terpisah yang merakit AncTableHeader, AncTableBody, dan Footer Summary secara modular.

"use client";

import { useMemo } from "react";
import AncTableHeader from "./AncTableHeader";
import AncTableBody from "./AncTableBody";
import { ANC_FIELDS, calculateAncSummary } from "@/constants/ancFields";
import { STATUS_FIELD, STATUS_SUBMITTED } from "@/lib/ibu/anc/ancConfig";

export default function AncTable({
  reportList = [],
  puskesmasList,
  searchQuery = "",
  zoomLevel = 100,
  onRowClick,
}) {
  const dataList = puskesmasList || reportList;
  const summary = useMemo(() => calculateAncSummary(dataList), [dataList]);
  const jumlahSubmitted = dataList.filter(
    (r) => r[STATUS_FIELD] === STATUS_SUBMITTED,
  ).length;
  const totalPuskesmas = dataList.length;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto max-h-[600px] relative">
        <div
          style={{
            transform:
              zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: "top left",
            width:
              zoomLevel < 100 ? `${100 / (zoomLevel / 100)}%` : "max-content",
          }}
          className="transition-transform duration-150 ease-out"
        >
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            {/* Header Bertingkat (3 Baris Multi-Level Header) */}
            <AncTableHeader />

            {/* Body Looping Dinamis ANC_FIELDS */}
            <AncTableBody
              puskesmasList={dataList}
              searchQuery={searchQuery}
              onRowClick={onRowClick}
            />

            {/* Footer Summary (Total SUM & Rata-rata AVG Kota Baubau) */}
            <tfoot className="bg-surface-container-high font-bold border-t-2 border-primary text-on-surface">
              <tr className="bg-primary/10 text-primary">
                <td className="p-2.5 text-center font-extrabold border-r border-outline-variant sticky left-0 bg-surface-container-high z-10 min-w-[40px]">
                  ∑
                </td>
                <td className="p-2.5 font-extrabold sticky left-[40px] bg-surface-container-high z-10 shadow-sm border-r border-outline-variant min-w-[160px]">
                  TOTAL KOTA BAUBAU ({jumlahSubmitted}/{totalPuskesmas} PKM)
                </td>
                {ANC_FIELDS.map((field) => {
                  const sumVal = summary.totals[field.key] || 0;
                  const formatted = field.isPercent
                    ? `${sumVal}%`
                    : sumVal.toLocaleString("id-ID");
                  return (
                    <td
                      key={field.key}
                      className="p-2.5 text-right font-mono text-xs font-bold border-r border-outline-variant"
                    >
                      {formatted}
                    </td>
                  );
                })}
              </tr>
              <tr className="bg-primary/5 text-on-surface-variant text-[11px]">
                <td className="p-2 text-center font-extrabold border-r border-outline-variant sticky left-0 bg-surface-container-high z-10 min-w-[40px]">
                  x̄
                </td>
                <td className="p-2 font-bold sticky left-[40px] bg-surface-container-high z-10 shadow-sm border-r border-outline-variant min-w-[160px]">
                  RATA-RATA PUSKESMAS
                </td>
                {ANC_FIELDS.map((field) => {
                  const avgVal = summary.averages[field.key] || 0;
                  const formatted = field.isPercent
                    ? `${avgVal}%`
                    : avgVal.toLocaleString("id-ID");
                  return (
                    <td
                      key={field.key}
                      className="p-2 text-right font-mono border-r border-outline-variant"
                    >
                      {formatted}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
