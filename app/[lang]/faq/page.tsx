"use client";

import { useState, useEffect, use } from "react";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/navigation";
import FloatingContact from "@/components/FloatingContact";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDictionary } from "../dictionaries";

interface FaqPageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

interface FaqLanguageField {
  id: string;
  en: string;
}

interface FaqItem {
  id: number;
  title: FaqLanguageField;
  content: FaqLanguageField;
}

export default function Faq({ params }: FaqPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const [dict, setDict] = useState<any>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getDictionary(lang).then((data) => {
      setDict(data);
    });
  }, [lang]);

  useEffect(() => {
    const fetchFaqData = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = process.env.NEXT_PUBLIC_API_TOKEN;

      try {
        const response = await fetch(`${baseUrl}/faqs`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data FAQ");

        const result = await response.json();
        setFaqs(result.data || []);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqData();
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!dict) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <section className="py-24 bg-gray-50/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-20 w-full bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : faqs.length === 0 ? (
              <p className="text-center text-gray-400">
                Belum ada data FAQ tersedia.
              </p>
            ) : (
              faqs.map((item, index) => {
                const questionText =
                  lang === "en" ? item.title.en : item.title.id;
                const answerHtml =
                  lang === "en" ? item.content.en : item.content.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleAccordion(index)}
                    className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden cursor-pointer hover:bg-gray-50/30 transition-colors"
                  >
                    <div className="w-full flex items-center justify-between p-6 md:p-8 text-left">
                      <span className="text-gray-800 font-semibold text-lg md:text-xl pr-8 leading-relaxed select-none">
                        {questionText}
                      </span>
                      <div className="shrink-0 text-gray-900">
                        {openIndex === index ? (
                          <ChevronUp size={28} />
                        ) : (
                          <ChevronDown size={28} />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          {/* e.stopPropagation() dipasang agar klik di dalam teks jawaban tidak memicu penutupan paksa accordion */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="px-6 md:px-8 pb-8 text-gray-500 leading-relaxed text-base md:text-lg border-t border-gray-50 pt-4 prose max-w-none cursor-default"
                            dangerouslySetInnerHTML={{ __html: answerHtml }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <Footer lang={lang} />
      <FloatingContact />
    </div>
  );
}
