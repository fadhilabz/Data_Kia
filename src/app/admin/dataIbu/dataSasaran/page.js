// app/admin/dataSasaran/page.js
// Halaman Admin: Input/Edit Data Sasaran per Puskesmas PER BULAN.
// Beda dari data master statis — sasaran di sini bisa berubah tiap
// periode, disimpan langsung ke dokumen laporan ANC & PNC bulan terpilih.

"use client";

import { useState } from "react";
import { useDataSasaranPeriode } from "@/hooks/useMasterPuskesmas";
import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";
import { formatPeriode } from "@/constants/periode";

function formatRibuan(n) {
  return Number(n || 0).toLocaleString("id-ID");
}

export default function DataSasaranPage() {
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
  } = useDataSasaranPeriode();

  const [savedFlash, setSavedFlash] = useState(null);

  const handleSave = async (row) => {
    const ok = await saveRow(row);
    setSavedFlash({ id: row.id, ok });
    setTimeout(() => setSavedFlash(null), 2000);
  };

  const totals = rows.reduce(
    (acc, row) => ({
      jumlahPenduduk: acc.jumlahPenduduk + (Number(row.jumlahPenduduk) || 0),
      sasaranBumil: acc.sasaranBumil + (Number(row.sasaranBumil) || 0),
      sasaranWus: acc.sasaranWus + (Number(row.sasaranWus) || 0),
      sasaranBulin: acc.sasaranBulin + (Number(row.sasaranBulin) || 0),
    }),
    { jumlahPenduduk: 0, sasaranBumil: 0, sasaranWus: 0, sasaranBulin: 0 }
  );

  return (
    <div className="p-6 min-h-screen bg-gray-100 space-y-5">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">groups</span>
          Data Sasaran per Puskesmas
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
          sasaran untuk bulan ini.
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
                <th className="border border-gray-300 px-3 py-2 min-w-[9rem]">JUMLAH PENDUDUK</th>
                <th className="border border-gray-300 px-3 py-2 min-w-[7rem]">Bumil</th>
                <th className="border border-gray-300 px-3 py-2 min-w-[9rem]">SASARAN WUS</th>
                <th className="border border-gray-300 px-3 py-2 min-w-[7rem]">BULIN</th>
                <th className="border border-gray-300 px-3 py-2 min-w-[6rem]"></th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="border border-gray-300 px-3 py-6 text-center text-gray-400">
                    Belum ada data Puskesmas terdaftar.
                  </td>
                </tr>
              )}

              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 text-center">{idx + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 font-medium">{row.nama}</td>

                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      value={row.jumlahPenduduk}
                      disabled={!periodeSudahDibuka}
                      onChange={(e) => updateLocalValue(row.id, "jumlahPenduduk", e.target.value)}
                      className="w-full px-2 py-1 rounded border border-gray-300 text-right text-sm disabled:bg-gray-100"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      value={row.sasaranBumil}
                      disabled={!periodeSudahDibuka}
                      onChange={(e) => updateLocalValue(row.id, "sasaranBumil", e.target.value)}
                      className="w-full px-2 py-1 rounded border border-gray-300 text-right text-sm disabled:bg-gray-100"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      value={row.sasaranWus}
                      disabled={!periodeSudahDibuka}
                      onChange={(e) => updateLocalValue(row.id, "sasaranWus", e.target.value)}
                      className="w-full px-2 py-1 rounded border border-gray-300 text-right text-sm disabled:bg-gray-100"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      value={row.sasaranBulin}
                      disabled={!periodeSudahDibuka}
                      onChange={(e) => updateLocalValue(row.id, "sasaranBulin", e.target.value)}
                      className="w-full px-2 py-1 rounded border border-gray-300 text-right text-sm disabled:bg-gray-100"
                    />
                  </td>

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
                <td className="border border-gray-300 px-3 py-2 text-right">{formatRibuan(totals.jumlahPenduduk)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatRibuan(totals.sasaranBumil)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatRibuan(totals.sasaranWus)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatRibuan(totals.sasaranBulin)}</td>
                <td className="border border-gray-300 px-3 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}