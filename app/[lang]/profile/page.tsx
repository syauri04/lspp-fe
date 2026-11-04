"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Pencil,
  Download,
  Loader2,
  Save,
  X,
  Camera,
  Lock,
  Bell,
  Calendar,
} from "lucide-react";
import { getDictionary } from "../dictionaries";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { updateProfile, changePassword } from "@/service/auth.service";
import {
  bacaNotifikasi,
  formatTanggal,
  getDetailPendaftaran,
  getNotifikasi,
  getPendaftaranSaya,
  judulSkema,
  urlWebsite,
  type KelompokPendaftaran,
  type NotifikasiAsesi,
  type PendaftaranAsesi,
  type PendaftaranAsesiDetail,
} from "@/service/profil.service";
import { beritahuNotifikasiBerubah } from "@/hooks/use-notifikasi-belum-dibaca";
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

interface ProfilePageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

const GAMBAR_CADANGAN = "/images/sertifikasi/serti-1.png";

const filterOptions: { key: KelompokPendaftaran; label: string }[] = [
  { key: "diajukan", label: "Diajukan" },
  { key: "diproses", label: "Diproses" },
  { key: "selesai", label: "Selesai" },
  { key: "ditolak", label: "Ditolak/Batal" },
];

const statusBadgeStyle: Record<KelompokPendaftaran, string> = {
  selesai: "bg-[#8CC63F] text-white",
  diproses: "bg-white text-[#78B51A] border border-[#8CC63F]",
  diajukan: "bg-gray-100 text-gray-500 border border-gray-200",
  ditolak: "bg-red-50 text-red-600 border border-red-200",
};

const labelHasil: Record<string, string> = {
  kompeten: "Kompeten",
  belum_kompeten: "Belum Kompeten",
};

/** Pesan notifikasi dengan nama skema ditebalkan (seperti desain). */
function PesanNotifikasi({ notif }: { notif: NotifikasiAsesi }) {
  const { pesan, skema } = notif;
  const posisi = skema ? pesan.indexOf(skema) : -1;
  if (!skema || posisi < 0) return <>{pesan}</>;
  return (
    <>
      {pesan.slice(0, posisi)}
      <strong className="font-semibold text-gray-900">{skema}</strong>
      {pesan.slice(posisi + skema.length)}
    </>
  );
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { lang } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const {
    user,
    token,
    isLoggedIn,
    loading: authLoading,
    updateUser,
  } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dict, setDict] = useState<any>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [activeFilter, setActiveFilter] = useState<KelompokPendaftaran | null>(null);
  const [jumlah, setJumlah] = useState<Record<KelompokPendaftaran, number> | null>(null);
  const [daftar, setDaftar] = useState<PendaftaranAsesi[]>([]);
  const [memuatDaftar, setMemuatDaftar] = useState(false);
  const [selectedKode, setSelectedKode] = useState<string | null>(null);
  const [detail, setDetail] = useState<PendaftaranAsesiDetail | null>(null);
  const [memuatDetail, setMemuatDetail] = useState(false);
  const [skemaDiikuti, setSkemaDiikuti] = useState<PendaftaranAsesi[] | null>(null);
  const [notifikasi, setNotifikasi] = useState<NotifikasiAsesi[] | null>(null);
  const [galatData, setGalatData] = useState<string | null>(null);

  const selectedSertifikasi = daftar.find((d) => d.kode_pendaftaran === selectedKode) ?? null;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [passData, setPassData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  // Data awal: jumlah per tab (pilih tab default), skema yang diikuti (selesai), 3 notifikasi terbaru.
  useEffect(() => {
    if (!token) return;
    let batal = false;
    Promise.all([
      getPendaftaranSaya(token, { perPage: 1 }),
      getPendaftaranSaya(token, { kelompok: "selesai", perPage: 20 }),
      getNotifikasi(token, { perPage: 3 }),
    ])
      .then(([ringkas, selesai, notif]) => {
        if (batal) return;
        const j = ringkas.meta.jumlah;
        setJumlah(j);
        setActiveFilter(
          j.diproses > 0 ? "diproses" : (filterOptions.find((o) => j[o.key] > 0)?.key ?? "diajukan"),
        );
        setSkemaDiikuti(selesai.data);
        setNotifikasi(notif.data);
      })
      .catch((err: Error) => !batal && setGalatData(err.message));
    return () => {
      batal = true;
    };
  }, [token]);

  // Daftar sertifikasi per tab.
  useEffect(() => {
    if (!token || !activeFilter) return;
    let batal = false;
    setMemuatDaftar(true);
    getPendaftaranSaya(token, { kelompok: activeFilter, perPage: 20 })
      .then((res) => {
        if (batal) return;
        setDaftar(res.data);
        setSelectedKode(res.data[0]?.kode_pendaftaran ?? null);
      })
      .catch((err: Error) => !batal && setGalatData(err.message))
      .finally(() => !batal && setMemuatDaftar(false));
    return () => {
      batal = true;
    };
  }, [token, activeFilter]);

  // Detail (timeline) sertifikasi terpilih.
  useEffect(() => {
    if (!token || !selectedKode) {
      setDetail(null);
      return;
    }
    let batal = false;
    setMemuatDetail(true);
    getDetailPendaftaran(token, selectedKode)
      .then((res) => !batal && setDetail(res))
      .catch(() => !batal && setDetail(null))
      .finally(() => !batal && setMemuatDetail(false));
    return () => {
      batal = true;
    };
  }, [token, selectedKode]);

  /** Klik notifikasi: tandai dibaca lalu buka tautannya (bila ada). */
  const bukaNotifikasi = useCallback(
    async (notif: NotifikasiAsesi) => {
      if (!token) return;
      if (!notif.dibaca) {
        setNotifikasi((daftarLama) => daftarLama?.map((n) => (n.id === notif.id ? { ...n, dibaca: true } : n)) ?? null);
        bacaNotifikasi(token, notif.id).then(beritahuNotifikasiBerubah).catch(() => {});
      }
      if (notif.url) {
        const tujuan = urlWebsite(notif.url, lang);
        if (/^https?:\/\//.test(tujuan)) window.open(tujuan, "_blank", "noopener,noreferrer");
        else router.push(tujuan);
      }
    },
    [token, lang, router],
  );

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push(`/${lang}/login`);
    }
  }, [isLoggedIn, authLoading, router, lang]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Gagal",
        description: "File yang dipilih harus berupa gambar.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Gagal",
        description: "Ukuran gambar maksimal 5MB.",
      });
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSaveProfile = async () => {
    if (!token) {
      toast({
        title: "Gagal",
        description: "Sesi login tidak ditemukan, silakan login ulang.",
      });
      return;
    }
    if (isUpdating) return;

    setIsUpdating(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("address", formData.address);
    if (avatarFile) data.append("avatar", avatarFile);

    try {
      const res = await updateProfile(data, token);

      let result: any = null;
      try {
        result = await res.json();
      } catch {
        toast({
          title: "Gagal",
          description: `Server mengembalikan respons tidak valid (status ${res.status}).`,
        });
        return;
      }

      if (res.ok) {
        updateUser(result.data.asesi);
        setIsEditingProfile(false);
        setAvatarFile(null);
        setPreviewUrl(null);
        toast({ title: "Berhasil", description: "Profil telah diperbarui." });
      } else {
        toast({
          title: "Gagal",
          description: result?.message || "Gagal update profil.",
        });
      }
    } catch (err) {
      console.error("handleSaveProfile error:", err);
      toast({ title: "Kesalahan", description: "Koneksi gagal." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passData.current_password || !passData.password) {
      return toast({
        title: "Error",
        description: "Semua kolom password wajib diisi.",
      });
    }
    if (passData.password !== passData.password_confirmation) {
      return toast({
        title: "Error",
        description: "Konfirmasi password tidak cocok.",
      });
    }
    if (!token) {
      toast({
        title: "Gagal",
        description: "Sesi login tidak ditemukan, silakan login ulang.",
      });
      return;
    }
    if (isUpdatingPassword) return;

    setIsUpdatingPassword(true);
    try {
      const res = await changePassword(passData, token);

      let result: any = null;
      try {
        result = await res.json();
      } catch {}

      if (res.ok) {
        toast({ title: "Berhasil", description: "Password berhasil diubah." });
        setIsEditingPassword(false);
        setPassData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      } else {
        toast({
          title: "Gagal",
          description: result?.message || "Gagal mengubah password.",
        });
      }
    } catch (err) {
      console.error("handleSavePassword error:", err);
      toast({ title: "Error", description: "Terjadi kesalahan koneksi." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!dict || authLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#78B51A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <section className="relative py-12 text-white overflow-hidden min-h-[300px]">
        <div className="absolute inset-0 bg-[#8CC63F] z-0" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 z-0">
          <div
            className="absolute inset-0 bg-cover bg-left"
            style={{ backgroundImage: "url('/images/sawah.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#8CC63F] via-[#8CC63F]/70 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative flex-shrink-0">
            <Image
              src={previewUrl || user?.avatar || "/images/avatar/avatar-1.jpg"}
              alt="Profile"
              width={200}
              height={200}
              className="w-48 h-48 rounded-full border-4 border-white object-cover shadow-lg"
            />
            {isEditingProfile && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full text-white"
              >
                <Camera className="h-10 w-10" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1 w-full relative min-h-[220px]">
            {isEditingProfile ? (
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="text-4xl font-semibold bg-transparent border-b border-white outline-none w-full placeholder-white"
              />
            ) : (
              <h1 className="text-4xl font-semibold">{user?.name}</h1>
            )}

            <div className="mt-4 space-y-2 opacity-90">
              {/* <p className="flex items-center gap-2">
                <MapPin size={18} />{" "}
                {isEditingProfile ? (
                  <input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="bg-transparent border-b border-white outline-none w-full"
                  />
                ) : (
                  user?.address || "-"
                )}
              </p> */}
              <p className="flex items-center gap-2">
                <Phone size={18} />{" "}
                {isEditingProfile ? (
                  <input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="bg-transparent border-b border-white outline-none w-full"
                  />
                ) : (
                  user?.phone || "-"
                )}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={18} /> {user?.email}
              </p>
            </div>

            <div className="absolute bottom-0 right-0 flex gap-3">
              {isEditingProfile ? (
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="bg-white text-[#8CC63F] px-6 py-2 rounded-lg font-bold shadow flex items-center gap-2 hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isUpdating ? "Menyimpan..." : "Simpan"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-white text-[#8CC63F] px-6 py-2 rounded-lg font-medium shadow flex items-center gap-2 hover:bg-gray-100 transition"
                >
                  <Pencil size={16} /> Edit Profile
                </button>
              )}

              {isEditingPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPassData({
                      current_password: "",
                      password: "",
                      password_confirmation: "",
                    });
                  }}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold shadow flex items-center gap-2"
                >
                  <X size={16} /> Batal
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingPassword(true)}
                  className="bg-white text-[#8CC63F] px-6 py-2 rounded-lg font-medium shadow flex items-center gap-2 hover:bg-gray-100 transition"
                >
                  <Lock size={16} /> Edit Password
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {isEditingPassword && (
        <div className="max-w-6xl mx-auto px-6 mt-6 animate-in fade-in duration-300">
          <div className="bg-gray-100 p-6 rounded-2xl flex flex-wrap gap-4 items-center border border-gray-200">
            <input
              type="password"
              placeholder="Password Lama"
              value={passData.current_password}
              className="p-2 border rounded-lg flex-1 min-w-[200px]"
              onChange={(e) =>
                setPassData({ ...passData, current_password: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password Baru"
              value={passData.password}
              className="p-2 border rounded-lg flex-1 min-w-[200px]"
              onChange={(e) =>
                setPassData({ ...passData, password: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Konfirmasi"
              value={passData.password_confirmation}
              className="p-2 border rounded-lg flex-1 min-w-[200px]"
              onChange={(e) =>
                setPassData({
                  ...passData,
                  password_confirmation: e.target.value,
                })
              }
            />
            <button
              type="button"
              onClick={handleSavePassword}
              disabled={isUpdatingPassword}
              className="bg-[#8CC63F] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#78B51A] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdatingPassword && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {isUpdatingPassword ? "Menyimpan..." : "Simpan Password"}
            </button>
          </div>
        </div>
      )}

      {galatData && (
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 mt-6">
          <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{galatData}</p>
        </div>
      )}

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            {dict.profile.schemesFollowed}
          </h2>

          {skemaDiikuti === null ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#78B51A]" />
            </div>
          ) : skemaDiikuti.length === 0 ? (
            <p className="text-gray-500">
              Belum ada skema yang selesai diikuti. Skema akan tampil di sini setelah asesmen selesai.
            </p>
          ) : (
            <div className="relative -mx-6 md:-mx-16 lg:-mx-24">
              <div className="flex gap-6 overflow-x-auto pb-4 px-6 md:px-16 lg:px-24 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {skemaDiikuti.map((skema) => {
                  const hasil = skema.asesmen?.hasil;
                  return (
                    <div
                      key={skema.kode_pendaftaran}
                      className="bg-white rounded-2xl shadow-md p-4 flex flex-col flex-shrink-0 w-[280px] snap-start"
                    >
                      <div className="w-full h-40 relative flex-shrink-0">
                        <Image
                          src={skema.skema?.gambar || GAMBAR_CADANGAN}
                          alt={judulSkema(skema, lang)}
                          fill
                          className="object-cover rounded-xl"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between mt-4">
                        <div>
                          <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
                            {judulSkema(skema, lang)}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            {hasil ? (
                              <span className={hasil === "kompeten" ? "font-semibold text-[#78B51A]" : "font-semibold text-red-500"}>
                                {labelHasil[hasil]}
                              </span>
                            ) : (
                              skema.status_label
                            )}
                            {" · "}
                            {formatTanggal(skema.asesmen?.selesai_at ?? skema.jadwal?.tanggal, lang, skema.asesmen?.selesai_at ? "Asia/Jakarta" : "UTC")}
                          </p>
                          {hasil === "kompeten" && (
                            <p className="text-gray-400 text-xs mt-1">E-Sertifikat sedang diproses.</p>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled
                          title="E-Sertifikat belum tersedia"
                          className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#78B51A] text-white rounded-lg transition-colors font-semibold text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="h-4 w-4" />{" "}
                          {dict.profile.downloadCertificate}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          <div className="bg-white rounded-3xl shadow-sm p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-[#78B51A] fill-[#78B51A]" />
              <h2 className="text-2xl font-bold text-gray-900">Notifikasi</h2>
            </div>

            <div className="space-y-4">
              {notifikasi === null && (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-[#78B51A]" />
                </div>
              )}
              {notifikasi?.length === 0 && <p className="text-gray-500">Belum ada notifikasi.</p>}
              {notifikasi?.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => bukaNotifikasi(notif)}
                  className={`w-full text-left rounded-xl px-6 py-4 flex items-start gap-3 transition-colors ${
                    notif.dibaca
                      ? "bg-gray-200"
                      : "bg-gray-50 border border-gray-100 hover:border-[#8CC63F]"
                  } ${notif.url ? "cursor-pointer" : "cursor-default"}`}
                >
                  {!notif.dibaca && (
                    <span className="h-2 w-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  )}
                  <span className="flex-1">
                    <span className="block text-gray-700 leading-relaxed">
                      <PesanNotifikasi notif={notif} />
                    </span>
                    <span className="block text-xs text-gray-400 mt-1">
                      {formatTanggal(notif.dibuat_at, lang)}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <Link
              href={`/${lang}/notifikasi`}
              className="mt-8 inline-block px-6 py-2.5 bg-[#8CC63F] text-white rounded-lg font-semibold hover:bg-[#78B51A] transition-colors"
            >
              Selengkapnya
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Silahkan Pilih Sertifikasi untuk melihat status detail
          </h2>

          <div className="flex flex-wrap gap-3 mb-6">
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setActiveFilter(opt.key)}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  activeFilter === opt.key
                    ? "bg-[#8CC63F] text-white"
                    : "bg-white text-gray-400 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {opt.label}
                {jumlah && jumlah[opt.key] > 0 && <span className="ml-1.5 opacity-80">({jumlah[opt.key]})</span>}
              </button>
            ))}
          </div>

          {memuatDaftar ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#78B51A]" />
            </div>
          ) : daftar.length === 0 ? (
            <p className="text-gray-500">
              Belum ada sertifikasi pada kategori ini.{" "}
              <Link href={`/${lang}/sertifikasi`} className="text-[#78B51A] font-semibold hover:underline">
                Lihat skema sertifikasi
              </Link>
            </p>
          ) : (
            <div className="relative -mx-6 md:-mx-16 lg:-mx-24">
              <div className="flex gap-4 overflow-x-auto pb-4 px-6 md:px-16 lg:px-24 snap-x snap-mandatory">
                {daftar.map((item) => (
                  <div
                    key={item.kode_pendaftaran}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedKode(item.kode_pendaftaran)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedKode(item.kode_pendaftaran)}
                    className={`text-left flex-shrink-0 w-[380px] snap-start bg-white rounded-2xl shadow-sm border overflow-hidden flex transition-all cursor-pointer ${
                      selectedKode === item.kode_pendaftaran
                        ? "border-[#8CC63F] ring-1 ring-[#8CC63F]"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="w-32 h-full min-h-[140px] relative flex-shrink-0">
                      <Image
                        src={item.skema?.gambar || GAMBAR_CADANGAN}
                        alt={judulSkema(item, lang)}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col gap-2">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug">
                        {judulSkema(item, lang)}
                      </h3>
                      <p className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar size={14} /> {formatTanggal(item.diajukan_at, lang)}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-md text-xs font-medium ${statusBadgeStyle[item.kelompok ?? "diajukan"]}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item.status_label}
                      </span>
                      {item.aksi?.jenis === "bayar" && (
                        <Link
                          href={urlWebsite(item.aksi.url, lang)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 inline-flex items-center justify-center w-fit px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#8CC63F] text-white hover:bg-[#78B51A]"
                        >
                          Bayar Sekarang
                        </Link>
                      )}
                      {item.aksi?.jenis === "mulai_asesmen" && (
                        <a
                          href={item.aksi.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 inline-flex items-center justify-center w-fit px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#8CC63F] text-white hover:bg-[#78B51A]"
                        >
                          Mulai Asesmen
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSertifikasi && (
            <div className="mt-6 bg-gray-50 rounded-3xl p-6 md:p-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={selectedSertifikasi.skema?.gambar || GAMBAR_CADANGAN}
                        alt={judulSkema(selectedSertifikasi, lang)}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {judulSkema(selectedSertifikasi, lang)}
                      </h3>
                      <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <Calendar size={14} />{" "}
                        {selectedSertifikasi.jadwal?.tanggal
                          ? formatTanggal(selectedSertifikasi.jadwal.tanggal, lang, "UTC")
                          : "Jadwal asesmen belum ditentukan"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium flex-shrink-0 ${statusBadgeStyle[selectedSertifikasi.kelompok ?? "diajukan"]}`}
                  >
                    {selectedSertifikasi.status_label}
                  </span>
                </div>

                {/* Jadwal & TUK */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Jadwal Asesmen</p>
                    <p className="font-medium text-gray-900">
                      {selectedSertifikasi.jadwal?.tanggal
                        ? `${formatTanggal(selectedSertifikasi.jadwal.tanggal, lang, "UTC")}${
                            selectedSertifikasi.jadwal.waktu_mulai
                              ? `, ${selectedSertifikasi.jadwal.waktu_mulai}${selectedSertifikasi.jadwal.waktu_selesai ? `–${selectedSertifikasi.jadwal.waktu_selesai}` : ""} WIB`
                              : ""
                          }`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">TUK</p>
                    <p className="font-medium text-gray-900">
                      {selectedSertifikasi.jadwal?.tuk
                        ? [selectedSertifikasi.jadwal.tuk.nama, selectedSertifikasi.jadwal.tuk.kota].filter(Boolean).join(" - ")
                        : "-"}
                    </p>
                  </div>
                  {selectedSertifikasi.jadwal?.asesor && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Asesor</p>
                      <p className="font-medium text-gray-900">{selectedSertifikasi.jadwal.asesor}</p>
                    </div>
                  )}
                  {selectedSertifikasi.asesmen?.hasil && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Hasil Asesmen</p>
                      <p
                        className={`font-semibold ${selectedSertifikasi.asesmen.hasil === "kompeten" ? "text-[#78B51A]" : "text-red-500"}`}
                      >
                        {labelHasil[selectedSertifikasi.asesmen.hasil]}
                      </p>
                    </div>
                  )}
                  {selectedSertifikasi.catatan_admin && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-400 mb-1">Catatan Admin</p>
                      <p className="font-medium text-red-600">{selectedSertifikasi.catatan_admin}</p>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="pt-6 space-y-6">
                  {memuatDetail && <Loader2 className="h-6 w-6 animate-spin text-[#78B51A]" />}
                  {!memuatDetail &&
                    detail?.kode_pendaftaran === selectedSertifikasi.kode_pendaftaran &&
                    detail.timeline.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <span className="h-3 w-3 rounded-full bg-[#8CC63F] mt-1.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {step.judul}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatTanggal(step.tanggal, lang, "UTC")}
                          </p>
                          {step.keterangan && (
                            <p className="text-sm text-gray-600 mt-1">
                              {step.keterangan}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer lang={lang} />
      <FloatingContact />
    </div>
  );
}
