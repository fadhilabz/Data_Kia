// hooks/kematian/useKematianPeriod.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useManajemenPeriode } from "@/hooks/useManajemenPeriode";
import { DAFTAR_BULAN, STATUS_TERKUNCI } from "@/constants/periode";
import { getKematianCollectionName } from "@/lib/ibu/kematian/kematianConfig";

export function useKematianPeriod() {
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

  useEffect(() => {
    if (periodeLoading) return;
    if (activeMonth) {
      setSelectedMonthState((prev) => prev ?? activeMonth);
    }
  }, [periodeLoading, activeMonth]);

  const periodStatusesMap = {};
  DAFTAR_BULAN.forEach((b) => {
    const periodId = `${selectedYear}-${b.id}`;
    periodStatusesMap[b.id] = rawStatusMap?.[periodId] ?? STATUS_TERKUNCI;
  });

  const loadReportList = useCallback(async (year, month) => {
    if (!year || !month) return;
    setLoading(true);
    try {
      const puskesmasSnap = await getDocs(collection(db, "puskesmas"));
      const collectionName = getKematianCollectionName(year, month);

      const rows = await Promise.all(
        puskesmasSnap.docs.map(async (pDoc) => {
          const pData = pDoc.data();
          try {
            const reportRef = doc(db, collectionName, pDoc.id);
            const reportSnap = await getDoc(reportRef);
            const reportData = reportSnap.exists() ? reportSnap.data() : {};
            return {
              id: pDoc.id,
              puskesmasId: pDoc.id,
              namaPuskesmas: pData.nama || pDoc.id,
              ...reportData,
            };
          } catch (err) {
            console.error(
              `useKematianPeriod: gagal baca laporan ${pDoc.id}:`,
              err,
            );
            return {
              id: pDoc.id,
              puskesmasId: pDoc.id,
              namaPuskesmas: pData.nama || pDoc.id,
            };
          }
        }),
      );

      rows.sort((a, b) =>
        (a.namaPuskesmas || "").localeCompare(b.namaPuskesmas || ""),
      );
      setReportList(rows);
    } catch (err) {
      console.error("useKematianPeriod loadReportList error:", err);
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

  const setSelectedMonth = (monthValue) => setSelectedMonthState(monthValue);

  return {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    reportList,
    loading,
    periodStatusesMap,
    activePeriodData: { bulan: activeMonth, tahun: selectedYear },
  };
}
