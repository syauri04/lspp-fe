"use client";
import { useState, useEffect, use } from "react";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navigation from "@/components/navigation";
import FloatingContact from "@/components/FloatingContact";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary } from "../../dictionaries";

interface VerifikasiSertifikatProps {
  params: Promise<{ lang: "id" | "en" }>;
}

function VerifikasiSertifikatContent({
  dict,
  lang,
}: {
  dict: any;
  lang: string;
}) {
  const [isVerified, setIsVerified] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <HeroSection
        page={dict.certification.verify.title}
        description={dict.certification.verify.subtitle}
      />

      <section className="py-20 bg-[#F9FBF8]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-gray-100 mb-8">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                {dict.certification.verify.certificateNumber}
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder={dict.certification.verify.numberPlaceholder}
                  className="flex-1 px-6 py-4 rounded-xl border border-gray-100 bg-[#F9FBF8] focus:outline-none focus:ring-2 focus:ring-[#82B124]/20 focus:border-[#82B124] transition-all text-gray-600 placeholder:text-gray-300"
                />
                <Button className="bg-[#C7E598] hover:bg-[#b8d985] text-[#4F6A24] font-bold px-10 py-7 rounded-xl shadow-sm transition-all active:scale-95">
                  {dict.certification.verify.verifyBtn}
                </Button>
              </div>
            </div>
          </div>

          {isVerified && (
            <div className="bg-white rounded-[1rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-[#F9FBF8] px-8 py-4 border-b border-gray-50 flex items-center gap-3">
                <CheckCircle2 className="text-[#82B124] h-5 w-5" />
                <span className="text-[#82B124] font-bold text-sm">
                  {dict.certification.verify.validResult}
                </span>
              </div>

              <div className="p-8 md:p-12">
                <div className="mb-10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">
                    {dict.certification.verify.holderName}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 border-b border-gray-100 pb-8">
                    Ahmad Fauzi Ramadhan
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-2">
                      {dict.certification.verify.schemeLabel}
                    </p>
                    <p className="font-bold text-gray-800">
                      Front Office — Hotel Bintang 4 dan 5
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-2">
                      {dict.certification.verify.tukLabel}
                    </p>
                    <p className="font-bold text-gray-800">
                      TUK Mandiri — Jakarta Selatan
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-2">
                      {dict.certification.verify.issuedDate}
                    </p>
                    <p className="font-bold text-gray-800">14 Maret 2024</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-2">
                      {dict.certification.verify.validUntil}
                    </p>
                    <p className="font-bold text-gray-800">14 Maret 2027</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-2">
                      {dict.certification.verify.bnspNumber}
                    </p>
                    <p className="font-bold text-gray-800">
                      MET.306.2024.001234
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-2">
                      {dict.certification.verify.status}
                    </p>
                    <span className="inline-block px-4 py-1 rounded-full bg-[#C7E598] text-[#4F6A24] font-bold text-[11px]">
                      {dict.certification.verify.active}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer lang={lang} />
      <FloatingContact />
    </div>
  );
}

export default function VerifikasiSertifikat({
  params,
}: VerifikasiSertifikatProps) {
  const { lang } = use(params);
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  if (!dict) return null;

  return <VerifikasiSertifikatContent dict={dict} lang={lang} />;
}
