"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

interface DetailSertifikasiProps {
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

// Response dari BE untuk endpoint /pendaftaran-sertifikasi
interface PendaftaranResponse {
  message: string;
  data: {
    kode_pendaftaran: string;
    status: string;
  };
}

type FileFieldKey = "ktp" | "pas_foto" | "ijazah" | "cv" | "portfolio";

const FILE_FIELDS: { key: FileFieldKey; label: string; placeholder: string }[] =
  [
    {
      key: "ktp",
      label: "Unggah KTP Anda",
      placeholder: "KTP.pdf",
    },
    {
      key: "pas_foto",
      label: "Unggah Pas-Foto Anda",
      placeholder: "Pas_Foto.jpeg",
    },
    {
      key: "ijazah",
      label: "Unggah Ijazah Terakhir Anda",
      placeholder: "Ijazah_Terakhir.pdf",
    },
    {
      key: "cv",
      label: "Unggah CV Anda",
      placeholder: "CV.pdf",
    },
    {
      key: "portfolio",
      label: "Unggah Portofolio Anda",
      placeholder: "Portofolio.pdf",
    },
  ];

const EMPTY_FILES: Record<FileFieldKey, File | null> = {
  ktp: null,
  pas_foto: null,
  ijazah: null,
  cv: null,
  portfolio: null,
};

export default function DetailSertifikasi({ params }: DetailSertifikasiProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const slug = resolvedParams.slug;

  const router = useRouter();
  const { token } = useAuth();
  const { toast } = useToast();

  const [dict, setDict] = useState<any>(null);
  const [detail, setDetail] = useState<SchemeDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [files, setFiles] =
    useState<Record<FileFieldKey, File | null>>(EMPTY_FILES);

  const [formKey, setFormKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    getDictionary(lang).then((data: any) => {
      setDict(data);
    });
  }, [lang]);

  useEffect(() => {
    const fetchDetailData = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

      try {
        const response = await fetch(`${baseUrl}/sertifikasi/${slug}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil detail sertifikasi");

        const result = await response.json();

        setDetail(result.data || null);
      } catch (error) {
        console.error("Error fetching scheme detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDetailData();
    }
  }, [slug]);

  const handleFileChange = (key: FileFieldKey) => (file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!token) {
      const msg = "Anda harus login terlebih dahulu.";
      setSubmitError(msg);
      toast({
        variant: "destructive",
        title: lang === "id" ? "Belum Login" : "Not Logged In",
        description: <span className="text-white font-bold">{msg}</span>,
      });
      return;
    }

    if (!detail) return;

    const missing = FILE_FIELDS.filter((f) => !files[f.key]);
    if (missing.length > 0) {
      const msg = `Mohon lengkapi: ${missing.map((f) => f.label).join(", ")}`;
      setSubmitError(msg);
      toast({
        variant: "destructive",
        title: lang === "id" ? "Data Belum Lengkap" : "Incomplete Data",
        description: <span className="text-white font-bold">{msg}</span>,
      });
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const formData = new FormData();
    formData.append("skema_sertifikasi_id", String(detail.id));
    FILE_FIELDS.forEach((f) => {
      if (files[f.key]) {
        formData.append(f.key, files[f.key] as File);
      }
    });

    try {
      setSubmitting(true);
      const response = await fetch(`${baseUrl}/pendaftaran-sertifikasi`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const result: PendaftaranResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          (result as any)?.message || "Gagal mengirim pendaftaran",
        );
      }

      const kodePendaftaran = result?.data?.kode_pendaftaran;

      if (!kodePendaftaran) {
        throw new Error(
          "Pendaftaran berhasil namun kode pendaftaran tidak ditemukan.",
        );
      }

      router.push(`/${lang}/alert-page`);
    } catch (error: any) {
      console.error("Error submitting pendaftaran:", error);
      const msg = error.message || "Terjadi kesalahan saat mengirim data";
      setSubmitError(msg);
      toast({
        variant: "destructive",
        title: lang === "id" ? "Pendaftaran Gagal" : "Registration Failed",
        description: <span className="text-white font-bold">{msg}</span>,
      });
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="min-h-screen bg-[#78B51A] flex flex-center justify-center items-center flex-col gap-4">
        <p className="text-white font-bold text-xl">
          Skema Sertifikasi Tidak Ditemukan
        </p>
        <Link
          href={`/${lang}/sertifikasi/skema-sertifikasi`}
          className="text-white underline"
        >
          Kembali ke Daftar Skema
        </Link>
      </div>
    );
  }

  const titleText = lang === "en" ? detail.title.en : detail.title.id;
  const descriptionHtml =
    lang === "en" ? detail.description.en : detail.description.id;

  return (
    <div className="min-h-screen bg-[#78B51A]">
      <Navigation lang={lang} dict={dict} />

      <main className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-12 mb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link
              href={`/${lang}/sertifikasi/skema-sertifikasi`}
              className="hover:text-[#dcdcdc] text-white transition-colors"
            >
              Skema Sertifikasi
            </Link>
            <ChevronRight size={16} className="text-white" />
            <span className="font-medium truncate max-w-[250px] md:max-w-[400px] text-white">
              {titleText}
            </span>
          </nav>
        </div>

        <section className="flex flex-col lg:flex-row items-center gap-10 mb-16 mt-32">
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="relative aspect-video lg:aspect-square rounded-[2.5rem] overflow-hidden shadow-xl bg-white/10">
              <Image
                src={detail.image}
                alt={titleText}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1 space-y-4 w-full">
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {titleText}
            </h1>

            <div
              className="text-white text-base md:text-lg max-w-2xl leading-relaxed prose prose-invert"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        </section>

        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="flex justify-end mb-4">
            <span className="text-[10px] text-gray-400 italic">
              * Draft Tersimpan
            </span>
          </div>

          <form key={formKey} className="space-y-10" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {FILE_FIELDS.map((f) => (
                <FileUpload
                  key={f.key}
                  label={f.label}
                  placeholder={f.placeholder}
                  onFileChange={handleFileChange(f.key)}
                />
              ))}
            </div>

            {submitError && (
              <p className="text-red-500 text-sm font-medium">{submitError}</p>
            )}

            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#82B124] hover:bg-[#729c1f] text-white px-12 py-7 rounded-2xl font-bold text-lg shadow-lg shadow-[#82B124]/20 transition-all active:scale-95 disabled:opacity-60"
              >
                {submitting ? "Mengirim..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
