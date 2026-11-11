"use client";
import { useState, useEffect, use } from "react";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/navigation";
import FloatingContact from "@/components/FloatingContact";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary } from "../../dictionaries";
import { verifikasiSertifikat, type HasilVerifikasi } from "@/service/sertifikat.service";
import type { SertifikatPublik } from "@/service/profil.service";

interface VerifikasiSertifikatProps {
  params: Promise<{ lang: "id" | "en" }>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-gray-400 mb-1.5">{label}</p>
      <div className="font-bold text-gray-800 break-words">{children}</div>
    </div>
  );
}

function HasilSertifikat({ data, t, lang }: { data: SertifikatPublik; t: any; lang: string }) {
  const [lihatUnit, setLihatUnit] = useState(false);
  const berlaku = data.status === "berlaku";
  const judul = data.skema.judul?.[lang] || data.skema.judul?.id || "-";

  return (
    <div className="bg-white rounded-[1rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className={`px-8 py-4 border-b border-gray-50 flex items-center gap-3 ${berlaku ? "bg-[#F9FBF8]" : "bg-red-50"}`}>
        {berlaku ? <CheckCircle2 className="text-[#82B124] h-5 w-5" /> : <XCircle className="text-red-500 h-5 w-5" />}
        <span className={`font-bold text-sm ${berlaku ? "text-[#82B124]" : "text-red-600"}`}>
          {berlaku ? t.validResult : t.invalidResult}
        </span>
      </div>

      <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-16">
        <div className="space-y-8">
          <Baris label={t.name}>{data.nama}</Baris>
          <Baris label={t.blankoNumber}>{data.no_blanko}</Baris>
          <Baris label={t.certNumber}>{data.no_sertifikat}</Baris>
          <Baris label={t.scheme}>
            {judul}
            {data.unit_kompetensi.length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setLihatUnit((v) => !v)}
                  aria-expanded={lihatUnit}
                  className="inline-flex items-center px-4 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {lihatUnit ? t.hideUnits : t.viewUnits}
                </button>
              </div>
            )}
          </Baris>
        </div>
        <div className="space-y-8">
          <Baris label={t.validityPeriod}>
            {data.tanggal_aktif} {t.until} {data.tanggal_expired}
            <div>
              ({data.masa_berlaku_tahun} {t.years})
            </div>
          </Baris>
          <Baris label={t.certStatus}>
            <span className={berlaku ? "text-[#2E9E4F]" : "text-red-600"}>{berlaku ? t.statusValid : t.statusInvalid}</span>
          </Baris>
        </div>
      </div>

      {lihatUnit && (
        <div className="px-8 md:px-12 pb-10 -mt-2">
          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FBF8] text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 w-12">No</th>
                  <th className="text-left px-4 py-3 w-48">{t.unitCode}</th>
                  <th className="text-left px-4 py-3">{t.unitTitle}</th>
                </tr>
              </thead>
              <tbody>
                {data.unit_kompetensi.map((u, i) => (
                  <tr key={`${u.kode_unit}-${i}`} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{u.kode_unit ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-800">{u.judul_unit ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function VerifikasiSertifikatContent({ dict, lang }: { dict: any; lang: "id" | "en" }) {
  const t = dict.certification.verify;
  const [nomor, setNomor] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [hasil, setHasil] = useState<HasilVerifikasi | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const cari = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomor.trim()) {
      setGalat(t.required);
      setHasil(null);
      return;
    }
    setMemuat(true);
    setGalat(null);
    const res = await verifikasiSertifikat(nomor);
    setMemuat(false);
    if (res.jenis === "ditemukan") {
      setHasil(res);
    } else {
      setHasil(null);
      setGalat(res.jenis === "tidak_ditemukan" ? t.notFound : res.jenis === "terlalu_banyak" ? t.tooMany : t.failed);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <HeroSection page={t.title} description={t.subtitle} />

      <section className="py-20 bg-[#F9FBF8]">
        <div className="max-w-4xl mx-auto px-6">
          <form
            onSubmit={cari}
            className="bg-white p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-gray-100 mb-8"
          >
            <div className="space-y-4">
              <label htmlFor="nomor-sertifikat" className="text-sm font-semibold text-gray-700 ml-1">
                {t.certificateNumber}
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  id="nomor-sertifikat"
                  type="text"
                  value={nomor}
                  onChange={(e) => setNomor(e.target.value)}
                  maxLength={100}
                  autoComplete="off"
                  placeholder={t.numberPlaceholder}
                  className="flex-1 px-6 py-4 rounded-xl border border-gray-100 bg-[#F9FBF8] focus:outline-none focus:ring-2 focus:ring-[#82B124]/20 focus:border-[#82B124] transition-all text-gray-600 placeholder:text-gray-300"
                />
                <Button
                  type="submit"
                  disabled={memuat}
                  className="bg-[#C7E598] hover:bg-[#b8d985] text-[#4F6A24] font-bold px-10 py-7 rounded-xl shadow-sm transition-all active:scale-95"
                >
                  {memuat ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> {t.searching}
                    </>
                  ) : (
                    t.verifyBtn
                  )}
                </Button>
              </div>
            </div>
          </form>

          {galat && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{galat}</span>
            </div>
          )}

          {hasil?.jenis === "ditemukan" && <HasilSertifikat key={hasil.data.no_sertifikat} data={hasil.data} t={t} lang={lang} />}
        </div>
      </section>

      <Footer lang={lang} />
      <FloatingContact />
    </div>
  );
}

export default function VerifikasiSertifikat({ params }: VerifikasiSertifikatProps) {
  const { lang } = use(params);
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  if (!dict) return null;

  return <VerifikasiSertifikatContent dict={dict} lang={lang} />;
}
