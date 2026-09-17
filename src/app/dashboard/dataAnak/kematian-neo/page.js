// app/dashboard/kematian-neo/page.jsx
"use client";

import { useState, useEffect } from "react";
import { formatPeriode } from "@/constants/periode";
import { useKematianNeoPeriode } from "@/lib/libAnak/kematian-neo/useKematianNeoPeriode";
import { useKematianNeoFormData } from "@/lib/libAnak/kematian-neo/useKematianNeoFormData";
import { STATUS_DRAFT } from "@/lib/libAnak/kematian-neo/kematianNeoConfig";
import { KEMATIAN_NEO_GROUPS } from "@/constants/kematianNeoFields";

import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";
import KematianNeoFormHeader from "@/components/comAnak/kematian-neo/form/KematianNeoFormHeader";
import KematianNeoStatusBanners from "@/components/comAnak/kematian-neo/form/KematianNeoStatusBanners";
import KematianNeoGroupSection from "@/components/comAnak/kematian-neo/form/KematianNeoGroupSection";
import KematianNeoSubmitFooter from "@/components/comAnak/kematian-neo/form/KematianNeoSubmitFooter";
import KematianNeoReportTablePreview from "@/components/comAnak/kematian-neo/table/KematianNeoReportTablePreview";

export default function FormKematianNeoPage() {
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
  } = useKematianNeoPeriode({ isAdmin: isAdminFlag });

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
  } = useKematianNeoFormData({ selectedYear, selectedMonth, isReadOnly });

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

  // Autosave tiap kali formData berubah cukup lama (debounce sederhana lewat
  // save di titik interaksi penting) — di sini kita simpan tiap onChange
  // dengan cara memanggil saveToFirestore setelah update lokal (mirip pola
  // ANCT single-page: auto-save saat blur/ganti tab, bukan tiap keystroke).
  const onFieldChange = (name, value, isText = false) => {
    handleInputChange(name, value, isText);
  };

  const onSubmit = async () => {
    // simpan draft dulu (jaga-jaga ada perubahan terakhir belum ke-flush)
    await saveToFirestore(formData, STATUS_DRAFT);
    const ok = await handleFinalSubmit();
    if (ok) {
      alert(
        `Laporan Kematian Neonatal untuk ${formatPeriode(selectedYear, selectedMonth)} berhasil disimpan dan ditandai selesai!`
      );
      window.location.href = "/dashboard";
    }
  };

  if (loading || periodeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant font-medium text-xs">Memuat Halaman Form Kematian Neonatal...</p>
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
            Rekapitulasi Kematian Neonatal Seluruh Puskesmas
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Mode Admin — tampilan ringkas (read-only). Gunakan halaman{" "}
            <span className="font-semibold text-primary">Data Kematian Ibu &amp; Bayi</span> di menu Admin untuk fitur lengkap.
          </p>
        </div>
        <PeriodeBulanCard
          selectedMonth={selectedMonth}
          onSelectMonth={handleSelectMonth}
          year={selectedYear}
          statusPeriodeMap={periodStatusesMap}
          activeMonth={activePeriode?.bulan}
        />
        <KematianNeoReportTablePreview userProfile={userProfile} selectedMonth={selectedMonth} selectedYear={selectedYear} />
      </main>
    );
  }

  const puskesmasName =
    userProfile?.namaPuskesmas ||
    (userProfile?.puskesmasId
      ? userProfile.puskesmasId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : "Puskesmas");

  const disabled = isReadOnly || !periodDocExists;

  return (
    <main className="flex-1 p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-6">
      <KematianNeoFormHeader
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

      <KematianNeoStatusBanners periodDocExists={periodDocExists} isReadOnly={isReadOnly} periodLabel={periodLabel} />

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
        <KematianNeoReportTablePreview userProfile={userProfile} selectedMonth={selectedMonth} selectedYear={selectedYear} />
      ) : (
        <div
          className={`bg-surface-container-lowest border rounded-xl p-6 shadow-sm space-y-5 ${
            isReadOnly ? "border-rose-200" : "border-outline-variant"
          }`}
        >
          {KEMATIAN_NEO_GROUPS.map((group) => (
            <KematianNeoGroupSection
              key={group.key}
              group={group}
              formData={formData}
              onChange={onFieldChange}
              disabled={disabled}
            />
          ))}

          <KematianNeoSubmitFooter
            onSubmit={onSubmit}
            saving={saving}
            isEditable={isEditable}
            periodDocExists={periodDocExists}
          />
        </div>
      )}
    </main>
  );
}