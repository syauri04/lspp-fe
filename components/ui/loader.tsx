"use client";

import { useState, useEffect } from "react";

export default function GlobalLoader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md transition-all duration-500">
      <div className="relative flex items-center justify-center h-24 w-24">
        <div className="absolute inset-0 rounded-full border border-[#78B51A]/30 animate-ping opacity-75" />

        <div className="absolute inset-2 rounded-full border-2 border-t-[#78B51A] border-r-transparent border-b-transparent border-l-transparent animate-spin duration-1000" />

        <div className="absolute inset-4 rounded-full border border-b-[#78B51A]/60 border-t-transparent border-r-transparent border-l-transparent animate-spin [animation-direction:reverse] duration-1500" />

        <div className="h-3 w-3 rounded-full bg-[#78B51A] shadow-[0_0_15px_rgba(120,181,26,0.8)]" />
      </div>

      <div className="mt-2 flex flex-col items-center gap-1.5">
        <span className="text-xs font-semibold tracking-[0.2em] text-gray-800 uppercase pl-[0.2em]">
          LSPP 306
        </span>
        <div className="h-[2px] w-4 bg-[#78B51A] rounded-full animate-pulse" />
      </div>
    </div>
  );
}
