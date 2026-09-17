// lib/kematian-neo/useKematianNeoFormData.js
// Pola identik lib/kn/useKnFormData.js (auto-create + dependency array fix).

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  getKematianNeoReportRef,
  getKematianNeoCollectionName,
  STATUS_DRAFT,
  STATUS_SUBMITTED,
  STATUS_FIELD,
  TEMPLATE_KOLOM_KEMATIAN_NEO,
} from "@/lib/libAnak/kematian-neo/kematianNeoConfig";

export function useKematianNeoFormData({ selectedYear, selectedMonth, isReadOnly }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState(TEMPLATE_KOLOM_KEMATIAN_NEO);
  const [periodDocExists, setPeriodDocExists] = useState(null);

  const currentCollectionName = getKematianNeoCollectionName(selectedYear, selectedMonth);

  const fetchReportDataForMonth = useCallback(
    async (puskId, targetCollection, profileForInit, canEdit) => {
      if (!targetCollection || !puskId) {
        setPeriodDocExists(false);
        return;
      }
      try {
        const reportRef = getKematianNeoReportRef(targetCollection, puskId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          setPeriodDocExists(true);
          const data = reportSnap.data();
          setFormData(() => {
            const merged = { ...TEMPLATE_KOLOM_KEMATIAN_NEO };
            Object.keys(TEMPLATE_KOLOM_KEMATIAN_NEO).forEach((key) => {
              if (data[key] !== undefined) merged[key] = data[key];
            });
            return merged;
          });
          return;
        }

        if (canEdit && profileForInit) {
          const initPayload = {
            ...TEMPLATE_KOLOM_KEMATIAN_NEO,
            puskesmasId: puskId,
            namaPuskesmas: profileForInit.namaPuskesmas || puskId,
            [STATUS_FIELD]: STATUS_DRAFT,
            updatedAt: serverTimestamp(),
          };
          await setDoc(reportRef, initPayload, { merge: true });
          setPeriodDocExists(true);
          setFormData(TEMPLATE_KOLOM_KEMATIAN_NEO);
        } else {
          setPeriodDocExists(false);
          setFormData(TEMPLATE_KOLOM_KEMATIAN_NEO);
        }
      } catch (err) {
        console.error("Error fetching Kematian Neo report data for month:", err);
        setPeriodDocExists(false);
        setFormData(TEMPLATE_KOLOM_KEMATIAN_NEO);
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
            await fetchReportDataForMonth(uData.puskesmasId, currentCollectionName, uData, !isReadOnly);
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error initializing Form Kematian Neo:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router, selectedYear, currentCollectionName, fetchReportDataForMonth, isReadOnly]);

  const loadMonth = useCallback(
    async (mId) => {
      if (userProfile?.puskesmasId) {
        const targetCol = getKematianNeoCollectionName(selectedYear, mId);
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
        const reportRef = getKematianNeoReportRef(currentCollectionName, userProfile.puskesmasId);
        await setDoc(reportRef, reportPayload, { merge: true });
        setAutoSaveStatus("saved");
      } catch (err) {
        console.error("Error saving Kematian Neo report:", err);
        setAutoSaveStatus("error");
      }
    },
    [isReadOnly, periodDocExists, userProfile, currentCollectionName, selectedYear, selectedMonth]
  );

  // handleInputChange generik: field bisa angka biasa (name, value) atau
  // teks keterangan (name, value) — dibedakan lewat tipe input di komponen.
  const handleInputChange = (name, value, isText = false) => {
    if (isReadOnly || !periodDocExists) return;
    if (isText) {
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
      console.error("Error submitting final Kematian Neo report:", err);
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
    loadMonth,
    saveToFirestore,
    handleInputChange,
    handleFinalSubmit,
  };
}