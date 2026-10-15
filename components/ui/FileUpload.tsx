"use client";

import { useState } from "react";
import { Upload, FileCheck2 } from "lucide-react";

interface FileUploadProps {
  label: string;
  placeholder: string;
  onFileChange?: (file: File | null) => void;
  accept?: string;
}

export default function FileUpload({
  label,
  placeholder,
  onFileChange,
  accept,
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFileName(file ? file.name : null);
    onFileChange?.(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative group">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-white group-hover:border-[#82B124] transition-all">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-[#82B124]/10">
              {fileName ? (
                <FileCheck2 className="h-4 w-4 text-[#82B124]" />
              ) : (
                <Upload className="h-4 w-4 text-gray-400 group-hover:text-[#82B124]" />
              )}
            </div>
            <span
              className={`text-sm truncate ${
                fileName ? "text-gray-700 font-medium" : "text-gray-400"
              }`}
            >
              {fileName ?? placeholder}
            </span>
          </div>
          <span className="text-xs text-[#82B124] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            {fileName ? "Ganti File" : "Pilih File"}
          </span>
        </div>
      </div>
    </div>
  );
}
