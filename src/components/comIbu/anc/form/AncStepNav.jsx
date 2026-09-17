// components/anc/AncStepNav.js
export const ANC_STEPS = [
  { id: 1, label: 'Kunjungan K1-K8', shortLabel: 'K1-K8' },
  { id: 2, label: 'Checklist 12T', shortLabel: '12T' },
  { id: 3, label: 'Tes Lab & Tata Laksana', shortLabel: 'Tes Lab' },
  { id: 4, label: 'Status TT, Anemia & Gizi', shortLabel: 'TT & Gizi' },
  { id: 5, label: 'Preeklamsia & Komplikasi', shortLabel: 'Komplikasi' },
  { id: 6, label: 'Deteksi Resti & PONED', shortLabel: 'Resti & PONED' },
];

export default function AncStepNav({ activeStep, onStepClick }) {
  return (
    <nav
      aria-label="Step Indicator"
      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 shadow-sm"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {ANC_STEPS.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(step.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg text-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm ring-2 ring-primary-container/30'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive ? 'bg-white text-primary-container' : 'bg-outline-variant text-on-surface'
                  }`}
                >
                  {step.id}
                </span>
                <span className="text-xs font-semibold truncate">{step.shortLabel}</span>
              </div>
              <span className="text-[11px] mt-0.5 opacity-80 hidden md:block truncate max-w-full">
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}