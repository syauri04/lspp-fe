"use client";

import { useState, useEffect, use } from "react";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FloatingContact from "@/components/FloatingContact";
import { getDictionary } from "../../dictionaries";
import Navigation from "@/components/navigation";

interface AlurSertifikasiProps {
  params: Promise<{ lang: "id" | "en" }>;
}

function AlurSertifikasiContent({ dict, lang }: { dict: any; lang: string }) {
  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <HeroSection
        page={dict.certification.flow.title}
        description={dict.certification.flow.subtitle}
      />

      <section className="py-20 bg-[#F9FBF8]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-8">
            {dict.certification.flow.steps.map((item: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-3xl border border-[#9C9C9C] shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1"
              >
                <div className="px-8 py-6 flex items-center gap-6 border-b border-[#9C9C9C]">
                  <div className="w-12 h-12 rounded-full bg-[#E8F3D7]  flex items-center justify-center font-bold text-lg shrink-0">
                    {index + 1}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-[#515151]">
                    {item.title}
                  </h3>
                </div>

                <div className="px-8 py-6 bg-white">
                  <p className="text-gray-500 leading-relaxed md:text-lg">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer lang={lang} />
      <FloatingContact />
    </div>
  );
}

export default function AlurSertifikasi({ params }: AlurSertifikasiProps) {
  const { lang } = use(params);
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  if (!dict) return null;

  return <AlurSertifikasiContent dict={dict} lang={lang} />;
}
