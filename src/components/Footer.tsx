"use client";

import clsx from "clsx";
import { ChevronUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sharedRoutes } from "@/config/routes";

/**
 * href가 없는 항목은 아직 대응 라우트가 없다는 뜻이고, 지금까지처럼 클릭되지 않는 텍스트로 남는다.
 * 고객센터만 sharedRoutes를 거친다 — 여러 화면이 함께 가리키는 경로라서다(config/routes.ts).
 * 약관 3개는 푸터만 쓰므로 sharedRoutes에 넣지 않고 여기 문자열로 둔다.
 */
const footerMenuItems: { label: string; href?: string }[] = [
  { label: "서비스 소개" },
  { label: "고객센터", href: sharedRoutes.support },
  { label: "이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/terms/privacy" },
  { label: "이메일무단수집거부", href: "/terms/email" },
];

type MetaToken = { label?: string; value: string };

const ADDRESS: MetaToken = { value: "서울시 관악구 봉천로 408-1, 3층-174A호(봉천동)" };
const PHONE: MetaToken = { label: "대표전화", value: "010-6633-4711" };
const CORP: MetaToken = { label: "법인명", value: "주식회사 더파마뉴스" };
const TITLE: MetaToken = { label: "제호", value: "더파마뉴스" };
const BIZ_NO: MetaToken = { label: "사업자 등록번호", value: "570-86-03548" };
const PRESS_NO: MetaToken = { label: "인터넷신문 등록번호", value: "경기 아 54653" };
const REG_DATE: MetaToken = { label: "등록일", value: "2025.12.23" };
const CONTACT: MetaToken = { label: "문의", value: "recruit@thepharma.net" };

// 데스크톱: 기존 3줄 구성 그대로
const metaLinesDesktop: MetaToken[][] = [
  [ADDRESS, PHONE, CORP],
  [TITLE, BIZ_NO, PRESS_NO],
  [REG_DATE, CONTACT],
];

// 모바일: 5줄 구성
const metaLinesMobile: MetaToken[][] = [
  [ADDRESS],
  [PHONE, CORP],
  [TITLE, BIZ_NO],
  [PRESS_NO, REG_DATE],
  [CONTACT],
];

function FooterMetaLine({ tokens }: { tokens: MetaToken[] }) {
  return (
    <p>
      {tokens.map((token, index) => (
        <span key={`${token.value}-${index}`} className="whitespace-nowrap">
          {index > 0 ? <span className="px-2.5 text-[#4a4a4a]">|</span> : null}
          {token.label ? <span className="text-[#8a8a8a]">{token.label}: </span> : null}
          <span className="text-[#b2b2b2]">{token.value}</span>
        </span>
      ))}
    </p>
  );
}

/**
 * 맨 위로 버튼은 한 화면 넘게 내려왔을 때만 꺼낸다 — 첫 화면에서는 올라갈 곳이 없어 방해만 된다.
 * 마운트 직후에도 한 번 판정한다: 새로고침이 스크롤 위치를 복원하면 이벤트 없이 중간에 서 있게 된다.
 */
function useScrolledPastViewport() {
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const update = () => setScrolledPast(window.scrollY > window.innerHeight);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return scrolledPast;
}

export function Footer() {
  const showScrollTop = useScrolledPastViewport();

  return (
    <footer className="relative bg-[#262626]">
      <div className="app-shell pt-14 pb-12">
        <nav aria-label="정책 메뉴" className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[15px]">
          {footerMenuItems.map((item) =>
            item.href ? (
              // cursor-default는 "클릭 대상 아님"을 뜻하므로 링크가 되는 항목에서는 뺀다.
              <Link key={item.label} href={item.href} className="text-[#cfcfcf] transition hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span key={item.label} className="cursor-default text-[#cfcfcf]">
                {item.label}
              </span>
            ),
          )}
        </nav>

        <div className="mt-8 border-t-[0.5px] border-[#353535]" />

        <div className="mt-10 flex gap-12 max-[760px]:flex-col max-[760px]:gap-8">
          <div className="w-[210px] shrink-0 max-[760px]:w-full">
            <img src="/images/white_logo_1.svg" alt="더파마 리크루트" width={254} height={25} className="h-5 w-auto" />
            <p className="mt-3 text-[12px] text-[#8a8a8a]">대한민국 No.1 바이오/헬스케어 채용</p>
          </div>

          <div className="min-w-0 flex-1 text-[13px] leading-[2]">
            <div className="max-[760px]:hidden">
              {metaLinesDesktop.map((tokens, index) => (
                <FooterMetaLine key={index} tokens={tokens} />
              ))}
            </div>
            <div className="hidden max-[760px]:block">
              {metaLinesMobile.map((tokens, index) => (
                <FooterMetaLine key={index} tokens={tokens} />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-[13px] text-[#888888]">© 주식회사 더파마뉴스. All rights reserved.</p>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="페이지 상단으로 이동"
        className={clsx(
          // fixed라 <footer>의 relative와 무관하게 뷰포트에 붙는다. z-50은 헤더와 같은 층 —
          // 모달(z-[70])보다는 아래라 모달이 뜬 동안 위로 튀어나오지 않는다.
          "fixed bottom-6 right-6 z-50 grid h-10 w-10 place-items-center rounded-full border-[0.5px] border-[#4a4a4a] bg-[#2e2e2e]",
          // 761px 미만에서 하단 탭바(fixed bottom-0 z-40, 56px+safe-area)를 피해 위로 올린다.
          "max-[760px]:bottom-[calc(76px+env(safe-area-inset-bottom)+16px)]",
          "transition-[background-color,opacity] hover:bg-[#383838]",
          showScrollTop ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <ChevronUp size={20} className="text-[#cfcfcf]" />
      </button>
    </footer>
  );
}
