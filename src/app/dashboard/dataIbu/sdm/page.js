// app/dashboard/sdm/page.js
// Halaman Form Input SDM & Fasilitas Kesehatan Petugas Puskesmas.
// PENTING: data ini KUMULATIF — angka bulan ini sudah mencakup bulan
// sebelumnya. Saat dokumen bulan baru dibuat, nilainya otomatis diisi
// dari laporan bulan sebelumnya (tinggal dikoreksi kalau ada perubahan).

"use client";

import { useState, useEffect } from "react";
import { formatPeriode } from "@/constants/periode";
import { useSdmPeriode } from "@/lib/ibu/sdm/useSdmPeriode";
import { useSdmFormData } from "@/lib/ibu/sdm/useSdmFormData";
import { STATUS_DRAFT } from "@/lib/ibu/sdm/sdmConfig";

import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";
import StepSdm from "@/components/comIbu/sdm/form/StepSdm";
import SdmReportTablePreview from "@/components/comIbu/sdm/table/SdmReportTablePreview";

export default function FormSdmPage() {
  const [activeViewTab, setActiveViewTab] = useState("wizard");
  const [isAdminFlag, setIsAdminFlag] = useState(false);

  const {
    selectedMonth,
    selectedYear,
    selectMonth,
    activePeriode,
    periodStatusesMap,
    periodeLoading,
    isEditable,
    isReadOnly,
  } = useSdmPeriode({ isAdmin: isAdminFlag });

  const {
    loading,
    saving,
    autoSaveStatus,
    userProfile,
    formData,
    periodDocExists,
    diisiOtomatisDariBulanLalu,
    loadMonth,
    saveToFirestore,
    handleInputChange,
    handleFinalSubmit,
  } = useSdmFormData({ selectedYear, selectedMonth, isReadOnly });

  useEffect(() => {
    if (!isAdminFlag && userProfile?.role === "admin_dinkes") {
      setIsAdminFlag(true);
    }
  }, [isAdminFlag, userProfile]);

  const handleSelectMonth = async (mId) => {
    selectMonth(mId);
    await loadMonth(mId);
  };

  const handleSaveDraft = () => {
    saveToFirestore(formData, STATUS_DRAFT);
  };

  const onFinalSubmit = async () => {
    const ok = await handleFinalSubmit();
    if (ok) {
      alert(
        `Laporan SDM untuk ${formatPeriode(selectedYear, selectedMonth)} berhasil disimpan dan ditandai selesai!`,
      );
      window.location.href = "/dashboard";
    }
  };

  if (loading || periodeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant font-medium text-xs">
            Memuat Halaman Form SDM...
          </p>
        </div>
      </div>
    );
  }

  const puskesmasName =
    userProfile?.namaPuskesmas ||
    (userProfile?.puskesmasId
      ? userProfile.puskesmasId
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Puskesmas");

  const periodLabel = formatPeriode(selectedYear, selectedMonth);
  const disabled = isReadOnly || !periodDocExists;

  return (
    <main className="flex-1 p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-6">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-bold text-lg text-primary">
            Form SDM & Fasilitas Kesehatan — {puskesmasName}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Periode: <span className="font-semibold">{periodLabel}</span>
          </p>
        </div>
        <div className="text-xs">
          {autoSaveStatus === "saving" && (
            <span className="text-on-surface-variant">Menyimpan draft...</span>
          )}
          {autoSaveStatus === "saved" && (
            <span className="text-emerald-600 font-medium">Tersimpan</span>
          )}
          {autoSaveStatus === "error" && (
            <span className="text-red-600 font-medium">Gagal menyimpan</span>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-sm text-blue-800">
        <strong>Data SDM diisi KUMULATIF</strong> — angka yang diisi harus TOTAL
        sampai bulan ini (sudah termasuk bulan-bulan sebelumnya), bukan cuma
        penambahan bulan ini saja.
      </div>

      <PeriodeBulanCard
        selectedMonth={selectedMonth}
        onSelectMonth={handleSelectMonth}
        year={selectedYear}
        statusPeriodeMap={periodStatusesMap}
        activeMonth={activePeriode?.bulan}
      />

      {/* View Mode Tabs */}
      <div className="flex border-b border-outline-variant gap-2">
        <button
          type="button"
          onClick={() => setActiveViewTab("wizard")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 rounded-t-xl transition flex items-center gap-2 ${
            activeViewTab === "wizard"
              ? "border-primary text-primary bg-surface-container-low"
              : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest"
          }`}
        >
          <span className="material-symbols-outlined text-base">edit_note</span>
          Form Input / Riwayat
        </button>
        <button
          type="button"
          onClick={() => setActiveViewTab("preview")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 rounded-t-xl transition flex items-center gap-2 ${
            activeViewTab === "preview"
              ? "border-primary text-primary bg-surface-container-low"
              : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            table_view
          </span>
          Lihat Rekapitulasi
        </button>
      </div>

      {activeViewTab === "preview" ? (
        <SdmReportTablePreview
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      ) : (
        <>
          {!periodDocExists && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-amber-800">
              Periode ini belum dibuka untuk diisi.
            </div>
          )}
          {isReadOnly && periodDocExists && (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-600">
              Periode ini terkunci — data hanya bisa dilihat, tidak bisa diubah.
            </div>
          )}
          {diisiOtomatisDariBulanLalu && !isReadOnly && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-sm text-emerald-800">
              Nilai di bawah otomatis diisi dari laporan bulan sebelumnya.
              Silakan koreksi kalau ada perubahan.
            </div>
          )}

          <div
            className={`bg-surface-container-lowest border rounded-xl p-6 shadow-sm ${
              isReadOnly ? "border-rose-200" : "border-outline-variant"
            }`}
          >
            <StepSdm
              values={formData}
              onChange={handleInputChange}
              disabled={disabled}
            />

            {!isReadOnly && periodDocExists && (
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container-high disabled:opacity-50"
                >
                  Simpan Draft
                </button>
                <button
                  type="button"
                  onClick={onFinalSubmit}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Submit Final"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
