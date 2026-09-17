// components/kn/form/StepKn.jsx
// Satu komponen step GENERIK dipakai untuk ke-5 langkah wizard KN.
// Filter KN_FIELDS berdasarkan `groups` yang dikirim step tsb (lihat
// KnStepNav.jsx), lalu render tiap group sebagai sub-heading + baris
// KnFieldRow untuk setiap indikator di dalamnya.

"use client";

import { KN_FIELDS } from "@/constants/knFields";
import KnFieldRow from "./KnFieldRow";

export default function StepKn({ groups, formData, pkm, onChange, disabled }) {
  // Kelompokkan field yang relevan per group, urutan sesuai KN_FIELDS asli
  const fieldsByGroup = {};
  KN_FIELDS.forEach((field) => {
    if (groups.includes(field.group)) {
      if (!fieldsByGroup[field.group]) fieldsByGroup[field.group] = [];
      fieldsByGroup[field.group].push(field);
    }
  });

  return (
    <div className="space-y-6">
      {groups.map((groupName) => {
        const fields = fieldsByGroup[groupName] || [];
        if (fields.length === 0) return null;
        return (
          <div key={groupName}>
            <h3 className="text-sm font-bold text-primary mb-2">{groupName}</h3>
            <div>
              {fields.map((field) => (
                <KnFieldRow
                  key={field.key}
                  field={field}
                  formData={formData}
                  pkm={pkm}
                  onChange={onChange}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}