// components/anc/AncReportTablePreview.jsx
// Komponen utama preview tabel rekapitulasi ANC (Petugas & Preview Mode)
// Tersinkronisasi dengan selectedMonth & selectedYear dari PeriodeBulanCard.
//
// Perilaku fetch:
// - Petugas puskesmas: hanya fetch data puskesmas miliknya sendiri (getDoc, 2 baca)
// - Admin dinkes: fetch semua puskesmas + semua laporan (getDocs, untuk rekap kota)

"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getActivePeriode,
  getAncCollectionName,
  namaBulan,
  TEMPLATE_KOLOM_ANC,
  STATUS_FIELD,
  STATUS_SUBMITTED,
} from "@/lib/ibu/anc/ancConfig";
import { useAncExport } from "@/lib/ibu/anc/useAncExport";
import AncTable from "./AncTable";

export default function AncReportTablePreview({
  userProfile,
  selectedMonth,
  selectedYear,
}) {
  const [periode, setPeriode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportList, setReportList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { exportToExcel, exporting } = useAncExport();

  const isPetugas =
    userProfile?.role === "petugas_puskesmas" ||
    (userProfile?.puskesmasId && userProfile?.role !== "admin_dinkes");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let activePeriode = null;
        if (selectedMonth && selectedYear) {
          activePeriode = {
            bulan: selectedMonth,
            tahun: selectedYear,
            namaPeriode: `Periode ${namaBulan(selectedMonth)} ${selectedYear}`,
            collectionName: getAncCollectionName(selectedYear, selectedMonth),
          };
        } else {
          activePeriode = await getActivePeriode();
        }

        setPeriode(activePeriode);

        if (!activePeriode) {
          setLoading(false);
          return;
        }

        const collectionName =
          activePeriode.collectionName ||
          getAncCollectionName(activePeriode.tahun, activePeriode.bulan);

        const pkmMap = new Map();
        const reportsMap = new Map();

        if (isPetugas && userProfile?.puskesmasId) {
          // Petugas: hanya ambil data puskesmas miliknya sendiri
          const pkmSnap = await getDoc(
            doc(db, "puskesmas", userProfile.puskesmasId),
          );
          if (pkmSnap.exists()) {
            const pData = pkmSnap.data();
            pkmMap.set(pkmSnap.id, {
              id: pkmSnap.id,
              nama: pData.nama || pkmSnap.id,
              kecamatan: pData.kecamatan || "",
              sasaranBumil: pData.sasaranBumil || 0,
              sasaranBulin: pData.sasaranBulin || 0,
            });
          }

          const reportSnap = await getDoc(
            doc(db, collectionName, userProfile.puskesmasId),
          );
          if (reportSnap.exists()) {
            reportsMap.set(reportSnap.id, reportSnap.data());
          }
        } else {
          // Admin: fetch semua puskesmas + semua laporan (untuk rekap kota)
          const puskesmasSnap = await getDocs(collection(db, "puskesmas"));
          puskesmasSnap.forEach((docSnap) => {
            const pData = docSnap.data();
            pkmMap.set(docSnap.id, {
              id: docSnap.id,
              nama: pData.nama || docSnap.id,
              kecamatan: pData.kecamatan || "",
              sasaranBumil: pData.sasaranBumil || 0,
              sasaranBulin: pData.sasaranBulin || 0,
            });
          });

          const reportsSnap = await getDocs(collection(db, collectionName));
          reportsSnap.forEach((docSnap) => {
            if (docSnap.id !== "_info") {
              reportsMap.set(docSnap.id, docSnap.data());
            }
          });
        }

        // Gabungkan Master Puskesmas dengan Data Laporan
        const combined = [];
        pkmMap.forEach((pkmInfo, pkmId) => {
          const repData = reportsMap.get(pkmId) || {};
          const k1Murni = Number(repData.k1Murni || 0);
          const k1Lebih12Minggu = Number(repData.k1Lebih12Minggu || 0);
          const k1Akses =
            repData.k1Akses !== undefined
              ? Number(repData.k1Akses)
              : k1Murni + k1Lebih12Minggu;
          const anemiaRingan = Number(repData.anemiaRingan || 0);
          const anemiaSedang = Number(repData.anemiaSedang || 0);
          const anemiaBerat = Number(repData.anemiaBerat || 0);
          const totalAnemia =
            repData.totalAnemia !== undefined
              ? Number(repData.totalAnemia)
              : anemiaRingan + anemiaSedang + anemiaBerat;

          combined.push({
            ...TEMPLATE_KOLOM_ANC,
            ...repData,
            puskesmasId: pkmId,
            namaPuskesmas: pkmInfo.nama,
            kecamatan: pkmInfo.kecamatan,
            sasaranBumil: Number(
              repData.sasaranBumil || pkmInfo.sasaranBumil || 0,
            ),
            sasaranBulin: Number(
              repData.sasaranBulin || pkmInfo.sasaranBulin || 0,
            ),
            k1Akses,
            totalAnemia,
            [STATUS_FIELD]: repData[STATUS_FIELD] || "draft",
          });
        });

        // Urutkan alfabetis Puskesmas
        combined.sort((a, b) => a.namaPuskesmas.localeCompare(b.namaPuskesmas));
        setReportList(combined);
      } catch (err) {
        console.error("Error loading ANC preview table:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, isPetugas, userProfile?.puskesmasId]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-surface-container-lowest border border-outline-variant rounded-2xl text-on-surface-variant text-sm">
        Memuat rekapitulasi data ANC...
      </div>
    );
  }

  if (!periode) {
    return (
      <div className="p-8 text-center bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
        Periode aktif belum dikonfigurasi oleh Admin Dinas Kesehatan.
      </div>
    );
  }

  // reportList sudah spesifik milik petugas kalau isPetugas === true,
  // jadi filter di sini hanya jaring pengaman tambahan (aman dibiarkan).
  const displayedList = isPetugas
    ? reportList.filter((item) => item.puskesmasId === userProfile.puskesmasId)
    : reportList;

  const jumlahSubmitted = reportList.filter(
    (r) => r[STATUS_FIELD] === STATUS_SUBMITTED,
  ).length;
  const totalPuskesmas = reportList.length;

  return (
    <div className="space-y-4">
      {/* Header Bar Controls */}
      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              table_chart
            </span>
            Rekapitulasi Laporan ANC{" "}
            {isPetugas
              ? `— ${userProfile?.namaPuskesmas || "Puskesmas"}`
              : "Kota Baubau"}{" "}
            ({namaBulan(periode.bulan)} {periode.tahun})
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Status Kelengkapan: <strong>{jumlahSubmitted}</strong> dari{" "}
            <strong>{totalPuskesmas}</strong> Puskesmas telah menyelesaikan
            (submit) laporan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          {!isPetugas && (
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-xs text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Puskesmas..."
                className="pl-8 pr-3 py-1.5 bg-surface-container-highest rounded-xl text-xs text-on-surface border-none outline-none focus:ring-2 focus:ring-primary w-48"
              />
            </div>
          )}

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={() => exportToExcel(displayedList, periode)}
            disabled={exporting || displayedList.length === 0}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">
              download
            </span>
            {exporting ? "Menyiapkan Excel..." : "Download File Excel (.xlsx)"}
          </button>
        </div>
      </div>

      {/* Modular Table Component */}
      <AncTable reportList={displayedList} searchQuery={searchQuery} />
    </div>
  );
}
