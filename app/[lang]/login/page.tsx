"use client";
import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getDictionary } from "../dictionaries";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { loginUser, loginGoogle } from "@/service/auth.service";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginPageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

export default function LoginPage({ params }: LoginPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [dict, setDict] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (captcha.trim().replace(/\s+/g, "").toUpperCase() !== "B47X2Q") {
      toast({
        variant: "destructive",
        title: lang === "id" ? "Captcha Salah" : "Invalid Captcha",
        description: (
          <span className="text-white font-bold">
            {lang === "id"
              ? "Karakter captcha tidak cocok."
              : "The captcha characters do not match."}
          </span>
        ),
      });
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: lang === "id" ? "Login Berhasil" : "Login Success",
          description: data.message || "Selamat datang kembali!",
        });
        login(data.data.token, data.data.asesi || {});
        router.push(`/${lang}/profile`);
      } else {
        toast({
          variant: "destructive",
          title: lang === "id" ? "Login Gagal" : "Login Failed",
          description: (
            <span className="text-white font-bold">
              {data.message ||
                (lang === "id"
                  ? "Email atau password salah."
                  : "Invalid email or password.")}
            </span>
          ),
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
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
          description: data.message || "Selamat datang kembali!",
        });
        login(data.data.token, data.data.asesi || {});
        router.push(`/${lang}/profile`);
      } else {
        toast({
          variant: "destructive",
          title: "Google Login Failed",
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
        title: "Error",
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
    <div className="h-screen md:h-auto md:min-h-screen overflow-hidden md:overflow-auto bg-[#F1F3F6] flex items-center justify-center p-0 sm:p-6 md:py-16">
      <div className="bg-white w-full h-full md:h-auto max-w-[580px] rounded-none md:rounded-[3rem] shadow-none md:shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-6 sm:p-10 md:p-16 my-0 flex flex-col items-center justify-center md:justify-start overflow-y-auto md:overflow-visible">
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
            {dict.login.title}
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            {dict.login.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4 md:space-y-6">
          <div className="space-y-1 md:space-y-2">
            <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">
              {dict.login.email}
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.login.emailPlaceholder}
              className="h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#82B124]/20 focus:border-[#82B124] px-5"
            />
          </div>

          <div className="space-y-1 md:space-y-2 relative">
            <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">
              {dict.login.password}
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
          <div className="space-y-1 md:space-y-2">
            <label className="text-xs md:text-sm font-semibold text-gray-600 ml-1">
              {dict.login.captcha}
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="bg-[#F9FBF8] border border-gray-100 rounded-lg p-2 md:p-3 w-fit flex items-center justify-center">
                <span className="text-xl md:text-2xl font-serif tracking-[0.3em] select-none italic text-gray-600">
                  B <span className="text-[#82B124]">4</span> 7{" "}
                  <span className="text-red-400">X</span> 2 Q
                </span>
              </div>
              <Input
                type="text"
                required
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                placeholder={dict.login.captchaPlaceholder}
                className="h-12 md:h-14 rounded-xl border-gray-200 focus:ring-[#82B124]/20 focus:border-[#82B124] px-5 flex-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs md:text-sm">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="border-gray-300 data-[state=checked]:bg-[#82B124]"
              />
              <label
                htmlFor="remember"
                className="text-gray-500 font-medium cursor-pointer"
              >
                {dict.login.rememberMe}
              </label>
            </div>
            <Link
              href={`/${lang}/forgot-password`}
              className="text-blue-400 font-semibold hover:underline"
            >
              {dict.login.forgotPassword}
            </Link>
          </div>

          <div className="space-y-3 md:space-y-4 pt-2 md:pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#82B124] hover:bg-[#729c1f] text-white h-12 md:h-14 rounded-xl font-bold text-base md:text-lg shadow-lg shadow-[#82B124]/20 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                dict.login.signInBtn
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

        <p className="mt-6 md:mt-10 text-sm md:text-base text-gray-400 font-medium text-center">
          {dict.login.noAccount}{" "}
          <Link
            href={`/${lang}/register`}
            className="text-blue-400 font-bold hover:underline"
          >
            {dict.login.registerHere}
          </Link>
        </p>
      </div>
    </div>
  );
}
