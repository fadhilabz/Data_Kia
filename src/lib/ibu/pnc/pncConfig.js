// lib/pnc/pncConfig.js
//
// Sumber tunggal untuk semua hal yang berkaitan dengan "periode aktif" dan
// lokasi penyimpanan laporan PNC. FormPNCPage.jsx (Petugas) dan halaman Admin
// terkait WAJIB import dari file ini, bukan menulis ulang nama collection /
// nama field secara manual — supaya kedua sisi selalu baca-tulis ke tempat
// yang sama persis.

import { doc, getDoc, getDocs, collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ---- Default Template Kolom Nilai Awal (Kosong) Form PNC ----
// TODO: sesuaikan daftar field ini dengan field yang benar-benar dipakai
// di StepPersalinan.jsx dan StepKunjunganNifas.jsx
export const TEMPLATE_KOLOM_PNC = {
  // contoh placeholder — ganti dengan field asli form PNC kamu
  jumlahPersalinan: 0,
  persalinanNakes: 0,
  persalinanFaskes: 0,
  kunjunganNifasKf1: 0,
  kunjunganNifasKf2: 0,
  kunjunganNifasKf3: 0,
  kunjunganNifasKf4: 0,
  komplikasiNifas: 0,
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

// ---- Nama collection laporan PNC untuk satu kombinasi tahun+bulan ----
// Contoh: getPncCollectionName('2026', '01') -> '2026_01_pnc'
export function getPncCollectionName(tahun, bulan) {
  if (!tahun || !bulan) return null;
  return `${tahun}_${bulan}_pnc`;
}

// ---- Ambil dokumen periode aktif dari settings/active_period_pnc ----
export async function getActivePeriode() {
  const periodeRef = doc(db, 'settings', 'active_period_pnc');
  const periodeSnap = await getDoc(periodeRef);
  if (!periodeSnap.exists()) return null;

  const data = periodeSnap.data();
  return {
    ...data,
    collectionName: data.collectionName || getPncCollectionName(data.tahun, data.bulan),
  };
}

// ---- Subscribe real-time ke settings/active_period_pnc ----
export function subscribeActivePeriode(onUpdate, onError) {
  const periodeRef = doc(db, 'settings', 'active_period_pnc');
  return onSnapshot(
    periodeRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onUpdate({
          ...data,
          collectionName: data.collectionName || getPncCollectionName(data.tahun, data.bulan),
        });
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error('subscribeActivePeriode (pnc) error:', err);
      if (onError) onError(err);
    }
  );
}

// ---- Reference dokumen laporan PNC satu Puskesmas untuk satu periode ----
// Document ID = puskesmasId saja (BUKAN puskesmasId-tahun-bulan)
export function getPncReportRef(collectionName, puskesmasId) {
  return doc(db, collectionName, puskesmasId);
}

// ---- Real-time Subscribe Rekap Status Kelengkapan Periode PNC ----
export function subscribeRekapKelengkapan(periodeId, onUpdate, onError) {
  if (!periodeId) {
    onUpdate({ completedCount: 0, totalPuskesmas: 0, list: [], allSubmitted: false, noPuskesmas: false });
    return () => {};
  }

  const puskesmasRef = collection(db, 'puskesmas');
  const rekapRef = collection(db, 'rekap_kelengkapan_pnc');
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
        console.error('subscribeRekapKelengkapan (pnc) inner error:', err);
        if (onError) onError(err);
      }
    },
    (err) => {
      console.error('subscribeRekapKelengkapan (pnc) onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
}

// ---- Cek status submit SEMUA Puskesmas untuk satu kombinasi tahun+bulan (PNC) ----
export async function checkAllPuskesmasSubmitted(tahun, bulan) {
  const collectionName = getPncCollectionName(tahun, bulan);
  const periodeId = `${tahun}-${bulan}`;
  const puskesmasSnap = await getDocs(collection(db, 'puskesmas'));

  if (puskesmasSnap.empty) {
    return { allSubmitted: false, completedCount: 0, totalPuskesmas: 0, noPuskesmas: true, list: [] };
  }

  const totalPuskesmas = puskesmasSnap.size;
  const rekapRef = collection(db, 'rekap_kelengkapan_pnc');
  const q = query(rekapRef, where('periode', '==', periodeId), where('isSubmitted', '==', true));
  const rekapSnap = await getDocs(q);
  const submittedSet = new Set(rekapSnap.docs.map((d) => d.data().puskesmasId));

  const list = [];
  for (const pkmDoc of puskesmasSnap.docs) {
    const pkmData = pkmDoc.data();
    let submitted = submittedSet.has(pkmDoc.id);
    if (!submitted) {
      const reportRef = getPncReportRef(collectionName, pkmDoc.id);
      const reportSnap = await getDoc(reportRef);
      submitted = reportSnap.exists() && reportSnap.data()[STATUS_FIELD] === STATUS_SUBMITTED;
    }
    list.push({ id: pkmDoc.id, nama: pkmData.nama || pkmDoc.id, submitted });
  }

  const completedCount = list.filter((p) => p.submitted).length;
  const allSubmitted = totalPuskesmas > 0 && completedCount === totalPuskesmas;

  return { allSubmitted, completedCount, totalPuskesmas, noPuskesmas: false, list };
}

// ---- Cek seluruh 12 bulan di satu tahun sudah lengkap (PNC) ----
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

// ---- Validasi Ketat Transisi Periode PNC (Anti-Loncat & Strict Full Year) ----
export async function validatePeriodTransition(currentTahun, currentBulan, targetTahun, targetBulan) {
  if (!currentTahun || !currentBulan) {
    return { allowed: true, reason: 'Inisialisasi periode awal.' };
  }

  const curY = parseInt(currentTahun, 10);
  const tarY = parseInt(targetTahun, 10);
  const curB = parseInt(currentBulan, 10);
  const tarB = parseInt(targetBulan, 10);

  if (curY === tarY && curB === tarB) {
    return { allowed: true, reason: 'Memperbarui status/pengaturan periode berjalan.' };
  }

  if (curY === tarY) {
    const expectedNextBulan = String(curB + 1).padStart(2, '0');
    if (tarB !== curB + 1) {
      return {
        allowed: false,
        reason: `Urutan bulan WAJIB linier (01 -> 02 -> ... -> 12). Dari bulan ${namaBulan(currentBulan)} ${currentTahun}, Anda hanya dapat mengaktifkan bulan ${namaBulan(expectedNextBulan)} ${currentTahun}. Tidak boleh melompati atau mundur dari urutan bulan.`,
      };
    }

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
        reason: `Tidak bisa mengganti ke bulan berikutnya.\n\nMasih ada ${missingPuskesmas.length} Puskesmas yang belum submit laporan PNC untuk periode ${namaBulan(currentBulan)} ${currentTahun}:\n\n${missingPuskesmas.map((n) => `• ${n}`).join('\n')}\n\nPastikan seluruh Puskesmas sudah mengumpulkan laporan sebelum membuka bulan baru.`,
        details: { missingPuskesmas, list },
      };
    }

    return { allowed: true, reason: 'Validasi bulan berhasil. Siap berpindah bulan.' };
  }

  if (currentBulan !== '12' || targetBulan !== '01' || tarY !== curY + 1) {
    return {
      allowed: false,
      reason: `Pergantian tahun anggaran hanya bisa dilakukan secara berurutan dari bulan Desember (${currentTahun}) ke bulan Januari (${curY + 1}). Anda saat ini masih berada di bulan ${namaBulan(currentBulan)} ${currentTahun}.`,
    };
  }

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

  return { allowed: true, reason: 'Validasi pergantian tahun anggaran berhasil. Siap berpindah tahun anggaran.' };
}

// ---- Alias export berprefiks "Pnc" ----
// Beberapa hook/komponen PNC memanggil fungsi dengan nama yang menyertakan
// "Pnc" di tengah (mis. getActivePncPeriode, subscribeActivePncPeriode).
// Alias di bawah ini menjaga kompatibilitas tanpa perlu ganti nama fungsi asli.
// PENTING: setiap nama alias hanya boleh muncul SATU KALI di seluruh file ini,
// atau build akan gagal dengan "Duplicate export".
export { getActivePeriode as getActivePncPeriode };
export { subscribeActivePeriode as subscribeActivePncPeriode };
export { getPncReportRef as getActivePncReportRef };
export { checkAllPuskesmasSubmitted as checkAllPuskesmasSubmittedPnc };
export { checkFullYearComplete as checkFullYearCompletePnc };
export { validatePeriodTransition as validatePeriodTransitionPnc };
export { subscribeRekapKelengkapan as subscribeRekapKelengkapanPnc };