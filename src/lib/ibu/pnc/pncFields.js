// lib/pnc/pncFields.js
//
// SATU SUMBER nama field untuk seluruh modul PNC (form input, config,
// dan tabel rekap admin). Kalau nama field di StepPersalinan.jsx atau
// StepKunjunganNifas.jsx ternyata berbeda dari yang tercantum di sini,
// CUKUP UBAH DI FILE INI SAJA — jangan ubah satu-satu di pncColumns.js,
// pncConfig.js, atau PncTable.jsx.

export const PNC_FIELDS = {
  // Denominator (pembagi) utama — jumlah ibu bersalin (target) per Puskesmas
  // per bulan. Diasumsikan tersimpan di dokumen puskesmas sebagai
  // "targetBulin", sama pola dengan "targetBumil" di modul ANC.
  BULIN: 'bulin',

  // Persalinan Ditolong Nakes (PN)
  PN_FASYANKES: 'pnFasyankes',
  PN_NON_FASYANKES: 'pnNonFasyankes',

  // Persalinan Ditolong Non Nakes
  PERSALINAN_NON_NAKES: 'pnNonNakes',

  // Pemberian Tablet Tambah Darah pada Bufas
  TABLET_TAMBAH_DARAH_BUFAS: 'tabletTambahDarah',

  // Vit A Nifas
  VIT_A_NIFAS: 'vitANifas',

  // Perdarahan Pasca Salin
  PERDARAHAN_PASCA_SALIN: 'perdarahanPascaSalin',
  PERDARAHAN_PENATALAKSANAAN: 'perdarahanPenatalaksanaan',

  // Kunjungan Nifas (KF)
  KF1: 'kf1',
  KF2: 'kf2',
  KF3: 'kf3',
  KF4: 'kf4',

  // Komplikasi
  KOMPLIKASI_PERSALINAN: 'komplikasiPersalinan',
  KOMPLIKASI_PASCA_PERSALINAN: 'komplikasiPascaPersalinan',
};