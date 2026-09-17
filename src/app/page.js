'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user || !user.email) {
        throw new Error('Gagal mendapatkan email dari akun Google Anda.');
      }

      // Cek apakah akun terdaftar di Firestore collection 'users'
      const userDocRef = doc(db, 'users', user.email);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await signOut(auth);
        setError('Akun Anda belum terdaftar, hubungi Admin Dinas Kesehatan');
        return;
      }

      const userData = userDocSnap.data();
      if (userData?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError(null);
      } else if (err.code === 'auth/network-request-failed') {
        setError('Koneksi internet terputus. Silakan periksa jaringan Anda.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat proses login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          data-alt="A serene and highly professional administrative healthcare setting in soft focus. The scene features light-mode aesthetics with very subtle teal and blue ambient lighting reflecting off clean white surfaces. It conveys a sense of trust, institutional stability, and modern data management without being distracting. The overall mood is calm, organized, and quietly authoritative."
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB_1EkJ3bl4SsrL726hsRTB7c8kguSrB4mCtsoDcH5T-ojMPlLcxfW-Fs2DnOtZTCCH1z5g2pMCJLsjDu9ugOEMJTzQ1jnd_XZINxMZoRNlgz_T9cQqtfDU48DrMAGQ-ZvdcbjMHOsESIrF7Z1x0B0qsYJbNMzn7LcKanzfiibKxoOTImRCT7NwLlL5srpGdx23gZjxXLueDi6ZFEZe9URJNLsOsibzgmHXJX4PGzb14XCaPcry4F8e6Q')",
          }}
        />
        {/* Gradient Overlay to ensure text readability and brand color integration */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-container-low/95" />
      </div>

      {/* Main Login Card */}
      <main className="relative z-10 w-full max-w-md px-margin-mobile md:px-0">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-8 flex flex-col items-center">
          {/* Logo & Branding */}
          <div className="mb-6 text-center">
            <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center">
              <img
                className="h-full object-contain"
                data-alt="A highly polished, minimalist vector emblem representing a modern government health department. The design features a stylized crest incorporating elements of medical care and community, rendered in sharp teal and deep navy blue against a pure white background. The lines are precise and clean, reflecting a professional corporate identity."
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi9hRPvE194mfwMgTalU_nrhYNbCzVRTnlJMmkXhGUPyXSaGYSDFolhNgjWmoFOP5EXNEerUT0S5YJ7bnsrzTsuOKitBL9d02Z4OfuDFTYUTi02pI5x08T7jRN8TI_Kl6GPNRe6ojRLa791IjLWyjWOL4z3sC0533nb3F199GV0o8owZcLdyV5NMvFS_w/s1380/Logo%20Kementerian%20Kesehatan%20-%20Kemenkes.png"
                alt="Logo Dinas Kesehatan Kota Baubau"
              />
            </div>
            <h1 className="font-headline-md text-headline-md text-primary mb-2">
              Data KIA Baubau
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Dinas Kesehatan Kota Baubau
            </p>
          </div>

          {/* Google Login Section */}
          <div className="w-full flex flex-col items-center gap-4 mt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md py-3 px-4 rounded-lg transition-colors duration-200 flex justify-center items-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg
                    fill="none"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Login dengan Google</span>
                </>
              )}
            </button>

            {/* Dynamic Error Message */}
            {error && (
              <div className="mt-2 p-3 w-full bg-error-container text-on-error-container rounded-lg border border-error/20 flex items-start gap-2">
                <span
                  className="material-symbols-outlined text-error shrink-0"
                  style={{ fontSize: "20px" }}
                >
                  error
                </span>
                <p className="font-body-md text-body-md text-sm">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Support Contact */}
          <div className="mt-8 text-center border-t border-outline-variant w-full pt-4">
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Butuh bantuan teknis?{" "}
              <a className="text-primary font-medium hover:underline" href="#">
                Hubungi Administrator
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 