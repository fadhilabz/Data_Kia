// components/kematian/table/KematianTable.jsx
'use client';

import { KEMATIAN_FIELDS, calculateKematianSummary, hitungJumlahKematianIbu } from '@/constants/kematianFields';

function buildHeaderRuns(fields) {
  const runs = [];
  let i = 0;
  while (i < fields.length) {
    const f = fields[i];
    let j = i;
    const groupFields = [];
    while (j < fields.length && fields[j].group === f.group) {
      groupFields.push(fields[j]);
      j++;
    }
    runs.push({ group: f.group, fields: groupFields });
    i = j;
  }
  return runs;
}

export default function KematianTable({ reportList = [], searchQuery = '', zoomLevel = 100 }) {
  const filteredList = reportList.filter((row) =>
    (row.namaPuskesmas || row.id || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const headerRuns = buildHeaderRuns(KEMATIAN_FIELDS);
  const { totals } = calculateKematianSummary(reportList);
  const cellStyle = { fontSize: `${zoomLevel}%` };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
      <table className="border-collapse w-full text-xs" style={cellStyle}>
        <thead className="sticky top-0 z-10 bg-emerald-50">
          <tr>
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[2.5rem] bg-emerald-100">
              NO
            </th>
            <th rowSpan={2} className="border border-gray-300 px-3 py-2 min-w-[12rem] bg-emerald-100 text-left">
              NAMA PUSKESMAS
            </th>
            {headerRuns.map((run, idx) => (
              <th
                key={`group-${idx}`}
                colSpan={run.fields.length}
                className="border border-gray-300 px-2 py-2 bg-emerald-100"
              >
                {run.group}
              </th>
            ))}
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 bg-emerald-100 min-w-[6rem]">
              Jumlah Kematian Ibu
            </th>
          </tr>
          <tr>
            {KEMATIAN_FIELDS.map((field) => (
              <th key={field.key} className="border border-gray-300 px-2 py-1 bg-emerald-50 min-w-[6rem]">
                {field.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredList.length === 0 && (
            <tr>
              <td
                colSpan={3 + KEMATIAN_FIELDS.length}
                className="border border-gray-300 px-3 py-6 text-center text-gray-400"
              >
                Belum ada data laporan Kematian Ibu untuk periode ini.
              </td>
            </tr>
          )}

          {filteredList.map((row, idx) => (
            <tr key={row.puskesmasId || row.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
              <td className="border border-gray-300 px-3 py-1 text-left font-medium">
                {row.namaPuskesmas || row.id}
              </td>
              {KEMATIAN_FIELDS.map((field) => (
                <td key={field.key} className="border border-gray-300 px-2 py-1 text-center">
                  {Number(row[field.key] || 0)}
                </td>
              ))}
              <td className="border border-gray-300 px-2 py-1 text-center font-semibold">
                {hitungJumlahKematianIbu(row)}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-emerald-100 font-bold">
            <td className="border border-gray-300 px-2 py-2" colSpan={2}>
              TOTAL
            </td>
            {KEMATIAN_FIELDS.map((field) => (
              <td key={field.key} className="border border-gray-300 px-2 py-2 text-center">
                {totals[field.key] || 0}
              </td>
            ))}
            <td className="border border-gray-300 px-2 py-2 text-center">{totals.jumlahKematianIbu || 0}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}