"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { lupaPassword, pesanErrorApi } from "@/service/auth.service";
import { CaptchaGambar, useCaptcha } from "@/components/auth/CaptchaGambar";
import { Loader2, MailCheck } from "lucide-react";

interface Props {
  params: Promise<{ lang: "id" | "en" }>;
}

/** Lupa password: kirim link atur ulang ke email (respons server selalu sama, tidak membocorkan email terdaftar). */
export default function LupaPasswordPage({ params }: Props) {
  const { lang } = use(params);
  const en = lang === "en";
  const { toast } = useToast();
  const captchaServer = useCaptcha();

  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [proses, setProses] = useState(false);
  const [terkirim, setTerkirim] = useState<string | null>(null);

  const galat = (pesan: string) =>
    toast({
      variant: "destructive",
      title: en ? "Request Failed" : "Permintaan Gagal",
      description: <span className="text-white font-bold">{pesan}</span>,
    });

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (proses) return;
    if (!captchaServer.id || !captcha.trim()) {
      galat(en ? "Type the characters shown in the captcha image." : "Ketik karakter yang tampil pada gambar captcha.");
      return;
    }

    setProses(true);
    try {
      const res = await lupaPassword({ email: email.trim(), captcha_id: captchaServer.id, captcha }, lang);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTerkirim(data.message);
      } else {
        galat(
          res.status === 429
            ? en
              ? "Too many requests. Please try again in a minute."
              : "Terlalu banyak permintaan. Coba lagi dalam 1 menit."
            : pesanErrorApi(data, en ? "Failed to send the reset link." : "Gagal mengirim link atur ulang."),
        );
      }
    } catch {
      galat(en ? "A network error occurred." : "Terjadi kesalahan jaringan.");
    } finally {
      // Captcha sekali pakai: selalu siapkan kode baru.
      captchaServer.muatUlang();
      setCaptcha("");
      setProses(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center p-0 sm:p-6 md:py-16">
      <div className="bg-white w-full min-h-screen sm:min-h-0 max-w-[580px] rounded-none sm:rounded-[3rem] shadow-none sm:shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-6 sm:p-10 md:p-16 flex flex-col items-center justify-center">
        <div className="mb-6 md:mb-10 flex flex-col items-center text-center">
          <div className="relative w-64 h-16 md:w-84 md:h-20 mb-4 md:mb-6">
            <Image src="/images/logo-nav.png" alt="LSP Logo" fill className="object-contain" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
            {en ? "Forgot Password" : "Lupa Password"}
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-sm">
            {en
              ? "Enter the email of your account. We will send a link to set a new password."
              : "Masukkan email akun Anda. Kami akan mengirim link untuk membuat password baru."}
          </p>
        </div>

        {terkirim ? (
          <div className="w-full flex flex-col items-center text-center space-y-4">
            <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col items-center text-green-800 space-y-2">
              <MailCheck className="h-10 w-10 text-green-600" />
              <p className="font-semibold">{en ? "Check Your Email" : "Cek Email Anda"}</p>
              <p className="text-sm text-green-700 max-w-sm">{terkirim}</p>
              <p className="text-xs text-green-700/80 max-w-sm">
                {en ? "The link is valid for 60 minutes." : "Link berlaku selama 60 menit."}
              </p>
            </div>
            <Button
              variant="link"
              className="text-[#82B124] font-semibold"
              onClick={() => setTerkirim(null)}
            >
              {en ? "Send to another email" : "Kirim ke email lain"}
            </Button>
          </div>
        ) : (
          <form onSubmit={kirim} className="w-full space-y-4 md:space-y-6">
            <div className="space-y-1 md:space-y-2">
              <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">Email</label>
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={en ? "Enter your email" : "Masukan email anda"}
                className="h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#82B124]/20 focus:border-[#82B124] px-5"
              />
            </div>

            <div className="space-y-1 md:space-y-2">
              <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">Captcha</label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <CaptchaGambar captcha={captchaServer} lang={lang} />
                <Input
                  type="text"
                  required
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={10}
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  placeholder={en ? "Type the characters above" : "Masukan karakter di atas"}
                  className="h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#82B124]/20 focus:border-[#82B124] px-5 flex-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={proses}
              className="w-full bg-[#82B124] hover:bg-[#729c1f] text-white h-12 md:h-14 rounded-xl font-bold text-base shadow-lg shadow-[#82B124]/20 disabled:opacity-60"
            >
              {proses && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {proses ? (en ? "Sending..." : "Mengirim...") : en ? "Send Reset Link" : "Kirim Link Atur Ulang"}
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-xs md:text-sm text-gray-400">
          {en ? "Remember your password?" : "Ingat password Anda?"}{" "}
          <Link href={`/${lang}/login`} className="text-blue-500 font-bold hover:underline">
            {en ? "Log In" : "Masuk"}
          </Link>
        </p>
      </div>
    </div>
  );
}
