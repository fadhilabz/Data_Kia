// hooks/pnc/usePncPeriod.js
//
// Hook untuk halaman admin/dataPnc. Periode aktif & status buka/kunci
// diambil dari useManajemenPeriode() — hook yang sama dipakai halaman
// admin "Periode Pelaporan" untuk MEMBUAT periode (ANC & PNC sekaligus,
// lihat handleCreateNextPeriod di useManajemenPeriode.js). Kalau admin
// belum pernah klik "Tambah Periode Baru" untuk tahun berjalan, memang
// belum ada dokumen sama sekali di collection {tahun}_{bulan}_pnc —
// itu bukan bug, tabel PNC memang akan kosong sampai periode dibuka.

"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useManajemenPeriode } from "@/hooks/useManajemenPeriode";
import { DAFTAR_BULAN, STATUS_TERKUNCI } from "@/constants/periode";
import { getPncCollectionName } from "@/lib/ibu/pnc/pncConfig";
import { PNC_FIELDS } from "@/lib/ibu/pnc/pncFields";

export function usePncPeriod() {
  const {
    selectedYear,
    openedMonths,
    statusPeriodeMap: rawStatusMap,
    activeMonth,
    loading: periodeLoading,
  } = useManajemenPeriode();

  const [selectedMonth, setSelectedMonthState] = useState(null);
  const [reportList, setReportList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [debugInfo, setDebugInfo] = useState({
    puskesmasCount: null,
    collectionQueried: null,
    fetchError: null,
    openedMonths: null,
  });

  // ---- Default selectedMonth = bulan aktif, begitu termuat ----
  useEffect(() => {
    if (periodeLoading) return;
    if (activeMonth) {
      setSelectedMonthState((prev) => prev ?? activeMonth);
    }
  }, [periodeLoading, activeMonth]);

  // ---- Peta status per bulan untuk PeriodeBulanCard, key = '01'..'12' ----
  // rawStatusMap dari useManajemenPeriode key-nya "TAHUN-BULAN" (mis. "2026-09"),
  // di sini di-remap jadi cuma "BULAN" untuk tahun yang sedang dipilih.
  const periodStatusesMap = {};
  DAFTAR_BULAN.forEach((b) => {
    const periodId = `${selectedYear}-${b.id}`;
    periodStatusesMap[b.id] = rawStatusMap?.[periodId] ?? STATUS_TERKUNCI;
  });

  // ---- Ambil data rekap: semua Puskesmas + laporan PNC bulan terpilih ----
  const loadReportList = useCallback(async (year, month) => {
    if (!year || !month) return;
    setLoading(true);
    const collectionName = getPncCollectionName(year, month);
    setDebugInfo((prev) => ({
      ...prev,
      collectionQueried: collectionName,
      fetchError: null,
    }));

    try {
      const puskesmasSnap = await getDocs(collection(db, "puskesmas"));
      setDebugInfo((prev) => ({ ...prev, puskesmasCount: puskesmasSnap.size }));

      const rows = await Promise.all(
        puskesmasSnap.docs.map(async (pDoc) => {
          const pData = pDoc.data();
          try {
            const reportRef = doc(db, collectionName, pDoc.id);
            const reportSnap = await getDoc(reportRef);
            const reportData = reportSnap.exists() ? reportSnap.data() : {};
            return {
              id: pDoc.id,
              nama: pData.nama || pDoc.id,
              // Field asli di Firestore adalah "sasaranBulin" (lihat
              // handleCreateNextPeriod di useManajemenPeriode.js), bukan
              // "targetBulin". Dipetakan ke key internal PNC_FIELDS.BULIN.
              [PNC_FIELDS.BULIN]:
                reportData.sasaranBulin ?? pData.sasaranBulin ?? 0,
              ...reportData,
            };
          } catch (innerErr) {
            setDebugInfo((prev) => ({
              ...prev,
              fetchError: `Gagal baca laporan ${pDoc.id}: ${innerErr.message}`,
            }));
            return {
              id: pDoc.id,
              nama: pData.nama || pDoc.id,
              [PNC_FIELDS.BULIN]: pData.sasaranBulin ?? 0,
            };
          }
        }),
      );

      rows.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
      setReportList(rows);
    } catch (err) {
      setDebugInfo((prev) => ({
        ...prev,
        fetchError: `Gagal baca collection puskesmas: ${err.message}`,
      }));
      setReportList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedYear && selectedMonth) {
      loadReportList(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth, loadReportList]);

  useEffect(() => {
    setDebugInfo((prev) => ({
      ...prev,
      openedMonths: JSON.stringify(openedMonths),
    }));
  }, [openedMonths]);

  const setSelectedMonth = (monthValue) => {
    setSelectedMonthState(monthValue);
  };

  return {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    reportList,
    loading,
    periodStatusesMap,
    activePeriodData: { bulan: activeMonth, tahun: selectedYear },
    debugInfo,
  };
}
