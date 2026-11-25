"use client";

import { getDictionary } from "@/app/[lang]/dictionaries";
import { Instagram, Linkedin, Mail, MapPin, Youtube } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useKontak } from "@/service/kontak.service";

interface FooterProps {
  lang: "id" | "en";
}

const Footer = ({ lang }: FooterProps) => {
  const [dict, setDict] = useState<any>(null);
  // Alamat & email diatur di CMS (Content Website > Kontak Kami); sama dengan tombol WhatsApp.
  const kontak = useKontak();

  useEffect(() => {
    getDictionary(lang).then((data) => {
      setDict(data);
    });
  }, [lang]);

  if (!dict) {
    return <footer className="w-full h-20 bg-[#556E21]" />;
  }

  return (
    <footer className="relative w-full overflow-hidden text-white">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/about-bg.png"
          alt="Footer Background"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#556E21]/100 via-[#556E21]/90 to-[#556E21]/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 lg:px-24 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-8">
              {dict.footer?.contactUs || "Kontak Kami"}
            </h3>
            {kontak ? (
              <>
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 mt-1 flex-shrink-0" />
                  <p className="text-sm md:text-base leading-relaxed max-w-md whitespace-pre-line">
                    {kontak.alamat}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 flex-shrink-0" />
                  <a
                    href={`mailto:${kontak.email}`}
                    className="hover:underline text-sm md:text-base break-all"
                  >
                    {kontak.email}
                  </a>
                </div>
              </>
            ) : (
              // Placeholder selama kontak dimuat (menjaga tinggi footer tetap).
              <div className="space-y-6 animate-pulse" aria-hidden="true">
                <div className="h-16 max-w-md rounded bg-white/20" />
                <div className="h-6 w-56 rounded bg-white/20" />
              </div>
            )}
          </div>

          <div className="md:pl-20">
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
                >
                  <Instagram className="w-6 h-6" />
                  <span className="text-sm md:text-base">Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
                >
                  <Linkedin className="w-6 h-6" />
                  <span className="text-sm md:text-base">Linkedin</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
                >
                  <Youtube className="w-6 h-6" />
                  <span className="text-sm md:text-base">Youtube</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/30 pt-8 text-center">
          <p className="text-sm md:text-base opacity-80">
            ©2026 306 All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
