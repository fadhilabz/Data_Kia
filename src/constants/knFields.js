// constants/knFields.js
// Konfigurasi kolom laporan KN (Kunjungan Neonatal) sesuai sheet Excel "KN"
// (per bulan). Modul TERBESAR di antara semua modul Data Anak/Ibu — 35
// indikator, HAMPIR SEMUA dipecah Laki-laki (L) / Perempuan (P) terpisah.
//
// Pola tiap indikator:
// - type 'total'   : field-nya cuma L, P, dan TOTAL (=L+P), TIDAK ada %.
//                    Dipakai untuk 10 indikator pertama (perawatan neonatal
//                    esensial 0-6 jam dan pelayanan 6-28 hari).
// - type 'percent' : field-nya L, P, ABS (=L+P), dan % (=ABS/denominator*100).
//                    Dipakai untuk KN1/KN3, jumlah lahir, komplikasi, dan
//                    kunjungan bayi muda. `denominatorKey` menunjuk ke KEY
//                    indikator lain (pakai nilai ABS-nya) atau ke salah satu
//                    dari 2 field otomatis: 'sasaranKelahiranHidup' atau
//                    'sasaranNeonatalKomplikasi'.
//
// Field HANYA menyimpan L & P (input manual dari Puskesmas) — TOTAL/ABS/%
// semuanya dihitung di getValue(), sama seperti pola ancFields.js.

export const KN_FIELDS = [
  // ================= Perawatan Neonatal Esensial 0-6 Jam (TOTAL saja) =================
  { key: 'perawatan0_30Detik', label: 'Perawatan Neonatal 0-30 Detik', group: 'Perawatan Neonatal Esensial 0-6 Jam', type: 'total' },
  { key: 'perawatan30_90Menit', label: 'Perawatan Neonatal 30-90 Menit', group: 'Perawatan Neonatal Esensial 0-6 Jam', type: 'total' },
  { key: 'perawatan90Menit_6Jam', label: 'Perawatan Neonatal 90 Menit-6 Jam', group: 'Perawatan Neonatal Esensial 0-6 Jam', type: 'total' },
  { key: 'jumlahPerawatanEsensial0_6Jam', label: 'Jumlah Perawatan Neonatal Esensial 0-6 Jam', group: 'Perawatan Neonatal Esensial 0-6 Jam', type: 'total' },

  // ================= Pelayanan Neonatal 6-28 Hari (TOTAL saja) =================
  { key: 'menjagaBayiHangat', label: 'Menjaga Bayi Tetap Hangat', group: 'Pelayanan Neonatal 6-28 Hari', type: 'total' },
  { key: 'pemeriksaanMtbm', label: 'Pemeriksaan dengan MTBM', group: 'Pelayanan Neonatal 6-28 Hari', type: 'total' },
  { key: 'pemberianAsi', label: 'Pemberian ASI', group: 'Pelayanan Neonatal 6-28 Hari', type: 'total' },
  { key: 'perawatanMetodeKangguru', label: 'Perawatan Metode Kangguru', group: 'Pelayanan Neonatal 6-28 Hari', type: 'total' },
  { key: 'pemantauanPertumbuhan', label: 'Pemantauan Pertumbuhan', group: 'Pelayanan Neonatal 6-28 Hari', type: 'total' },
  { key: 'jumlahBayiDapatPelayananEsensial6_28Hari', label: 'Jumlah Bayi (6 Jam-28 Hari) Dapat Pelayanan Esensial', group: 'Pelayanan Neonatal 6-28 Hari', type: 'total' },

  // ================= Cakupan Kunjungan Neonatal (% dari Sasaran Kelahiran Hidup) =================
  { key: 'kn1', label: 'KN 1', group: 'Cakupan Kunjungan Neonatal', type: 'percent', denominatorKey: 'sasaranKelahiranHidup' },
  { key: 'kn3Lengkap', label: 'KN 3 (Lengkap)', group: 'Cakupan Kunjungan Neonatal', type: 'percent', denominatorKey: 'sasaranKelahiranHidup' },

  // ================= Jumlah Lahir (% dari Sasaran Kelahiran Hidup) =================
  { key: 'jumlahLahirHidup', label: 'Jumlah Lahir Hidup', group: 'Jumlah Lahir', type: 'percent', denominatorKey: 'sasaranKelahiranHidup' },
  { key: 'jumlahLahirMati', label: 'Jumlah Lahir Mati', group: 'Jumlah Lahir', type: 'percent', denominatorKey: 'sasaranKelahiranHidup' },

  // ================= Komplikasi Neonatal =================
  // sasaranNeonatalKomplikasi (15% dari sasaran kelahiran hidup) dihitung
  // otomatis di getAutoValue(), BUKAN field input.
  { key: 'cakupanPenangananKomplikasi', label: 'Cakupan Penanganan Neonatal Komplikasi', group: 'Komplikasi Neonatal', type: 'percent', denominatorKey: 'sasaranNeonatalKomplikasi' },

  // ================= Komplikasi pada Neonatus (% dari Jumlah Lahir Hidup, kecuali "Tata Laksana" yang % dari kasus abs-nya sendiri) =================
  { key: 'bblr', label: 'BBLR', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'jumlahLahirHidup' },
  { key: 'bblrTataLaksana', label: 'BBLR Mendapat Tata Laksana', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'bblr' },
  { key: 'bayiPrematur', label: 'Bayi Lahir Prematur (<37 Minggu)', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'jumlahLahirHidup' },
  { key: 'bblrBukuKiaBayiKecil', label: 'BBL & BBLR Dapat Buku KIA Bayi Kecil', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'bblr' },
  { key: 'asfiksia', label: 'Asfiksia', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'jumlahLahirHidup' },
  { key: 'asfiksiaTataLaksana', label: 'Asfiksia Mendapat Tata Laksana', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'asfiksia' },
  { key: 'infeksi', label: 'Infeksi', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'jumlahLahirHidup' },
  { key: 'infeksiTataLaksana', label: 'Infeksi Mendapat Tata Laksana', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'infeksi' },
  { key: 'tetanusNeonatorum', label: 'Tetanus Neonatorum', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'jumlahLahirHidup' },
  { key: 'tetanusTataLaksana', label: 'Tetanus Neonatorum Mendapat Tata Laksana', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'tetanusNeonatorum' },
  { key: 'ikterus', label: 'Ikterus', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'jumlahLahirHidup' },
  { key: 'ikterusTataLaksana', label: 'Ikterus Mendapat Tata Laksana', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'ikterus' },
  { key: 'kelainanKongenital', label: 'Kelainan Kongenital', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'jumlahLahirHidup' },
  { key: 'kelainanKongenitalTataLaksana', label: 'Kelainan Kongenital Mendapat Tata Laksana', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'kelainanKongenital' },
  { key: 'lainLainKomplikasi', label: 'Lain-lain', group: 'Komplikasi pada Neonatus', type: 'percent', denominatorKey: 'jumlahLahirHidup' },

  // ================= Kunjungan Bayi Muda (% dari Sasaran Kelahiran Hidup) =================
  { key: 'bayiMudaBerkunjungFktp', label: 'Bayi Muda <2 Bulan Berkunjung ke FKTP', group: 'Kunjungan Bayi Muda', type: 'percent', denominatorKey: 'sasaranKelahiranHidup' },
  { key: 'bayiDirecall0_5Bulan', label: 'Bayi Usia 0-5 Bulan yang Di-recall', group: 'Kunjungan Bayi Muda', type: 'percent', denominatorKey: 'sasaranKelahiranHidup' },
  { key: 'asiEksklusifUsia6Bulan', label: 'Bayi Usia 6 Bulan Dapat ASI Eksklusif', group: 'Kunjungan Bayi Muda', type: 'percent', denominatorKey: 'sasaranKelahiranHidup' },
  { key: 'asiEksklusifUsiaKurang6Bulan', label: 'Bayi Usia <6 Bulan Dapat ASI Eksklusif', group: 'Kunjungan Bayi Muda', type: 'percent', denominatorKey: 'sasaranKelahiranHidup' },
  { key: 'pemeriksaanGratisBbl', label: 'Penduduk Penerima Pemeriksaan Kesehatan Gratis Klpk Usia BBL', group: 'Kunjungan Bayi Muda', type: 'percent', denominatorKey: 'sasaranKelahiranHidup' },
];

/**
 * Ambil nilai L, P, atau ABS/TOTAL (L+P) dari satu indikator.
 * part: 'l' | 'p' | 'abs' (abs = TOTAL untuk type 'total', = ABS untuk type 'percent')
 */
export function getKnPart(item, fieldKey, part) {
  if (!item) return 0;
  if (part === 'l') return Number(item[`${fieldKey}L`] || 0);
  if (part === 'p') return Number(item[`${fieldKey}P`] || 0);
  // abs / total = L + P, kecuali sudah ada override tersimpan
  const overrideKey = `${fieldKey}Abs`;
  if (item[overrideKey] !== undefined) return Number(item[overrideKey] || 0);
  return getKnPart(item, fieldKey, 'l') + getKnPart(item, fieldKey, 'p');
}

/**
 * Ambil nilai denominator untuk hitung %. Bisa menunjuk ke field otomatis
 * ('sasaranKelahiranHidup' / 'sasaranNeonatalKomplikasi') atau ke ABS field
 * indikator lain.
 */
export function getKnDenominator(item, pkm, denominatorKey) {
  if (denominatorKey === 'sasaranKelahiranHidup') {
    return getSasaranKelahiranHidup(item, pkm);
  }
  if (denominatorKey === 'sasaranNeonatalKomplikasi') {
    return getSasaranNeonatalKomplikasi(item, pkm);
  }
  return getKnPart(item, denominatorKey, 'abs');
}

// Sasaran Kelahiran Hidup: field otomatis, sumbernya dari data SASARAN
// (proyeksi tahunan per Puskesmas) — disimpan di dokumen KN sebagai
// 'sasaranKelahiranHidup' saat inisialisasi periode (mirip pola sasaranBumil).
export function getSasaranKelahiranHidup(item, pkm) {
  return Number(item?.sasaranKelahiranHidup ?? pkm?.sasaranKelahiranHidup ?? 0);
}

// Sasaran Neonatal Komplikasi = 15% dari Sasaran Kelahiran Hidup (otomatis)
export function getSasaranNeonatalKomplikasi(item, pkm) {
  return Math.round(getSasaranKelahiranHidup(item, pkm) * 0.15 * 10) / 10;
}

export function formatKnPercent(abs, denom) {
  if (!denom || denom <= 0) return '-';
  return ((abs / denom) * 100).toFixed(1);
}

/**
 * Hitung total (SUM) L, P, ABS seluruh indikator KN dari daftar laporan.
 * % dihitung ulang dari SUM abs & SUM denominator (bukan rata-rata %).
 */
export function calculateKnSummary(reportList, pkmMap) {
  const totals = {};
  KN_FIELDS.forEach((field) => {
    let sumL = 0;
    let sumP = 0;
    let sumAbs = 0;
    let sumDenom = 0;
    (reportList || []).forEach((row) => {
      const pkm = pkmMap ? pkmMap.get(row.puskesmasId || row.id) : null;
      sumL += getKnPart(row, field.key, 'l');
      sumP += getKnPart(row, field.key, 'p');
      sumAbs += getKnPart(row, field.key, 'abs');
      if (field.type === 'percent') {
        sumDenom += getKnDenominator(row, pkm, field.denominatorKey);
      }
    });
    totals[field.key] = {
      l: sumL,
      p: sumP,
      abs: sumAbs,
      percent: field.type === 'percent' ? formatKnPercent(sumAbs, sumDenom) : null,
    };
  });
  return { totals };
}