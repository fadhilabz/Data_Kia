// components/anct/form/AnctFormHeader.jsx
'use client';

export default function AnctFormHeader({ puskesmasName, autoSaveStatus, isEditable, periodLabel }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="font-bold text-lg text-primary">Form ANC Terpadu — {puskesmasName}</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Periode: <span className="font-semibold">{periodLabel}</span>
          {!isEditable && <span className="ml-2 text-rose-600 font-semibold">(Terkunci)</span>}
        </p>
      </div>
      <div className="text-xs">
        {autoSaveStatus === 'saving' && <span className="text-on-surface-variant">Menyimpan draft...</span>}
        {autoSaveStatus === 'saved' && <span className="text-emerald-600 font-medium">Tersimpan</span>}
        {autoSaveStatus === 'error' && <span className="text-red-600 font-medium">Gagal menyimpan</span>}
      </div>
    </div>
  );
}