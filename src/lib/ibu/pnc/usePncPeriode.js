// lib/pnc/usePncPeriode.js
// Hook: mengelola periode aktif PNC, status buka/kunci per-bulan,
// pemilihan bulan oleh user, dan status editable/read-only.
//
// PERBAIKAN: status buka/kunci sekarang diambil dari useManajemenPeriode()
// (sumber: settings/period_statuses) — SATU sumber yang sama dipakai oleh
// halaman Admin "Periode Pelaporan" dan form ANC. Sebelumnya hook ini
// mendengarkan dokumen settings/pnc_period_statuses yang terpisah dan
// TIDAK PERNAH ditulis oleh siapapun, sehingga statusnya selalu kosong dan
// semua bulan selain bulan aktif selalu tampil "Dikunci" walau sudah
// dibuka oleh Admin.

import { useState, useEffect } from "react";
import { useManajemenPeriode } from "@/hooks/useManajemenPeriode";
import { STATUS_TERKUNCI, isPeriodeLocked } from "@/constants/periode";

export function usePncPeriode({ isAdmin } = {}) {
  const {
    selectedYear,
    setSelectedYear,
    openedMonths,
    statusPeriodeMap,
    activeMonth,
    loading: periodeLoading,
  } = useManajemenPeriode();

  const [selectedMonth, setSelectedMonthState] = useState(null);
  const [userManuallySelected, setUserManuallySelected] = useState(false);

  // ---- Default selectedMonth = bulan aktif, kecuali user sudah pilih manual ----
  useEffect(() => {
    if (periodeLoading) return;
    if (userManuallySelected) return;
    if (activeMonth) {
      setSelectedMonthState(activeMonth);
    }
  }, [periodeLoading, activeMonth, userManuallySelected]);

  // ---- Peta status per bulan untuk PeriodeBulanCard, key = '01'..'12' ----
  // Sama persis dengan pola di useDataSasaranPeriode / usePncPeriod (Admin):
  // statusPeriodeMap dari useManajemenPeriode key-nya "TAHUN-BULAN".
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

  // Editable kalau: Admin (selalu boleh), ATAU periode ini sudah dibuka
  // (ada di openedMonths) DAN statusnya tidak terkunci.
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