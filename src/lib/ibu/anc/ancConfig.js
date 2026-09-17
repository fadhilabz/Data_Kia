// lib/anc/ancConfig.js
//
// Sumber tunggal untuk semua hal yang berkaitan dengan "periode aktif" dan
// lokasi penyimpanan laporan ANC. FormANCPage.jsx (Petugas) dan PeriodePage.jsx
// (Admin) WAJIB import dari file ini, bukan menulis ulang nama collection /
// nama field secara manual — supaya kedua sisi selalu baca-tulis ke tempat
// yang sama persis.

import { doc, getDoc, getDocs, collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ---- Default Template Kolom Nilai Awal (Kosong) Form ANC ----
export const TEMPLATE_KOLOM_ANC = {
  k1Murni: 0, k1Tw1DokterUsg: 0, k1Lebih12Minggu: 0, bumilBukuKia: 0,
  k1OlehDokter: 0, k5OlehDokterUsg: 0, k6: 0, k8: 0,
  tbBb: 0, td: 0, statusGizi: 0, tfu: 0, djj: 0, statusTt: 0, ttd: 0,
  hbTm1: 0, hbTm3: 0, golDarah: 0, hiv: 0, sifilis: 0, hepatitis: 0,
  tataLaksanaKasus: 0, temuWicara: 0, usgK1Akses: 0, skriningJiwa: 0, cakupanStandar12tAbs: 0,
  t1: 0, t2: 0, t3: 0, t4: 0, t5: 0, ttd180: 0,
  anemiaRingan: 0, anemiaSedang: 0, anemiaBerat: 0, totalAnemia: 0,
  konsumsiSuplemenGizi: 0, bumilKek: 0, kekDapatMakananTambahan: 0, jumlahKekResikoKek: 0,
  diskriningPreeklamsia: 0, bumilPreeklamsia: 0, preeklamsiaTataLaksana: 0,
  keguguran: 0, penyakitPenyertaNonObstetrik: 0, proteinUrinPositif: 0,
  malaria: 0, hipertensi: 0, obesitas: 0, infeksi: 0, gangguanJantung: 0, diabetes: 0, tuberkulosis: 0,
  kelasBumilMin4x: 0, bumil4t: 0, deteksiRestiNakes: 0, deteksiRestiMasyarakat: 0,
  rujukanMaternal: 0, rujukanNeonatal: 0, jumlahPkm: 0, pkmPoned: 0, persenPkmPoned: 0,
};

// ---- Konstanta nama field & nilai status ----
export const STATUS_FIELD = 'statusReport';
export const STATUS_DRAFT = 'draft';
export const STATUS_SUBMITTED = 'submitted';

export const PERIODE_STATUS_TERBUKA = 'active';
export const PERIODE_STATUS_TERTUTUP = 'inactive';

export const LIST_BULAN = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
  { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

export const namaBulan = (bulanValue) =>
  LIST_BULAN.find((b) => b.value === bulanValue)?.label || bulanValue;

// ---- Nama collection laporan ANC untuk satu kombinasi tahun+bulan ----
// Contoh: getAncCollectionName('2026', '01') -> '2026_01_anc'
export function getAncCollectionName(tahun, bulan) {
  if (!tahun || !bulan) return null;
  return `${tahun}_${bulan}_anc`;
}

// ---- Ambil dokumen periode aktif dari settings/active_period ----
// Return: null kalau belum pernah dikonfigurasi, atau
// { bulan, tahun, namaPeriode, status, collectionName, periodId }
export async function getActivePeriode() {
  const periodeRef = doc(db, 'settings', 'active_period');
  const periodeSnap = await getDoc(periodeRef);
  if (!periodeSnap.exists()) return null;

  const data = periodeSnap.data();
  return {
    ...data,
    collectionName: data.collectionName || getAncCollectionName(data.tahun, data.bulan),
  };
}

// ---- Subscribe real-time ke settings/active_period ----
export function subscribeActivePeriode(onUpdate, onError) {
  const periodeRef = doc(db, 'settings', 'active_period');
  return onSnapshot(
    periodeRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onUpdate({
          ...data,
          collectionName: data.collectionName || getAncCollectionName(data.tahun, data.bulan),
        });
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error('subscribeActivePeriode error:', err);
      if (onError) onError(err);
    }
  );
}

// ---- Reference dokumen laporan ANC satu Puskesmas untuk satu periode ----
// Document ID = puskesmasId saja (BUKAN puskesmasId-tahun-bulan)
export function getAncReportRef(collectionName, puskesmasId) {
  return doc(db, collectionName, puskesmasId);
}

// ---- Real-time Subscribe Rekap Status Kelengkapan Periode (rekap_kelengkapan) ----
// Return: unsubscribe function
// Callback receives: { completedCount, totalPuskesmas, list: [{id, nama, submitted}], allSubmitted, noPuskesmas }
export function subscribeRekapKelengkapan(periodeId, onUpdate, onError) {
  if (!periodeId) {
    onUpdate({ completedCount: 0, totalPuskesmas: 0, list: [], allSubmitted: false, noPuskesmas: false });
    return () => {};
  }

  const puskesmasRef = collection(db, 'puskesmas');
  const rekapRef = collection(db, 'rekap_kelengkapan');
  const q = query(rekapRef, where('periode', '==', periodeId), where('isSubmitted', '==', true));

  return onSnapshot(
    q,
    async (rekapSnap) => {
      try {
        const puskesmasSnap = await getDocs(puskesmasRef);
        const totalPuskesmas = puskesmasSnap.size;

        if (totalPuskesmas === 0) {
          onUpdate({
            completedCount: 0,
            totalPuskesmas: 0,
            list: [],
            allSubmitted: false,
            noPuskesmas: true,
          });
          return;
        }

        const submittedSet = new Set(rekapSnap.docs.map((d) => d.data().puskesmasId));

        const list = puskesmasSnap.docs.map((pDoc) => {
          const pData = pDoc.data();
          const submitted = submittedSet.has(pDoc.id);
          return {
            id: pDoc.id,
            nama: pData.nama || pDoc.id,
            submitted,
          };
        });

        const completedCount = list.filter((p) => p.submitted).length;
        const allSubmitted = totalPuskesmas > 0 && completedCount === totalPuskesmas;

        onUpdate({
          completedCount,
          totalPuskesmas,
          list,
          allSubmitted,
          noPuskesmas: false,
        });
      } catch (err) {
        console.error('subscribeRekapKelengkapan inner error:', err);
        if (onError) onError(err);
      }
    },
    (err) => {
      console.error('subscribeRekapKelengkapan onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
}

// ---- Cek status submit SEMUA Puskesmas untuk satu kombinasi tahun+bulan ----
// Dipakai oleh Admin untuk validasi ganti bulan/tahun, dan bisa juga dipakai
// Petugas/Kepala Puskesmas untuk lihat status kepatuhan pelaporan.
// Return: { allSubmitted, completedCount, totalPuskesmas, noPuskesmas, list: [{id, nama, submitted}] }
export async function checkAllPuskesmasSubmitted(tahun, bulan) {
  const collectionName = getAncCollectionName(tahun, bulan);
  const periodeId = `${tahun}-${bulan}`;
  const puskesmasSnap = await getDocs(collection(db, 'puskesmas'));

  if (puskesmasSnap.empty) {
    return { allSubmitted: false, completedCount: 0, totalPuskesmas: 0, noPuskesmas: true, list: [] };
  }

  const totalPuskesmas = puskesmasSnap.size;
  const rekapRef = collection(db, 'rekap_kelengkapan');
  const q = query(rekapRef, where('periode', '==', periodeId), where('isSubmitted', '==', true));
  const rekapSnap = await getDocs(q);
  const submittedSet = new Set(rekapSnap.docs.map((d) => d.data().puskesmasId));

  const list = [];
  for (const pkmDoc of puskesmasSnap.docs) {
    const pkmData = pkmDoc.data();
    let submitted = submittedSet.has(pkmDoc.id);
    if (!submitted) {
      const reportRef = getAncReportRef(collectionName, pkmDoc.id);
      const reportSnap = await getDoc(reportRef);
      submitted = reportSnap.exists() && reportSnap.data()[STATUS_FIELD] === STATUS_SUBMITTED;
    }
    list.push({ id: pkmDoc.id, nama: pkmData.nama || pkmDoc.id, submitted });
  }

  const completedCount = list.filter((p) => p.submitted).length;
  const allSubmitted = totalPuskesmas > 0 && completedCount === totalPuskesmas;

  return { allSubmitted, completedCount, totalPuskesmas, noPuskesmas: false, list };
}

// ---- Cek seluruh 12 bulan di satu tahun sudah lengkap (untuk validasi ganti tahun) ----
// Return: { allComplete, incompleteMonths: [{bulan, label, missing: [nama,...]}] }
export async function checkFullYearComplete(tahun) {
  const incompleteMonths = [];

  for (const b of LIST_BULAN) {
    const { allSubmitted, list, noPuskesmas } = await checkAllPuskesmasSubmitted(tahun, b.value);
    if (noPuskesmas || !allSubmitted) {
      incompleteMonths.push({
        bulan: b.value,
        label: b.label,
        missing: list.filter((p) => !p.submitted).map((p) => p.nama),
      });
    }
  }

  return { allComplete: incompleteMonths.length === 0, incompleteMonths };
}

// ---- Validasi Ketat Transisi Periode (Anti-Loncat & Strict Full Year) ----
// Checks:
// 1. Apakah target periode adalah urutan persis berikutnya (+1 bulan/tahun).
// 2. Apakah semua Puskesmas sudah submitted di bulan berjalan.
// 3. Apakah 12 bulan sudah terpenuhi jika mencoba berpindah tahun.
// Return: { allowed: boolean, reason: string, details?: any }
export async function validatePeriodTransition(currentTahun, currentBulan, targetTahun, targetBulan) {
  if (!currentTahun || !currentBulan) {
    return { allowed: true, reason: 'Inisialisasi periode awal.' };
  }

  const curY = parseInt(currentTahun, 10);
  const tarY = parseInt(targetTahun, 10);
  const curB = parseInt(currentBulan, 10);
  const tarB = parseInt(targetBulan, 10);

  // Jika tetap di bulan dan tahun yang sama (misal: hanya ubah status Buka/Kunci atau nama periode)
  if (curY === tarY && curB === tarB) {
    return { allowed: true, reason: 'Memperbarui status/pengaturan periode berjalan.' };
  }

  // Transisi di tahun yang sama
  if (curY === tarY) {
    // 1. Cek Anti-Loncat Bulan (Harus persis bulan berjalan + 1)
    const expectedNextBulan = String(curB + 1).padStart(2, '0');
    if (tarB !== curB + 1) {
      return {
        allowed: false,
        reason: `Urutan bulan WAJIB linier (01 -> 02 -> ... -> 12). Dari bulan ${namaBulan(currentBulan)} ${currentTahun}, Anda hanya dapat mengaktifkan bulan ${namaBulan(expectedNextBulan)} ${currentTahun}. Tidak boleh melompati atau mundur dari urutan bulan.`,
      };
    }

    // 2. Cek apakah bulan berjalan sudah 100% submitted oleh semua Puskesmas
    const { allSubmitted, noPuskesmas, list } = await checkAllPuskesmasSubmitted(currentTahun, currentBulan);
    if (noPuskesmas) {
      return {
        allowed: false,
        reason: 'Belum ada data Puskesmas terdaftar di sistem. Tambahkan Puskesmas terlebih dahulu.',
      };
    }

    if (!allSubmitted) {
      const missingPuskesmas = list.filter((p) => !p.submitted).map((p) => p.nama);
      return {
        allowed: false,
        reason: `Tidak bisa mengganti ke bulan berikutnya.\n\nMasih ada ${missingPuskesmas.length} Puskesmas yang belum submit laporan untuk periode ${namaBulan(currentBulan)} ${currentTahun}:\n\n${missingPuskesmas.map((n) => `• ${n}`).join('\n')}\n\nPastikan seluruh Puskesmas sudah mengumpulkan laporan sebelum membuka bulan baru.`,
        details: { missingPuskesmas, list },
      };
    }

    return { allowed: true, reason: 'Validasi bulan berhasil. Siap berpindah bulan.' };
  }

  // Transisi ke tahun anggaran baru (targetTahun !== currentTahun)
  // 1. Cek syarat transisi tahun: Harus dari bulan 12 (Desember) ke bulan 01 (Januari) tahun Y+1
  if (currentBulan !== '12' || targetBulan !== '01' || tarY !== curY + 1) {
    return {
      allowed: false,
      reason: `Pergantian tahun anggaran hanya bisa dilakukan secara berurutan dari bulan Desember (${currentTahun}) ke bulan Januari (${curY + 1}). Anda saat ini masih berada di bulan ${namaBulan(currentBulan)} ${currentTahun}.`,
    };
  }

  // 2. Cek syarat 12 bulan penuh di tahun berjalan diselesaikan oleh SEMUA Puskesmas
  const { allComplete, incompleteMonths } = await checkFullYearComplete(currentTahun);
  if (!allComplete) {
    const detailText = incompleteMonths
      .map((m) => `• Bulan ${m.label}: ${m.missing.length > 0 ? m.missing.join(', ') : 'belum ada laporan'}`)
      .join('\n');

    return {
      allowed: false,
      reason: `Tidak bisa mengganti tahun anggaran ke ${targetTahun}.\n\nSeluruh 12 bulan di tahun ${currentTahun} WAJIB 100% diselesaikan dan di-submit oleh semua Puskesmas. Rincian bulan yang belum lengkap:\n\n${detailText}\n\nSelesaikan seluruh laporan tahun ${currentTahun} sebelum memulai tahun anggaran baru.`,
      details: { incompleteMonths },
    };
  }

  return { allowed: true, reason: 'Validasi pergantian tahun berhasil. Siap berpindah tahun anggaran.' };
}