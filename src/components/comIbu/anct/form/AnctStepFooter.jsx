// components/anct/form/AnctStepFooter.jsx
'use client';

export default function AnctStepFooter({
  activeStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  saving,
  isEditable,
  periodDocExists,
}) {
  if (!isEditable || !periodDocExists) return null;

  const isFirstStep = activeStep <= 1;
  const isLastStep = activeStep >= totalSteps;

  return (
    <div className="flex justify-between items-center mt-8 pt-4 border-t border-outline-variant">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep}
        className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Kembali
      </button>

      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Submit Final'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90"
        >
          Lanjut
        </button>
      )}
    </div>
  );
}