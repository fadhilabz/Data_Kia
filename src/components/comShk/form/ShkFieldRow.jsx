// components/comShk/form/ShkFieldRow.jsx
"use client";

export default function ShkFieldRow({ field, value, onChange, disabled }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:gap-3 items-end py-2 border-b border-outline-variant/50 last:border-b-0">
      <label className="text-xs font-medium text-on-surface-variant sm:pb-2">{field.label}</label>
      <input
        type="number"
        min="0"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="w-28 px-2 py-1.5 rounded-lg border border-outline-variant text-sm text-right disabled:bg-surface-container-high"
      />
    </div>
  );
}