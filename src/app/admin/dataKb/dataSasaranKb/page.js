// app/admin/dataSasaranKb/page.js
//
// Modul "Sasaran KB" — SATU FILE lengkap, pola sama persis dengan
// admin/dataSasaranAnak/page.js. Field: PUS (Pasangan Usia Subur),
// PUS 4T (Terlalu Muda/Tua/Dekat/Banyak), Sasaran Ibu Bersalin.
//
// Sasaran ini per-bulan dan bisa diedit ulang (sama seperti pola Sasaran
// Balita), disimpan di collection sendiri {tahun}_{bulan}_sasaran_kb
// (TERPISAH dari collection sasaran Data Ibu/Data Anak, karena modul
// KESPROCATIN & KB ini kemungkinan jadi aplikasi/menu tersendiri).

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
import { DAFTAR_BULAN, STATUS_TERKUNCI, formatPeriode } from "@/constants/periode";
import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";

// =====================================================================
// FIELD & CONFIG
// =====================================================================

const SASARAN_KB_FIELDS = [
  { key: "pus", label: "PUS (Pasangan Usia Subur)" },
  { key: "pus4T", label: "PUS 4T" },
  { key: "sasaranBulin", label: "Sasaran Ibu Bersalin" },
];

function getSasaranKbCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_sasaran_kb`;
}

function formatRibuan(n) {
  return Number(n || 0).toLocaleString("id-ID");
}

// =====================================================================
// HOOK
// =====================================================================

function useSasaranKbPeriode() {
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

  const periodeSudahDibuka = selectedMonth ? openedMonths.includes(selectedMonth) : false;

  const loadRows = useCallback(async (year, month) => {
    if (!year || !month) return;
    setLoading(true);
    try {
      const puskesmasSnap = await getDocs(collection(db, "puskesmas"));
      const collectionName = getSasaranKbCollectionName(year, month);

      const data = await Promise.all(
        puskesmasSnap.docs.map(async (pDoc) => {
          const pData = pDoc.data();
          const reportRef = doc(db, collectionName, pDoc.id);
          const reportSnap = await getDoc(reportRef);
          const reportData = reportSnap.exists() ? reportSnap.data() : {};

          const row = { id: pDoc.id, nama: pData.nama || pDoc.id };
          SASARAN_KB_FIELDS.forEach((f) => {
            row[f.key] = reportData[f.key] ?? 0;
          });
          return row;
        })
      );

      data.sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
      setRows(data);
    } catch (err) {
      console.error("useSasaranKbPeriode loadRows error:", err);
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
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const saveRow = async (row) => {
    if (!selectedYear || !selectedMonth) return false;
    if (!periodeSudahDibuka) return false;

    setSavingId(row.id);
    try {
      const collectionName = getSasaranKbCollectionName(selectedYear, selectedMonth);
      const payload = { updatedAt: serverTimestamp() };
      SASARAN_KB_FIELDS.forEach((f) => {
        payload[f.key] = Number(row[f.key]) || 0;
      });
      await setDoc(doc(db, collectionName, row.id), payload, { merge: true });
      return true;
    } catch (err) {
      console.error("useSasaranKbPeriode saveRow error:", err);
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

// =====================================================================
// HALAMAN
// =====================================================================

export default function DataSasaranKbPage() {
  const {
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
  } = useSasaranKbPeriode();

  const [savedFlash, setSavedFlash] = useState(null);

  const handleSave = async (row) => {
    const ok = await saveRow(row);
    setSavedFlash({ id: row.id, ok });
    setTimeout(() => setSavedFlash(null), 2000);
  };

  const totals = rows.reduce((acc, row) => {
    SASARAN_KB_FIELDS.forEach((f) => {
      acc[f.key] = (acc[f.key] || 0) + (Number(row[f.key]) || 0);
    });
    return acc;
  }, {});

  return (
    <div className="p-6 min-h-screen bg-gray-100 space-y-5">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">diversity_1</span>
          Data Sasaran KB per Puskesmas
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Periode:{" "}
          <span className="font-semibold text-emerald-700">
            {selectedYear && selectedMonth ? formatPeriode(selectedYear, selectedMonth) : "-"}
          </span>
          {" — "}sasaran bisa beda tiap bulan, ubah nilainya lalu klik <strong>Simpan</strong> per baris.
        </p>
      </div>

      <PeriodeBulanCard
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        year={selectedYear}
        statusPeriodeMap={periodStatusesMap}
        activeMonth={activeMonth || selectedMonth}
      />

      {!periodeSudahDibuka && selectedMonth && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-amber-800">
          Periode ini belum dibuka. Buka dulu lewat menu <strong>Periode Pelaporan</strong> sebelum bisa mengedit
          Sasaran KB untuk bulan ini.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
          <table className="border-collapse w-full text-sm">
            <thead className="bg-emerald-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 min-w-[2.5rem]">NO.</th>
                <th className="border border-gray-300 px-3 py-2 min-w-[12rem] text-left">NAMA PUSKESMAS</th>
                {SASARAN_KB_FIELDS.map((f) => (
                  <th key={f.key} className="border border-gray-300 px-3 py-2 min-w-[10rem]">
                    {f.label}
                  </th>
                ))}
                <th className="border border-gray-300 px-3 py-2 min-w-[6rem]"></th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3 + SASARAN_KB_FIELDS.length} className="border border-gray-300 px-3 py-6 text-center text-gray-400">
                    Belum ada data Puskesmas terdaftar.
                  </td>
                </tr>
              )}

              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 text-center">{idx + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 font-medium">{row.nama}</td>
                  {SASARAN_KB_FIELDS.map((f) => (
                    <td key={f.key} className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        value={row[f.key]}
                        disabled={!periodeSudahDibuka}
                        onChange={(e) => updateLocalValue(row.id, f.key, e.target.value)}
                        className="w-full px-2 py-1 rounded border border-gray-300 text-right text-sm disabled:bg-gray-100"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleSave(row)}
                      disabled={!periodeSudahDibuka || savingId === row.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {savingId === row.id ? "..." : "Simpan"}
                    </button>
                    {savedFlash?.id === row.id && (
                      <span className={`block text-[10px] mt-1 ${savedFlash.ok ? "text-emerald-600" : "text-red-600"}`}>
                        {savedFlash.ok ? "Tersimpan" : "Gagal"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-emerald-100 font-bold">
                <td className="border border-gray-300 px-3 py-2" colSpan={2}>
                  TOTAL
                </td>
                {SASARAN_KB_FIELDS.map((f) => (
                  <td key={f.key} className="border border-gray-300 px-3 py-2 text-right">
                    {formatRibuan(totals[f.key])}
                  </td>
                ))}
                <td className="border border-gray-300 px-3 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}