"use client";

import { useEffect, useRef, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { aturUlangPassword, cekAturanPassword, pesanErrorApi } from "@/service/auth.service";
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react";

interface Props {
  params: Promise<{ lang: "id" | "en" }>;
}

/** Atur ulang password dari link email: /{lang}/reset-password?token=&email= */
export default function AturUlangPasswordPage({ params }: Props) {
  const { lang } = use(params);
  const en = lang === "en";
  const router = useRouter();
  const { toast } = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [lihat, setLihat] = useState(false);
  const [proses, setProses] = useState(false);
  const [status, setStatus] = useState<"memuat" | "form" | "berhasil" | "tidak_valid">("memuat");
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);

  // Baca token dari URL lalu hapus dari address bar/riwayat (token = rahasia sekali pakai).
  // Hanya sekali: React StrictMode (dev) menjalankan effect dua kali, dan pada putaran kedua URL sudah bersih.
  const sudahDibaca = useRef(false);
  useEffect(() => {
    if (sudahDibaca.current) return;
    sudahDibaca.current = true;

    const q = new URLSearchParams(window.location.search);
    const t = q.get("token");
    const e = q.get("email");
    if (!t || !e) {
      setStatus("tidak_valid");
      return;
    }
    setToken(t);
    setEmail(e);
    setStatus("form");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const galat = (pesan: string) =>
    toast({
      variant: "destructive",
      title: en ? "Reset Failed" : "Gagal Mengatur Ulang",
      description: <span className="text-white font-bold">{pesan}</span>,
    });

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (proses || !token) return;

    const kurang = cekAturanPassword(password, lang);
    if (kurang.length > 0) {
      galat((en ? "Password must contain " : "Password harus berisi ") + kurang.join(", ") + ".");
      return;
    }
    if (password !== konfirmasi) {
      galat(en ? "Password confirmation does not match." : "Konfirmasi password tidak cocok.");
      return;
    }

    setProses(true);
    try {
      const res = await aturUlangPassword(
        { token, email, password, password_confirmation: konfirmasi },
        lang,
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("berhasil");
      } else if (data?.kode === "token_tidak_valid") {
        setPesanGagal(data.message);
        setStatus("tidak_valid");
      } else {
        galat(
          res.status === 429
            ? en
              ? "Too many attempts. Please try again in a minute."
              : "Terlalu banyak percobaan. Coba lagi dalam 1 menit."
            : pesanErrorApi(data, en ? "Failed to reset password." : "Gagal mengatur ulang password."),
        );
      }
    } catch {
      galat(en ? "A network error occurred." : "Terjadi kesalahan jaringan.");
    } finally {
      setProses(false);
    }
  };

  const kelasInput =
    "h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#82B124]/20 focus:border-[#82B124] px-5 pr-12";

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center p-0 sm:p-6 md:py-16">
      <div className="bg-white w-full min-h-screen sm:min-h-0 max-w-[580px] rounded-none sm:rounded-[3rem] shadow-none sm:shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-6 sm:p-10 md:p-16 flex flex-col items-center justify-center">
        <div className="relative w-64 h-16 md:w-84 md:h-20 mb-6 md:mb-8">
          <Image src="/images/logo-nav.png" alt="LSP Logo" fill className="object-contain" />
        </div>

        {status === "memuat" && <Loader2 className="h-10 w-10 text-[#82B124] animate-spin" />}

        {status === "berhasil" && (
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-[#82B124]" />
            <h1 className="text-2xl font-bold text-gray-800">
              {en ? "Password Updated" : "Password Berhasil Diubah"}
            </h1>
            <p className="text-gray-500 max-w-sm">
              {en
                ? "Your password has been reset and you have been signed out from all devices. Please log in with your new password."
                : "Password Anda berhasil diatur ulang dan semua sesi login di perangkat lain telah diakhiri. Silakan login dengan password baru."}
            </p>
            <Button
              className="mt-2 bg-[#82B124] hover:bg-[#729c1f] text-white rounded-xl font-bold px-8 py-3"
              onClick={() => router.push(`/${lang}/login`)}
            >
              {en ? "Log In" : "Login"}
            </Button>
          </div>
        )}

        {status === "tidak_valid" && (
          <div className="flex flex-col items-center text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-800">
              {en ? "Link Invalid or Expired" : "Link Tidak Valid atau Kedaluwarsa"}
            </h1>
            <p className="text-gray-500 max-w-sm">
              {pesanGagal ??
                (en
                  ? "This password reset link is invalid, already used, or has expired. Please request a new link."
                  : "Link atur ulang password ini tidak valid, sudah dipakai, atau kedaluwarsa. Silakan minta link baru.")}
            </p>
            <Button
              className="mt-2 bg-[#82B124] hover:bg-[#729c1f] text-white rounded-xl font-bold px-8 py-3"
              onClick={() => router.push(`/${lang}/forgot-password`)}
            >
              {en ? "Request New Link" : "Minta Link Baru"}
            </Button>
          </div>
        )}

        {status === "form" && (
          <>
            <div className="mb-6 md:mb-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
                {en ? "Set a New Password" : "Buat Password Baru"}
              </h1>
              <p className="text-sm md:text-base text-gray-400 break-all">{email}</p>
            </div>

            <form onSubmit={simpan} className="w-full space-y-4 md:space-y-6">
              <div className="space-y-1 md:space-y-2 relative">
                <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">
                  {en ? "New Password" : "Password Baru"}
                </label>
                <Input
                  type={lihat ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={kelasInput}
                />
                <button
                  type="button"
                  onClick={() => setLihat(!lihat)}
                  aria-label={lihat ? (en ? "Hide password" : "Sembunyikan password") : en ? "Show password" : "Tampilkan password"}
                  className="absolute right-4 top-10 md:top-12 text-gray-400 hover:text-gray-600"
                >
                  {lihat ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="space-y-1 md:space-y-2">
                <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">
                  {en ? "Confirm New Password" : "Konfirmasi Password Baru"}
                </label>
                <Input
                  type={lihat ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={konfirmasi}
                  onChange={(e) => setKonfirmasi(e.target.value)}
                  className={kelasInput}
                />
                <p className="text-[10px] md:text-xs text-gray-400 ml-1 italic">
                  {en
                    ? "Min. 8 characters, with uppercase & lowercase letters, a number, and a symbol (e.g. Secret#123)"
                    : "Min. 8 karakter, berisi huruf besar & kecil, angka, dan simbol (mis. Rahasia#123)"}
                </p>
              </div>

              <Button
                type="submit"
                disabled={proses}
                className="w-full bg-[#82B124] hover:bg-[#729c1f] text-white h-12 md:h-14 rounded-xl font-bold text-base shadow-lg shadow-[#82B124]/20 disabled:opacity-60"
              >
                {proses && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {proses ? (en ? "Saving..." : "Menyimpan...") : en ? "Save New Password" : "Simpan Password Baru"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-8 text-center text-xs md:text-sm text-gray-400">
          <Link href={`/${lang}/login`} className="text-blue-500 font-bold hover:underline">
            {en ? "Back to Login" : "Kembali ke Login"}
          </Link>
        </p>
      </div>
    </div>
  );
}
