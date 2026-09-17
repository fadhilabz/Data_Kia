// app/admin/rekapTahunan/shk/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useShkRekapTahunan } from "@/hooks/hookShk/useShkRekapTahunan";
import { useShkExportTahunan } from "@/hooks/hookShk/useShkExportTahunan";
import { namaBulan, DAFTAR_BULAN_ID } from "@/lib/libShk/shkConfig";

export default function RekapTahunanShkPage() {
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const { loading, matrixData, allReportsFlat } = useShkRekapTahunan(tahun);
  const { handleExportExcel, exporting } = useShkExportTahunan();

  // Akumulasi data per bulan dari seluruh Puskesmas
  // Menggunakan KEY yang sesuai dengan constants/shkFields.js
  const monthlyAggregates = DAFTAR_BULAN_ID.map((bulanId) => {
    return matrixData.reduce(
      (acc, pkm) => {
        const dataBulan = pkm.perBulan[bulanId] || {};
        acc.jumlahFasyankes += Number(dataBulan.jumlahFasyankes || 0);
        acc.sasaranBbl += Number(dataBulan.sasaranBbl || 0);
        acc.jumlahBayiLahirRiil += Number(dataBulan.jumlahBayiLahirRiil || 0);
        acc.bblDilakukanShk += Number(dataBulan.bblDilakukanShk || 0);
        acc.sampelApbnDekon += Number(dataBulan.sampelApbnDekon || 0);
        acc.sampelApbd += Number(dataBulan.sampelApbd || 0);
        acc.sampelJampersal += Number(dataBulan.sampelJampersal || 0);
        acc.hasilNormal += Number(dataBulan.hasilNormal || 0);
        acc.positifHk += Number(dataBulan.positifHk || 0);
        acc.sampelTidakTerbaca += Number(dataBulan.sampelTidakTerbaca || 0);
        return acc;
      },
      {
        bulanId,
        jumlahFasyankes: 0,
        sasaranBbl: 0,
        jumlahBayiLahirRiil: 0,
        bblDilakukanShk: 0,
        sampelApbnDekon: 0,
        sampelApbd: 0,
        sampelJampersal: 0,
        hasilNormal: 0,
        positifHk: 0,
        sampelTidakTerbaca: 0,
      }
    );
  });

  // Total akumulasi setahun penuh
  const totalTahunan = monthlyAggregates.reduce(
    (acc, m) => {
      acc.jumlahFasyankes += m.jumlahFasyankes;
      acc.sasaranBbl += m.sasaranBbl;
      acc.jumlahBayiLahirRiil += m.jumlahBayiLahirRiil;
      acc.bblDilakukanShk += m.bblDilakukanShk;
      acc.sampelApbnDekon += m.sampelApbnDekon;
      acc.sampelApbd += m.sampelApbd;
      acc.sampelJampersal += m.sampelJampersal;
      acc.hasilNormal += m.hasilNormal;
      acc.positifHk += m.positifHk;
      acc.sampelTidakTerbaca += m.sampelTidakTerbaca;
      return acc;
    },
    {
      jumlahFasyankes: 0,
      sasaranBbl: 0,
      jumlahBayiLahirRiil: 0,
      bblDilakukanShk: 0,
      sampelApbnDekon: 0,
      sampelApbd: 0,
      sampelJampersal: 0,
      hasilNormal: 0,
      positifHk: 0,
      sampelTidakTerbaca: 0,
    }
  );

  const calculateCakupan = (bblShk, sasaran) => {
    if (!sasaran || sasaran === 0) return "#DIV/0!";
    return `${((bblShk / sasaran) * 100).toFixed(1)}%`;
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <Link
            href="/admin/dataShk/shk"
            className="text-xs text-gray-500 hover:text-teal-600 flex items-center gap-1 mb-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Kembali ke Rekap Bulanan
          </Link>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600">calendar_month</span>
            Rekapitulasi Tahunan Pelayanan SHK
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Laporan Akumulasi Bulanan — Tahun <span className="font-semibold text-teal-700">{tahun}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium bg-white"
          >
            {[0, 1, 2].map((offset) => {
              const y = String(new Date().getFullYear() - offset);
              return (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              );
            })}
          </select>

          <button
            type="button"
            onClick={() => handleExportExcel(matrixData, allReportsFlat, tahun)}
            disabled={exporting || loading || matrixData.length === 0}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            {exporting ? "Menyiapkan..." : "Download Excel"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-[11px] border-collapse font-sans text-center">
            <thead>
              {/* Baris Header Atas */}
              <tr className="bg-yellow-300 font-bold text-gray-900 uppercase">
                <th rowSpan={2} className="border border-gray-400 px-2 py-2 min-w-[2.5rem]">
                  NO
                </th>
                <th rowSpan={2} className="border border-gray-400 px-3 py-2 min-w-[10rem]">
                  NAMA FASYANKES YANG MELAKSANAKAN SHK (OTOMATIS TERISI)
                </th>
                <th rowSpan={2} className="border border-gray-400 px-2 py-2 min-w-[8rem]">
                  JUMLAH FASYANKES DI WILAYAH TERSEBUT (OTOMATIS TERISI)
                </th>
                <th rowSpan={2} className="border border-gray-400 px-2 py-2 min-w-[8rem] bg-emerald-600 text-white">
                  SASARAN BBL (SASARAN PROYEKSI) OTOMATIS TERISI
                </th>
                <th rowSpan={2} className="border border-gray-400 px-2 py-2 min-w-[8rem]">
                  JUMLAH BAYI BARU LAHIR RIIL PADA BULAN TERSEBUT
                </th>
                <th rowSpan={2} className="border border-gray-400 px-2 py-2 min-w-[8rem]">
                  BBL YANG DI LAKUKAN SHK
                </th>
                <th rowSpan={2} className="border border-gray-400 px-2 py-2 min-w-[8rem] bg-emerald-600 text-white">
                  CAKUPAN BBL YANG DI LAKUKAN SHK (OTOMATIS TERISI)
                </th>
                <th colSpan={3} className="border border-gray-400 px-2 py-1">
                  JUMLAH SAMPEL DI BIAYAI
                </th>
                <th rowSpan={2} className="border border-gray-400 px-2 py-2 min-w-[7rem]">
                  JUMLAH HASIL NORMAL
                </th>
                <th rowSpan={2} className="border border-gray-400 px-2 py-2 min-w-[7rem]">
                  JUMLAH POSITIF HK
                </th>
                <th rowSpan={2} className="border border-gray-400 px-2 py-2 min-w-[7rem]">
                  JUMLAH SAMPEL TIDAK TERBACA
                </th>
              </tr>

              {/* Baris Sub-Header */}
              <tr className="bg-yellow-300 font-bold text-gray-900 uppercase">
                <th className="border border-gray-400 px-2 py-1 min-w-[6rem]">APBN/DEKON</th>
                <th className="border border-gray-400 px-2 py-1 min-w-[6rem]">APBD</th>
                <th className="border border-gray-400 px-2 py-1 min-w-[7rem]">JAMPERSAL (BPJS)</th>
              </tr>

              {/* Baris Total Ringkasan Atas */}
              <tr className="bg-yellow-300 font-bold text-gray-900">
                <td colSpan={2} className="border border-gray-400 px-3 py-2 text-left">
                  TOTAL
                </td>
                <td className="border border-gray-400 px-2 py-2">{totalTahunan.jumlahFasyankes}</td>
                <td className="border border-gray-400 px-2 py-2 bg-yellow-200">{totalTahunan.sasaranBbl}</td>
                <td className="border border-gray-400 px-2 py-2">{totalTahunan.jumlahBayiLahirRiil}</td>
                <td className="border border-gray-400 px-2 py-2">{totalTahunan.bblDilakukanShk}</td>
                <td className="border border-gray-400 px-2 py-2 bg-yellow-200">
                  {calculateCakupan(totalTahunan.bblDilakukanShk, totalTahunan.sasaranBbl)}
                </td>
                <td className="border border-gray-400 px-2 py-2">{totalTahunan.sampelApbnDekon}</td>
                <td className="border border-gray-400 px-2 py-2">{totalTahunan.sampelApbd}</td>
                <td className="border border-gray-400 px-2 py-2">{totalTahunan.sampelJampersal}</td>
                <td className="border border-gray-400 px-2 py-2">{totalTahunan.hasilNormal}</td>
                <td className="border border-gray-400 px-2 py-2">{totalTahunan.positifHk}</td>
                <td className="border border-gray-400 px-2 py-2">{totalTahunan.sampelTidakTerbaca}</td>
              </tr>
            </thead>

            <tbody>
              {monthlyAggregates.map((m, idx) => (
                <tr key={m.bulanId} className="hover:bg-emerald-100/50 transition-colors">
                  <td className="border border-gray-300 px-2 py-1.5 font-medium">{idx + 1}</td>
                  <td className="border border-gray-300 px-3 py-1.5 text-left font-bold uppercase text-gray-800">
                    {namaBulan(m.bulanId)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 bg-emerald-50/60">{m.jumlahFasyankes}</td>
                  <td className="border border-gray-300 px-2 py-1.5 bg-emerald-50/60 font-medium">{m.sasaranBbl}</td>
                  <td className="border border-gray-300 px-2 py-1.5 bg-emerald-50/60">{m.jumlahBayiLahirRiil}</td>
                  <td className="border border-gray-300 px-2 py-1.5 bg-emerald-50/60 font-medium">{m.bblDilakukanShk}</td>
                  <td className="border border-gray-300 px-2 py-1.5 bg-emerald-50/60 font-semibold text-teal-800">
                    {calculateCakupan(m.bblDilakukanShk, m.sasaranBbl)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 bg-emerald-50/60">{m.sampelApbnDekon}</td>
                  <td className="border border-gray-300 px-2 py-1.5 bg-emerald-50/60">{m.sampelApbd}</td>
                  <td className="border border-gray-300 px-2 py-1.5 bg-emerald-50/60">{m.sampelJampersal}</td>
                  <td className="border border-gray-300 px-2 py-1.5 bg-emerald-50/60">{m.hasilNormal}</td>
                  <td className="border border-gray-300 px-2 py-1.5 bg-emerald-50/60 text-rose-700 font-semibold">{m.positifHk}</td>
                  <td className="border border-gray-300 px-2 py-1.5 bg-emerald-50/60">{m.sampelTidakTerbaca}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}