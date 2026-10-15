import type React from "react";
import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "../globals.css";
import { Suspense } from "react";
import GlobalLoader from "@/components/ui/loader";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GoogleAuthProvider } from "@/components/GoogleAuthProvider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LSPP 306 - Sertifikasi Pariwisata Global",
  description:
    "Mempersiapkan tenaga kerja pariwisata yang kompeten, kompetitif, dan beretika untuk menjawab tantangan industri pariwisata di tingkat nasional maupun internasional.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${openSans.variable} antialiased`}
    >
      <body>
        <GoogleAuthProvider>
          <AuthProvider>
            <Suspense fallback={<GlobalLoader />}>{children}</Suspense>
            <Toaster />
          </AuthProvider>
        </GoogleAuthProvider>

        <GoogleAnalytics gaId="G-DRXHS8X1SM" />
      </body>
    </html>
  );
}
