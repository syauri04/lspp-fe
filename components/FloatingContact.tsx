"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Mail, Phone, X } from "lucide-react";

const ADMIN = {
  nama: "Admin LSPP306",
  telepon: "+62 822-4962-8093",
  email: "support@lspp306.com",
  pesanAwal: "Halo Admin LSPP306, saya ingin bertanya tentang sertifikasi.",
};

// wa.me butuh nomor format internasional tanpa "+", spasi, atau tanda hubung.
const URL_WHATSAPP = `https://wa.me/${ADMIN.telepon.replace(/\D/g, "")}?text=${encodeURIComponent(ADMIN.pesanAwal)}`;

// Pilihan tutup/buka diingat per browser agar tidak muncul lagi di setiap halaman.
const KUNCI_PENYIMPANAN = "floating-contact-tertutup";

/**
 * Kontak admin (kanan bawah). Klik kartu -> WhatsApp. Tombol X -> ciutkan jadi ikon;
 * klik ikon -> kartu muncul lagi (klik kartu lagi baru ke WhatsApp).
 */
const FloatingContact = () => {
  const [tertutup, setTertutup] = useState(false);

  useEffect(() => {
    try {
      setTertutup(localStorage.getItem(KUNCI_PENYIMPANAN) === "1");
    } catch {}
  }, []);

  const ubahTertutup = (nilai: boolean) => {
    setTertutup(nilai);
    try {
      localStorage.setItem(KUNCI_PENYIMPANAN, nilai ? "1" : "0");
    } catch {}
  };

  const ikon = (
    <div className="relative w-10 h-10 md:w-14 md:h-14 bg-[#78B51A]/10 rounded-full flex items-center justify-center flex-shrink-0">
      <div className="relative w-6 h-6 md:w-10 md:h-10">
        <Image src="/images/technical-support.png" alt="Kontak Admin LSPP306" fill className="object-contain" />
      </div>
      <div className="absolute top-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
    </div>
  );

  if (tertutup) {
    return (
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999]">
        <button
          type="button"
          onClick={() => ubahTertutup(false)}
          aria-label="Tampilkan kontak admin"
          className="bg-white/95 backdrop-blur-sm border border-gray-100 p-2 md:p-2.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          {ikon}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999]">
      <div className="relative bg-white/95 backdrop-blur-sm border border-gray-100 rounded-full md:rounded-[2rem] shadow-xl transition-all duration-300 hover:scale-105 group">
        <a
          href={URL_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Hubungi ${ADMIN.nama} melalui WhatsApp`}
          className="flex items-center gap-2.5 md:gap-4 p-2 md:p-3.5 pr-9 md:pr-11 cursor-pointer"
        >
          {ikon}

          <div className="flex flex-col justify-center">
            <h4 className="text-gray-900 font-bold text-xs md:text-base leading-tight">{ADMIN.nama}</h4>

            <div className="flex flex-col md:gap-0.5 mt-0.5">
              <div className="flex items-center gap-1 text-gray-500">
                <Phone className="w-2.5 h-2.5 md:w-3 md:h-3" />
                <span className="text-[10px] md:text-sm font-medium tracking-tight">{ADMIN.telepon}</span>
              </div>

              <div className="hidden md:flex items-center gap-1 text-gray-400">
                <Mail className="w-2.5 h-2.5 md:w-3 md:h-3" />
                <span className="text-[10px] md:text-xs">{ADMIN.email}</span>
              </div>
            </div>
          </div>
        </a>

        <button
          type="button"
          onClick={() => ubahTertutup(true)}
          aria-label="Tutup kontak admin"
          className="absolute top-1/2 -translate-y-1/2 right-2 md:right-3 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>
    </div>
  );
};

export default FloatingContact;
