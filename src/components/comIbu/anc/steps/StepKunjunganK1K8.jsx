'use client';

export default function StepKunjunganK1K8({ values = {}, onChange, targetBumil = 0, disabled = false }) {
  const getBadgeClass = (percentage) => {
    if (percentage >= 80) return 'bg-[#dcfce7] text-[#166534]';
    if (percentage >= 50) return 'bg-[#fef08a] text-[#854d0e]';
    return 'bg-surface-variant text-on-surface-variant';
  };

  const calcPct = (val) => {
    const num = Number(val) || 0;
    return targetBumil > 0 ? Math.min(100, Math.round((num / targetBumil) * 100)) : 0;
  };

  const k1Murni = Number(values.k1Murni) || 0;
  const k1Lebih12Minggu = Number(values.k1Lebih12Minggu) || 0;
  const k1Akses = k1Murni + k1Lebih12Minggu;
  const k1AksesPct = calcPct(k1Akses);

  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-3">
        <h3 className="font-headline-sm text-headline-sm text-primary">
          Step 1: Kunjungan K1 - K8 &amp; Cakupan Pelayanan
        </h3>
        <p className="text-body-md text-on-surface-variant">
          Isi data jumlah pelayanan kunjungan ibu hamil (K1 hingga K8) di wilayah Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* K1 Murni (dengan badge) */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="input-label mb-0" htmlFor="k1Murni">
              K1 Murni (Kunjungan Pertama Kontak Pertama)
            </label>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeClass(calcPct(values.k1Murni))}`}>
              {calcPct(values.k1Murni)}%
            </span>
          </div>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="k1Murni"
            name="k1Murni"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.k1Murni ?? ''}
            onChange={onChange}
          />
        </div>

        {/* K1 Trimestral 1 oleh Dokter / USG */}
        <div>
          <label className="input-label" htmlFor="k1Tw1DokterUsg">
            K1 Trimester 1 oleh Dokter / USG
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="k1Tw1DokterUsg"
            name="k1Tw1DokterUsg"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.k1Tw1DokterUsg ?? ''}
            onChange={onChange}
          />
        </div>

        {/* K1 Lebih 12 Minggu (dengan badge) */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="input-label mb-0" htmlFor="k1Lebih12Minggu">
              K1 Akses / K1 &gt; 12 Minggu
            </label>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeClass(calcPct(values.k1Lebih12Minggu))}`}>
              {calcPct(values.k1Lebih12Minggu)}%
            </span>
          </div>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="k1Lebih12Minggu"
            name="k1Lebih12Minggu"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.k1Lebih12Minggu ?? ''}
            onChange={onChange}
          />
        </div>

        {/* K1 Akses Total (Otomatis & Read-Only) */}
        <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant">
          <div className="flex justify-between items-end mb-1">
            <span className="font-label-md text-label-md text-primary font-semibold">
              Total K1 Akses (Otomatis: K1 Murni + K1 &gt; 12 Mgg)
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${getBadgeClass(k1AksesPct)}`}>
              {k1AksesPct}%
            </span>
          </div>
          <input
            className="input-field bg-slate-100 font-bold text-primary cursor-not-allowed"
            type="number"
            readOnly
            value={k1Akses}
          />
        </div>

        {/* Ibu Hamil Memiliki Buku KIA */}
        <div>
          <label className="input-label" htmlFor="bumilBukuKia">
            Ibu Hamil Memiliki Buku KIA
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="bumilBukuKia"
            name="bumilBukuKia"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.bumilBukuKia ?? ''}
            onChange={onChange}
          />
        </div>

        {/* K1 Pelayanan oleh Dokter */}
        <div>
          <label className="input-label" htmlFor="k1OlehDokter">
            K1 Pelayanan oleh Dokter
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="k1OlehDokter"
            name="k1OlehDokter"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.k1OlehDokter ?? ''}
            onChange={onChange}
          />
        </div>

        {/* K5 Pelayanan oleh Dokter + USG */}
        <div>
          <label className="input-label" htmlFor="k5OlehDokterUsg">
            K5 Pelayanan oleh Dokter + USG
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="k5OlehDokterUsg"
            name="k5OlehDokterUsg"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.k5OlehDokterUsg ?? ''}
            onChange={onChange}
          />
        </div>

        {/* K6 Pelayanan Kesehatan */}
        <div>
          <label className="input-label" htmlFor="k6">
            K6 Pelayanan Kesehatan Ibu Hamil
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="k6"
            name="k6"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.k6 ?? ''}
            onChange={onChange}
          />
        </div>

        {/* K8 Pelayanan Kesehatan */}
        <div>
          <label className="input-label" htmlFor="k8">
            K8 Pelayanan Kesehatan Ibu Hamil
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="k8"
            name="k8"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.k8 ?? ''}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}
