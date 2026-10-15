"use client";

import { useState, useEffect, use } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import Image from "next/image";
import NewsCard from "../NewsCard";
import { getDictionary } from "../../dictionaries";
import {
  getNewsDetail,
  getNewsList,
  NewsDetailItem,
  NewsItem,
} from "@/service/berita.service";

interface DetailBeritaPageProps {
  params: Promise<{ lang: "id" | "en"; slug: string }>;
}

export default function DetailBeritaPage({ params }: DetailBeritaPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const slug = resolvedParams.slug;

  const [dict, setDict] = useState<any>(null);
  const [detail, setDetail] = useState<NewsDetailItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDictionary(lang).then((data) => setDict(data));

    getNewsDetail(slug).then((data) => {
      setDetail(data);
      setLoading(false);
    });

    getNewsList({ sort: "latest" }).then((res) => {
      if (res && res.success) {
        const filtered = res.data
          .filter((item) => item.slug !== slug)
          .slice(0, 4);
        setRelatedNews(filtered);
      }
    });
  }, [lang, slug]);

  if (!dict || loading) {
    return <div className="min-h-screen bg-white" />;
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Navigation lang={lang} dict={dict} />
        <div className="text-center py-20 text-gray-500">
          Berita tidak ditemukan.
        </div>
        <Footer lang={lang} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <article className="py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-16">
          <header className="mb-12">
            <div className="flex gap-4 items-center text-sm text-gray-400 mb-2">
              <span className="text-[#78B51A] font-bold">Tim LSPP 306</span>
              <span>•</span>
              <span>{detail.date}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight mb-6">
              {detail.title[lang] || detail.title["id"]}
            </h1>
          </header>

          <figure className="mb-12">
            <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-xl">
              <Image
                src={detail.image}
                alt={detail.title[lang] || detail.title["id"]}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            {detail.source && (
              <figcaption className="mt-4 text-center text-gray-400 text-xs italic">
                Sumber:{" "}
                <a
                  href={detail.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-[#78B51A]"
                >
                  {detail.source}
                </a>
              </figcaption>
            )}
          </figure>

          {/* RENDER KONTEN HTML UTAMA UTK ARTIKEL */}
          <div
            className="prose prose-lg max-w-none text-gray-600 space-y-6 leading-relaxed text-justify
                       [&>p]:mb-4 [&>p]:leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: detail.content[lang] || detail.content["id"],
            }}
          />

          <hr className="my-20 border-gray-100" />

          {/* SECTION BERITA TERKAIT */}
          {relatedNews.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-gray-800 mb-10">
                Berita Terkait
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedNews.map((item) => (
                  <NewsCard key={item.slug} item={item} lang={lang} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      <Footer lang={lang} />
    </div>
  );
}
