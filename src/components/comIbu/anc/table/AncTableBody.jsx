// components/anc/AncTableBody.jsx
// Komponen terpisah untuk <tbody> tabel rekapitulasi ANC yang merender <td> secara dinamis berbasis ANC_FIELDS.

'use client';

import { ANC_FIELDS, getFieldValue } from '@/constants/ancFields';

export default function AncTableBody({ puskesmasList = [], searchQuery = '', onRowClick }) {
  const filteredList = puskesmasList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nama = (item.namaPuskesmas || item.nama || '').toLowerCase();
    const kec = (item.kecamatan || '').toLowerCase();
    return nama.includes(q) || kec.includes(q);
  });

  if (filteredList.length === 0) {
    return (
      <tbody className="divide-y divide-outline-variant text-on-surface">
        <tr>
          <td colSpan={ANC_FIELDS.length + 2} className="p-8 text-center text-on-surface-variant text-xs">
            {puskesmasList.length === 0
              ? 'Belum ada data laporan ANC yang tersedia.'
              : `Tidak ada data Puskesmas yang cocok dengan pencarian "${searchQuery}".`}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-outline-variant text-on-surface">
      {filteredList.map((item, index) => {
        const pkmName = item.namaPuskesmas || item.nama || `Puskesmas ${index + 1}`;

        return (
          <tr
            key={item.puskesmasId || item.id || index}
            onClick={() => onRowClick && onRowClick(item)}
            className={`hover:bg-amber-50/70 transition-colors text-center text-xs ${
              onRowClick ? 'cursor-pointer' : ''
            }`}
            title={onRowClick ? `Klik untuk edit/lihat rincian data ANC ${pkmName}` : undefined}
          >
            {/* No */}
            <td className="p-2.5 border-r border-outline-variant text-on-surface-variant font-medium sticky left-0 bg-surface-container-lowest z-10 min-w-[40px]">
              {index + 1}
            </td>

            {/* Nama Puskesmas */}
            <td className="p-2.5 font-semibold text-primary text-left border-r border-outline-variant sticky left-[40px] bg-surface-container-lowest z-10 shadow-sm min-w-[160px] truncate flex items-center justify-between">
              <span>{pkmName}</span>
              {onRowClick && (
                <span className="material-symbols-outlined text-xs text-on-surface-variant hover:text-primary transition ml-1">
                  edit
                </span>
              )}
            </td>

            {/* Iterasi 78+ Kolom Indikator Dinamis */}
            {ANC_FIELDS.map((field) => {
              const val = getFieldValue(item, field, item);
              const formattedVal = field.isPercent ? `${val}%` : val.toLocaleString('id-ID');
              const isHighlight = field.key === 'k8' || field.key === 'k8Cakupan';

              return (
                <td
                  key={field.key}
                  className={`p-2.5 border-r border-outline-variant/60 font-mono text-[11px] ${
                    isHighlight
                      ? 'bg-sky-50 font-bold text-sky-900'
                      : field.isPercent
                      ? 'text-on-surface-variant'
                      : 'text-on-surface font-medium'
                  }`}
                >
                  {formattedVal}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}
