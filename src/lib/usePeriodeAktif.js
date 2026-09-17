// hooks/pnc/usePncPeriod.js
//
// Hook untuk halaman admin/dataPnc.
//
// PENTING: Periode aktif pelaporan itu SHARED untuk seluruh modul (ANC,
// PNC, dll) — satu dokumen settings/active_period yang diatur admin lewat
// menu "Periode Pelaporan". Hook ini TIDAK membuat sumber periode terpisah
// untuk PNC (versi sebelumnya salah, sempat baca dokumen
// settings/active_period_pnc yang tidak pernah ada -> halaman stuck loading
// selamanya). Sekarang ikut pakai usePeriodeAktif() yang sama dengan modul
// lain.

"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { usePeriodeAktif } from "@/hooks/useManajemenPeriode";
import { getPncCollectionName, LIST_BULAN } from "@/lib/ibu/pnc/pncConfig";
import { PNC_FIELDS } from "@/lib/ibu/pnc/pncFields";

function getCurrentMonthYear() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  return { month, year };
}

export function usePncPeriod() {
  const {
    bulan: activeBulan,
    tahun: activeTahun,
    status: activeStatus,
    loading: periodeLoading,
    error: periodeError,
  } = usePeriodeAktif();

  const [selectedMonth, setSelectedMonthState] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [periodStatusesMap, setPeriodStatusesMap] = useState({});
  const [reportList, setReportList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Set default selectedMonth/Year begitu periode aktif termuat ----
  // Kalau admin belum pernah setting periode aktif sama sekali (periodeError
  // terisi), fallback ke bulan berjalan supaya halaman tetap bisa dipakai.
  useEffect(() => {
    if (periodeLoading) return;

    if (activeBulan && activeTahun) {
      setSelectedMonthState((prev) => prev ?? activeBulan);
      setSelectedYear((prev) => prev ?? activeTahun);
    } else {
      const { month, year } = getCurrentMonthYear();
      setSelectedMonthState((prev) => prev ?? month);
      setSelectedYear((prev) => prev ?? year);
    }
  }, [periodeLoading, activeBulan, activeTahun]);

  // ---- Peta status 12 bulan relatif ke periode aktif (untuk PeriodeBulanCard) ----
  useEffect(() => {
    if (!activeBulan || !activeTahun || activeTahun !== selectedYear) {
      setPeriodStatusesMap({});
      return;
    }
    const activeIdx = LIST_BULAN.findIndex((b) => b.value === activeBulan);
    const map = {};
    LIST_BULAN.forEach((b, idx) => {
      if (idx < activeIdx) map[b.value] = "selesai";
      else if (idx === activeIdx) map[b.value] = "active";
      else map[b.value] = "terkunci";
    });
    setPeriodStatusesMap(map);
  }, [activeBulan, activeTahun, selectedYear]);

  // ---- Ambil data rekap: semua Puskesmas + laporan PNC bulan terpilih ----
  const loadReportList = useCallback(async (year, month) => {
    if (!year || !month) return;
    setLoading(true);
    try {
      const puskesmasSnap = await getDocs(collection(db, "puskesmas"));
      const collectionName = getPncCollectionName(year, month);

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
              [PNC_FIELDS.BULIN]:
                reportData[PNC_FIELDS.BULIN] ?? pData.targetBulin ?? 0,
              ...reportData,
            };
          } catch (innerErr) {
            console.error(
              `usePncPeriod: gagal baca laporan ${pDoc.id}:`,
              innerErr,
            );
            return {
              id: pDoc.id,
              nama: pData.nama || pDoc.id,
              [PNC_FIELDS.BULIN]: pData.targetBulin ?? 0,
            };
          }
        }),
      );

      rows.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
      setReportList(rows);
    } catch (err) {
      console.error("usePncPeriod loadReportList error:", err);
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
    activePeriodData: {
      bulan: activeBulan,
      tahun: activeTahun,
      status: activeStatus,
    },
    periodeError,
  };
}
