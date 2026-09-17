// components/anct/table/AnctTable.jsx
'use client';

import { ANCT_FIELDS } from '@/constants/anctFields';
import { calculateAnctSummary } from '@/constants/anctFields';
import AnctTableHeader from './AnctTableHeader';
import AnctTableBody from './AnctTableBody';

export default function AnctTable({ reportList = [], searchQuery = '', zoomLevel = 100 }) {
  const filteredList = reportList.filter((row) =>
    (row.namaPuskesmas || row.nama || row.puskesmasId || '')
      .toLowerCase()
      .includes((searchQuery || '').toLowerCase())
  );

  const { totals } = calculateAnctSummary(reportList);
  const cellStyle = { fontSize: `${zoomLevel}%` };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
      <table className="border-collapse w-full text-xs" style={cellStyle}>
        <AnctTableHeader />
        <AnctTableBody reportList={filteredList} />
        <tfoot>
          <tr className="bg-emerald-100 font-bold">
            <td className="border border-gray-300 px-2 py-2" colSpan={2}>
              TOTAL
            </td>
            {ANCT_FIELDS.map((field) => (
              <td key={field.key} className="border border-gray-300 px-2 py-2 text-center">
                {totals[field.key] || 0}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}