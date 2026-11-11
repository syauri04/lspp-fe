// API halaman Profil & Notifikasi asesi (lspp-be: /api/pendaftaran-sertifikasi, /api/notifikasi).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type KelompokPendaftaran = "diajukan" | "diproses" | "selesai" | "ditolak";

export interface PendaftaranAsesi {
  kode_pendaftaran: string;
  status: string;
  status_label: string;
  kelompok: KelompokPendaftaran | null;
  catatan_admin: string | null;
  diajukan_at: string | null;
  skema: {
    id: number;
    judul: Record<string, string> | null;
    slug: string | null;
    nomor: string | null;
    gambar: string | null;
  } | null;
  jadwal: {
    tanggal: string | null;
    waktu_mulai: string | null;
    waktu_selesai: string | null;
    status: string | null;
    tuk: { nama: string | null; kota: string | null; alamat: string | null } | null;
    asesor: string | null;
  } | null;
  asesmen: {
    status: string;
    metode: string | null;
    hasil: "kompeten" | "belum_kompeten" | null;
    selesai_at: string | null;
  } | null;
  /** cek_pembayaran = bukti transfer manual sedang diverifikasi admin. */
  aksi: { jenis: "bayar" | "cek_pembayaran" | "mulai_asesmen"; url: string } | null;
  /** Hasil sertifikasi; null sampai LSP menyelesaikan proses penerbitan. */
  sertifikasi: HasilSertifikasi | null;
}

export interface SertifikatPublik {
  nama: string;
  no_blanko: string;
  no_sertifikat: string;
  skema: { judul: Record<string, string> | null; nomor: string | null };
  unit_kompetensi: { kode_unit: string | null; judul_unit: string | null }[];
  tanggal_aktif: string;
  tanggal_expired: string;
  masa_berlaku_tahun: number;
  status: "berlaku" | "tidak_berlaku";
}

export interface HasilSertifikasi {
  hasil: "kompeten" | "belum_kompeten";
  selesai_at: string | null;
  /** Dokumen SK yang boleh diunduh asesi (mis. SK Hasil Uji). `unduh` = path API. */
  dokumen: { jenis: string; label: string; unduh: string }[];
  sertifikat: (SertifikatPublik & { unduh: string }) | null;
}

export interface PendaftaranAsesiDetail extends PendaftaranAsesi {
  pembayaran: { status: string; jumlah: string; paid_at: string | null; expired_at: string | null } | null;
  timeline: { status: string; judul: string; keterangan: string | null; tanggal: string | null }[];
}

export interface NotifikasiAsesi {
  id: string;
  kategori: string;
  judul: string;
  pesan: string;
  skema: string | null;
  kode_pendaftaran: string | null;
  /** Path website tanpa prefix bahasa (mis. "/checkout/{kode}") atau URL absolut (MUK). */
  url: string | null;
  dibaca: boolean;
  dibaca_at: string | null;
  dibuat_at: string | null;
}

interface Halaman<T, M = object> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number } & M;
}

function headers(token: string): HeadersInit {
  return { Accept: "application/json", Authorization: `Bearer ${token}` };
}

async function ambil<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: headers(token), cache: "no-store" });
  if (!res.ok) {
    let pesan = `Gagal memuat data (status ${res.status}).`;
    try {
      pesan = (await res.json())?.message || pesan;
    } catch {}
    throw new Error(pesan);
  }
  return res.json();
}

export function getPendaftaranSaya(token: string, opsi: { kelompok?: KelompokPendaftaran; perPage?: number; page?: number } = {}) {
  const q = new URLSearchParams();
  if (opsi.kelompok) q.set("kelompok", opsi.kelompok);
  if (opsi.perPage) q.set("per_page", String(opsi.perPage));
  if (opsi.page) q.set("page", String(opsi.page));
  return ambil<Halaman<PendaftaranAsesi, { jumlah: Record<KelompokPendaftaran, number> }>>(
    `/pendaftaran-sertifikasi?${q.toString()}`,
    token,
  );
}

export async function getDetailPendaftaran(token: string, kode: string) {
  return (await ambil<{ data: PendaftaranAsesiDetail }>(`/pendaftaran-sertifikasi/${kode}`, token)).data;
}

export function getNotifikasi(token: string, opsi: { perPage?: number; page?: number; belumDibaca?: boolean } = {}) {
  const q = new URLSearchParams();
  if (opsi.perPage) q.set("per_page", String(opsi.perPage));
  if (opsi.page) q.set("page", String(opsi.page));
  if (opsi.belumDibaca) q.set("belum_dibaca", "1");
  return ambil<Halaman<NotifikasiAsesi, { belum_dibaca: number }>>(`/notifikasi?${q.toString()}`, token);
}

export async function bacaNotifikasi(token: string, id: string) {
  return (await ambil<{ data: NotifikasiAsesi }>(`/notifikasi/${id}/baca`, token, { method: "POST" })).data;
}

export function bacaSemuaNotifikasi(token: string) {
  return ambil<{ data: { jumlah: number } }>(`/notifikasi/baca-semua`, token, { method: "POST" });
}

/**
 * Unduh berkas hasil sertifikasi milik asesi (endpoint terotorisasi, Bearer token) lalu simpan
 * di perangkat. `path` dari API (mis. "/pendaftaran-sertifikasi/{kode}/sertifikasi/e-sertifikat").
 */
export async function unduhBerkasSertifikasi(token: string, path: string, namaCadangan: string): Promise<void> {
  // Hanya path API sertifikasi milik sendiri (bukan URL bebas).
  if (!/^\/pendaftaran-sertifikasi\/[\w-]+\/sertifikasi\/[a-z_-]+$/.test(path)) throw new Error("Berkas tidak valid.");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/pdf", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Gagal mengunduh berkas (status ${res.status}).`);

  const nama = /filename="?([^";]+)"?/i.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? namaCadangan;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/* ------------------------------ helper tampilan ------------------------------ */

export function judulSkema(p: { skema: PendaftaranAsesi["skema"] }, lang: string): string {
  const j = p.skema?.judul;
  return (j && (j[lang] || j.id || Object.values(j)[0])) || "-";
}

/**
 * Format tanggal (tanpa jam). zona "Asia/Jakarta" untuk timestamp UTC asli; "UTC" untuk tanggal murni
 * (YYYY-MM-DD) dan riwayat status — created_at riwayat tersimpan dalam jam WIB oleh MySQL
 * (lihat lspp-be/docs/profil-asesi-catatan.md bagian 3b), jadi tidak boleh digeser lagi.
 */
export function formatTanggal(iso: string | null | undefined, lang: string, zona: "Asia/Jakarta" | "UTC" = "Asia/Jakarta"): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(lang === "en" ? "en-GB" : "id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: zona });
}

/** URL notifikasi/aksi: path relatif diberi prefix bahasa; URL absolut dipakai apa adanya. */
export function urlWebsite(url: string, lang: string): string {
  return /^https?:\/\//.test(url) ? url : `/${lang}${url.startsWith("/") ? url : `/${url}`}`;
}
