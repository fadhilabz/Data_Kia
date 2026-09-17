// hooks/useManajemenPeriode.js
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import {
  DAFTAR_BULAN,
  isPeriodeLocked,
  STATUS_TERKUNCI,
  STATUS_TERBUKA,
} from "@/constants/periode";
import {
  TEMPLATE_KOLOM_ANC,
  getAncCollectionName,
} from "@/lib/ibu/anc/ancConfig";
import {
  TEMPLATE_KOLOM_PNC,
  getPncCollectionName,
} from "@/lib/ibu/pnc/pncConfig";
import {
  checkKelengkapanGabungan,
  checkFullYearCompleteGabungan,
  DAFTAR_MODUL,
} from "@/lib/periode/kelengkapanModul";

export function useManajemenPeriode(
  initialYear = String(new Date().getFullYear()),
) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [openedMonths, setOpenedMonths] = useState([]);
  const [statusPeriodeMap, setStatusPeriodeMap] = useState({});
  const [activeMonth, setActiveMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchPeriodData = async () => {
    setLoading(true);
    try {
      const activeDoc = await getDocFromSettings("active_period");
      if (activeDoc && activeDoc.tahun === selectedYear) {
        setActiveMonth(activeDoc.bulan);
      } else {
        setActiveMonth(null);
      }

      const openedDoc = await getDocFromSettings("opened_periods");
      setOpenedMonths(openedDoc?.[selectedYear] || []);

      const statusDoc = await getDocFromSettings("period_statuses");
      setStatusPeriodeMap(statusDoc || {});
    } catch (err) {
      console.error("Gagal mengambil data periode:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper kecil biar tidak menulis getDoc(doc(db,'settings', x)) berulang-ulang
  const getDocFromSettings = async (settingId) => {
    const { doc: docFn, getDoc: getDocFn } = await import("firebase/firestore");
    const snap = await getDocFn(docFn(db, "settings", settingId));
    return snap.exists() ? snap.data() : null;
  };

  useEffect(() => {
    fetchPeriodData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // Tambah Periode Baru (M + 1) — sekarang cek kelengkapan GABUNGAN semua modul
  const handleCreateNextPeriod = async () => {
    setProcessing(true);
    try {
      let nextMonthId = "01";
      let prevMonthId = null;

      if (openedMonths.length > 0) {
        const lastOpened = Math.max(
          ...openedMonths.map((m) => parseInt(m, 10)),
        );
        if (lastOpened >= 12) {
          alert("Semua bulan (12 bulan) untuk tahun ini sudah terbuka!");
          setProcessing(false);
          return;
        }
        prevMonthId = String(lastOpened).padStart(2, "0");
        nextMonthId = String(lastOpened + 1).padStart(2, "0");
      }

      // ---- VALIDASI: bulan sebelumnya harus 100% lengkap SEMUA MODUL dulu ----
      if (prevMonthId) {
        const { allSubmitted, noPuskesmas, list } =
          await checkKelengkapanGabungan(selectedYear, prevMonthId);
        const namaBulanSebelumnya =
          DAFTAR_BULAN.find((b) => b.id === prevMonthId)?.nama || prevMonthId;

        if (noPuskesmas) {
          alert(
            "Belum ada data Puskesmas terdaftar di sistem. Tambahkan Puskesmas terlebih dahulu.",
          );
          setProcessing(false);
          return;
        }

        if (!allSubmitted) {
          const detail = list
            .filter((p) => !p.lengkapSemuaModul)
            .map((p) => {
              const modulBelum = DAFTAR_MODUL.filter(
                (m) => !p.perModul[m.key],
              ).map((m) => m.label);
              return `• ${p.nama}: belum submit ${modulBelum.join(", ")}`;
            })
            .join("\n");

          alert(
            `Tidak bisa membuka bulan berikutnya.\n\nMasih ada Puskesmas yang belum menyelesaikan SEMUA modul (ANC & PNC) untuk periode ${namaBulanSebelumnya} ${selectedYear}:\n\n${detail}\n\nPastikan semua modul sudah di-submit final sebelum membuka bulan baru.`,
          );
          setProcessing(false);
          return;
        }
      }

      const namaBulanStr =
        DAFTAR_BULAN.find((b) => b.id === nextMonthId)?.nama || nextMonthId;
      if (
        !confirm(
          `Buat dan buka periode baru untuk ${namaBulanStr} ${selectedYear}?`,
        )
      ) {
        setProcessing(false);
        return;
      }

      const periodId = `${selectedYear}-${nextMonthId}`;
      const ancCollectionName = getAncCollectionName(selectedYear, nextMonthId);
      const pncCollectionName = getPncCollectionName(selectedYear, nextMonthId);
      const namaPeriode = `Periode ${namaBulanStr} ${selectedYear}`;
      const batch = writeBatch(db);

      batch.set(
        doc(db, "settings", "active_period"),
        {
          periodId,
          collectionName: ancCollectionName,
          bulan: nextMonthId,
          tahun: selectedYear,
          namaPeriode,
          status: "active",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      batch.set(
        doc(db, "settings", "opened_periods"),
        { [selectedYear]: [...openedMonths, nextMonthId] },
        { merge: true },
      );

      batch.set(
        doc(db, "settings", "period_statuses"),
        { [periodId]: STATUS_TERBUKA },
        { merge: true },
      );

      const puskesmasSnap = await getDocs(collection(db, "puskesmas"));
      if (!puskesmasSnap.empty) {
        puskesmasSnap.forEach((pkmDoc) => {
          const pkmData = pkmDoc.data();
          const dataUmum = {
            puskesmasId: pkmDoc.id,
            namaPuskesmas: pkmData.nama || pkmDoc.id,
            kecamatan: pkmData.kecamatan || "",
            statusReport: "draft",
            updatedAt: serverTimestamp(),
          };

          // Inisialisasi dokumen ANC
          // jumlahPenduduk, sasaranBumil, sasaranWus semuanya disalin dari data master
          // puskesmas ke dokumen ANC periode baru (sasaranBulin TIDAK di sini, itu hanya di PNC)
          batch.set(
            doc(db, ancCollectionName, pkmDoc.id),
            {
              ...TEMPLATE_KOLOM_ANC,
              ...dataUmum,
              jumlahPenduduk: pkmData.jumlahPenduduk || 0,
              sasaranBumil: pkmData.sasaranBumil || 0,
              sasaranWus: pkmData.sasaranWus || 0,
            },
            { merge: true },
          );

          // Inisialisasi dokumen PNC
          batch.set(
            doc(db, pncCollectionName, pkmDoc.id),
            {
              ...TEMPLATE_KOLOM_PNC,
              ...dataUmum,
              sasaranBulin: pkmData.sasaranBulin || 0,
            },
            { merge: true },
          );
        });
      }

      await batch.commit();
      await fetchPeriodData();
      alert(`Berhasil membuat & membuka ${namaPeriode} (ANC & PNC)!`);
    } catch (err) {
      console.error("Error menambah periode:", err);
      alert("Gagal menambah periode: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Toggle Buka / Tutup Periode (Lock / Unlock) — tidak berubah, tetap per key periode
  const handleToggleLock = async (bulanId) => {
    const periodId = `${selectedYear}-${bulanId}`;
    const currentStatus = statusPeriodeMap[periodId] || STATUS_TERBUKA;
    const locked = isPeriodeLocked(currentStatus);
    const newStatus = locked ? STATUS_TERBUKA : STATUS_TERKUNCI;

    const namaBulanStr =
      DAFTAR_BULAN.find((b) => b.id === bulanId)?.nama || bulanId;
    if (
      !confirm(
        `Yakin ingin ${locked ? "MEMBUKA" : "MENGUNCI"} periode ${namaBulanStr} ${selectedYear}?`,
      )
    ) {
      return;
    }

    setProcessing(true);
    try {
      const batch = writeBatch(db);
      batch.set(
        doc(db, "settings", "period_statuses"),
        { [periodId]: newStatus },
        { merge: true },
      );
      await batch.commit();

      setStatusPeriodeMap((prev) => ({ ...prev, [periodId]: newStatus }));
      alert(
        `Periode ${namaBulanStr} berhasil di-${locked ? "buka" : "kunci"}.`,
      );
    } catch (err) {
      console.error("Error lock:", err);
      alert("Gagal mengubah status periode: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Cek kelengkapan tahun penuh (gabungan semua modul), dipakai sebelum ganti tahun
  const checkTahunLengkap = async (tahun) =>
    checkFullYearCompleteGabungan(tahun);

  const getNextMonthLabel = () => {
    if (openedMonths.length === 0) return "Januari";
    const lastOpened = Math.max(...openedMonths.map((m) => parseInt(m, 10)));
    if (lastOpened >= 12) return null;
    return DAFTAR_BULAN.find(
      (b) => b.id === String(lastOpened + 1).padStart(2, "0"),
    )?.nama;
  };

  return {
    selectedYear,
    setSelectedYear,
    openedMonths,
    statusPeriodeMap,
    activeMonth,
    loading,
    processing,
    handleCreateNextPeriod,
    handleToggleLock,
    checkTahunLengkap,
    nextMonthName: getNextMonthLabel(),
  };
}
