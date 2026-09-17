// lib/periode/kelengkapanModul.js
//
// Pengecekan kelengkapan submit GABUNGAN lintas semua modul bulanan
// (ANC, PNC, dan modul lain yang akan ditambahkan nanti seperti Kematian
// Ibu & ANC Terpadu). Dipakai oleh useManajemenPeriode.js supaya Admin
// TIDAK BISA ganti bulan/tahun aktif kalau ada satu saja modul yang belum
// 100% submitted oleh semua Puskesmas — bukan cuma ANC saja.
//
// Kalau nanti menambah modul baru (mis. Kematian Ibu), cukup tambahkan satu
// entri baru ke MODUL_LIST di bawah — tidak perlu ubah logika pengecekan.

import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getAncCollectionName,
  STATUS_FIELD,
  STATUS_SUBMITTED,
  LIST_BULAN,
} from "@/lib/ibu/anc/ancConfig";
import { getPncCollectionName } from "@/lib/ibu/pnc/pncConfig";

// Daftar semua modul bulanan yang ikut disyaratkan lengkap sebelum ganti periode.
// Tambahkan modul baru di sini saat sudah dibangun (Kematian Ibu, ANC Terpadu, dst).
const MODUL_LIST = [
  { key: "anc", label: "ANC", getCollectionName: getAncCollectionName },
  { key: "pnc", label: "PNC", getCollectionName: getPncCollectionName },
  // { key: 'kematian', label: 'Kematian Ibu', getCollectionName: getKematianCollectionName },
  // { key: 'anc-terpadu', label: 'ANC Terpadu', getCollectionName: getAncTerpaduCollectionName },
];

// ---- Cek kelengkapan submit GABUNGAN semua modul untuk satu tahun+bulan ----
// Return: {
//   allSubmitted: boolean,          // true kalau SEMUA Puskesmas SEMUA modul sudah submitted
//   noPuskesmas: boolean,
//   list: [{ id, nama, perModul: { anc: true/false, pnc: true/false, ... }, lengkapSemuaModul: bool }]
// }
export async function checkKelengkapanGabungan(tahun, bulan) {
  const puskesmasSnap = await getDocs(collection(db, "puskesmas"));

  if (puskesmasSnap.empty) {
    return { allSubmitted: false, noPuskesmas: true, list: [] };
  }

  const list = [];
  for (const pkmDoc of puskesmasSnap.docs) {
    const pkmData = pkmDoc.data();
    const perModul = {};

    for (const modul of MODUL_LIST) {
      const collectionName = modul.getCollectionName(tahun, bulan);
      const reportRef = doc(db, collectionName, pkmDoc.id);
      const reportSnap = await getDoc(reportRef);
      perModul[modul.key] =
        reportSnap.exists() &&
        reportSnap.data()[STATUS_FIELD] === STATUS_SUBMITTED;
    }

    const lengkapSemuaModul = MODUL_LIST.every((m) => perModul[m.key]);
    list.push({
      id: pkmDoc.id,
      nama: pkmData.nama || pkmDoc.id,
      perModul,
      lengkapSemuaModul,
    });
  }

  return {
    allSubmitted: list.every((p) => p.lengkapSemuaModul),
    noPuskesmas: false,
    list,
  };
}

// ---- Cek seluruh 12 bulan di satu tahun sudah lengkap (gabungan semua modul) ----
// Return: { allComplete, incompleteMonths: [{ bulan, label, missing: [{nama, modulBelum: ['anc','pnc']}] }] }
export async function checkFullYearCompleteGabungan(tahun) {
  const incompleteMonths = [];

  for (const b of LIST_BULAN) {
    const { allSubmitted, list, noPuskesmas } = await checkKelengkapanGabungan(
      tahun,
      b.value,
    );
    if (noPuskesmas || !allSubmitted) {
      const missing = list
        .filter((p) => !p.lengkapSemuaModul)
        .map((p) => ({
          nama: p.nama,
          modulBelum: MODUL_LIST.filter((m) => !p.perModul[m.key]).map(
            (m) => m.label,
          ),
        }));
      incompleteMonths.push({ bulan: b.value, label: b.label, missing });
    }
  }

  return { allComplete: incompleteMonths.length === 0, incompleteMonths };
}

// Daftar label modul, dipakai untuk menampilkan pesan/detail di UI Admin
export const DAFTAR_MODUL = MODUL_LIST.map((m) => ({
  key: m.key,
  label: m.label,
}));
