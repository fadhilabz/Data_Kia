// lib/libAnak/kmb/useKmbFormData.js
// Hook form data KMB. Beda dari modul lain: formData.kasusList adalah ARRAY
// objek kasus (bisa 0, 1, atau banyak per bulan), bukan field angka datar.
// Semua rekap (jumlah L/P, jumlah per sebab) dihitung on-the-fly dari array
// ini di constants/kmbFields.js — tidak disimpan sebagai field terpisah.

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  getKmbReportRef,
  getKmbCollectionName,
  STATUS_DRAFT,
  STATUS_SUBMITTED,
  STATUS_FIELD,
  TEMPLATE_KOLOM_KMB,
} from "@/lib/libAnak/kmb/kmbConfig";
import { buildKasusKosong } from "@/constants/kmbFields";

export function useKmbFormData({ selectedYear, selectedMonth, isReadOnly }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState(TEMPLATE_KOLOM_KMB);
  const [periodDocExists, setPeriodDocExists] = useState(null);

  const currentCollectionName = getKmbCollectionName(selectedYear, selectedMonth);

  const fetchReportDataForMonth = useCallback(
    async (puskId, targetCollection, profileForInit, canEdit) => {
      if (!targetCollection || !puskId) {
        setPeriodDocExists(false);
        return;
      }
      try {
        const reportRef = getKmbReportRef(targetCollection, puskId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          setPeriodDocExists(true);
          const data = reportSnap.data();
          setFormData({ ...TEMPLATE_KOLOM_KMB, kasusList: data.kasusList || [] });
          return;
        }

        if (canEdit && profileForInit) {
          const initPayload = {
            ...TEMPLATE_KOLOM_KMB,
            puskesmasId: puskId,
            namaPuskesmas: profileForInit.namaPuskesmas || puskId,
            [STATUS_FIELD]: STATUS_DRAFT,
            updatedAt: serverTimestamp(),
          };
          await setDoc(reportRef, initPayload, { merge: true });
          setPeriodDocExists(true);
          setFormData(TEMPLATE_KOLOM_KMB);
        } else {
          setPeriodDocExists(false);
          setFormData(TEMPLATE_KOLOM_KMB);
        }
      } catch (err) {
        console.error("Error fetching KMB report data for month:", err);
        setPeriodDocExists(false);
        setFormData(TEMPLATE_KOLOM_KMB);
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
        console.error("Error initializing Form KMB:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router, selectedYear, currentCollectionName, fetchReportDataForMonth, isReadOnly]);

  const loadMonth = useCallback(
    async (mId) => {
      if (userProfile?.puskesmasId) {
        const targetCol = getKmbCollectionName(selectedYear, mId);
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
        kasusList: dataToSave.kasusList || [],
        [STATUS_FIELD]: statusReport,
        updatedAt: serverTimestamp(),
        updatedBy: userProfile.email,
      };
      try {
        const reportRef = getKmbReportRef(currentCollectionName, userProfile.puskesmasId);
        await setDoc(reportRef, reportPayload, { merge: true });
        setAutoSaveStatus("saved");
      } catch (err) {
        console.error("Error saving KMB report:", err);
        setAutoSaveStatus("error");
      }
    },
    [isReadOnly, periodDocExists, userProfile, currentCollectionName, selectedYear, selectedMonth]
  );

  // ---- Manajemen daftar kasus ----
  const tambahKasus = () => {
    if (isReadOnly || !periodDocExists) return;
    setFormData((prev) => ({ ...prev, kasusList: [...(prev.kasusList || []), buildKasusKosong()] }));
  };

  const hapusKasus = (kasusId) => {
    if (isReadOnly || !periodDocExists) return;
    setFormData((prev) => ({
      ...prev,
      kasusList: (prev.kasusList || []).filter((k) => k.id !== kasusId),
    }));
  };

  const ubahKasus = (kasusId, field, value) => {
    if (isReadOnly || !periodDocExists) return;
    setFormData((prev) => ({
      ...prev,
      kasusList: (prev.kasusList || []).map((k) =>
        k.id === kasusId ? { ...k, [field]: value } : k
      ),
    }));
  };

  const handleFinalSubmit = async () => {
    if (isReadOnly || !periodDocExists) return false;
    setSaving(true);
    try {
      await saveToFirestore(formData, STATUS_SUBMITTED);
      return true;
    } catch (err) {
      console.error("Error submitting final KMB report:", err);
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
    tambahKasus,
    hapusKasus,
    ubahKasus,
    handleFinalSubmit,
  };
}