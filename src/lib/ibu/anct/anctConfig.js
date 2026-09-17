// lib/anct/anctConfig.js
// Config bersama modul ANC Terpadu — pola identik dengan lib/anc/ancConfig.js
// dan lib/pnc/pncConfig.js, supaya nama collection & status field konsisten
// di semua file (hook periode, hook form data, halaman admin, dst).

import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ANCT_FIELDS, ANCT_CATATAN_FIELD } from '@/constants/anctFields';

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

// Nama collection Firestore per periode, contoh: "2026_03_anct"
export function getAnctCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_anct`;
}

export function getAnctReportRef(collectionName, puskesmasId) {
  return doc(db, collectionName, puskesmasId);
}

// Template kolom kosong — dipakai sebagai default form & saat auto-create dokumen baru
export const TEMPLATE_KOLOM_ANCT = ANCT_FIELDS.reduce((acc, field) => {
  acc[field.key] = 0;
  return acc;
}, { [ANCT_CATATAN_FIELD.key]: '' });

// Listener real-time periode aktif ANC Terpadu (dari settings/active_period,
// SAMA dengan yang dipakai ANC & PNC — satu sumber kebenaran periode aktif
// di seluruh aplikasi, bukan dokumen terpisah per modul)
export function subscribeActiveAnctPeriode(onData, onError) {
  const ref = doc(db, 'settings', 'active_period');
  return onSnapshot(
    ref,
    (snap) => onData(snap.exists() ? snap.data() : null),
    (err) => onError && onError(err)
  );
}