// components/anc/AncStepFooter.js
export default function AncStepFooter({ activeStep, onBack, onNext, onSubmit, saving, isEditable, periodDocExists }) {
  return (
    <footer className="mt-8 pt-6 border-t border-outline-variant flex justify-between items-center gap-4">
      <button
        type="button"
        onClick={onBack}
        disabled={activeStep === 1}
        className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>Kembali
      </button>

      <div className="flex items-center gap-3">
        {activeStep < 6 ? (
          <button
            type="button"
            onClick={onNext}
            className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm cursor-pointer"
          >
            Lanjut<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        ) : isEditable && periodDocExists ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-primary-container text-white font-label-md text-label-md hover:bg-primary transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Menyiapkan Final...' : 'Simpan Laporan ANC'}
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            <span className="material-symbols-outlined text-[16px]">lock</span>Periode Read-Only (Riwayat)
          </div>
        )}
      </div>
    </footer>
  );
}