// components/anct/form/AnctStatusBanners.jsx
'use client';

export default function AnctStatusBanners({ periodDocExists, isReadOnly, periodLabel }) {
  return (
    <>
      {!periodDocExists && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-amber-800">
          Periode {periodLabel} belum dibuka untuk diisi.
        </div>
      )}
      {isReadOnly && periodDocExists && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-600">
          Periode {periodLabel} terkunci — data hanya bisa dilihat, tidak bisa diubah.
        </div>
      )}
    </>
  );
}