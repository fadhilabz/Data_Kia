// app/dashboard/kn/page.jsx
// Halaman Form Input KN Petugas Puskesmas — struktur identik
// app/dashboard/pnc/page.jsx (SUDAH termasuk deteksi Admin: kalau yang
// login Admin, langsung tampilkan rekap read-only, skip wizard & banner).

"use client";

import { useState, useEffect } from "react";
import { formatPeriode } from "@/constants/periode";
import { useKnPeriode } from "@/lib/libAnak/kn/useKnPeriode";
import { useKnFormData } from "@/lib/libAnak/kn/useKnFormData";
import { STATUS_DRAFT } from "@/lib/libAnak/kn/knConfig";

import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";
import KnFormHeader from "@/components/comAnak/kn/form/KnFormHeader";
import KnStatusBanners from "@/components/comAnak/kn/form/KnStatusBanners";
import KnStepNav, { KN_STEPS } from "@/components/comAnak/kn/form/KnStepNav";
import KnStepFooter from "@/components/comAnak/kn/form/KnStepFooter";
import StepKn from "@/components/comAnak/kn/form/StepKn";
import KnReportTablePreview from "@/components/comAnak/kn/table/KnReportTablePreview";

export default function FormKNPage() {
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
  } = useKnPeriode({ isAdmin: isAdminFlag });

  const {
    loading,
    saving,
    autoSaveStatus,
    userProfile,
    targetSasaran,
    formData,
    periodDocExists,
    loadMonth,
    saveToFirestore,
    handleInputChange,
    handleFinalSubmit,
  } = useKnFormData({ selectedYear, selectedMonth, isReadOnly });

  useEffect(() => {
    if (isAdminFlag) return;
    if (!userProfile) return;
    const looksLikeAdmin =
      userProfile.role === "admin_dinkes" || !userProfile.puskesmasId;
    if (looksLikeAdmin) {
      setIsAdminFlag(true);
    }
  }, [isAdminFlag, userProfile]);

  const handleSelectMonth = async (mId) => {
    selectMonth(mId);
    await loadMonth(mId);
  };

  const totalSteps = KN_STEPS.length;

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
        `Laporan KN untuk ${formatPeriode(selectedYear, selectedMonth)} berhasil disimpan dan ditandai selesai!`,
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
            Memuat Halaman Form KN...
          </p>
        </div>
      </div>
    );
  }

  const periodLabel = formatPeriode(selectedYear, selectedMonth);

  // ---- Tampilan khusus ADMIN: sama seperti perbaikan di dashboard/pnc,
  // Admin tidak punya puskesmasId, jadi tidak ada data individu untuk
  // diisi lewat wizard ini — cukup tampilkan rekap read-only.
  if (isAdminFlag) {
    return (
      <main className="flex-1 p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
          <h1 className="text-xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">table_view</span>
            Rekapitulasi KN Seluruh Puskesmas
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Mode Admin — tampilan ringkas (read-only). Untuk fitur pencarian,
            zoom, dan export .xlsx, gunakan halaman{" "}
            <span className="font-semibold text-primary">Lihat Form KN</span> di menu Admin.
          </p>
        </div>

        <PeriodeBulanCard
          selectedMonth={selectedMonth}
          onSelectMonth={handleSelectMonth}
          year={selectedYear}
          statusPeriodeMap={periodStatusesMap}
          activeMonth={activePeriode?.bulan}
        />

        <KnReportTablePreview
          userProfile={userProfile}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </main>
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

  return (
    <main className="flex-1 p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-6">
      <KnFormHeader
        puskesmasName={puskesmasName}
        targetSasaran={targetSasaran}
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

      <KnStatusBanners
        periodDocExists={periodDocExists}
        isReadOnly={isReadOnly}
        periodLabel={periodLabel}
      />

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
          <span className="material-symbols-outlined text-base">table_view</span>
          Lihat Rekapitulasi
        </button>
      </div>

      {activeViewTab === "preview" ? (
        <KnReportTablePreview
          userProfile={userProfile}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      ) : (
        <>
          <KnStepNav activeStep={activeStep} onStepClick={goToStep} />

          <div
            className={`bg-surface-container-lowest border rounded-xl p-6 shadow-sm ${
              isReadOnly ? "border-rose-200" : "border-outline-variant"
            }`}
          >
            <StepKn
              groups={KN_STEPS.find((s) => s.id === activeStep)?.groups || []}
              formData={formData}
              pkm={{ sasaranKelahiranHidup: targetSasaran }}
              onChange={handleInputChange}
              disabled={isReadOnly || !periodDocExists}
            />

            <KnStepFooter
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