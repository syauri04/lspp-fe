"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import Navigation from "@/components/navigation";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

interface ProfilePageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

const skemaData = [
  {
    id: 1,
    title: "Tour Leader Perjalanan Wisata Domestik",
    expiryDate: "13 Januari 2028",
    image: "/images/skema/skema1.png",
  },
  {
    id: 2,
    title: "Pemandu Wisata Alam Petualangan",
    expiryDate: "13 Januari 2028",
    image: "/images/skema/skema2.png",
  },
  {
    id: 3,
    title: "Resepsionis Hotel Bintang",
    expiryDate: "13 Januari 2028",
    image: "/images/skema/skema3.png",
  },
];
const notifikasiData = [
  {
    id: 1,
    isRead: false,
    message: (
      <>
        Pengajuan assesmen{" "}
        <strong className="font-semibold text-gray-900">
          Sertifikasi Profesi Waiter (Pelayan Restoran)
        </strong>{" "}
        anda disetujui! Silahkan melakukan pembayaran untuk melanjutkan proses
        sertifikasi
      </>
    ),
  },
  {
    id: 2,
    isRead: true,
    message:
      "E-Sertifikat anda akan segera Kadaluarsa! silahkan melakukan perpanjangan sertifikat anda",
  },
  {
    id: 3,
    isRead: true,
    message: (
      <>
        Assesmen{" "}
        <strong className="font-semibold text-gray-900">
          Sertifikasi Profesi Waiter (Pelayan Restoran)
        </strong>{" "}
        akan dilaksanakan 3 Hari Lagi!
      </>
    ),
  },
];

const sertifikasiData = [
  {
    id: 1,
    title: "Sertifikasi Housekeeping",
    date: "1 April 2026",
    status: "selesai",
    image: "/images/sertifikasi/serti-1.png",
    batch: "Batch 1 / 2026",
    tuk: "TUK Sewaktu - Yogyakarta",
    detailDate: "12 April 2026",
    timeline: [
      {
        title: "Pengajuan Sertifikasi",
        date: "25 Maret 2026",
        desc: "Menunggu Persetujuan",
      },
      {
        title: "Pendaftaran diterima",
        date: "30 Maret 2026",
        desc: "Berkas lengkap dan valid.",
      },
      {
        title: "Penjadwalan asesmen",
        date: "2 April 2026",
        desc: "Asesmen dilaksanakan 12 April 2026.",
      },
      {
        title: "Asesmen kompetensi",
        date: "12 April 2026",
        desc: "Uji teori dan praktik selesai.",
      },
      {
        title: "Pengumuman hasil",
        date: "15 April 2026",
        desc: "Dinyatakan KOMPETEN. Sertifikat sedang diproses.",
      },
    ],
  },
  {
    id: 2,
    title: "Sertifikasi Resepsionis",
    date: "1 April 2026",
    status: "pengajuan_diterima",
    image: "/images/sertifikasi/serti-2.png",
    batch: "Batch 2 / 2026",
    tuk: "TUK Sewaktu - Yogyakarta",
    detailDate: "-",
    timeline: [
      {
        title: "Pengajuan Sertifikasi",
        date: "1 April 2026",
        desc: "Pengajuan diterima, menunggu jadwal asesmen.",
      },
    ],
  },
  {
    id: 3,
    title: "Sertifikasi Housekeeping",
    date: "1 April 2026",
    status: "diajukan",
    image: "/images/sertifikasi/serti-1.png",
    batch: "Batch 3 / 2026",
    tuk: "TUK Sewaktu - Yogyakarta",
    detailDate: "-",
    timeline: [
      {
        title: "Pengajuan Sertifikasi",
        date: "5 April 2026",
        desc: "Menunggu Persetujuan",
      },
    ],
  },
];

const filterOptions = [
  { key: "pengajuan_diterima", label: "Pengajuan Diterima" },
  { key: "selesai", label: "Selesai" },
  { key: "diajukan", label: "Diajukan" },
];

const statusBadgeStyle: Record<string, string> = {
  selesai: "bg-[#8CC63F] text-white",
  pengajuan_diterima: "bg-white text-[#78B51A] border border-[#8CC63F]",
  diajukan: "bg-gray-100 text-gray-500 border border-gray-200",
};

const statusLabel: Record<string, string> = {
  selesai: "Selesai",
  pengajuan_diterima: "Pengajuan diterima",
  diajukan: "Diajukan",
};

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
  const [activeFilter, setActiveFilter] = useState<String>("selesai");
  const [selectedSertifikasi, setSelectedSertifikasi] = useState<
    (typeof sertifikasiData)[number] | null
  >(sertifikasiData[0] || null);

  const filteredSertifikasi = sertifikasiData.filter(
    (item) => item.status === activeFilter,
  );

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

  useEffect(() => {
    if (filteredSertifikasi.length > 0) {
      setSelectedSertifikasi(filteredSertifikasi[0]);
    } else {
      setSelectedSertifikasi(null);
    }
  }, [activeFilter]);

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

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            {dict.profile.schemesFollowed}
          </h2>

          <div className="relative -mx-6 md:-mx-16 lg:-mx-24">
            <div className="flex gap-6 overflow-x-auto pb-4 px-6 md:px-16 lg:px-24 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {skemaData.map((skema) => (
                <div
                  key={skema.id}
                  className="bg-white rounded-2xl shadow-md p-4 flex flex-col flex-shrink-0 w-[280px] snap-start"
                >
                  <div className="w-full h-40 relative flex-shrink-0">
                    <Image
                      src={skema.image}
                      alt={skema.title}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between mt-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
                        {skema.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {dict.profile.validUntil} {skema.expiryDate}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#78B51A] text-white rounded-lg hover:bg-[#669a16] transition-colors font-semibold text-sm w-full"
                    >
                      <Download className="h-4 w-4" />{" "}
                      {dict.profile.downloadCertificate}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              {notifikasiData.map((notif) => (
                <div
                  key={notif.id}
                  className={`rounded-xl px-6 py-4 flex items-start gap-3 ${
                    notif.isRead
                      ? "bg-gray-200"
                      : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  )}
                  <p className="text-gray-700 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-8 px-6 py-2.5 bg-[#8CC63F] text-white rounded-lg font-semibold hover:bg-[#78B51A] transition-colors"
            >
              Selengkapnya
            </button>
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
              </button>
            ))}
          </div>

          <div className="relative -mx-6 md:-mx-16 lg:-mx-24">
            <div className="flex gap-4 overflow-x-auto pb-4 px-6 md:px-16 lg:px-24 snap-x snap-mandatory">
              {filteredSertifikasi.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedSertifikasi(item)}
                  className={`text-left flex-shrink-0 w-[380px] snap-start bg-white rounded-2xl shadow-sm border overflow-hidden flex transition-all ${
                    selectedSertifikasi?.id === item.id
                      ? "border-[#8CC63F] ring-1 ring-[#8CC63F]"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="w-32 h-full relative flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col gap-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">
                      {item.title}
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={14} /> {item.date}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-md text-xs font-medium ${statusBadgeStyle[item.status]}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {statusLabel[item.status]}
                    </span>
                    {item.status === "pengajuan_diterima" && (
                      <span className="mt-1 inline-flex items-center justify-center w-fit px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#8CC63F] text-white">
                        Mulai Asesmen
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedSertifikasi && (
            <div className="mt-6 bg-gray-50 rounded-3xl p-6 md:p-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={selectedSertifikasi.image}
                        alt={selectedSertifikasi.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedSertifikasi.title}
                      </h3>
                      <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <Calendar size={14} /> {selectedSertifikasi.detailDate}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium flex-shrink-0 ${statusBadgeStyle[selectedSertifikasi.status]}`}
                  >
                    {statusLabel[selectedSertifikasi.status]}
                  </span>
                </div>

                {/* Batch & TUK */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Batch</p>
                    <p className="font-medium text-gray-900">
                      {selectedSertifikasi.batch}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">TUK</p>
                    <p className="font-medium text-gray-900">
                      {selectedSertifikasi.tuk}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="pt-6 space-y-6">
                  {selectedSertifikasi.timeline.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <span className="h-3 w-3 rounded-full bg-[#8CC63F] mt-1.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {step.date}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {step.desc}
                        </p>
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
