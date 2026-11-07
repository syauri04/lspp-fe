"use client";

import { useState } from "react";
import { Loader2, TicketPercent, X } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface VoucherTerpasang {
  kode: string;
  nama: string | null;
  keterangan: string | null;
}

interface Props {
  kodePendaftaran: string;
  token: string;
  voucher: VoucherTerpasang | null;
  /** Alasan voucher tidak bisa diubah (dari server), null = bisa. */
  terkunci: string | null;
  /** Dipanggil setelah voucher dipasang/dilepas; status "paid" bila potongan 100%. */
  onBerubah: (hasil: { status: string; pesan: string }) => void;
}

/**
 * Input kode voucher di ringkasan pembayaran. Semua perhitungan potongan dilakukan server;
 * komponen ini hanya mengirim kode lalu meminta halaman memuat ulang ringkasan.
 */
export default function VoucherForm({ kodePendaftaran, token, voucher, terkunci, onBerubah }: Props) {
  const [kode, setKode] = useState("");
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const kirim = async (metode: "POST" | "DELETE") => {
    if (proses) return;
    if (metode === "POST" && !kode.trim()) {
      setGalat("Masukkan kode voucher.");
      return;
    }
    setProses(true);
    setGalat(null);
    try {
      const res = await fetch(`${API_BASE_URL}/checkout/${kodePendaftaran}/voucher`, {
        method: metode,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: metode === "POST" ? JSON.stringify({ kode: kode.trim() }) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGalat(
          json?.errors?.kode?.[0] ||
            (res.status === 429
              ? "Terlalu banyak percobaan. Coba lagi dalam 1 menit."
              : json?.message || "Voucher gagal diproses."),
        );
        return;
      }
      setKode("");
      onBerubah({ status: json?.data?.status ?? "pending", pesan: json?.message ?? "Voucher diperbarui." });
    } catch {
      setGalat("Terjadi kesalahan jaringan.");
    } finally {
      setProses(false);
    }
  };

  if (voucher) {
    return (
      <div className="rounded-xl border border-[#82B124]/40 bg-[#82B124]/5 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <TicketPercent size={18} className="text-[#82B124] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Voucher <span className="font-mono">{voucher.kode}</span> digunakan
              </p>
              {(voucher.nama || voucher.keterangan) && (
                <p className="text-xs text-gray-500 truncate">
                  {[voucher.nama, voucher.keterangan].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
          {!terkunci && (
            <button
              type="button"
              onClick={() => kirim("DELETE")}
              disabled={proses}
              className="text-gray-400 hover:text-red-500 disabled:opacity-50 shrink-0"
              aria-label="Lepas voucher"
              title="Lepas voucher"
            >
              {proses ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
            </button>
          )}
        </div>
        {galat && <p className="mt-2 text-xs text-red-500">{galat}</p>}
      </div>
    );
  }

  if (terkunci) {
    return <p className="text-xs text-gray-400">{terkunci}</p>;
  }

  return (
    <div>
      <label htmlFor="kode-voucher" className="block text-sm font-medium text-gray-700 mb-2">
        Punya kode voucher?
      </label>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          kirim("POST");
        }}
      >
        <input
          id="kode-voucher"
          type="text"
          value={kode}
          onChange={(e) => {
            setKode(e.target.value.toUpperCase());
            setGalat(null);
          }}
          maxLength={32}
          autoComplete="off"
          spellCheck={false}
          placeholder="Masukkan kode voucher"
          className={`flex-1 min-w-0 rounded-xl border px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#82B124]/20 focus:border-[#82B124] ${
            galat ? "border-red-400" : "border-gray-200"
          }`}
        />
        <button
          type="submit"
          disabled={proses}
          className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60 flex items-center gap-2"
        >
          {proses && <Loader2 size={14} className="animate-spin" />}
          Pakai
        </button>
      </form>
      {galat && <p className="mt-2 text-xs text-red-500">{galat}</p>}
    </div>
  );
}
