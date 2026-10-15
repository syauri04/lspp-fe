import { Instagram, Linkedin } from "lucide-react";
import Image from "next/image";

const TeamCard = ({ name, role, image, linkedin, instagram }: any) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-square w-full">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>

      <div className="p-4">
        <h4 className="font-bold text-gray-800 text-sm md:text-base leading-tight">
          {name}
        </h4>
        <p className="text-gray-500 text-xs mt-1 mb-4">{role}</p>

        <div className="flex gap-3">
          <a
            href={linkedin || "#"}
            className="text-gray-400 hover:text-[#0077b5] transition-colors"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin size={18} strokeWidth={2.5} />
          </a>

          <a
            href={instagram || "#"}
            className="text-gray-400 hover:text-[#e4405f] transition-colors"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={18} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
