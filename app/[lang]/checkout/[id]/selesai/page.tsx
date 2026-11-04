"use client";

/*
 * Halaman kembali dari DOKU Checkout (callback_url: /checkout/{kode}/selesai).
 * Status TIDAK diambil dari parameter redirect DOKU (bisa dimanipulasi), melainkan dari BE yang
 * diperbarui webhook DOKU. Selama masih menunggu konfirmasi, status dicek ulang berkala.
 */

import { useCallback, useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { useAuth } from "@/lib/auth-context";
import { getDetailPendaftaran, judulSkema, type PendaftaranAsesiDetail } from "@/service/profil.service";

interface SelesaiPageProps {
  params: Promise<{ lang: "id" | "en"; id: string }>;
}

/** Cek ulang tiap 5 detik, maksimal ±2 menit (webhook DOKU biasanya masuk dalam hitungan detik). */
const JEDA_CEK_MS = 5000;
const MAKS_CEK = 24;

type Keadaan = "memuat" | "berhasil" | "menunggu" | "gagal" | "galat";

function keadaanDari(p: PendaftaranAsesiDetail): Keadaan {
  if (["paid", "dijadwalkan", "asesmen_selesai", "completed"].includes(p.status)) return "berhasil";
  if (["expired", "cancelled", "rejected"].includes(p.status)) return "gagal";
  return "menunggu";
}

export default function CheckoutSelesaiPage({ params }: SelesaiPageProps) {
  const { lang, id: kodePendaftaran } = use(params);
  const router = useRouter();
  const { token, isLoggedIn, loading: authLoading } = useAuth();

  const [dict, setDict] = useState<any>(null);
  const [detail, setDetail] = useState<PendaftaranAsesiDetail | null>(null);
  const [keadaan, setKeadaan] = useState<Keadaan>("memuat");
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);
  const jumlahCek = useRef(0);

  useEffect(() => {
    getDictionary(lang).then(setDict).catch(() => setDict({}));
  }, [lang]);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push(`/${lang}/login`);
  }, [authLoading, isLoggedIn, router, lang]);

  const cek = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getDetailPendaftaran(token, kodePendaftaran);
      setDetail(res);
      setKeadaan(keadaanDari(res));
    } catch (err) {
      setPesanGalat((err as Error).message);
      setKeadaan("galat");
    }
  }, [token, kodePendaftaran]);

  useEffect(() => {
    cek();
  }, [cek]);

  // Masih menunggu webhook -> cek ulang berkala.
  useEffect(() => {
    if (keadaan !== "menunggu" || jumlahCek.current >= MAKS_CEK) return;
    const t = setTimeout(() => {
      jumlahCek.current += 1;
      cek();
    }, JEDA_CEK_MS);
    return () => clearTimeout(t);
  }, [keadaan, detail, cek]);

  if (!dict || authLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#78B51A] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  const skema = detail ? judulSkema(detail, lang) : null;
  const habisCek = keadaan === "menunggu" && jumlahCek.current >= MAKS_CEK;

  return (
    <div className="min-h-screen bg-[#78B51A]">
      <Navigation lang={lang} dict={dict} />

      <main className="max-w-xl mx-auto px-6 py-16 mb-24">
        <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-10 text-center">
          {keadaan === "memuat" && (
            <>
              <Loader2 className="h-14 w-14 animate-spin text-[#82B124] mx-auto" />
              <p className="mt-6 text-gray-600">Memeriksa status pembayaran...</p>
            </>
          )}

          {keadaan === "berhasil" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-[#82B124] mx-auto" />
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Pembayaran Berhasil</h1>
              <p className="mt-3 text-gray-600">
                Pembayaran {skema && <span className="font-semibold text-gray-900">{skema}</span>} telah kami terima.
                Admin LSP akan menentukan jadwal asesmen dan mengabari Anda melalui email serta halaman profil.
              </p>
            </>
          )}

          {keadaan === "menunggu" && (
            <>
              <Clock className="h-16 w-16 text-[#F2A93B] mx-auto" />
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Menunggu Konfirmasi Pembayaran</h1>
              <p className="mt-3 text-gray-600">
                {habisCek
                  ? "Konfirmasi dari DOKU belum kami terima. Bila Anda sudah membayar, status akan diperbarui otomatis — Anda juga akan menerima email."
                  : "Kami sedang menunggu konfirmasi dari DOKU. Halaman ini akan diperbarui otomatis."}
              </p>
              {!habisCek && <Loader2 className="h-6 w-6 animate-spin text-[#82B124] mx-auto mt-5" />}
            </>
          )}

          {keadaan === "gagal" && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Pembayaran Tidak Dapat Dilanjutkan</h1>
              <p className="mt-3 text-gray-600">
                Status pendaftaran: <span className="font-semibold">{detail?.status_label}</span>. Silakan ajukan
                pendaftaran kembali bila masih ingin mengikuti sertifikasi.
              </p>
            </>
          )}

          {keadaan === "galat" && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Status Tidak Dapat Dimuat</h1>
              <p className="mt-3 text-gray-600">{pesanGalat}</p>
            </>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {keadaan === "menunggu" && (
              <Link
                href={`/${lang}/checkout/${kodePendaftaran}`}
                className="px-6 py-3 rounded-xl font-bold border border-[#82B124] text-[#82B124] hover:bg-[#82B124]/5"
              >
                Kembali ke Pembayaran
              </Link>
            )}
            {keadaan === "gagal" ? (
              <Link
                href={`/${lang}/sertifikasi`}
                className="px-6 py-3 rounded-xl font-bold bg-[#82B124] text-white hover:bg-[#729c1f]"
              >
                Lihat Skema Sertifikasi
              </Link>
            ) : (
              <Link
                href={`/${lang}/profile`}
                className="px-6 py-3 rounded-xl font-bold bg-[#82B124] text-white hover:bg-[#729c1f]"
              >
                Lihat Status di Profil
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
