// components/kematian-neo/form/KematianNeoFormHeader.jsx
"use client";

export default function KematianNeoFormHeader({ puskesmasName, autoSaveStatus, isEditable, periodLabel }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
      <div>
        <h1 className="text-xl font-bold text-on-surface tracking-tight">
          Form Pelaporan Kematian Neonatal & Post-Neonatal
        </h1>
        <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">local_hospital</span>
          {puskesmasName}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
            autoSaveStatus === "saving"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : autoSaveStatus === "error"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {autoSaveStatus === "saving" ? "sync" : autoSaveStatus === "error" ? "error" : "check_circle"}
          </span>
          {autoSaveStatus === "saving" ? "Menyimpan..." : autoSaveStatus === "error" ? "Gagal Simpan" : "Tersimpan Otomatis"}
        </span>

        <span
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
            isEditable
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          <span className="material-symbols-outlined text-sm">{isEditable ? "lock_open" : "lock"}</span>
          Mode Bulan Terpilih: {periodLabel} — {isEditable ? "Buka (Bisa Diisi)" : "Terkunci (Read-Only)"}
        </span>
      </div>
    </div>
  );
}