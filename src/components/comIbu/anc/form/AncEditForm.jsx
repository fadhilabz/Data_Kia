// components/anc/AncEditForm.jsx
// Komponen Form Modal Edit & Restore Data Laporan ANC Puskesmas dengan Pengontrolan Akses (Locking System).

'use client';

import { useState, useEffect } from 'react';
import { ANC_FIELDS, getFieldValue } from '@/constants/ancFields';
import { formatPeriode } from '@/constants/periode';

export default function AncEditForm({
  isOpen = false,
  onClose,
  puskesmasData = null,
  periodeInfo = null, // { month, year, label }
  isLocked = false,
  onSave,
  onRestore,
}) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (puskesmasData) {
      const initial = {};
      ANC_FIELDS.forEach((field) => {
        initial[field.key] = getFieldValue(puskesmasData, field, puskesmasData);
      });
      setFormData(initial);
    }
  }, [puskesmasData]);

  if (!isOpen || !puskesmasData) return null;

  const pkmName = puskesmasData.namaPuskesmas || puskesmasData.nama || 'Puskesmas';
  const periodeStr = formatPeriode(periodeInfo?.year || '2026', periodeInfo?.month || '01');

  const handleInputChange = (e) => {
    if (isLocked) return;
    const { name, value } = e.target;
    const val = Math.max(0, parseInt(value, 10) || 0);
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isLocked || !onSave) return;
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving ANC edit:', err);
      alert('Gagal menyimpan perubahan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreClick = async () => {
    if (isLocked || !onRestore) return;
    const confirmRestore = window.confirm(
      `Apakah Anda yakin ingin mengembalikan/reset data laporan ANC ${pkmName} untuk ${periodeStr} ke versi draf awal?\n\nData yang diinputkan sebelumnya akan digantikan.`
    );
    if (!confirmRestore) return;

    setRestoring(true);
    try {
      await onRestore(puskesmasData.puskesmasId || puskesmasData.id);
      alert(`Data laporan ANC ${pkmName} berhasil dikembalikan ke versi draf awal.`);
      onClose();
    } catch (err) {
      console.error('Error restoring ANC data:', err);
      alert('Gagal mengembalikan data: ' + err.message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
              <h3 className="text-lg font-bold text-on-surface">Edit & Restore Data ANC — {pkmName}</h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Periode Pelaporan: <strong className="text-primary font-bold">{periodeStr}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Lock Banner Warning Jika Periode Dikunci */}
        {isLocked && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs flex items-center gap-3 flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-rose-600">lock</span>
            <div>
              <p className="font-bold text-sm">Periode Ini Telah Dikunci Oleh Admin Dinas Kesehatan</p>
              <p className="mt-0.5 text-rose-800">
                Form input bersifat Read-Only. Seluruh kolom inputan dan tombol simpan/restore telah di-disable secara otomatis.
              </p>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="space-y-6 overflow-y-auto flex-1 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ANC_FIELDS.filter((f) => !f.isCalculated).map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="block text-[11px] font-bold text-on-surface-variant truncate">
                  {field.label} {field.isPercent ? '(%)' : ''}
                </label>
                <input
                  type="number"
                  name={field.key}
                  min={0}
                  disabled={isLocked || saving || restoring}
                  value={formData[field.key] !== undefined ? formData[field.key] : 0}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-surface-container-highest border border-outline-variant rounded-xl text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary ${
                    isLocked ? 'opacity-60 bg-surface-container-high cursor-not-allowed' : ''
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-outline-variant flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div>
              {!isLocked && (
                <button
                  type="button"
                  onClick={handleRestoreClick}
                  disabled={restoring || saving}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  title="Kembalikan/Reset data ke draf versi awal"
                >
                  <span className="material-symbols-outlined text-sm">restore</span>
                  {restoring ? 'Mengembalikan...' : 'Kembalikan Data (Restore)'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving || restoring}
                className="px-4 py-2 rounded-full text-xs font-bold border border-outline-variant text-on-surface hover:bg-surface-container-high transition"
              >
                {isLocked ? 'Tutup' : 'Batal'}
              </button>

              {!isLocked && (
                <button
                  type="submit"
                  disabled={saving || restoring}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-primary text-on-primary hover:bg-primary/90 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
