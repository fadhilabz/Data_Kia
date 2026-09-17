// components/kematian-neo/form/KematianNeoGroupSection.jsx
// Komponen generik untuk 1 kelompok umur kematian (0-6 hari / 7-28 hari /
// post-neonatal). Dipakai 3x di halaman form — strukturnya identik,
// cuma daftar sebabList & key-nya beda (lihat KEMATIAN_NEO_GROUPS).

"use client";

import { getGroupPart, getSebabValue, getKeteranganKey } from "@/constants/kematianNeoFields";

export default function KematianNeoGroupSection({ group, formData, onChange, disabled }) {
  const l = getGroupPart(formData, group.key, "l");
  const p = getGroupPart(formData, group.key, "p");
  const abs = l + p;
  const keteranganKey = getKeteranganKey(group.key);

  return (
    <div className="border border-outline-variant rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-bold text-primary">{group.label}</h3>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-container-high text-on-surface">
          Total: {abs} (L: {l} / P: {p})
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-xs">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-on-surface-variant">Jumlah (L)</label>
          <input
            type="number"
            min="0"
            value={l}
            disabled={disabled}
            onChange={(e) => onChange(`${group.key}L`, e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm text-right disabled:bg-surface-container-high"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-on-surface-variant">Jumlah (P)</label>
          <input
            type="number"
            min="0"
            value={p}
            disabled={disabled}
            onChange={(e) => onChange(`${group.key}P`, e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm text-right disabled:bg-surface-container-high"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-on-surface-variant mb-2">Sebab Kematian</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {group.sebabList.map((sebab) => {
            const sebabFieldKey = `${group.key}_${sebab.key}`;
            const val = getSebabValue(formData, group.key, sebab.key);
            return (
              <div key={sebab.key} className="flex flex-col gap-1">
                <label className="text-[11px] text-on-surface-variant">{sebab.label}</label>
                <input
                  type="number"
                  min="0"
                  value={val}
                  disabled={disabled}
                  onChange={(e) => onChange(sebabFieldKey, e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm text-right disabled:bg-surface-container-high"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-on-surface-variant">
          Keterangan (isi nama penyebab kalau pilih &quot;Lain-lain&quot;)
        </label>
        <textarea
          rows={2}
          value={formData[keteranganKey] || ""}
          disabled={disabled}
          onChange={(e) => onChange(keteranganKey, e.target.value, true)}
          className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high resize-none"
        />
      </div>

      <div className="flex flex-col gap-1 max-w-xs">
        <label className="text-[11px] font-semibold text-on-surface-variant">
          Jumlah Kematian Berdasarkan Alamat Domisili (MPDN)
        </label>
        <input
          type="number"
          min="0"
          value={Number(formData[group.mpdnKey] || 0)}
          disabled={disabled}
          onChange={(e) => onChange(group.mpdnKey, e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm text-right disabled:bg-surface-container-high"
        />
      </div>
    </div>
  );
}