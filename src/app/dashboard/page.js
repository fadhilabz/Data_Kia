'use client';

import { useRouter } from 'next/navigation';
import { useDashboardStatus } from '@/hooks/useDashboardStatus';
import { formatPeriode } from '@/constants/periode';

export default function DashboardPage() {
  const router = useRouter();
  const {
    loading,
    userProfile,
    statusList,
    jumlahSubmitted,
    totalModul,
    activeMonth,
    selectedYear,
  } = useDashboardStatus();

  const puskesmasName =
    userProfile?.namaPuskesmas ||
    (userProfile?.puskesmasId
      ? userProfile.puskesmasId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Puskesmas');

  const periodLabel = activeMonth && selectedYear ? formatPeriode(selectedYear, activeMonth) : null;
  const persenSelesai = totalModul > 0 ? Math.round((jumlahSubmitted / totalModul) * 100) : 0;

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex-1 p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-gutter">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-on-primary shadow-sm">
        <h1 className="text-headline-lg font-headline-lg mb-1 tracking-tight">
          Selamat Datang, {puskesmasName}
        </h1>
        <p className="text-body-lg font-body-lg opacity-90">
          {periodLabel
            ? `Kelola dan pantau data kesehatan ibu dan anak untuk periode ${periodLabel}.`
            : 'Periode pelaporan belum dibuka oleh Admin Dinas Kesehatan.'}
        </p>
      </div>

      {periodLabel && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Status Pelaporan — Spans 2 columns */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-gap flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">fact_check</span>
                Status Pelaporan Bulan Ini
              </h2>
              <span className="font-label-md text-label-md text-outline">{periodLabel}</span>
            </div>

            {statusList.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-6 text-center">
                Belum ada modul yang bisa diisi untuk periode ini.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-outline-variant">
                {statusList.map((modul) => (
                  <div key={modul.key} className="flex justify-between items-center py-3 gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full block ${modul.sudahSubmit ? 'bg-primary-fixed' : 'bg-error'}`}
                      />
                      <span className="font-body-md text-body-md font-medium text-on-surface">
                        {modul.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full px-3 py-1 font-label-md text-label-md flex items-center gap-1.5 border ${
                          modul.sudahSubmit
                            ? 'bg-primary-fixed text-on-primary-fixed border-primary-fixed-dim'
                            : 'bg-error-container text-on-error-container border-error/20'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {modul.sudahSubmit ? 'check_circle' : 'warning'}
                        </span>
                        {modul.sudahSubmit ? 'Sudah Diisi' : 'Belum Diisi'}
                      </div>
                      <button
                        onClick={() => router.push(modul.href)}
                        className="bg-secondary text-on-secondary px-4 py-1.5 rounded-lg font-label-md text-label-md hover:bg-secondary/90 transition-colors"
                      >
                        {modul.sudahSubmit ? 'Lihat / Edit' : 'Input Sekarang'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ringkasan Progress — Side Column */}
          <div className="lg:col-span-1 bg-surface-container-low border border-outline-variant rounded-xl p-stack-gap flex flex-col items-center justify-center gap-4">
            <h2 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2 self-start">
              <span className="material-symbols-outlined">donut_large</span>
              Kelengkapan Laporan
            </h2>

            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-surface-variant" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - persenSelesai / 100)}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-700"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">{persenSelesai}%</span>
                <span className="text-[11px] text-on-surface-variant">Selesai</span>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant text-center">
              <strong className="text-on-surface">{jumlahSubmitted}</strong> dari{' '}
              <strong className="text-on-surface">{totalModul}</strong> modul sudah dilaporkan
            </p>
          </div>
        </div>
      )}
    </main>
  );
}