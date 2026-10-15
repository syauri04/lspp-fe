"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDictionary } from "../dictionaries";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { registerUser, loginGoogle } from "@/service/auth.service";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface RegisterPageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [dict, setDict] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    getDictionary(lang).then((data) => {
      setDict(data);
    });
  }, [lang]);

  if (!dict) {
    return <div className="min-h-screen bg-[#F1F3F6]" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password !== passwordConfirmation) {
      toast({
        variant: "destructive",
        title:
          lang === "id" ? "Password Tidak Cocok" : "Passwords Do Not Match",
        description:
          lang === "id"
            ? "Konfirmasi password harus sama dengan password."
            : "Confirm password must match the password.",
      });
      return;
    }

    if (captcha.trim().replace(/\s+/g, "").toUpperCase() !== "B47X2Q") {
      toast({
        variant: "destructive",
        title: lang === "id" ? "Captcha Salah" : "Invalid Captcha",
        description:
          lang === "id"
            ? "Karakter captcha tidak cocok."
            : "The captcha characters do not match.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: lang === "id" ? "Registrasi Berhasil" : "Registration Success",
          description:
            data.message ||
            "Registrasi berhasil. Silakan cek email Anda untuk verifikasi.",
        });
        setName("");
        setEmail("");
        setPassword("");
        setPasswordConfirmation("");
        setCaptcha("");
      } else {
        let errorMessage = data.message || "Gagal melakukan registrasi.";

        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          errorMessage = data.errors[firstErrorKey][0];
        }

        toast({
          variant: "destructive",
          title: lang === "id" ? "Registrasi Gagal" : "Registration Failed",
          description: (
            <span className="text-white font-bold">{errorMessage}</span>
          ),
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: lang === "id" ? "Kesalahan" : "Error",
        description: (
          <span className="text-white font-bold">
            {lang === "id"
              ? "Terjadi kesalahan jaringan."
              : "A network error occurred."}
          </span>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setLoading(true);
    try {
      const res = await loginGoogle(idToken);
      const data = await res.json();

      if (res.ok) {
        toast({
          title:
            lang === "id" ? "Login Google Berhasil" : "Google Login Success",
          description:
            data.message || (lang === "id" ? "Selamat datang!" : "Welcome!"),
        });
        login(data.data.token, data.data.asesi || {});
        router.push(`/${lang}/profile`);
      } else {
        toast({
          variant: "destructive",
          title: lang === "id" ? "Login Google Gagal" : "Google Login Failed",
          description: (
            <span className="text-white font-bold">
              {data.message ||
                (lang === "id"
                  ? "Gagal masuk dengan Google."
                  : "Google login failed.")}
            </span>
          ),
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: lang === "id" ? "Kesalahan" : "Error",
        description: (
          <span className="text-white font-bold">
            {lang === "id"
              ? "Terjadi kesalahan jaringan."
              : "A network error occurred."}
          </span>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen md:h-auto md:min-h-screen bg-[#F1F3F6] flex items-center justify-center p-0 sm:p-6 md:py-16">
      <div className="bg-white w-full h-full md:h-auto max-w-[580px] rounded-none md:rounded-[3rem] shadow-none md:shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-6 sm:p-10 md:p-16 my-0 flex flex-col items-center justify-start overflow-y-auto md:overflow-visible">
        <div className="mb-6 md:mb-10 flex flex-col items-center text-center">
          <div className="relative w-64 h-16 md:w-84 md:h-20 mb-4 md:mb-6">
            <Image
              src="/images/logo-nav.png"
              alt="LSP Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
            {dict.register.title}
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            {dict.register.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4 md:space-y-5">
          <div className="space-y-1 md:space-y-2">
            <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">
              {dict.register.name}
            </label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={dict.register.namePlaceholder}
              className="h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#82B124]/20 focus:border-[#82B124] px-5"
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">
              {dict.register.email}
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.register.emailPlaceholder}
              className="h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#82B124]/20 focus:border-[#82B124] px-5"
            />
          </div>

          <div className="space-y-1 md:space-y-2 relative">
            <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">
              {dict.register.password}
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={dict.register.passwordPlaceholder}
              className="h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#82B124]/20 focus:border-[#82B124] px-5 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-10 md:top-12 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="space-y-1 md:space-y-2 relative">
            <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">
              {dict.register.confirmPassword}
            </label>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder={dict.register.confirmPasswordPlaceholder}
              className="h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#82B124]/20 focus:border-[#82B124] px-5 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-10 md:top-12 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <p className="text-[10px] md:text-[11px] text-gray-400 ml-1 italic">
              {dict.register.passwordHint}
            </p>
          </div>

          <div className="space-y-2 md:space-y-3">
            <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">
              {dict.register.captcha}
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="bg-[#F9FBF8] border border-gray-100 rounded-lg p-2 md:p-3 w-fit flex items-center justify-center">
                <span className="text-xl md:text-2xl font-serif tracking-[0.3em] select-none italic text-gray-600">
                  B <span className="text-[#82B124]">4</span> 7{" "}
                  <span className="text-red-400 font-bold">X</span> 2 Q
                </span>
              </div>
              <Input
                type="text"
                required
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                placeholder={dict.register.captchaPlaceholder}
                className="h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#82B124]/20 focus:border-[#82B124] px-5 flex-1"
              />
            </div>
          </div>

          <div className="space-y-3 md:space-y-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#82B124] hover:bg-[#729c1f] text-white h-12 md:h-14 rounded-xl font-bold text-base md:text-lg shadow-lg shadow-[#82B124]/20 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                dict.register.createBtn
              )}
            </Button>

            <div className="flex justify-center w-full min-h-[50px] relative">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    handleGoogleSuccess(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  toast({
                    variant: "destructive",
                    title: "Google Login Failed",
                    description: "Google Authentication was unsuccessful.",
                  });
                }}
                theme="outline"
                size="large"
                shape="rectangular"
                width="380"
              />
            </div>
          </div>
        </form>

        <p className="mt-6 md:mt-10 text-gray-400 font-medium text-xs md:text-sm text-center">
          {dict.register.haveAccount}{" "}
          <Link
            href={`/${lang}/login`}
            className="text-blue-400 font-bold hover:underline"
          >
            {dict.register.loginHere}
          </Link>
        </p>
      </div>
    </div>
  );
}
