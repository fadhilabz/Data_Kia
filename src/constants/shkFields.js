// constants/shkFields.js
// Konfigurasi laporan bulanan SHK (Skrining Hipotiroid Kongenital) sesuai
// sheet Excel "JAN SHK" dkk. Agregat per Puskesmas per bulan — pola mirip
// ANC/PNC/KN (bukan case-list seperti KMB).

export const SHK_FIELDS = [
  { key: 'jumlahBayiLahirRiil', label: 'Jumlah Bayi Baru Lahir Riil Bulan Ini' },
  { key: 'bblDilakukanShk', label: 'BBL yang Dilakukan SHK' },
  { key: 'sampelApbnDekon', label: 'Sampel Dibiayai APBN/Dekon', group: 'Sumber Pembiayaan Sampel' },
  { key: 'sampelApbd', label: 'Sampel Dibiayai APBD', group: 'Sumber Pembiayaan Sampel' },
  { key: 'sampelJampersal', label: 'Sampel Dibiayai Jampersal (BPJS)', group: 'Sumber Pembiayaan Sampel' },
  { key: 'hasilNormal', label: 'Jumlah Hasil Normal' },
  { key: 'positifHk', label: 'Jumlah Positif HK (Hipotiroid Kongenital)' },
  { key: 'sampelTidakTerbaca', label: 'Jumlah Sampel Tidak Terbaca' },
];

export const TEMPLATE_KOLOM_SHK = SHK_FIELDS.reduce((acc, f) => {
  acc[f.key] = 0;
  return acc;
}, { sasaranBbl: 0, jumlahFasyankes: 1 });

// Cakupan BBL yang dilakukan SHK = BBL SHK / Sasaran BBL * 100
export function getCakupanShk(item) {
  const sasaran = Number(item?.sasaranBbl || 0);
  const bblShk = Number(item?.bblDilakukanShk || 0);
  if (!sasaran || sasaran <= 0) return null;
  return Math.round((bblShk / sasaran) * 1000) / 10;
}

export function formatCakupan(value) {
  return value === null ? '-' : `${value}%`;
}

export function calculateShkSummary(reportList) {
  const totals = { sasaranBbl: 0 };
  SHK_FIELDS.forEach((f) => (totals[f.key] = 0));
  (reportList || []).forEach((row) => {
    totals.sasaranBbl += Number(row.sasaranBbl || 0);
    SHK_FIELDS.forEach((f) => {
      totals[f.key] += Number(row[f.key] || 0);
    });
  });
  const cakupan = totals.sasaranBbl > 0
    ? Math.round((totals.bblDilakukanShk / totals.sasaranBbl) * 1000) / 10
    : null;
  return { totals, cakupan };
}