"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getNotifikasi } from "@/service/profil.service";

/** Event global: dipancarkan setelah notifikasi ditandai dibaca agar titik merah lonceng ikut diperbarui. */
export const EVENT_NOTIFIKASI_BERUBAH = "notifikasi:berubah";

export function beritahuNotifikasiBerubah() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT_NOTIFIKASI_BERUBAH));
}

/** Jumlah notifikasi belum dibaca milik asesi login (0 bila belum login / gagal). */
export function useNotifikasiBelumDibaca(): number {
  const { token, isLoggedIn } = useAuth();
  const [jumlah, setJumlah] = useState(0);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setJumlah(0);
      return;
    }
    let batal = false;
    const muat = () =>
      getNotifikasi(token, { perPage: 1, belumDibaca: true })
        .then((res) => !batal && setJumlah(res.meta.belum_dibaca))
        .catch(() => {});

    muat();
    window.addEventListener(EVENT_NOTIFIKASI_BERUBAH, muat);
    window.addEventListener("focus", muat);
    return () => {
      batal = true;
      window.removeEventListener(EVENT_NOTIFIKASI_BERUBAH, muat);
      window.removeEventListener("focus", muat);
    };
  }, [isLoggedIn, token]);

  return jumlah;
}
