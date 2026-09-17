"use client";

import { STATUS_FIELD, STATUS_SUBMITTED } from "@/lib/libAnak/kn/knConfig";

export default function KnTable({ reportList = [], searchQuery = "" }) {
  // Filter berdasarkan nama / ID puskesmas
  const filteredList = reportList.filter((item) => {
    const name = item.nama || item.namaPuskesmas || item.puskesmasId || "";
    return name.toLowerCase().includes((searchQuery || "").toLowerCase());
  });

  if (filteredList.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-2xl">
        Tidak ada data laporan KN untuk ditampilkan.
      </div>
    );
  }

  // Hitung total akumulasi seluruh baris
  const totals = filteredList.reduce((acc, row) => {
    const getVal = (key) => Number(row[key] || 0);

    acc.sasaran += Number(row.sasaranKelahiranHidup || 0);
    acc.lahirHidupL += getVal("jumlahLahirHidupL");
    acc.lahirHidupP += getVal("jumlahLahirHidupP");
    acc.lahirMatiL += getVal("jumlahLahirMatiL");
    acc.lahirMatiP += getVal("jumlahLahirMatiP");

    acc.kn1L += getVal("kn1L");
    acc.kn1P += getVal("kn1P");
    acc.kn3L += getVal("kn3LengkapL");
    acc.kn3P += getVal("kn3LengkapP");

    acc.perawatanEsensialL += getVal("jumlahPerawatanEsensial0_6JamL");
    acc.perawatanEsensialP += getVal("jumlahPerawatanEsensial0_6JamP");
    acc.pelayananEsensialL += getVal("jumlahBayiDapatPelayananEsensial6_28HariL");
    acc.pelayananEsensialP += getVal("jumlahBayiDapatPelayananEsensial6_28HariP");

    acc.asfiksiaL += getVal("asfiksiaL");
    acc.asfiksiaP += getVal("asfiksiaP");
    acc.bblrL += getVal("bblrL");
    acc.bblrP += getVal("bblrP");
    acc.infeksiL += getVal("infeksiL");
    acc.infeksiP += getVal("infeksiP");
    acc.ikterusL += getVal("ikterusL");
    acc.ikterusP += getVal("ikterusP");
    acc.tetanusL += getVal("tetanusNeonatorumL");
    acc.tetanusP += getVal("tetanusNeonatorumP");
    acc.kongenitalL += getVal("kelainanKongenitalL");
    acc.kongenitalP += getVal("kelainanKongenitalP");
    acc.lainnyaL += getVal("lainLainKomplikasiL");
    acc.lainnyaP += getVal("lainLainKomplikasiP");

    return acc;
  }, {
    sasaran: 0, lahirHidupL: 0, lahirHidupP: 0, lahirMatiL: 0, lahirMatiP: 0,
    kn1L: 0, kn1P: 0, kn3L: 0, kn3P: 0,
    perawatanEsensialL: 0, perawatanEsensialP: 0, pelayananEsensialL: 0, pelayananEsensialP: 0,
    asfiksiaL: 0, asfiksiaP: 0, bblrL: 0, bblrP: 0, infeksiL: 0, infeksiP: 0,
    ikterusL: 0, ikterusP: 0, tetanusL: 0, tetanusP: 0, kongenitalL: 0, kongenitalP: 0,
    lainnyaL: 0, lainnyaP: 0
  });

  return (
    <div className="overflow-x-auto border border-outline-variant rounded-2xl bg-surface-container-lowest shadow-sm">
      <table className="w-full text-left border-collapse text-[11px]">
        <thead>
          <tr className="bg-surface-container-low text-on-surface font-bold border-b border-outline-variant text-center">
            <th rowSpan={3} className="p-2 border-r border-outline-variant w-10">No</th>
            <th rowSpan={3} className="p-2 border-r border-outline-variant text-left min-w-[160px]">Puskesmas</th>
            <th rowSpan={3} className="p-2 border-r border-outline-variant min-w-[70px]">Sasaran</th>
            <th colSpan={4} className="p-2 border-r border-outline-variant">Kelahiran</th>
            <th colSpan={6} className="p-2 border-r border-outline-variant">Kunjungan Neonatal</th>
            <th colSpan={4} className="p-2 border-r border-outline-variant">Pelayanan Esensial</th>
            <th colSpan={16} className="p-2 border-r border-outline-variant">Komplikasi Neonatal</th>
            <th rowSpan={3} className="p-2 w-20">Status</th>
          </tr>

          <tr className="bg-surface-container-low text-on-surface font-bold border-b border-outline-variant text-center">
            {/* Kelahiran */}
            <th colSpan={2} className="p-1 border-r border-outline-variant">Lahir Hidup</th>
            <th colSpan={2} className="p-1 border-r border-outline-variant">Lahir Mati</th>
            {/* Kunjungan */}
            <th colSpan={3} className="p-1 border-r border-outline-variant">KN1 (0-48 Jam)</th>
            <th colSpan={3} className="p-1 border-r border-outline-variant">KN Lengkap (KN3)</th>
            {/* Esensial */}
            <th colSpan={2} className="p-1 border-r border-outline-variant">0-6 Jam</th>
            <th colSpan={2} className="p-1 border-r border-outline-variant">6-28 Hari</th>
            {/* Komplikasi */}
            <th colSpan={2} className="p-1 border-r border-outline-variant">Asfiksia</th>
            <th colSpan={2} className="p-1 border-r border-outline-variant">BBLR</th>
            <th colSpan={2} className="p-1 border-r border-outline-variant">Infeksi</th>
            <th colSpan={2} className="p-1 border-r border-outline-variant">Ikterus</th>
            <th colSpan={2} className="p-1 border-r border-outline-variant">Tetanus</th>
            <th colSpan={2} className="p-1 border-r border-outline-variant">Kongenital</th>
            <th colSpan={2} className="p-1 border-r border-outline-variant">Lain-Lain</th>
            <th colSpan={2} className="p-1 border-r border-outline-variant bg-surface-container-high/50">Total Komplikasi</th>
          </tr>

          <tr className="bg-surface-container-low text-on-surface font-semibold border-b border-outline-variant text-center text-[10px]">
            {/* Subkelahiran */}
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th>
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th>
            {/* Subkunjungan */}
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th><th className="p-1 border-r border-outline-variant w-10 font-bold bg-surface-container-high/40">Tot</th>
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th><th className="p-1 border-r border-outline-variant w-10 font-bold bg-surface-container-high/40">Tot</th>
            {/* Subesensial */}
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th>
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th>
            {/* Subkomplikasi */}
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th>
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th>
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th>
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th>
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th>
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th>
            <th className="p-1 border-r border-outline-variant w-8">L</th><th className="p-1 border-r border-outline-variant w-8">P</th>
            <th className="p-1 border-r border-outline-variant w-8 bg-surface-container-high/40">L</th><th className="p-1 border-r border-outline-variant w-8 bg-surface-container-high/40">P</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-outline-variant text-on-surface">
          {filteredList.map((row, index) => {
            const getVal = (key) => Number(row[key] || 0);

            const kn1L = getVal("kn1L");
            const kn1P = getVal("kn1P");
            const kn3L = getVal("kn3LengkapL");
            const kn3P = getVal("kn3LengkapP");

            const komplikasiL = getVal("asfiksiaL") + getVal("bblrL") + getVal("infeksiL") + getVal("ikterusL") + getVal("tetanusNeonatorumL") + getVal("kelainanKongenitalL") + getVal("lainLainKomplikasiL");
            const komplikasiP = getVal("asfiksiaP") + getVal("bblrP") + getVal("infeksiP") + getVal("ikterusP") + getVal("tetanusNeonatorumP") + getVal("kelainanKongenitalP") + getVal("lainLainKomplikasiP");

            const isSubmitted = row[STATUS_FIELD] === STATUS_SUBMITTED || row.statusReport === "submitted";

            return (
              <tr key={row.id || index} className="hover:bg-surface-container-low/50 transition">
                <td className="p-2 border-r border-outline-variant text-center text-on-surface-variant">{index + 1}</td>
                <td className="p-2 border-r border-outline-variant font-medium text-on-surface">
                  {row.nama || row.namaPuskesmas || row.puskesmasId}
                </td>
                <td className="p-2 border-r border-outline-variant text-center font-bold">{row.sasaranKelahiranHidup ?? 0}</td>

                {/* Kelahiran */}
                <td className="p-2 border-r border-outline-variant text-center">{getVal("jumlahLahirHidupL")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("jumlahLahirHidupP")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("jumlahLahirMatiL")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("jumlahLahirMatiP")}</td>

                {/* Kunjungan KN1 */}
                <td className="p-2 border-r border-outline-variant text-center">{kn1L}</td>
                <td className="p-2 border-r border-outline-variant text-center">{kn1P}</td>
                <td className="p-2 border-r border-outline-variant text-center font-bold bg-surface-container-low/30">{kn1L + kn1P}</td>

                {/* Kunjungan KN Lengkap */}
                <td className="p-2 border-r border-outline-variant text-center">{kn3L}</td>
                <td className="p-2 border-r border-outline-variant text-center">{kn3P}</td>
                <td className="p-2 border-r border-outline-variant text-center font-bold bg-surface-container-low/30">{kn3L + kn3P}</td>

                {/* Pelayanan Esensial */}
                <td className="p-2 border-r border-outline-variant text-center">{getVal("jumlahPerawatanEsensial0_6JamL")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("jumlahPerawatanEsensial0_6JamP")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("jumlahBayiDapatPelayananEsensial6_28HariL")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("jumlahBayiDapatPelayananEsensial6_28HariP")}</td>

                {/* Komplikasi */}
                <td className="p-2 border-r border-outline-variant text-center">{getVal("asfiksiaL")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("asfiksiaP")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("bblrL")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("bblrP")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("infeksiL")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("infeksiP")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("ikterusL")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("ikterusP")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("tetanusNeonatorumL")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("tetanusNeonatorumP")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("kelainanKongenitalL")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("kelainanKongenitalP")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("lainLainKomplikasiL")}</td>
                <td className="p-2 border-r border-outline-variant text-center">{getVal("lainLainKomplikasiP")}</td>
                <td className="p-2 border-r border-outline-variant text-center font-bold bg-surface-container-low/40">{komplikasiL}</td>
                <td className="p-2 border-r border-outline-variant text-center font-bold bg-surface-container-low/40">{komplikasiP}</td>

                {/* Status */}
                <td className="p-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    isSubmitted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {isSubmitted ? "Selesai" : "Draft"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* Footer Total */}
        <tfoot>
          <tr className="bg-primary-container/20 font-bold text-on-surface border-t-2 border-outline-variant text-center">
            <td colSpan={2} className="p-2 border-r border-outline-variant text-right uppercase text-[10px]">Total Kota</td>
            <td className="p-2 border-r border-outline-variant text-primary">{totals.sasaran}</td>
            <td className="p-2 border-r border-outline-variant">{totals.lahirHidupL}</td>
            <td className="p-2 border-r border-outline-variant">{totals.lahirHidupP}</td>
            <td className="p-2 border-r border-outline-variant">{totals.lahirMatiL}</td>
            <td className="p-2 border-r border-outline-variant">{totals.lahirMatiP}</td>
            <td className="p-2 border-r border-outline-variant">{totals.kn1L}</td>
            <td className="p-2 border-r border-outline-variant">{totals.kn1P}</td>
            <td className="p-2 border-r border-outline-variant text-primary bg-surface-container-high/60">{totals.kn1L + totals.kn1P}</td>
            <td className="p-2 border-r border-outline-variant">{totals.kn3L}</td>
            <td className="p-2 border-r border-outline-variant">{totals.kn3P}</td>
            <td className="p-2 border-r border-outline-variant text-primary bg-surface-container-high/60">{totals.kn3L + totals.kn3P}</td>
            <td className="p-2 border-r border-outline-variant">{totals.perawatanEsensialL}</td>
            <td className="p-2 border-r border-outline-variant">{totals.perawatanEsensialP}</td>
            <td className="p-2 border-r border-outline-variant">{totals.pelayananEsensialL}</td>
            <td className="p-2 border-r border-outline-variant">{totals.pelayananEsensialP}</td>
            <td className="p-2 border-r border-outline-variant">{totals.asfiksiaL}</td>
            <td className="p-2 border-r border-outline-variant">{totals.asfiksiaP}</td>
            <td className="p-2 border-r border-outline-variant">{totals.bblrL}</td>
            <td className="p-2 border-r border-outline-variant">{totals.bblrP}</td>
            <td className="p-2 border-r border-outline-variant">{totals.infeksiL}</td>
            <td className="p-2 border-r border-outline-variant">{totals.infeksiP}</td>
            <td className="p-2 border-r border-outline-variant">{totals.ikterusL}</td>
            <td className="p-2 border-r border-outline-variant">{totals.ikterusP}</td>
            <td className="p-2 border-r border-outline-variant">{totals.tetanusL}</td>
            <td className="p-2 border-r border-outline-variant">{totals.tetanusP}</td>
            <td className="p-2 border-r border-outline-variant">{totals.kongenitalL}</td>
            <td className="p-2 border-r border-outline-variant">{totals.kongenitalP}</td>
            <td className="p-2 border-r border-outline-variant">{totals.lainnyaL}</td>
            <td className="p-2 border-r border-outline-variant">{totals.lainnyaP}</td>
            <td className="p-2 border-r border-outline-variant text-primary bg-surface-container-high/60">
              {totals.asfiksiaL + totals.bblrL + totals.infeksiL + totals.ikterusL + totals.tetanusL + totals.kongenitalL + totals.lainnyaL}
            </td>
            <td className="p-2 border-r border-outline-variant text-primary bg-surface-container-high/60">
              {totals.asfiksiaP + totals.bblrP + totals.infeksiP + totals.ikterusP + totals.tetanusP + totals.kongenitalP + totals.lainnyaP}
            </td>
            <td className="p-2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}