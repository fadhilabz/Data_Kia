// app/dashboard/dataAnak/kmb/page.js
"use client";

import { useState, useEffect } from "react";
import { formatPeriode } from "@/constants/periode";
import { useKmbPeriode } from "@/lib/libAnak/kmb/useKmbPeriode";
import { useKmbFormData } from "@/lib/libAnak/kmb/useKmbFormData";

import PeriodeBulanCard from "@/components/shared/PeriodeBulanCard";
import KmbFormHeader from "@/components/comAnak/kmb/form/KmbFormHeader";
import KmbStatusBanners from "@/components/comAnak/kmb/form/KmbStatusBanners";
import KmbKasusCard from "@/components/comAnak/kmb/form/KmbKasusCard";
import KmbReportTablePreview from "@/components/comAnak/kmb/table/KmbReportTablePreview";

export default function FormKMBPage() {
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
  } = useKmbPeriode({ isAdmin: isAdminFlag });

  const {
    loading,
    saving,
    autoSaveStatus,
    userProfile,
    formData,
    periodDocExists,
    loadMonth,
    saveToFirestore,
    tambahKasus,
    hapusKasus,
    ubahKasus,
    handleFinalSubmit,
  } = useKmbFormData({ selectedYear, selectedMonth, isReadOnly });

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
    await saveToFirestore(formData);
    const ok = await handleFinalSubmit();
    if (ok) {
      alert(`Laporan KMB untuk ${formatPeriode(selectedYear, selectedMonth)} berhasil disimpan dan ditandai selesai!`);
      window.location.href = "/dashboard";
    }
  };

  // Auto-save tiap kali daftar kasus berubah (tambah/hapus/edit)
  useEffect(() => {
    if (!isEditable || !periodDocExists) return;
    const t = setTimeout(() => {
      saveToFirestore(formData);
    }, 800); // debounce ringan biar tidak nulis tiap keystroke
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.kasusList]);

  if (loading || periodeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant font-medium text-xs">Memuat Halaman Form KMB...</p>
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
            Rekapitulasi Kematian Balita & Anak Seluruh Puskesmas
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Mode Admin — tampilan ringkas (read-only). Gunakan halaman{" "}
            <span className="font-semibold text-primary">Pel. Balita dan Kematian</span> di menu Admin untuk fitur lengkap.
          </p>
        </div>
        <PeriodeBulanCard
          selectedMonth={selectedMonth}
          onSelectMonth={handleSelectMonth}
          year={selectedYear}
          statusPeriodeMap={periodStatusesMap}
          activeMonth={activePeriode?.bulan}
        />
        <KmbReportTablePreview userProfile={userProfile} selectedMonth={selectedMonth} selectedYear={selectedYear} />
      </main>
    );
  }

  const puskesmasName =
    userProfile?.namaPuskesmas ||
    (userProfile?.puskesmasId
      ? userProfile.puskesmasId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : "Puskesmas");

  const disabled = isReadOnly || !periodDocExists;
  const kasusList = formData.kasusList || [];

  return (
    <main className="flex-1 p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-6">
      <KmbFormHeader
        puskesmasName={puskesmasName}
        autoSaveStatus={autoSaveStatus}
        isEditable={isEditable}
        periodLabel={periodLabel}
        jumlahKasus={kasusList.length}
      />

      <PeriodeBulanCard
        selectedMonth={selectedMonth}
        onSelectMonth={handleSelectMonth}
        year={selectedYear}
        statusPeriodeMap={periodStatusesMap}
        activeMonth={activePeriode?.bulan}
      />

      <KmbStatusBanners periodDocExists={periodDocExists} isReadOnly={isReadOnly} periodLabel={periodLabel} />

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
        <KmbReportTablePreview userProfile={userProfile} selectedMonth={selectedMonth} selectedYear={selectedYear} />
      ) : (
        <div className={`bg-surface-container-lowest border rounded-xl p-6 shadow-sm space-y-4 ${isReadOnly ? "border-rose-200" : "border-outline-variant"}`}>
          {kasusList.length === 0 && (
            <div className="text-center py-8 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl block mb-2 opacity-40">check_circle</span>
              Belum ada kasus kematian Balita/Anak yang dilaporkan bulan ini.
            </div>
          )}

          {kasusList.map((kasus, idx) => (
            <KmbKasusCard
              key={kasus.id}
              kasus={kasus}
              index={idx}
              onChange={ubahKasus}
              onHapus={hapusKasus}
              disabled={disabled}
            />
          ))}

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={tambahKasus}
              disabled={disabled}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-primary text-primary hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Tambah Kasus
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={disabled || saving}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">{saving ? "progress_activity" : "send"}</span>
              {saving ? "Mengirim..." : "Kirim Laporan"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}