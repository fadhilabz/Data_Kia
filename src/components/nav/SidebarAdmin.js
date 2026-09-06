"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

// ---- Struktur menu Admin Dinas Kesehatan ----
// Dikelompokkan per AREA PROGRAM (Data Ibu, Data Anak, dst) — pola identik
// dengan Sidebar.jsx (Petugas), supaya konsisten & gampang nambah area baru.
// "Periode Pelaporan" & "Manajemen User" SENGAJA tetap link berdiri sendiri
// (bukan bagian dari group manapun), karena keduanya adalah fungsi
// manajemen inti Admin yang dipakai lintas semua program, bukan spesifik
// satu area data.
const MENU_ADMIN = [
  { type: "link", key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { type: "link", key: "periode", label: "Periode Pelaporan", href: "/admin/periode", icon: "event_available" },
  {
    type: "group",
    key: "data-ibu",
    label: "Data Ibu",
    icon: "pregnant_woman",
    children: [
      { key: "rekap-anc", label: "Lihat Form ANC", href: "/admin/dataAnc", icon: "monitor_heart" },
      { key: "rekap-pnc", label: "Lihat Form PNC", href: "/admin/dataPnc", icon: "healing" },
      { key: "rekap-anct", label: "Lihat Form ANC Terpadu", href: "/admin/dataAnct", icon: "biotech" },
      { key: "rekap-kematian", label: "Data Kematian Ibu", href: "/admin/dataKematian", icon: "heart_broken" },
      { key: "sdm", label: "Kelola SDM", href: "/admin/dataSdm", icon: "groups" },
      { key: "sasaran", label: "Sasaran Puskesmas", href: "/admin/dataSasaran", icon: "flag" },
    ],
  },
  {
    type: "group",
    key: "data-anak",
    label: "Data Anak",
    icon: "child_care",
    children: [
      // Akan diisi menyusul saat modul Data Anak dibangun.
      { key: "anak-segera", label: "Segera Hadir", href: "#", icon: "hourglass_empty", disabled: true },
    ],
  },
  { type: "link", key: "petugas", label: "Manajemen User", href: "/admin/petugas", icon: "manage_accounts" },
  { type: "link", key: "profil", label: "Profil & Pengaturan", href: "/admin/profil", icon: "person" },
];

export default function AdminSidebar({ activeTab }) {
  const router = useRouter();
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState({});

  // Memeriksa URL secara dinamis agar match 100% (dan tetap kompatibel
  // dengan prop `activeTab` lama kalau ada halaman yang masih mengirimnya)
  const getIsActive = (tabKey, targetPath) => {
    if (activeTab) return activeTab === tabKey;
    if (targetPath === "/admin/dashboard") {
      return pathname === "/admin/dashboard" || pathname === "/admin";
    }
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  };

  // Otomatis buka group yang mengandung halaman aktif saat pertama kali render
  useEffect(() => {
    const initialOpen = {};
    MENU_ADMIN.forEach((item) => {
      if (item.type === "group" && item.children.some((c) => getIsActive(c.key, c.href))) {
        initialOpen[item.key] = true;
      }
    });
    setOpenGroups((prev) => ({ ...initialOpen, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const linkClass = (active, disabled) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all ${
      disabled
        ? "text-on-surface-variant/40 cursor-not-allowed"
        : active
        ? "bg-primary-container text-on-primary-container font-bold scale-95"
        : "text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high"
    }`;

  return (
    <nav className="bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant dark:border-outline shadow-none flex flex-col h-screen fixed left-0 top-0 py-stack-gap z-50 w-64 overflow-y-auto">
      {/* Header Brand Admin */}
      <div className="px-gutter mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined">
              admin_panel_settings
            </span>
          </div>
          <div>
            <h1 className="text-headline-sm font-headline-sm font-bold text-primary dark:text-primary-fixed-dim">
              Dinkes Baubau
            </h1>
          </div>
        </div>
        <p className="font-label-md text-label-md text-on-surface-variant font-medium">
          Panel Administrator
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col px-4 gap-1 flex-1">
        {MENU_ADMIN.map((item) => {
          if (item.type === "link") {
            const active = getIsActive(item.key, item.href);
            return (
              <Link key={item.key} href={item.href} className={linkClass(active)}>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          }

          // type === "group"
          const isOpen = !!openGroups[item.key];
          const hasActiveChild = item.children.some((c) => getIsActive(c.key, c.href));

          return (
            <div key={item.key} className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleGroup(item.key)}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all ${
                  hasActiveChild && !isOpen
                    ? "bg-primary-container/40 text-on-surface font-bold"
                    : "text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </button>

              {isOpen && (
                <div className="flex flex-col gap-0.5 mt-1 ml-3 pl-3 border-l border-outline-variant">
                  {item.children.map((child) => {
                    const active = getIsActive(child.key, child.href);
                    return (
                      <Link
                        key={child.key}
                        href={child.disabled ? "#" : child.href}
                        onClick={(e) => child.disabled && e.preventDefault()}
                        className={linkClass(active, child.disabled)}
                      >
                        <span className="material-symbols-outlined text-[20px]">{child.icon}</span>
                        <span className="text-sm">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA Bottom - Logout Button */}
      <div className="mt-auto px-4 pb-6 pt-4 w-full">
        <button
          onClick={async () => {
            try {
              await signOut(auth);
              router.push("/");
            } catch (err) {
              console.error("Gagal keluar akun:", err);
            }
          }}
          className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-label-md text-label-md py-3 rounded-xl transition-colors flex justify-center items-center gap-2 border border-red-100 shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Keluar Akun
        </button>
      </div>
    </nav>
  );
}