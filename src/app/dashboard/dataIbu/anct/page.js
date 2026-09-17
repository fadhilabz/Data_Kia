// app/dashboard/anct/page.js
// Halaman Form Input ANC Terpadu Petugas Puskesmas — wizard 6 step
// (sesuai 6 kategori di constants/anctFields.js), pola identik ANC/PNC.

"use client";

import { useState, useEffect } from "react";
import { formatPeriode } from "@/constants/periode";
import { useAnctPeriode } from "@/lib/ibu/anct/useAnctPeriode";
import { useAnctFormData } from "@/lib/ibu/anct/useAnctFormData";
import { STATUS_DRAFT } from "@/lib/ibu/anct/anctConfig";

import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";
import AnctFormHeader from "@/components/comIbu/anct/form/AnctFormHeader";
import AnctStatusBanners from "@/components/comIbu/anct/form/AnctStatusBanners";
import AnctStepNav, {
  ANCT_STEPS,
} from "@/components/comIbu/anct/form/AnctStepNav";
import AnctStepFooter from "@/components/comIbu/anct/form/AnctStepFooter";
import StepPpia from "@/components/comIbu/anct/steps/StepPpia";
import StepMalaria from "@/components/comIbu/anct/steps/StepMalaria";
import StepTb from "@/components/comIbu/anct/steps/StepTb";
import StepKecacingan from "@/components/comIbu/anct/steps/StepKecacingan";
import StepIms from "@/components/comIbu/anct/steps/StepIms";
import StepHepatitisB from "@/components/comIbu/anct/steps/StepHepatitisB";
import AnctReportTablePreview from "@/components/comIbu/anct/table/AnctReportTablePreview";

export default function FormANCTPage() {
  const [activeStep, setActiveStep] = useState(1);
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
  } = useAnctPeriode({ isAdmin: isAdminFlag });

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
  } = useAnctFormData({ selectedYear, selectedMonth, isReadOnly });

  useEffect(() => {
    if (!isAdminFlag && userProfile?.role === "admin_dinkes") {
      setIsAdminFlag(true);
    }
  }, [isAdminFlag, userProfile]);

  const handleSelectMonth = async (mId) => {
    selectMonth(mId);
    await loadMonth(mId);
  };

  const totalSteps = ANCT_STEPS.length;

  const goToStep = (stepNumber) => {
    if (stepNumber < 1 || stepNumber > totalSteps) return;
    if (isEditable && periodDocExists) {
      saveToFirestore(formData, STATUS_DRAFT);
    }
    setActiveStep(stepNumber);
  };

  const onFinalSubmit = async () => {
    const ok = await handleFinalSubmit();
    if (ok) {
      alert(
        `Laporan ANC Terpadu untuk ${formatPeriode(selectedYear, selectedMonth)} berhasil disimpan dan ditandai selesai!`,
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
            Memuat Halaman Form ANC Terpadu...
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
      <AnctFormHeader
        puskesmasName={puskesmasName}
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

      <AnctStatusBanners
        periodDocExists={periodDocExists}
        isReadOnly={isReadOnly}
        periodLabel={periodLabel}
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
          Form Input (Wizard 6 Langkah)
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
        <AnctReportTablePreview
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          userProfile={userProfile}
        />
      ) : (
        <>
          <AnctStepNav activeStep={activeStep} onStepClick={goToStep} />

          <div
            className={`bg-surface-container-lowest border rounded-xl p-6 shadow-sm ${
              isReadOnly ? "border-rose-200" : "border-outline-variant"
            }`}
          >
            {activeStep === 1 && (
              <StepPpia
                values={formData}
                onChange={handleInputChange}
                disabled={disabled}
              />
            )}
            {activeStep === 2 && (
              <StepMalaria
                values={formData}
                onChange={handleInputChange}
                disabled={disabled}
              />
            )}
            {activeStep === 3 && (
              <StepTb
                values={formData}
                onChange={handleInputChange}
                disabled={disabled}
              />
            )}
            {activeStep === 4 && (
              <StepKecacingan
                values={formData}
                onChange={handleInputChange}
                disabled={disabled}
              />
            )}
            {activeStep === 5 && (
              <StepIms
                values={formData}
                onChange={handleInputChange}
                disabled={disabled}
              />
            )}
            {activeStep === 6 && (
              <StepHepatitisB
                values={formData}
                onChange={handleInputChange}
                disabled={disabled}
              />
            )}

            <AnctStepFooter
              activeStep={activeStep}
              totalSteps={totalSteps}
              onBack={() => goToStep(activeStep - 1)}
              onNext={() => goToStep(activeStep + 1)}
              onSubmit={onFinalSubmit}
              saving={saving}
              isEditable={isEditable}
              periodDocExists={periodDocExists}
            />
          </div>
        </>
      )}
    </main>
  );
}
