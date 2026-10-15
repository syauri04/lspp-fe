"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import { ChevronLeft, CalendarDays, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

interface CheckoutPageProps {
  params: Promise<{ lang: "id" | "en"; id: string }>;
}

interface LangField {
  id: string;
  en: string;
}

interface CheckoutDetail {
  kode_pendaftaran: string;
  skema: {
    id: number;
    title: LangField;
    image: string;
  };
  jumlah: string; // angka dalam bentuk string, mis. "3000000.00"
  kode_transaksi: string;
  batas_bayar: string | null;
}

interface CheckoutResponse {
  data: CheckoutDetail;
}

// Response dari BE untuk endpoint /checkout/{kode}/pay (DOKU)
interface DokuPaymentResponse {
  payment_url: string;
}

type PaymentMethodKey =
  | "alfamart"
  | "indomaret"
  | "dana"
  | "ovo"
  | "shopeepay"
  | "qris";

const PAYMENT_METHODS: {
  key: PaymentMethodKey;
  label: string;
  logo: string;
}[] = [
  { key: "alfamart", label: "Alfamart", logo: "/images/payment/alfamart.png" },
  {
    key: "indomaret",
    label: "Indomaret",
    logo: "/images/payment/indomaret.png",
  },
  { key: "dana", label: "DANA", logo: "/images/payment/dana.png" },
  { key: "ovo", label: "OVO", logo: "/images/payment/ovo.png" },
  {
    key: "shopeepay",
    label: "ShopeePay",
    logo: "/images/payment/shopeepay.png",
  },
  { key: "qris", label: "QRIS", logo: "/images/payment/qris.png" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function formatRupiah(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return `Rp ${num.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string | null, lang: "id" | "en"): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString(
      lang === "id" ? "id-ID" : "en-US",
      { day: "numeric", month: "long", year: "numeric" },
    );
  } catch {
    return dateStr;
  }
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const kodePendaftaran = resolvedParams.id;

  const { token } = useAuth();
  const { toast } = useToast();

  const [dict, setDict] = useState<any>(null);
  const [detail, setDetail] = useState<CheckoutDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);

  // Load dictionary (i18n)
  useEffect(() => {
    getDictionary(lang)
      .then((data: any) => setDict(data))
      .catch((err) => {
        console.error("Gagal load dictionary:", err);
        setDict({}); // fallback biar tidak stuck loading kalau dictionary gagal
      });
  }, [lang]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!API_BASE_URL) {
        setLoading(false);
        return;
      }

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/checkout/${kodePendaftaran}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Gagal mengambil data checkout");

        const json: CheckoutResponse = await res.json();
        setDetail(json.data ?? null);
      } catch (error) {
        console.error("Error fetching checkout detail:", error);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };

    if (kodePendaftaran) fetchDetail();
  }, [kodePendaftaran, token]);

  const handleBayarSekarang = async () => {
    if (!token) {
      toast({
        variant: "destructive",
        title: lang === "id" ? "Belum Login" : "Not Logged In",
        description: (
          <span className="text-white font-bold">
            {lang === "id"
              ? "Anda harus login terlebih dahulu."
              : "Please log in first."}
          </span>
        ),
      });
      return;
    }

    if (!selectedMethod) {
      toast({
        variant: "destructive",
        title:
          lang === "id" ? "Pilih Metode Pembayaran" : "Select Payment Method",
        description: (
          <span className="text-white font-bold">
            {lang === "id"
              ? "Silahkan pilih metode pembayaran terlebih dahulu."
              : "Please select a payment method first."}
          </span>
        ),
      });
      return;
    }

    if (!API_BASE_URL) return;

    try {
      setProcessing(true);
      const res = await fetch(
        `${API_BASE_URL}/checkout/${kodePendaftaran}/pay`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ metode_pembayaran: selectedMethod }),
        },
      );

      const json: DokuPaymentResponse = await res.json();

      if (!res.ok || !json.payment_url) {
        throw new Error("Gagal membuat link pembayaran");
      }

      // DOKU hosted payment page: WAJIB full redirect, bukan popup.
      // Status pembayaran akan di-update BE lewat webhook DOKU,
      // bukan dari parameter redirect balik ini.
      window.location.href = json.payment_url;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: lang === "id" ? "Gagal" : "Failed",
        description: (
          <span className="text-white font-bold">
            {error.message ||
              (lang === "id" ? "Terjadi kesalahan." : "Something went wrong.")}
          </span>
        ),
      });
      setProcessing(false);
    }
    // Catatan: setProcessing(false) sengaja TIDAK dipanggil di jalur sukses,
    // karena browser akan langsung redirect keluar dari halaman ini.
  };

  function extractDateFromKodeTransaksi(kodeTransaksi: string): string | null {
    const match = kodeTransaksi.match(/(\d{10})$/);
    if (!match) return null;
    const timestamp = parseInt(match[1], 10) * 1000;
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (!dict || loading) {
    return (
      <div className="min-h-screen bg-[#78B51A] flex items-center justify-center">
        <p className="text-white font-medium animate-pulse">
          Memuat informasi...
        </p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#78B51A] flex items-center justify-center flex-col gap-4">
        <p className="text-white font-bold text-xl">
          Data Checkout Tidak Ditemukan
        </p>
        <Link href={`/${lang}`} className="text-white underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const titleText =
    lang === "en" ? detail.skema.title.en : detail.skema.title.id;

  return (
    <div className="min-h-screen bg-[#78B51A]">
      <Navigation lang={lang} dict={dict} />

      <main className="max-w-5xl mx-auto px-6 md:px-16 py-8 mb-24">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1 text-white font-medium mb-8 hover:opacity-80 transition-opacity"
        >
          <ChevronLeft size={18} />
          Kembali
        </button>

        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-full px-6 py-3 flex items-center gap-3 shadow-lg max-w-full">
            <p className="text-sm md:text-base text-gray-700 text-center">
              Pengajuanmu untuk{" "}
              <span className="font-semibold text-gray-900">{titleText}</span>{" "}
              telah disetujui!
            </p>
            <CheckCircle2 className="text-green-500 shrink-0" size={20} />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl p-4 md:p-5 flex items-center gap-5 mb-14">
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
            {/* <Image
              src={detail.skema.image}
              alt={titleText}
              fill
              className="object-cover"
            /> */}
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-snug">
              {titleText}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
              <CalendarDays size={16} />
              {(() => {
                const dateStr = extractDateFromKodeTransaksi(
                  detail.kode_transaksi,
                );
                return dateStr
                  ? formatDate(dateStr, lang)
                  : `Kode Transaksi: ${detail.kode_transaksi}`;
              })()}
            </div>
          </div>
        </div>

        <p className="text-center text-white text-sm md:text-base mb-8">
          {detail.batas_bayar ? (
            <>
              Untuk Melanjutkan proses, selesaikan Pembayaran sebelum tanggal{" "}
              <span className="font-bold">
                {formatDate(detail.batas_bayar, lang)}
              </span>
            </>
          ) : (
            "Segera selesaikan pembayaran Anda."
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Checkout</h2>
            <p className="text-sm text-gray-400 mb-6">
              Silahkan pilih metode pembayaran
            </p>

            <div className="grid grid-cols-2 gap-4">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.key}
                  type="button"
                  onClick={() => setSelectedMethod(method.key)}
                  className={`flex items-center justify-center rounded-xl border-2 px-4 py-4 transition-all ${
                    selectedMethod === method.key
                      ? "border-[#82B124] bg-[#82B124]/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="relative w-full h-8">
                    <Image
                      src={method.logo}
                      alt={method.label}
                      fill
                      className="object-contain"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Ringkasan Pembayaran
            </h2>

            <div className="space-y-4 text-sm flex-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Kode Transaksi</span>
                <span className="font-medium text-gray-900">
                  : {detail.kode_transaksi}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Bayar Dengan</span>
                <span>
                  {selectedMethod ? (
                    <div className="relative w-16 h-6">
                      <Image
                        src={
                          PAYMENT_METHODS.find((m) => m.key === selectedMethod)!
                            .logo
                        }
                        alt={selectedMethod}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">
                      Belum dipilih
                    </span>
                  )}
                </span>
              </div>

              <hr className="my-2 border-gray-100" />

              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-900">
                  Total Pembayaran
                </span>
                <span className="font-bold text-gray-900">
                  : {formatRupiah(detail.jumlah)}
                </span>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 bg-[#F2A93B] hover:bg-[#d9932a] text-white py-6 rounded-xl font-bold"
              >
                Kembali
              </Button>
              <Button
                type="button"
                onClick={handleBayarSekarang}
                disabled={processing}
                className="flex-1 bg-[#82B124] hover:bg-[#729c1f] text-white py-6 rounded-xl font-bold disabled:opacity-60"
              >
                {processing ? "Memproses..." : "Bayar Sekarang"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
