// hooks/hookShk/useShkPeriod.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useManajemenPeriode } from '@/hooks/useManajemenPeriode';
import { DAFTAR_BULAN, STATUS_TERKUNCI } from '@/constants/periode';
import { getShkCollectionName } from '@/lib/libShk/shkConfig';

export function useShkPeriod() {
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
    if (activeMonth) setSelectedMonthState((prev) => prev ?? activeMonth);
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
      const collectionName = getShkCollectionName(year, month);
      const puskesmasSnap = await getDocs(collection(db, 'puskesmas'));
      const rows = await Promise.all(
        puskesmasSnap.docs.map(async (pDoc) => {
          const pData = pDoc.data();
          const reportSnap = await getDoc(doc(db, collectionName, pDoc.id));
          const reportData = reportSnap.exists() ? reportSnap.data() : {};
          return {
            id: pDoc.id,
            nama: pData.nama || pDoc.id,
            sasaranBbl: Number(reportData.sasaranBbl ?? pData.sasaranBbl ?? 0),
            ...reportData,
          };
        })
      );
      rows.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
      setReportList(rows);
    } catch (err) {
      console.error('useShkPeriod loadReportList error:', err);
      setReportList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedYear && selectedMonth) loadReportList(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, loadReportList]);

  const setSelectedMonth = (m) => setSelectedMonthState(m);

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