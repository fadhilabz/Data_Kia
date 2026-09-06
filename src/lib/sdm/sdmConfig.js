// lib/sdm/sdmConfig.js
// Config modul SDM & Fasilitas Kesehatan — pola identik kematianConfig.js/anctConfig.js.

import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SDM_FIELDS } from '@/constants/sdmFields';

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

// Nama collection Firestore per periode, contoh: "2026_03_sdm"
export function getSdmCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_sdm`;
}

export function getSdmReportRef(collectionName, puskesmasId) {
  return doc(db, collectionName, puskesmasId);
}

// Template kolom kosong — hanya field manual, field otomatis TIDAK disimpan
// sebagai default (dihitung ulang tiap kali dari field manual)
export const TEMPLATE_KOLOM_SDM = SDM_FIELDS.reduce((acc, field) => {
  acc[field.key] = 0;
  return acc;
}, {});