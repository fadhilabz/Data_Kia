// components/pnc/table/PncReportTablePreview.jsx
// Komponen preview tabel rekapitulasi PNC (Petugas & Preview Mode).
// Tersinkronisasi dengan selectedMonth & selectedYear.
//
// Perilaku fetch:
// - Petugas puskesmas: hanya fetch data puskesmas miliknya sendiri (getDoc)
// - Admin dinkes: fetch semua puskesmas + semua laporan (getDocs, untuk rekap kota)
//
// Target BULIN diambil dari field sasaranBulin di collection "puskesmas" (master,
// sama dengan yang dipakai modul ANC) — bukan diinput ulang tiap bulan.
//
// PERBAIKAN: objek `combined` sekarang menyertakan `id` dan `nama` (bukan cuma
// `puskesmasId`/`namaPuskesmas`) karena PncTable.jsx membaca row.id (untuk key
// <tr>) dan row.nama (untuk kolom Nama Puskesmas). Sebelumnya field itu tidak
// pernah di-set, sehingga semua baris punya id=undefined -> React key warning
// & kolom nama tampil kosong di semua baris.

"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getActivePncPeriode,
  getPncCollectionName,
  namaBulan,
  TEMPLATE_KOLOM_PNC,
  STATUS_FIELD,
  STATUS_SUBMITTED,
} from "@/lib/ibu/pnc/pncConfig";
import { PNC_FIELDS } from "@/lib/ibu/pnc/pncFields";
import PncTable from "./PncTable";

export default function PncReportTablePreview({
  userProfile,
  selectedMonth,
  selectedYear,
}) {
  const [periode, setPeriode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportList, setReportList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
            collectionName: getPncCollectionName(selectedYear, selectedMonth),
          };
        } else {
          activePeriode = await getActivePncPeriode();
        }

        setPeriode(activePeriode);

        if (!activePeriode) {
          setLoading(false);
          return;
        }

        const collectionName =
          activePeriode.collectionName ||
          getPncCollectionName(activePeriode.tahun, activePeriode.bulan);

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
          const pnTotal =
            repData.pnTotal !== undefined
              ? Number(repData.pnTotal)
              : Number(repData.pnFasyankes || 0) +
                Number(repData.pnNonFasyankes || 0);

          combined.push({
            ...TEMPLATE_KOLOM_PNC,
            ...repData,
            // id & nama: dipakai langsung oleh PncTable (key <tr> & kolom nama)
            id: pkmId,
            nama: pkmInfo.nama,
            // puskesmasId & namaPuskesmas dipertahankan untuk konsumen lain
            puskesmasId: pkmId,
            namaPuskesmas: pkmInfo.nama,
            kecamatan: pkmInfo.kecamatan,
            sasaranBulin: Number(
              repData.sasaranBulin ?? pkmInfo.sasaranBulin ?? 0,
            ),
            [PNC_FIELDS.BULIN]: Number(
              repData.sasaranBulin ?? pkmInfo.sasaranBulin ?? 0,
            ),
            pnTotal,
            [STATUS_FIELD]: repData[STATUS_FIELD] || "draft",
          });
        });

        combined.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
        setReportList(combined);
      } catch (err) {
        console.error("Error loading PNC preview table:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, isPetugas, userProfile?.puskesmasId]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-surface-container-lowest border border-outline-variant rounded-2xl text-on-surface-variant text-sm">
        Memuat rekapitulasi data PNC...
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

  const displayedList = isPetugas
    ? reportList.filter((item) => item.id === userProfile.puskesmasId)
    : reportList;

  const jumlahSubmitted = reportList.filter(
    (r) => r[STATUS_FIELD] === STATUS_SUBMITTED,
  ).length;
  const totalPuskesmas = reportList.length;

  return (
    <div className="space-y-4">
      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              table_chart
            </span>
            Rekapitulasi Laporan PNC{" "}
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
      </div>

      <PncTable reportList={displayedList} searchQuery={searchQuery} />
    </div>
  );
}
