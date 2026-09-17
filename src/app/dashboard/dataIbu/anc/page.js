// app/dashboard/anc/page.js
// Halaman Form Input ANC Petugas Puskesmas — versi ramping.
// Logika dipindah ke hooks (lib/anc/useAncPeriode, lib/anc/useAncFormData),
// UI dipecah ke components/anc/*. File ini hanya merakit semuanya.

"use client";

import { useState, useEffect } from "react";
import { formatPeriode } from "@/constants/periode";
import { useAncPeriode } from "@/lib/ibu/anc/useAncPeriode";
import { useAncFormData } from "@/lib/ibu/anc/useAncFormData";
import { STATUS_DRAFT } from "@/lib/ibu/anc/ancConfig";

import PeriodeBulanCard from "@/components/PeriodeBulanCard";
import AncFormHeader from "@/components/comIbu/anc/form/AncFormHeader";
import AncStatusBanners from "@/components/comIbu/anc/form/AncStatusBanners";
import AncStepNav from "@/components/comIbu/anc/form/AncStepNav";
import AncStepFooter from "@/components/comIbu/anc/form/AncStepFooter";
import StepKunjunganK1K8 from "@/components/comIbu/anc/steps/StepKunjunganK1K8";
import Step12T from "@/components/comIbu/anc/steps/Step12T";
import StepTesLab from "@/components/comIbu/anc/steps/StepTesLab";
import StepStatusGiziAnemia from "@/components/comIbu/anc/steps/StepStatusGiziAnemia";
import StepPreeklamsiaKomplikasi from "@/components/comIbu/anc/steps/StepPreeklamsiaKomplikasi";
import StepDeteksiRestiRujukan from "@/components/comIbu/anc/steps/StepDeteksiRestiRujukan";
import AncReportTablePreview from "@/components/comIbu/anc/table/AncReportTablePreview";

export default function FormANCPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [activeViewTab, setActiveViewTab] = useState("wizard");

  // isAdmin baru pasti setelah userProfile termuat dari useAncFormData,
  // jadi disimpan terpisah lalu disinkronkan lewat useEffect di bawah.
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
  } = useAncPeriode({ isAdmin: isAdminFlag });

  const {
    loading,
    saving,
    autoSaveStatus,
    userProfile,
    targetBumil,
    formData,
    periodDocExists,
    loadMonth,
    saveToFirestore,
    handleInputChange,
    handleFinalSubmit,
  } = useAncFormData({ selectedYear, selectedMonth, isReadOnly });

  // Sinkronkan status admin begitu profil user termuat
  useEffect(() => {
    if (!isAdminFlag && userProfile?.role === "admin_dinkes") {
      setIsAdminFlag(true);
    }
  }, [isAdminFlag, userProfile]);

  const handleSelectMonth = async (mId) => {
    selectMonth(mId);
    await loadMonth(mId);
  };

  const goToStep = (stepNumber) => {
    if (stepNumber < 1 || stepNumber > 6) return;
    if (isEditable && periodDocExists) {
      saveToFirestore(formData, STATUS_DRAFT);
    }
    setActiveStep(stepNumber);
  };

  const onFinalSubmit = async () => {
    const ok = await handleFinalSubmit();
    if (ok) {
      alert(
        `Laporan ANC untuk ${formatPeriode(selectedYear, selectedMonth)} berhasil disimpan dan ditandai selesai!`,
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
            Memuat Halaman Form ANC...
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

  return (
    <main className="flex-1 p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-6">
      <AncFormHeader
        puskesmasName={puskesmasName}
        targetBumil={targetBumil}
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

      <AncStatusBanners
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
          Form Input / Riwayat (Wizard 6 Langkah)
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
          Lihat Rekapitulasi & Export Excel (.xlsx)
        </button>
      </div>

      {activeViewTab === "preview" ? (
        <AncReportTablePreview
          userProfile={userProfile}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      ) : (
        <>
          <AncStepNav activeStep={activeStep} onStepClick={goToStep} />

          <div
            className={`bg-surface-container-lowest border rounded-xl p-6 shadow-sm ${
              isReadOnly ? "border-rose-200" : "border-outline-variant"
            }`}
          >
            {activeStep === 1 && (
              <StepKunjunganK1K8
                values={formData}
                onChange={handleInputChange}
                targetBumil={targetBumil}
                disabled={isReadOnly || !periodDocExists}
              />
            )}
            {activeStep === 2 && (
              <Step12T
                values={formData}
                onChange={handleInputChange}
                disabled={isReadOnly || !periodDocExists}
              />
            )}
            {activeStep === 3 && (
              <StepTesLab
                values={formData}
                onChange={handleInputChange}
                targetBumil={targetBumil}
                disabled={isReadOnly || !periodDocExists}
              />
            )}
            {activeStep === 4 && (
              <StepStatusGiziAnemia
                values={formData}
                onChange={handleInputChange}
                targetBumil={targetBumil}
                disabled={isReadOnly || !periodDocExists}
              />
            )}
            {activeStep === 5 && (
              <StepPreeklamsiaKomplikasi
                values={formData}
                onChange={handleInputChange}
                disabled={isReadOnly || !periodDocExists}
              />
            )}
            {activeStep === 6 && (
              <StepDeteksiRestiRujukan
                values={formData}
                onChange={handleInputChange}
                targetBumil={targetBumil}
                disabled={isReadOnly || !periodDocExists}
              />
            )}

            <AncStepFooter
              activeStep={activeStep}
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
