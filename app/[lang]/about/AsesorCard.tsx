import Image from "next/image";

function AsesorCard({ name, reg, image }: any) {
  return (
    <div className="bg-white border border-gray-50 rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex items-center gap-6 hover:shadow-md transition-shadow">
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-100">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>

      <div className="flex-1">
        <h4 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
          {name}
        </h4>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          No. Reg: <span className="font-medium">{reg}</span>
        </p>
      </div>
    </div>
  );
}

export default AsesorCard;
