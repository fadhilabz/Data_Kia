"use client";

import { useState, useEffect } from "react";
import { subscribeRekapKelengkapan } from "@/lib/ibu/anc/ancConfig";

export default function RekapKelengkapanCard({ periodeId, namaPeriode }) {
  const [rekap, setRekap] = useState({
    completedCount: 0,
    totalPuskesmas: 0,
    list: [],
    allSubmitted: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!periodeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeRekapKelengkapan(
      periodeId,
      (data) => {
        setRekap(data);
        setLoading(false);
      },
      (err) => {
        console.error("RekapKelengkapanCard error:", err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [periodeId]);

  if (loading) {
    return (
      <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant shadow-sm text-xs text-on-surface-variant">
        Memuat status kelengkapan realtime...
      </div>
    );
  }

  const { completedCount, totalPuskesmas, list, allSubmitted, noPuskesmas } =
    rekap;

  const isZeroPuskesmas = totalPuskesmas === 0 || noPuskesmas;

  return (
    <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`material-symbols-outlined text-xl ${allSubmitted ? "text-emerald-600" : "text-amber-600"}`}
          >
            {allSubmitted ? "check_circle" : "radio_button_unchecked"}
          </span>
          <p className="text-xs font-bold text-on-surface">
            Status Kelengkapan Pelaporan {namaPeriode ? `— ${namaPeriode}` : ""}
          </p>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${allSubmitted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}
        >
          <span className="material-symbols-outlined text-sm">
            {allSubmitted ? "check_circle" : "pending_actions"}
          </span>
          <span>
            {completedCount} / {totalPuskesmas} Puskesmas selesai
          </span>
        </div>
      </div>

      {isZeroPuskesmas ? (
        <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-amber-600">
            warning
          </span>
          <span>Belum ada master data Puskesmas.</span>
        </div>
      ) : list.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 border-t border-outline-variant/50">
          {list.map((pkm) => (
            <li
              key={pkm.id}
              className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all ${
                pkm.submitted
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200/60"
                  : "bg-rose-50/80 text-rose-800 border border-rose-200/60"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] flex-shrink-0 ${pkm.submitted ? "text-emerald-600" : "text-rose-500"}`}
              >
                {pkm.submitted ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className="truncate">{pkm.nama}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-on-surface-variant italic">
          Belum ada data Puskesmas terdaftar di sistem.
        </p>
      )}
    </div>
  );
}
