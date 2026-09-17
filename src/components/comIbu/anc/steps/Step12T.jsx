'use client';

export default function Step12T({ values = {}, onChange, disabled = false }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-3">
        <h3 className="font-headline-sm text-headline-sm text-primary">
          Step 2: Pelayanan Standar 12T
        </h3>
        <p className="text-body-md text-on-surface-variant">
          Pemeriksaan checklist pelayanan standar 12T pada ibu hamil.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TB / BB */}
        <div>
          <label className="input-label" htmlFor="tbBb">
            Ibu Hamil di Periksa TB/BB
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="tbBb"
            name="tbBb"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.tbBb ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Tekanan Darah (TD) */}
        <div>
          <label className="input-label" htmlFor="td">
            Ibu Hamil di Periksa Tekanan Darah (TD)
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="td"
            name="td"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.td ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Status Gizi (LILA) */}
        <div>
          <label className="input-label" htmlFor="statusGizi">
            Ibu Hamil di Periksa Status Gizi (LILA)
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="statusGizi"
            name="statusGizi"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.statusGizi ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Tinggi Fundus Uteri (TFU) */}
        <div>
          <label className="input-label" htmlFor="tfu">
            Ibu Hamil di Periksa Tinggi Fundus Uteri (TFU)
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="tfu"
            name="tfu"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.tfu ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Presentasi Janin & DJJ */}
        <div>
          <label className="input-label" htmlFor="djj">
            Ibu Hamil di Periksa Presentasi Janin &amp; DJJ
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="djj"
            name="djj"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.djj ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Status TT */}
        <div>
          <label className="input-label" htmlFor="statusTt">
            Ibu Hamil di Periksa Skrining / Imunisasi Status TT
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="statusTt"
            name="statusTt"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.statusTt ?? ''}
            onChange={onChange}
          />
        </div>

        {/* TTD */}
        <div>
          <label className="input-label" htmlFor="ttd">
            Ibu Hamil Mendapatkan Tablet Tambah Darah (TTD)
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="ttd"
            name="ttd"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.ttd ?? ''}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}
