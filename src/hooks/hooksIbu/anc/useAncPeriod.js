// hooks/useAncPeriod.js
// Custom Hook khusus untuk mengelola state periode bulanan, pengontrolan akses per-bulan (termasuk bulan lalu), dan restoring data ANC.

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getAncCollectionName,
  TEMPLATE_KOLOM_ANC,
  STATUS_FIELD,
  STATUS_DRAFT,
} from "@/lib/ibu/anc/ancConfig";
import {
  isPeriodeLocked,
  STATUS_TERBUKA,
  STATUS_TERKUNCI,
} from "@/constants/periode";

export function useAncPeriod(
  initialMonth = "01",
  initialYear = String(new Date().getFullYear()),
) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  const [ancDataMap, setAncDataMap] = useState({});
  const [reportList, setReportList] = useState([]);
  const [periodStatus, setPeriodStatus] = useState(STATUS_TERBUKA);
  const [periodStatusesMap, setPeriodStatusesMap] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener ke settings/period_statuses untuk sync instan Buka/Kunci dari Admin
  // hooks/useAncPeriod.js

  // 1. Tambahkan listener Real-time ke settings/active_period agar sync otomatis dengan Admin
  useEffect(() => {
    const activeRef = doc(db, "settings", "active_period");
    const unsubscribeActive = onSnapshot(activeRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.bulan) setSelectedMonth(data.bulan);
        if (data.tahun) setSelectedYear(data.tahun);
      }
    });

    return () => unsubscribeActive();
  }, []);

  // 2. Real-time listener ke settings/period_statuses untuk sync status Kunci/Buka
  useEffect(() => {
    const statusesRef = doc(db, "settings", "period_statuses");
    const unsubscribeStatus = onSnapshot(statusesRef, (snap) => {
      if (snap.exists()) {
        setPeriodStatusesMap(snap.data() || {});
      }
    });
    return () => unsubscribeStatus();
  }, []);

  const fetchAncData = useCallback(
    async (month = selectedMonth, year = selectedYear) => {
      setLoading(true);
      setError(null);

      try {
        const collectionName = getAncCollectionName(year, month);
        const periodKey = `${year}-${month}`;

        // 1. Dapatkan Status Periode (Prioritaskan active_period -> period_statuses)
        let currentStatus = STATUS_TERKUNCI;

        // Pengecekan 1: Cek apakah bulan/tahun ini sedang diset sebagai active_period utama
        const activeRef = doc(db, "settings", "active_period");
        const activeSnap = await getDoc(activeRef);

        if (
          activeSnap.exists() &&
          activeSnap.data().tahun === year &&
          activeSnap.data().bulan === month
        ) {
          currentStatus = activeSnap.data().status || STATUS_TERBUKA;
        } else {
          // Pengecekan 2: Jika bukan active_period utama, cek status spesifik di period_statuses
          const statusesSnap = await getDoc(
            doc(db, "settings", "period_statuses"),
          );
          if (statusesSnap.exists() && statusesSnap.data()[periodKey]) {
            currentStatus = statusesSnap.data()[periodKey];
          }
        }

        setPeriodStatus(currentStatus);
        setIsLocked(isPeriodeLocked(currentStatus));

        // 2. Fetch Master Data Puskesmas
        const puskesmasSnap = await getDocs(collection(db, "puskesmas"));
        const pkmMap = new Map();
        puskesmasSnap.forEach((d) => {
          const pData = d.data();
          pkmMap.set(d.id, {
            id: d.id,
            nama: pData.nama || d.id,
            kecamatan: pData.kecamatan || "",
            sasaranBumil: pData.sasaranBumil || 0,
            sasaranBulin: pData.sasaranBulin || 0,
          });
        });

        // 3. Fetch Data Laporan ANC Periode Terpilih
        const reportsSnap = await getDocs(collection(db, collectionName));
        const map = {};
        reportsSnap.forEach((d) => {
          if (d.id !== "_info") {
            map[d.id] = d.data();
          }
        });
        setAncDataMap(map);

        // 4. Gabungkan Master Puskesmas dengan Data Laporan ANC
        const combined = [];
        pkmMap.forEach((pkmInfo, pkmId) => {
          const repData = map[pkmId] || {};
          const k1Murni = Number(repData.k1Murni || 0);
          const k1Lebih12Minggu = Number(repData.k1Lebih12Minggu || 0);
          const k1Akses =
            repData.k1Akses !== undefined
              ? Number(repData.k1Akses)
              : k1Murni + k1Lebih12Minggu;
          const anemiaRingan = Number(repData.anemiaRingan || 0);
          const anemiaSedang = Number(repData.anemiaSedang || 0);
          const anemiaBerat = Number(repData.anemiaBerat || 0);
          const totalAnemia =
            repData.totalAnemia !== undefined
              ? Number(repData.totalAnemia)
              : anemiaRingan + anemiaSedang + anemiaBerat;

          combined.push({
            ...TEMPLATE_KOLOM_ANC,
            ...repData,
            puskesmasId: pkmId,
            namaPuskesmas: pkmInfo.nama,
            kecamatan: pkmInfo.kecamatan,
            sasaranBumil: Number(
              repData.sasaranBumil || pkmInfo.sasaranBumil || 0,
            ),
            sasaranBulin: Number(
              repData.sasaranBulin || pkmInfo.sasaranBulin || 0,
            ),
            k1Akses,
            totalAnemia,
            [STATUS_FIELD]: repData[STATUS_FIELD] || "draft",
          });
        });

        combined.sort((a, b) => a.namaPuskesmas.localeCompare(b.namaPuskesmas));
        setReportList(combined);
      } catch (err) {
        console.error("Error fetching ANC data by period:", err);
        setError(
          "Gagal memuat data laporan ANC periode terpilih: " + err.message,
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedMonth, selectedYear],
  );

  // Sync instan status periode jika periodStatusesMap berubah via realtime snapshot
  useEffect(() => {
    if (!selectedYear || !selectedMonth) return;

    const periodKey = `${selectedYear}-${selectedMonth}`;
    const newStatus = periodStatusesMap[periodKey] || "inactive"; // Fallback jika key belum ada

    setPeriodStatus(newStatus);
    setIsLocked(isPeriodeLocked(newStatus));
  }, [periodStatusesMap, selectedMonth, selectedYear]);

  // Restore/Reset data inputan Puskesmas ke versi draf awal
  const restorePreviousData = useCallback(
    async (month = selectedMonth, year = selectedYear, puskesmasId) => {
      if (!puskesmasId) return false;
      try {
        const collectionName = getAncCollectionName(year, month);
        const reportRef = doc(db, collectionName, puskesmasId);

        const resetPayload = {
          ...TEMPLATE_KOLOM_ANC,
          puskesmasId,
          [STATUS_FIELD]: STATUS_DRAFT,
          restoredAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(reportRef, resetPayload, { merge: true });
        await fetchAncData(month, year);
        return true;
      } catch (err) {
        console.error("Error restoring previous data:", err);
        throw err;
      }
    },
    [selectedMonth, selectedYear, fetchAncData],
  );

  useEffect(() => {
    fetchAncData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, fetchAncData]);

  return {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    ancDataMap,
    reportList,
    periodStatus,
    periodStatusesMap,
    isLocked,
    loading,
    error,
    refetch: fetchAncData,
    restorePreviousData,
  };
}
