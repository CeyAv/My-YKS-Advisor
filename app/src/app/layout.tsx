import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YKS Advisor — Kişiselleştirilmiş Üniversite Rehberliği",
  description:
    "YKS puanınıza ve ilgi alanlarınıza göre kişiselleştirilmiş üniversite ve bölüm önerileri alın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
