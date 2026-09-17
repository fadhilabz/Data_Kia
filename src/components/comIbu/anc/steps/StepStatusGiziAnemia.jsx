'use client';

export default function StepStatusGiziAnemia({ values = {}, onChange, targetBumil = 0 }) {
  const getBadgeClass = (percentage) => {
    if (percentage >= 80) return 'bg-[#dcfce7] text-[#166534]';
    if (percentage >= 50) return 'bg-[#fef08a] text-[#854d0e]';
    return 'bg-surface-variant text-on-surface-variant';
  };

  const calcPct = (val) => {
    const num = Number(val) || 0;
    return targetBumil > 0 ? Math.min(100, Math.round((num / targetBumil) * 100)) : 0;
  };

  const anemiaRingan = Number(values.anemiaRingan) || 0;
  const anemiaSedang = Number(values.anemiaSedang) || 0;
  const anemiaBerat = Number(values.anemiaBerat) || 0;
  const totalAnemia = anemiaRingan + anemiaSedang + anemiaBerat;
  const totalAnemiaPct = calcPct(totalAnemia);

  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-3">
        <h3 className="font-headline-sm text-headline-sm text-primary">
          Step 4: Status Gizi, TT, &amp; Kasus Anemia
        </h3>
        <p className="text-body-md text-on-surface-variant">
          Pemberian imunisasi TT, tablet tambah darah, status gizi KEK, dan tingkatan anemia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Imunisasi T1 - T5 */}
        <div>
          <label className="input-label" htmlFor="t1">
            Status TT1 / Trimester 1 (T1)
          </label>
          <input
            className="input-field"
            id="t1"
            name="t1"
            type="number"
            min="0"
            placeholder="Jumlah ibu hamil"
            value={values.t1 ?? ''}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="input-label" htmlFor="t2">
            Status TT2 / Trimester 2 (T2)
          </label>
          <input
            className="input-field"
            id="t2"
            name="t2"
            type="number"
            min="0"
            placeholder="Jumlah ibu hamil"
            value={values.t2 ?? ''}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="input-label" htmlFor="t3">
            Status TT3 / Trimester 3 (T3)
          </label>
          <input
            className="input-field"
            id="t3"
            name="t3"
            type="number"
            min="0"
            placeholder="Jumlah ibu hamil"
            value={values.t3 ?? ''}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="input-label" htmlFor="t4">
            Status TT4 / Lanjutan (T4)
          </label>
          <input
            className="input-field"
            id="t4"
            name="t4"
            type="number"
            min="0"
            placeholder="Jumlah ibu hamil"
            value={values.t4 ?? ''}
            onChange={onChange}
          />
        </div>

        <div>
          <label className="input-label" htmlFor="t5">
            Status TT5 (T5)
          </label>
          <input
            className="input-field"
            id="t5"
            name="t5"
            type="number"
            min="0"
            placeholder="Jumlah ibu hamil"
            value={values.t5 ?? ''}
            onChange={onChange}
          />
        </div>

        {/* TTD 90/180 */}
        <div>
          <label className="input-label" htmlFor="ttd180">
            Pemberian TTD Minimal 90/180 Tablet
          </label>
          <input
            className="input-field"
            id="ttd180"
            name="ttd180"
            type="number"
            min="0"
            placeholder="Jumlah ibu hamil"
            value={values.ttd180 ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Anemia Ringan */}
        <div>
          <label className="input-label" htmlFor="anemiaRingan">
            Ibu Hamil Anemia Ringan (Hb 10-10.9 gr/dl)
          </label>
          <input
            className="input-field"
            id="anemiaRingan"
            name="anemiaRingan"
            type="number"
            min="0"
            placeholder="Jumlah kasus"
            value={values.anemiaRingan ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Anemia Sedang */}
        <div>
          <label className="input-label" htmlFor="anemiaSedang">
            Ibu Hamil Anemia Sedang (Hb 8-9.9 gr/dl)
          </label>
          <input
            className="input-field"
            id="anemiaSedang"
            name="anemiaSedang"
            type="number"
            min="0"
            placeholder="Jumlah kasus"
            value={values.anemiaSedang ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Anemia Berat */}
        <div>
          <label className="input-label" htmlFor="anemiaBerat">
            Ibu Hamil Anemia Berat (Hb &lt; 8 gr/dl)
          </label>
          <input
            className="input-field"
            id="anemiaBerat"
            name="anemiaBerat"
            type="number"
            min="0"
            placeholder="Jumlah kasus"
            value={values.anemiaBerat ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Total Anemia (Otomatis & Read-only) */}
        <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant">
          <div className="flex justify-between items-end mb-1">
            <span className="font-label-md text-label-md text-primary font-semibold">
              Total Ibu Hamil Anemia (Otomatis: Ringan + Sedang + Berat)
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${getBadgeClass(totalAnemiaPct)}`}>
              {totalAnemiaPct}%
            </span>
          </div>
          <input
            className="input-field bg-slate-100 font-bold text-primary cursor-not-allowed"
            type="number"
            readOnly
            value={totalAnemia}
          />
        </div>

        {/* Konsumsi Suplemen Gizi */}
        <div>
          <label className="input-label" htmlFor="konsumsiSuplemenGizi">
            Konsumsi Suplemen Gizi Tambahan
          </label>
          <input
            className="input-field"
            id="konsumsiSuplemenGizi"
            name="konsumsiSuplemenGizi"
            type="number"
            min="0"
            placeholder="Jumlah ibu hamil"
            value={values.konsumsiSuplemenGizi ?? ''}
            onChange={onChange}
          />
        </div>

        {/* KEK */}
        <div>
          <label className="input-label" htmlFor="bumilKek">
            Ibu Hamil KEK (Kurang Energi Kronis / LILA &lt; 23.5cm)
          </label>
          <input
            className="input-field"
            id="bumilKek"
            name="bumilKek"
            type="number"
            min="0"
            placeholder="Jumlah kasus"
            value={values.bumilKek ?? ''}
            onChange={onChange}
          />
        </div>

        {/* PMT */}
        <div>
          <label className="input-label" htmlFor="kekDapatMakananTambahan">
            Bumil KEK Mendapatkan Makanan Tambahan (PMT)
          </label>
          <input
            className="input-field"
            id="kekDapatMakananTambahan"
            name="kekDapatMakananTambahan"
            type="number"
            min="0"
            placeholder="Jumlah penerima PMT"
            value={values.kekDapatMakananTambahan ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Jumlah Risiko KEK */}
        <div>
          <label className="input-label" htmlFor="jumlahKekResikoKek">
            Jumlah Bumil Risiko KEK
          </label>
          <input
            className="input-field"
            id="jumlahKekResikoKek"
            name="jumlahKekResikoKek"
            type="number"
            min="0"
            placeholder="Jumlah kasus"
            value={values.jumlahKekResikoKek ?? ''}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}
