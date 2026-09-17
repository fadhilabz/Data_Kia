// lib/kematian/kematianConfig.js
// Config modul Kematian Ibu (berdasarkan Sebab) — pola identik ancConfig.js/pncConfig.js/anctConfig.js.

import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { KEMATIAN_FIELDS, KEMATIAN_CATATAN_FIELD } from '@/constants/kematianFields';

export const STATUS_FIELD = 'statusReport';
export const STATUS_DRAFT = 'draft';
export const STATUS_SUBMITTED = 'submitted';

const NAMA_BULAN = {
  '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
  '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
  '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember',
};

export function namaBulan(bulanId) {
  return NAMA_BULAN[bulanId] || bulanId;
}

// Nama collection Firestore per periode, contoh: "2026_03_kematian"
export function getKematianCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_kematian`;
}

export function getKematianReportRef(collectionName, puskesmasId) {
  return doc(db, collectionName, puskesmasId);
}

// Template kolom kosong — dipakai sebagai default form & saat auto-create dokumen baru
export const TEMPLATE_KOLOM_KEMATIAN = KEMATIAN_FIELDS.reduce(
  (acc, field) => {
    acc[field.key] = 0;
    return acc;
  },
  { [KEMATIAN_CATATAN_FIELD.key]: '' }
);