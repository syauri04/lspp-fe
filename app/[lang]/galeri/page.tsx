"use client";

import { useState, useEffect, use } from "react";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/navigation";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingContact from "@/components/FloatingContact";
import { getDictionary } from "../dictionaries";
import {
  GalleryItem,
  GalleryPhoto,
  getGalleryDetail,
  getGalleryList,
} from "@/service/gallery.service";

interface GaleriPageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

export default function GaleriPage({ params }: GaleriPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;

  const [dict, setDict] = useState<any>(null);
  const [albums, setAlbums] = useState<GalleryItem[]>([]);

  const [activePhotos, setActivePhotos] = useState<GalleryPhoto[]>([]);
  const [activeAlbumTitle, setActiveAlbumTitle] = useState<{
    id: string;
    en: string;
  } | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [loadingAlbumSlug, setLoadingAlbumSlug] = useState<string | null>(null);

  useEffect(() => {
    getDictionary(lang).then((data) => setDict(data));

    getGalleryList().then((res) => {
      if (res && res.data) {
        setAlbums(res.data);
      }
    });
  }, [lang]);

  const handleAlbumClick = async (album: GalleryItem) => {
    setLoadingAlbumSlug(album.slug);
    const detail = await getGalleryDetail(album.slug);
    setLoadingAlbumSlug(null);

    if (detail && detail.photos && detail.photos.length > 0) {
      setActiveAlbumTitle(detail.title);
      setActivePhotos(detail.photos);
      setSelectedPhotoIndex(0);
    } else {
      alert(
        lang === "en"
          ? "No photos available in this album."
          : "Tidak ada foto di dalam album ini.",
      );
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) =>
        prev! + 1 === activePhotos.length ? 0 : prev! + 1,
      );
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) =>
        prev === 0 ? activePhotos.length - 1 : prev! - 1,
      );
    }
  };

  const currentPhoto =
    selectedPhotoIndex !== null ? activePhotos[selectedPhotoIndex] : null;
  const albumTitleText = activeAlbumTitle
    ? activeAlbumTitle[lang] || activeAlbumTitle["id"]
    : "";

  if (!dict) {
    return <div className="min-h-screen bg-white" />;
  }

  const apiAssetUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "";

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />
      <HeroSection
        page="Galeri"
        description="Dokumentasi dokumentasi uji kompetensi dan kegiatan sertifikasi."
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h2 className="text-3xl font-semibold text-gray-700">Album</h2>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-48">
                <select className="appearance-none w-full bg-white border border-[#a3cf5d] text-gray-600 py-2.5 px-6 pr-10 rounded-full focus:outline-none focus:ring-1 focus:ring-[#a3cf5d] cursor-pointer text-sm">
                  <option>Terbaru</option>
                  <option>Terlama</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums.map((album) => {
              const title = album.title[lang] || album.title["id"];
              const isAlbumLoading = loadingAlbumSlug === album.slug;

              return (
                <motion.div
                  key={album.id}
                  onClick={() => !isAlbumLoading && handleAlbumClick(album)}
                  className={`relative aspect-square rounded-[2rem] overflow-hidden cursor-pointer group shadow-sm bg-gray-100 ${
                    isAlbumLoading ? "opacity-75 pointer-events-none" : ""
                  }`}
                >
                  <Image
                    src={`${apiAssetUrl}/${album.cover_image}`}
                    alt={title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />

                  {isAlbumLoading ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                      <Loader2 className="animate-spin" size={32} />
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-[#4a5d23]/90 flex flex-col justify-end p-6"
                    >
                      <span className="text-white/70 text-xs mb-1">
                        {album.event_date} • {album.photos_count} Foto
                      </span>
                      <p className="text-white text-sm font-medium line-clamp-3">
                        {title}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedPhotoIndex !== null && currentPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-5xl flex items-center justify-center gap-4">
              {activePhotos.length > 1 && (
                <button
                  onClick={handlePrev}
                  className="hidden md:flex p-4 bg-[#a3cf5d] hover:bg-[#8eb34d] rounded-full text-white shrink-0 transition-transform active:scale-90 z-20 shadow-lg"
                >
                  <ChevronLeft size={40} />
                </button>
              )}

              <motion.div
                key={currentPhoto.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
              >
                <div
                  className="relative aspect-[16/10] w-full cursor-pointer"
                  onClick={handleNext}
                >
                  <Image
                    src={`${apiAssetUrl}/${currentPhoto.image}`}
                    alt={
                      currentPhoto.caption[lang] ||
                      currentPhoto.caption["id"] ||
                      albumTitleText
                    }
                    fill
                    className="object-cover"
                    unoptimized
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12 text-center pointer-events-none">
                    <span className="text-white/60 text-xs mb-1 font-medium tracking-wider uppercase">
                      {lang === "en" ? "Album" : "Album"}: {albumTitleText} (
                      {selectedPhotoIndex + 1} / {activePhotos.length})
                    </span>
                    <h3 className="text-white text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                      {currentPhoto.caption[lang] || currentPhoto.caption["id"]}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoIndex(null);
                    }}
                    className="absolute top-6 right-6 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-colors pointer-events-auto shadow-md"
                  >
                    <X size={24} />
                  </button>
                </div>
              </motion.div>

              {activePhotos.length > 1 && (
                <button
                  onClick={handleNext}
                  className="hidden md:flex p-4 bg-[#a3cf5d] hover:bg-[#8eb34d] rounded-full text-white shrink-0 transition-transform active:scale-90 z-20 shadow-lg"
                >
                  <ChevronRight size={40} />
                </button>
              )}
            </div>

            {activePhotos.length > 1 && (
              <div className="absolute bottom-6 flex gap-8 md:hidden z-20">
                <button
                  onClick={handlePrev}
                  className="p-4 bg-[#a3cf5d] active:bg-[#8eb34d] rounded-full text-white shadow-lg"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-4 bg-[#a3cf5d] active:bg-[#8eb34d] rounded-full text-white shadow-lg"
                >
                  <ChevronRight size={28} />
                </button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      <Footer lang={lang} />
      <FloatingContact />
    </div>
  );
}
