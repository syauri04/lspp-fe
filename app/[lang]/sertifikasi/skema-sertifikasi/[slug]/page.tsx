"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import SertifikasiCard from "@/components/SertifikasiCard";
import { CheckCircle2, Bookmark, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/app/[lang]/dictionaries";
import Link from "next/link";

interface DetailSkemaProps {
  params: Promise<{ lang: "id" | "en"; slug: string }>;
}

interface LangField {
  id: string;
  en: string;
}

interface SchemeDetail {
  id: number;
  category_skema_id: string;
  title: LangField;
  slug: string;
  summary: LangField;
  description: LangField;
  image: string;
  amount: string;
  is_view: string;
}

export default function DetailSkema({ params }: DetailSkemaProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const slug = resolvedParams.slug;

  const [dict, setDict] = useState<any>(null);
  const [detail, setDetail] = useState<SchemeDetail | null>(null);
  const [relatedSchemes, setRelatedSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getDictionary(lang).then((data) => {
      setDict(data);
    });
  }, [lang]);

  useEffect(() => {
    const fetchDetailData = async () => {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = process.env.NEXT_PUBLIC_API_TOKEN;

      try {
        const detailResponse = await fetch(`${baseUrl}/sertifikasi/${slug}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!detailResponse.ok) throw new Error("Gagal memuat detail skema");
        const detailResult = await detailResponse.json();
        const mainData: SchemeDetail = detailResult.data;
        setDetail(mainData);

        if (mainData) {
          const relatedResponse = await fetch(
            `${baseUrl}/sertifikasi?category_id=${mainData.category_skema_id}&limit=4`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            },
          );
          if (relatedResponse.ok) {
            const relatedResult = await relatedResponse.json();

            const adaptedRelated = (relatedResult.data || [])
              .filter((item: any) => item.id !== mainData.id)
              .map((item: any) => ({
                id: item.id,
                title: lang === "en" ? item.title.en : item.title.id,
                description: lang === "en" ? item.summary.en : item.summary.id,
                price: formatRupiah(item.amount),
                image: item.image,
                slug: item.slug,
              }));

            setRelatedSchemes(adaptedRelated);
          }
        }
      } catch (error) {
        console.error("Error loading detail schema page:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDetailData();
    }
  }, [slug, lang]);

  const formatRupiah = (amountStr: string) => {
    const num = parseFloat(amountStr);
    if (isNaN(num)) return "Rp 0,00";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  if (!dict || loading) {
    return <div className="min-h-screen bg-white" />;
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-gray-500 font-medium">
          Skema sertifikasi tidak ditemukan.
        </p>
      </div>
    );
  }

  const titleText = lang === "en" ? detail.title.en : detail.title.id;
  const descriptionHtml =
    lang === "en" ? detail.description.en : detail.description.id;

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <main className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-12">
        <section className="flex flex-col lg:flex-row gap-12 mb-24">
          {/* Gambar Detail Skema */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg bg-gray-50">
              <Image
                src={detail.image}
                alt={titleText}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

          {/* Konten Detail Skema */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              {titleText}
            </h1>
            <p className="text-[#78B51A] text-3xl font-bold mb-6 underline">
              {formatRupiah(detail.amount)}
            </p>

            {/* Area Rich Text Deskripsi HTML Panjang dari API */}
            <div className="text-gray-600 text-sm leading-relaxed mb-8 space-y-4 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
            </div>

            {/* Kelompok Tombol CTA */}
            <div className="flex flex-wrap gap-4">
              <Button className="bg-[#E89528] hover:bg-[#d18421] text-white px-8 py-6 rounded-xl font-bold flex gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95">
                <Bookmark className="h-5 w-5 fill-white" />
                {dict.certification?.schemes?.saveText || "Simpan Sertifikasi"}
              </Button>
              <Link
                href={`/${lang}/sertifikasi/skema-sertifikasi/${slug}/daftar`}
              >
                <Button className="bg-[#78B51A] cursor-pointer hover:bg-[#669a16] text-white px-8 py-6 rounded-xl font-bold flex gap-2 shadow-lg shadow-green-200 transition-all active:scale-95 w-full sm:w-auto">
                  <MessageSquare className="h-5 w-5 fill-white" />
                  {dict.certification?.schemes?.registerText ||
                    "Daftar Sertifikasi"}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {relatedSchemes.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-10">
              {dict.certification?.schemes?.relatedAssessment ||
                "Asesmen Terkait"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedSchemes.map((item) => (
                <SertifikasiCard key={item.id} data={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer lang={lang} />
    </div>
  );
}
