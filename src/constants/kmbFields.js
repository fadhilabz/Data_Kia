// constants/kmbFields.js
// Konfigurasi modul KMB (Pel. Balita dan Kematian) — sesuai sheet Excel
// "KMB": kematian Anak Balita (12-59 bulan) & Anak (7-18 tahun).
//
// DESAIN: beda dari Kematian Ibu / Kematian Neonatal, di sini Petugas
// TIDAK isi angka sebab kematian secara manual terpisah dari detail kasus
// — supaya tidak ada risiko dua sumber data nggak sinkron. Petugas cukup
// "Tambah Kasus" tiap ada kematian, isi detailnya (termasuk kelompok umur,
// jenis kelamin, sebab). SEMUA angka rekap (jumlah L/P, jumlah per sebab)
// dihitung OTOMATIS dari daftar kasus (kasusList) — bukan field terpisah.

export const KMB_KELOMPOK_UMUR = [
  { key: 'balita', label: 'Anak Balita (12-59 Bulan)' },
  { key: 'anak', label: 'Anak (7-18 Tahun)' },
];

export const KMB_SEBAB_LIST = [
  { key: 'pneumonia', label: 'Pneumonia' },
  { key: 'diare', label: 'Diare' },
  { key: 'kelainanKongenital', label: 'Kelainan Kongenital' },
  { key: 'kelainanKongenitalJantung', label: 'Kelainan Kongenital Jantung' },
  { key: 'penyakitSaraf', label: 'Penyakit Saraf' },
  { key: 'kecelakaanLaluLintas', label: 'Kecelakaan Lalu Lintas' },
  { key: 'infeksiParasit', label: 'Infeksi Parasit' },
  { key: 'malaria', label: 'Malaria' },
];

// Bentuk 1 objek kasus kematian
export function buildKasusKosong() {
  return {
    id: `kasus_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    kelompokUmur: 'balita', // 'balita' | 'anak'
    jenisKelamin: 'L',      // 'L' | 'P'
    sebab: KMB_SEBAB_LIST[0].key,
    nama: '',
    namaOrtu: '',
    alamat: '',
    tanggalLahir: '',
    jamLahir: '',
    tanggalKematian: '',
    umurKematian: '',
    tempatKematian: '',
  };
}

// ---- Hitung jumlah kematian (L/P/Abs) untuk 1 kelompok umur dari daftar kasus ----
export function getJumlahKematianGroup(kasusList, kelompokKey) {
  const kasusGroup = (kasusList || []).filter((k) => k.kelompokUmur === kelompokKey);
  const l = kasusGroup.filter((k) => k.jenisKelamin === 'L').length;
  const p = kasusGroup.filter((k) => k.jenisKelamin === 'P').length;
  return { l, p, abs: l + p };
}

// ---- Hitung jumlah kasus per sebab untuk 1 kelompok umur ----
export function getSebabCounts(kasusList, kelompokKey) {
  const kasusGroup = (kasusList || []).filter((k) => k.kelompokUmur === kelompokKey);
  const counts = {};
  KMB_SEBAB_LIST.forEach((s) => {
    counts[s.key] = kasusGroup.filter((k) => k.sebab === s.key).length;
  });
  return counts;
}

// ---- Total gabungan kedua kelompok umur ----
export function getJumlahKematianTotal(kasusList) {
  return (kasusList || []).length;
}

/**
 * Rekap gabungan dari BANYAK laporan (dipakai tabel Admin) — tiap laporan
 * punya field `kasusList`, digabung jadi satu rekap besar.
 */
export function calculateKmbSummary(reportList) {
  const allKasus = (reportList || []).flatMap((r) => r.kasusList || []);
  const perGroup = {};
  KMB_KELOMPOK_UMUR.forEach((g) => {
    perGroup[g.key] = {
      ...getJumlahKematianGroup(allKasus, g.key),
      sebab: getSebabCounts(allKasus, g.key),
    };
  });
  return { perGroup, totalKasus: allKasus.length };
}