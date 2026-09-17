// app/dashboard/mtbs/page.js
//
// Modul MTBS (Manajemen Terpadu Balita Sakit, 2-59 bulan) — SATU FILE
// lengkap. Beda dari KN: field diagnosis di sini cuma 1 angka tally per
// kategori (bukan pasangan L/P).
//
// ASUMSI RUMUS (perlu verifikasi ke Dinas):
// - CAKUPAN dilayani MTBS = Jumlah dilayani MTBS ÷ Jumlah berkunjung × 100
// - CAKUPAN terhadap sasaran = Jumlah dilayani MTBS ÷ Sasaran Balita 0-59 × 100
// - Sasaran Balita (0-59 Bulan) diambil OTOMATIS dari modul Sasaran Balita
//   (collection {tahun}_{bulan}_sasaran_anak, field sasaranBalita059)

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

const MTBS_STEPS = [
  { id: 1, label: 'Cakupan MTBS', icon: 'summarize' },
  { id: 2, label: 'Bahaya, Batuk & Diare', icon: 'coronavirus' },
  { id: 3, label: 'Demam, Campak & Dengue', icon: 'thermostat' },
  { id: 4, label: 'Telinga & Status Gizi', icon: 'nutrition' },
  { id: 5, label: 'Anemia, Tumbuh & Kepala', icon: 'monitor_weight' },
  { id: 6, label: 'HIV, Rujukan & Catatan', icon: 'assignment' },
];

// ---- Field info umum (bukan tally diagnosis) ----
const MTBS_INFO_FIELDS = [
  { key: 'balitaSakitBerkunjung', label: 'Jumlah Balita Sakit yang Berkunjung ke Fasyankes' },
  { key: 'balitaSakitDilayaniMtbs', label: 'Jumlah Balita Sakit (2-59 Bulan) yang Dilayani MTBS' },
  { key: 'puskesmasMelaksanakanMtbs', label: 'Puskesmas Melaksanakan MTBS (isi 1 = Ya, 0 = Tidak)' },
  { key: 'tenagaTerlatihMtbs', label: 'Jumlah Tenaga Terlatih MTBS' },
];

// ---- 53 kategori diagnosis (tally, 1 angka per field) ----
const MTBS_DIAGNOSA = [
  // Step 2 — Tanda Bahaya, Batuk/Sukar Bernafas, Diare
  { step: 2, key: 'sagaGagalJantungParu', label: 'Gagal Jantung Paru', group: 'Tanda Bahaya Umum (SAGA)' },
  { step: 2, key: 'sagaPenyakitSangatBerat', label: 'Penyakit Sangat Berat', group: 'Tanda Bahaya Umum (SAGA)' },
  { step: 2, key: 'sagaStabil', label: 'Stabil', group: 'Tanda Bahaya Umum (SAGA)' },
  { step: 2, key: 'batukTarikanDinding', label: 'Tarikan Dinding Dada Kedalam (+/-)', group: 'Batuk / Sukar Bernafas' },
  { step: 2, key: 'batukPneumoniaBerat', label: 'Pneumonia Berat', group: 'Batuk / Sukar Bernafas' },
  { step: 2, key: 'batukPneumonia', label: 'Pneumonia', group: 'Batuk / Sukar Bernafas' },
  { step: 2, key: 'batukBukanPneumonia', label: 'Batuk Bukan Pneumonia', group: 'Batuk / Sukar Bernafas' },
  { step: 2, key: 'diareDehidrasiBerat', label: 'Diare Dehidrasi Berat', group: 'Diare' },
  { step: 2, key: 'diareDehidrasiRinganSedang', label: 'Diare Dehidrasi Ringan/Sedang', group: 'Diare' },
  { step: 2, key: 'diareTanpaDehidrasi', label: 'Diare Tanpa Dehidrasi', group: 'Diare' },
  { step: 2, key: 'diarePersistenBerat', label: 'Diare Persisten Berat (> 14 Hari)', group: 'Diare' },
  { step: 2, key: 'diarePersisten', label: 'Diare Persisten (> 14 Hari)', group: 'Diare' },
  { step: 2, key: 'disentri', label: 'Disentri (Darah dalam Tinja)', group: 'Diare' },

  // Step 3 — Demam, Campak, Dengue
  { step: 3, key: 'demamMalariaBeratDgnDemam', label: 'Penyakit Berat dengan Demam (Malaria)', group: 'Demam - Malaria (Endemis)' },
  { step: 3, key: 'demamMalaria', label: 'Malaria', group: 'Demam - Malaria (Endemis)' },
  { step: 3, key: 'demamMungkinBukanMalaria', label: 'Demam Mungkin Bukan Malaria', group: 'Demam - Malaria (Endemis)' },
  { step: 3, key: 'demamNonEndemisBerat', label: 'Penyakit Berat dengan Demam', group: 'Demam - Non Endemis' },
  { step: 3, key: 'demamBukanMalaria', label: 'Demam Bukan Malaria', group: 'Demam - Non Endemis' },
  { step: 3, key: 'campakKomplikasiBerat', label: 'Campak dengan Komplikasi Berat', group: 'Campak' },
  { step: 3, key: 'campakKomplikasiMataMulut', label: 'Campak dengan Komplikasi Mata/Mulut', group: 'Campak' },
  { step: 3, key: 'campak', label: 'Campak', group: 'Campak' },
  { step: 3, key: 'dengueBerat', label: 'Dengue Berat (Severe Dengue)', group: 'Demam 2-7 Hari (Dengue)' },
  { step: 3, key: 'dengueWarningSign', label: 'Dengue dengan Warning Sign', group: 'Demam 2-7 Hari (Dengue)' },
  { step: 3, key: 'dengueTanpaWarningSign', label: 'Dengue Tanpa Warning Sign', group: 'Demam 2-7 Hari (Dengue)' },
  { step: 3, key: 'demamMungkinBukanDengue', label: 'Demam Mungkin Bukan Dengue', group: 'Demam 2-7 Hari (Dengue)' },

  // Step 4 — Masalah Telinga, Status Gizi
  { step: 4, key: 'telingaMastoiditis', label: 'Mastoiditis', group: 'Masalah Telinga' },
  { step: 4, key: 'telingaInfeksiAkut', label: 'Infeksi Telinga Akut', group: 'Masalah Telinga' },
  { step: 4, key: 'telingaInfeksiKronis', label: 'Infeksi Telinga Kronis', group: 'Masalah Telinga' },
  { step: 4, key: 'telingaTidakInfeksi', label: 'Tidak Ada Infeksi Telinga', group: 'Masalah Telinga' },
  { step: 4, key: 'giziBurukKomplikasi', label: 'Gizi Buruk dengan Komplikasi', group: 'Status Gizi' },
  { step: 4, key: 'giziBurukTanpaKomplikasi', label: 'Gizi Buruk Tanpa Komplikasi', group: 'Status Gizi' },
  { step: 4, key: 'giziKurang', label: 'Gizi Kurang', group: 'Status Gizi' },
  { step: 4, key: 'giziBaik', label: 'Gizi Baik', group: 'Status Gizi' },
  { step: 4, key: 'obesitas', label: 'Obesitas', group: 'Status Gizi' },
  { step: 4, key: 'giziLebih', label: 'Gizi Lebih', group: 'Status Gizi' },
  { step: 4, key: 'beresikoGiziLebih', label: 'Beresiko Gizi Lebih', group: 'Status Gizi' },

  // Step 5 — Anemia, Status Pertumbuhan, Lingkar Kepala
  { step: 5, key: 'anemiaBerat', label: 'Anemia Berat', group: 'Anemia' },
  { step: 5, key: 'anemi', label: 'Anemi', group: 'Anemia' },
  { step: 5, key: 'tidakAnemi', label: 'Tidak Anemi', group: 'Anemia' },
  { step: 5, key: 'tumbuhSangatPendek', label: 'Sangat Pendek (Severely Stunted)', group: 'Status Pertumbuhan' },
  { step: 5, key: 'tumbuhPendek', label: 'Pendek (Stunted)', group: 'Status Pertumbuhan' },
  { step: 5, key: 'tumbuhNormal', label: 'Normal', group: 'Status Pertumbuhan' },
  { step: 5, key: 'tumbuhTinggi', label: 'Tinggi (Tall)', group: 'Status Pertumbuhan' },
  { step: 5, key: 'kepalaMakrosefali', label: 'Makro Sefali', group: 'Lingkar Kepala' },
  { step: 5, key: 'kepalaNormal', label: 'Normal', group: 'Lingkar Kepala' },
  { step: 5, key: 'kepalaMikrosefali', label: 'Mikro Sefali', group: 'Lingkar Kepala' },

  // Step 6 — Status HIV, Masalah Lain, Rujukan
  { step: 6, key: 'hivTerkonfirmasi', label: 'Infeksi HIV Terkonfirmasi', group: 'Status HIV' },
  { step: 6, key: 'hivTerpajan', label: 'Terpajan HIV', group: 'Status HIV' },
  { step: 6, key: 'hivDiduga', label: 'Diduga Terinfeksi HIV', group: 'Status HIV' },
  { step: 6, key: 'hivMungkinBukan', label: 'Mungkin Bukan Infeksi HIV', group: 'Status HIV' },
  { step: 6, key: 'masalahKeluhanLain', label: 'Masalah atau Keluhan Lain', group: 'Lain-lain' },
  { step: 6, key: 'rujukanDalamGedung', label: 'Rujukan Dalam Gedung', group: 'Rujukan' },
  { step: 6, key: 'rujukanLuarGedung', label: 'Rujukan Luar Gedung', group: 'Rujukan' },
];

const MTBS_CATATAN_FIELD = { key: 'keterangan', label: 'Keterangan (KET)' };

const TEMPLATE_KOLOM_MTBS = {
  ...MTBS_INFO_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: 0 }), {}),
  ...MTBS_DIAGNOSA.reduce((acc, f) => ({ ...acc, [f.key]: 0 }), {}),
  [MTBS_CATATAN_FIELD.key]: '',
};

const STATUS_FIELD = 'statusReport';
const STATUS_DRAFT = 'draft';
const STATUS_SUBMITTED = 'submitted';

function getMtbsCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_mtbs`;
}
function getSasaranAnakCollectionName(tahun, bulan) {
  return `${tahun}_${bulan}_sasaran_anak`;
}

// =====================================================================
// 2. HOOK PERIODE (petugas)
// =====================================================================

function useMtbsPeriode({ isAdmin } = {}) {
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

function useMtbsFormData({ selectedYear, selectedMonth, isReadOnly }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState(TEMPLATE_KOLOM_MTBS);
  const [periodDocExists, setPeriodDocExists] = useState(null);
  const [sasaranBalita059, setSasaranBalita059] = useState(0);

  const currentCollectionName = getMtbsCollectionName(selectedYear, selectedMonth);

  const fetchSasaran = useCallback(async (puskId, year, month) => {
    try {
      const ref = doc(db, getSasaranAnakCollectionName(year, month), puskId);
      const snap = await getDoc(ref);
      setSasaranBalita059(snap.exists() ? Number(snap.data().sasaranBalita059) || 0 : 0);
    } catch (err) {
      console.error('Gagal ambil Sasaran Balita 0-59 Bulan:', err);
      setSasaranBalita059(0);
    }
  }, []);

  const fetchReportDataForMonth = useCallback(
    async (puskId, targetYear, targetMonth, profileForInit, canEdit) => {
      const targetCollection = getMtbsCollectionName(targetYear, targetMonth);
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
            const merged = { ...TEMPLATE_KOLOM_MTBS };
            Object.keys(TEMPLATE_KOLOM_MTBS).forEach((key) => {
              if (data[key] !== undefined) merged[key] = data[key];
            });
            return merged;
          });
          return;
        }

        if (canEdit && profileForInit) {
          const initPayload = {
            ...TEMPLATE_KOLOM_MTBS,
            puskesmasId: puskId,
            namaPuskesmas: profileForInit.namaPuskesmas || puskId,
            [STATUS_FIELD]: STATUS_DRAFT,
            updatedAt: serverTimestamp(),
          };
          await setDoc(reportRef, initPayload, { merge: true });
          setPeriodDocExists(true);
          setFormData(TEMPLATE_KOLOM_MTBS);
        } else {
          setPeriodDocExists(false);
          setFormData(TEMPLATE_KOLOM_MTBS);
        }
      } catch (err) {
        console.error('Error fetching MTBS report data:', err);
        setPeriodDocExists(false);
        setFormData(TEMPLATE_KOLOM_MTBS);
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
        console.error('Error initializing Form MTBS:', err);
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
        console.error('Error saving MTBS report:', err);
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
      console.error('Error submitting final MTBS report:', err);
      alert('Gagal menyimpan laporan final: ' + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading, saving, autoSaveStatus, userProfile, formData, periodDocExists,
    sasaranBalita059, loadMonth, saveToFirestore, handleInputChange, handleFinalSubmit,
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

function StepCakupan({ values, onChange, disabled, sasaranBalita059 }) {
  const berkunjung = Number(values.balitaSakitBerkunjung) || 0;
  const dilayani = Number(values.balitaSakitDilayaniMtbs) || 0;
  const cakupanDilayani = berkunjung > 0 ? ((dilayani / berkunjung) * 100).toFixed(1) : '-';
  const cakupanSasaran = sasaranBalita059 > 0 ? ((dilayani / sasaranBalita059) * 100).toFixed(1) : '-';
  const melaksanakan = Number(values.puskesmasMelaksanakanMtbs) || 0;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-sm text-blue-800">
        Sasaran Balita (0-59 Bulan) dari modul Sasaran Balita: <strong>{sasaranBalita059}</strong>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldNumber label={MTBS_INFO_FIELDS[0].label} name="balitaSakitBerkunjung" value={values.balitaSakitBerkunjung} onChange={onChange} disabled={disabled} />
        <FieldNumber label={MTBS_INFO_FIELDS[1].label} name="balitaSakitDilayaniMtbs" value={values.balitaSakitDilayaniMtbs} onChange={onChange} disabled={disabled} />
        <FieldOtomatis label="Cakupan Dilayani MTBS (%)" value={cakupanDilayani} />
        <FieldOtomatis label="Cakupan Terhadap Sasaran Proyeksi (%)" value={cakupanSasaran} />
        <FieldNumber label={MTBS_INFO_FIELDS[2].label} name="puskesmasMelaksanakanMtbs" value={values.puskesmasMelaksanakanMtbs} onChange={onChange} disabled={disabled} />
        <FieldOtomatis label="Cakupan Puskesmas Melaksanakan MTBS (%)" value={melaksanakan ? 100 : 0} />
        <FieldNumber label={MTBS_INFO_FIELDS[3].label} name="tenagaTerlatihMtbs" value={values.tenagaTerlatihMtbs} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
}

function StepDiagnosaGeneric({ stepId, values, onChange, disabled }) {
  const fieldsStepIni = MTBS_DIAGNOSA.filter((f) => f.step === stepId);
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
      {stepId === 6 && (
        <div>
          <h3 className="font-bold text-sm text-primary mb-3">{MTBS_CATATAN_FIELD.label}</h3>
          <textarea
            name={MTBS_CATATAN_FIELD.key} value={values[MTBS_CATATAN_FIELD.key] ?? ''} onChange={onChange} disabled={disabled} rows={3}
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

export default function FormMtbsPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [isAdminFlag, setIsAdminFlag] = useState(false);

  const {
    selectedMonth, selectedYear, selectMonth, activePeriode,
    periodStatusesMap, periodeLoading, isEditable, isReadOnly,
  } = useMtbsPeriode({ isAdmin: isAdminFlag });

  const {
    loading, saving, autoSaveStatus, userProfile, formData, periodDocExists,
    sasaranBalita059, loadMonth, saveToFirestore, handleInputChange, handleFinalSubmit,
  } = useMtbsFormData({ selectedYear, selectedMonth, isReadOnly });

  useEffect(() => {
    if (!isAdminFlag && userProfile?.role === 'admin_dinkes') setIsAdminFlag(true);
  }, [isAdminFlag, userProfile]);

  const handleSelectMonth = async (mId) => {
    selectMonth(mId);
    await loadMonth(mId);
  };

  const totalSteps = MTBS_STEPS.length;

  const goToStep = (stepNumber) => {
    if (stepNumber < 1 || stepNumber > totalSteps) return;
    if (isEditable && periodDocExists) saveToFirestore(formData, STATUS_DRAFT);
    setActiveStep(stepNumber);
  };

  const onFinalSubmit = async () => {
    const ok = await handleFinalSubmit();
    if (ok) {
      alert(`Laporan MTBS untuk ${formatPeriode(selectedYear, selectedMonth)} berhasil disimpan dan ditandai selesai!`);
      window.location.href = '/dashboard';
    }
  };

  if (loading || periodeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant font-medium text-xs">Memuat Halaman Form MTBS...</p>
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
          <h1 className="font-bold text-lg text-primary">Form MTBS (Balita Sakit 2-59 Bulan) — {puskesmasName}</h1>
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
        {MTBS_STEPS.map((step) => (
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
          <StepCakupan values={formData} onChange={handleInputChange} disabled={disabled} sasaranBalita059={sasaranBalita059} />
        ) : (
          <StepDiagnosaGeneric stepId={activeStep} values={formData} onChange={handleInputChange} disabled={disabled} />
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