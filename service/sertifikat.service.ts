// Verifikasi e-sertifikat publik (lspp-be: GET /api/sertifikat/verifikasi?nomor=...).
import type { SertifikatPublik } from "@/service/profil.service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type HasilVerifikasi =
  | { jenis: "ditemukan"; data: SertifikatPublik }
  | { jenis: "tidak_ditemukan" }
  | { jenis: "terlalu_banyak" }
  | { jenis: "gagal" };

/** Cocok persis nomor blanko ATAU nomor sertifikat (spasi & huruf besar/kecil diabaikan server). */
export async function verifikasiSertifikat(nomor: string): Promise<HasilVerifikasi> {
  try {
    const res = await fetch(`${API_BASE_URL}/sertifikat/verifikasi?nomor=${encodeURIComponent(nomor.trim())}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (res.status === 404 || res.status === 422) return { jenis: "tidak_ditemukan" };
    if (res.status === 429) return { jenis: "terlalu_banyak" };
    if (!res.ok) return { jenis: "gagal" };
    return { jenis: "ditemukan", data: (await res.json()).data as SertifikatPublik };
  } catch {
    return { jenis: "gagal" };
  }
}
