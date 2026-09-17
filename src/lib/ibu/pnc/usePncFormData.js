// lib/pnc/usePncFormData.js
// Hook: mengelola profil user, target sasaran bulin (dari master puskesmas),
// data form PNC per bulan, fetch dari Firestore, dan simpan (draft/final).
// Struktur identik dengan lib/anc/useAncFormData.js.
//
// PERBAIKAN: fetchReportDataForMonth sekarang menerima parameter `canEdit`.
// Kalau dokumen laporan belum ada TAPI periode ini sedang terbuka (editable),
// hook akan AUTO-CREATE dokumen kosong (pakai TEMPLATE_KOLOM_PNC) sehingga
// Petugas tidak terblokir hanya karena puskesmasnya baru ditambahkan setelah
// Admin membuka periode. Sebelumnya periodDocExists selalu false untuk kasus
// ini dan form selamanya terkunci walau periode statusnya "Terbuka".

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  getPncReportRef,
  getPncCollectionName,
  STATUS_DRAFT,
  STATUS_SUBMITTED,
  STATUS_FIELD,
  TEMPLATE_KOLOM_PNC,
} from "@/lib/ibu/pnc/pncConfig";

export function usePncFormData({ selectedYear, selectedMonth, isReadOnly }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");

  const [userProfile, setUserProfile] = useState(null);
  const [targetBulin, setTargetBulin] = useState(0); // dari puskesmas.sasaranBulin (master, diisi dinas sekali)
  const [formData, setFormData] = useState(TEMPLATE_KOLOM_PNC);
  const [periodDocExists, setPeriodDocExists] = useState(null);

  const currentCollectionName = getPncCollectionName(
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
        const reportRef = getPncReportRef(targetCollection, puskId);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          setPeriodDocExists(true);
          const data = reportSnap.data();
          setFormData(() => {
            const merged = { ...TEMPLATE_KOLOM_PNC };
            Object.keys(TEMPLATE_KOLOM_PNC).forEach((key) => {
              if (data[key] !== undefined) merged[key] = data[key];
            });
            return merged;
          });
          return;
        }

        // Dokumen belum ada. Kalau periode ini sedang terbuka (editable),
        // auto-create dokumen kosong supaya Petugas tidak terblokir —
        // biasanya terjadi karena puskesmas ini baru ditambahkan setelah
        // Admin membuka periode (jadi tidak ikut ter-generate saat itu).
        if (canEdit && profileForInit) {
          const initPayload = {
            ...TEMPLATE_KOLOM_PNC,
            puskesmasId: puskId,
            namaPuskesmas: profileForInit.namaPuskesmas || puskId,
            [STATUS_FIELD]: STATUS_DRAFT,
            updatedAt: serverTimestamp(),
          };
          await setDoc(reportRef, initPayload, { merge: true });
          setPeriodDocExists(true);
          setFormData(TEMPLATE_KOLOM_PNC);
        } else {
          setPeriodDocExists(false);
          setFormData(TEMPLATE_KOLOM_PNC);
        }
      } catch (err) {
        console.error("Error fetching PNC report data for month:", err);
        setPeriodDocExists(false);
        setFormData(TEMPLATE_KOLOM_PNC);
      }
    },
    [],
  );

  // Load user profile + target bulin dari master puskesmas (sasaranBulin sudah
  // diisi dinas lewat modul ANC — dipakai bersama, tidak diinput ulang di sini)
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
            if (pkmSnap.exists())
              setTargetBulin(pkmSnap.data().sasaranBulin || 0);

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
        console.error("Error initializing Form PNC:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const targetCol = getPncCollectionName(selectedYear, mId);
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

      // PN (otomatis terisi) = PN di Fasyankes + PN di Non-Fasyankes
      const pnTotal =
        Number(dataToSave.pnFasyankes || 0) +
        Number(dataToSave.pnNonFasyankes || 0);

      const periodeId = `${selectedYear}-${selectedMonth}`;
      const uniqueDocId = `${periodeId}_${userProfile.puskesmasId}`;

      const reportPayload = {
        puskesmasId: userProfile.puskesmasId,
        namaPuskesmas: userProfile.namaPuskesmas || userProfile.puskesmasId,
        periode: periodeId,
        ...dataToSave,
        pnTotal,
        [STATUS_FIELD]: statusReport,
        updatedAt: serverTimestamp(),
        updatedBy: userProfile.email,
      };

      try {
        const reportRef = getPncReportRef(
          currentCollectionName,
          userProfile.puskesmasId,
        );
        await setDoc(reportRef, reportPayload, { merge: true });

        const globalPncReportRef = doc(db, "pnc_reports", uniqueDocId);
        await setDoc(globalPncReportRef, reportPayload, { merge: true });

        const rekapRef = doc(db, "rekap_kelengkapan_pnc", uniqueDocId);
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
        console.error("Error saving PNC report:", err);
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
      console.error("Error submitting final PNC report:", err);
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
    targetBulin,
    formData,
    periodDocExists,
    loadMonth,
    saveToFirestore,
    handleInputChange,
    handleFinalSubmit,
  };
}
