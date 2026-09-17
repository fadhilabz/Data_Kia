// components/comAnak/kmb/form/KmbKasusCard.jsx
"use client";

import { KMB_KELOMPOK_UMUR, KMB_SEBAB_LIST } from "@/constants/kmbFields";

export default function KmbKasusCard({ kasus, index, onChange, onHapus, disabled }) {
  return (
    <div className="border border-outline-variant rounded-xl p-4 space-y-3 relative">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-primary">Kasus #{index + 1}</h4>
        {!disabled && (
          <button
            type="button"
            onClick={() => onHapus(kasus.id)}
            className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Hapus
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-on-surface-variant">Kelompok Umur</label>
          <select
            value={kasus.kelompokUmur}
            disabled={disabled}
            onChange={(e) => onChange(kasus.id, "kelompokUmur", e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high"
          >
            {KMB_KELOMPOK_UMUR.map((g) => (
              <option key={g.key} value={g.key}>{g.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-on-surface-variant">Jenis Kelamin</label>
          <select
            value={kasus.jenisKelamin}
            disabled={disabled}
            onChange={(e) => onChange(kasus.id, "jenisKelamin", e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high"
          >
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-on-surface-variant">Sebab Kematian</label>
          <select
            value={kasus.sebab}
            disabled={disabled}
            onChange={(e) => onChange(kasus.id, "sebab", e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high"
          >
            {KMB_SEBAB_LIST.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-on-surface-variant">Nama Anak</label>
          <input
            type="text"
            value={kasus.nama}
            disabled={disabled}
            onChange={(e) => onChange(kasus.id, "nama", e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-on-surface-variant">Nama Orang Tua</label>
          <input
            type="text"
            value={kasus.namaOrtu}
            disabled={disabled}
            onChange={(e) => onChange(kasus.id, "namaOrtu", e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-on-surface-variant">Alamat</label>
        <input
          type="text"
          value={kasus.alamat}
          disabled={disabled}
          onChange={(e) => onChange(kasus.id, "alamat", e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-on-surface-variant">Tanggal Lahir</label>
          <input
            type="date"
            value={kasus.tanggalLahir}
            disabled={disabled}
            onChange={(e) => onChange(kasus.id, "tanggalLahir", e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-on-surface-variant">Jam Lahir</label>
          <input
            type="time"
            value={kasus.jamLahir}
            disabled={disabled}
            onChange={(e) => onChange(kasus.id, "jamLahir", e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-on-surface-variant">Tanggal Kematian</label>
          <input
            type="date"
            value={kasus.tanggalKematian}
            disabled={disabled}
            onChange={(e) => onChange(kasus.id, "tanggalKematian", e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-on-surface-variant">Umur Saat Kematian</label>
          <input
            type="text"
            placeholder="mis. 3 tahun 2 bulan"
            value={kasus.umurKematian}
            disabled={disabled}
            onChange={(e) => onChange(kasus.id, "umurKematian", e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-on-surface-variant">Tempat Kematian</label>
        <input
          type="text"
          placeholder="mis. Rumah / Puskesmas / Rumah Sakit"
          value={kasus.tempatKematian}
          disabled={disabled}
          onChange={(e) => onChange(kasus.id, "tempatKematian", e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-outline-variant text-sm disabled:bg-surface-container-high"
        />
      </div>
    </div>
  );
}