// app/dashboard/kesprocatin/page.js
//
// Modul Kesprocatin (Kesehatan Reproduksi Calon Pengantin) — SATU FILE
// lengkap. Data BULANAN BIASA (bukan kumulatif, beda dari SDM/KB Aktif).
//
// ASUMSI PEMBAGI % (perlu verifikasi ke Dinas — rumus Excel tidak terlihat):
// - Indikator kesehatan Perempuan -> % dari Catin Perempuan Dilayani
// - Indikator kesehatan Laki-laki -> % dari Catin Laki-laki Dilayani
// - Indikator "positif" (HIV+, Sifilis+, dst) -> % dari yang DIPERIKSA (bukan dilayani)
// - Thalasemia Pasangan -> % dari Total Dilayani (perkiraan kasar)

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

const KESPROCATIN_STEPS = [
  { id: 1, label: 'Pendaftaran & Dilayani', icon: 'how_to_reg' },
  { id: 2, label: 'Skrining Kesehatan Umum', icon: 'health_and_safety' },
  { id: 3, label: 'Darah & Genetik', icon: 'bloodtype' },
  { id: 4, label: 'HIV & Sifilis', icon: 'coronavirus' },
  { id: 5, label: 'Hepatitis B & Risiko Gabungan', icon: 'vaccines' },
  { id: 6, label: 'DM & Masalah Kesehatan', icon: 'psychology' },
];

const KESPROCATIN_REGISTRASI = [
  { key: 'kuaIslam', label: 'Catin Terdaftar di KUA (Islam)' },
  { key: 'sipilNonMuslim', label: 'Catin Terdaftar di Pencatatan Sipil (Non Muslim)' },
];

const KESPROCATIN_DILAYANI = [
  { key: 'catinPerempuanDilayani', label: 'Catin Perempuan Dilayani', denomTotal: 'P' },
  { key: 'catinLakiDilayani', label: 'Catin Laki-laki Dilayani', denomTotal: 'L' },
];

const KESPROCATIN_INDIKATOR = [
  { step: 2, key: 't5Td', label: 'Catin Perempuan Status T5 / Imunisasi Td', denom: 'dilayaniP', group: 'Status Imunisasi Td' },
  { step: 2, key: 'anemia', label: 'Catin Perempuan dengan Anemia', denom: 'dilayaniP', group: 'Status Gizi Perempuan' },
  { step: 2, key: 'kekuranganGizi', label: 'Catin Perempuan dengan Kekurangan Gizi', denom: 'dilayaniP', group: 'Status Gizi Perempuan' },
  { step: 2, key: 'obesitas', label: 'Catin Perempuan dengan Obesitas', denom: 'dilayaniP', group: 'Status Gizi Perempuan' },
  { step: 2, key: 'hipertensi', label: 'Catin Perempuan dengan Hipertensi', denom: 'dilayaniP', group: 'Status Gizi Perempuan' },

  { step: 3, key: 'mcvMchPerempuan', label: 'Catin Perempuan Diperiksa MCV & MCH', denom: 'dilayaniP', group: 'Pemeriksaan MCV/MCH' },
  { step: 3, key: 'mcvMchLaki', label: 'Catin Laki-laki Diperiksa MCV & MCH', denom: 'dilayaniL', group: 'Pemeriksaan MCV/MCH' },
  { step: 3, key: 'thalasemiaPerempuan', label: 'Catin Perempuan Carrier / Thalasemia', denom: 'mcvMchPerempuan', group: 'Thalasemia' },
  { step: 3, key: 'thalasemiaLaki', label: 'Catin Laki-laki Carrier / Thalasemia', denom: 'mcvMchLaki', group: 'Thalasemia' },
  { step: 3, key: 'thalasemiaPasangan', label: 'Pasangan Catin (L & P) Carrier / Thalasemia', denom: 'dilayaniTotal', group: 'Thalasemia' },

  { step: 4, key: 'hivDiperiksaPerempuan', label: 'Catin Perempuan Diperiksa HIV', denom: 'dilayaniP', group: 'HIV' },
  { step: 4, key: 'hivDiperiksaLaki', label: 'Catin Laki-laki Diperiksa HIV', denom: 'dilayaniL', group: 'HIV' },
  { step: 4, key: 'hivPositifPerempuan', label: 'Catin Perempuan HIV (+)', denom: 'hivDiperiksaPerempuan', group: 'HIV' },
  { step: 4, key: 'hivPositifLaki', label: 'Catin Laki-laki HIV (+)', denom: 'hivDiperiksaLaki', group: 'HIV' },
  { step: 4, key: 'sifilisDiperiksaPerempuan', label: 'Catin Perempuan Diperiksa Sifilis', denom: 'dilayaniP', group: 'Sifilis' },
  { step: 4, key: 'sifilisDiperiksaLaki', label: 'Catin Laki-laki Diperiksa Sifilis', denom: 'dilayaniL', group: 'Sifilis' },
  { step: 4, key: 'sifilisPositifPerempuan', label: 'Catin Perempuan Sifilis (+)', denom: 'sifilisDiperiksaPerempuan', group: 'Sifilis' },
  { step: 4, key: 'sifilisPositifLaki', label: 'Catin Laki-laki Sifilis (+)', denom: 'sifilisDiperiksaLaki', group: 'Sifilis' },

  { step: 5, key: 'hepBDiperiksaPerempuan', label: 'Catin Perempuan Diperiksa Hepatitis B', denom: 'dilayaniP', group: 'Hepatitis B' },
  { step: 5, key: 'hepBDiperiksaLaki', label: 'Catin Laki-laki Diperiksa Hepatitis B', denom: 'dilayaniL', group: 'Hepatitis B' },
  { step: 5, key: 'hepBPositifPerempuan', label: 'Catin Perempuan Hepatitis B (+)', denom: 'hepBDiperiksaPerempuan', group: 'Hepatitis B' },
  { step: 5, key: 'hepBPositifLaki', label: 'Catin Laki-laki Hepatitis B (+)', denom: 'hepBDiperiksaLaki', group: 'Hepatitis B' },
  { step: 5, key: 'lakiRisikoGabungan', label: 'Catin Laki-laki dengan HIV/Sifilis/Hepatitis B/TBC', denom: 'dilayaniL', group: 'Risiko Gabungan' },

  { step: 6, key: 'dmDiperiksaPerempuan', label: 'Catin Perempuan Diperiksa DM', denom: 'dilayaniP', group: 'Diabetes Mellitus' },
  { step: 6, key: 'dmPositifPerempuan', label: 'Catin Perempuan DM (+)', denom: 'dmDiperiksaPerempuan', group: 'Diabetes Mellitus' },
  { step: 6, key: 'masalahKesehatanPerempuan', label: 'Catin Perempuan Mempunyai Masalah Kesehatan', denom: 'dilayaniP', group: 'Masalah Kesehatan' },
  { step: 6, key: 'masalahKesehatanLaki', label: 'Catin Laki-laki Mempunyai Masalah Kesehatan', denom: 'dilayaniL', group: 'Masalah Kesehatan' },
  { step: 6, key: 'masalahJiwaPerempuan', label: 'Catin Perempuan Mempunyai Masalah Kesehatan Jiwa', denom: 'dilayaniP', group: 'Masalah Kesehatan Jiwa' },
  { step: 6, key: 'masalahJiwaLaki', label: 'Catin Laki-laki Mempunyai Masalah Kesehatan Jiwa', denom: 'dilayaniL', group: 'Masalah Kesehatan Jiwa' },
];

const TEMPLATE_KOLOM_KESPROCATIN = {
  ...KESPROCATIN_REGISTRASI.reduce((acc, r) => ({ ...acc, [`${r.key}L`]: 0, [`${r.key}P`]: 0 }), {}),
  ...KESPROCATIN_DILAYANI.reduce((acc, d) => ({ ...acc, [d.key]: 0 }), {}),
  ...KESPROCATIN_INDIKATOR.reduce((acc, i) => ({ ...acc, [i.key]: 0 }), {}),
};

const STATUS_FIELD = 'statusReport';
const STATUS_DRAFT = 'draft';
const STATUS_SUBMITTED = 'submitted';

function getKesprocatinCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_kesprocatin`;
}

function hitungRegistrasiAbs(values, key) {
  return (Number(values[`${key}L`]) || 0) + (Number(values[`${key}P`]) || 0);
}

function hitungTotalCatin(values) {
  const totalL = KESPROCATIN_REGISTRASI.reduce((sum, r) => sum + (Number(values[`${r.key}L`]) || 0), 0);
  const totalP = KESPROCATIN_REGISTRASI.reduce((sum, r) => sum + (Number(values[`${r.key}P`]) || 0), 0);
  return { totalL, totalP, totalAbs: totalL + totalP };
}

function hitungDilayaniPersen(values, item, totalCatin) {
  const abs = Number(values[item.key]) || 0;
  const denomVal = item.denomTotal === 'P' ? totalCatin.totalP : totalCatin.totalL;
  if (!denomVal || denomVal <= 0) return '-';
  return ((abs / denomVal) * 100).toFixed(1);
}

function resolveDenomVal(denomKey, values) {
  if (denomKey === 'dilayaniP') return Number(values.catinPerempuanDilayani) || 0;
  if (denomKey === 'dilayaniL') return Number(values.catinLakiDilayani) || 0;
  if (denomKey === 'dilayaniTotal') {
    return (Number(values.catinPerempuanDilayani) || 0) + (Number(values.catinLakiDilayani) || 0);
  }
  return Number(values[denomKey]) || 0;
}

function hitungIndikatorPersen(values, item) {
  const abs = Number(values[item.key]) || 0;
  const denomVal = resolveDenomVal(item.denom, values);
  if (!denomVal || denomVal <= 0) return '-';
  return ((abs / denomVal) * 100).toFixed(1);
}

// =====================================================================
// 2. HOOK PERIODE (petugas)
// =====================================================================

function useKesprocatinPeriode({ isAdmin } = {}) {
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

function useKesprocatinFormData({ selectedYear, selectedMonth, isReadOnly }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState(TEMPLATE_KOLOM_KESPROCATIN);
  const [periodDocExists, setPeriodDocExists] = useState(null);

  const currentCollectionName = getKesprocatinCollectionName(selectedYear, selectedMonth);

  const fetchReportDataForMonth = useCallback(
    async (puskId, targetYear, targetMonth, profileForInit, canEdit) => {
      const targetCollection = getKesprocatinCollectionName(targetYear, targetMonth);
      if (!targetCollection || !puskId) {
        setPeriodDocExists(false);
        return;
      }
      try {
        const reportRef = doc(db, targetCollection, puskId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          setPeriodDocExists(true);
          const data = reportSnap.data();
          setFormData(() => {
            const merged = { ...TEMPLATE_KOLOM_KESPROCATIN };
            Object.keys(TEMPLATE_KOLOM_KESPROCATIN).forEach((key) => {
              if (data[key] !== undefined) merged[key] = data[key];
            });
            return merged;
          });
          return;
        }

        if (canEdit && profileForInit) {
          const initPayload = {
            ...TEMPLATE_KOLOM_KESPROCATIN,
            puskesmasId: puskId,
            namaPuskesmas: profileForInit.namaPuskesmas || puskId,
            [STATUS_FIELD]: STATUS_DRAFT,
            updatedAt: serverTimestamp(),
          };
          await setDoc(reportRef, initPayload, { merge: true });
          setPeriodDocExists(true);
          setFormData(TEMPLATE_KOLOM_KESPROCATIN);
        } else {
          setPeriodDocExists(false);
          setFormData(TEMPLATE_KOLOM_KESPROCATIN);
        }
      } catch (err) {
        console.error('Error fetching Kesprocatin report data:', err);
        setPeriodDocExists(false);
        setFormData(TEMPLATE_KOLOM_KESPROCATIN);
      }
    },
    []
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
        console.error('Error initializing Form Kesprocatin:', err);
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
        console.error('Error saving Kesprocatin report:', err);
        setAutoSaveStatus('error');
      }
    },
    [isReadOnly, periodDocExists, userProfile, currentCollectionName, selectedYear, selectedMonth]
  );

  const handleInputChange = (e) => {
    if (isReadOnly || !periodDocExists) return;
    const { name, value } = e.target;
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
      console.error('Error submitting final Kesprocatin report:', err);
      alert('Gagal menyimpan laporan final: ' + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading, saving, autoSaveStatus, userProfile, formData, periodDocExists,
    loadMonth, saveToFirestore, handleInputChange, handleFinalSubmit,
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

function StepPendaftaranDilayani({ values, onChange, disabled }) {
  const totalCatin = hitungTotalCatin(values);
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm text-primary mb-3">Pendaftaran Catin</h3>
        <div className="space-y-3">
          {KESPROCATIN_REGISTRASI.map((r) => {
            const abs = hitungRegistrasiAbs(values, r.key);
            return (
              <div key={r.key} className="border border-outline-variant rounded-lg p-3">
                <p className="text-xs font-semibold text-on-surface mb-2">{r.label}</p>
                <div className="grid grid-cols-3 gap-3">
                  <FieldNumber label="L (Laki-laki)" name={`${r.key}L`} value={values[`${r.key}L`]} onChange={onChange} disabled={disabled} />
                  <FieldNumber label="P (Perempuan)" name={`${r.key}P`} value={values[`${r.key}P`]} onChange={onChange} disabled={disabled} />
                  <FieldOtomatis label="ABS" value={abs} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-on-surface-variant mt-3">
          Total Catin Tercatat (Otomatis): L = <strong>{totalCatin.totalL}</strong>, P = <strong>{totalCatin.totalP}</strong>, Total = <strong>{totalCatin.totalAbs}</strong>
        </p>
      </div>

      <div>
        <h3 className="font-bold text-sm text-primary mb-3">Catin Dilayani</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {KESPROCATIN_DILAYANI.map((d) => (
            <FieldNumber key={d.key} label={d.label} name={d.key} value={values[d.key]} onChange={onChange} disabled={disabled} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {KESPROCATIN_DILAYANI.map((d) => (
            <FieldOtomatis key={`${d.key}-pct`} label={`% ${d.label}`} value={hitungDilayaniPersen(values, d, totalCatin)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepIndikatorGeneric({ stepId, values, onChange, disabled }) {
  const fieldsStepIni = KESPROCATIN_INDIKATOR.filter((f) => f.step === stepId);
  const grouped = groupByLabel(fieldsStepIni);

  return (
    <div className="space-y-6">
      {grouped.map((g) => (
        <div key={g.group}>
          <h3 className="font-bold text-sm text-primary mb-3">{g.group}</h3>
          <div className="space-y-3">
            {g.fields.map((f) => (
              <div key={f.key} className="border border-outline-variant rounded-lg p-3">
                <p className="text-xs font-semibold text-on-surface mb-2">{f.label}</p>
                <div className="grid grid-cols-2 gap-3">
                  <FieldNumber label="ABS" name={f.key} value={values[f.key]} onChange={onChange} disabled={disabled} />
                  <FieldOtomatis label="%" value={hitungIndikatorPersen(values, f)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// 5. HALAMAN UTAMA
// =====================================================================

export default function FormKesprocatinPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [isAdminFlag, setIsAdminFlag] = useState(false);

  const {
    selectedMonth, selectedYear, selectMonth, activePeriode,
    periodStatusesMap, periodeLoading, isEditable, isReadOnly,
  } = useKesprocatinPeriode({ isAdmin: isAdminFlag });

  const {
    loading, saving, autoSaveStatus, userProfile, formData, periodDocExists,
    loadMonth, saveToFirestore, handleInputChange, handleFinalSubmit,
  } = useKesprocatinFormData({ selectedYear, selectedMonth, isReadOnly });

  useEffect(() => {
    if (!isAdminFlag && userProfile?.role === 'admin_dinkes') setIsAdminFlag(true);
  }, [isAdminFlag, userProfile]);

  const handleSelectMonth = async (mId) => {
    selectMonth(mId);
    await loadMonth(mId);
  };

  const totalSteps = KESPROCATIN_STEPS.length;

  const goToStep = (stepNumber) => {
    if (stepNumber < 1 || stepNumber > totalSteps) return;
    if (isEditable && periodDocExists) saveToFirestore(formData, STATUS_DRAFT);
    setActiveStep(stepNumber);
  };

  const onFinalSubmit = async () => {
    const ok = await handleFinalSubmit();
    if (ok) {
      alert(`Laporan Kesprocatin untuk ${formatPeriode(selectedYear, selectedMonth)} berhasil disimpan dan ditandai selesai!`);
      window.location.href = '/dashboard';
    }
  };

  if (loading || periodeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant font-medium text-xs">Memuat Halaman Form Kesprocatin...</p>
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
          <h1 className="font-bold text-lg text-primary">Form Kesprocatin — {puskesmasName}</h1>
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
        {KESPROCATIN_STEPS.map((step) => (
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
          <StepPendaftaranDilayani values={formData} onChange={handleInputChange} disabled={disabled} />
        ) : (
          <StepIndikatorGeneric stepId={activeStep} values={formData} onChange={handleInputChange} disabled={disabled} />
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