// app/admin/dataAnak/dataBalita/page.js
"use client";

import { useState } from "react";
import { useKmbPeriod } from "@/hooks/hookAnak/kmb/useKmbPeriod";
import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";
import KmbTable from "@/components/comAnak/kmb/table/KmbTable";
import { formatPeriode } from "@/constants/periode";

export default function DataKmbPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    reportList,
    loading,
    periodStatusesMap = {},
    activePeriodData,
  } = useKmbPeriod();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium text-xs">Memuat Laporan Data KMB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen bg-gray-100 transition-all space-y-5 ${isFullscreen ? "fixed inset-0 z-50 overflow-auto ml-0 p-4 bg-white" : ""}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600">personal_injury</span>
            Rekapitulasi Kematian Balita & Anak (KMB)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Periode Laporan: <span className="font-semibold text-rose-700">{formatPeriode(selectedYear, selectedMonth)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-xs text-gray-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Puskesmas..."
              className="pl-8 pr-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700 border border-gray-300 outline-none focus:ring-2 focus:ring-rose-500 w-44"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">{isFullscreen ? "fullscreen_exit" : "fullscreen"}</span>
            <span>{isFullscreen ? "Keluar Review" : "Review Mode"}</span>
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

      <KmbTable reportList={reportList} searchQuery={searchQuery} />
    </div>
  );
}