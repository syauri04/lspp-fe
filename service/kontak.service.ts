"use client";

// Kontak lembaga (lspp-be: GET /api/kontak, publik tanpa token, diatur di CMS > Content Website > Kontak Kami).
// Dipakai footer "Kontak Kami" & tombol WhatsApp mengambang.
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface KontakLembaga {
  nama: string;
  email: string;
  alamat: string;
  whatsapp: { nomor: string; tampil: string; url: string };
}

/** Cadangan bila API belum termuat / gagal: website tidak pernah tampil kosong. */
export const KONTAK_BAWAAN: KontakLembaga = {
  nama: "Admin LSPP306",
  email: "tigapuluhjuni@gmail.com",
  alamat:
    "Jl. Raya Mabes Hankam No. 3, RT.13/RW.2, Bambu Apus, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13890",
  whatsapp: {
    nomor: "6282249628093",
    tampil: "+62 822-4962-8093",
    url: `https://wa.me/6282249628093?text=${encodeURIComponent("Halo Admin LSPP306, saya ingin bertanya tentang sertifikasi.")}`,
  },
};

/** Hanya tautan wa.me / api.whatsapp.com https yang diterima (cegah tautan berbahaya dari data API). */
function urlAman(url: unknown): url is string {
  try {
    const u = new URL(String(url));
    return u.protocol === "https:" && ["wa.me", "api.whatsapp.com"].includes(u.hostname);
  } catch {
    return false;
  }
}

function sah(d: unknown): d is KontakLembaga {
  const k = d as KontakLembaga | null;
  return (
    !!k &&
    typeof k.nama === "string" &&
    typeof k.email === "string" &&
    typeof k.alamat === "string" &&
    typeof k.whatsapp?.tampil === "string" &&
    urlAman(k.whatsapp?.url)
  );
}

// Satu request per kunjungan: footer & tombol WhatsApp berbagi promise yang sama.
let permintaan: Promise<KontakLembaga> | null = null;

export function ambilKontak(): Promise<KontakLembaga> {
  permintaan ??= fetch(`${API_BASE_URL}/kontak`, { headers: { Accept: "application/json" } })
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json())?.data;
      if (!sah(data)) throw new Error("Format kontak tidak dikenali");
      return data;
    })
    .catch((err) => {
      console.error("Gagal memuat kontak, memakai data bawaan:", err);
      permintaan = null; // coba lagi pada pemanggilan berikutnya
      return KONTAK_BAWAAN;
    });
  return permintaan;
}

/**
 * Kontak lembaga untuk komponen: null selama dimuat (agar tidak sekilas menampilkan data lama),
 * lalu data dari CMS, atau data bawaan bila API gagal.
 */
export function useKontak(): KontakLembaga | null {
  const [kontak, setKontak] = useState<KontakLembaga | null>(null);

  useEffect(() => {
    let aktif = true;
    ambilKontak().then((k) => aktif && setKontak(k));
    return () => {
      aktif = false;
    };
  }, []);

  return kontak;
}
