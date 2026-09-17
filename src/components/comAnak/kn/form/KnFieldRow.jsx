// components/kn/form/KnFieldRow.jsx
// Satu baris untuk satu indikator KN: label, input L, input P, dan
// tampilan hasil otomatis (TOTAL untuk type 'total', ABS+% untuk type
// 'percent'). Dipakai berulang lewat .map() di semua step wizard KN,
// supaya tidak perlu menulis 70 input JSX manual.

"use client";

import { getKnPart, getKnDenominator, formatKnPercent } from "@/constants/knFields";

export default function KnFieldRow({ field, formData, pkm, onChange, disabled }) {
  const l = getKnPart(formData, field.key, "l");
  const p = getKnPart(formData, field.key, "p");
  const abs = l + p;

  const denom =
    field.type === "percent"
      ? getKnDenominator(formData, pkm, field.denominatorKey)
      : null;
  const percent = field.type === "percent" ? formatKnPercent(abs, denom) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-3 items-end py-2 border-b border-outline-variant/50 last:border-b-0">
      <label className="text-xs font-medium text-on-surface-variant sm:pb-2">
        {field.label}
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-on-surface-variant font-semibold">L</span>
        <input
          type="number"
          min="0"
          value={l}
          disabled={disabled}
          onChange={(e) => onChange(field.key, "L", e.target.value)}
          className="w-20 px-2 py-1.5 rounded-lg border border-outline-variant text-sm text-right disabled:bg-surface-container-high"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-on-surface-variant font-semibold">P</span>
        <input
          type="number"
          min="0"
          value={p}
          disabled={disabled}
          onChange={(e) => onChange(field.key, "P", e.target.value)}
          className="w-20 px-2 py-1.5 rounded-lg border border-outline-variant text-sm text-right disabled:bg-surface-container-high"
        />
      </div>

      <div className="flex flex-col gap-1 min-w-[70px]">
        <span className="text-[10px] text-on-surface-variant font-semibold">
          {field.type === "percent" ? "Abs / %" : "Total"}
        </span>
        <div className="px-2 py-1.5 rounded-lg bg-surface-container-high text-sm text-right font-semibold text-primary">
          {field.type === "percent" ? `${abs} (${percent}%)` : abs}
        </div>
      </div>
    </div>
  );
}