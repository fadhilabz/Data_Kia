'use client';

export default function StepDeteksiRestiRujukan({ values = {}, onChange, targetBumil = 0 }) {
  const getBadgeClass = (percentage) => {
    if (percentage >= 80) return 'bg-[#dcfce7] text-[#166534]';
    if (percentage >= 50) return 'bg-[#fef08a] text-[#854d0e]';
    return 'bg-surface-variant text-on-surface-variant';
  };

  const jumlahPkm = Number(values.jumlahPkm) || 0;
  const pkmPoned = Number(values.pkmPoned) || 0;
  const persenPkmPoned = jumlahPkm > 0 ? Math.min(100, Math.round((pkmPoned / jumlahPkm) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-outline-variant pb-3">
        <h3 className="font-headline-sm text-headline-sm text-primary">
          Step 6: Deteksi Risiko Tinggi, Rujukan, &amp; Fasilitas PONED
        </h3>
        <p className="text-body-md text-on-surface-variant">
          Pencatatan kelas ibu hamil, faktor 4T, deteksi resiko tinggi, rujukan, serta kesiapan PKM PONED.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kelas Ibu Hamil (Min 4x) */}
        <div>
          <label className="input-label" htmlFor="kelasBumilMin4x">
            Mengikuti Kelas Ibu Hamil (Min 4x)
          </label>
          <input
            className="input-field"
            id="kelasBumilMin4x"
            name="kelasBumilMin4x"
            type="number"
            min="0"
            placeholder="Jumlah ibu hamil"
            value={values.kelasBumilMin4x ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Ibu Hamil 4T */}
        <div>
          <label className="input-label" htmlFor="bumil4t">
            Ibu Hamil 4T (Terlalu Muda/Tua/Banyak/Dekat)
          </label>
          <input
            className="input-field"
            id="bumil4t"
            name="bumil4t"
            type="number"
            min="0"
            placeholder="Jumlah kasus"
            value={values.bumil4t ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Deteksi Resti Nakes */}
        <div>
          <label className="input-label" htmlFor="deteksiRestiNakes">
            Deteksi Risiko Tinggi oleh Tenaga Kesehatan
          </label>
          <input
            className="input-field"
            id="deteksiRestiNakes"
            name="deteksiRestiNakes"
            type="number"
            min="0"
            placeholder="Jumlah kasus"
            value={values.deteksiRestiNakes ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Deteksi Resti Masyarakat */}
        <div>
          <label className="input-label" htmlFor="deteksiRestiMasyarakat">
            Deteksi Risiko Tinggi oleh Masyarakat / Kader
          </label>
          <input
            className="input-field"
            id="deteksiRestiMasyarakat"
            name="deteksiRestiMasyarakat"
            type="number"
            min="0"
            placeholder="Jumlah kasus"
            value={values.deteksiRestiMasyarakat ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Rujukan Maternal */}
        <div>
          <label className="input-label" htmlFor="rujukanMaternal">
            Rujukan Maternal
          </label>
          <input
            className="input-field"
            id="rujukanMaternal"
            name="rujukanMaternal"
            type="number"
            min="0"
            placeholder="Jumlah kasus rujukan"
            value={values.rujukanMaternal ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Rujukan Neonatal */}
        <div>
          <label className="input-label" htmlFor="rujukanNeonatal">
            Rujukan Neonatal
          </label>
          <input
            className="input-field"
            id="rujukanNeonatal"
            name="rujukanNeonatal"
            type="number"
            min="0"
            placeholder="Jumlah kasus rujukan"
            value={values.rujukanNeonatal ?? ''}
            onChange={onChange}
          />
        </div>

        {/* Jumlah PKM */}
        <div>
          <label className="input-label" htmlFor="jumlahPkm">
            Jumlah Puskesmas (PKM)
          </label>
          <input
            className="input-field"
            id="jumlahPkm"
            name="jumlahPkm"
            type="number"
            min="0"
            placeholder="Jumlah total PKM"
            value={values.jumlahPkm ?? ''}
            onChange={onChange}
          />
        </div>

        {/* PKM PONED (Dengan badge persenPkmPoned = pkmPoned / jumlahPkm * 100) */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="input-label mb-0" htmlFor="pkmPoned">
              PKM PONED (Pelayanan Obstetri Neonatal Emergency Dasar)
            </label>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeClass(persenPkmPoned)}`}>
              {persenPkmPoned}%
            </span>
          </div>
          <input
            className="input-field"
            id="pkmPoned"
            name="pkmPoned"
            type="number"
            min="0"
            placeholder="Jumlah PKM PONED"
            value={values.pkmPoned ?? ''}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}
