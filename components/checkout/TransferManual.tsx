"use client";

/*
 * Pembayaran transfer manual: rekening LSP (dikelola admin di CMS) + formulir unggah bukti transfer.
 * Bukti diverifikasi admin; setelah disetujui tagihan lunas (alur sama dengan DOKU).
 * Tombol kirim berada di kartu "Ringkasan Pembayaran" (form="form-bukti-transfer").
 */

import { useState } from "react";
import { AlertCircle, Check, Copy, Upload } from "lucide-react";

export interface RekeningLsp {
  id: number;
  nama_bank: string;
  nomor_rekening: string;
  atas_nama: string;
  keterangan: string | null;
}

export interface BuktiTransfer {
  id: number;
  status: "menunggu" | "disetujui" | "ditolak" | "dibatalkan";
  status_label: string;
  catatan_admin: string | null;
  rekening_tujuan: { nama_bank: string; nomor_rekening: string; atas_nama: string };
  nama_pengirim: string;
  bank_pengirim: string;
  tanggal_transfer: string | null;
  jumlah_transfer: string;
  dikirim_at: string | null;
}

export const ID_FORM_BUKTI = "form-bukti-transfer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Tanggal hari ini (WIB) format YYYY-MM-DD, untuk batas input tanggal transfer. */
function hariIniWib(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function rupiah(nilai: string | number): string {
  const n = typeof nilai === "string" ? parseFloat(nilai) : nilai;
  return Number.isNaN(n) ? "-" : `Rp ${n.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
}

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#82B124] focus:ring-2 focus:ring-[#82B124]/20";

export default function TransferManual({
  kodePendaftaran,
  token,
  jumlah,
  rekening,
  buktiDitolak,
  unggah,
  onProses,
  onTerkirim,
  onGalat,
}: {
  kodePendaftaran: string;
  token: string;
  jumlah: string;
  rekening: RekeningLsp[];
  /** Bukti terakhir yang ditolak admin (ditampilkan alasannya). */
  buktiDitolak: BuktiTransfer | null;
  unggah: { mimes: string[]; maks_kb: number };
  onProses: (proses: boolean) => void;
  onTerkirim: (pesan: string) => void;
  onGalat: (pesan: string) => void;
}) {
  const [rekeningId, setRekeningId] = useState<number>(rekening[0]?.id ?? 0);
  const [form, setForm] = useState({
    nama_pengirim: "",
    bank_pengirim: "",
    tanggal_transfer: hariIniWib(),
    jumlah_transfer: String(Math.round(parseFloat(jumlah) || 0)),
    catatan: "",
  });
  const [berkas, setBerkas] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [disalin, setDisalin] = useState<number | null>(null);

  const ubah = (kunci: keyof typeof form, nilai: string) => {
    setForm((f) => ({ ...f, [kunci]: nilai }));
    setErrors((e) => ({ ...e, [kunci]: "" }));
  };

  const salin = async (r: RekeningLsp) => {
    try {
      await navigator.clipboard.writeText(r.nomor_rekening.replace(/[^0-9]/g, ""));
      setDisalin(r.id);
      setTimeout(() => setDisalin(null), 2000);
    } catch {}
  };

  const pilihBerkas = (file: File | null) => {
    setErrors((e) => ({ ...e, file: "" }));
    if (!file) return setBerkas(null);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!unggah.mimes.includes(ext)) {
      setErrors((e) => ({ ...e, file: "Bukti transfer harus berformat JPG, PNG, atau PDF." }));
      return setBerkas(null);
    }
    if (file.size > unggah.maks_kb * 1024) {
      setErrors((e) => ({ ...e, file: `Ukuran bukti transfer maksimal ${Math.round(unggah.maks_kb / 1024)} MB.` }));
      return setBerkas(null);
    }
    setBerkas(file);
  };

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!berkas) {
      setErrors((x) => ({ ...x, file: "Unggah bukti transfer." }));
      return;
    }

    const data = new FormData();
    data.append("rekening_pembayaran_id", String(rekeningId));
    Object.entries(form).forEach(([k, v]) => v !== "" && data.append(k, v));
    data.append("file", berkas);

    onProses(true);
    try {
      const res = await fetch(`${API_BASE_URL}/checkout/${kodePendaftaran}/bukti-transfer`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: data,
      });
      let json: { message?: string; errors?: Record<string, string[]> } = {};
      try {
        json = await res.json();
      } catch {}

      if (res.status === 422 && json.errors) {
        setErrors(Object.fromEntries(Object.entries(json.errors).map(([k, v]) => [k, v[0]])));
        onGalat("Periksa kembali isian yang ditandai.");
      } else if (!res.ok) {
        onGalat(json.message || "Gagal mengirim bukti transfer.");
      } else {
        onTerkirim(json.message || "Bukti transfer berhasil dikirim.");
      }
    } catch {
      onGalat("Koneksi gagal. Silakan coba lagi.");
    } finally {
      onProses(false);
    }
  };

  const galat = (kunci: string) => errors[kunci] && <p className="text-xs text-red-500 mt-1">{errors[kunci]}</p>;

  return (
    <div>
      {buktiDitolak && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Bukti transfer sebelumnya ditolak admin.</p>
            {buktiDitolak.catatan_admin && <p className="mt-1">Alasan: {buktiDitolak.catatan_admin}</p>}
            <p className="mt-1">Silakan unggah ulang bukti transfer yang benar.</p>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-600 mb-3">
        Transfer <span className="font-bold text-gray-900">{rupiah(jumlah)}</span> ke salah satu rekening berikut:
      </p>
      <div className="space-y-3 mb-6">
        {rekening.map((r) => (
          <label
            key={r.id}
            className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${
              rekeningId === r.id ? "border-[#82B124] bg-[#82B124]/5" : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <input
              type="radio"
              name="rekening"
              className="mt-1 accent-[#82B124]"
              checked={rekeningId === r.id}
              onChange={() => setRekeningId(r.id)}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{r.nama_bank}</p>
              <p className="font-mono text-lg tracking-wide text-gray-900">{r.nomor_rekening}</p>
              <p className="text-sm text-gray-500">a.n. {r.atas_nama}</p>
              {r.keterangan && <p className="text-xs text-gray-400">{r.keterangan}</p>}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                salin(r);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-[#82B124] hover:underline shrink-0"
            >
              {disalin === r.id ? <Check size={14} /> : <Copy size={14} />}
              {disalin === r.id ? "Tersalin" : "Salin"}
            </button>
          </label>
        ))}
      </div>

      <form id={ID_FORM_BUKTI} onSubmit={kirim} className="space-y-4" noValidate>
        <p className="text-sm font-semibold text-gray-900">Konfirmasi Transfer</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500" htmlFor="nama_pengirim">Nama Pemilik Rekening Pengirim *</label>
            <input id="nama_pengirim" className={inputClass} maxLength={150} required value={form.nama_pengirim}
              onChange={(e) => ubah("nama_pengirim", e.target.value)} />
            {galat("nama_pengirim")}
          </div>
          <div>
            <label className="text-xs text-gray-500" htmlFor="bank_pengirim">Bank / E-Wallet Pengirim *</label>
            <input id="bank_pengirim" className={inputClass} maxLength={100} required placeholder="mis. BCA" value={form.bank_pengirim}
              onChange={(e) => ubah("bank_pengirim", e.target.value)} />
            {galat("bank_pengirim")}
          </div>
          <div>
            <label className="text-xs text-gray-500" htmlFor="tanggal_transfer">Tanggal Transfer *</label>
            <input id="tanggal_transfer" type="date" className={inputClass} required max={hariIniWib()} value={form.tanggal_transfer}
              onChange={(e) => ubah("tanggal_transfer", e.target.value)} />
            {galat("tanggal_transfer")}
          </div>
          <div>
            <label className="text-xs text-gray-500" htmlFor="jumlah_transfer">Jumlah Ditransfer (Rp) *</label>
            <input id="jumlah_transfer" type="number" min={1} className={inputClass} required value={form.jumlah_transfer}
              onChange={(e) => ubah("jumlah_transfer", e.target.value)} />
            {galat("jumlah_transfer")}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500" htmlFor="file_bukti">Bukti Transfer (JPG, PNG, atau PDF, maks. {Math.round(unggah.maks_kb / 1024)} MB) *</label>
          <label
            htmlFor="file_bukti"
            className="mt-1 flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-4 cursor-pointer hover:border-[#82B124]"
          >
            <Upload size={18} className="text-[#82B124] shrink-0" />
            <span className={`text-sm truncate ${berkas ? "text-gray-900" : "text-gray-400"}`}>
              {berkas ? berkas.name : "Pilih berkas bukti transfer"}
            </span>
          </label>
          <input id="file_bukti" type="file" className="hidden" accept={unggah.mimes.map((m) => `.${m}`).join(",")}
            onChange={(e) => pilihBerkas(e.target.files?.[0] ?? null)} />
          {galat("file")}
        </div>

        <div>
          <label className="text-xs text-gray-500" htmlFor="catatan">Catatan (opsional)</label>
          <textarea id="catatan" rows={2} maxLength={500} className={inputClass} value={form.catatan}
            onChange={(e) => ubah("catatan", e.target.value)} />
        </div>
        {galat("rekening_pembayaran_id")}
      </form>
    </div>
  );
}
