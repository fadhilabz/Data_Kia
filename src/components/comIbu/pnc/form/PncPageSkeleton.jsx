// components/pnc/form/PncPageSkeleton.jsx
// Skeleton loading untuk halaman Form PNC Petugas — dipakai selagi
// usePncPeriode / usePncFormData masih fetch data dari Firestore.
// Bentuknya meniru layout asli (header, kartu periode 12 bulan, tab,
// area form) supaya transisi ke halaman sungguhan terasa mulus,
// bukan cuma spinner polos di tengah layar.

"use client";

function Shimmer({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-surface-container-high rounded-lg ${className}`}
    />
  );
}

export default function PncPageSkeleton() {
  return (
    <main className="flex-1 p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
        <div className="space-y-2">
          <Shimmer className="h-6 w-64" />
          <Shimmer className="h-3 w-40" />
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-8 w-32 rounded-full" />
          <Shimmer className="h-8 w-56 rounded-full" />
        </div>
      </div>

      {/* Kartu periode 12 bulan skeleton */}
      <div className="bg-surface-container-low p-4 sm:p-5 rounded-2xl border border-outline-variant space-y-3">
        <div className="flex items-center justify-between">
          <Shimmer className="h-4 w-56" />
          <Shimmer className="h-3 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Shimmer key={i} className="h-[85px] w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Tab skeleton */}
      <div className="flex gap-2 border-b border-outline-variant pb-2">
        <Shimmer className="h-9 w-40 rounded-t-xl" />
        <Shimmer className="h-9 w-40 rounded-t-xl" />
      </div>

      {/* Step nav skeleton */}
      <div className="grid grid-cols-2 gap-2">
        <Shimmer className="h-14 w-full rounded-lg" />
        <Shimmer className="h-14 w-full rounded-lg" />
      </div>

      {/* Area form skeleton */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-5">
        {Array.from({ length: 3 }).map((_, sectionIdx) => (
          <div key={sectionIdx} className="space-y-2">
            <Shimmer className="h-4 w-44" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Shimmer className="h-3 w-32" />
                <Shimmer className="h-9 w-full rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Shimmer className="h-3 w-32" />
                <Shimmer className="h-9 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
          <Shimmer className="h-9 w-28 rounded-lg" />
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-9 w-32 rounded-lg" />
        </div>
      </div>
    </main>
  );
}