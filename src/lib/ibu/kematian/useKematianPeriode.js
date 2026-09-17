// lib/kematian/useKematianPeriode.js
// Hook periode sisi petugas untuk modul Kematian Ibu. Pola identik useAnctPeriode.js —
// baca status dari useManajemenPeriode() (sumber: settings/period_statuses),
// SATU sumber yang sama dipakai Admin, ANC, PNC, ANCT, dan Kematian.

'use client';

import { useState, useEffect } from 'react';
import { useManajemenPeriode } from '@/hooks/useManajemenPeriode';
import { STATUS_TERKUNCI, isPeriodeLocked } from '@/constants/periode';

export function useKematianPeriode({ isAdmin } = {}) {
  const {
    selectedYear,
    openedMonths,
    statusPeriodeMap,
    activeMonth,
    loading: periodeLoading,
  } = useManajemenPeriode();

  const [selectedMonth, setSelectedMonthState] = useState(null);
  const [userManuallySelected, setUserManuallySelected] = useState(false);

  useEffect(() => {
    if (periodeLoading) return;
    if (userManuallySelected) return;
    if (activeMonth) {
      setSelectedMonthState(activeMonth);
    }
  }, [periodeLoading, activeMonth, userManuallySelected]);

  const periodStatusesMap = {};
  const DAFTAR_BULAN_ID = [
    '01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12',
  ];
  DAFTAR_BULAN_ID.forEach((b) => {
    const periodId = `${selectedYear}-${b}`;
    periodStatusesMap[b] = statusPeriodeMap?.[periodId] ?? STATUS_TERKUNCI;
  });

  const periodId = `${selectedYear}-${selectedMonth}`;
  const currentStatus = statusPeriodeMap?.[periodId] ?? STATUS_TERKUNCI;

  const periodeSudahDibuka = selectedMonth
    ? openedMonths.includes(selectedMonth)
    : false;

  const isEditable = isAdmin || (periodeSudahDibuka && !isPeriodeLocked(currentStatus));
  const isReadOnly = !isEditable;

  const selectMonth = (mId) => {
    setUserManuallySelected(true);
    setSelectedMonthState(mId);
  };

  return {
    selectedMonth,
    selectedYear,
    selectMonth,
    activePeriode: { bulan: activeMonth, tahun: selectedYear },
    periodStatusesMap,
    periodeLoading,
    isEditable,
    isReadOnly,
  };
}