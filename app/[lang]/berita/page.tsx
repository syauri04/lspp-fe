"use client";
import { useState, useEffect, use } from "react";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import NewsCard from "./NewsCard";
import FloatingContact from "@/components/FloatingContact";
import { getDictionary } from "../dictionaries";
import { getNewsList, NewsItem } from "@/service/berita.service";

interface BeritaPageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

export default function BeritaPage({ params }: BeritaPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;

  const [dict, setDict] = useState<any>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSort, setSelectedSort] = useState<
    "latest" | "oldest" | "popular"
  >("latest");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    getDictionary(lang).then((data) => setDict(data));
  }, [lang]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, current_page: 1 }));
    }, 5000);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    getNewsList({
      search: debouncedSearch,
      sort: selectedSort,
      category_id: selectedCategory,
      page: pagination.current_page,
    }).then((res) => {
      if (res && res.success) {
        setNews(res.data || []);

        setPagination({
          current_page: res.meta?.current_page || 1,
          last_page: res.meta?.last_page || 1,
        });
      }
    });
  }, [
    debouncedSearch,
    selectedSort,
    selectedCategory,
    pagination.current_page,
  ]);

  if (!dict) {
    return <div className="min-h-screen bg-white" />;
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPagination((prev) => ({ ...prev, current_page: newPage }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <HeroSection
        page={dict.news.title}
        description="Dapatkan informasi, artikel pariwisata, teknologi, serta berita regulasi sertifikasi kompetensi terbaru dari kami."
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          <div className="flex justify-center mb-16">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={dict.news.searchPlaceholder}
                className="w-full pl-12 pr-6 py-4 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#78B51A]/20 focus:border-[#78B51A] transition-all"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* SIDEBAR FILTERS */}
            <aside className="w-full lg:w-64 space-y-10">
              {/* SORT FILTER */}
              <div className="border-r border-gray-100 pr-6">
                <h3 className="font-bold text-gray-800 mb-6">
                  {dict.news.sortBy}
                </h3>
                <div className="space-y-4">
                  {[
                    { key: "latest", label: dict.news.newest },
                    { key: "oldest", label: dict.news.oldest },
                    { key: "popular", label: dict.news.mostViewed },
                  ].map((option) => (
                    <label
                      key={option.key}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="sort_filter"
                        checked={selectedSort === option.key}
                        onChange={() => {
                          setSelectedSort(option.key as any);
                          setPagination((prev) => ({
                            ...prev,
                            current_page: 1,
                          }));
                        }}
                        className="w-4 h-4 text-[#78B51A] focus:ring-[#78B51A]"
                      />
                      <span
                        className={`${selectedSort === option.key ? "text-[#78B51A] font-medium" : "text-gray-600"} group-hover:text-[#78B51A] transition-colors`}
                      >
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* CATEGORY FILTER */}
              <div className="border-r border-gray-100 pr-6">
                <h3 className="font-bold text-gray-800 mb-6">
                  {dict.news.category}
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="category_filter"
                      checked={selectedCategory === ""}
                      onChange={() => {
                        setSelectedCategory("");
                        setPagination((prev) => ({ ...prev, current_page: 1 }));
                      }}
                      className="w-4 h-4 text-[#78B51A] focus:ring-[#78B51A]"
                    />
                    <span
                      className={`${selectedCategory === "" ? "text-[#78B51A] font-medium" : "text-gray-600"}`}
                    >
                      Semua Kategori
                    </span>
                  </label>
                  {/* Contoh mapping kategori statis/dinamis dari API data Anda */}
                  {[
                    { id: "1", name: "Teknologi" },
                    { id: "2", name: "Pariwisata" },
                    { id: "3", name: "Sertifikasi" },
                    { id: "4", name: "Kegiatan" },
                  ].map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="category_filter"
                        checked={selectedCategory === cat.id}
                        onChange={() => {
                          setSelectedCategory(cat.id);
                          setPagination((prev) => ({
                            ...prev,
                            current_page: 1,
                          }));
                        }}
                        className="w-4 h-4 text-[#78B51A] focus:ring-[#78B51A]"
                      />
                      <span
                        className={`${selectedCategory === cat.id ? "text-[#78B51A] font-medium" : "text-gray-600"} group-hover:text-[#78B51A] transition-colors`}
                      >
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex-1">
              {news.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  Tidak ada berita ditemukan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.map((item) => (
                    <NewsCard key={item.slug} item={item} lang={lang} />
                  ))}
                </div>
              )}

              {pagination.last_page > 1 && (
                <div className="mt-16 flex justify-center items-center gap-2">
                  <button
                    disabled={pagination.current_page === 1}
                    onClick={() => handlePageChange(1)}
                    className="p-2 text-gray-400 hover:text-[#78B51A] disabled:opacity-30 disabled:pointer-events-none border border-gray-100 rounded-lg"
                  >
                    <ChevronsLeft size={20} />
                  </button>
                  <button
                    disabled={pagination.current_page === 1}
                    onClick={() =>
                      handlePageChange(pagination.current_page - 1)
                    }
                    className="p-2 text-gray-400 hover:text-[#78B51A] disabled:opacity-30 disabled:pointer-events-none border border-gray-100 rounded-lg"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {Array.from({ length: pagination.last_page }, (_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${
                          pagination.current_page === pageNum
                            ? "bg-[#78B51A] text-white"
                            : "text-gray-500 border border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={pagination.current_page === pagination.last_page}
                    onClick={() =>
                      handlePageChange(pagination.current_page + 1)
                    }
                    className="p-2 text-gray-400 hover:text-[#78B51A] disabled:opacity-30 disabled:pointer-events-none border border-gray-100 rounded-lg"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button
                    disabled={pagination.current_page === pagination.last_page}
                    onClick={() => handlePageChange(pagination.last_page)}
                    className="p-2 text-gray-400 hover:text-[#78B51A] disabled:opacity-30 disabled:pointer-events-none border border-gray-100 rounded-lg"
                  >
                    <ChevronsRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
      <FloatingContact />
    </div>
  );
}
