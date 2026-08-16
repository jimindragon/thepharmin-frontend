"use client";

import { LinkButton } from "@/components/ui/Button";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

export type InterviewAccessUserState = "loggedOut" | "noCredits" | "hasCredits";

interface InterviewAccessStatusCardProps {
  userState: InterviewAccessUserState;
  credits: number;
  writeHref: string;
}

const ACCESS_INFO_TITLE = "열람권 이용 안내";
const ACCESS_INFO_LINES = [
  "가입 시 열람권 2장 지급",
  "면접 후기 승인 시 2장 추가 지급",
  "후기 1개 열람 시 1장 사용",
  "이미 열람한 후기는 추가 차감 없음",
];

const MANAGE_HREF = "/mypage/review-credits";

/** interviews 목록 그리드 첫 슬롯에서 CompanyReviewWriteCard를 대체하는 열람권 상태 카드.
 * 카드 외형(흰 배경/보더/radius 0/세로 중앙 정렬)은 CompanyReviewWriteCard와 동일한 문법을 따르고,
 * userState 3종에 따라 문구·CTA만 바뀌고 레이아웃은 고정이다.
 *
 * **≤760px만 다르게 접는다.** 그 폭에서 이 카드는 3열 격자의 한 칸이 아니라 화면 전폭 낱장이 된다
 * (부모 FLUSH_GRID_CLASS가 테두리를 지우고 좌우 24px을 준다). 405px 칸에 맞춘 가운데 정렬 한 덩어리를
 * 390px 전폭에 그대로 늘리면 라벨·숫자·문구·버튼이 전부 화면 한가운데 기둥처럼 서고, 좌우로 남는
 * 여백만 넓어진다 — 같은 화면의 후기 카드들이 전부 좌측 정렬 낱장인 것과도 어긋난다.
 * 그래서 그 폭에서만: 상태는 라벨(좌)↔숫자(우) 한 줄로 펴고, 나머지는 좌측 정렬로 내리고,
 * 주 버튼은 전폭으로 세운다. 분기 기준(760px)은 부모가 쓰는 값과 같다.
 *
 * 761px 이상은 클래스가 한 줄도 적용되지 않는다 — 데스크톱 렌더는 종전 그대로다. */
export function InterviewAccessStatusCard({ userState, credits, writeHref }: InterviewAccessStatusCardProps) {
  const copy =
    userState === "loggedOut"
      ? {
          label: null as string | null,
          value: null as string | null,
          title: "면접 후기는 로그인 후 볼 수 있어요",
          subtext: "가입 시 무료 열람권 2장 지급",
          primaryLabel: "무료 열람권 받고 시작하기",
          primaryHref: "#",
          primaryCaption: null as string | null,
          secondaryLabel: "로그인",
          secondaryHref: "#",
        }
      : userState === "noCredits"
        ? {
            label: "보유 열람권",
            value: "0장",
            title: null as string | null,
            subtext: "후기 승인 시 2장 지급",
            // 라벨은 지급을 약속하지 않는 행동 문구로 두고, 조건은 위 subtext 한 줄이 진다.
            // 종전엔 버튼 아래 캡션("작성 승인 시 지급")이 같은 조건을 한 번 더 말했다 — 같은 12px 회색으로
            // 같은 말이 한 카드에 두 벌이라, 조건을 강조하는 대신 어느 쪽이 본문인지 흐렸다.
            primaryLabel: "면접 후기 작성하기",
            primaryHref: writeHref,
            primaryCaption: null as string | null,
            secondaryLabel: "열람권 관리",
            secondaryHref: MANAGE_HREF,
          }
        : {
            label: "보유 열람권",
            value: `${credits}장`,
            title: null as string | null,
            subtext: "후기 1개 열람 시 1장 사용",
            primaryLabel: "면접 후기 작성하기",
            primaryHref: writeHref,
            // 승인 전제를 noCredits의 "작성 승인 시 지급"·툴팁의 "면접 후기 승인 시 2장 추가 지급"과 맞춘다.
            primaryCaption: "작성 승인 시 열람권 +2장",
            secondaryLabel: "열람권 관리",
            secondaryHref: MANAGE_HREF,
          };

  /**
   * ≤760px 보조 버튼의 처방이 상태로 갈린다.
   *
   * loggedOut의 "로그인"은 액자를 유지한다 — 그 상태에서 이 카드가 시키는 일은 회원가입·로그인 둘뿐이고,
   * 둘 다 눌러야 할 버튼이다. 폭만 전폭으로 열어 주 버튼과 한 기둥으로 선다.
   *
   * 나머지 두 상태의 "열람권 관리"는 액자를 벗겨 텍스트 링크로 내린다. 지금 할 일은 후기 작성(주 버튼)이고
   * 이쪽은 "다른 데서 확인하기"라, 전폭 화면에서 같은 크기의 액자 둘이 세로로 겹치면 무게가 같아 보인다.
   * h-9(36px)은 그대로 두고 테두리·배경·좌우 패딩만 지운다 — 문자 높이까지 줄이면 터치 타깃이 20px대로
   * 무너진다. 부모가 items-stretch라 36px × 전폭이 그대로 누를 수 있는 영역이 된다.
   *
   * 전부 변형 붙은 유틸리티라(max-[760px]:) 변형 없는 variant 기본값을 확실히 이긴다 — FLUSH_GRID_CLASS가
   * 자식을 눌러쓸 때 기대는 규칙과 같다. 761px 이상에는 한 줄도 적용되지 않아 데스크톱 스타일은 무변이다.
   * hover:border-[#111111](기본값)은 남지만 그 폭에서 테두리 폭이 0이라 그려질 선이 없다.
   */
  const secondaryMobileClassName =
    userState === "loggedOut"
      ? "max-[760px]:w-full"
      : "max-[760px]:justify-start max-[760px]:border-0 max-[760px]:bg-transparent max-[760px]:px-0 max-[760px]:hover:text-[#111111]";

  return (
    /* max-[760px]: items-stretch(자식을 전폭으로) + text-left. 세로 중앙 정렬(justify-center)은 두 폭이 같다 —
       내용이 min-h-[160px]를 넘기면 어차피 늘어나고, 넘지 않으면 그 폭에서도 가운데가 자연스럽다. */
    <article className="flex h-full min-h-[160px] flex-col items-center justify-center gap-4 border border-border bg-white p-4 text-center max-[760px]:items-stretch max-[760px]:text-left">
      <div>
        {copy.label ? (
          /* 이 래퍼는 데스크톱에서 아무 일도 하지 않는 평범한 블록이다(라벨 줄 위, 숫자 아래).
             ≤760px에서만 flex가 되어 라벨↔숫자를 한 줄 양 끝으로 편다. */
          <div className="max-[760px]:flex max-[760px]:items-center max-[760px]:justify-between max-[760px]:gap-3">
            <div className="flex items-center justify-center gap-1 max-[760px]:justify-start">
              <p className="text-[13px] font-medium text-[#596373]">{copy.label}</p>
              <InfoTooltip title={ACCESS_INFO_TITLE} lines={ACCESS_INFO_LINES} />
            </div>
            {/* 한 줄로 펴지면 위아래 간격이 필요 없다 */}
            <div className="mt-1.5 max-[760px]:mt-0">
              <span className="text-[28px] font-bold leading-none tracking-[-0.02em] text-[#111111]">{copy.value}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 max-[760px]:justify-start">
            <span className="text-[14px] font-semibold text-[#171b21]">{copy.title}</span>
            <InfoTooltip title={ACCESS_INFO_TITLE} lines={ACCESS_INFO_LINES} />
          </div>
        )}
        <p className="mt-1.5 text-[12px] font-normal text-[#9aa3af]">{copy.subtext}</p>
      </div>
      <div className="flex w-full flex-col items-center gap-2 max-[760px]:items-stretch">
        <div className="flex flex-col items-center gap-1 max-[760px]:items-stretch">
          <LinkButton
            href={copy.primaryHref}
            variant={userState === "hasCredits" ? "gradient" : "primary"}
            size="sm"
            className="max-[760px]:w-full"
          >
            {copy.primaryLabel}
          </LinkButton>
          {copy.primaryCaption ? <span className="text-[12px] font-normal text-[#9aa3af]">{copy.primaryCaption}</span> : null}
        </div>
        <LinkButton href={copy.secondaryHref} variant="secondary" size="sm" className={secondaryMobileClassName}>
          {copy.secondaryLabel}
        </LinkButton>
      </div>
    </article>
  );
}
