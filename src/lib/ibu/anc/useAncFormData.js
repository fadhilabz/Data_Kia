// lib/anc/useAncFormData.js
// Hook: mengelola profil user, target sasaran bumil, data form ANC per bulan,
// fetch dari Firestore, dan simpan (draft/final) ke Firestore.

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  getAncReportRef,
  getAncCollectionName,
  STATUS_DRAFT,
  STATUS_SUBMITTED,
  STATUS_FIELD,
  TEMPLATE_KOLOM_ANC,
} from "@/lib/ibu/anc/ancConfig";

export function useAncFormData({ selectedYear, selectedMonth, isReadOnly }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");

  const [userProfile, setUserProfile] = useState(null);
  const [targetBumil, setTargetBumil] = useState(0);
  const [formData, setFormData] = useState(TEMPLATE_KOLOM_ANC);
  const [periodDocExists, setPeriodDocExists] = useState(null);

  const currentCollectionName = getAncCollectionName(
    selectedYear,
    selectedMonth,
  );

  const fetchReportDataForMonth = useCallback(
    async (puskId, targetCollection) => {
      if (!targetCollection || !puskId) {
        setPeriodDocExists(false);
        return;
      }
      try {
        const reportRef = getAncReportRef(targetCollection, puskId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          setPeriodDocExists(true);
          const data = reportSnap.data();
          setFormData(() => {
            const merged = { ...TEMPLATE_KOLOM_ANC };
            Object.keys(TEMPLATE_KOLOM_ANC).forEach((key) => {
              if (data[key] !== undefined) merged[key] = data[key];
            });
            return merged;
          });
        } else {
          setPeriodDocExists(false);
          setFormData(TEMPLATE_KOLOM_ANC);
        }
      } catch (err) {
        console.error("Error fetching report data for month:", err);
        setPeriodDocExists(false);
        setFormData(TEMPLATE_KOLOM_ANC);
      }
    },
    [],
  );

  // Load user profile + data awal (dijalankan sekali & saat tahun berubah)
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
            const sasaranRef = doc(
              db,
              "sasaran",
              `${uData.puskesmasId}-${selectedYear}`,
            );
            const sasaranSnap = await getDoc(sasaranRef);
            if (sasaranSnap.exists())
              setTargetBumil(sasaranSnap.data().bumil || 0);

            await fetchReportDataForMonth(
              uData.puskesmasId,
              currentCollectionName,
            );
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error initializing Form ANC:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router, selectedYear, currentCollectionName, fetchReportDataForMonth]);

  // Dipanggil dari halaman saat user memilih bulan lain secara manual
  const loadMonth = useCallback(
    async (mId) => {
      if (userProfile?.puskesmasId) {
        const targetCol = getAncCollectionName(selectedYear, mId);
        await fetchReportDataForMonth(userProfile.puskesmasId, targetCol);
      }
    },
    [userProfile, selectedYear, fetchReportDataForMonth],
  );

  const saveToFirestore = useCallback(
    async (dataToSave, statusReport = STATUS_DRAFT) => {
      if (isReadOnly || !periodDocExists || !userProfile?.puskesmasId) return;

      setAutoSaveStatus("saving");

      const k1Murni = Number(dataToSave.k1Murni || 0);
      const k1Lebih12Minggu = Number(dataToSave.k1Lebih12Minggu || 0);
      const k1Akses = k1Murni + k1Lebih12Minggu;
      const totalAnemia =
        Number(dataToSave.anemiaRingan || 0) +
        Number(dataToSave.anemiaSedang || 0) +
        Number(dataToSave.anemiaBerat || 0);
      const jumlahPkm = Number(dataToSave.jumlahPkm || 0);
      const pkmPoned = Number(dataToSave.pkmPoned || 0);
      const persenPkmPoned =
        jumlahPkm > 0 ? Math.round((pkmPoned / jumlahPkm) * 100) : 0;

      const periodeId = `${selectedYear}-${selectedMonth}`;
      const uniqueDocId = `${periodeId}_${userProfile.puskesmasId}`;

      const reportPayload = {
        puskesmasId: userProfile.puskesmasId,
        namaPuskesmas: userProfile.namaPuskesmas || userProfile.puskesmasId,
        periode: periodeId,
        ...dataToSave,
        k1Akses,
        totalAnemia,
        persenPkmPoned,
        [STATUS_FIELD]: statusReport,
        updatedAt: serverTimestamp(),
        updatedBy: userProfile.email,
      };

      try {
        const reportRef = getAncReportRef(
          currentCollectionName,
          userProfile.puskesmasId,
        );
        await setDoc(reportRef, reportPayload, { merge: true });

        const globalAncReportRef = doc(db, "anc_reports", uniqueDocId);
        await setDoc(globalAncReportRef, reportPayload, { merge: true });

        const rekapRef = doc(db, "rekap_kelengkapan", uniqueDocId);
        await setDoc(
          rekapRef,
          {
            periode: periodeId,
            puskesmasId: userProfile.puskesmasId,
            namaPuskesmas: userProfile.namaPuskesmas || userProfile.puskesmasId,
            isSubmitted: statusReport === STATUS_SUBMITTED,
            submittedAt: serverTimestamp(),
          },
          { merge: true },
        );

        setAutoSaveStatus("saved");
      } catch (err) {
        console.error("Error saving ANC report:", err);
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

  // Mengembalikan true jika berhasil, supaya page.js yang urus alert & redirect
  const handleFinalSubmit = async () => {
    if (isReadOnly || !periodDocExists) return false;
    setSaving(true);
    try {
      await saveToFirestore(formData, STATUS_SUBMITTED);
      return true;
    } catch (err) {
      console.error("Error submitting final ANC report:", err);
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
    targetBumil,
    formData,
    periodDocExists,
    loadMonth,
    saveToFirestore,
    handleInputChange,
    handleFinalSubmit,
  };
}
