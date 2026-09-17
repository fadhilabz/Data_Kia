// components/sdm/table/SdmTable.jsx
'use client';

import { SDM_FIELDS, SDM_COMPUTED_FIELDS, calculateSdmSummary } from '@/constants/sdmFields';

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

// Gabungkan field manual + otomatis per grup, urutan otomatis di akhir grup-nya
function getKolomTampilPerGrup(groupName) {
  const manual = SDM_FIELDS.filter((f) => f.group === groupName);
  const computed = SDM_COMPUTED_FIELDS.filter((f) => f.group === groupName);
  return [...manual, ...computed];
}

const SEMUA_GRUP = [...new Set(SDM_FIELDS.map((f) => f.group))];

export default function SdmTable({ reportList = [], searchQuery = '', zoomLevel = 100 }) {
  const filteredList = reportList.filter((row) =>
    (row.namaPuskesmas || row.id || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const { totals } = calculateSdmSummary(reportList);
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
            {SEMUA_GRUP.map((grup) => {
              const kolom = getKolomTampilPerGrup(grup);
              return (
                <th
                  key={grup}
                  colSpan={kolom.length}
                  className="border border-gray-300 px-2 py-2 bg-emerald-100"
                >
                  {grup}
                </th>
              );
            })}
          </tr>
          <tr>
            {SEMUA_GRUP.flatMap((grup) =>
              getKolomTampilPerGrup(grup).map((field) => (
                <th key={field.key} className="border border-gray-300 px-2 py-1 bg-emerald-50 min-w-[6rem]">
                  {field.label}
                </th>
              ))
            )}
          </tr>
        </thead>

        <tbody>
          {filteredList.length === 0 && (
            <tr>
              <td
                colSpan={2 + SDM_FIELDS.length + SDM_COMPUTED_FIELDS.length}
                className="border border-gray-300 px-3 py-6 text-center text-gray-400"
              >
                Belum ada data laporan SDM untuk periode ini.
              </td>
            </tr>
          )}

          {filteredList.map((row, idx) => (
            <tr key={row.puskesmasId || row.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
              <td className="border border-gray-300 px-3 py-1 text-left font-medium">
                {row.namaPuskesmas || row.id}
              </td>
              {SEMUA_GRUP.flatMap((grup) =>
                getKolomTampilPerGrup(grup).map((field) => {
                  const val = field.hitung ? field.hitung(row) : Number(row[field.key] || 0);
                  return (
                    <td key={field.key} className="border border-gray-300 px-2 py-1 text-center">
                      {val}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-emerald-100 font-bold">
            <td className="border border-gray-300 px-2 py-2" colSpan={2}>
              TOTAL
            </td>
            {SEMUA_GRUP.flatMap((grup) =>
              getKolomTampilPerGrup(grup).map((field) => (
                <td key={field.key} className="border border-gray-300 px-2 py-2 text-center">
                  {totals[field.key] || 0}
                </td>
              ))
            )}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}