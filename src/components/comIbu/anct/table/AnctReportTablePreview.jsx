// components/anct/table/AnctReportTablePreview.jsx
"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAnctCollectionName } from "@/lib/ibu/anct/anctConfig";
import AnctTable from "./AnctTable";

export default function AnctReportTablePreview({
  selectedMonth,
  selectedYear,
  userProfile,
}) {
  const [reportList, setReportList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!selectedYear || !selectedMonth) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const collectionName = getAnctCollectionName(
          selectedYear,
          selectedMonth,
        );
        const snap = await getDocs(collection(db, collectionName));
        const rows = [];

        snap.forEach((d) => {
          if (d.id !== "_info") {
            // Filter berdasarkan role user
            if (userProfile?.role !== "admin_dinkes") {
              if (d.id === userProfile?.puskesmasId) {
                rows.push({ id: d.id, puskesmasId: d.id, ...d.data() });
              }
            } else {
              rows.push({ id: d.id, puskesmasId: d.id, ...d.data() });
            }
          }
        });

        rows.sort((a, b) =>
          (a.namaPuskesmas || "").localeCompare(b.namaPuskesmas || ""),
        );
        setReportList(rows);
      } catch (err) {
        console.error("AnctReportTablePreview loadData error:", err);
        setReportList([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear, selectedMonth, userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-56">
        <span className="material-symbols-outlined absolute left-3 top-2.5 text-xs text-gray-400">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari Puskesmas..."
          className="pl-8 pr-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700 border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 w-full"
        />
      </div>
      <AnctTable reportList={reportList} searchQuery={searchQuery} />
    </div>
  );
}
