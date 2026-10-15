"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function AsesiSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const allData = [
    {
      no: 1,
      nama: "Ahmad Fauzi",
      nomor: "LSP-PAR/001/IV/2024",
      kompetensi: "Pemandu Wisata Budaya dan Heritage",
      masa: "15 April 2024 – 15 April 2027",
    },
    {
      no: 2,
      nama: "Budi Santoso",
      nomor: "LSP-PAR/002/IV/2024",
      kompetensi: "Resepsionis Hotel Bintang",
      masa: "20 April 2024 – 20 April 2027",
    },
    {
      no: 3,
      nama: "Dewi Anggraini",
      nomor: "LSP-PAR/003/V/2024",
      kompetensi: "Food & Beverage Service",
      masa: "3 Mei 2024 – 3 Mei 2027",
    },
    {
      no: 4,
      nama: "Dimas Prasetyo",
      nomor: "LSP-PAR/004/V/2024",
      kompetensi: "Pemandu Wisata Bahari dan Selam",
      masa: "10 Mei 2024 – 10 Mei 2027",
    },
    {
      no: 5,
      nama: "Fitriani Hasanah",
      nomor: "LSP-PAR/005/VI/2024",
      kompetensi: "Tour Leader Perjalanan Wisata Domestik",
      masa: "1 Juni 2024 – 1 Juni 2027",
    },
    {
      no: 6,
      nama: "Lestari Wulandari",
      nomor: "LSP-PAR/006/VI/2024",
      kompetensi: "Housekeeping Supervisor",
      masa: "12 Juni 2024 – 12 Juni 2027",
    },
    {
      no: 7,
      nama: "Muhammad Irfan",
      nomor: "LSP-PAR/007/VII/2024",
      kompetensi: "MICE Organizer",
      masa: "5 Juli 2024 – 5 Juli 2027",
    },
    {
      no: 8,
      nama: "Ni Luh Putu Ayu",
      nomor: "LSP-PAR/008/VIII/2024",
      kompetensi: "Terapis Spa dan Wellness",
      masa: "1 Juni 2024 – 1 Juni 2027",
    },
    {
      no: 9,
      nama: "Rizky Maulana",
      nomor: "LSP-PAR/009/IX/2024",
      kompetensi: "Pengelola Desa Wisata",
      masa: "20 April 2024 – 20 April 2027",
    },
    {
      no: 10,
      nama: "Sari Dewi Rahayu",
      nomor: "LSP-PAR/010/X/2024",
      kompetensi: "Barista Profesional",
      masa: "15 April 2024 – 15 April 2027",
    },
    {
      no: 11,
      nama: "Andi Wijaya",
      nomor: "LSP-PAR/011/X/2024",
      kompetensi: "Chef de Partie",
      masa: "1 Mei 2024 – 1 Mei 2027",
    },
    {
      no: 12,
      nama: "Siti Aminah",
      nomor: "LSP-PAR/012/XI/2024",
      kompetensi: "Pastry Chef",
      masa: "10 Mei 2024 – 10 Mei 2027",
    },
    {
      no: 13,
      nama: "Hendra Kurniawan",
      nomor: "LSP-PAR/013/XI/2024",
      kompetensi: "Front Office Manager",
      masa: "15 Mei 2024 – 15 Mei 2027",
    },
    {
      no: 14,
      nama: "Maya Saputri",
      nomor: "LSP-PAR/014/XII/2024",
      kompetensi: "Digital Marketing Tourism",
      masa: "20 Mei 2024 – 20 Mei 2027",
    },
    {
      no: 15,
      nama: "Eko Prasetyo",
      nomor: "LSP-PAR/015/XII/2024",
      kompetensi: "Travel Consultant",
      masa: "25 Mei 2024 – 25 Mei 2027",
    },
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allData.length / itemsPerPage);

  return (
    <section className="py-24 ">
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
        <div className="mb-12">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Asesi</h3>
          <div className="relative inline-block pr-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700 pb-4">
              Daftar Pemegang Sertifikat
            </h2>
            <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gray-300"></div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-[#638929] shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#90C63D] text-white">
                <th className="py-4 px-6 font-semibold border-r border-[#638929] text-center w-16">
                  No
                </th>
                <th className="py-4 px-6 font-semibold border-r border-[#638929]">
                  Nama
                </th>
                <th className="py-4 px-6 font-semibold border-r border-[#638929]">
                  Nomor Sertifikat
                </th>
                <th className="py-4 px-6 font-semibold border-r border-[#638929]">
                  Kompetensi
                </th>
                <th className="py-4 px-6 font-semibold">
                  Masa Aktif Sertifikat
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {currentItems.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-[#638929] hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6 border-r border-[#638929] text-center">
                    {item.no}
                  </td>
                  <td className="py-4 px-6 border-r border-[#638929] font-medium">
                    {item.nama}
                  </td>
                  <td className="py-4 px-6 border-r border-[#638929]">
                    {item.nomor}
                  </td>
                  <td className="py-4 px-6 border-r border-[#638929]">
                    {item.kompetensi}
                  </td>
                  <td className="py-4 px-6">{item.masa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-[#90C63D] text-white disabled:opacity-50 hover:bg-[#8da84a] transition-colors"
          >
            <ChevronsLeft size={20} />
          </button>

          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-[#90C63D] text-white disabled:opacity-50 hover:bg-[#8da84a] transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-md font-medium transition-all ${
                currentPage === i + 1
                  ? "bg-[#90C63D] text-white shadow-md"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next Page */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-[#90C63D] text-white disabled:opacity-50 hover:bg-[#8da84a] transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          {/* Last Page */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-[#90C63D] text-white disabled:opacity-50 hover:bg-[#8da84a] transition-colors"
          >
            <ChevronsRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
