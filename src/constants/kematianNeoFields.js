// constants/kematianNeoFields.js
// Konfigurasi kolom laporan Kematian Neonatal + Post-Neonatal (bayi 0-11
// bulan) sesuai sheet Excel "KEMATIAN NEO + POST NEO" (per bulan).
//
// Agregat per Puskesmas per bulan (BUKAN kasus individual) — beda dari
// modul "Kematian Ibu" yang detail per kejadian. Struktur mirip pola
// ancFields.js: field mentah + getValue() untuk hitung ABS/TOTAL.

// ---- 3 kelompok umur kematian, tiap kelompok punya daftar sebab sendiri ----
export const SEBAB_NEONATAL_0_6_HARI = [
  { key: 'bblr', label: 'BBLR' },
  { key: 'asfiksia', label: 'Asfiksia' },
  { key: 'tetanusNeonatorum', label: 'Tetanus Neonatorum' },
  { key: 'sepsis', label: 'Sepsis' },
  { key: 'kelainanBawaan', label: 'Kelainan Bawaan' },
  { key: 'ikterus', label: 'Ikterus' },
  { key: 'kelainanKardiovaskulerRespiratori', label: 'Kelainan Kardiovaskuler & Respiratori' },
  { key: 'covid19', label: 'COVID-19' },
  { key: 'lainLain', label: 'Lain-lain' },
];

// Sebab kematian 7-28 hari strukturnya identik dengan 0-6 hari
export const SEBAB_NEONATAL_7_28_HARI = SEBAB_NEONATAL_0_6_HARI;

export const SEBAB_POST_NEONATAL = [
  { key: 'kondisiPerinatal', label: 'Kondisi Perinatal' },
  { key: 'pneumonia', label: 'Pneumonia' },
  { key: 'diare', label: 'Diare' },
  { key: 'kelainanSaluranCerna', label: 'Kelainan Saluran Cerna' },
  { key: 'kelainanKongenitalJantung', label: 'Kelainan Kongenital Jantung' },
  { key: 'kelainanKongenitalLainnya', label: 'Kelainan Kongenital Lainnya' },
  { key: 'tetanus', label: 'Tetanus' },
  { key: 'meningitis', label: 'Meningitis' },
  { key: 'kelainanSaraf', label: 'Kelainan Saraf' },
  { key: 'malaria', label: 'Malaria' },
  { key: 'demamBerdarah', label: 'Demam Berdarah (DBD)' },
  { key: 'lainLain', label: 'Lain-lain' },
];

// ---- 3 kelompok kematian utama (masing-masing: L, P, sebab[], keterangan teks) ----
export const KEMATIAN_NEO_GROUPS = [
  {
    key: 'neo0_6',
    label: 'Kematian Neonatal 0-6 Hari',
    sebabList: SEBAB_NEONATAL_0_6_HARI,
    mpdnKey: 'mpdnNeonatal0_6', // field terpisah, lihat FIELD_MPDN
  },
  {
    key: 'neo7_28',
    label: 'Kematian Neonatal 7-28 Hari',
    sebabList: SEBAB_NEONATAL_7_28_HARI,
    mpdnKey: 'mpdnNeonatal7_28',
  },
  {
    key: 'postNeo',
    label: 'Kematian Post-Neonatal (29 Hari-11 Bulan)',
    sebabList: SEBAB_POST_NEONATAL,
    mpdnKey: 'mpdnPostNeonatal',
  },
];

// Field pendukung tambahan (angka manual, bukan bagian dari 1 kelompok umur)
export const FIELD_KEMATIAN_PERINATAL_DIKAJI = {
  key: 'jumlahKematianPerinatalDikaji',
  label: 'Jumlah Kematian Perinatal yang Dikaji Kab/Kota',
};

// ---- Helper ambil nilai L/P/Abs untuk satu grup umur ----
export function getGroupPart(item, groupKey, part) {
  if (!item) return 0;
  if (part === 'l') return Number(item[`${groupKey}L`] || 0);
  if (part === 'p') return Number(item[`${groupKey}P`] || 0);
  return getGroupPart(item, groupKey, 'l') + getGroupPart(item, groupKey, 'p');
}

// ---- Helper ambil nilai 1 sebab kematian dalam satu grup umur ----
export function getSebabValue(item, groupKey, sebabKey) {
  if (!item) return 0;
  return Number(item[`${groupKey}_${sebabKey}`] || 0);
}

// ---- Jumlah total sebab (untuk validasi silang dengan Abs L+P) ----
export function getSebabTotal(item, group) {
  return group.sebabList.reduce((sum, s) => sum + getSebabValue(item, group.key, s.key), 0);
}

// ---- Keterangan teks bebas per grup (nama penyebab kalau pilih "Lain-lain") ----
export function getKeteranganKey(groupKey) {
  return `${groupKey}Keterangan`;
}

// ---- Template kolom kosong: dipakai default form & auto-create dokumen ----
export function buildTemplateKematianNeo() {
  const template = {};
  KEMATIAN_NEO_GROUPS.forEach((group) => {
    template[`${group.key}L`] = 0;
    template[`${group.key}P`] = 0;
    group.sebabList.forEach((s) => {
      template[`${group.key}_${s.key}`] = 0;
    });
    template[getKeteranganKey(group.key)] = '';
    template[group.mpdnKey] = 0;
  });
  template[FIELD_KEMATIAN_PERINATAL_DIKAJI.key] = 0;
  return template;
}

// ---- Ringkasan: Jumlah Kematian Neonatal (0-6 + 7-28) & Total Bayi (0-11 bln) ----
export function getJumlahKematianNeonatal(item) {
  return getGroupPart(item, 'neo0_6', 'abs') + getGroupPart(item, 'neo7_28', 'abs');
}

export function getJumlahKematianBayi(item) {
  return getJumlahKematianNeonatal(item) + getGroupPart(item, 'postNeo', 'abs');
}

/**
 * Hitung total (SUM) L, P, Abs per grup dari daftar laporan — dipakai
 * tabel rekap Admin (bulanan maupun rekap tahunan).
 */
export function calculateKematianNeoSummary(reportList) {
  const totals = {};
  KEMATIAN_NEO_GROUPS.forEach((group) => {
    let sumL = 0;
    let sumP = 0;
    const sebabSums = {};
    group.sebabList.forEach((s) => (sebabSums[s.key] = 0));

    (reportList || []).forEach((row) => {
      sumL += getGroupPart(row, group.key, 'l');
      sumP += getGroupPart(row, group.key, 'p');
      group.sebabList.forEach((s) => {
        sebabSums[s.key] += getSebabValue(row, group.key, s.key);
      });
    });

    totals[group.key] = { l: sumL, p: sumP, abs: sumL + sumP, sebab: sebabSums };
  });

  totals.jumlahKematianNeonatal = (reportList || []).reduce(
    (sum, row) => sum + getJumlahKematianNeonatal(row), 0
  );
  totals.jumlahKematianBayi = (reportList || []).reduce(
    (sum, row) => sum + getJumlahKematianBayi(row), 0
  );

  return totals;
}