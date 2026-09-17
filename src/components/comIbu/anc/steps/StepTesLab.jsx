'use client';

export default function StepTesLab({ values = {}, onChange, targetBumil = 0, disabled = false }) {
  const getBadgeClass = (percentage) => {
    if (percentage >= 80) return 'bg-[#dcfce7] text-[#166534]';
    if (percentage >= 50) return 'bg-[#fef08a] text-[#854d0e]';
    return 'bg-surface-variant text-on-surface-variant';
  };

  const calcPct = (val) => {
    const num = Number(val) || 0;
    return targetBumil > 0 ? Math.min(100, Math.round((num / targetBumil) * 100)) : 0;
  };

  const cakupan12tPct = calcPct(values.cakupanStandar12tAbs);

  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-3">
        <h3 className="font-headline-sm text-headline-sm text-primary">
          Step 3: Tes Laboratorium &amp; Skrining Lanjutan
        </h3>
        <p className="text-body-md text-on-surface-variant">
          Pemeriksaan darah, serologi (HIV/Sifilis/Hepatitis), USG, dan skrining jiwa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hb Trimester 1 */}
        <div>
          <label className="input-label" htmlFor="hbTm1">
            Pemeriksaan Hb Trimester 1
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="hbTm1"
            name="hbTm1"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.hbTm1 ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Hb Trimester 3 */}
        <div>
          <label className="input-label" htmlFor="hbTm3">
            Pemeriksaan Hb Trimester 3
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="hbTm3"
            name="hbTm3"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.hbTm3 ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Golongan Darah */}
        <div>
          <label className="input-label" htmlFor="golDarah">
            Pemeriksaan Golongan Darah
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="golDarah"
            name="golDarah"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.golDarah ?? ''}
            onChange={onChange}
          />
        </div>

        {/* HIV */}
        <div>
          <label className="input-label" htmlFor="hiv">
            Pemeriksaan HIV
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="hiv"
            name="hiv"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.hiv ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Sifilis */}
        <div>
          <label className="input-label" htmlFor="sifilis">
            Pemeriksaan Sifilis
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="sifilis"
            name="sifilis"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.sifilis ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Hepatitis B (HBsAg) */}
        <div>
          <label className="input-label" htmlFor="hepatitis">
            Pemeriksaan Hepatitis B (HBsAg)
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="hepatitis"
            name="hepatitis"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.hepatitis ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Tata Laksana Kasus */}
        <div>
          <label className="input-label" htmlFor="tataLaksanaKasus">
            Tata Laksana Kasus Hasil Lab
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="tataLaksanaKasus"
            name="tataLaksanaKasus"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah kasus"
            value={values.tataLaksanaKasus ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Temu Wicara */}
        <div>
          <label className="input-label" htmlFor="temuWicara">
            Temu Wicara (Konseling)
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="temuWicara"
            name="temuWicara"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.temuWicara ?? ''}
            onChange={onChange}
          />
        </div>

        {/* USG K1 Akses */}
        <div>
          <label className="input-label" htmlFor="usgK1Akses">
            Pemeriksaan USG K1 Akses
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="usgK1Akses"
            name="usgK1Akses"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.usgK1Akses ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Skrining Kesehatan Jiwa */}
        <div>
          <label className="input-label" htmlFor="skriningJiwa">
            Skrining Kesehatan Jiwa
          </label>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="skriningJiwa"
            name="skriningJiwa"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil"
            value={values.skriningJiwa ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Cakupan Standar 12T (Akumulasi - DENGAN BADGE PERCENTAGE) */}
        <div className="md:col-span-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
          <div className="flex justify-between items-end mb-1">
            <label className="input-label font-semibold text-primary mb-0" htmlFor="cakupanStandar12tAbs">
              Cakupan Standar 12T (Akumulasi Ibu Hamil Mendapat Standar Lengkap)
            </label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${getBadgeClass(cakupan12tPct)}`}>
              {cakupan12tPct}%
            </span>
          </div>
          <input
            className="input-field disabled:bg-slate-100 disabled:cursor-not-allowed"
            id="cakupanStandar12tAbs"
            name="cakupanStandar12tAbs"
            type="number"
            min="0"
            disabled={disabled}
            placeholder="Jumlah ibu hamil lengkap 12T"
            value={values.cakupanStandar12tAbs ?? ''}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}
