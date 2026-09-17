// lib/libShk/shkConfig.js
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TEMPLATE_KOLOM_SHK } from '@/constants/shkFields';

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

export const DAFTAR_BULAN_ID = ['01','02','03','04','05','06','07','08','09','10','11','12'];

export function getShkCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_shk`;
}
export function getShkReportRef(collectionName, puskesmasId) {
  return doc(db, collectionName, puskesmasId);
}

export { TEMPLATE_KOLOM_SHK };