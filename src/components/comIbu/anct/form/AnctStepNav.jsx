// components/anct/form/AnctStepNav.jsx
'use client';

export const ANCT_STEPS = [
  { id: 1, label: 'PPIA (HIV)', icon: 'coronavirus' },
  { id: 2, label: 'Malaria', icon: 'bug_report' },
  { id: 3, label: 'TB', icon: 'lungs' },
  { id: 4, label: 'Kecacingan', icon: 'pest_control' },
  { id: 5, label: 'IMS', icon: 'health_and_safety' },
  { id: 6, label: 'Hepatitis B', icon: 'vaccines' },
];

export default function AnctStepNav({ activeStep, onStepClick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ANCT_STEPS.map((step) => (
        <button
          key={step.id}
          type="button"
          onClick={() => onStepClick(step.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeStep === step.id
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-base">{step.icon}</span>
          {step.id}. {step.label}
        </button>
      ))}
    </div>
  );
}