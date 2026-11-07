"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface StateCaptcha {
  /** ID captcha dari server; dikirim sebagai captcha_id bersama jawaban. */
  id: string | null;
  gambar: string | null;
  memuat: boolean;
  galat: boolean;
  /** Minta kode baru (setelah submit — benar/salah — kode lama sudah hangus di server). */
  muatUlang: () => void;
}

/**
 * Captcha dari lspp-be (GET /auth/captcha): kode acak tiap permintaan, dicek di server,
 * sekali pakai. Otomatis diperbarui sebelum kedaluwarsa.
 */
export function useCaptcha(): StateCaptcha {
  const [id, setId] = useState<string | null>(null);
  const [gambar, setGambar] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urutan = useRef(0);

  const muatUlang = useCallback(async () => {
    const ke = ++urutan.current;
    if (timer.current) clearTimeout(timer.current);
    setMemuat(true);
    setGalat(false);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/captcha`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(String(res.status));
      const { data } = await res.json();
      if (ke !== urutan.current) return; // ada permintaan yang lebih baru
      setId(data.id);
      setGambar(data.gambar);
      // Perbarui 20 detik sebelum kedaluwarsa agar form yang dibiarkan lama tetap valid.
      const sisa = Math.max(30, Number(data.kedaluwarsa_detik ?? 300) - 20);
      timer.current = setTimeout(() => void muatUlang(), sisa * 1000);
    } catch {
      if (ke === urutan.current) {
        setId(null);
        setGambar(null);
        setGalat(true);
      }
    } finally {
      if (ke === urutan.current) setMemuat(false);
    }
  }, []);

  useEffect(() => {
    void muatUlang();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [muatUlang]);

  return { id, gambar, memuat, galat, muatUlang };
}

/** Kotak gambar captcha + tombol ganti kode. Gaya kotak sama dengan desain sebelumnya. */
export function CaptchaGambar({ captcha, lang }: { captcha: StateCaptcha; lang: string }) {
  const label = lang === "id" ? "Ganti kode captcha" : "Refresh captcha";

  return (
    <div className="flex items-center gap-1 shrink-0">
      <div className="bg-[#F9FBF8] border border-gray-100 rounded-lg p-1 md:p-1.5 w-fit h-12 md:h-14 flex items-center justify-center min-w-40">
        {captcha.gambar && !captcha.memuat ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URI dari API, bukan aset statis
          <img
            src={captcha.gambar}
            alt={lang === "id" ? "Kode captcha" : "Captcha code"}
            width={180}
            height={56}
            className="h-full w-auto select-none rounded"
            draggable={false}
          />
        ) : captcha.galat ? (
          <span className="px-2 text-xs text-red-500">
            {lang === "id" ? "Gagal memuat captcha" : "Failed to load captcha"}
          </span>
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        )}
      </div>
      <button
        type="button"
        onClick={captcha.muatUlang}
        disabled={captcha.memuat}
        aria-label={label}
        title={label}
        className="p-2 text-gray-400 hover:text-[#82B124] disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`h-5 w-5 ${captcha.memuat ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
