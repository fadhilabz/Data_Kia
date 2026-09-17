// app/admin/dataMtbm/page.js
//
// Rekap admin modul MTBM — SATU FILE lengkap, pola sama persis dengan
// app/admin/dataMtbs/page.js. Field HARUS SAMA PERSIS dengan
// app/dashboard/mtbm/page.js — kalau field di sana diubah, ubah juga di sini.

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useManajemenPeriode } from "@/hooks/useManajemenPeriode";
import { DAFTAR_BULAN, STATUS_TERKUNCI, formatPeriode } from "@/constants/periode";
import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";

// =====================================================================
// FIELD DEFINITION — HARUS SAMA PERSIS dengan dashboard/mtbm/page.js
// =====================================================================

const MTBM_INFO_FIELDS = [
  { key: "sasaranBayi011", label: "Sasaran Bayi 0-11 Bulan (Manual)" },
  { key: "kunjunganNeonatalLengkap", label: "Kunjungan Neonatal Lengkap" },
  { key: "kunjunganBayi02Bulan", label: "Kunjungan Bayi 0-2 Bulan" },
  { key: "kunjunganBayi02BulanDilayaniMtbm", label: "Kunjungan Bayi 0-2 Bulan Dilayani MTBM" },
];

const MTBM_ITEM = [
  { key: "infeksiSangatBerat", label: "Penyakit Sangat Berat / Infeksi Bakteri Berat", group: "Klasifikasi Infeksi Bakteri" },
  { key: "infeksiBakteriLokal", label: "Infeksi Bakteri Lokal", group: "Klasifikasi Infeksi Bakteri" },
  { key: "infeksiMungkinBukan", label: "Mungkin Bukan Infeksi", group: "Klasifikasi Infeksi Bakteri" },
  { key: "ikterusBerat", label: "Ikterus Berat", group: "Ikterus" },
  { key: "ikterus", label: "Ikterus", group: "Ikterus" },
  { key: "tidakIkterus", label: "Tidak Ada Ikterus", group: "Ikterus" },
  { key: "diareDehidrasiBerat", label: "Dehidrasi Berat", group: "Diare" },
  { key: "diareDehidrasiRinganBerat", label: "Dehidrasi Ringan/Berat", group: "Diare" },
  { key: "diareTanpaDehidrasi", label: "Tanpa Dehidrasi", group: "Diare" },

  { key: "hivTerkonfirmasi", label: "Infeksi HIV Terkonfirmasi", group: "Status HIV" },
  { key: "hivTerpajanMungkin", label: "Terpajan HIV: Mungkin Infeksi HIV", group: "Status HIV" },
  { key: "hivTidakDiketahui", label: "Infeksi HIV Tidak Diketahui", group: "Status HIV" },
  { key: "hivBukanInfeksi", label: "Bukan Infeksi HIV", group: "Status HIV" },
  { key: "bbAwalSangatRendah", label: "BB Sangat Rendah Menurut Umur", group: "Berat Badan (Kunjungan Awal)" },
  { key: "bbAwalRendahMasalahAsi", label: "BB Rendah / Masalah ASI", group: "Berat Badan (Kunjungan Awal)" },
  { key: "bbAwalTidakRendah", label: "BB Tidak Rendah & Tidak Ada Masalah ASI", group: "Berat Badan (Kunjungan Awal)" },
  { key: "bbUlangSangatRendah", label: "BB Sangat Rendah Menurut Umur", group: "Berat Badan (Kunjungan Ulang)" },
  { key: "bbUlangRendahMasalahAsi", label: "BB Rendah / Masalah ASI", group: "Berat Badan (Kunjungan Ulang)" },
  { key: "bbUlangTidakRendah", label: "BB Tidak Rendah & Tidak Ada Masalah ASI", group: "Berat Badan (Kunjungan Ulang)" },

  { key: "vitaminK1", label: "Pemberian Vitamin K1 Hari Ini", group: "Tindakan Hari Ini" },
  { key: "imunisasiHariIni", label: "Pemberian Imunisasi Hari Ini", group: "Tindakan Hari Ini" },
  { key: "sampelShk", label: "Pengambilan Sampel SHK Hari Ini", group: "Tindakan Hari Ini" },
  { key: "masalahKeluhanBayi", label: "Masalah/Keluhan Lain pada Bayi", group: "Masalah / Konseling" },
  { key: "masalahKeluhanIbu", label: "Masalah/Keluhan Ibu", group: "Masalah / Konseling" },
  { key: "konselingMenyusui", label: "Konseling Cara Menyusui", group: "Masalah / Konseling" },
  { key: "rujukanDalamGedung", label: "Rujukan Dalam Gedung", group: "Rujukan" },
  { key: "rujukanLuarGedung", label: "Rujukan Luar Gedung", group: "Rujukan" },
];

const MTBM_CATATAN_FIELD = { key: "keterangan", label: "Keterangan" };

function getMtbmCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_mtbm`;
}
function getSasaranAnakCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_sasaran_anak`;
}

function hitungCakupan(row) {
  const kunjungan = Number(row.kunjunganBayi02Bulan) || 0;
  const dilayani = Number(row.kunjunganBayi02BulanDilayaniMtbm) || 0;
  return kunjungan > 0 ? ((dilayani / kunjungan) * 100).toFixed(1) : "-";
}

function buildHeaderRuns(fields) {
  const runs = [];
  let i = 0;
  while (i < fields.length) {
    const f = fields[i];
    let j = i;
    const groupFields = [];
    while (j < fields.length && fields[j].group === f.group) {
      groupFields.push(fields[j]);
      j++;
    }
    runs.push({ group: f.group, fields: groupFields });
    i = j;
  }
  return runs;
}

// =====================================================================
// HOOK ADMIN
// =====================================================================

function useMtbmPeriodAdmin() {
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
      const puskesmasSnap = await getDocs(collection(db, "puskesmas"));
      const mtbmCollectionName = getMtbmCollectionName(year, month);
      const sasaranCollectionName = getSasaranAnakCollectionName(year, month);

      const rows = await Promise.all(
        puskesmasSnap.docs.map(async (pDoc) => {
          const pData = pDoc.data();
          try {
            const [reportSnap, sasaranSnap] = await Promise.all([
              getDoc(doc(db, mtbmCollectionName, pDoc.id)),
              getDoc(doc(db, sasaranCollectionName, pDoc.id)),
            ]);
            const reportData = reportSnap.exists() ? reportSnap.data() : {};
            const sasaranData = sasaranSnap.exists() ? sasaranSnap.data() : {};
            return {
              id: pDoc.id,
              namaPuskesmas: pData.nama || pDoc.id,
              sasaranKelahiranHidup: Number(sasaranData.sasaranKelahiranHidup) || 0,
              ...reportData,
            };
          } catch (err) {
            console.error(`useMtbmPeriodAdmin: gagal baca ${pDoc.id}:`, err);
            return { id: pDoc.id, namaPuskesmas: pData.nama || pDoc.id, sasaranKelahiranHidup: 0 };
          }
        })
      );

      rows.sort((a, b) => (a.namaPuskesmas || "").localeCompare(b.namaPuskesmas || ""));
      setReportList(rows);
    } catch (err) {
      console.error("useMtbmPeriodAdmin loadReportList error:", err);
      setReportList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedYear && selectedMonth) loadReportList(selectedYear, selectedMonth);
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

// =====================================================================
// EXPORT EXCEL
// =====================================================================

function useMtbmExport() {
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async (reportList, { bulan, tahun }) => {
    if (!reportList || reportList.length === 0) return;
    setExporting(true);
    try {
      const XLSX = await import("xlsx");

      const headerRow = [
        "NO", "NAMA PUSKESMAS", "SASARAN KELAHIRAN HIDUP",
        ...MTBM_INFO_FIELDS.map((f) => f.label),
        "Cakupan Dilayani MTBM (%)",
        ...MTBM_ITEM.map((f) => `${f.group} - ${f.label}`),
        MTBM_CATATAN_FIELD.label,
      ];

      const dataRows = reportList.map((row, idx) => [
        idx + 1,
        row.namaPuskesmas,
        row.sasaranKelahiranHidup,
        ...MTBM_INFO_FIELDS.map((f) => Number(row[f.key]) || 0),
        hitungCakupan(row),
        ...MTBM_ITEM.map((f) => Number(row[f.key]) || 0),
        row[MTBM_CATATAN_FIELD.key] || "",
      ]);

      const sheetData = [headerRow, ...dataRows];
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap MTBM");

      const NAMA_BULAN = { "01":"Januari","02":"Februari","03":"Maret","04":"April","05":"Mei","06":"Juni","07":"Juli","08":"Agustus","09":"September","10":"Oktober","11":"November","12":"Desember" };
      XLSX.writeFile(workbook, `Rekap_MTBM_${NAMA_BULAN[bulan] || bulan}_${tahun}.xlsx`);
    } catch (err) {
      console.error("useMtbmExport handleExportExcel error:", err);
    } finally {
      setExporting(false);
    }
  };

  return { handleExportExcel, exporting };
}

// =====================================================================
// TABEL
// =====================================================================

function MtbmTable({ reportList = [], searchQuery = "", zoomLevel = 100 }) {
  const filteredList = reportList.filter((row) =>
    (row.namaPuskesmas || row.id || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );
  const cellStyle = { fontSize: `${zoomLevel}%` };
  const headerRuns = buildHeaderRuns(MTBM_ITEM);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
      <table className="border-collapse w-full text-xs" style={cellStyle}>
        <thead className="sticky top-0 z-10 bg-emerald-50">
          <tr>
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 bg-emerald-100">NO</th>
            <th rowSpan={2} className="border border-gray-300 px-3 py-2 min-w-[10rem] bg-emerald-100 text-left">NAMA PUSKESMAS</th>
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[5rem] bg-emerald-100">SASARAN KELAHIRAN HIDUP</th>
            {MTBM_INFO_FIELDS.map((f) => (
              <th key={f.key} rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[6rem] bg-emerald-100">{f.label}</th>
            ))}
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[5rem] bg-emerald-100">Cakupan Dilayani (%)</th>
            {headerRuns.map((run, idx) => (
              <th key={`grp-${idx}`} colSpan={run.fields.length} className="border border-gray-300 px-2 py-2 bg-emerald-100">
                {run.group}
              </th>
            ))}
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[8rem] bg-emerald-100">Keterangan</th>
          </tr>
          <tr>
            {MTBM_ITEM.map((f) => (
              <th key={f.key} className="border border-gray-300 px-1 py-1 bg-emerald-50 min-w-[5rem]">{f.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredList.length === 0 && (
            <tr>
              <td colSpan={9 + MTBM_ITEM.length} className="border border-gray-300 px-3 py-6 text-center text-gray-400">
                Belum ada data laporan MTBM untuk periode ini.
              </td>
            </tr>
          )}
          {filteredList.map((row, idx) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
              <td className="border border-gray-300 px-3 py-1 text-left font-medium">{row.namaPuskesmas}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.sasaranKelahiranHidup}</td>
              {MTBM_INFO_FIELDS.map((f) => (
                <td key={f.key} className="border border-gray-300 px-2 py-1 text-center">{Number(row[f.key]) || 0}</td>
              ))}
              <td className="border border-gray-300 px-2 py-1 text-center font-semibold">{hitungCakupan(row)}</td>
              {MTBM_ITEM.map((f) => (
                <td key={f.key} className="border border-gray-300 px-1 py-1 text-center">{Number(row[f.key]) || 0}</td>
              ))}
              <td className="border border-gray-300 px-2 py-1 text-left">{row[MTBM_CATATAN_FIELD.key] || ""}</td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-emerald-100 font-bold">
            <td className="border border-gray-300 px-2 py-2" colSpan={3}>TOTAL</td>
            {MTBM_INFO_FIELDS.map((f) => (
              <td key={f.key} className="border border-gray-300 px-2 py-2 text-center">
                {reportList.reduce((sum, row) => sum + (Number(row[f.key]) || 0), 0)}
              </td>
            ))}
            <td className="border border-gray-300 px-2 py-2"></td>
            {MTBM_ITEM.map((f) => (
              <td key={f.key} className="border border-gray-300 px-1 py-2 text-center">
                {reportList.reduce((sum, row) => sum + (Number(row[f.key]) || 0), 0)}
              </td>
            ))}
            <td className="border border-gray-300 px-2 py-2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// =====================================================================
// HALAMAN
// =====================================================================

export default function DataMtbmPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    selectedMonth, setSelectedMonth, selectedYear, reportList, loading,
    periodStatusesMap = {}, activePeriodData,
  } = useMtbmPeriodAdmin();

  const { handleExportExcel, exporting } = useMtbmExport();

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoomLevel(100);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium text-xs">Memuat Laporan Data MTBM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen bg-gray-100 transition-all space-y-5 ${isFullscreen ? "fixed inset-0 z-50 overflow-auto ml-0 p-4 bg-white" : ""}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">table_chart</span>
            Rekapitulasi Data MTBM Kota Baubau
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Periode Laporan:{" "}
            <span className="font-semibold text-emerald-700">
              {selectedYear && selectedMonth ? formatPeriode(selectedYear, selectedMonth) : "-"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-xs text-gray-400">search</span>
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Puskesmas..."
              className="pl-8 pr-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700 border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 w-44"
            />
          </div>
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-300 shadow-inner">
            <button type="button" onClick={handleZoomOut} className="p-1 hover:bg-white rounded text-gray-700"><span className="material-symbols-outlined text-sm">zoom_out</span></button>
            <button type="button" onClick={handleResetZoom} className="px-2 text-xs font-semibold text-gray-700 hover:text-emerald-600 min-w-[45px] text-center">{zoomLevel}%</button>
            <button type="button" onClick={handleZoomIn} className="p-1 hover:bg-white rounded text-gray-700"><span className="material-symbols-outlined text-sm">zoom_in</span></button>
          </div>
          <button
            type="button" onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">{isFullscreen ? "fullscreen_exit" : "fullscreen"}</span>
            <span>{isFullscreen ? "Keluar Review" : "Review Mode"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportExcel(reportList, { bulan: selectedMonth, tahun: selectedYear })}
            disabled={exporting || reportList.length === 0}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            {exporting ? "Menyiapkan..." : "Export .xlsx"}
          </button>
        </div>
      </div>

      <PeriodeBulanCard
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        year={selectedYear}
        statusPeriodeMap={periodStatusesMap}
        activeMonth={activePeriodData?.bulan || selectedMonth}
      />

      <MtbmTable reportList={reportList} searchQuery={searchQuery} zoomLevel={zoomLevel} />
    </div>
  );
}