// app/admin/rekapTahunan/kematianNeo/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useKematianNeoRekapTahunan } from "@/hooks/hookAnak/kematian-neo/useKematianNeoRekapTahunan";
import { useKematianNeoExportTahunan } from "@/hooks/hookAnak/kematian-neo/useKematianNeoExportTahunan";
import { namaBulan, DAFTAR_BULAN_ID } from "@/lib/libAnak/kematian-neo/kematianNeoConfig";
import { getJumlahKematianBayi } from "@/constants/kematianNeoFields";

export default function RekapTahunanKematianNeoPage() {
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const { loading, matrixData, allReportsFlat } = useKematianNeoRekapTahunan(tahun);
  const { handleExportExcel, exporting } = useKematianNeoExportTahunan();

  const totalPerBulan = (bulanId) =>
    matrixData.reduce((sum, pkm) => sum + getJumlahKematianBayi(pkm.perBulan[bulanId]), 0);

  const totalSetahunSemuaPkm = matrixData.reduce(
    (sum, pkm) => sum + pkm.totalTahun.jumlahKematianBayi, 0
  );

  return (
    <div className="p-6 min-h-screen bg-gray-100 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <Link
            href="/admin/dataAnak/dataKematianBayi"
            className="text-xs text-gray-500 hover:text-rose-600 flex items-center gap-1 mb-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Kembali ke Rekap Bulanan
          </Link>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600">calendar_month</span>
            Rekap Tahunan Kematian Neonatal & Post-Neonatal
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Matriks Puskesmas × 12 Bulan — Tahun <span className="font-semibold text-rose-700">{tahun}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          >
            {[0, 1, 2].map((offset) => {
              const y = String(new Date().getFullYear() - offset);
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>

          <button
            type="button"
            onClick={() => handleExportExcel(matrixData, allReportsFlat, tahun)}
            disabled={exporting || loading || matrixData.length === 0}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            {exporting ? "Menyiapkan..." : "Download Excel"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
          <table className="border-collapse w-full text-xs">
            <thead className="sticky top-0 bg-rose-50">
              <tr>
                <th className="border border-gray-300 px-2 py-2 min-w-[2.5rem] bg-rose-100">NO</th>
                <th className="border border-gray-300 px-3 py-2 min-w-[12rem] bg-rose-100 text-left">NAMA PUSKESMAS</th>
                {DAFTAR_BULAN_ID.map((b) => (
                  <th key={b} className="border border-gray-300 px-2 py-2 min-w-[4rem] bg-rose-100">
                    {namaBulan(b).slice(0, 3)}
                  </th>
                ))}
                <th className="border border-gray-300 px-2 py-2 min-w-[5rem] bg-rose-200">TOTAL SETAHUN</th>
              </tr>
              <tr className="text-[10px] text-gray-500 italic">
                <th colSpan={2} className="border border-gray-300 px-2 py-1 text-left bg-rose-50">
                  Angka = Jumlah Kematian Bayi (0-11 bulan)
                </th>
                {DAFTAR_BULAN_ID.map((b) => <th key={b} className="border border-gray-300 bg-rose-50" />)}
                <th className="border border-gray-300 bg-rose-50" />
              </tr>
            </thead>

            <tbody>
              {matrixData.length === 0 && (
                <tr>
                  <td colSpan={2 + DAFTAR_BULAN_ID.length + 1} className="border border-gray-300 px-3 py-6 text-center text-gray-400">
                    Belum ada data Puskesmas.
                  </td>
                </tr>
              )}

              {matrixData.map((pkm, idx) => (
                <tr key={pkm.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border border-gray-300 px-3 py-1 text-left font-medium">{pkm.nama}</td>
                  {DAFTAR_BULAN_ID.map((b) => {
                    const val = getJumlahKematianBayi(pkm.perBulan[b]);
                    return (
                      <td
                        key={b}
                        className={`border border-gray-300 px-2 py-1 text-center ${val > 0 ? "font-bold text-rose-700 bg-rose-50" : "text-gray-400"}`}
                      >
                        {val}
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 px-2 py-1 text-center font-bold bg-rose-100">
                    {pkm.totalTahun.jumlahKematianBayi}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-rose-100 font-bold">
                <td className="border border-gray-300 px-2 py-2" colSpan={2}>TOTAL KOTA BAUBAU</td>
                {DAFTAR_BULAN_ID.map((b) => (
                  <td key={b} className="border border-gray-300 px-2 py-2 text-center">
                    {totalPerBulan(b)}
                  </td>
                ))}
                <td className="border border-gray-300 px-2 py-2 text-center">{totalSetahunSemuaPkm}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}