// components/pnc/form/PncStatusBanners.jsx
export default function PncStatusBanners({ periodDocExists, isReadOnly, periodLabel }) {
  if (!periodDocExists) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center gap-3">
        <span className="material-symbols-outlined text-2xl text-amber-600">info</span>
        <div>
          <p className="font-bold">Periode Belum Pernah Dibuka</p>
          <p className="mt-0.5 opacity-90">
            Dokumen pelaporan PNC untuk <strong>{periodLabel}</strong> belum pernah diinisialisasi oleh Admin Dinas
            Kesehatan.
          </p>
        </div>
      </div>
    );
  }

  if (isReadOnly) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center gap-3">
        <span className="material-symbols-outlined text-2xl text-rose-600">lock</span>
        <div>
          <p className="font-bold">Mode Riwayat Laporan (Read-Only)</p>
          <p className="mt-0.5 opacity-90">
            Periode <strong>{periodLabel}</strong> dalam status Dikunci. Anda dapat meninjau seluruh riwayat angka
            yang pernah diisikan. Jika perlu melakukan perubahan/susulan data, hubungi Admin Dinkes untuk Membuka
            Kembali Input bulan ini.
          </p>
        </div>
      </div>
    );
  }

  return null;
}