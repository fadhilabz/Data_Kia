// components/anct/steps/StepHepatitisB.jsx
'use client';

import { getFieldsByGroup, FieldNumber } from './anctStepHelpers';
import { ANCT_CATATAN_FIELD } from '@/constants/anctFields';

const FIELDS = getFieldsByGroup('Hepatitis B');

export default function StepHepatitisB({ values, onChange, disabled }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm text-primary mb-3">Pencegahan Hepatitis B dalam Kehamilan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FIELDS.map((field) => (
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

      <div>
        <h3 className="font-bold text-sm text-primary mb-3">{ANCT_CATATAN_FIELD.label}</h3>
        <textarea
          name={ANCT_CATATAN_FIELD.key}
          value={values[ANCT_CATATAN_FIELD.key] ?? ''}
          onChange={onChange}
          disabled={disabled}
          rows={3}
          placeholder="Tuliskan keterangan kasus khusus (jika ada)..."
          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}