// components/anct/steps/StepIms.jsx
'use client';

import { getFieldsByGroup, FieldNumber } from './anctStepHelpers';

const FIELDS = getFieldsByGroup('IMS');

export default function StepIms({ values, onChange, disabled }) {
  return (
    <div>
      <h3 className="font-bold text-sm text-primary mb-3">Pencegahan IMS dalam Kehamilan</h3>
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
  );
}