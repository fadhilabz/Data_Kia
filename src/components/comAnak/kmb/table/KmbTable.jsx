// components/comAnak/kmb/table/KmbTable.jsx
"use client";

import React from "react";
import {
  KMB_KELOMPOK_UMUR,
  KMB_SEBAB_LIST,
  getJumlahKematianGroup,
  getSebabCounts,
  calculateKmbSummary,
} from "@/constants/kmbFields";

export default function KmbTable({ reportList = [], searchQuery = "" }) {
  const filteredList = reportList.filter((row) =>
    (row.nama || row.id || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );
  const summary = calculateKmbSummary(reportList);

  const colsPerGroup = 3 + KMB_SEBAB_LIST.length; // L,P,Abs + sebab

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
      <table className="border-collapse w-full text-xs">
        <thead className="sticky top-0 z-10 bg-rose-50">
          <tr>
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[2.5rem] bg-rose-100">NO</th>
            <th rowSpan={2} className="border border-gray-300 px-3 py-2 min-w-[12rem] bg-rose-100 text-left">NAMA PUSKESMAS</th>
            {KMB_KELOMPOK_UMUR.map((g) => (
              <th key={g.key} colSpan={colsPerGroup} className="border border-gray-300 px-2 py-2 bg-rose-100">
                {g.label}
              </th>
            ))}
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[5rem] bg-rose-200">Total Kasus</th>
          </tr>
          <tr>
            {KMB_KELOMPOK_UMUR.map((g) => (
              <React.Fragment key={`sub-${g.key}`}>
                <th className="border border-gray-300 px-1 py-1 bg-rose-50 min-w-[2.5rem]">L</th>
                <th className="border border-gray-300 px-1 py-1 bg-rose-50 min-w-[2.5rem]">P</th>
                <th className="border border-gray-300 px-1 py-1 bg-rose-50 min-w-[2.5rem]">Abs</th>
                {KMB_SEBAB_LIST.map((s) => (
                  <th key={s.key} className="border border-gray-300 px-1 py-1 bg-rose-50 min-w-[5rem]">{s.label}</th>
                ))}
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredList.length === 0 && (
            <tr>
              <td colSpan={2 + KMB_KELOMPOK_UMUR.length * colsPerGroup + 1} className="border border-gray-300 px-3 py-6 text-center text-gray-400">
                Belum ada data laporan KMB untuk periode ini.
              </td>
            </tr>
          )}

          {filteredList.map((row, idx) => {
            const kasusList = row.kasusList || [];
            const totalKasus = kasusList.length;
            return (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
                <td className="border border-gray-300 px-3 py-1 text-left font-medium">{row.nama || row.id}</td>
                {KMB_KELOMPOK_UMUR.map((g) => {
                  const { l, p, abs } = getJumlahKematianGroup(kasusList, g.key);
                  const sebabCounts = getSebabCounts(kasusList, g.key);
                  return (
                    <React.Fragment key={`${row.id}-${g.key}`}>
                      <td className="border border-gray-300 px-1 py-1 text-center">{l}</td>
                      <td className="border border-gray-300 px-1 py-1 text-center">{p}</td>
                      <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{abs}</td>
                      {KMB_SEBAB_LIST.map((s) => (
                        <td key={s.key} className="border border-gray-300 px-1 py-1 text-center">{sebabCounts[s.key]}</td>
                      ))}
                    </React.Fragment>
                  );
                })}
                <td className="border border-gray-300 px-2 py-1 text-center font-bold">{totalKasus}</td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="bg-rose-100 font-bold">
            <td className="border border-gray-300 px-2 py-2" colSpan={2}>TOTAL</td>
            {KMB_KELOMPOK_UMUR.map((g) => {
              const t = summary.perGroup[g.key];
              return (
                <React.Fragment key={`${g.key}-total`}>
                  <td className="border border-gray-300 px-1 py-2 text-center">{t.l}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center">{t.p}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center">{t.abs}</td>
                  {KMB_SEBAB_LIST.map((s) => (
                    <td key={s.key} className="border border-gray-300 px-1 py-2 text-center">{t.sebab[s.key]}</td>
                  ))}
                </React.Fragment>
              );
            })}
            <td className="border border-gray-300 px-2 py-2 text-center">{summary.totalKasus}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}