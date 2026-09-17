// lib/sdm/useSdmFormData.js
// Hook: mengelola profil user, data form SDM per bulan, fetch dari Firestore,
// dan simpan (draft/final). Pola identik useKematianFormData.js, DITAMBAH
// fitur khusus SDM: karena data kumulatif, saat dokumen bulan ini masih
// kosong (auto-create), nilai awal diambil dari LAPORAN BULAN SEBELUMNYA
// (bukan mulai dari 0) — supaya petugas tinggal koreksi kalau ada perubahan,
// bukan mengetik ulang semua dari nol tiap bulan.

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  getSdmReportRef,
  getSdmCollectionName,
  STATUS_DRAFT,
  STATUS_SUBMITTED,
  STATUS_FIELD,
  TEMPLATE_KOLOM_SDM,
} from "@/lib/ibu/sdm/sdmConfig";

// ---- Hitung bulan sebelumnya (menangani pergantian tahun) ----
function getBulanSebelumnya(tahun, bulan) {
  const b = parseInt(bulan, 10);
  if (b <= 1) {
    return { tahun: String(parseInt(tahun, 10) - 1), bulan: "12" };
  }
  return { tahun, bulan: String(b - 1).padStart(2, "0") };
}

export function useSdmFormData({ selectedYear, selectedMonth, isReadOnly }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");

  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState(TEMPLATE_KOLOM_SDM);
  const [periodDocExists, setPeriodDocExists] = useState(null);
  const [diisiOtomatisDariBulanLalu, setDiisiOtomatisDariBulanLalu] =
    useState(false);

  const currentCollectionName = getSdmCollectionName(
    selectedYear,
    selectedMonth,
  );

  const fetchReportDataForMonth = useCallback(
    async (puskId, targetYear, targetMonth, profileForInit, canEdit) => {
      const targetCollection = getSdmCollectionName(targetYear, targetMonth);
      if (!targetCollection || !puskId) {
        setPeriodDocExists(false);
        return;
      }
      try {
        const reportRef = getSdmReportRef(targetCollection, puskId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          setPeriodDocExists(true);
          setDiisiOtomatisDariBulanLalu(false);
          const data = reportSnap.data();
          setFormData(() => {
            const merged = { ...TEMPLATE_KOLOM_SDM };
            Object.keys(TEMPLATE_KOLOM_SDM).forEach((key) => {
              if (data[key] !== undefined) merged[key] = data[key];
            });
            return merged;
          });
          return;
        }

        // Dokumen bulan ini belum ada. Karena data SDM kumulatif, coba ambil
        // nilai dari BULAN SEBELUMNYA dulu sebagai starting point.
        if (canEdit && profileForInit) {
          const prev = getBulanSebelumnya(targetYear, targetMonth);
          const prevCollection = getSdmCollectionName(prev.tahun, prev.bulan);
          let nilaiAwal = { ...TEMPLATE_KOLOM_SDM };
          let dariBulanLalu = false;

          try {
            const prevSnap = await getDoc(
              getSdmReportRef(prevCollection, puskId),
            );
            if (prevSnap.exists()) {
              const prevData = prevSnap.data();
              Object.keys(TEMPLATE_KOLOM_SDM).forEach((key) => {
                if (prevData[key] !== undefined) nilaiAwal[key] = prevData[key];
              });
              dariBulanLalu = true;
            }
          } catch (prevErr) {
            console.error("Gagal ambil data SDM bulan sebelumnya:", prevErr);
          }

          const initPayload = {
            ...nilaiAwal,
            puskesmasId: puskId,
            namaPuskesmas: profileForInit.namaPuskesmas || puskId,
            [STATUS_FIELD]: STATUS_DRAFT,
            updatedAt: serverTimestamp(),
          };
          await setDoc(reportRef, initPayload, { merge: true });
          setPeriodDocExists(true);
          setFormData(nilaiAwal);
          setDiisiOtomatisDariBulanLalu(dariBulanLalu);
        } else {
          setPeriodDocExists(false);
          setFormData(TEMPLATE_KOLOM_SDM);
          setDiisiOtomatisDariBulanLalu(false);
        }
      } catch (err) {
        console.error("Error fetching SDM report data for month:", err);
        setPeriodDocExists(false);
        setFormData(TEMPLATE_KOLOM_SDM);
      }
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }
      try {
        const userRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const uData = userSnap.data();
          setUserProfile(uData);

          if (uData.puskesmasId) {
            await fetchReportDataForMonth(
              uData.puskesmasId,
              selectedYear,
              selectedMonth,
              uData,
              !isReadOnly,
            );
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error initializing Form SDM:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [
    router,
    selectedYear,
    selectedMonth,
    fetchReportDataForMonth,
    isReadOnly,
  ]);

  const loadMonth = useCallback(
    async (mId) => {
      if (userProfile?.puskesmasId) {
        await fetchReportDataForMonth(
          userProfile.puskesmasId,
          selectedYear,
          mId,
          userProfile,
          !isReadOnly,
        );
      }
    },
    [userProfile, selectedYear, fetchReportDataForMonth, isReadOnly],
  );

  const saveToFirestore = useCallback(
    async (dataToSave, statusReport = STATUS_DRAFT) => {
      if (isReadOnly || !periodDocExists || !userProfile?.puskesmasId) return;

      setAutoSaveStatus("saving");

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
        const reportRef = getSdmReportRef(
          currentCollectionName,
          userProfile.puskesmasId,
        );
        await setDoc(reportRef, reportPayload, { merge: true });
        setAutoSaveStatus("saved");
      } catch (err) {
        console.error("Error saving SDM report:", err);
        setAutoSaveStatus("error");
      }
    },
    [
      isReadOnly,
      periodDocExists,
      userProfile,
      currentCollectionName,
      selectedYear,
      selectedMonth,
    ],
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
      console.error("Error submitting final SDM report:", err);
      alert("Gagal menyimpan laporan final: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    autoSaveStatus,
    userProfile,
    formData,
    periodDocExists,
    diisiOtomatisDariBulanLalu,
    loadMonth,
    saveToFirestore,
    handleInputChange,
    handleFinalSubmit,
  };
}
