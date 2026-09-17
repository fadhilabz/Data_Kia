'use client';

export default function StepPreeklamsiaKomplikasi({ values = {}, onChange }) {
  return (
    <div className="space-y-8">
      <div className="border-b border-outline-variant pb-3">
        <h3 className="font-headline-sm text-headline-sm text-primary">
          Step 5: Preeklamsia, Komplikasi &amp; Penyakit Penyerta
        </h3>
        <p className="text-body-md text-on-surface-variant">
          Pencatatan kasus preeklamsia dan temuan komplikasi kesehatan pada ibu hamil.
        </p>
      </div>

      {/* Sub-bagian 1: Preeklamsia */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/60">
          <span className="material-symbols-outlined text-primary text-xl">warning</span>
          <h4 className="font-headline-sm text-base text-primary font-semibold">
            Sub-bagian 1: Preeklamsia
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="input-label" htmlFor="diskriningPreeklamsia">
              Ibu Hamil Diskrining Preeklamsia
            </label>
            <input
              className="input-field"
              id="diskriningPreeklamsia"
              name="diskriningPreeklamsia"
              type="number"
              min="0"
              placeholder="Jumlah skrining"
              value={values.diskriningPreeklamsia ?? ''}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="bumilPreeklamsia">
              Ibu Hamil Terdiagnosa Preeklamsia
            </label>
            <input
              className="input-field"
              id="bumilPreeklamsia"
              name="bumilPreeklamsia"
              type="number"
              min="0"
              placeholder="Jumlah kasus"
              value={values.bumilPreeklamsia ?? ''}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="preeklamsiaTataLaksana">
              Preeklamsia Mendapatkan Tata Laksana
            </label>
            <input
              className="input-field"
              id="preeklamsiaTataLaksana"
              name="preeklamsiaTataLaksana"
              type="number"
              min="0"
              placeholder="Jumlah tata laksana"
              value={values.preeklamsiaTataLaksana ?? ''}
              onChange={onChange}
            />
          </div>
        </div>
      </section>

      {/* Sub-bagian 2: Komplikasi & Penyakit Penyerta */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/60">
          <span className="material-symbols-outlined text-primary text-xl">medical_information</span>
          <h4 className="font-headline-sm text-base text-primary font-semibold">
            Sub-bagian 2: Komplikasi &amp; Penyakit Penyerta
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="input-label" htmlFor="keguguran">
              Kasus Keguguran (Abortus)
            </label>
            <input
              className="input-field"
              id="keguguran"
              name="keguguran"
              type="number"
              min="0"
              placeholder="Jumlah kasus"
              value={values.keguguran ?? ''}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="penyakitPenyertaNonObstetrik">
              Penyakit Penyerta Non-Obstetrik
            </label>
            <input
              className="input-field"
              id="penyakitPenyertaNonObstetrik"
              name="penyakitPenyertaNonObstetrik"
              type="number"
              min="0"
              placeholder="Jumlah kasus"
              value={values.penyakitPenyertaNonObstetrik ?? ''}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="proteinUrinPositif">
              Protein Urin Positif (+)
            </label>
            <input
              className="input-field"
              id="proteinUrinPositif"
              name="proteinUrinPositif"
              type="number"
              min="0"
              placeholder="Jumlah kasus"
              value={values.proteinUrinPositif ?? ''}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="malaria">
              Pemeriksaan / Positif Malaria
            </label>
            <input
              className="input-field"
              id="malaria"
              name="malaria"
              type="number"
              min="0"
              placeholder="Jumlah kasus"
              value={values.malaria ?? ''}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="hipertensi">
              Hipertensi dalam Kehamilan
            </label>
            <input
              className="input-field"
              id="hipertensi"
              name="hipertensi"
              type="number"
              min="0"
              placeholder="Jumlah kasus"
              value={values.hipertensi ?? ''}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="obesitas">
              Obesitas
            </label>
            <input
              className="input-field"
              id="obesitas"
              name="obesitas"
              type="number"
              min="0"
              placeholder="Jumlah ibu hamil"
              value={values.obesitas ?? ''}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="infeksi">
              Infeksi Saluran Kemih / Menular
            </label>
            <input
              className="input-field"
              id="infeksi"
              name="infeksi"
              type="number"
              min="0"
              placeholder="Jumlah kasus"
              value={values.infeksi ?? ''}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="gangguanJantung">
              Gangguan Jantung
            </label>
            <input
              className="input-field"
              id="gangguanJantung"
              name="gangguanJantung"
              type="number"
              min="0"
              placeholder="Jumlah kasus"
              value={values.gangguanJantung ?? ''}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="diabetes">
              Diabetes Melitus
            </label>
            <input
              className="input-field"
              id="diabetes"
              name="diabetes"
              type="number"
              min="0"
              placeholder="Jumlah kasus"
              value={values.diabetes ?? ''}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="tuberkulosis">
              Tuberkulosis (TB)
            </label>
            <input
              className="input-field"
              id="tuberkulosis"
              name="tuberkulosis"
              type="number"
              min="0"
              placeholder="Jumlah kasus"
              value={values.tuberkulosis ?? ''}
              onChange={onChange}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
