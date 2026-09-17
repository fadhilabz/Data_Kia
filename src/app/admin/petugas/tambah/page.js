"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getAncCollectionName,
  TEMPLATE_KOLOM_ANC,
} from "@/lib/ibu/anc/ancConfig";

export default function TambahPetugasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "petugas",
    puskesmas: "Puskesmas Katobengke",
    nip: "",
    phone: "",
    status: "active",
  });

  // Daftar resmi 17 Puskesmas sesuai data SASARAN (Excel Data Ibu 2026 Baubau).
  // JANGAN diubah sendiri-sendiri di file lain — kalau perlu tambah/ubah nama,
  // ubah di sini saja supaya seluruh aplikasi tetap pakai daftar yang sama.
  const daftarPuskesmas = [
    "Puskesmas Katobengke",
    "Puskesmas Wajo",
    "Puskesmas Betoambari",
    "Puskesmas Meo-Meo",
    "Puskesmas Bataraguru",
    "Puskesmas Wolio",
    "Puskesmas Sorawolio",
    "Puskesmas Liwuto",
    "Puskesmas Lakologou",
    "Puskesmas Kadolomoko",
    "Puskesmas Bungi",
    "Puskesmas BWI",
    "Puskesmas Lowu-Lowu",
    "Puskesmas Kampeonaho",
    "Puskesmas Waborobo",
    "Puskesmas Melai",
    "Puskesmas Sulaa",
  ];

  const slugifyPuskesmas = (namaPuskesmas) =>
    namaPuskesmas
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Pastikan dokumen master Puskesmas ada di collection 'puskesmas'.
  // Kalau sudah ada, TIDAK ditimpa (supaya data Sasaran yang sudah diisi Admin
  // lewat halaman Kelola Sasaran tidak hilang) — hanya field identitas dasar
  // yang di-merge kalau dokumennya baru pertama kali dibuat.
  const ensurePuskesmasExists = async (puskesmasId, namaPuskesmas) => {
    const puskesmasRef = doc(db, "puskesmas", puskesmasId);
    const puskesmasSnap = await getDoc(puskesmasRef);

    if (!puskesmasSnap.exists()) {
      await setDoc(puskesmasRef, {
        nama: namaPuskesmas,
        kecamatan: "",
        sasaranBumil: 0,
        sasaranBulin: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return true; // baru dibuat
    }
    return false; // sudah ada sebelumnya
  };

  // Backfill: kalau ada periode yang SUDAH dibuka Admin sebelum Puskesmas ini
  // terdaftar, buatkan dokumen laporannya untuk bulan-bulan tersebut juga —
  // supaya Puskesmas baru tidak "ketinggalan" dan tetap bisa isi laporan.
  const backfillOpenedPeriods = async (puskesmasId, namaPuskesmas, tahun) => {
    const openedRef = doc(db, "settings", "opened_periods");
    const openedSnap = await getDoc(openedRef);
    if (!openedSnap.exists()) return;

    const openedMonths = openedSnap.data()[tahun] || [];
    if (openedMonths.length === 0) return;

    for (const bulan of openedMonths) {
      const collectionName = getAncCollectionName(tahun, bulan);
      const reportRef = doc(db, collectionName, puskesmasId);
      const reportSnap = await getDoc(reportRef);

      // Hanya buat kalau memang belum ada, jangan timpa data yang mungkin
      // sudah sempat diisi.
      if (!reportSnap.exists()) {
        await setDoc(reportRef, {
          ...TEMPLATE_KOLOM_ANC,
          puskesmasId,
          namaPuskesmas,
          statusReport: "draft",
          updatedAt: serverTimestamp(),
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailDocId = formData.email.trim().toLowerCase();
      const puskesmasId = slugifyPuskesmas(formData.puskesmas);
      const currentYear = String(new Date().getFullYear());

      // 1. Pastikan dokumen master Puskesmas ada
      const puskesmasBaruDibuat = await ensurePuskesmasExists(
        puskesmasId,
        formData.puskesmas,
      );

      // 2. Simpan/perbarui akun user
      await setDoc(
        doc(db, "users", emailDocId),
        {
          email: emailDocId,
          name: formData.name,
          role: formData.role,
          puskesmas: formData.puskesmas,
          puskesmasId,
          nip: formData.nip || null,
          phone: formData.phone || null,
          status: formData.status,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      // 3. Backfill dokumen periode yang sudah terlanjur dibuka Admin sebelumnya,
      // supaya Puskesmas ini langsung bisa isi laporan bulan-bulan tersebut.
      await backfillOpenedPeriods(puskesmasId, formData.puskesmas, currentYear);

      alert(
        puskesmasBaruDibuat
          ? "Berhasil menambah petugas! Puskesmas ini baru pertama kali terdaftar — dokumen laporan untuk periode yang sudah dibuka juga sudah disiapkan."
          : "Berhasil menambah data petugas!",
      );
      router.push("/admin/petugas");
    } catch (error) {
      console.error("Error adding petugas:", error);
      alert("Gagal menambah data petugas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className=" bg-surface-container-lowest p-6 lg:p-10 text-on-surface">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Tambah Petugas Baru
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Tambahkan akun petugas Puskesmas atau Admin Dinkes ke dalam sistem
              Data Ibu Baubau
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-3 py-1.5 text-xs font-semibold rounded-full border border-outline text-on-surface hover:bg-surface-container transition"
          >
            Batal
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant shadow-sm space-y-5"
        >
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Nama Lengkap & Gelar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Contoh: Bdn. Siti Rahma, S.Tr.Keb"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-highest border-none rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Alamat Email (Google Account){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="contoh: dinkeskesmas61@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-highest border-none rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary outline-none"
            />
            <p className="text-[10px] text-on-surface-variant mt-1">
              *Email harus sesuai dengan akun Google yang digunakan petugas
              untuk Login.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">
                Role / Hak Akses <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-highest border-none rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="petugas">Petugas Puskesmas</option>
                <option value="admin">Admin Dinkes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">
                Puskesmas / Unit Kerja <span className="text-red-500">*</span>
              </label>
              <select
                name="puskesmas"
                value={formData.puskesmas}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-highest border-none rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary outline-none"
              >
                {daftarPuskesmas.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">
                NIP / NIK (Opsional)
              </label>
              <input
                type="text"
                name="nip"
                placeholder="199408232021032005"
                value={formData.nip}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-highest border-none rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">
                Nomor HP / WhatsApp (Opsional)
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="081234567890"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-surface-container-highest border-none rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Status Akun
            </label>
            <div className="flex items-center gap-6 mt-1">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === "active"}
                  onChange={handleChange}
                  className="accent-primary"
                />
                <span>Aktif</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === "inactive"}
                  onChange={handleChange}
                  className="accent-primary"
                />
                <span>Non-Aktif</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    person_add
                  </span>
                  Simpan Petugas
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
