import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { HeadhuntingSelectClient } from "@/components/headhunting/HeadhuntingSelectClient";

export const metadata: Metadata = {
  title: "헤드헌팅 · THE PHARMA Recruit.",
  description: "제약·바이오 전문 헤드헌팅, 더파마 리크루트로 시작하세요.",
};

export default function HeadhuntingSelectPage() {
  return (
    <>
      <Header />
      <HeadhuntingSelectClient />
    </>
  );
}
