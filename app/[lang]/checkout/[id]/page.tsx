"use client";

import { useState, useEffect, use, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import { ChevronLeft, CalendarDays, CheckCircle2, ShieldCheck, Clock, CreditCard, Landmark } from "lucide-react";
import TransferManual, { ID_FORM_BUKTI, type BuktiTransfer, type RekeningLsp } from "@/components/checkout/TransferManual";
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
  /** Metode yang diaktifkan admin di CMS (Pengaturan Pembayaran). */
  metode: { doku: boolean; manual: boolean };
  rekening: RekeningLsp[];
  bukti_terakhir: BuktiTransfer | null;
  unggah: { mimes: string[]; maks_kb: number };
}

type Metode = "doku" | "manual";

interface CheckoutResponse {
  data: CheckoutDetail;
}

// Response dari BE untuk endpoint /checkout/{kode}/pay (DOKU)
interface DokuPaymentResponse {
  payment_url: string;
}

/**
 * Logo metode yang diterima — HANYA informasi. Metode dipilih asesi di halaman pembayaran DOKU Checkout
 * (BE tidak membatasi payment_method_types); metode yang dipakai tercatat dari webhook DOKU.
 */
const METODE_DITERIMA: { label: string; logo: string }[] = [
  { label: "QRIS", logo: "/images/payment/qris.png" },
  { label: "DANA", logo: "/images/payment/dana.png" },
  { label: "OVO", logo: "/images/payment/ovo.png" },
  { label: "ShopeePay", logo: "/images/payment/shopeepay.png" },
  { label: "Alfamart", logo: "/images/payment/alfamart.png" },
  { label: "Indomaret", logo: "/images/payment/indomaret.png" },
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
  const [processing, setProcessing] = useState(false);
  const [metode, setMetode] = useState<Metode>("doku");
  const [prosesManual, setProsesManual] = useState(false);

  // Load dictionary (i18n)
  useEffect(() => {
    getDictionary(lang)
      .then((data: any) => setDict(data))
      .catch((err) => {
        console.error("Gagal load dictionary:", err);
        setDict({}); // fallback biar tidak stuck loading kalau dictionary gagal
      });
  }, [lang]);

  const muatDetail = useCallback(async () => {
    if (!API_BASE_URL || !token) {
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
      const data = json.data ?? null;
      setDetail(data);
      if (data) {
        // Bukti ditolak -> langsung ke transfer manual untuk unggah ulang; selain itu metode pertama yang aktif.
        setMetode(
          data.bukti_terakhir?.status === "ditolak" && data.metode.manual
            ? "manual"
            : data.metode.doku
              ? "doku"
              : "manual",
        );
      }
    } catch (error) {
      console.error("Error fetching checkout detail:", error);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [kodePendaftaran, token]);

  useEffect(() => {
    if (kodePendaftaran) muatDetail();
  }, [kodePendaftaran, muatDetail]);

  const notifikasi = (judul: string, pesan: string, galat = false) =>
    toast({
      variant: galat ? "destructive" : "default",
      title: judul,
      description: <span className={galat ? "text-white font-bold" : ""}>{pesan}</span>,
    });

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

    if (!API_BASE_URL) return;

    try {
      setProcessing(true);
      const res = await fetch(
        `${API_BASE_URL}/checkout/${kodePendaftaran}/pay`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      let json: Partial<DokuPaymentResponse> & { message?: string } = {};
      try {
        json = await res.json();
      } catch {}

      if (!res.ok || !json.payment_url) {
        // Pesan dari BE, mis. "Layanan pembayaran sedang tidak dapat dihubungi..." (503).
        throw new Error(json.message || "Gagal membuat link pembayaran");
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
  const menungguVerifikasi = detail.bukti_terakhir?.status === "menunggu";

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

            {menungguVerifikasi && detail.bukti_terakhir ? (
              <div className="mt-4">
                <div className="flex items-start gap-3 rounded-xl border border-[#F2A93B]/40 bg-[#F2A93B]/10 p-4">
                  <Clock className="text-[#F2A93B] shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">Bukti transfer sedang diverifikasi admin</p>
                    <p className="mt-1">
                      Kami akan mengabari Anda melalui email dan halaman profil setelah pembayaran diverifikasi.
                    </p>
                  </div>
                </div>
                <dl className="mt-5 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Rekening Tujuan</dt>
                    <dd className="text-right text-gray-900">
                      {detail.bukti_terakhir.rekening_tujuan.nama_bank} · {detail.bukti_terakhir.rekening_tujuan.nomor_rekening}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Pengirim</dt>
                    <dd className="text-right text-gray-900">
                      {detail.bukti_terakhir.nama_pengirim} ({detail.bukti_terakhir.bank_pengirim})
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Jumlah Ditransfer</dt>
                    <dd className="text-right text-gray-900">{formatRupiah(detail.bukti_terakhir.jumlah_transfer)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Dikirim</dt>
                    <dd className="text-right text-gray-900">{formatDate(detail.bukti_terakhir.dikirim_at, lang)}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <>
                {detail.metode.doku && detail.metode.manual ? (
                  <div className="grid grid-cols-2 gap-3 my-5">
                    {(
                      [
                        { id: "doku", label: "Bayar Online", ket: "VA, e-wallet, QRIS", ikon: CreditCard },
                        { id: "manual", label: "Transfer Manual", ket: "Transfer & unggah bukti", ikon: Landmark },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMetode(m.id)}
                        className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                          metode === m.id ? "border-[#82B124] bg-[#82B124]/5" : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <m.ikon size={20} className={metode === m.id ? "text-[#82B124]" : "text-gray-400"} />
                        <span>
                          <span className="block text-sm font-semibold text-gray-900">{m.label}</span>
                          <span className="block text-xs text-gray-400">{m.ket}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mb-6">
                    {detail.metode.doku ? "Pembayaran diproses melalui DOKU" : "Pembayaran melalui transfer bank"}
                  </p>
                )}

                {metode === "doku" && detail.metode.doku && (
                  <>
                    <ol className="space-y-3 text-sm text-gray-600 mb-6 list-decimal list-inside">
                      <li>
                        Klik <span className="font-semibold text-gray-900">Bayar Sekarang</span>.
                      </li>
                      <li>Anda akan diarahkan ke halaman pembayaran DOKU.</li>
                      <li>Pilih metode pembayaran dan selesaikan pembayaran di sana.</li>
                      <li>Status pendaftaran diperbarui otomatis setelah pembayaran berhasil.</li>
                    </ol>

                    <p className="text-xs font-medium text-gray-500 mb-3">Metode pembayaran yang tersedia, antara lain:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {METODE_DITERIMA.map((m) => (
                        <div
                          key={m.label}
                          className="flex items-center justify-center rounded-xl border border-gray-100 px-3 py-3"
                        >
                          <div className="relative w-full h-6">
                            <Image src={m.logo} alt={m.label} fill className="object-contain" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="flex items-center gap-2 text-xs text-gray-400 mt-6">
                      <ShieldCheck size={16} className="text-[#82B124] shrink-0" />
                      Transaksi aman dan terenkripsi oleh DOKU.
                    </p>
                  </>
                )}

                {metode === "manual" && detail.metode.manual && token && (
                  <TransferManual
                    kodePendaftaran={kodePendaftaran}
                    token={token}
                    jumlah={detail.jumlah}
                    rekening={detail.rekening}
                    buktiDitolak={detail.bukti_terakhir?.status === "ditolak" ? detail.bukti_terakhir : null}
                    unggah={detail.unggah}
                    onProses={setProsesManual}
                    onTerkirim={(pesan) => {
                      notifikasi("Terkirim", pesan);
                      muatDetail();
                    }}
                    onGalat={(pesan) => notifikasi("Gagal", pesan, true)}
                  />
                )}

                {!detail.metode.doku && !detail.metode.manual && (
                  <p className="text-sm text-gray-500">
                    Pembayaran sedang tidak tersedia. Silakan hubungi admin LSP.
                  </p>
                )}
              </>
            )}
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
              {!menungguVerifikasi && metode === "doku" && detail.metode.doku && (
                <Button
                  type="button"
                  onClick={handleBayarSekarang}
                  disabled={processing}
                  className="flex-1 bg-[#82B124] hover:bg-[#729c1f] text-white py-6 rounded-xl font-bold disabled:opacity-60"
                >
                  {processing ? "Memproses..." : "Bayar Sekarang"}
                </Button>
              )}
              {!menungguVerifikasi && metode === "manual" && detail.metode.manual && (
                <Button
                  type="submit"
                  form={ID_FORM_BUKTI}
                  disabled={prosesManual}
                  className="flex-1 bg-[#82B124] hover:bg-[#729c1f] text-white py-6 rounded-xl font-bold disabled:opacity-60"
                >
                  {prosesManual ? "Mengirim..." : "Kirim Bukti Transfer"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
