// lib/kn/knConfig.js
// Config bersama modul KN (Kunjungan Neonatal) — pola identik lib/anct/anctConfig.js.

import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { KN_FIELDS } from '@/constants/knFields';

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

// Nama collection Firestore per periode, contoh: "2026_03_kn"
export function getKnCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_kn`;
}

export function getKnReportRef(collectionName, puskesmasId) {
  return doc(db, collectionName, puskesmasId);
}

// Template kolom kosong: setiap indikator KN_FIELDS punya 2 field input
// (Key + 'L' dan Key + 'P'), ABS/TOTAL/% dihitung on-the-fly, TIDAK disimpan
// sebagai field terpisah (supaya tidak ada risiko data ABS/% basi kalau
// L/P diedit belakangan tanpa recalculate).
export const TEMPLATE_KOLOM_KN = KN_FIELDS.reduce((acc, field) => {
  acc[`${field.key}L`] = 0;
  acc[`${field.key}P`] = 0;
  return acc;
}, {});