"use client";

import { useState, useEffect, use } from "react";
import Footer from "@/components/Footer";
import Image from "next/image";

import TeamCard from "./TeamCard";
import TUKCard from "./TUKCard";
import AsesorCard from "./AsesorCard";
import AsesiSection from "./AsesiSection";
import FloatingContact from "@/components/FloatingContact";
import Navigation from "@/components/navigation";
import { getDictionary } from "../dictionaries";
import {
  AboutDetailData,
  getAboutDetail,
  getOrganization,
  getTUKLocations,
  OrganizationDivision,
  TUKLocationItem,
} from "@/service/about.service";

interface AboutPageProps {
  params: Promise<{ lang: "id" | "en" }>;
}

export default function AboutPage({ params }: AboutPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;

  const [dict, setDict] = useState<any>(null);
  const [aboutDetail, setAboutDetail] = useState<AboutDetailData | null>(null);
  const [organization, setOrganization] = useState<OrganizationDivision[]>([]);
  const [tukLocations, setTUKLocations] = useState<TUKLocationItem[]>([]);

  useEffect(() => {
    getDictionary(lang).then((data) => {
      setDict(data);
    });

    getAboutDetail().then((data) => {
      setAboutDetail(data);
    });

    getOrganization().then((data) => {
      setOrganization(data);
    });

    getTUKLocations().then((data) => {
      setTUKLocations(data);
    });
  }, [lang]);

  if (
    !dict ||
    !aboutDetail ||
    organization.length === 0 ||
    tukLocations.length === 0
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation lang={lang} dict={dict} />

      <section className="relative w-full min-h-[600px] md:min-h-[750px] flex items-center overflow-hidden bg-[#78B51A]">
        <div className="absolute inset-0 z-0">
          <Image
            src={aboutDetail.background_image}
            alt="About Background"
            fill
            className="object-cover object-right"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#78B51A] via-[#78B51A] via-[#78B51A]/95 to-transparent to-[85%]" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-16 lg:px-24 py-20">
          <div className="max-w-2xl lg:max-w-3xl text-white">
            <h2 className="text-lg md:text-xl font-medium mb-2 opacity-90">
              {dict.about.mainTitle}
            </h2>

            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-[1.1] tracking-tight">
              {aboutDetail.title[lang] || aboutDetail.title["id"]}
            </h1>

            {/* Render Deskripsi HTML Detail dari API */}
            <div
              className="space-y-6 text-white/90 text-base md:text-lg leading-relaxed parser-container"
              dangerouslySetInnerHTML={{
                __html:
                  aboutDetail.desc_detail[lang] ||
                  aboutDetail.desc_detail["id"],
              }}
            />
          </div>
        </div>
      </section>

      {/* SECTION VISI & MISI */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          {/* VISI */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 mb-32">
            <div className="w-full md:w-1/2">
              <div className="relative aspect-[3/3] w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
                <Image
                  src={aboutDetail.image_vision}
                  alt="Visi"
                  fill
                  className="object-cover object-center"
                  unoptimized
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-6">
              <div className="inline-block bg-[#78B51A] text-white px-8 py-2 rounded-lg font-bold text-xl shadow-md">
                {dict.about.visionMission.vision}
              </div>
              <div
                className="text-gray-600 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{
                  __html: aboutDetail.vision[lang] || aboutDetail.vision["id"],
                }}
              />
            </div>
          </div>

          {/* MISI */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2 space-y-6">
              <div className="inline-block bg-[#78B51A] text-white px-8 py-2 rounded-lg font-bold text-xl shadow-md">
                {dict.about.visionMission.mission}
              </div>
              <div
                className="prose max-w-none text-gray-600 text-lg list-container
                           [&>ul]:space-y-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:marker:text-[#78B51A]"
                dangerouslySetInnerHTML={{
                  __html:
                    aboutDetail.mission[lang] || aboutDetail.mission["id"],
                }}
              />
            </div>

            <div className="w-full md:w-1/2">
              <div className="relative aspect-[3/3] w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
                <Image
                  src={aboutDetail.image_mission}
                  alt="Misi"
                  fill
                  className="object-cover object-center"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION STRUKTUR ORGANISASI (Dinamis Berdasarkan Divisi API) */}
      {/* <section className="py-24 bg-[#78B51A]">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            {dict.about.structure.title}
          </h2>

          {organization.map((division, divIndex) => (
            <div key={divIndex} className="mb-20 last:mb-0">
              <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/20 pb-2">
                {division.division_name[lang] || division.division_name["id"]}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {division.members.map((member, memIndex) => (
                  <TeamCard
                    key={memIndex}
                    name={member.name}
                    role={member.position[lang] || member.position["id"]}
                    image={member.photo}
                    linkedin={member.linkedin_url}
                    instagram={member.instagram_url}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section> */}

      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            {dict.about.structure.title}
          </h2>

          <Image
            src="/images/Struktur Organisasi.png"
            alt="Struktur Organisasi"
            width={1200}
            height={800}
            className="w-full h-auto object-contain rounded-lg"
            priority
          />
        </div>
      </section>

      {/* SECTION LOKASI TUK */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          <div className="mb-12">
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              {dict.about.tukSection.title}
            </h3>
            <div className="relative inline-block pr-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-700 pb-4">
                {dict.about.tukSection.subtitle}
              </h2>
              <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gray-300"></div>
            </div>
          </div>

          <div className="relative">
            <div
              className="h-[500px] overflow-y-auto pr-4 pl-10 space-y-6 [direction:rtl] 
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-gray-500
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:bg-gray-600"
            >
              <div className="[direction:ltr]">
                <div className="space-y-6">
                  {tukLocations.map((location, index) => (
                    <TUKCard
                      key={index}
                      title={`${location.title} - ${location.city}`}
                      address={location.address}
                      schedule={`${location.open_days} (${location.open_hours})`}
                      code={`MAPS`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION DAFTAR ASESOR (Dibiarkan Statis / Placeholder Sementara Sesuai Kode Asal) */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
          <div className="mb-8">
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              {dict.about.assessorSection.title}
            </h3>
            <div className="relative inline-block pr-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-700 pb-4">
                {dict.about.assessorSection.subtitle}
              </h2>
              <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gray-300"></div>
            </div>
          </div>

          <div className="mb-10 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder={dict.about.assessorSection.searchPlaceholder}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              className="h-[600px] overflow-y-auto pr-4 pl-10 [direction:rtl] 
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-gray-50
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-gray-400
              [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              <div className="[direction:ltr] space-y-4">
                <AsesorCard
                  name="Ahmad Santoso, S.T., M.T."
                  reg="MET.000.001234"
                  image="/images/avatar/avatar-1.jpg"
                />
                <AsesorCard
                  name="Rudi Hartono, S.Par., M.Par."
                  reg="MET.000.003456"
                  image="/images/avatar/avatar-2.jpg"
                />
                <AsesorCard
                  name="Budi Prasetyo, S.Par., M.Eng."
                  reg="MET.000.005678"
                  image="/images/avatar/avatar-3.jpg"
                />
                <AsesorCard
                  name="Dewi Puspitasari, S.E., M.M."
                  reg="MET.000.002345"
                  image="/images/avatar/avatar-4.jpg"
                />
                <AsesorCard
                  name="Ahmad Santoso, S.T., M.T."
                  reg="MET.000.001234"
                  image="/images/avatar/avatar-1.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <AsesiSection />
      <Footer lang={lang} />
      <FloatingContact />
    </div>
  );
}
