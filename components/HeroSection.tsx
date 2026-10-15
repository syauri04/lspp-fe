import Image from "next/image";

const HeroSection = ({ page, description }: any) => {
  return (
    <section className="relative w-full min-h-[300px] md:min-h-[500px] flex items-center overflow-hidden bg-[#78B51A]">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/pesawat.png"
          alt="Berita Background"
          fill
          className="object-cover object-right"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#78B51A] via-[#78B51A]/80 to-transparent md:to-[60%]" />
      </div>

      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24 py-20">
        <div className="max-w-xl lg:max-w-2xl text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
            {page}
          </h1>

          <div className="space-y-6 text-white/95">
            <p className="text-base md:text-lg leading-relaxed font-medium">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
