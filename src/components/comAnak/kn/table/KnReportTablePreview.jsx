// components/kn/table/KnReportTablePreview.jsx
// Preview tabel rekapitulasi KN — pola identik PncReportTablePreview.jsx,
// SUDAH termasuk 2 fix yang kita temukan di modul PNC:
// 1. Objek gabungan punya field `id` & `nama` (bukan cuma puskesmasId/
//    namaPuskesmas) karena KnTable membaca row.id (key <tr>) & row.nama.
// 2. sasaranKelahiranHidup diprioritaskan dari repData (dokumen laporan
//    periode ini), BUKAN dari pkmInfo (data master) — supaya tidak
//    tertimpa nilai basi kalau master belum di-update tapi laporan sudah.

"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getKnCollectionName, namaBulan, TEMPLATE_KOLOM_KN, STATUS_FIELD, STATUS_SUBMITTED } from "@/lib/libAnak/kn/knConfig";
import KnTable from "@/components/comAnak/kn/table/KnTable";

export default function KnReportTablePreview({ userProfile, selectedMonth, selectedYear }) {
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
        if (!selectedMonth || !selectedYear) {
          setReportList([]);
          setLoading(false);
          return;
        }
        const collectionName = getKnCollectionName(selectedYear, selectedMonth);

        const pkmMap = new Map();
        const reportsMap = new Map();

        if (isPetugas && userProfile?.puskesmasId) {
          const pkmSnap = await getDoc(doc(db, "puskesmas", userProfile.puskesmasId));
          if (pkmSnap.exists()) {
            const pData = pkmSnap.data();
            pkmMap.set(pkmSnap.id, {
              id: pkmSnap.id,
              nama: pData.nama || pkmSnap.id,
              sasaranKelahiranHidup: pData.sasaranKelahiranHidup || 0,
            });
          }
          const reportSnap = await getDoc(doc(db, collectionName, userProfile.puskesmasId));
          if (reportSnap.exists()) reportsMap.set(reportSnap.id, reportSnap.data());
        } else {
          const puskesmasSnap = await getDocs(collection(db, "puskesmas"));
          puskesmasSnap.forEach((docSnap) => {
            const pData = docSnap.data();
            pkmMap.set(docSnap.id, {
              id: docSnap.id,
              nama: pData.nama || docSnap.id,
              sasaranKelahiranHidup: pData.sasaranKelahiranHidup || 0,
            });
          });
          const reportsSnap = await getDocs(collection(db, collectionName));
          reportsSnap.forEach((docSnap) => {
            if (docSnap.id !== "_info") reportsMap.set(docSnap.id, docSnap.data());
          });
        }

        const combined = [];
        pkmMap.forEach((pkmInfo, pkmId) => {
          const repData = reportsMap.get(pkmId) || {};
          combined.push({
            ...TEMPLATE_KOLOM_KN,
            ...repData,
            id: pkmId,
            nama: pkmInfo.nama,
            puskesmasId: pkmId,
            namaPuskesmas: pkmInfo.nama,
            // Sasaran diprioritaskan dari dokumen laporan (repData), fallback
            // ke data master kalau laporan belum pernah diisi.
            sasaranKelahiranHidup: Number(
              repData.sasaranKelahiranHidup ?? pkmInfo.sasaranKelahiranHidup ?? 0
            ),
            [STATUS_FIELD]: repData[STATUS_FIELD] || "draft",
          });
        });

        combined.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
        setReportList(combined);
      } catch (err) {
        console.error("Error loading KN preview table:", err);
        setReportList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, isPetugas, userProfile?.puskesmasId]);

  if (loading) {
    return (
      <div className="p-8 text-center bg-surface-container-lowest border border-outline-variant rounded-2xl text-on-surface-variant text-sm">
        Memuat rekapitulasi data KN...
      </div>
    );
  }

  const displayedList = isPetugas
    ? reportList.filter((item) => item.id === userProfile.puskesmasId)
    : reportList;

  const jumlahSubmitted = reportList.filter((r) => r[STATUS_FIELD] === STATUS_SUBMITTED).length;
  const totalPuskesmas = reportList.length;

  return (
    <div className="space-y-4">
      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">table_chart</span>
            Rekapitulasi Laporan KN{" "}
            {isPetugas ? `— ${userProfile?.namaPuskesmas || "Puskesmas"}` : "Kota Baubau"}{" "}
            ({namaBulan(selectedMonth)} {selectedYear})
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Status Kelengkapan: <strong>{jumlahSubmitted}</strong> dari <strong>{totalPuskesmas}</strong> Puskesmas
            telah menyelesaikan (submit) laporan.
          </p>
        </div>

        {!isPetugas && (
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-xs text-on-surface-variant">search</span>
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

      <KnTable reportList={displayedList} searchQuery={searchQuery} />
    </div>
  );
}