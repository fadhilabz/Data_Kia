// lib/pnc/pncColumns.js
//
// Definisi kolom untuk tabel rekap PNC (PncTable.jsx). Menentukan:
// - label & pengelompokan header (untuk kolom PN dan KF yang bertingkat)
// - cara menghitung nilai Abs (langsung dari field, atau hasil penjumlahan)
// - pembagi (denominator) untuk menghitung %. Default = BULIN, kecuali
//   "Perdarahan Pasca Salin Mendapat Penatalaksanaan" yang pembaginya
//   adalah Abs "Perdarahan Pasca Salin" itu sendiri (bukan BULIN).

import { PNC_FIELDS } from './pncFields';

export const PNC_COLUMNS = [
  {
    key: 'pnOtomatis',
    label: 'PN (Otomatis)',
    group: 'Persalinan Ditolong Nakes (PN)',
    getAbs: (row) =>
      (Number(row[PNC_FIELDS.PN_FASYANKES]) || 0) +
      (Number(row[PNC_FIELDS.PN_NON_FASYANKES]) || 0),
  },
  {
    key: PNC_FIELDS.PN_FASYANKES,
    label: 'PN di Fasyankes',
    group: 'Persalinan Ditolong Nakes (PN)',
  },
  {
    key: PNC_FIELDS.PN_NON_FASYANKES,
    label: 'PN di Non Fasyankes',
    group: 'Persalinan Ditolong Nakes (PN)',
  },
  {
    key: PNC_FIELDS.PERSALINAN_NON_NAKES,
    label: 'Persalinan Ditolong Non Nakes',
  },
  {
    key: PNC_FIELDS.TABLET_TAMBAH_DARAH_BUFAS,
    label: 'Pemberian Tablet Tambah Darah pada Bufas',
  },
  {
    key: PNC_FIELDS.VIT_A_NIFAS,
    label: 'Vit A Nifas',
  },
  {
    key: PNC_FIELDS.PERDARAHAN_PASCA_SALIN,
    label: 'Jlh Bufas Perdarahan Pasca Salin',
  },
  {
    key: PNC_FIELDS.PERDARAHAN_PENATALAKSANAAN,
    label: 'Perdarahan Pasca Salin Mendapat Penatalaksanaan',
    // Pembagi kolom ini BUKAN BULIN, tapi Abs "Perdarahan Pasca Salin".
    denominatorKey: PNC_FIELDS.PERDARAHAN_PASCA_SALIN,
  },
  {
    key: PNC_FIELDS.KF1,
    label: 'KF1',
    group: 'Kunjungan Nifas (KF)',
  },
  {
    key: PNC_FIELDS.KF2,
    label: 'KF2',
    group: 'Kunjungan Nifas (KF)',
  },
  {
    key: PNC_FIELDS.KF3,
    label: 'KF3',
    group: 'Kunjungan Nifas (KF)',
  },
  {
    key: PNC_FIELDS.KF4,
    label: 'KF4',
    group: 'Kunjungan Nifas (KF)',
  },
  {
    key: PNC_FIELDS.KOMPLIKASI_PERSALINAN,
    label: 'Jumlah Komplikasi dalam Persalinan',
  },
  {
    key: PNC_FIELDS.KOMPLIKASI_PASCA_PERSALINAN,
    label: 'Jumlah Komplikasi Pasca Persalinan',
  },
];

// ---- Helper ambil nilai Abs suatu kolom untuk satu baris data ----
export function getColAbs(row, col) {
  if (typeof col.getAbs === 'function') return col.getAbs(row);
  return Number(row[col.key]) || 0;
}

// ---- Helper ambil nilai pembagi (denominator) suatu kolom untuk satu baris ----
export function getColDenominator(row, col) {
  if (col.denominatorKey) {
    return Number(row[col.denominatorKey]) || 0;
  }
  return Number(row[PNC_FIELDS.BULIN]) || 0;
}

// ---- Format persen: "-" kalau pembagi 0, kalau tidak dibulatkan 1 desimal ----
export function formatPercent(abs, denom) {
  if (!denom || denom <= 0) return '-';
  return ((abs / denom) * 100).toFixed(1);
}