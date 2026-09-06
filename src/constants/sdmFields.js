// constants/sdmFields.js
// Field laporan SDM & Fasilitas Kesehatan, sesuai sheet Excel "SDM".
// CATATAN: 4 field asli "Presentase Kab/Kota yang memiliki Tim AMPSR" SENGAJA
// TIDAK dimasukkan di sini — itu levelnya kabupaten/kota (bukan per-Puskesmas),
// akan masuk ke modul AMPSR terpisah.
//
// CATATAN KUMULATIF: data SDM diisi kumulatif — angka bulan terakhir SUDAH
// MENCAKUP data bulan-bulan sebelumnya (bukan cuma penambahan bulan ini saja).

export const SDM_FIELDS = [
  // --- Jumlah Desa & P4K ---
  { key: 'jumlahDesa', label: 'Jumlah Desa', group: 'Jumlah Desa & P4K' },
  { key: 'jumlahPosyandu', label: 'Jumlah Posyandu', group: 'Jumlah Desa & P4K' },
  { key: 'jumlahPoskesdes', label: 'Jumlah Poskesdes', group: 'Jumlah Desa & P4K' },
  { key: 'desaMelaksanakanP4K', label: 'Jumlah Desa Melaksanakan P4K', group: 'Jumlah Desa & P4K' },

  // --- Rumah Tunggu Kelahiran ---
  { key: 'rumahTungguKelahiran', label: 'Jumlah Rumah Tunggu Kelahiran', group: 'Rumah Tunggu Kelahiran' },

  // --- Jumlah Puskesmas (checklist kapasitas layanan) ---
  { key: 'totalPkm', label: 'Total PKM', group: 'Jumlah Puskesmas' },
  { key: 'pkmDokterUmum', label: 'PKM Memiliki Dokter Umum', group: 'Jumlah Puskesmas' },
  { key: 'pkmJumlah', label: 'Jumlah Puskesmas', group: 'Jumlah Puskesmas' },
  { key: 'pkmMampuAnc12T', label: 'Puskesmas Mampu Pelayanan ANC 12T', group: 'Jumlah Puskesmas' },
  { key: 'pkmRuangBersalin', label: 'PKM Dengan Ruang Bersalin', group: 'Jumlah Puskesmas' },
  { key: 'pkmPkrt', label: 'PKM PKRT', group: 'Jumlah Puskesmas' },
  { key: 'pkmKelasIbuHamil', label: 'PKM Melaksanakan Kelas Ibu Hamil', group: 'Jumlah Puskesmas' },
  { key: 'pkmMampuPPKtP', label: 'PKM Mampu PP-KtP', group: 'Jumlah Puskesmas' },
  { key: 'pkmSupervisiFasilitatif', label: 'PKM Melaksanakan Supervisi Fasilitatif', group: 'Jumlah Puskesmas' },
  { key: 'pkmMampuPPIA', label: 'PKM Mampu PPIA', group: 'Jumlah Puskesmas' },
  { key: 'pkmKesproCatin', label: 'PKM Melaksanakan Kespro Catin', group: 'Jumlah Puskesmas' },
  { key: 'pkmOrientasiP4K', label: 'Puskesmas Melaksanakan Orientasi P4K', group: 'Jumlah Puskesmas' },
  { key: 'pkmTimKegawatdaruratan', label: 'Puskesmas Memiliki Tim Kegawatdaruratan Maternal Neonatal Terlatih', group: 'Jumlah Puskesmas' },
  { key: 'pkmMemilikiUsg', label: 'Puskesmas Memiliki USG', group: 'Jumlah Puskesmas' },
  { key: 'pkmDokterTerlatihAncUsg', label: 'Puskesmas Memiliki Dokter Terlatih ANC USG', group: 'Jumlah Puskesmas' },

  // --- Rumah Sakit ---
  { key: 'rsPemerintahRsu', label: 'RS Pemerintah - Jml RSU', group: 'Rumah Sakit' },
  { key: 'rsPemerintahRsia', label: 'RS Pemerintah - Jml RSIA', group: 'Rumah Sakit' },
  { key: 'rsSwastaRsu', label: 'RS Swasta - Jml RSU', group: 'Rumah Sakit' },
  { key: 'rsSwastaRsia', label: 'RS Swasta - Jml RSIA', group: 'Rumah Sakit' },
  { key: 'rsMampuPonek', label: 'RS Mampu PONEK', group: 'Rumah Sakit' },
  { key: 'rsPptPkt', label: 'RS PPT/PKT', group: 'Rumah Sakit' },
  { key: 'rsAuditKematian', label: 'RS Melakukan Audit Medik/Klinik Kematian Maternal & Perinatal', group: 'Rumah Sakit' },
  { key: 'rsSayangIbuBayi', label: 'RS Sayang Ibu dan Bayi', group: 'Rumah Sakit' },

  // --- Fasyankes Mampu Pelayanan KB Sesuai Standar ---
  { key: 'kbRsuPemerintah', label: 'RSU Pemerintah', group: 'Fasyankes Mampu KB Sesuai Standar' },
  { key: 'kbPkm', label: 'PKM', group: 'Fasyankes Mampu KB Sesuai Standar' },
  { key: 'kbPustu', label: 'Pustu', group: 'Fasyankes Mampu KB Sesuai Standar' },
  { key: 'kbPoskesdes', label: 'Poskesdes', group: 'Fasyankes Mampu KB Sesuai Standar' },
  // kbJmlTotal TIDAK di sini — otomatis, lihat SDM_COMPUTED_FIELDS

  // --- Dokter Umum ---
  { key: 'duJmlTotal', label: 'Jumlah Total Dokter Umum', group: 'Dokter Umum' },
  { key: 'duDiPkm', label: 'Dokter Umum di PKM', group: 'Dokter Umum' },
  { key: 'duTerlatihUsg', label: 'Jumlah Dokter Terlatih USG', group: 'Dokter Umum' },

  // --- Dokter Spesialis ---
  { key: 'spOG', label: 'Dokter SpOG (Obgin)', group: 'Dokter Spesialis' },
  { key: 'spA', label: 'Dokter SpA (Anak)', group: 'Dokter Spesialis' },
  { key: 'spAn', label: 'Dokter SpAn (Anestesi)', group: 'Dokter Spesialis' },

  // --- Bidan ---
  // bidanTotal TIDAK di sini — otomatis, lihat SDM_COMPUTED_FIELDS
  { key: 'bidanDiPkm', label: 'Bidan di PKM', group: 'Bidan' },
  { key: 'bidanDiDesa', label: 'Bidan di Desa (BDD)', group: 'Bidan' },
  { key: 'bddTinggalDiDesa', label: 'BDD Tinggal di Desa', group: 'Bidan' },
  { key: 'bddPunyaBidanKit', label: 'BDD Punya Bidan Kit', group: 'Bidan' },

  // --- Dukun Beranak ---
  { key: 'dukunTotal', label: 'Jumlah Dukun', group: 'Dukun Beranak' },
  { key: 'dukunBermitra', label: 'Dukun Bermitra', group: 'Dukun Beranak' },
];

// ---- Field otomatis terhitung (bukan input manual) ----
export const SDM_COMPUTED_FIELDS = [
  {
    key: 'kbJmlTotal',
    label: 'Jumlah Total (Fasyankes Mampu KB)',
    group: 'Fasyankes Mampu KB Sesuai Standar',
    hitung: (v) =>
      (Number(v.kbRsuPemerintah) || 0) +
      (Number(v.kbPkm) || 0) +
      (Number(v.kbPustu) || 0) +
      (Number(v.kbPoskesdes) || 0),
  },
  {
    key: 'bidanTotal',
    label: 'Jumlah Total Bidan (Otomatis)',
    group: 'Bidan',
    hitung: (v) => (Number(v.bidanDiPkm) || 0) + (Number(v.bidanDiDesa) || 0),
  },
];

export function getSdmFieldValue(item, fieldConfig) {
  if (!item || !fieldConfig) return 0;
  return Number(item[fieldConfig.key] || 0);
}

export function calculateSdmSummary(reportList) {
  const totals = {};
  SDM_FIELDS.forEach((field) => {
    totals[field.key] = (reportList || []).reduce(
      (sum, row) => sum + getSdmFieldValue(row, field),
      0
    );
  });
  SDM_COMPUTED_FIELDS.forEach((field) => {
    totals[field.key] = (reportList || []).reduce(
      (sum, row) => sum + field.hitung(row),
      0
    );
  });
  return { totals };
}