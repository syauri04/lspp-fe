"use client";

import { useState, useEffect, useRef, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { beritahuNotifikasiBerubah } from "@/hooks/use-notifikasi-belum-dibaca";
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { getDictionary } from "../dictionaries";
import { useAuth } from "@/lib/auth-context";
import {
  bacaNotifikasi,
  bacaSemuaNotifikasi,
  formatTanggal,
  getNotifikasi,
  urlWebsite,
  type NotifikasiAsesi,
} from "@/service/profil.service";

interface NotifikasiPageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

export default function NotifikasiPage({ params }: NotifikasiPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const [dict, setDict] = useState<any>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { token, isLoggedIn, loading: authLoading } = useAuth();
  const [daftar, setDaftar] = useState<NotifikasiAsesi[]>([]);
  const [halaman, setHalaman] = useState({ sekarang: 0, terakhir: 1 });
  const [belumDibaca, setBelumDibaca] = useState(0);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push(`/${lang}/login`);
  }, [authLoading, isLoggedIn, router, lang]);

  const muat = useCallback(
    async (page: number) => {
      if (!token) return;
      setMemuat(true);
      try {
        const res = await getNotifikasi(token, { page, perPage: 15 });
        setDaftar((lama) => (page === 1 ? res.data : [...lama, ...res.data]));
        setHalaman({ sekarang: res.meta.current_page, terakhir: res.meta.last_page });
        setBelumDibaca(res.meta.belum_dibaca);
        setGalat(null);
      } catch (err) {
        setGalat((err as Error).message);
      } finally {
        setMemuat(false);
      }
    },
    [token],
  );

  useEffect(() => {
    muat(1);
  }, [muat]);

  const bukaNotifikasi = async (item: NotifikasiAsesi) => {
    if (!token) return;
    if (!item.dibaca) {
      setDaftar((lama) => lama.map((n) => (n.id === item.id ? { ...n, dibaca: true } : n)));
      setBelumDibaca((n) => Math.max(0, n - 1));
      bacaNotifikasi(token, item.id).then(beritahuNotifikasiBerubah).catch(() => {});
    }
    if (item.url) {
      const tujuan = urlWebsite(item.url, lang);
      if (/^https?:\/\//.test(tujuan)) window.open(tujuan, "_blank", "noopener,noreferrer");
      else router.push(tujuan);
    }
  };

  const tandaiSemua = async () => {
    if (!token || belumDibaca === 0) return;
    setDaftar((lama) => lama.map((n) => ({ ...n, dibaca: true })));
    setBelumDibaca(0);
    await bacaSemuaNotifikasi(token).then(beritahuNotifikasiBerubah).catch(() => muat(1));
  };

  useEffect(() => {
    getDictionary(lang).then((data) => {
      setDict(data);
    });
  }, [lang]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const totalScrollable = scrollHeight - clientHeight;
      const percentage =
        totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;
      setScrollPercentage(percentage);
      if (percentage > 90 && !memuat && halaman.sekarang < halaman.terakhir) muat(halaman.sekarang + 1);
    }
  };

  if (!dict || authLoading || !isLoggedIn) {
    return <div className="min-h-screen bg-[#F9FBF8]" />;
  }

  return (
    <div className="min-h-screen bg-[#F9FBF8]">
      <Navigation lang={lang} dict={dict} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-10 md:ml-16">
          <div className="bg-[#8CC63F]/10 p-3 rounded-2xl">
            <Bell
              className="h-6 w-6 text-[#8CC63F]"
              fill="#8CC63F"
              fillOpacity={0.2}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
            <p className="text-sm text-gray-400">
              Pusat informasi sertifikasi dan pembaruan akun Anda
            </p>
          </div>
          {belumDibaca > 0 && (
            <button
              type="button"
              onClick={tandaiSemua}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#78B51A] border border-[#8CC63F] hover:bg-[#8CC63F]/10 transition-colors"
            >
              <CheckCheck size={16} /> Tandai semua dibaca ({belumDibaca})
            </button>
          )}
        </div>
        {galat && <p className="mb-6 md:ml-16 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{galat}</p>}

        <div className="relative flex gap-8 md:gap-12 items-start">
          <div className="hidden md:flex flex-col items-center sticky top-0 h-fit pt-2">
            <div className="w-[4px] h-[500px] bg-gray-100 rounded-full relative overflow-hidden">
              <div
                className="absolute left-0 w-full h-[150px] bg-gray-400 rounded-full transition-all duration-150 ease-out"
                style={{
                  top: `${(scrollPercentage / 100) * (500 - 150)}px`,
                }}
              />
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 space-y-4 max-h-[600px] overflow-y-auto pr-4 no-scrollbar scroll-smooth"
          >
            {daftar.length === 0 && !memuat && (
              <p className="text-gray-400 text-sm">Belum ada notifikasi.</p>
            )}
            {daftar.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => bukaNotifikasi(item)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && bukaNotifikasi(item)}
                className={`group relative rounded-2xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6 md:p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer overflow-hidden ${
                  item.dibaca ? "bg-white" : "bg-[#F4F9EC]"
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${
                    item.dibaca ? "bg-gray-50 group-hover:bg-[#8CC63F]" : "bg-[#8CC63F]"
                  }`}
                />

                <div className="flex items-start gap-3">
                  {!item.dibaca && <span className="h-2 w-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm md:text-base">{item.judul}</p>
                    <p className="text-gray-500 leading-relaxed text-sm md:text-base mt-1">
                      {item.skema && item.pesan.includes(item.skema) ? (
                        <>
                          {item.pesan.slice(0, item.pesan.indexOf(item.skema))}
                          <span className="font-bold text-gray-800">{item.skema}</span>
                          {item.pesan.slice(item.pesan.indexOf(item.skema) + item.skema.length)}
                        </>
                      ) : (
                        item.pesan
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{formatTanggal(item.dibuat_at, lang)}</p>
                  </div>
                </div>
              </div>
            ))}
            {memuat && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#8CC63F]" />
              </div>
            )}
            {!memuat && halaman.sekarang < halaman.terakhir && (
              <button
                type="button"
                onClick={() => muat(halaman.sekarang + 1)}
                className="w-full py-3 text-sm font-semibold text-[#78B51A] hover:underline"
              >
                Muat lebih banyak
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer lang={lang} />
      <FloatingContact />

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
