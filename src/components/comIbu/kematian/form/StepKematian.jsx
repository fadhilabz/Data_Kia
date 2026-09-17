// components/kematian/form/StepKematian.jsx
//
// Form input Kematian Ibu. Field dirender otomatis dari KEMATIAN_FIELDS,
// dikelompokkan per `group` (Saat Kejadian, Sebab Kematian Ibu).
// "Jumlah Kematian Ibu" dihitung otomatis (hamil + bersalin + nifas),
// ditampilkan sebagai info, bukan input manual.

'use client';

import { KEMATIAN_FIELDS, KEMATIAN_CATATAN_FIELD, hitungJumlahKematianIbu } from '@/constants/kematianFields';

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

export default function StepKematian({ values, onChange, disabled }) {
  const groupedFields = groupFields(KEMATIAN_FIELDS);
  const jumlahKematianIbu = hitungJumlahKematianIbu(values);

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
          </div>

          {groupItem.group === 'Saat Kejadian' && (
            <p className="text-xs text-on-surface-variant mt-3">
              Jumlah Kematian Ibu (otomatis): <strong>{jumlahKematianIbu}</strong>
            </p>
          )}
        </div>
      ))}

      <div>
        <h3 className="font-bold text-sm text-primary mb-3">{KEMATIAN_CATATAN_FIELD.label}</h3>
        <textarea
          name={KEMATIAN_CATATAN_FIELD.key}
          value={values[KEMATIAN_CATATAN_FIELD.key] ?? ''}
          onChange={onChange}
          disabled={disabled}
          rows={3}
          placeholder="Tuliskan keterangan sebab kematian lain-lain (jika ada)..."
          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}