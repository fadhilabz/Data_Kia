// components/anc/AncTableHeader.jsx
// Komponen terpisah untuk header <thead> tabel rekapitulasi ANC dengan struktur bertingkat (multi-level header) 3 baris.

'use client';

export default function AncTableHeader() {
  return (
    <thead className="bg-primary text-on-primary font-bold text-[11px] uppercase tracking-wider sticky top-0 z-20 shadow-sm text-center">
      {/* Header Level 1 (Baris Utama) */}
      <tr className="bg-primary border-b border-primary-container/30">
        <th className="p-2 border-r border-primary-container/30 sticky left-0 bg-primary z-30 min-w-[40px]" rowSpan={3}>
          No
        </th>
        <th className="p-2 border-r border-primary-container/30 sticky left-[40px] bg-primary z-30 min-w-[160px]" rowSpan={3}>
          Nama Puskesmas
        </th>
        <th className="p-2 border-r border-primary-container/30" colSpan={3}>
          Jumlah
        </th>
        <th className="p-2 border-r border-primary-container/30" rowSpan={3}>
          Buku KIA
        </th>
        <th className="p-2 border-r border-primary-container/30" colSpan={16}>
          Pelayanan Kunjungan Ibu Hamil (ANC)
        </th>
        <th className="p-2 border-r border-primary-container/30" colSpan={19}>
          Pelayanan Kunjungan Ibu Hamil Dengan 12 T
        </th>
        <th className="p-2 border-r border-primary-container/30" colSpan={5}>
          Status TT Bumil
        </th>
        <th className="p-2 border-r border-primary-container/30" rowSpan={3}>
          Pemberian TTD 180 Tab
        </th>
        <th className="p-2 border-r border-primary-container/30" colSpan={5}>
          Ibu Hamil Dengan Anemia
        </th>
        <th className="p-2 border-r border-primary-container/30" colSpan={4}>
          Status Gizi Bumil
        </th>
        <th className="p-2 border-r border-primary-container/30" colSpan={3}>
          Preeklamsia
        </th>
        <th className="p-2 border-r border-primary-container/30" colSpan={10}>
          Pelayanan Komplikasi Maternal
        </th>
        <th className="p-2 border-r border-primary-container/30 min-w-[80px]" rowSpan={3}>
          Kelas Bumil ≥4x
        </th>
        <th className="p-2 border-r border-primary-container/30 min-w-[70px]" rowSpan={3}>
          Bumil 4T
        </th>
        <th className="p-2 border-r border-primary-container/30" colSpan={2}>
          Deteksi Resti
        </th>
        <th className="p-2 border-r border-primary-container/30" colSpan={2}>
          Rujukan
        </th>
        <th className="p-2" colSpan={3}>
          Pusk Mampu PONED
        </th>
      </tr>

      {/* Header Level 2 (Baris Sub-Kategori) */}
      <tr className="bg-primary/90 border-b border-primary-container/30 text-[10px]">
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Penduduk</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Sasaran Bumil</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Sasaran WUS</th>
        
        <th className="p-1.5 border-r border-primary-container/30" colSpan={6}>K1 Murni</th>
        <th className="p-1.5 border-r border-primary-container/30" colSpan={2}>K1 Akses</th>
        <th className="p-1.5 border-r border-primary-container/30" colSpan={2}>K1 Dokter</th>
        <th className="p-1.5 border-r border-primary-container/30" colSpan={2}>K5 USG</th>
        <th className="p-1.5 border-r border-primary-container/30" colSpan={2}>K6</th>
        <th className="p-1.5 border-r border-primary-container/30 bg-sky-900/40" colSpan={2}>K8</th>
        
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>TB / BB</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>TD (Tensi)</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>LILA</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>TFU</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>DJJ</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Status TT</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Beri TTD</th>
        <th className="p-1.5 border-r border-primary-container/30" colSpan={6}>Tes Laboratorium</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Tatalaksana</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Temu Wicara</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>USG K1</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Skrining Jiwa</th>
        <th className="p-1.5 border-r border-primary-container/30" colSpan={2}>Cakupan 12 T</th>
        
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>T1</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>T2</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>T3</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>T4</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>T5</th>
        
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Ringan</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Sedang</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Berat</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Total</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>%</th>
        
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Suplemen</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>KEK</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>KEK PMT</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Resiko KEK</th>
        
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Skrining</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Kasus</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Tatalaksana</th>
        
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Keguguran</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Non-Obs</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Prot. Urin</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Malaria</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Hipertensi</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Obesitas</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Infeksi</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Jantung</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>DM</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>TBC</th>
        
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Nakes</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Masyarakat</th>
        
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Maternal</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>Neonatal</th>
        
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>PKM</th>
        <th className="p-1.5 border-r border-primary-container/30" rowSpan={2}>PONED</th>
        <th className="p-1.5" rowSpan={2}>%</th>
      </tr>

      {/* Header Level 3 (Baris Sub-Detail Abs & %) */}
      <tr className="bg-primary/80 text-[9px]">
        <th className="p-1 border-r border-primary-container/30">K1 Murni</th>
        <th className="p-1 border-r border-primary-container/30">%</th>
        <th className="p-1 border-r border-primary-container/30">TW1 Dkt</th>
        <th className="p-1 border-r border-primary-container/30">&gt;12m</th>
        <th className="p-1 border-r border-primary-container/30">%</th>
        <th className="p-1 border-r border-primary-container/30">Buku KIA</th>

        <th className="p-1 border-r border-primary-container/30">Abs</th>
        <th className="p-1 border-r border-primary-container/30">%</th>

        <th className="p-1 border-r border-primary-container/30">Abs</th>
        <th className="p-1 border-r border-primary-container/30">%</th>

        <th className="p-1 border-r border-primary-container/30">Abs</th>
        <th className="p-1 border-r border-primary-container/30">%</th>

        <th className="p-1 border-r border-primary-container/30">Abs</th>
        <th className="p-1 border-r border-primary-container/30">%</th>

        <th className="p-1 border-r border-primary-container/30 bg-sky-900/40">Abs</th>
        <th className="p-1 border-r border-primary-container/30 bg-sky-900/40">%</th>

        <th className="p-1 border-r border-primary-container/30">HB TM1</th>
        <th className="p-1 border-r border-primary-container/30">HB TM3</th>
        <th className="p-1 border-r border-primary-container/30">Gol.Darah</th>
        <th className="p-1 border-r border-primary-container/30">HIV</th>
        <th className="p-1 border-r border-primary-container/30">Sifilis</th>
        <th className="p-1 border-r border-primary-container/30">Hepatitis</th>

        <th className="p-1 border-r border-primary-container/30">Abs</th>
        <th className="p-1 border-r border-primary-container/30">%</th>
      </tr>
    </thead>
  );
}
