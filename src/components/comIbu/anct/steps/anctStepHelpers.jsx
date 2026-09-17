// components/anct/steps/anctStepHelpers.jsx
//
// Dipakai semua file step ANCT supaya tidak perlu filter ANCT_FIELDS
// manual di tiap file. Juga menyediakan FieldNumber standar seragam.

'use client';

import { ANCT_FIELDS } from '@/constants/anctFields';

export function getFieldsByGroup(groupName) {
  return ANCT_FIELDS.filter((f) => f.group === groupName);
}

export function FieldNumber({ label, name, value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
      <input
        type="number"
        min="0"
        name={name}
        value={value ?? 0}
        onChange={onChange}
        disabled={disabled}
        className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
}