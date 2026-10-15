"use client";
import { useState, useEffect, use } from "react";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/navigation";
import FloatingContact from "@/components/FloatingContact";
import SertifikasiCard from "@/components/SertifikasiCard";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { getDictionary } from "../../dictionaries";

interface SkemaSertifikasiProps {
  params: Promise<{ lang: "id" | "en" }>;
}

interface LangField {
  id: string;
  en: string;
}

interface CategoryItem {
  id: number;
  kategori: LangField;
  slug: string;
}

interface SchemeItem {
  id: number;
  category_skema_id: string;
  title: LangField;
  slug: string;
  summary: LangField;
  image: string;
  amount: string;
  is_view: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface MetaPagination {
  current_page: number;
  last_page: number;
  links: PaginationLink[];
  total: number;
}

function SkemaSertifikasiContent({ dict, lang }: { dict: any; lang: any }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = process.env.NEXT_PUBLIC_API_TOKEN;

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [meta, setMeta] = useState<MetaPagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [sortBy, setSortBy] = useState<string>("terbaru");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${baseUrl}/sertifikasi/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (response.ok) {
          const result = await response.json();
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [baseUrl, token]);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        let url = `${baseUrl}/sertifikasi?page=${currentPage}&limit=9`;

        if (debouncedSearch) {
          url += `&search=${encodeURIComponent(debouncedSearch)}`;
        } else {
          url += `&search=`;
        }

        if (selectedCategories.length > 0) {
          url += `&category=${selectedCategories[0]}`;
        }

        if (sortBy) {
          url += `&sort=${sortBy}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          setSchemes(result.data || []);
          setMeta(result.meta || null);
        }
      } catch (error) {
        console.error("Error fetching schemes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [
    baseUrl,
    token,
    currentPage,
    debouncedSearch,
    selectedCategories,
    sortBy,
  ]);
  const handleCategoryChange = (categoryId: number) => {
    setCurrentPage(1);
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? [] : [categoryId],
    );
  };

  const formatRupiah = (amountStr: string) => {
    const num = parseFloat(amountStr);
    if (isNaN(num)) return "Rp 0,00";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <HeroSection
        page={dict.certification.schemes.title}
        description={dict.certification.schemes.subtitle}
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          <div className="flex justify-center mb-16">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`${dict.certification.schemes.searchPlaceholder || "Search Certification..."}`}
                className="w-full pl-12 pr-6 py-4 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#78B51A]/20 focus:border-[#78B51A] transition-all"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="w-full lg:w-64 space-y-10">
              <div className="border-r border-gray-100 pr-6">
                <h3 className="font-bold text-gray-800 mb-6">
                  {dict.certification.schemes.sortBy}
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      label: dict.certification.schemes.newest,
                      key: "terbaru",
                    },
                    {
                      label: dict.certification.schemes.oldest,
                      key: "terlama",
                    },
                    {
                      label: dict.certification.schemes.mostViewed,
                      key: "terbanyak",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={sortBy === item.key}
                        onChange={() => {
                          setCurrentPage(1);
                          setSortBy(item.key);
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-[#78B51A] focus:ring-[#78B51A]"
                      />
                      <span
                        className={`transition-colors ${sortBy === item.key ? "text-[#78B51A] font-semibold" : "text-gray-600 group-hover:text-[#78B51A]"}`}
                      >
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-r border-gray-100 pr-6">
                <h3 className="font-bold text-gray-800 mb-6">
                  {dict.certification.schemes.category}
                </h3>
                <div className="space-y-4">
                  {categories.map((cat) => {
                    const categoryName =
                      lang === "en" ? cat.kategori.en : cat.kategori.id;
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => handleCategoryChange(cat.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#78B51A] focus:ring-[#78B51A]"
                        />
                        <span
                          className={`transition-colors ${selectedCategories.includes(cat.id) ? "text-[#78B51A] font-semibold" : "text-gray-600 group-hover:text-[#78B51A]"}`}
                        >
                          {categoryName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="h-80 w-full bg-gray-100 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : schemes.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  Tidak ada skema sertifikasi yang ditemukan.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {schemes.map((item) => {
                    const adaptedData = {
                      id: item.id,
                      title: lang === "en" ? item.title.en : item.title.id,
                      description:
                        lang === "en" ? item.summary.en : item.summary.id,
                      price: formatRupiah(item.amount),
                      image: item.image,
                      slug: item.slug,
                      lang: lang,
                    };

                    return <SertifikasiCard key={item.id} data={adaptedData} />;
                  })}
                </div>
              )}

              {meta && meta.last_page > 1 && (
                <div className="mt-16 flex justify-center items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    className="p-2 text-gray-400 hover:text-[#78B51A] disabled:opacity-30 border border-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronsLeft size={20} />
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="p-2 text-gray-400 hover:text-[#78B51A] disabled:opacity-30 border border-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {Array.from({ length: meta.last_page }, (_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                          pageNum === currentPage
                            ? "bg-[#78B51A] text-white"
                            : "text-gray-500 border border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage === meta.last_page}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, meta.last_page),
                      )
                    }
                    className="p-2 text-gray-400 hover:text-[#78B51A] disabled:opacity-30 border border-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button
                    disabled={currentPage === meta.last_page}
                    onClick={() => setCurrentPage(meta.last_page)}
                    className="p-2 text-gray-400 hover:text-[#78B51A] disabled:opacity-30 border border-gray-100 rounded-lg transition-colors"
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

export default function SkemaSertifikasi({ params }: SkemaSertifikasiProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  if (!dict) return null;

  return <SkemaSertifikasiContent dict={dict} lang={lang} />;
}
