// components/sdm/form/StepSdm.jsx
'use client';

import { SDM_FIELDS, SDM_COMPUTED_FIELDS } from '@/constants/sdmFields';

function FieldNumber({ label, name, value, onChange, disabled }) {
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

function FieldOtomatis({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-on-surface-variant">{label} (Otomatis)</label>
      <div className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-high text-on-surface text-sm font-bold">
        {value}
      </div>
    </div>
  );
}

function groupFields(fields) {
  const groups = [];
  const indexByGroup = {};
  fields.forEach((field) => {
    if (!(field.group in indexByGroup)) {
      indexByGroup[field.group] = groups.length;
      groups.push({ group: field.group, fields: [] });
    }
    groups[indexByGroup[field.group]].fields.push(field);
  });
  return groups;
}

export default function StepSdm({ values, onChange, disabled }) {
  const groupedFields = groupFields(SDM_FIELDS);
  const computedByGroup = {};
  SDM_COMPUTED_FIELDS.forEach((f) => {
    if (!computedByGroup[f.group]) computedByGroup[f.group] = [];
    computedByGroup[f.group].push(f);
  });

  return (
    <div className="space-y-6">
      {groupedFields.map((groupItem) => (
        <div key={groupItem.group}>
          <h3 className="font-bold text-sm text-primary mb-3">{groupItem.group}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupItem.fields.map((field) => (
              <FieldNumber
                key={field.key}
                label={field.label}
                name={field.key}
                value={values[field.key]}
                onChange={onChange}
                disabled={disabled}
              />
            ))}
            {(computedByGroup[groupItem.group] || []).map((field) => (
              <FieldOtomatis key={field.key} label={field.label} value={field.hitung(values)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}