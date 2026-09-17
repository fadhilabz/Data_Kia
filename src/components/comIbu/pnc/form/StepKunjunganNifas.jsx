// components/pnc/form/StepKunjunganNifas.jsx
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

export default function StepKunjunganNifas({ values, onChange, disabled }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm text-primary mb-3">Kunjungan Nifas (KF)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FieldNumber label="KF1" name="kf1" value={values.kf1} onChange={onChange} disabled={disabled} />
          <FieldNumber label="KF2" name="kf2" value={values.kf2} onChange={onChange} disabled={disabled} />
          <FieldNumber label="KF3" name="kf3" value={values.kf3} onChange={onChange} disabled={disabled} />
          <FieldNumber label="KF4" name="kf4" value={values.kf4} onChange={onChange} disabled={disabled} />
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm text-primary mb-3">Komplikasi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldNumber
            label="Jumlah Komplikasi dalam Persalinan"
            name="komplikasiPersalinan"
            value={values.komplikasiPersalinan}
            onChange={onChange}
            disabled={disabled}
          />
          <FieldNumber
            label="Jumlah Komplikasi Pasca Persalinan"
            name="komplikasiPascaPersalinan"
            value={values.komplikasiPascaPersalinan}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}