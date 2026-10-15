"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SertifikasiProps {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: string;
  image: string;
  lang: string;
}

export default function SertifikasiCard({ data }: { data: SertifikasiProps }) {
  const router = useRouter();

  console.log("SertifikasiCard data:", data.image);
  return (
    <Card className="group relative flex flex-col h-full border-none bg-white overflow-hidden transition-all duration-500 ease-out rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] cursor-pointer">
      <Link
        href={`/${data.lang}/sertifikasi/skema-sertifikasi/${data.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`Detail ${data.title}`}
      />

      <div className="relative aspect-[1.5/1] w-full overflow-hidden p-4 pb-0">
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          <Image
            src={data.image}
            alt={data.title}
            fill
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        </div>
      </div>

      <CardHeader className="space-y-1 px-6 pt-4 pb-2 flex-grow">
        <CardTitle className="text-[15px] font-bold text-gray-700 transition-colors duration-300 group-hover:text-[#82B124] line-clamp-1">
          {data.title}
        </CardTitle>
        <CardDescription className="text-[13px] line-clamp-2 text-gray-400 leading-snug">
          {data.description}
        </CardDescription>
        <p className="text-[#A67B6F] font-medium text-[13px] mt-1">
          {data.price}
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-2 z-20">
        <div className="flex items-center gap-3">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(
                `/${data.lang}/sertifikasi/skema-sertifikasi/${data.slug}/daftar`,
              );
            }}
            className="flex-1 bg-[#82B124] hover:bg-[#729c1f] text-white rounded-xl h-11 text-[13px] font-bold shadow-md shadow-[#82B124]/10 transition-all duration-300 active:scale-95 relative z-30"
          >
            Daftar Sertifikasi
          </Button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="text-[#82B124] hover:scale-125 transition-transform duration-300 p-1 outline-none relative z-30"
          >
            <Bookmark className="h-7 w-7 stroke-[1.5px] group-hover:fill-[#82B124]/5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
