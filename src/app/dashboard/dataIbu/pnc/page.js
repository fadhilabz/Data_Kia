// app/dashboard/pnc/page.jsx
// Halaman Form Input PNC Petugas Puskesmas — struktur identik dengan
// app/dashboard/anc/page.jsx (buka/kunci bulanan oleh Admin, wizard, preview tabel).

"use client";

import { useState, useEffect } from "react";
import { formatPeriode } from "@/constants/periode";
import { usePncPeriode } from "@/lib/ibu/pnc/usePncPeriode";
import { usePncFormData } from "@/lib/ibu/pnc/usePncFormData";
import { STATUS_DRAFT } from "@/lib/ibu/pnc/pncConfig";

// UBAH BARIS 13 MENJADI:

import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";
import PncFormHeader from "@/components/comIbu/pnc/form/PncFormHeader";
import PncStatusBanners from "@/components/comIbu/pnc/form/PncStatusBanners";
import PncStepNav, { PNC_STEPS } from "@/components/comIbu/pnc/form/PncStepNav";
import PncStepFooter from "@/components/comIbu/pnc/form/PncStepFooter";
import StepPersalinan from "@/components/comIbu/pnc/form/StepPersalinan";
import StepKunjunganNifas from "@/components/comIbu/pnc/form/StepKunjunganNifas";
import PncReportTablePreview from "@/components/comIbu/pnc/table/PncReportTablePreview";

export default function FormPNCPage() {
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
  } = usePncPeriode({ isAdmin: isAdminFlag });

  const {
    loading,
    saving,
    autoSaveStatus,
    userProfile,
    targetBulin,
    formData,
    periodDocExists,
    loadMonth,
    saveToFirestore,
    handleInputChange,
    handleFinalSubmit,
  } = usePncFormData({ selectedYear, selectedMonth, isReadOnly });

  useEffect(() => {
    if (!isAdminFlag && userProfile?.role === "admin_dinkes") {
      setIsAdminFlag(true);
    }
  }, [isAdminFlag, userProfile]);

  const handleSelectMonth = async (mId) => {
    selectMonth(mId);
    await loadMonth(mId);
  };

  const totalSteps = PNC_STEPS.length;

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
        `Laporan PNC untuk ${formatPeriode(selectedYear, selectedMonth)} berhasil disimpan dan ditandai selesai!`,
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
            Memuat Halaman Form PNC...
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
      <PncFormHeader
        puskesmasName={puskesmasName}
        targetBulin={targetBulin}
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

      <PncStatusBanners
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
        <PncReportTablePreview
          userProfile={userProfile}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      ) : (
        <>
          <PncStepNav activeStep={activeStep} onStepClick={goToStep} />

          <div
            className={`bg-surface-container-lowest border rounded-xl p-6 shadow-sm ${
              isReadOnly ? "border-rose-200" : "border-outline-variant"
            }`}
          >
            {activeStep === 1 && (
              <StepPersalinan
                values={formData}
                onChange={handleInputChange}
                targetBulin={targetBulin}
                disabled={isReadOnly || !periodDocExists}
              />
            )}
            {activeStep === 2 && (
              <StepKunjunganNifas
                values={formData}
                onChange={handleInputChange}
                disabled={isReadOnly || !periodDocExists}
              />
            )}

            <PncStepFooter
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
