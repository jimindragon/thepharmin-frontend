"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/**
 * ≤760px 기업 개요 본문의 "더보기 → 인라인 펼침" 셸. 공고·기업 리뷰·관련 뉴스·면접 후기 네 섹션이 공유한다.
 *
 * 그 폭에서 네 섹션은 "2~3건만 보여주고 전체는 다른 화면"이라, 하나 더 보려면 개요를 떠났다가 돌아와야 했다.
 * 목록 라우트(/jobs·/reviews·/news·/interviews)는 외부 진입·딥링크·데스크톱용으로 그대로 두고, 이 폭에서만
 * 같은 자리에서 펼치게 한다. 761px 이상은 손대지 않는다 — 그쪽은 라우트 탭 행이 화면 위에 계속 떠 있어
 * 미리보기와 "전체 보기"가 본문에 함께 있어도 오갈 비용이 낮다.
 *
 * 두 슬롯은 **호출부(서버 컴포넌트)가 이미 렌더한 것**을 받는다. 이 컴포넌트는 폭과 열림 여부만 알면 되고,
 * 데이터 조회·카드 조립은 종전 그대로 서버에 남는다 — 클릭할 때 새로 가져오지 않으므로 펼침이 즉시 끝난다.
 * 대신 접힌 상태에서도 펼침 슬롯의 내용이 RSC 페이로드에 실린다(면접 후기 원문 포함 — CompanyReviewsPreviewSection
 * 주석 참조). 목업 단계에서 받아들인 비용이고, 실서비스에서는 지연 로딩으로 바꿀 자리다.
 *
 * 펼침은 **치환**이다: 열리면 접힘 슬롯을 감추고 펼침 슬롯이 그 자리에 선다. 누적하면 앞 2건이 미리보기
 * 문법(compact 카드)으로 남아 같은 후기가 두 벌로 보인다.
 *
 * 폭 분기는 전부 CSS다 — 390px에서 펼친 뒤 데스크톱 폭으로 넘어가도 접힘 슬롯이 다시 서고 펼침 슬롯과
 * 토글 버튼이 함께 사라진다(열림 상태는 남아 있다가 좁아지면 그대로 복원된다).
 */
export function SectionExpandGroup({
  collapsed,
  expanded,
  count,
  label,
  anchorId,
}: {
  /** 접힘 슬롯 — 미리보기 2~3건. 데스크톱에서는 항상 이쪽만 보인다. */
  collapsed: ReactNode;
  /** 펼침 슬롯 — 전량 목록. ≤760px에서 열렸을 때만 마운트된다. */
  expanded: ReactNode;
  /** 버튼 문구에 찍는 전체 건수 */
  count: number;
  /** 버튼 문구 앞머리. 섹션 제목을 그대로 쓴다("채용중인 공고 5건 모두 보기") */
  label: string;
  /**
   * 이 그룹이 담긴 섹션의 앵커 id(companyDetailAnchors). 넘기면 `#{anchorId}`로 진입했을 때 펼친 채로
   * 시작한다 — 섹션을 지목해 들어왔는데 접혀 있으면 도착지가 미리보기 2건(compact 카드·본문 없음)이라,
   * 지목한 것이 그 자리에 없다. 특히 면접 후기는 열람권 상태 카드·잠금 CTA가 펼침 슬롯에만 있어
   * "다시 보기"류 딥링크가 원문에 닿지 못했다.
   */
  anchorId?: string;
}) {
  const [open, setOpen] = useState(false);

  /**
   * 해시는 서버에서 읽을 수 없어(location이 없다) 초기값이 아니라 마운트 후 판별이다 — 초기 렌더는
   * 접힘이고 그 다음 프레임에 열린다. 접힘→펼침 전환이 한 번 보이는 것을 받아들인 것은, 초기값으로
   * 넣으려면 서버 HTML과 첫 클라이언트 렌더가 갈려 하이드레이션이 어긋나기 때문이다.
   *
   * 한 번만 연다: 사용자가 도착한 뒤 접었는데 다른 이유로 이 이펙트가 다시 돌아 도로 열리면,
   * 접기 버튼이 듣지 않는 것처럼 보인다. 의존성이 anchorId 하나뿐이라 그 값이 바뀔 때만 다시 본다.
   */
  useEffect(() => {
    if (!anchorId) return;
    if (window.location.hash === `#${anchorId}`) setOpen(true);
  }, [anchorId]);

  return (
    <>
      <div className={clsx(open && "max-[760px]:hidden")}>{collapsed}</div>
      {/* 열렸을 때만 마운트한다 — display로만 감추면 같은 카드가 DOM에 두 벌 남아 섹션 id·포커스 순서가
          겹치고, 면접 후기 확장이 든 확인 모달이 감춰진 서브트리 안에 갇힌다. */}
      {open ? <div className="min-[761px]:hidden">{expanded}</div> : null}
      {/* 문구·셰브론 회전·aria 2종은 QnaHomeClient 칩 줄 토글과 같은 문법이다. 다른 것은 모양뿐 —
          그쪽은 칩 줄 끝의 아이콘 버튼이고 이쪽은 섹션 하단의 전폭 버튼이라, 여는 대상을 문구로 말한다.
          버튼 스타일은 같은 파일의 사이드바 보조 버튼("후기 보기")과 같은 한 줄이다. */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? `${label} 접기` : `${label} 모두 보기`}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1 border border-border text-[14px] font-medium text-[#4f5a66] transition-colors hover:border-[#111111] hover:text-[#111111] min-[761px]:hidden"
      >
        {open ? "접기" : `${label} ${count}건 모두 보기`}
        <ChevronDown size={16} className={clsx("transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
    </>
  );
}
