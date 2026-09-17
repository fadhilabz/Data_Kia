// hooks/hookShk/useShkRekapTahunan.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getShkCollectionName, DAFTAR_BULAN_ID } from '@/lib/libShk/shkConfig';
import { getCakupanShk } from '@/constants/shkFields';

export function useShkRekapTahunan(tahun) {
  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState([]);
  const [allReportsFlat, setAllReportsFlat] = useState([]);

  const loadData = useCallback(async (year) => {
    if (!year) return;
    setLoading(true);
    try {
      const puskesmasSnap = await getDocs(collection(db, 'puskesmas'));
      const pkmList = puskesmasSnap.docs.map((d) => ({ id: d.id, nama: d.data().nama || d.id, sasaranBbl: d.data().sasaranBbl || 0 }));

      const allData = await Promise.all(
        DAFTAR_BULAN_ID.map(async (bulanId) => {
          const collectionName = getShkCollectionName(year, bulanId);
          const rows = await Promise.all(
            pkmList.map(async (pkm) => {
              const snap = await getDoc(doc(db, collectionName, pkm.id));
              const data = snap.exists() ? snap.data() : {};
              return { pkmId: pkm.id, bulanId, data: { sasaranBbl: pkm.sasaranBbl, ...data } };
            })
          );
          return rows;
        })
      );

      const flatRows = allData.flat();
      setAllReportsFlat(flatRows.map((r) => r.data));

      const matrix = pkmList.map((pkm) => {
        const perBulan = {};
        DAFTAR_BULAN_ID.forEach((bulanId) => {
          const found = flatRows.find((r) => r.pkmId === pkm.id && r.bulanId === bulanId);
          perBulan[bulanId] = found?.data || { sasaranBbl: pkm.sasaranBbl };
        });

        const totalBblShkTahun = DAFTAR_BULAN_ID.reduce(
          (sum, b) => sum + Number(perBulan[b].bblDilakukanShk || 0), 0
        );
        const totalPositifTahun = DAFTAR_BULAN_ID.reduce(
          (sum, b) => sum + Number(perBulan[b].positifHk || 0), 0
        );

        return { id: pkm.id, nama: pkm.nama, perBulan, totalTahun: { bblDilakukanShk: totalBblShkTahun, positifHk: totalPositifTahun } };
      });

      matrix.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
      setMatrixData(matrix);
    } catch (err) {
      console.error('useShkRekapTahunan error:', err);
      setMatrixData([]);
      setAllReportsFlat([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tahun) loadData(tahun);
  }, [tahun, loadData]);

  return { loading, matrixData, allReportsFlat, reload: () => loadData(tahun) };
}