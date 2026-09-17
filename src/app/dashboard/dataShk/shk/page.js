// app/dashboard/shk/page.js
"use client";

import { useState, useEffect } from "react";
import { formatPeriode } from "@/constants/periode";
import { useShkPeriode } from "@/lib/libShk/useShkPeriode";
import { useShkFormData } from "@/lib/libShk/useShkFormData";
import { STATUS_DRAFT } from "@/lib/libShk/shkConfig";
import { SHK_FIELDS, getCakupanShk, formatCakupan } from "@/constants/shkFields";

import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";
import ShkFormHeader from "@/components/comShk/form/ShkFormHeader";
import ShkStatusBanners from "@/components/comShk/form/ShkStatusBanners";
import ShkFieldRow from "@/components/comShk/form/ShkFieldRow";
import ShkSubmitFooter from "@/components/comShk/form/ShkSubmitFooter";
import ShkReportTablePreview from "@/components/comShk/table/ShkReportTablePreview";

export default function FormSHKPage() {
  const [activeViewTab, setActiveViewTab] = useState("form");
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
  } = useShkPeriode({ isAdmin: isAdminFlag });

  const {
    loading,
    saving,
    autoSaveStatus,
    userProfile,
    formData,
    periodDocExists,
    loadMonth,
    saveToFirestore,
    handleInputChange,
    handleFinalSubmit,
  } = useShkFormData({ selectedYear, selectedMonth, isReadOnly });

  useEffect(() => {
    if (isAdminFlag) return;
    if (!userProfile) return;
    const looksLikeAdmin = userProfile.role === "admin_dinkes" || !userProfile.puskesmasId;
    if (looksLikeAdmin) setIsAdminFlag(true);
  }, [isAdminFlag, userProfile]);

  const handleSelectMonth = async (mId) => {
    selectMonth(mId);
    await loadMonth(mId);
  };

  const onSubmit = async () => {
    await saveToFirestore(formData, STATUS_DRAFT);
    const ok = await handleFinalSubmit();
    if (ok) {
      alert(`Laporan SHK untuk ${formatPeriode(selectedYear, selectedMonth)} berhasil disimpan dan ditandai selesai!`);
      window.location.href = "/dashboard";
    }
  };

  if (loading || periodeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant font-medium text-xs">Memuat Halaman Form SHK...</p>
        </div>
      </div>
    );
  }

  const periodLabel = formatPeriode(selectedYear, selectedMonth);

  if (isAdminFlag) {
    return (
      <main className="flex-1 p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <h1 className="text-xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">table_view</span>
            Rekapitulasi SHK Seluruh Puskesmas
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Mode Admin — tampilan ringkas (read-only). Gunakan menu Admin untuk fitur lengkap & rekap tahunan.
          </p>
        </div>
        <PeriodeBulanCard
          selectedMonth={selectedMonth}
          onSelectMonth={handleSelectMonth}
          year={selectedYear}
          statusPeriodeMap={periodStatusesMap}
          activeMonth={activePeriode?.bulan}
        />
        <ShkReportTablePreview userProfile={userProfile} selectedMonth={selectedMonth} selectedYear={selectedYear} />
      </main>
    );
  }

  const puskesmasName =
    userProfile?.namaPuskesmas ||
    (userProfile?.puskesmasId
      ? userProfile.puskesmasId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : "Puskesmas");

  const disabled = isReadOnly || !periodDocExists;
  const cakupan = getCakupanShk(formData);

  const fieldsUtama = SHK_FIELDS.filter((f) => !f.group);
  const fieldsPembiayaan = SHK_FIELDS.filter((f) => f.group === "Sumber Pembiayaan Sampel");

  return (
    <main className="flex-1 p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-6">
      <ShkFormHeader
        puskesmasName={puskesmasName}
        sasaranBbl={formData.sasaranBbl}
        autoSaveStatus={autoSaveStatus}
        isEditable={isEditable}
        periodLabel={periodLabel}
      />

      <PeriodeBulanCard
        selectedMonth={selectedMonth}
        onSelectMonth={handleSelectMonth}
        year={selectedYear}
        statusPeriodeMap={periodStatusesMap}
        activeMonth={activePeriode?.bulan}
      />

      <ShkStatusBanners periodDocExists={periodDocExists} isReadOnly={isReadOnly} periodLabel={periodLabel} />

      <div className="flex border-b border-outline-variant gap-2">
        <button
          type="button"
          onClick={() => setActiveViewTab("form")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 rounded-t-xl transition flex items-center gap-2 ${
            activeViewTab === "form"
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
          <span className="material-symbols-outlined text-base">table_view</span>
          Lihat Rekapitulasi
        </button>
      </div>

      {activeViewTab === "preview" ? (
        <ShkReportTablePreview userProfile={userProfile} selectedMonth={selectedMonth} selectedYear={selectedYear} />
      ) : (
        <div className={`bg-surface-container-lowest border rounded-xl p-6 shadow-sm space-y-5 ${isReadOnly ? "border-rose-200" : "border-outline-variant"}`}>
          <div className="flex items-center justify-between bg-surface-container-high rounded-lg px-4 py-2.5">
            <span className="text-xs font-semibold text-on-surface-variant">Cakupan BBL yang Dilakukan SHK</span>
            <span className="text-sm font-bold text-primary">{formatCakupan(cakupan)}</span>
          </div>

          <div>
            {fieldsUtama.map((field) => (
              <ShkFieldRow
                key={field.key}
                field={field}
                value={formData[field.key]}
                onChange={handleInputChange}
                disabled={disabled}
              />
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold text-primary mb-1">Sumber Pembiayaan Sampel</h3>
            {fieldsPembiayaan.map((field) => (
              <ShkFieldRow
                key={field.key}
                field={field}
                value={formData[field.key]}
                onChange={handleInputChange}
                disabled={disabled}
              />
            ))}
          </div>

          <ShkSubmitFooter onSubmit={onSubmit} saving={saving} isEditable={isEditable} periodDocExists={periodDocExists} />
        </div>
      )}
    </main>
  );
}