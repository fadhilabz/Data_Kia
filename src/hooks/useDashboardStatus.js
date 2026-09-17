// hooks/useDashboardStatus.js
// Fetch status pelaporan REAL (bukan dummy) untuk semua modul yang sudah
// dibangun, untuk puskesmas & periode aktif milik user yang login.

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useManajemenPeriode } from "@/hooks/useManajemenPeriode";
import { getAncCollectionName } from "@/lib/ibu/anc/ancConfig";
import { getPncCollectionName } from "@/lib/ibu/pnc/pncConfig";
import { getKnCollectionName } from "@/lib/libAnak/kn/knConfig";
import { getKematianNeoCollectionName } from "@/lib/libAnak/kematian-neo/kematianNeoConfig";
import { getKmbCollectionName } from "@/lib/libAnak/kmb/kmbConfig";
import { getShkCollectionName } from "@/lib/libShk/shkConfig";

const STATUS_FIELD = "statusReport";
const STATUS_SUBMITTED = "submitted";

// Daftar modul yang statusnya dicek di dashboard. Tambahkan entri baru di
// sini kalau ada modul baru yang sudah dibangun (mis. ANC Terpadu, Kematian
// Ibu) — cukup tambah 1 baris, tidak perlu ubah komponen page.
const MODUL_LIST = [
  { key: "anc", label: "ANC (Antenatal Care)", href: "/dashboard/anc", getCollectionName: getAncCollectionName },
  { key: "pnc", label: "PNC (Postnatal Care)", href: "/dashboard/pnc", getCollectionName: getPncCollectionName },
  { key: "kn", label: "KN (Kunjungan Neonatal)", href: "/dashboard/dataAnak/kn", getCollectionName: getKnCollectionName },
  { key: "kematian-neo", label: "Kematian Bayi (Neo + Post Neo)", href: "/dashboard/dataAnak/kematian-neo", getCollectionName: getKematianNeoCollectionName },
  { key: "kmb", label: "Pel. Balita dan Kematian (KMB)", href: "/dashboard/dataAnak/kmb", getCollectionName: getKmbCollectionName },
  { key: "shk", label: "SHK (Skrining Hipotiroid Kongenital)", href: "/dashboard/shk", getCollectionName: getShkCollectionName },
];

export function useDashboardStatus() {
  const { activeMonth, selectedYear, loading: periodeLoading } = useManajemenPeriode();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [statusList, setStatusList] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const userSnap = await getDoc(doc(db, "users", user.email));
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        }
      } catch (err) {
        console.error("useDashboardStatus: gagal ambil profil user", err);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      if (periodeLoading) return;
      if (!userProfile?.puskesmasId || !activeMonth || !selectedYear) {
        setLoading(false);
        setStatusList([]);
        return;
      }
      setLoading(true);
      try {
        const results = await Promise.all(
          MODUL_LIST.map(async (modul) => {
            try {
              const collectionName = modul.getCollectionName(selectedYear, activeMonth);
              const snap = await getDoc(doc(db, collectionName, userProfile.puskesmasId));
              const data = snap.exists() ? snap.data() : null;
              const sudahSubmit = data?.[STATUS_FIELD] === STATUS_SUBMITTED;
              return { ...modul, sudahSubmit, docExists: snap.exists() };
            } catch (err) {
              console.error(`useDashboardStatus: gagal cek modul ${modul.key}`, err);
              return { ...modul, sudahSubmit: false, docExists: false };
            }
          })
        );
        setStatusList(results);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [userProfile, activeMonth, selectedYear, periodeLoading]);

  const jumlahSubmitted = statusList.filter((m) => m.sudahSubmit).length;
  const totalModul = statusList.length;

  return {
    loading: loading || periodeLoading,
    userProfile,
    statusList,
    jumlahSubmitted,
    totalModul,
    activeMonth,
    selectedYear,
  };
}