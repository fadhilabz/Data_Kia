// components/anct/form/AnctEditForm.jsx
//
// Versi satu halaman penuh (semua 6 kategori sekaligus, tanpa wizard step).
// Dipakai admin untuk edit cepat satu laporan Puskesmas tanpa klik
// bolak-balik antar step seperti di form petugas.

'use client';

import { ANCT_FIELDS, ANCT_CATATAN_FIELD } from '@/constants/anctFields';

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

export default function AnctEditForm({ values, onChange, disabled, onSave, saving }) {
  const groupedFields = groupFields(ANCT_FIELDS);

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
        </div>
      ))}

      <div>
        <h3 className="font-bold text-sm text-primary mb-3">{ANCT_CATATAN_FIELD.label}</h3>
        <textarea
          name={ANCT_CATATAN_FIELD.key}
          value={values[ANCT_CATATAN_FIELD.key] ?? ''}
          onChange={onChange}
          disabled={disabled}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {!disabled && onSave && (
        <div className="flex justify-end pt-4 border-t border-outline-variant">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      )}
    </div>
  );
}