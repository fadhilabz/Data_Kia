// lib/anct/useAnctPeriode.js
// Hook: mengelola periode aktif ANC Terpadu, status buka/kunci per-bulan,
// pemilihan bulan oleh user, dan status editable/read-only.
//
// CATATAN: ditulis langsung dengan pola yang BENAR dari awal — baca status
// dari useManajemenPeriode() (sumber: settings/period_statuses), SATU sumber
// yang sama dipakai Admin, ANC, dan PNC. Ini menghindari bug yang sempat
// terjadi di usePncPeriode versi awal (yang sempat baca dari dokumen
// settings/pnc_period_statuses terpisah yang tidak pernah ditulis siapapun).

import { useState, useEffect } from "react";
import { useManajemenPeriode } from "@/hooks/useManajemenPeriode";
import { STATUS_TERKUNCI, isPeriodeLocked } from "@/constants/periode";

export function useAnctPeriode({ isAdmin } = {}) {
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
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12",
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