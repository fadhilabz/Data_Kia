// app/admin/dataMtbs/page.js
//
// Rekap admin modul MTBS — SATU FILE lengkap, pola sama persis dengan
// app/admin/dataKn/page.js. Field HARUS SAMA PERSIS dengan
// app/dashboard/mtbs/page.js — kalau field di sana diubah, ubah juga di sini.

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useManajemenPeriode } from "@/hooks/useManajemenPeriode";
import { DAFTAR_BULAN, STATUS_TERKUNCI, formatPeriode } from "@/constants/periode";
import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";

// =====================================================================
// FIELD DEFINITION — HARUS SAMA PERSIS dengan dashboard/mtbs/page.js
// =====================================================================

const MTBS_INFO_FIELDS = [
  { key: "balitaSakitBerkunjung", label: "Balita Sakit Berkunjung" },
  { key: "balitaSakitDilayaniMtbs", label: "Balita Sakit Dilayani MTBS" },
  { key: "puskesmasMelaksanakanMtbs", label: "Puskesmas Melaksanakan MTBS" },
  { key: "tenagaTerlatihMtbs", label: "Tenaga Terlatih MTBS" },
];

const MTBS_DIAGNOSA = [
  { key: "sagaGagalJantungParu", label: "Gagal Jantung Paru", group: "Tanda Bahaya Umum (SAGA)" },
  { key: "sagaPenyakitSangatBerat", label: "Penyakit Sangat Berat", group: "Tanda Bahaya Umum (SAGA)" },
  { key: "sagaStabil", label: "Stabil", group: "Tanda Bahaya Umum (SAGA)" },
  { key: "batukTarikanDinding", label: "Tarikan Dinding Dada Kedalam (+/-)", group: "Batuk / Sukar Bernafas" },
  { key: "batukPneumoniaBerat", label: "Pneumonia Berat", group: "Batuk / Sukar Bernafas" },
  { key: "batukPneumonia", label: "Pneumonia", group: "Batuk / Sukar Bernafas" },
  { key: "batukBukanPneumonia", label: "Batuk Bukan Pneumonia", group: "Batuk / Sukar Bernafas" },
  { key: "diareDehidrasiBerat", label: "Diare Dehidrasi Berat", group: "Diare" },
  { key: "diareDehidrasiRinganSedang", label: "Diare Dehidrasi Ringan/Sedang", group: "Diare" },
  { key: "diareTanpaDehidrasi", label: "Diare Tanpa Dehidrasi", group: "Diare" },
  { key: "diarePersistenBerat", label: "Diare Persisten Berat", group: "Diare" },
  { key: "diarePersisten", label: "Diare Persisten", group: "Diare" },
  { key: "disentri", label: "Disentri", group: "Diare" },

  { key: "demamMalariaBeratDgnDemam", label: "Penyakit Berat dengan Demam (Malaria)", group: "Demam - Malaria (Endemis)" },
  { key: "demamMalaria", label: "Malaria", group: "Demam - Malaria (Endemis)" },
  { key: "demamMungkinBukanMalaria", label: "Demam Mungkin Bukan Malaria", group: "Demam - Malaria (Endemis)" },
  { key: "demamNonEndemisBerat", label: "Penyakit Berat dengan Demam", group: "Demam - Non Endemis" },
  { key: "demamBukanMalaria", label: "Demam Bukan Malaria", group: "Demam - Non Endemis" },
  { key: "campakKomplikasiBerat", label: "Campak dengan Komplikasi Berat", group: "Campak" },
  { key: "campakKomplikasiMataMulut", label: "Campak dengan Komplikasi Mata/Mulut", group: "Campak" },
  { key: "campak", label: "Campak", group: "Campak" },
  { key: "dengueBerat", label: "Dengue Berat", group: "Demam 2-7 Hari (Dengue)" },
  { key: "dengueWarningSign", label: "Dengue dengan Warning Sign", group: "Demam 2-7 Hari (Dengue)" },
  { key: "dengueTanpaWarningSign", label: "Dengue Tanpa Warning Sign", group: "Demam 2-7 Hari (Dengue)" },
  { key: "demamMungkinBukanDengue", label: "Demam Mungkin Bukan Dengue", group: "Demam 2-7 Hari (Dengue)" },

  { key: "telingaMastoiditis", label: "Mastoiditis", group: "Masalah Telinga" },
  { key: "telingaInfeksiAkut", label: "Infeksi Telinga Akut", group: "Masalah Telinga" },
  { key: "telingaInfeksiKronis", label: "Infeksi Telinga Kronis", group: "Masalah Telinga" },
  { key: "telingaTidakInfeksi", label: "Tidak Ada Infeksi Telinga", group: "Masalah Telinga" },
  { key: "giziBurukKomplikasi", label: "Gizi Buruk dengan Komplikasi", group: "Status Gizi" },
  { key: "giziBurukTanpaKomplikasi", label: "Gizi Buruk Tanpa Komplikasi", group: "Status Gizi" },
  { key: "giziKurang", label: "Gizi Kurang", group: "Status Gizi" },
  { key: "giziBaik", label: "Gizi Baik", group: "Status Gizi" },
  { key: "obesitas", label: "Obesitas", group: "Status Gizi" },
  { key: "giziLebih", label: "Gizi Lebih", group: "Status Gizi" },
  { key: "beresikoGiziLebih", label: "Beresiko Gizi Lebih", group: "Status Gizi" },

  { key: "anemiaBerat", label: "Anemia Berat", group: "Anemia" },
  { key: "anemi", label: "Anemi", group: "Anemia" },
  { key: "tidakAnemi", label: "Tidak Anemi", group: "Anemia" },
  { key: "tumbuhSangatPendek", label: "Sangat Pendek (Severely Stunted)", group: "Status Pertumbuhan" },
  { key: "tumbuhPendek", label: "Pendek (Stunted)", group: "Status Pertumbuhan" },
  { key: "tumbuhNormal", label: "Normal", group: "Status Pertumbuhan" },
  { key: "tumbuhTinggi", label: "Tinggi (Tall)", group: "Status Pertumbuhan" },
  { key: "kepalaMakrosefali", label: "Makro Sefali", group: "Lingkar Kepala" },
  { key: "kepalaNormal", label: "Normal", group: "Lingkar Kepala" },
  { key: "kepalaMikrosefali", label: "Mikro Sefali", group: "Lingkar Kepala" },

  { key: "hivTerkonfirmasi", label: "Infeksi HIV Terkonfirmasi", group: "Status HIV" },
  { key: "hivTerpajan", label: "Terpajan HIV", group: "Status HIV" },
  { key: "hivDiduga", label: "Diduga Terinfeksi HIV", group: "Status HIV" },
  { key: "hivMungkinBukan", label: "Mungkin Bukan Infeksi HIV", group: "Status HIV" },
  { key: "masalahKeluhanLain", label: "Masalah atau Keluhan Lain", group: "Lain-lain" },
  { key: "rujukanDalamGedung", label: "Rujukan Dalam Gedung", group: "Rujukan" },
  { key: "rujukanLuarGedung", label: "Rujukan Luar Gedung", group: "Rujukan" },
];

const MTBS_CATATAN_FIELD = { key: "keterangan", label: "Keterangan" };

function getMtbsCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_mtbs`;
}
function getSasaranAnakCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_sasaran_anak`;
}

function hitungCakupanDilayani(row) {
  const berkunjung = Number(row.balitaSakitBerkunjung) || 0;
  const dilayani = Number(row.balitaSakitDilayaniMtbs) || 0;
  return berkunjung > 0 ? ((dilayani / berkunjung) * 100).toFixed(1) : "-";
}
function hitungCakupanSasaran(row, sasaranBalita059) {
  const dilayani = Number(row.balitaSakitDilayaniMtbs) || 0;
  return sasaranBalita059 > 0 ? ((dilayani / sasaranBalita059) * 100).toFixed(1) : "-";
}

// ---- Kelompokkan diagnosa per grup, urutan tetap sesuai array asli ----
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

function useMtbsPeriodAdmin() {
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
      const mtbsCollectionName = getMtbsCollectionName(year, month);
      const sasaranCollectionName = getSasaranAnakCollectionName(year, month);

      const rows = await Promise.all(
        puskesmasSnap.docs.map(async (pDoc) => {
          const pData = pDoc.data();
          try {
            const [reportSnap, sasaranSnap] = await Promise.all([
              getDoc(doc(db, mtbsCollectionName, pDoc.id)),
              getDoc(doc(db, sasaranCollectionName, pDoc.id)),
            ]);
            const reportData = reportSnap.exists() ? reportSnap.data() : {};
            const sasaranData = sasaranSnap.exists() ? sasaranSnap.data() : {};
            return {
              id: pDoc.id,
              namaPuskesmas: pData.nama || pDoc.id,
              sasaranBalita059: Number(sasaranData.sasaranBalita059) || 0,
              ...reportData,
            };
          } catch (err) {
            console.error(`useMtbsPeriodAdmin: gagal baca ${pDoc.id}:`, err);
            return { id: pDoc.id, namaPuskesmas: pData.nama || pDoc.id, sasaranBalita059: 0 };
          }
        })
      );

      rows.sort((a, b) => (a.namaPuskesmas || "").localeCompare(b.namaPuskesmas || ""));
      setReportList(rows);
    } catch (err) {
      console.error("useMtbsPeriodAdmin loadReportList error:", err);
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

function useMtbsExport() {
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async (reportList, { bulan, tahun }) => {
    if (!reportList || reportList.length === 0) return;
    setExporting(true);
    try {
      const XLSX = await import("xlsx");

      const headerRow = [
        "NO", "NAMA PUSKESMAS", "SASARAN BALITA 0-59 BULAN",
        ...MTBS_INFO_FIELDS.map((f) => f.label),
        "Cakupan Dilayani MTBS (%)", "Cakupan Terhadap Sasaran (%)",
        ...MTBS_DIAGNOSA.map((f) => `${f.group} - ${f.label}`),
        MTBS_CATATAN_FIELD.label,
      ];

      const dataRows = reportList.map((row, idx) => [
        idx + 1,
        row.namaPuskesmas,
        row.sasaranBalita059,
        ...MTBS_INFO_FIELDS.map((f) => Number(row[f.key]) || 0),
        hitungCakupanDilayani(row),
        hitungCakupanSasaran(row, row.sasaranBalita059),
        ...MTBS_DIAGNOSA.map((f) => Number(row[f.key]) || 0),
        row[MTBS_CATATAN_FIELD.key] || "",
      ]);

      const sheetData = [headerRow, ...dataRows];
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap MTBS");

      const NAMA_BULAN = { "01":"Januari","02":"Februari","03":"Maret","04":"April","05":"Mei","06":"Juni","07":"Juli","08":"Agustus","09":"September","10":"Oktober","11":"November","12":"Desember" };
      XLSX.writeFile(workbook, `Rekap_MTBS_${NAMA_BULAN[bulan] || bulan}_${tahun}.xlsx`);
    } catch (err) {
      console.error("useMtbsExport handleExportExcel error:", err);
    } finally {
      setExporting(false);
    }
  };

  return { handleExportExcel, exporting };
}

// =====================================================================
// TABEL
// =====================================================================

function MtbsTable({ reportList = [], searchQuery = "", zoomLevel = 100 }) {
  const filteredList = reportList.filter((row) =>
    (row.namaPuskesmas || row.id || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );
  const cellStyle = { fontSize: `${zoomLevel}%` };
  const headerRuns = buildHeaderRuns(MTBS_DIAGNOSA);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
      <table className="border-collapse w-full text-xs" style={cellStyle}>
        <thead className="sticky top-0 z-10 bg-emerald-50">
          <tr>
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 bg-emerald-100">NO</th>
            <th rowSpan={2} className="border border-gray-300 px-3 py-2 min-w-[10rem] bg-emerald-100 text-left">NAMA PUSKESMAS</th>
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[5rem] bg-emerald-100">SASARAN BALITA 0-59 BLN</th>
            {MTBS_INFO_FIELDS.map((f) => (
              <th key={f.key} rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[6rem] bg-emerald-100">{f.label}</th>
            ))}
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[5rem] bg-emerald-100">Cakupan Dilayani (%)</th>
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[5rem] bg-emerald-100">Cakupan Sasaran (%)</th>
            {headerRuns.map((run, idx) => (
              <th key={`grp-${idx}`} colSpan={run.fields.length} className="border border-gray-300 px-2 py-2 bg-emerald-100">
                {run.group}
              </th>
            ))}
            <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[8rem] bg-emerald-100">Keterangan</th>
          </tr>
          <tr>
            {MTBS_DIAGNOSA.map((f) => (
              <th key={f.key} className="border border-gray-300 px-1 py-1 bg-emerald-50 min-w-[5rem]">{f.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredList.length === 0 && (
            <tr>
              <td colSpan={10 + MTBS_DIAGNOSA.length} className="border border-gray-300 px-3 py-6 text-center text-gray-400">
                Belum ada data laporan MTBS untuk periode ini.
              </td>
            </tr>
          )}
          {filteredList.map((row, idx) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
              <td className="border border-gray-300 px-3 py-1 text-left font-medium">{row.namaPuskesmas}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{row.sasaranBalita059}</td>
              {MTBS_INFO_FIELDS.map((f) => (
                <td key={f.key} className="border border-gray-300 px-2 py-1 text-center">{Number(row[f.key]) || 0}</td>
              ))}
              <td className="border border-gray-300 px-2 py-1 text-center font-semibold">{hitungCakupanDilayani(row)}</td>
              <td className="border border-gray-300 px-2 py-1 text-center font-semibold">{hitungCakupanSasaran(row, row.sasaranBalita059)}</td>
              {MTBS_DIAGNOSA.map((f) => (
                <td key={f.key} className="border border-gray-300 px-1 py-1 text-center">{Number(row[f.key]) || 0}</td>
              ))}
              <td className="border border-gray-300 px-2 py-1 text-left">{row[MTBS_CATATAN_FIELD.key] || ""}</td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-emerald-100 font-bold">
            <td className="border border-gray-300 px-2 py-2" colSpan={3}>TOTAL</td>
            {MTBS_INFO_FIELDS.map((f) => (
              <td key={f.key} className="border border-gray-300 px-2 py-2 text-center">
                {reportList.reduce((sum, row) => sum + (Number(row[f.key]) || 0), 0)}
              </td>
            ))}
            <td className="border border-gray-300 px-2 py-2" colSpan={2}></td>
            {MTBS_DIAGNOSA.map((f) => (
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

export default function DataMtbsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    selectedMonth, setSelectedMonth, selectedYear, reportList, loading,
    periodStatusesMap = {}, activePeriodData,
  } = useMtbsPeriodAdmin();

  const { handleExportExcel, exporting } = useMtbsExport();

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoomLevel(100);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium text-xs">Memuat Laporan Data MTBS...</p>
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
            Rekapitulasi Data MTBS Kota Baubau
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

      <MtbsTable reportList={reportList} searchQuery={searchQuery} zoomLevel={zoomLevel} />
    </div>
  );
}