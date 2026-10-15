"use client";

import { useState, useEffect, useRef, use } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Bell } from "lucide-react";
import { getDictionary } from "../dictionaries";

interface NotifikasiPageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

const NOTIFICATIONS_DATA = [
  {
    id: 1,
    message: "Pengajuan assesmen ",
    boldText: "Sertifikasi Profesi Waiter (Pelayan Restoran)",
    suffix:
      " anda disetujui! Silahkan melakukan pembayaran untuk melanjutkan proses.",
  },
  {
    id: 2,
    message:
      "E-Sertifikat anda akan segera Kadaluarsa! silahkan melakukan perpanjangan sertifikat anda",
    boldText: "",
    suffix: "",
  },
  {
    id: 3,
    message: "Assesmen ",
    boldText: "Sertifikasi Profesi Waiter (Pelayan Restoran)",
    suffix: " akan dilaksanakan 3 Hari Lagi!",
  },
  {
    id: 4,
    message: "Pembayaran asesmen ",
    boldText: "Sertifikasi Profesi Resepsionis Hotel",
    suffix:
      " anda telah berhasil dikonfirmasi. Silahkan menunggu jadwal asesmen.",
  },
  {
    id: 5,
    message: "Tagihan pembayaran ",
    boldText: "Sertifikasi Profesi Barista Profesional",
    suffix:
      " anda belum diselesaikan. Segera lakukan pembayaran sebelum batas waktu.",
  },
  {
    id: 6,
    message:
      "E-Sertifikat anda akan segera Kadaluarsa! silahkan melakukan perpanjangan sertifikat anda",
    boldText: "",
    suffix: "",
  },
  {
    id: 7,
    message: "Pembaruan sistem selesai dilakukan. Cek fitur terbaru kami.",
    boldText: "",
    suffix: "",
  },
];

export default function NotifikasiPage({ params }: NotifikasiPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const [dict, setDict] = useState<any>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    }
  };

  if (!dict) {
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
        </div>

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
            {NOTIFICATIONS_DATA.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-2xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6 md:p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-50 group-hover:bg-[#8CC63F] transition-colors duration-300" />

                <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                  {item.message}
                  {item.boldText && (
                    <span className="font-bold text-gray-800 mx-1">
                      {item.boldText}
                    </span>
                  )}
                  {item.suffix}
                </p>
              </div>
            ))}
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
