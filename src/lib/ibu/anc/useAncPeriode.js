// lib/anc/useAncPeriode.js
// Hook: mengelola periode aktif (dari Admin), status buka/kunci per-bulan,
// pemilihan bulan oleh user, dan status editable/read-only.

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeActivePeriode } from "@/lib/ibu/anc/ancConfig";

export function useAncPeriode({ isAdmin }) {
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear()),
  );
  const [userManuallySelected, setUserManuallySelected] = useState(false);

  const [activePeriode, setActivePeriode] = useState(null);
  const [periodStatusesMap, setPeriodStatusesMap] = useState({});
  const [periodeLoading, setPeriodeLoading] = useState(true);

  // Listen real-time status active_period
  useEffect(() => {
    const unsubscribe = subscribeActivePeriode(
      (active) => {
        if (active) setActivePeriode(active);
        setPeriodeLoading(false);
      },
      (err) => {
        console.error("Error loading active period:", err);
        setPeriodeLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  // Listen real-time status Buka/Kunci per-bulan
  useEffect(() => {
    const statusesRef = doc(db, "settings", "period_statuses");
    const unsubscribe = onSnapshot(statusesRef, (snap) => {
      if (snap.exists()) setPeriodStatusesMap(snap.data() || {});
    });
    return () => unsubscribe();
  }, []);

  // Auto-switch selectedMonth ke bulan aktif riil dari Admin,
  // hanya jika user belum memilih bulan secara manual.
  useEffect(() => {
    if (userManuallySelected) return;

    let targetMonth = activePeriode?.bulan;
    let targetYear = activePeriode?.tahun || selectedYear;

    const activeEntries = Object.entries(periodStatusesMap).filter(
      ([key, status]) =>
        key.startsWith(`${targetYear}-`) && status === "active",
    );
    if (activeEntries.length > 0) {
      const highestActiveKey = activeEntries.sort().pop()[0];
      targetMonth = highestActiveKey.split("-")[1];
    }

    if (targetMonth) {
      setSelectedMonth(targetMonth);
      if (targetYear) setSelectedYear(targetYear);
    }
  }, [activePeriode, periodStatusesMap, userManuallySelected, selectedYear]);

  const periodKey = `${selectedYear}-${selectedMonth}`;
  const specificStatus = periodStatusesMap[periodKey];

  const isSelectedActivePeriod =
    activePeriode &&
    activePeriode.bulan === selectedMonth &&
    activePeriode.tahun === selectedYear;

  const isEditable =
    isAdmin ||
    specificStatus === "active" ||
    (specificStatus !== "inactive" &&
      isSelectedActivePeriod &&
      activePeriode?.status === "active");

  const isReadOnly = !isEditable;

  const selectMonth = (mId) => {
    setUserManuallySelected(true);
    setSelectedMonth(mId);
  };

  return {
    selectedMonth,
    selectedYear,
    selectMonth,
    activePeriode,
    periodStatusesMap,
    periodeLoading,
    isEditable,
    isReadOnly,
  };
}
