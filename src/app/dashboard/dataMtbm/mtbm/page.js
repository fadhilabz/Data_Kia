// app/dashboard/mtbm/page.js
//
// Modul MTBM (Manajemen Terpadu Bayi Muda, 0-2 bulan) — SATU FILE lengkap.
//
// ASUMSI (perlu verifikasi ke Dinas):
// - CAKUPAN dilayani MTBM = Jumlah dilayani ÷ Jumlah kunjungan bayi 0-2 bulan × 100
// - "Jumlah Sasaran Neonatal" memakai field sasaranKelahiranHidup dari modul
//   Sasaran Balita (konsep sama: target kelahiran = target neonatal)
// - "Jumlah Bayi 0-11 Bulan Sasaran Proyeksi" BELUM ADA field-nya di modul
//   Sasaran Balita — untuk sementara diisi manual di sini. Kalau mau ditarik
//   otomatis, perlu tambah field "sasaranBayi011" ke modul Sasaran Balita.
// - Kolom V-X dan Y-AA di Excel labelnya nyaris sama (beda huruf besar/kecil)
//   — diasumsikan itu 2 kali penilaian (Kunjungan Awal vs Kunjungan Ulang)

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useManajemenPeriode } from '@/hooks/useManajemenPeriode';
import { STATUS_TERKUNCI, isPeriodeLocked, formatPeriode } from '@/constants/periode';
import PeriodeBulanCard from '@/components/shared/PeriodeBulanCard';

// =====================================================================
// 1. FIELD DEFINITION
// =====================================================================

const MTBM_STEPS = [
  { id: 1, label: 'Cakupan MTBM', icon: 'summarize' },
  { id: 2, label: 'Infeksi, Ikterus & Diare', icon: 'coronavirus' },
  { id: 3, label: 'HIV & Berat Badan', icon: 'monitor_weight' },
  { id: 4, label: 'Tindakan & Rujukan', icon: 'assignment' },
];

// ---- Field info umum + otomatis ----
const MTBM_INFO_FIELDS = [
  { key: 'sasaranBayi011', label: 'Jumlah Bayi (0-11 Bulan) Sasaran Proyeksi (Manual sementara)' },
  { key: 'kunjunganNeonatalLengkap', label: 'Jumlah Kunjungan Neonatal Lengkap' },
  { key: 'kunjunganBayi02Bulan', label: 'Jumlah Kunjungan Bayi 0-2 Bulan (Sakit maupun Sehat)' },
  { key: 'kunjunganBayi02BulanDilayaniMtbm', label: 'Jumlah Kunjungan Bayi 0-2 Bulan yang Dilayani MTBM' },
];

// ---- Tally diagnosis/tindakan ----
const MTBM_ITEM = [
  // Step 2
  { step: 2, key: 'infeksiSangatBerat', label: 'Penyakit Sangat Berat / Infeksi Bakteri Berat', group: 'Klasifikasi Infeksi Bakteri' },
  { step: 2, key: 'infeksiBakteriLokal', label: 'Infeksi Bakteri Lokal', group: 'Klasifikasi Infeksi Bakteri' },
  { step: 2, key: 'infeksiMungkinBukan', label: 'Mungkin Bukan Infeksi', group: 'Klasifikasi Infeksi Bakteri' },
  { step: 2, key: 'ikterusBerat', label: 'Ikterus Berat', group: 'Ikterus' },
  { step: 2, key: 'ikterus', label: 'Ikterus', group: 'Ikterus' },
  { step: 2, key: 'tidakIkterus', label: 'Tidak Ada Ikterus', group: 'Ikterus' },
  { step: 2, key: 'diareDehidrasiBerat', label: 'Dehidrasi Berat', group: 'Diare' },
  { step: 2, key: 'diareDehidrasiRinganBerat', label: 'Dehidrasi Ringan/Berat', group: 'Diare' },
  { step: 2, key: 'diareTanpaDehidrasi', label: 'Tanpa Dehidrasi', group: 'Diare' },

  // Step 3
  { step: 3, key: 'hivTerkonfirmasi', label: 'Infeksi HIV Terkonfirmasi', group: 'Status HIV' },
  { step: 3, key: 'hivTerpajanMungkin', label: 'Terpajan HIV: Mungkin Infeksi HIV', group: 'Status HIV' },
  { step: 3, key: 'hivTidakDiketahui', label: 'Infeksi HIV Tidak Diketahui', group: 'Status HIV' },
  { step: 3, key: 'hivBukanInfeksi', label: 'Bukan Infeksi HIV', group: 'Status HIV' },
  { step: 3, key: 'bbAwalSangatRendah', label: 'BB Sangat Rendah Menurut Umur', group: 'Berat Badan (Kunjungan Awal)' },
  { step: 3, key: 'bbAwalRendahMasalahAsi', label: 'BB Rendah Menurut Umur dan/atau Masalah ASI', group: 'Berat Badan (Kunjungan Awal)' },
  { step: 3, key: 'bbAwalTidakRendah', label: 'BB Tidak Rendah & Tidak Ada Masalah ASI', group: 'Berat Badan (Kunjungan Awal)' },
  { step: 3, key: 'bbUlangSangatRendah', label: 'BB Sangat Rendah Menurut Umur', group: 'Berat Badan (Kunjungan Ulang)' },
  { step: 3, key: 'bbUlangRendahMasalahAsi', label: 'BB Rendah Menurut Umur dan/atau Masalah ASI', group: 'Berat Badan (Kunjungan Ulang)' },
  { step: 3, key: 'bbUlangTidakRendah', label: 'BB Tidak Rendah & Tidak Ada Masalah ASI', group: 'Berat Badan (Kunjungan Ulang)' },

  // Step 4
  { step: 4, key: 'vitaminK1', label: 'Pemberian Vitamin K1 Hari Ini', group: 'Tindakan Hari Ini' },
  { step: 4, key: 'imunisasiHariIni', label: 'Pemberian Imunisasi Hari Ini', group: 'Tindakan Hari Ini' },
  { step: 4, key: 'sampelShk', label: 'Pengambilan Sampel SHK Hari Ini', group: 'Tindakan Hari Ini' },
  { step: 4, key: 'masalahKeluhanBayi', label: 'Masalah atau Keluhan Lain pada Bayi', group: 'Masalah / Konseling' },
  { step: 4, key: 'masalahKeluhanIbu', label: 'Masalah atau Keluhan Ibu', group: 'Masalah / Konseling' },
  { step: 4, key: 'konselingMenyusui', label: 'Konseling Cara Menyusui', group: 'Masalah / Konseling' },
  { step: 4, key: 'rujukanDalamGedung', label: 'Rujukan Dalam Gedung', group: 'Rujukan' },
  { step: 4, key: 'rujukanLuarGedung', label: 'Rujukan Luar Gedung', group: 'Rujukan' },
];

const MTBM_CATATAN_FIELD = { key: 'keterangan', label: 'Keterangan (KET)' };

const TEMPLATE_KOLOM_MTBM = {
  ...MTBM_INFO_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: 0 }), {}),
  ...MTBM_ITEM.reduce((acc, f) => ({ ...acc, [f.key]: 0 }), {}),
  [MTBM_CATATAN_FIELD.key]: '',
};

const STATUS_FIELD = 'statusReport';
const STATUS_DRAFT = 'draft';
const STATUS_SUBMITTED = 'submitted';

function getMtbmCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_mtbm`;
}
function getSasaranAnakCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_sasaran_anak`;
}

// =====================================================================
// 2. HOOK PERIODE (petugas)
// =====================================================================

function useMtbmPeriode({ isAdmin } = {}) {
  const { selectedYear, openedMonths, statusPeriodeMap, activeMonth, loading: periodeLoading } = useManajemenPeriode();
  const [selectedMonth, setSelectedMonthState] = useState(null);
  const [userManuallySelected, setUserManuallySelected] = useState(false);

  useEffect(() => {
    if (periodeLoading) return;
    if (userManuallySelected) return;
    if (activeMonth) setSelectedMonthState(activeMonth);
  }, [periodeLoading, activeMonth, userManuallySelected]);

  const periodStatusesMap = {};
  ['01','02','03','04','05','06','07','08','09','10','11','12'].forEach((b) => {
    const periodId = `${selectedYear}-${b}`;
    periodStatusesMap[b] = statusPeriodeMap?.[periodId] ?? STATUS_TERKUNCI;
  });

  const periodId = `${selectedYear}-${selectedMonth}`;
  const currentStatus = statusPeriodeMap?.[periodId] ?? STATUS_TERKUNCI;
  const periodeSudahDibuka = selectedMonth ? openedMonths.includes(selectedMonth) : false;
  const isEditable = isAdmin || (periodeSudahDibuka && !isPeriodeLocked(currentStatus));
  const isReadOnly = !isEditable;

  const selectMonth = (mId) => {
    setUserManuallySelected(true);
    setSelectedMonthState(mId);
  };

  return {
    selectedMonth, selectedYear, selectMonth,
    activePeriode: { bulan: activeMonth, tahun: selectedYear },
    periodStatusesMap, periodeLoading, isEditable, isReadOnly,
  };
}

// =====================================================================
// 3. HOOK FORM DATA (petugas)
// =====================================================================

function useMtbmFormData({ selectedYear, selectedMonth, isReadOnly }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState(TEMPLATE_KOLOM_MTBM);
  const [periodDocExists, setPeriodDocExists] = useState(null);
  const [sasaranKelahiranHidup, setSasaranKelahiranHidup] = useState(0);

  const currentCollectionName = getMtbmCollectionName(selectedYear, selectedMonth);

  const fetchSasaran = useCallback(async (puskId, year, month) => {
    try {
      const ref = doc(db, getSasaranAnakCollectionName(year, month), puskId);
      const snap = await getDoc(ref);
      setSasaranKelahiranHidup(snap.exists() ? Number(snap.data().sasaranKelahiranHidup) || 0 : 0);
    } catch (err) {
      console.error('Gagal ambil Sasaran Kelahiran Hidup:', err);
      setSasaranKelahiranHidup(0);
    }
  }, []);

  const fetchReportDataForMonth = useCallback(
    async (puskId, targetYear, targetMonth, profileForInit, canEdit) => {
      const targetCollection = getMtbmCollectionName(targetYear, targetMonth);
      if (!targetCollection || !puskId) {
        setPeriodDocExists(false);
        return;
      }
      await fetchSasaran(puskId, targetYear, targetMonth);
      try {
        const reportRef = doc(db, targetCollection, puskId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          setPeriodDocExists(true);
          const data = reportSnap.data();
          setFormData(() => {
            const merged = { ...TEMPLATE_KOLOM_MTBM };
            Object.keys(TEMPLATE_KOLOM_MTBM).forEach((key) => {
              if (data[key] !== undefined) merged[key] = data[key];
            });
            return merged;
          });
          return;
        }

        if (canEdit && profileForInit) {
          const initPayload = {
            ...TEMPLATE_KOLOM_MTBM,
            puskesmasId: puskId,
            namaPuskesmas: profileForInit.namaPuskesmas || puskId,
            [STATUS_FIELD]: STATUS_DRAFT,
            updatedAt: serverTimestamp(),
          };
          await setDoc(reportRef, initPayload, { merge: true });
          setPeriodDocExists(true);
          setFormData(TEMPLATE_KOLOM_MTBM);
        } else {
          setPeriodDocExists(false);
          setFormData(TEMPLATE_KOLOM_MTBM);
        }
      } catch (err) {
        console.error('Error fetching MTBM report data:', err);
        setPeriodDocExists(false);
        setFormData(TEMPLATE_KOLOM_MTBM);
      }
    },
    [fetchSasaran]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }
      try {
        const userRef = doc(db, 'users', user.email);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const uData = userSnap.data();
          setUserProfile(uData);
          if (uData.puskesmasId) {
            await fetchReportDataForMonth(uData.puskesmasId, selectedYear, selectedMonth, uData, !isReadOnly);
          }
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Error initializing Form MTBM:', err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router, selectedYear, selectedMonth, fetchReportDataForMonth, isReadOnly]);

  const loadMonth = useCallback(
    async (mId) => {
      if (userProfile?.puskesmasId) {
        await fetchReportDataForMonth(userProfile.puskesmasId, selectedYear, mId, userProfile, !isReadOnly);
      }
    },
    [userProfile, selectedYear, fetchReportDataForMonth, isReadOnly]
  );

  const saveToFirestore = useCallback(
    async (dataToSave, statusReport = STATUS_DRAFT) => {
      if (isReadOnly || !periodDocExists || !userProfile?.puskesmasId) return;
      setAutoSaveStatus('saving');
      const periodeId = `${selectedYear}-${selectedMonth}`;
      const reportPayload = {
        puskesmasId: userProfile.puskesmasId,
        namaPuskesmas: userProfile.namaPuskesmas || userProfile.puskesmasId,
        periode: periodeId,
        ...dataToSave,
        [STATUS_FIELD]: statusReport,
        updatedAt: serverTimestamp(),
        updatedBy: userProfile.email,
      };
      try {
        await setDoc(doc(db, currentCollectionName, userProfile.puskesmasId), reportPayload, { merge: true });
        setAutoSaveStatus('saved');
      } catch (err) {
        console.error('Error saving MTBM report:', err);
        setAutoSaveStatus('error');
      }
    },
    [isReadOnly, periodDocExists, userProfile, currentCollectionName, selectedYear, selectedMonth]
  );

  const handleInputChange = (e) => {
    if (isReadOnly || !periodDocExists) return;
    const { name, value, type } = e.target;
    if (type === 'text' || type === 'textarea') {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }
    const val = Math.max(0, parseInt(value, 10) || 0);
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleFinalSubmit = async () => {
    if (isReadOnly || !periodDocExists) return false;
    setSaving(true);
    try {
      await saveToFirestore(formData, STATUS_SUBMITTED);
      return true;
    } catch (err) {
      console.error('Error submitting final MTBM report:', err);
      alert('Gagal menyimpan laporan final: ' + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading, saving, autoSaveStatus, userProfile, formData, periodDocExists,
    sasaranKelahiranHidup, loadMonth, saveToFirestore, handleInputChange, handleFinalSubmit,
  };
}

// =====================================================================
// 4. KOMPONEN
// =====================================================================

function FieldNumber({ label, name, value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
      <input
        type="number" min="0" name={name} value={value ?? 0} onChange={onChange} disabled={disabled}
        className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function FieldOtomatis({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-on-surface-variant">{label} (Otomatis)</label>
      <div className="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-high text-on-surface text-sm font-bold">
        {value}
      </div>
    </div>
  );
}

function groupByLabel(fields) {
  const groups = [];
  const idx = {};
  fields.forEach((f) => {
    if (!(f.group in idx)) {
      idx[f.group] = groups.length;
      groups.push({ group: f.group, fields: [] });
    }
    groups[idx[f.group]].fields.push(f);
  });
  return groups;
}

function StepCakupan({ values, onChange, disabled, sasaranKelahiranHidup }) {
  const kunjungan = Number(values.kunjunganBayi02Bulan) || 0;
  const dilayani = Number(values.kunjunganBayi02BulanDilayaniMtbm) || 0;
  const cakupan = kunjungan > 0 ? ((dilayani / kunjungan) * 100).toFixed(1) : '-';

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-sm text-blue-800">
        Jumlah Sasaran Neonatal (dari Sasaran Kelahiran Hidup, modul Sasaran Balita): <strong>{sasaranKelahiranHidup}</strong>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldNumber label={MTBM_INFO_FIELDS[0].label} name="sasaranBayi011" value={values.sasaranBayi011} onChange={onChange} disabled={disabled} />
        <FieldNumber label={MTBM_INFO_FIELDS[1].label} name="kunjunganNeonatalLengkap" value={values.kunjunganNeonatalLengkap} onChange={onChange} disabled={disabled} />
        <FieldNumber label={MTBM_INFO_FIELDS[2].label} name="kunjunganBayi02Bulan" value={values.kunjunganBayi02Bulan} onChange={onChange} disabled={disabled} />
        <FieldNumber label={MTBM_INFO_FIELDS[3].label} name="kunjunganBayi02BulanDilayaniMtbm" value={values.kunjunganBayi02BulanDilayaniMtbm} onChange={onChange} disabled={disabled} />
        <FieldOtomatis label="Cakupan Dilayani MTBM (%)" value={cakupan} />
      </div>
    </div>
  );
}

function StepItemGeneric({ stepId, values, onChange, disabled }) {
  const fieldsStepIni = MTBM_ITEM.filter((f) => f.step === stepId);
  const grouped = groupByLabel(fieldsStepIni);
  return (
    <div className="space-y-6">
      {grouped.map((g) => (
        <div key={g.group}>
          <h3 className="font-bold text-sm text-primary mb-3">{g.group}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {g.fields.map((f) => (
              <FieldNumber key={f.key} label={f.label} name={f.key} value={values[f.key]} onChange={onChange} disabled={disabled} />
            ))}
          </div>
        </div>
      ))}
      {stepId === 4 && (
        <div>
          <h3 className="font-bold text-sm text-primary mb-3">{MTBM_CATATAN_FIELD.label}</h3>
          <textarea
            name={MTBM_CATATAN_FIELD.key} value={values[MTBM_CATATAN_FIELD.key] ?? ''} onChange={onChange} disabled={disabled} rows={3}
            placeholder="Catatan tambahan (jika ada)..."
            className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm disabled:opacity-60"
          />
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 5. HALAMAN UTAMA
// =====================================================================

export default function FormMtbmPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [isAdminFlag, setIsAdminFlag] = useState(false);

  const {
    selectedMonth, selectedYear, selectMonth, activePeriode,
    periodStatusesMap, periodeLoading, isEditable, isReadOnly,
  } = useMtbmPeriode({ isAdmin: isAdminFlag });

  const {
    loading, saving, autoSaveStatus, userProfile, formData, periodDocExists,
    sasaranKelahiranHidup, loadMonth, saveToFirestore, handleInputChange, handleFinalSubmit,
  } = useMtbmFormData({ selectedYear, selectedMonth, isReadOnly });

  useEffect(() => {
    if (!isAdminFlag && userProfile?.role === 'admin_dinkes') setIsAdminFlag(true);
  }, [isAdminFlag, userProfile]);

  const handleSelectMonth = async (mId) => {
    selectMonth(mId);
    await loadMonth(mId);
  };

  const totalSteps = MTBM_STEPS.length;

  const goToStep = (stepNumber) => {
    if (stepNumber < 1 || stepNumber > totalSteps) return;
    if (isEditable && periodDocExists) saveToFirestore(formData, STATUS_DRAFT);
    setActiveStep(stepNumber);
  };

  const onFinalSubmit = async () => {
    const ok = await handleFinalSubmit();
    if (ok) {
      alert(`Laporan MTBM untuk ${formatPeriode(selectedYear, selectedMonth)} berhasil disimpan dan ditandai selesai!`);
      window.location.href = '/dashboard';
    }
  };

  if (loading || periodeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant font-medium text-xs">Memuat Halaman Form MTBM...</p>
        </div>
      </div>
    );
  }

  const puskesmasName =
    userProfile?.namaPuskesmas ||
    (userProfile?.puskesmasId
      ? userProfile.puskesmasId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Puskesmas');

  const periodLabel = formatPeriode(selectedYear, selectedMonth);
  const disabled = isReadOnly || !periodDocExists;
  const isLastStep = activeStep >= totalSteps;

  return (
    <main className="flex-1 p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-6">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-bold text-lg text-primary">Form MTBM (Bayi Muda 0-2 Bulan) — {puskesmasName}</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Periode: <span className="font-semibold">{periodLabel}</span>
          </p>
        </div>
        <div className="text-xs">
          {autoSaveStatus === 'saving' && <span className="text-on-surface-variant">Menyimpan draft...</span>}
          {autoSaveStatus === 'saved' && <span className="text-emerald-600 font-medium">Tersimpan</span>}
          {autoSaveStatus === 'error' && <span className="text-red-600 font-medium">Gagal menyimpan</span>}
        </div>
      </div>

      <PeriodeBulanCard
        selectedMonth={selectedMonth}
        onSelectMonth={handleSelectMonth}
        year={selectedYear}
        statusPeriodeMap={periodStatusesMap}
        activeMonth={activePeriode?.bulan}
      />

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

      <div className="flex flex-wrap gap-2">
        {MTBM_STEPS.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => goToStep(step.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeStep === step.id
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-base">{step.icon}</span>
            {step.id}. {step.label}
          </button>
        ))}
      </div>

      <div className={`bg-surface-container-lowest border rounded-xl p-6 shadow-sm ${isReadOnly ? 'border-rose-200' : 'border-outline-variant'}`}>
        {activeStep === 1 ? (
          <StepCakupan values={formData} onChange={handleInputChange} disabled={disabled} sasaranKelahiranHidup={sasaranKelahiranHidup} />
        ) : (
          <StepItemGeneric stepId={activeStep} values={formData} onChange={handleInputChange} disabled={disabled} />
        )}

        {isEditable && periodDocExists && (
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => goToStep(activeStep - 1)}
              disabled={activeStep <= 1}
              className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container-high disabled:opacity-40"
            >
              Kembali
            </button>
            {isLastStep ? (
              <button
                type="button"
                onClick={onFinalSubmit}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Submit Final'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goToStep(activeStep + 1)}
                className="px-5 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90"
              >
                Lanjut
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}