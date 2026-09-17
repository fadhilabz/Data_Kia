// hooks/useMasterPuskesmas.js
//
// Sasaran (jumlah penduduk, Bumil, WUS, Bulin) BEDA tiap bulan dan bisa
// diedit ulang. Disimpan LANGSUNG di dokumen laporan bulan itu:
// - jumlahPenduduk, sasaranBumil, sasaranWus -> semua disimpan di dokumen ANC
//   ({thn}_{bln}_anc)
// - sasaranBulin -> disimpan di dokumen PNC ({thn}_{bln}_pnc)
//
// Kenapa langsung ke dokumen laporan (bukan bikin collection baru)?
// Supaya TIDAK PERLU ubah kode PncTable/AncTable & hook lain — mereka
// sudah baca field sasaranBumil/sasaranBulin dari dokumen laporan yang
// sama persis.

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useManajemenPeriode } from "@/hooks/useManajemenPeriode";
import { DAFTAR_BULAN, STATUS_TERKUNCI } from "@/constants/periode";
import { getAncCollectionName } from "@/lib/ibu/anc/ancConfig";
import { getPncCollectionName } from "@/lib/ibu/pnc/pncConfig";

export function useDataSasaranPeriode() {
  const {
    selectedYear,
    openedMonths,
    statusPeriodeMap: rawStatusMap,
    activeMonth,
    loading: periodeLoading,
  } = useManajemenPeriode();

  const [selectedMonth, setSelectedMonthState] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // ---- Default selectedMonth = bulan aktif ----
  useEffect(() => {
    if (periodeLoading) return;
    if (activeMonth) {
      setSelectedMonthState((prev) => prev ?? activeMonth);
    }
  }, [periodeLoading, activeMonth]);

  // ---- Peta status per bulan untuk PeriodeBulanCard ----
  const periodStatusesMap = {};
  DAFTAR_BULAN.forEach((b) => {
    const periodId = `${selectedYear}-${b.id}`;
    periodStatusesMap[b.id] = rawStatusMap?.[periodId] ?? STATUS_TERKUNCI;
  });

  // ---- Periode terpilih sudah dibuka atau belum ----
  const periodeSudahDibuka = selectedMonth
    ? openedMonths.includes(selectedMonth)
    : false;

  // ---- Ambil data: semua Puskesmas + sasaran bulan terpilih dari doc ANC & PNC ----
  const loadRows = useCallback(async (year, month) => {
    if (!year || !month) return;
    setLoading(true);
    try {
      const puskesmasSnap = await getDocs(collection(db, "puskesmas"));
      const ancCollectionName = getAncCollectionName(year, month);
      const pncCollectionName = getPncCollectionName(year, month);

      const data = await Promise.all(
        puskesmasSnap.docs.map(async (pDoc) => {
          const pData = pDoc.data();
          const ancRef = doc(db, ancCollectionName, pDoc.id);
          const pncRef = doc(db, pncCollectionName, pDoc.id);
          const [ancSnap, pncSnap] = await Promise.all([
            getDoc(ancRef),
            getDoc(pncRef),
          ]);
          const ancData = ancSnap.exists() ? ancSnap.data() : {};
          const pncData = pncSnap.exists() ? pncSnap.data() : {};

          return {
            id: pDoc.id,
            nama: pData.nama || pDoc.id,
            // Semua tiga field ini sekarang dibaca dari dokumen ANC
            jumlahPenduduk: ancData.jumlahPenduduk ?? pData.jumlahPenduduk ?? 0,
            sasaranBumil: ancData.sasaranBumil ?? pData.sasaranBumil ?? 0,
            sasaranWus: ancData.sasaranWus ?? pData.sasaranWus ?? 0,
            // Hanya sasaranBulin yang dibaca dari dokumen PNC
            sasaranBulin: pncData.sasaranBulin ?? pData.sasaranBulin ?? 0,
          };
        }),
      );

      data.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
      setRows(data);
    } catch (err) {
      console.error("useDataSasaranPeriode loadRows error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedYear && selectedMonth) {
      loadRows(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth, loadRows]);

  const updateLocalValue = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  // ---- Simpan satu baris: tulis ke doc ANC (jumlahPenduduk, sasaranBumil, sasaranWus)
  //      & doc PNC (sasaranBulin saja) ----
  const saveRow = async (row) => {
    if (!selectedYear || !selectedMonth) return false;
    if (!periodeSudahDibuka) return false;

    setSavingId(row.id);
    try {
      const ancCollectionName = getAncCollectionName(
        selectedYear,
        selectedMonth,
      );
      const pncCollectionName = getPncCollectionName(
        selectedYear,
        selectedMonth,
      );

      await Promise.all([
        setDoc(
          doc(db, ancCollectionName, row.id),
          {
            jumlahPenduduk: Number(row.jumlahPenduduk) || 0,
            sasaranBumil: Number(row.sasaranBumil) || 0,
            sasaranWus: Number(row.sasaranWus) || 0,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        ),
        setDoc(
          doc(db, pncCollectionName, row.id),
          {
            sasaranBulin: Number(row.sasaranBulin) || 0,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        ),
      ]);
      return true;
    } catch (err) {
      console.error("useDataSasaranPeriode saveRow error:", err);
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const setSelectedMonth = (monthValue) => setSelectedMonthState(monthValue);

  return {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    periodStatusesMap,
    activeMonth,
    periodeSudahDibuka,
    rows,
    loading,
    savingId,
    updateLocalValue,
    saveRow,
  };
}
