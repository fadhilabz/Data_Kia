// components/pnc/form/StepPersalinan.jsx
function FieldNumber({ label, name, value, onChange, disabled, hint }) {
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
      {hint && <span className="text-[11px] text-on-surface-variant opacity-70">{hint}</span>}
    </div>
  );
}

export default function StepPersalinan({ values, onChange, targetBulin, disabled }) {
  const pnTotal = Number(values.pnFasyankes || 0) + Number(values.pnNonFasyankes || 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm text-primary mb-3">Persalinan Ditolong Nakes (PN)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldNumber
            label="PN di Fasyankes"
            name="pnFasyankes"
            value={values.pnFasyankes}
            onChange={onChange}
            disabled={disabled}
          />
          <FieldNumber
            label="PN di Non-Fasyankes"
            name="pnNonFasyankes"
            value={values.pnNonFasyankes}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
        <p className="text-xs text-on-surface-variant mt-2">
          PN Total (otomatis): <strong>{pnTotal}</strong>
          {targetBulin > 0 && (
            <> — {((pnTotal / targetBulin) * 100).toFixed(1)}% dari target BULIN ({targetBulin})</>
          )}
        </p>
      </div>

      <div>
        <h3 className="font-bold text-sm text-primary mb-3">Persalinan Ditolong Non-Nakes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldNumber
            label="Jumlah Persalinan Non-Nakes"
            name="pnNonNakes"
            value={values.pnNonNakes}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm text-primary mb-3">Tablet Tambah Darah & Vit A Nifas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldNumber
            label="Pemberian Tablet Tambah Darah pada Bufas"
            name="tabletTambahDarah"
            value={values.tabletTambahDarah}
            onChange={onChange}
            disabled={disabled}
          />
          <FieldNumber
            label="Vit A Nifas"
            name="vitANifas"
            value={values.vitANifas}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm text-primary mb-3">Perdarahan Pasca Salin</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldNumber
            label="Jlh Bufas Mengalami Perdarahan Pasca Salin"
            name="perdarahanPascaSalin"
            value={values.perdarahanPascaSalin}
            onChange={onChange}
            disabled={disabled}
          />
          <FieldNumber
            label="...yang Mendapat Penatalaksanaan"
            name="perdarahanPenatalaksanaan"
            value={values.perdarahanPenatalaksanaan}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}