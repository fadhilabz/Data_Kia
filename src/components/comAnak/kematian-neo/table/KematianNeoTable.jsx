// components/kematian-neo/table/KematianNeoTable.jsx
// Tabel rekap bulanan Kematian Neonatal — 3 grup umur x (L,P,Abs + sebab),
// pola header 2-tingkat mirip PncTable/KnTable.

"use client";

import React from "react";
import {
  KEMATIAN_NEO_GROUPS,
  getGroupPart,
  getSebabValue,
  getJumlahKematianNeonatal,
  getJumlahKematianBayi,
  calculateKematianNeoSummary,
} from "@/constants/kematianNeoFields";

export default function KematianNeoTable({ reportList = [], searchQuery = "" }) {
  const filteredList = reportList.filter((row) =>
    (row.nama || row.id || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );
  const totals = calculateKematianNeoSummary(reportList);

  const totalColsPerGroup = (group) => 3 + group.sebabList.length; // L,P,Abs + sebab

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
      <table className="border-collapse w-full text-xs">
        <thead className="sticky top-0 z-10 bg-rose-50">
          <tr>
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[2.5rem] bg-rose-100">NO</th>
            <th rowSpan={2} className="border border-gray-300 px-3 py-2 min-w-[12rem] bg-rose-100 text-left">NAMA PUSKESMAS</th>
            {KEMATIAN_NEO_GROUPS.map((group) => (
              <th key={group.key} colSpan={totalColsPerGroup(group)} className="border border-gray-300 px-2 py-2 bg-rose-100">
                {group.label}
              </th>
            ))}
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[6rem] bg-rose-100">Jml Kematian Neonatal</th>
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[6rem] bg-rose-100">Jml Kematian Bayi (0-11 bln)</th>
          </tr>
          <tr>
            {KEMATIAN_NEO_GROUPS.map((group) => (
              <React.Fragment key={`sub-${group.key}`}>
                <th className="border border-gray-300 px-1 py-1 bg-rose-50 min-w-[2.5rem]">L</th>
                <th className="border border-gray-300 px-1 py-1 bg-rose-50 min-w-[2.5rem]">P</th>
                <th className="border border-gray-300 px-1 py-1 bg-rose-50 min-w-[2.5rem]">Abs</th>
                {group.sebabList.map((s) => (
                  <th key={s.key} className="border border-gray-300 px-1 py-1 bg-rose-50 min-w-[5rem]">
                    {s.label}
                  </th>
                ))}
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredList.length === 0 && (
            <tr>
              <td
                colSpan={2 + KEMATIAN_NEO_GROUPS.reduce((s, g) => s + totalColsPerGroup(g), 0) + 2}
                className="border border-gray-300 px-3 py-6 text-center text-gray-400"
              >
                Belum ada data laporan Kematian Neonatal untuk periode ini.
              </td>
            </tr>
          )}

          {filteredList.map((row, idx) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
              <td className="border border-gray-300 px-3 py-1 text-left font-medium">{row.nama || row.id}</td>
              {KEMATIAN_NEO_GROUPS.map((group) => {
                const l = getGroupPart(row, group.key, "l");
                const p = getGroupPart(row, group.key, "p");
                return (
                  <React.Fragment key={`${row.id}-${group.key}`}>
                    <td className="border border-gray-300 px-1 py-1 text-center">{l}</td>
                    <td className="border border-gray-300 px-1 py-1 text-center">{p}</td>
                    <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{l + p}</td>
                    {group.sebabList.map((s) => (
                      <td key={s.key} className="border border-gray-300 px-1 py-1 text-center">
                        {getSebabValue(row, group.key, s.key)}
                      </td>
                    ))}
                  </React.Fragment>
                );
              })}
              <td className="border border-gray-300 px-2 py-1 text-center font-semibold">
                {getJumlahKematianNeonatal(row)}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center font-semibold">
                {getJumlahKematianBayi(row)}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-rose-100 font-bold">
            <td className="border border-gray-300 px-2 py-2" colSpan={2}>TOTAL</td>
            {KEMATIAN_NEO_GROUPS.map((group) => {
              const t = totals[group.key];
              return (
                <React.Fragment key={`${group.key}-total`}>
                  <td className="border border-gray-300 px-1 py-2 text-center">{t.l}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center">{t.p}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center">{t.abs}</td>
                  {group.sebabList.map((s) => (
                    <td key={s.key} className="border border-gray-300 px-1 py-2 text-center">
                      {t.sebab[s.key]}
                    </td>
                  ))}
                </React.Fragment>
              );
            })}
            <td className="border border-gray-300 px-2 py-2 text-center">{totals.jumlahKematianNeonatal}</td>
            <td className="border border-gray-300 px-2 py-2 text-center">{totals.jumlahKematianBayi}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}