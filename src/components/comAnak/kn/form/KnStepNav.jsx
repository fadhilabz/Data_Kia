// components/kn/form/KnStepNav.jsx
// 5 langkah wizard KN — mengelompokkan 35 indikator KN_FIELDS berdasarkan
// `group`-nya supaya user tidak dihadapkan 70 input sekaligus di 1 layar.

export const KN_STEPS = [
  {
    id: 1,
    label: "Perawatan Neonatal 0-6 Jam",
    shortLabel: "0-6 Jam",
    groups: ["Perawatan Neonatal Esensial 0-6 Jam"],
  },
  {
    id: 2,
    label: "Pelayanan Neonatal 6-28 Hari",
    shortLabel: "6-28 Hari",
    groups: ["Pelayanan Neonatal 6-28 Hari"],
  },
  {
    id: 3,
    label: "Cakupan KN, Lahir & Komplikasi",
    shortLabel: "Cakupan & Lahir",
    groups: ["Cakupan Kunjungan Neonatal", "Jumlah Lahir", "Komplikasi Neonatal"],
  },
  {
    id: 4,
    label: "Komplikasi pada Neonatus",
    shortLabel: "Komplikasi Neonatus",
    groups: ["Komplikasi pada Neonatus"],
  },
  {
    id: 5,
    label: "Kunjungan Bayi Muda",
    shortLabel: "Bayi Muda",
    groups: ["Kunjungan Bayi Muda"],
  },
];

export default function KnStepNav({ activeStep, onStepClick }) {
  return (
    <nav
      aria-label="Step Indicator"
      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 shadow-sm overflow-x-auto"
    >
      <div className="grid grid-cols-5 gap-2 min-w-[600px]">
        {KN_STEPS.map((step) => {
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
              <span className="text-[10px] mt-0.5 opacity-80 hidden md:block truncate max-w-full">
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}