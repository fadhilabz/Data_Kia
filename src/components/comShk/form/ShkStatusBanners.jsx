// components/comShk/form/ShkStatusBanners.jsx
"use client";

export default function ShkStatusBanners({ periodDocExists, isReadOnly, periodLabel }) {
  if (isReadOnly) {
    return (
      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
        <span className="material-symbols-outlined text-base text-rose-600">lock</span>
        <span className="font-medium">
          Periode {periodLabel} sedang <strong>terkunci</strong> (Read-Only). Hubungi Admin Dinas Kesehatan untuk membuka periode ini.
        </span>
      </div>
    );
  }
  if (periodDocExists === false) {
    return (
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
        <span className="material-symbols-outlined text-base text-amber-600">info</span>
        <div>
          <p className="font-bold">Periode Belum Pernah Dibuka</p>
          <p>Dokumen pelaporan SHK untuk {periodLabel} belum pernah diinisialisasi oleh Admin Dinas Kesehatan.</p>
        </div>
      </div>
    );
  }
  return null;
}