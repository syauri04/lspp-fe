"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navigation from "@/components/navigation";
import Image from "next/image";
import FloatingContact from "@/components/FloatingContact";
import Footer from "@/components/Footer";
import Link from "next/link";
import SertifikasiCard from "@/components/SertifikasiCard";

import { getDictionary } from "./dictionaries";
import {
  AboutHomeData,
  getAboutHome,
  getHeroBanners,
  getNewsHome,
  HeroBannerItem,
  NewsHomeItem,
  getMitras,
  MitraItem,
} from "@/service/home.service";
import { instagramEmbeds } from "@/lib/instagram-embeds";
import InstagramEmbed from "@/components/InstagramEmbed";

interface HomePageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

interface SchemeItem {
  id: number;
  category_skema_id: string;
  title: { id: string; en: string };
  slug: string;
  summary: { id: string; en: string };
  image: string;
  amount: string;
  is_view: string;
}

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/lsppariwisata_306/";

export default function HomePage({ params }: HomePageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const [dict, setDict] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [apiBanners, setApiBanners] = useState<HeroBannerItem[]>([]);
  const [aboutData, setAboutData] = useState<AboutHomeData | null>(null);
  const [newsData, setNewsData] = useState<NewsHomeItem[]>([]);
  const [mitraData, setMitraData] = useState<MitraItem[]>([]);

  const [schemes, setSchemes] = useState<SchemeItem[]>([]);

  useEffect(() => {
    getDictionary(lang).then((data) => {
      setDict(data);
    });

    getHeroBanners().then((data) => {
      setApiBanners(data);
    });

    getAboutHome().then((data) => {
      setAboutData(data);
    });

    getNewsHome().then((data) => {
      setNewsData(data);
    });

    getMitras().then((data) => {
      setMitraData(data);
    });

    const fetchHomeSchemes = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const token = process.env.NEXT_PUBLIC_API_TOKEN;

        const response = await fetch(
          `${baseUrl}/sertifikasi?search=&sort=terbaru&page=1&limit=8`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );
        if (response.ok) {
          const result = await response.json();
          setSchemes(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching schemes for home:", error);
      }
    };

    fetchHomeSchemes();
  }, [lang]);

  const slides = apiBanners.map((item) => ({
    id: item.id,
    image: item.image,
    title: item.title[lang] || item.title["id"],
    description: item.summary[lang] || item.summary["id"],
  }));

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  const formatRupiah = (amountStr: string) => {
    const num = parseFloat(amountStr);
    if (isNaN(num)) return "Rp 0,00";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  if (!dict || slides.length === 0 || !aboutData || newsData.length === 0) {
    return null;
  }

  const marqueeNews = [...newsData, ...newsData];

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <section className="relative bg-[#212121] overflow-hidden pt-20 pb-32 min-h-[80vh] flex items-center">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt="Hero Background"
              fill
              className="object-cover object-center"
              priority={index === 0}
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#212121] via-[#212121]/30 to-transparent" />
          </div>
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-32">
          <div
            key={currentSlide}
            className="animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 drop-shadow-lg">
              {slides[currentSlide]?.title}
            </h1>

            <p className="text-base md:text-lg max-w-3xl mx-auto mb-10 leading-relaxed font-light opacity-90 drop-shadow">
              {slides[currentSlide]?.description}
            </p>
          </div>

          <div className="flex justify-center items-center gap-6 mt-16 text-white/80">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full hover:bg-white/20 transition-all hover:text-white"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>

            <div className="flex gap-2.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    index === currentSlide ? "bg-white w-6" : "bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-2 rounded-full hover:bg-white/20 transition-all hover:text-white"
              aria-label="Next slide"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          </div>
        </div>
      </section>
      {/* END HERO SECTION */}

      {/* ICON SECTION */}
      <section className="bg-[#212121] py-16 border-t border-[#212121]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center text-white border-r border-white/40 last:border-0">
              <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 transition-transform hover:scale-110 duration-300">
                <Image
                  src="/images/scheme.png"
                  alt="Skema"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl md:text-3xl font-bold uppercase tracking-widest text-center">
                {dict.home.icons.schemes}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-white border-r border-white/40 last:border-0">
              <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 transition-transform hover:scale-110 duration-300">
                <Image
                  src="/images/asesor.png"
                  alt="Asesor"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl md:text-3xl font-bold uppercase tracking-widest text-center">
                {dict.home.icons.assessors}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-white border-r border-white/40 last:border-0">
              <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 transition-transform hover:scale-110 duration-300">
                <Image
                  src="/images/location-map.png"
                  alt="TUK"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl md:text-3xl font-bold uppercase tracking-widest text-center">
                {dict.home.icons.tuk}
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* END ICON SECTION */}

      {/* ABOUT SECTION */}
      <section className="relative w-full min-h-[500px] md:min-h-[700px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <Image
            src={aboutData.background_image}
            alt="About Background"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-black/50 md:bg-black/40" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-6 md:px-12 text-center text-white flex flex-col items-center justify-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-wide leading-tight">
            {aboutData.title[lang] || aboutData.title["id"]}
          </h2>

          <div
            className="text-base md:text-lg lg:text-xl leading-relaxed mb-8 max-w-3xl text-gray-200"
            dangerouslySetInnerHTML={{
              __html: aboutData.desc_home[lang] || aboutData.desc_home["id"],
            }}
          />

          <Link href={`/${lang}/about`} className="no-underline">
            <Button
              type="button"
              className="bg-white text-gray-900 hover:text-black font-medium tracking-wide px-8 py-3.5 h-auto text-base rounded-md shadow-md border-none transition-all duration-200 hover:bg-gray-100 active:scale-95 cursor-pointer"
            >
              {dict.home.aboutSection.moreBtn}
            </Button>
          </Link>
        </div>
      </section>
      {/* END ABOUT SECTION */}

      {/* SKEMA SERTIFIKASI SECTION */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
                {dict.home.certificationsSection.title}
              </h2>
              <div className="h-1.5 w-20 bg-[#78B51A] mt-2 rounded-full" />
            </div>
            <Link
              href={`/${lang}/sertifikasi/skema-sertifikasi`}
              className="no-underline"
            >
              <Button className="bg-[#78B51A] hover:bg-[#669a16] text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-[0_10px_20px_rgba(120,181,26,0.3)] hover:-translate-y-1">
                {dict.home.certificationsSection.title}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {schemes.map((item) => {
              const adaptedData = {
                id: item.id,
                title: lang === "en" ? item.title.en : item.title.id,
                description: lang === "en" ? item.summary.en : item.summary.id,
                price: formatRupiah(item.amount),
                image: item.image,
                slug: item.slug,
                lang: lang,
              };

              return <SertifikasiCard key={item.id} data={adaptedData} />;
            })}
          </div>
        </div>
      </section>
      {/* END SKEMA SERTIFIKASI SECTION */}

      {/* BERITA TERBARU SECTION */}
      <section className="py-20 bg-[#78B51A] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 mt-16">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              {dict.home.newsSection.title}
            </h2>
            <Link href={`/${lang}/berita`}>
              <Button className="bg-white text-[#78B51A] hover:bg-gray-100 px-8 py-6 rounded-lg font-semibold shadow-md transition-all duration-300 hover:shadow-[0_10px_20px_rgba(120,181,26,0.3)] hover:-translate-y-1">
                {dict.home.newsSection.viewPost}
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative flex overflow-hidden group mt-16">
          <div className="flex space-x-6 animate-marquee whitespace-nowrap pause-on-hover">
            {marqueeNews.map((item, index) => (
              <div
                key={index}
                className="group/card relative inline-block w-[300px] md:w-[350px] bg-white rounded-3xl overflow-hidden shadow-xl flex-shrink-0 cursor-pointer transition-transform duration-300 hover:-translate-y-2"
              >
                <Link
                  href={`/${lang}/berita/${item.slug}`}
                  className="absolute inset-0 z-10"
                  aria-label="Baca selengkapnya"
                />

                <div className="p-4">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title[lang] || item.title["id"]}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="px-6 pb-8 whitespace-normal">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight group-hover/card:text-[#78B51A] transition-colors line-clamp-2">
                    {item.title[lang] || item.title["id"]}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 line-clamp-3">
                    {item.summary[lang] || item.summary["id"]}
                  </p>
                  <span className="text-gray-400 text-xs font-medium">
                    {item.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-marquee {
            display: flex;
            width: fit-content;
            animation: marquee 30s linear infinite;
          }
          .pause-on-hover:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>
      {/* END BERITA TERBARU SECTION */}

      {/* MEDIA SOSIAL & CLIENT SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                {dict.home.socialSection.title}
              </h2>
              <Button
                onClick={() =>
                  window.open(
                    INSTAGRAM_PROFILE_URL,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                className="cursor-pointer bg-[#78B51A] hover:bg-[#669a16] text-white px-8 py-6 rounded-lg font-medium shadow-sm transition-all duration-300 hover:shadow-[0_10px_20px_rgba(120,181,26,0.3)] hover:-translate-y-1"
              >
                {dict.home.socialSection.title} okeoke
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {instagramEmbeds.map((post) => (
                <InstagramEmbed key={post.id} html={post.html} />
              ))}
            </div>
          </div>

          <div className="pt-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">
              {dict.home.socialSection.clients}
            </h2>

            <div className="relative flex overflow-hidden group">
              <div className="flex space-x-12 md:space-x-24 animate-marquee-reverse whitespace-nowrap items-center">
                {[...mitraData, ...mitraData].map((mitra, index) => {
                  const logoImage = (
                    <Image
                      src={mitra.logo}
                      alt={mitra.name}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  );
                  return (
                    <div
                      key={`${mitra.id}-${index}`}
                      className="relative w-32 h-16 md:w-48 md:h-24 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    >
                      {mitra.link ? (
                        <a
                          href={mitra.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative w-full h-full"
                        >
                          {logoImage}
                        </a>
                      ) : (
                        logoImage
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes marquee-reverse {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0);
            }
          }
          .animate-marquee-reverse {
            display: flex;
            width: fit-content;
            animation: marquee-reverse 25s linear infinite;
          }
        `}</style>
      </section>

      <Footer lang={lang} />
      <FloatingContact />
    </div>
  );
}
