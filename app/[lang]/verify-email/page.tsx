"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDictionary } from "../dictionaries";
import { verifyEmailLink, resendVerification } from "@/service/auth.service";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

interface VerifyEmailPageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [dict, setDict] = useState<any>(null);
  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying",
  );
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    getDictionary(lang).then((data) => {
      setDict(data);
    });
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = window.location.search;
    if (
      !search ||
      !search.includes("expires") ||
      !search.includes("signature")
    ) {
      setStatus("failed");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await verifyEmailLink(search);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          login(data.data.token, data.data.asesi || {});
          toast({
            title:
              lang === "id" ? "Verifikasi Berhasil" : "Verification Successful",
            description:
              data.message ||
              (lang === "id"
                ? "Email berhasil diverifikasi."
                : "Email verified successfully."),
          });

          setTimeout(() => {
            router.push(`/${lang}/profile`);
          }, 3000);
        } else {
          setStatus("failed");
          toast({
            variant: "destructive",
            title: lang === "id" ? "Verifikasi Gagal" : "Verification Failed",
            description:
              data.message ||
              (lang === "id"
                ? "Link verifikasi telah kadaluarsa atau tidak valid."
                : "Verification link has expired or is invalid."),
          });
        }
      } catch (err) {
        console.error(err);
        setStatus("failed");
        toast({
          variant: "destructive",
          title: "Error",
          description:
            lang === "id"
              ? "Terjadi kesalahan jaringan."
              : "A network error occurred.",
        });
      }
    };

    verifyEmail();
  }, [lang, login, router, toast]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setResending(true);
    try {
      const res = await resendVerification(email);
      const data = await res.json();

      setResendSuccess(true);
      toast({
        title: lang === "id" ? "Email Terkirim" : "Email Sent",
        description:
          data.message ||
          (lang === "id"
            ? "Jika email terdaftar, link verifikasi telah dikirim."
            : "If the email is registered, the verification link has been sent."),
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          lang === "id"
            ? "Terjadi kesalahan jaringan."
            : "A network error occurred.",
      });
    } finally {
      setResending(false);
    }
  };

  if (!dict) {
    return <div className="min-h-screen bg-[#F1F3F6]" />;
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center p-6 md:py-16">
      <div className="bg-white w-full max-w-[580px] rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-10 md:p-16 flex flex-col items-center text-center">
        <div className="relative w-64 h-16 md:w-84 md:h-20 mb-8">
          <Image
            src="/images/logo-nav.png"
            alt="LSP Logo"
            fill
            className="object-contain"
          />
        </div>

        {status === "verifying" && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-16 w-16 text-[#82B124] animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800">
              {lang === "id"
                ? "Memverifikasi Email Anda"
                : "Verifying Your Email"}
            </h2>
            <p className="text-gray-500 max-w-sm">
              {lang === "id"
                ? "Mohon tunggu sebentar selagi kami memproses verifikasi email Anda..."
                : "Please wait a moment while we process your email verification..."}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-[#82B124] animate-bounce" />
            <h2 className="text-2xl font-bold text-gray-800">
              {lang === "id"
                ? "Verifikasi Berhasil!"
                : "Verification Successful!"}
            </h2>
            <p className="text-gray-500 max-w-sm">
              {lang === "id"
                ? "Email Anda telah berhasil diverifikasi. Anda sedang dialihkan..."
                : "Your email has been verified. Redirecting you..."}
            </p>
            <Button
              className="mt-4 bg-[#82B124] hover:bg-[#729c1f] text-white rounded-xl font-bold px-8 py-3"
              onClick={() => router.push(`/${lang}/profile`)}
            >
              {lang === "id" ? "Masuk ke Profil" : "Go to Profile"}
            </Button>
          </div>
        )}

        {status === "failed" && (
          <div className="w-full flex flex-col items-center space-y-6">
            <XCircle className="h-16 w-16 text-red-500 animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {lang === "id" ? "Verifikasi Gagal" : "Verification Failed"}
              </h2>
              <p className="text-gray-500 max-w-sm">
                {lang === "id"
                  ? "Link verifikasi telah kadaluarsa atau tidak valid. Silakan minta email verifikasi baru di bawah."
                  : "The verification link is expired or invalid. Please request a new verification email below."}
              </p>
            </div>

            {resendSuccess ? (
              <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col items-center text-green-800 space-y-2 mt-4">
                <Mail className="h-8 w-8 text-green-600" />
                <p className="font-semibold">
                  {lang === "id"
                    ? "Link Verifikasi Dikirim"
                    : "Verification Link Sent"}
                </p>
                <p className="text-sm text-green-600 max-w-xs">
                  {lang === "id"
                    ? "Jika email terdaftar, kami telah mengirimkan link verifikasi baru."
                    : "If the email is registered, we have sent a new verification link."}
                </p>
                <Button
                  variant="link"
                  className="text-green-800 underline font-semibold mt-2"
                  onClick={() => setResendSuccess(false)}
                >
                  {lang === "id"
                    ? "Kirim ulang ke email lain"
                    : "Resend to another email"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResend} className="w-full space-y-4 mt-4">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-semibold text-gray-600 ml-1">
                    {lang === "id" ? "Alamat Email" : "Email Address"}
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder={
                      lang === "id" ? "Masukkan email Anda" : "Enter your email"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#82B124]/20 focus:border-[#82B124] px-5"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={resending}
                  className="w-full bg-[#82B124] hover:bg-[#729c1f] text-white h-12 md:h-14 rounded-xl font-bold text-base shadow-lg shadow-[#82B124]/20"
                >
                  {resending
                    ? lang === "id"
                      ? "Mengirim..."
                      : "Sending..."
                    : lang === "id"
                      ? "Kirim Ulang Email Verifikasi"
                      : "Resend Verification Email"}
                </Button>
              </form>
            )}

            <Button
              variant="ghost"
              className="text-blue-500 font-bold hover:underline"
              onClick={() => router.push(`/${lang}/login`)}
            >
              {lang === "id" ? "Kembali ke Login" : "Back to Login"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
