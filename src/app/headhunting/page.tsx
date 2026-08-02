import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { HeadhuntingLandingClient } from "@/components/headhunting/HeadhuntingLandingClient";

export const metadata: Metadata = {
  title: "헤드헌팅 | THE PHARMA Recruit.",
  description: "이력서 하나로 제약·바이오 기업과 헤드헌터로부터 포지션 제안을 받으세요.",
};

/**
 * 도달 불가 라우트 — 의도적으로 보존 중.
 * nav는 /headhunting/select만 가리키므로 이 페이지로 들어오는 링크는 없다.
 * 이전 헤드헌팅 랜딩의 디자인 요소를 참고용으로 남겨둔 것이므로 삭제하지 말 것.
 */
export default function HeadhuntingPage() {
  return (
    <>
      <Header />
      <HeadhuntingLandingClient />
    </>
  );
}
