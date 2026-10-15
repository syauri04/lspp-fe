import { NewsItem } from "@/service/berita.service";
import Image from "next/image";
import Link from "next/link";

interface NewsCardProps {
  item: NewsItem;
  lang: "id" | "en";
}

export default function NewsCard({ item, lang }: NewsCardProps) {
  const title = item.title[lang] || item.title["id"];
  const summary = item.summary[lang] || item.summary["id"];

  return (
    <Link href={`/${lang}/berita/${item.slug}`}>
      <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-transform duration-300 hover:-translate-y-2">
        <Image
          src={item.image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#78B51A]/90 via-[#78B51A]/40 to-transparent flex flex-col justify-end p-6">
          <span className="text-white/70 text-xs mb-1 font-medium">
            {item.date}
          </span>
          <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2">
            {title}
          </h3>
          <p className="text-white/80 text-sm line-clamp-2">{summary}</p>
        </div>
      </div>
    </Link>
  );
}
