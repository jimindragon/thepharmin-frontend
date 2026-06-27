import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { HeadhuntingLandingClient } from "@/components/headhunting/HeadhuntingLandingClient";

export const metadata: Metadata = {
  title: "헤드헌팅 | THE PHARMA Recruit.",
  description: "이력서 하나로 제약·바이오 기업과 헤드헌터로부터 포지션 제안을 받으세요.",
};

export default function HeadhuntingPage() {
  return (
    <>
      <Header />
      <HeadhuntingLandingClient />
    </>
  );
}
