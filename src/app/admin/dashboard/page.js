"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  getActivePeriode,
  namaBulan as getNamaBulan,
} from "@/lib/ibu/anc/ancConfig";
import RekapKelengkapanCard from "@/components/shared/RekapKelengkapanCard";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [periode, setPeriode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        // 1. Ambil Profil User
        const userRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          // Proteksi: Jika bukan role dinkes/admin, kembalikan ke dashboard puskesmas
          if (userData.role !== "dinkes" && userData.role !== "admin") {
            router.push("/dashboard");
            return;
          }

          setUserProfile(userData);
        } else {
          router.push("/");
          return;
        }

        // 2. Ambil Periode Aktif Pelaporan dari settings/active_period
        const activeData = await getActivePeriode();
        if (activeData) {
          setPeriode(activeData);
        }
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 font-medium">
          Memuat Dashboard Admin Dinkes...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">
      {/* Navbar Header Admin */}
      <header className="bg-teal-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Data Ibu Baubau</h1>
            <p className="text-xs text-teal-200">
              Panel Admin Dinas Kesehatan Kota Baubau
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">
                {userProfile?.name || "Administrator"}
              </p>
              <p className="text-xs text-teal-300 uppercase font-semibold">
                Dinas Kesehatan
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-teal-900 hover:bg-teal-950 text-xs text-white px-3 py-2 rounded-lg transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
        {/* Banner Selamat Datang */}
        <section className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-teal-600/60 text-teal-100 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-teal-500/30">
              Selamat Datang
            </span>
            <h2 className="text-2xl font-bold mt-2">
              Halo, {userProfile?.name || "Admin Dinas Kesehatan"}
            </h2>
            <p className="text-sm text-teal-100 mt-1 max-w-xl">
              Selamat datang di Panel Pengawasan & Evaluasi Pelaporan Kesehatan
              Ibu se-Kota Baubau.
            </p>
          </div>

          {/* Card Info Periode Aktif */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-right min-w-[220px]">
            <p className="text-xs text-teal-200 font-medium">
              Periode Laporan Aktif
            </p>
            <p className="text-lg font-bold text-white mt-0.5">
              {periode
                ? `${namaBulan[periode.bulan - 1]} ${periode.tahun}`
                : "Belum diatur"}
            </p>
            <span
              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase ${
                periode?.status === "terbuka"
                  ? "bg-green-400 text-green-950"
                  : "bg-red-400 text-red-950"
              }`}
            >
              Status: {periode?.status || "Tertutup"}
            </span>
          </div>
        </section>

        {/* Real-time Rekap Status Kelengkapan Card */}
        {periode && (
          <RekapKelengkapanCard
            periodeId={`${periode.tahun}-${periode.bulan}`}
            namaPeriode={`${getNamaBulan(periode.bulan)} ${periode.tahun}`}
          />
        )}

        {/* Menu Akses Cepat Admin */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => router.push("/admin/settings")}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                Pengaturan
              </span>
            </div>
            <h3 className="font-bold text-gray-800 group-hover:text-teal-700 transition">
              Kelola Periode Pelaporan
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Buka atau kunci bulan pelaporan bulanan untuk seluruh UPTD
              Puskesmas.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm opacity-80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                Rekapitulasi
              </span>
            </div>
            <h3 className="font-bold text-gray-800">Laporan 17 Puskesmas</h3>
            <p className="text-xs text-gray-500 mt-1">
              Pantau kepatuhan input data ANC, PNC, KB, dan komplikasi dari
              seluruh kecamatan.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm opacity-80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                Manajemen
              </span>
            </div>
            <h3 className="font-bold text-gray-800">Pengguna & Akses User</h3>
            <p className="text-xs text-gray-500 mt-1">
              Atur role akun petugas Puskesmas, pimpinan, dan staff Dinas
              Kesehatan.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
