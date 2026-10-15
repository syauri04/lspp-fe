import React from "react";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

const FloatingContact = () => {
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999]">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 p-2 md:p-3.5 rounded-full md:rounded-[2rem] shadow-xl flex items-center gap-2.5 md:gap-4 transition-all duration-300 hover:scale-105 cursor-pointer group">
        <div className="relative w-10 h-10 md:w-14 md:h-14 bg-[#78B51A]/10 rounded-full flex items-center justify-center flex-shrink-0">
          <div className="relative w-6 h-6 md:w-10 md:h-10">
            <Image
              src="/images/technical-support.png"
              alt="CS Icon"
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute top-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
        </div>

        <div className="flex flex-col justify-center pr-2 md:pr-1">
          <h4 className="text-gray-900 font-bold text-xs md:text-base leading-tight">
            Sri Ayu
          </h4>

          <div className="flex flex-col md:gap-0.5 mt-0.5">
            <div className="flex items-center gap-1 text-gray-500">
              <Phone className="w-2.5 h-2.5 md:w-3 md:h-3" />
              <span className="text-[10px] md:text-sm font-medium tracking-tight">
                +6289981567112
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 text-gray-400">
              <Mail className="w-2.5 h-2.5 md:w-3 md:h-3" />
              <span className="text-[10px] md:text-xs">sri.ayu@lspp.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingContact;
