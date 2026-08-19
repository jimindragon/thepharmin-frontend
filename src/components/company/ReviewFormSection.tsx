import type { ReactNode } from "react";

/**
 * 후기 작성 폼(ReviewWriteClient·PharmacyReviewFormSections)이 공유하는 섹션 셸과 입력 클래스.
 *
 * ReviewWriteClient 안에 있던 것을 그대로 꺼낸 것이다 — 약국 재직 후기 폼이 같은 셸을 쓰는데,
 * 그쪽이 ReviewWriteClient에서 import하면 두 모듈이 서로를 가리키는 순환이 생긴다.
 * 마크업·클래스는 한 글자도 바뀌지 않았으므로 기존 세 트랙의 렌더 결과는 그대로다.
 */

export const TEXTAREA_CLASS =
  "h-auto w-full resize-y border border-[#d8e0e8] bg-white px-3.5 py-2.5 text-[15px] font-normal leading-relaxed text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]";

/** 폼 안 select의 공통 외형. 면접 후기 섹션은 같은 문자열을 인라인으로 들고 있다 —
 * 이번 단계의 범위가 약국 재직 후기라 그쪽 마크업은 손대지 않는다. */
export const SELECT_CLASS =
  "h-11 w-full appearance-none border border-[#d8e0e8] bg-white px-3.5 pr-9 text-[13px] font-normal text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]";

/** 후기 작성 폼 전용 섹션 래퍼. 좌측 열(번호+제목+안내)과 우측 열(입력 영역) 2컬럼 배치.
 * BusinessFormControls의 SectionCard와 시각 톤(흰 배경·얇은 보더·radius 0)만 맞추고, 기업 폼 11곳이 공유하는 그 컴포넌트는 건드리지 않기 위해 후기 폼 안에서만 쓰는 컴포넌트다.
 *
 * description은 없어도 된다 — 제목만으로 충분한 문항 섹션(약국 폼의 종합 평가·근무 환경 등)이
 * 빈 안내 칸의 여백을 얹지 않도록, 값이 있을 때만 그 자리를 만든다. */
export function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-border bg-white p-6 shadow-[var(--shadow)] max-[760px]:p-4">
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <div>
          <p className="text-[12px] font-normal tracking-[0.02em] text-[#a0a9b7]">{number}</p>
          <h2 className="mt-1.5 text-[17px] font-bold tracking-[-0.02em] text-[#1f2733]">{title}</h2>
          {description ? (
            <div className="mt-2 grid gap-1 text-[13px] font-normal leading-[1.65] text-[#7b8491]">{description}</div>
          ) : null}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}
