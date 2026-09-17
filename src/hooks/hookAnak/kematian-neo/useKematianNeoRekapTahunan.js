// hooks/hookAnak/kematian-neo/useKematianNeoRekapTahunan.js
// Fetch data Kematian Neonatal untuk SEMUA 12 bulan dalam satu tahun
// sekaligus, dipakai halaman Rekap Tahunan Admin. Beda dari
// useKematianNeoPeriod.js (yang cuma fetch 1 bulan terpilih).

'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getKematianNeoCollectionName, DAFTAR_BULAN_ID } from '@/lib/libAnak/kematian-neo/kematianNeoConfig';
import { getJumlahKematianNeonatal, getJumlahKematianBayi } from '@/constants/kematianNeoFields';

export function useKematianNeoRekapTahunan(tahun) {
  const [loading, setLoading] = useState(true);
  // matrixData: [{ id, nama, perBulan: { '01': {...laporan}, '02': {...}, ... }, totalTahun: {...} }]
  const [matrixData, setMatrixData] = useState([]);
  // gabungan SEMUA laporan (semua puskesmas x semua bulan) — dipakai untuk
  // hitung total sebab kematian setahun (calculateKematianNeoSummary)
  const [allReportsFlat, setAllReportsFlat] = useState([]);

  const loadData = useCallback(async (year) => {
    if (!year) return;
    setLoading(true);
    try {
      const puskesmasSnap = await getDocs(collection(db, 'puskesmas'));
      const pkmList = puskesmasSnap.docs.map((d) => ({ id: d.id, nama: d.data().nama || d.id }));

      // Fetch semua 12 bulan x semua puskesmas secara paralel
      const allData = await Promise.all(
        DAFTAR_BULAN_ID.map(async (bulanId) => {
          const collectionName = getKematianNeoCollectionName(year, bulanId);
          const rows = await Promise.all(
            pkmList.map(async (pkm) => {
              const snap = await getDoc(doc(db, collectionName, pkm.id));
              return { pkmId: pkm.id, bulanId, data: snap.exists() ? snap.data() : {} };
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
          perBulan[bulanId] = found?.data || {};
        });

        const totalTahun = {
          jumlahKematianNeonatal: DAFTAR_BULAN_ID.reduce(
            (sum, b) => sum + getJumlahKematianNeonatal(perBulan[b]), 0
          ),
          jumlahKematianBayi: DAFTAR_BULAN_ID.reduce(
            (sum, b) => sum + getJumlahKematianBayi(perBulan[b]), 0
          ),
        };

        return { id: pkm.id, nama: pkm.nama, perBulan, totalTahun };
      });

      matrix.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
      setMatrixData(matrix);
    } catch (err) {
      console.error('useKematianNeoRekapTahunan error:', err);
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