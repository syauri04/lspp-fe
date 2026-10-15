"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/app/[lang]/dictionaries";

interface SubmitSuccessPageProps {
  params: Promise<{ lang: "id" | "en"; id: string }>;
}

const CONTENT = {
  id: {
    title: "Terima Kasih",
    description: (
      <>
        Pengajuan sertifikasi Anda telah berhasil dikirim.
        <br />
        Anda dapat memantau status pengajuan melalui halaman Profil Anda.
      </>
    ),
    backButton: "Kembali ke beranda",
  },
  en: {
    title: "Thank You",
    description: (
      <>
        Your certification submission has been sent successfully.
        <br />
        You can monitor the submission status on your Profile page.
      </>
    ),
    backButton: "Back to home",
  },
};

export default function SubmitSuccessPage({ params }: SubmitSuccessPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;

  const [dict, setDict] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getDictionary(lang)
      .then((data: any) => setDict(data))
      .catch((err) => {
        console.error("Gagal load dictionary:", err);
        setDict({});
      })
      .finally(() => setLoading(false));
  }, [lang]);

  const text = CONTENT[lang] ?? CONTENT.id;

  if (!dict || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 font-medium animate-pulse">
          Memuat informasi...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation lang={lang} dict={dict} />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center max-w-xl py-16">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#82B124] flex items-center justify-center mb-10">
            <Check className="text-white" size={56} strokeWidth={3} />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            {text.title}
          </h1>

          <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-10">
            {text.description}
          </p>

          <Link href={`/${lang}`}>
            <Button
              type="button"
              className="bg-[#82B124] hover:bg-[#729c1f] text-white px-10 py-6 rounded-xl font-bold text-base"
            >
              {text.backButton}
            </Button>
          </Link>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
