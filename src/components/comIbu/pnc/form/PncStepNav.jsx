// components/pnc/form/PncStepNav.jsx
export const PNC_STEPS = [
  { id: 1, label: "Persalinan, Tablet & Vit A", shortLabel: "Persalinan" },
  { id: 2, label: "Kunjungan Nifas & Komplikasi", shortLabel: "KF & Komplikasi" },
];

export default function PncStepNav({ activeStep, onStepClick }) {
  return (
    <nav
      aria-label="Step Indicator"
      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 shadow-sm"
    >
      <div className="grid grid-cols-2 gap-2">
        {PNC_STEPS.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(step.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg text-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary-container text-on-primary-container font-bold shadow-sm ring-2 ring-primary-container/30"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive ? "bg-white text-primary-container" : "bg-outline-variant text-on-surface"
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