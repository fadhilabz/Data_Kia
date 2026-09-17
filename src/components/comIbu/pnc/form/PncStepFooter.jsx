// components/pnc/form/PncStepFooter.jsx
// Footer navigasi wizard form PNC: tombol "Kembali" & "Lanjut" antar step,
// dan tombol "Kirim" (submit final) di step terakhir.
// Tombol Lanjut/Kirim di-disable kalau periode tidak editable (terkunci /
// read-only) atau dokumen laporan periode ini belum ada (periodDocExists).

"use client";

export default function PncStepFooter({
  activeStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  saving = false,
  isEditable = false,
  periodDocExists = false,
}) {
  const isFirstStep = activeStep <= 1;
  const isLastStep = activeStep >= totalSteps;
  const canInteract = isEditable && periodDocExists;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Kembali
      </button>

      <span className="text-[11px] text-on-surface-variant font-medium">
        Langkah {activeStep} dari {totalSteps}
      </span>

      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canInteract || saving}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-sm">
            {saving ? "progress_activity" : "send"}
          </span>
          {saving ? "Mengirim..." : "Kirim Laporan"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canInteract}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-primary text-on-primary hover:opacity-90 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Lanjut
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      )}
    </div>
  );
}