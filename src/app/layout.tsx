import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "THE PHARMA Recruit.",
  description: "제약·바이오 전문 채용공고 목록",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
