"use client";

import { ChevronUp } from "lucide-react";

const footerMenuItems = ["서비스 소개", "고객센터", "이용약관", "개인정보처리방침", "이메일무단수집거부"];

type MetaToken = { label?: string; value: string };

const metaLines: MetaToken[][] = [
  [
    { value: "서울시 관악구 봉천로 408-1, 3층-174A호(봉천동)" },
    { label: "대표전화", value: "010-6633-4711" },
    { label: "법인명", value: "주식회사 더파마뉴스" },
  ],
  [
    { label: "제호", value: "더파마뉴스" },
    { label: "사업자 등록번호", value: "570-86-03548" },
    { label: "인터넷신문 등록번호", value: "경기 아 54653" },
  ],
  [
    { label: "등록일", value: "2025.12.23" },
    { label: "문의", value: "recruit@thepharma.net" },
  ],
];

function FooterMetaLine({ tokens }: { tokens: MetaToken[] }) {
  return (
    <p>
      {tokens.map((token, index) => (
        <span key={`${token.value}-${index}`}>
          {index > 0 ? <span className="px-2.5 text-[#4a4a4a]">|</span> : null}
          {token.label ? <span className="text-[#8a8a8a]">{token.label}: </span> : null}
          <span className="text-[#b2b2b2]">{token.value}</span>
        </span>
      ))}
    </p>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-[#262626]">
      <div className="app-shell pt-14 pb-12">
        <nav aria-label="정책 메뉴" className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[13px]">
          {footerMenuItems.map((item) => (
            <span
              key={item}
              className="cursor-default text-[#cfcfcf]"
            >
              {item}
            </span>
          ))}
        </nav>

        <div className="mt-8 border-t-[0.5px] border-[#353535]" />

        <div className="mt-10 flex gap-12 max-[760px]:flex-col max-[760px]:gap-8">
          <div className="w-[210px] shrink-0 max-[760px]:w-full">
            <img src="/images/white_logo_1.svg" alt="더파마 리크루트" width={254} height={25} className="h-5 w-auto" />
            <p className="mt-3 text-[11px] text-[#8a8a8a]">대한민국 No.1 바이오/헬스케어 채용</p>
          </div>

          <div className="min-w-0 flex-1 text-[12px] leading-[2]">
            {metaLines.map((tokens, index) => (
              <FooterMetaLine key={index} tokens={tokens} />
            ))}
          </div>
        </div>

        <p className="mt-8 text-[12px] text-[#888888]">© 주식회사 더파마뉴스. All rights reserved.</p>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="페이지 상단으로 이동"
        className="absolute bottom-6 right-6 grid h-10 w-10 place-items-center rounded-full border-[0.5px] border-[#4a4a4a] bg-[#2e2e2e] transition-colors hover:bg-[#383838]"
      >
        <ChevronUp size={20} className="text-[#cfcfcf]" />
      </button>
    </footer>
  );
}
