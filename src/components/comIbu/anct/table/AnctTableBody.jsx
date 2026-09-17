// components/anct/table/AnctTableBody.jsx
'use client';

import { ANCT_FIELDS } from '@/constants/anctFields';

export default function AnctTableBody({ reportList = [] }) {
  if (reportList.length === 0) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={2 + ANCT_FIELDS.length}
            className="border border-gray-300 px-3 py-6 text-center text-gray-400"
          >
            Belum ada data laporan ANC Terpadu untuk periode ini.
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {reportList.map((row, idx) => (
        <tr key={row.puskesmasId || row.id} className="hover:bg-gray-50">
          <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
          <td className="border border-gray-300 px-3 py-1 text-left font-medium">
            {row.namaPuskesmas || row.nama || row.puskesmasId}
          </td>
          {ANCT_FIELDS.map((field) => (
            <td key={field.key} className="border border-gray-300 px-2 py-1 text-center">
              {Number(row[field.key] || 0)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}