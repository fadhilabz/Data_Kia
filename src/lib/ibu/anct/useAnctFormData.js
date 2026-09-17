// lib/anct/useAnctFormData.js
// Hook: mengelola profil user, data form ANC Terpadu per bulan, fetch dari
// Firestore, dan simpan (draft/final). Pola identik usePncFormData.js —
// SUDAH termasuk 2 perbaikan yang kita temukan di modul PNC sebelumnya:
// 1. Auto-create dokumen kosong kalau periode terbuka tapi dokumen belum ada
//    (kasus puskesmas baru yang ditambahkan setelah periode dibuka Admin)
// 2. `isReadOnly` disertakan di dependency array useEffect utama, supaya
//    tidak kena stale closure waktu usePncPeriode/useAnctPeriode masih
//    proses loading status periode saat auth listener pertama kali jalan.

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  getAnctReportRef,
  getAnctCollectionName,
  STATUS_DRAFT,
  STATUS_SUBMITTED,
  STATUS_FIELD,
  TEMPLATE_KOLOM_ANCT,
} from "@/lib/ibu/anct/anctConfig";

export function useAnctFormData({ selectedYear, selectedMonth, isReadOnly }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");

  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState(TEMPLATE_KOLOM_ANCT);
  const [periodDocExists, setPeriodDocExists] = useState(null);

  const currentCollectionName = getAnctCollectionName(
    selectedYear,
    selectedMonth,
  );

  const fetchReportDataForMonth = useCallback(
    async (puskId, targetCollection, profileForInit, canEdit) => {
      if (!targetCollection || !puskId) {
        setPeriodDocExists(false);
        return;
      }
      try {
        const reportRef = getAnctReportRef(targetCollection, puskId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          setPeriodDocExists(true);
          const data = reportSnap.data();
          setFormData(() => {
            const merged = { ...TEMPLATE_KOLOM_ANCT };
            Object.keys(TEMPLATE_KOLOM_ANCT).forEach((key) => {
              if (data[key] !== undefined) merged[key] = data[key];
            });
            return merged;
          });
          return;
        }

        // Dokumen belum ada. Kalau periode ini sedang terbuka (editable),
        // auto-create dokumen kosong supaya Petugas tidak terblokir.
        if (canEdit && profileForInit) {
          const initPayload = {
            ...TEMPLATE_KOLOM_ANCT,
            puskesmasId: puskId,
            namaPuskesmas: profileForInit.namaPuskesmas || puskId,
            [STATUS_FIELD]: STATUS_DRAFT,
            updatedAt: serverTimestamp(),
          };
          await setDoc(reportRef, initPayload, { merge: true });
          setPeriodDocExists(true);
          setFormData(TEMPLATE_KOLOM_ANCT);
        } else {
          setPeriodDocExists(false);
          setFormData(TEMPLATE_KOLOM_ANCT);
        }
      } catch (err) {
        console.error("Error fetching ANCT report data for month:", err);
        setPeriodDocExists(false);
        setFormData(TEMPLATE_KOLOM_ANCT);
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
              currentCollectionName,
              uData,
              !isReadOnly,
            );
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error initializing Form ANCT:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
    // isReadOnly SENGAJA disertakan — lihat catatan perbaikan #2 di atas
  }, [
    router,
    selectedYear,
    currentCollectionName,
    fetchReportDataForMonth,
    isReadOnly,
  ]);

  const loadMonth = useCallback(
    async (mId) => {
      if (userProfile?.puskesmasId) {
        const targetCol = getAnctCollectionName(selectedYear, mId);
        await fetchReportDataForMonth(
          userProfile.puskesmasId,
          targetCol,
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
        const reportRef = getAnctReportRef(
          currentCollectionName,
          userProfile.puskesmasId,
        );
        await setDoc(reportRef, reportPayload, { merge: true });
        setAutoSaveStatus("saved");
      } catch (err) {
        console.error("Error saving ANCT report:", err);
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
    const { name, value, type } = e.target;
    if (type === "text" || type === "textarea") {
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
      console.error("Error submitting final ANCT report:", err);
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
