// components/comShk/form/ShkSubmitFooter.jsx
"use client";

export default function ShkSubmitFooter({ onSubmit, saving, isEditable, periodDocExists }) {
  const canInteract = isEditable && periodDocExists;
  return (
    <div className="flex items-center justify-end mt-6 pt-4 border-t border-outline-variant">
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canInteract || saving}
        className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-sm">{saving ? "progress_activity" : "send"}</span>
        {saving ? "Mengirim..." : "Kirim Laporan"}
      </button>
    </div>
  );
}