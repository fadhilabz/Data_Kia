// app/admin/dataKematian/page.js
// Halaman Utama Admin Data Kematian Ibu — wrapper ringkas, pola sama dataAnc/dataPnc/dataAnct.

"use client";

import { useState } from "react";
import { useKematianPeriod } from "@/hooks/hooksIbu/kematian/useKematianPeriod";
import { useKematianExport } from "@/hooks/hooksIbu/kematian/useKematianExport";
import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";
import KematianTable from "@/components/comIbu/kematian/table/KematianTable";
import { formatPeriode } from "@/constants/periode";

export default function DataKematianPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    reportList,
    loading,
    periodStatusesMap = {},
    activePeriodData,
  } = useKematianPeriod();

  const { handleExportExcel, exporting } = useKematianExport();

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoomLevel(100);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium text-xs">
            Memuat Laporan Data Kematian Ibu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 min-h-screen bg-gray-100 transition-all space-y-5 ${
        isFullscreen ? "fixed inset-0 z-50 overflow-auto ml-0 p-4 bg-white" : ""
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">
              table_chart
            </span>
            Rekapitulasi Data Kematian Ibu Puskesmas Kota Baubau
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Periode Laporan:{" "}
            <span className="font-semibold text-emerald-700">
              {selectedYear && selectedMonth
                ? formatPeriode(selectedYear, selectedMonth)
                : "-"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-xs text-gray-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Puskesmas..."
              className="pl-8 pr-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700 border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 w-44"
            />
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-300 shadow-inner">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 hover:bg-white rounded text-gray-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                zoom_out
              </span>
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="px-2 text-xs font-semibold text-gray-700 hover:text-emerald-600 min-w-[45px] text-center cursor-pointer"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 hover:bg-white rounded text-gray-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">zoom_in</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              {isFullscreen ? "fullscreen_exit" : "fullscreen"}
            </span>
            <span>{isFullscreen ? "Keluar Review" : "Review Mode"}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleExportExcel(reportList, {
                bulan: selectedMonth,
                tahun: selectedYear,
              })
            }
            disabled={exporting || reportList.length === 0}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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

      <KematianTable
        reportList={reportList}
        searchQuery={searchQuery}
        zoomLevel={zoomLevel}
      />
    </div>
  );
}
