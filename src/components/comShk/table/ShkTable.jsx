// components/comShk/table/ShkTable.jsx
"use client";

import { SHK_FIELDS, getCakupanShk, formatCakupan, calculateShkSummary } from "@/constants/shkFields";

export default function ShkTable({ reportList = [], searchQuery = "" }) {
  const filteredList = reportList.filter((row) =>
    (row.nama || row.id || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );
  const { totals, cakupan } = calculateShkSummary(reportList);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
      <table className="border-collapse w-full text-xs">
        <thead className="sticky top-0 z-10 bg-teal-50">
          <tr>
            <th className="border border-gray-300 px-2 py-2 min-w-[2.5rem] bg-teal-100">NO</th>
            <th className="border border-gray-300 px-3 py-2 min-w-[12rem] bg-teal-100 text-left">NAMA PUSKESMAS</th>
            <th className="border border-gray-300 px-2 py-2 min-w-[4rem] bg-teal-100">Sasaran BBL</th>
            {SHK_FIELDS.map((f) => (
              <th key={f.key} className="border border-gray-300 px-2 py-2 min-w-[6rem] bg-teal-100">{f.label}</th>
            ))}
            <th className="border border-gray-300 px-2 py-2 min-w-[5rem] bg-teal-200">Cakupan %</th>
          </tr>
        </thead>

        <tbody>
          {filteredList.length === 0 && (
            <tr>
              <td colSpan={4 + SHK_FIELDS.length} className="border border-gray-300 px-3 py-6 text-center text-gray-400">
                Belum ada data laporan SHK untuk periode ini.
              </td>
            </tr>
          )}

          {filteredList.map((row, idx) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
              <td className="border border-gray-300 px-3 py-1 text-left font-medium">{row.nama || row.id}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.sasaranBbl || 0}</td>
              {SHK_FIELDS.map((f) => (
                <td key={f.key} className="border border-gray-300 px-2 py-1 text-center">{row[f.key] || 0}</td>
              ))}
              <td className="border border-gray-300 px-2 py-1 text-center font-semibold">
                {formatCakupan(getCakupanShk(row))}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-teal-100 font-bold">
            <td className="border border-gray-300 px-2 py-2" colSpan={2}>TOTAL</td>
            <td className="border border-gray-300 px-2 py-2 text-center">{totals.sasaranBbl}</td>
            {SHK_FIELDS.map((f) => (
              <td key={f.key} className="border border-gray-300 px-2 py-2 text-center">{totals[f.key]}</td>
            ))}
            <td className="border border-gray-300 px-2 py-2 text-center">{formatCakupan(cakupan)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}