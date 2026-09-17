// lib/libAnak/kn/useKnFormData.js
// Hook form data KN — pola identik lib/anct/useAnctFormData.js (SUDAH
// termasuk fix auto-create dokumen & dependency array isReadOnly dari
// kasus yang kita temukan & perbaiki di modul PNC).
//
// KHUSUS KN: field handleInputChange menerima 2 argumen tambahan (fieldKey,
// gender) karena tiap indikator punya 2 input terpisah (L dan P), bukan 1
// input polos seperti ANC/PNC/ANCT — supaya komponen form bisa memanggil
// onChange(fieldKey, 'L', value) / onChange(fieldKey, 'P', value) langsung
// tanpa perlu tahu detail penamaan key L/P internal.

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  getKnReportRef,
  getKnCollectionName,
  STATUS_DRAFT,
  STATUS_SUBMITTED,
  STATUS_FIELD,
  TEMPLATE_KOLOM_KN,
} from "@/lib/libAnak/kn/knConfig";

export function useKnFormData({ selectedYear, selectedMonth, isReadOnly }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");

  const [userProfile, setUserProfile] = useState(null);
  const [targetSasaran, setTargetSasaran] = useState(0); // sasaranKelahiranHidup dari master
  const [formData, setFormData] = useState(TEMPLATE_KOLOM_KN);
  const [periodDocExists, setPeriodDocExists] = useState(null);

  const currentCollectionName = getKnCollectionName(selectedYear, selectedMonth);

  const fetchReportDataForMonth = useCallback(
    async (puskId, targetCollection, profileForInit, canEdit) => {
      if (!targetCollection || !puskId) {
        setPeriodDocExists(false);
        return;
      }
      try {
        const reportRef = getKnReportRef(targetCollection, puskId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          setPeriodDocExists(true);
          const data = reportSnap.data();
          setFormData(() => {
            const merged = { ...TEMPLATE_KOLOM_KN };
            Object.keys(TEMPLATE_KOLOM_KN).forEach((key) => {
              if (data[key] !== undefined) merged[key] = data[key];
            });
            return merged;
          });
          setTargetSasaran(Number(data.sasaranKelahiranHidup || 0));
          return;
        }

        if (canEdit && profileForInit) {
          const initPayload = {
            ...TEMPLATE_KOLOM_KN,
            puskesmasId: puskId,
            namaPuskesmas: profileForInit.namaPuskesmas || puskId,
            [STATUS_FIELD]: STATUS_DRAFT,
            updatedAt: serverTimestamp(),
          };
          await setDoc(reportRef, initPayload, { merge: true });
          setPeriodDocExists(true);
          setFormData(TEMPLATE_KOLOM_KN);
        } else {
          setPeriodDocExists(false);
          setFormData(TEMPLATE_KOLOM_KN);
        }
      } catch (err) {
        console.error("Error fetching KN report data for month:", err);
        setPeriodDocExists(false);
        setFormData(TEMPLATE_KOLOM_KN);
      }
    },
    []
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
            const pkmRef = doc(db, "puskesmas", uData.puskesmasId);
            const pkmSnap = await getDoc(pkmRef);
            if (pkmSnap.exists()) {
              setTargetSasaran(Number(pkmSnap.data().sasaranKelahiranHidup || 0));
            }

            await fetchReportDataForMonth(
              uData.puskesmasId,
              currentCollectionName,
              uData,
              !isReadOnly
            );
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error initializing Form KN:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router, selectedYear, currentCollectionName, fetchReportDataForMonth, isReadOnly]);

  const loadMonth = useCallback(
    async (mId) => {
      if (userProfile?.puskesmasId) {
        const targetCol = getKnCollectionName(selectedYear, mId);
        await fetchReportDataForMonth(userProfile.puskesmasId, targetCol, userProfile, !isReadOnly);
      }
    },
    [userProfile, selectedYear, fetchReportDataForMonth, isReadOnly]
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
        const reportRef = getKnReportRef(currentCollectionName, userProfile.puskesmasId);
        await setDoc(reportRef, reportPayload, { merge: true });
        setAutoSaveStatus("saved");
      } catch (err) {
        console.error("Error saving KN report:", err);
        setAutoSaveStatus("error");
      }
    },
    [isReadOnly, periodDocExists, userProfile, currentCollectionName, selectedYear, selectedMonth]
  );

  // handleInputChange KHUSUS KN: (fieldKey, gender, value)
  // gender: 'L' | 'P' -> menulis ke formData[`${fieldKey}L`] / [`${fieldKey}P`]
  const handleInputChange = (fieldKey, gender, value) => {
    if (isReadOnly || !periodDocExists) return;
    const val = Math.max(0, parseInt(value, 10) || 0);
    const storageKey = `${fieldKey}${gender}`; // 'kn1L' / 'kn1P'
    setFormData((prev) => ({ ...prev, [storageKey]: val }));
  };

  const handleFinalSubmit = async () => {
    if (isReadOnly || !periodDocExists) return false;
    setSaving(true);
    try {
      await saveToFirestore(formData, STATUS_SUBMITTED);
      return true;
    } catch (err) {
      console.error("Error submitting final KN report:", err);
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
    targetSasaran,
    formData,
    periodDocExists,
    loadMonth,
    saveToFirestore,
    handleInputChange,
    handleFinalSubmit,
  };
}