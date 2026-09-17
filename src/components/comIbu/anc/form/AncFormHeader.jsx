// components/anc/AncFormHeader.js
export default function AncFormHeader({ puskesmasName, targetBumil, autoSaveStatus, isEditable, periodLabel }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
      <div>
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Form Pelaporan ANC Puskesmas
        </h2>
        <div className="flex items-center gap-2 mt-1 text-on-surface-variant font-body-md text-body-md">
          <span className="material-symbols-outlined text-sm">local_hospital</span>
          <span className="font-medium text-primary">{puskesmasName}</span>
          <span>•</span>
          <span>Target Sasaran Bumil: <strong>{targetBumil}</strong> orang</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {isEditable && autoSaveStatus === 'saving' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />Menyimpan...
          </span>
        )}
        {isEditable && autoSaveStatus === 'saved' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>Tersimpan Otomatis
          </span>
        )}

        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-xs ${
            isEditable
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span className="material-symbols-outlined text-sm">{isEditable ? 'lock_open' : 'lock'}</span>
          <span>
            Mode Bulan Terpilih: <strong>{periodLabel}</strong> —{' '}
            {isEditable ? 'Buka (Bisa Diisi)' : 'Read-Only (Riwayat)'}
          </span>
        </div>
      </div>
    </header>
  );
}