"use client";

import { useState, useEffect, use } from "react";
import FloatingContact from "@/components/FloatingContact";
import Footer from "@/components/Footer";
import Navigation from "@/components/navigation";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { getDictionary } from "../dictionaries";

interface KalenderPageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

interface CalendarTitle {
  id: string;
  en: string;
}

interface CalendarEvent {
  id: number;
  date: string;
  title: CalendarTitle;
  link: string;
}

export default function KalenderSection({ params }: KalenderPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const [dict, setDict] = useState<any>(null);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(
    currentDate.getMonth() + 1,
  );
  const [currentYear, setCurrentYear] = useState<number>(
    currentDate.getFullYear(),
  );

  const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);
  const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);

  useEffect(() => {
    getDictionary(lang).then((data) => {
      setDict(data);
    });
  }, [lang]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = process.env.NEXT_PUBLIC_API_TOKEN;
      const formattedMonth = String(currentMonth).padStart(2, "0");

      try {
        const response = await fetch(
          `${baseUrl}/calendars?month=${formattedMonth}&year=${currentYear}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch calendar data");

        const result = await response.json();
        setEvents(result.data || []);
      } catch (error) {
        console.error("Error loading calendar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const getMonthName = (monthNum: number, locale: string) => {
    const date = new Date(currentYear, monthNum - 1, 1);
    return date.toLocaleString(locale === "id" ? "id-ID" : "en-US", {
      month: "long",
    });
  };

  const monthsList = Array.from({ length: 12 }, (_, i) => i + 1);
  const yearsList = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  if (!dict) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-6 mb-12">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>

              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-4 relative">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowMonthDropdown(!showMonthDropdown);
                    setShowYearDropdown(false);
                  }}
                  className="flex items-center gap-2 group cursor-pointer text-left"
                >
                  <h2 className="text-3xl font-bold text-gray-800 select-none">
                    {getMonthName(currentMonth, lang)}
                  </h2>
                  <ChevronDown
                    className={`h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${showMonthDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showMonthDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto">
                    {monthsList.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setCurrentMonth(m);
                          setShowMonthDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                          m === currentMonth
                            ? "bg-[#78B51A] text-white font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {getMonthName(m, lang)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowYearDropdown(!showYearDropdown);
                    setShowMonthDropdown(false);
                  }}
                  className="flex items-center gap-2 group cursor-pointer text-left"
                >
                  <h2 className="text-3xl font-bold text-gray-800 select-none">
                    {currentYear}
                  </h2>
                  <ChevronDown
                    className={`h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${showYearDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showYearDropdown && (
                  <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto">
                    {yearsList.map((y) => (
                      <button
                        key={y}
                        onClick={() => {
                          setCurrentYear(y);
                          setShowYearDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                          y === currentYear
                            ? "bg-[#78B51A] text-white font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="flex items-center gap-8 animate-pulse"
                  >
                    <div className="w-[50px] h-12 bg-gray-200 rounded" />
                    <div className="flex-1 h-20 bg-gray-100 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <p className="text-gray-400 font-medium">
                  Tidak ada agenda kegiatan pada bulan ini.
                </p>
              </div>
            ) : (
              events.map((item) => {
                const eventDate = new Date(item.date);
                const tanggal = eventDate.getDate().toString();
                const hari = eventDate.toLocaleString(
                  lang === "id" ? "id-ID" : "en-US",
                  { weekday: "short" },
                );

                return (
                  <div key={item.id} className="flex items-center gap-8 group">
                    <div className="flex flex-col items-center justify-center min-w-[50px]">
                      <span className="text-2xl font-bold text-[#78B51A]">
                        {tanggal}
                      </span>
                      <span className="text-lg font-medium text-[#78B51A] leading-none">
                        {hari}
                      </span>
                    </div>

                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-white border border-gray-50 rounded-2xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-300 block text-left"
                    >
                      <h3 className="text-xl font-bold text-gray-700 group-hover:text-[#78B51A] transition-colors">
                        {lang === "en" ? item.title.en : item.title.id}
                      </h3>
                    </a>
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
