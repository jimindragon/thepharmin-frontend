"use client";

import { LinkButton } from "@/components/ui/Button";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { REVIEW_ACCESS_INFO_LINES, REVIEW_ACCESS_INFO_TITLE } from "@/config/reviewAccessCopy";

export type InterviewAccessUserState = "loggedOut" | "noCredits" | "hasCredits";

interface InterviewAccessStatusCardProps {
  userState: InterviewAccessUserState;
  credits: number;
  writeHref: string;
}

const MANAGE_HREF = "/mypage/review-credits";

/**
 * 보조 문구 안의 수량("2장"·"1장")만 굵게 든다 — 문장에서 실제로 읽어야 하는 값이 그 한 토막이고,
 * 나머지는 그 값이 언제 생기고 없어지는지를 말하는 조건이다.
 *
 * 세 상태의 문구가 전부 "…N장…" 꼴이라 문자열을 쪼개 쓰지 않고 여기서 한 규칙으로 처리한다 —
 * copy에 강조 구간을 따로 들면 문구를 고칠 때마다 두 곳을 맞춰야 한다.
 */
function emphasizeAmount(text: string) {
  return text.split(/(\d+장)/).map((part, index) =>
    /^\d+장$/.test(part) ? (
      <span key={index} className="font-semibold">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** interviews 목록 그리드 첫 슬롯에서 CompanyReviewWriteCard를 대체하는 열람권 상태 카드.
 * 카드 외형(흰 배경/보더/radius 0)은 CompanyReviewWriteCard와 동일한 문법을 따르고, userState 3종에 따라
 * 문구·CTA만 바뀌고 레이아웃은 고정이다.
 *
 * **폭 분기가 없다.** 한 벌의 레이아웃이 390px 낱장에서도 405px 격자 칸에서도 그대로 선다.
 *   - 상태는 한 행이다: 왼쪽에 라벨 + ⓘ + 그 밑 단서, 오른쪽 끝에 숫자.
 *   - 버튼 둘은 같은 기둥이다: 주 버튼(검정 솔리드)과 보조 버튼(아웃라인)이 같은 폭·같은 높이로 선다.
 *   - 본문은 좌측 정렬이다.
 *
 * 여기까지 오는 데 두 단계를 거쳤다. 처음엔 405px 칸에 맞춘 가운데 정렬 한 덩어리였고(라벨 위 숫자 아래,
 * 버튼은 내용 폭), ≤760px에서만 그것을 펴는 max-[760px]: 분기를 얹었다. 그러자 같은 카드가 폭에 따라
 * 다른 문법으로 읽혔다 — 한쪽은 가운데 기둥, 한쪽은 좌우로 갈린 행. 두 벌을 유지할 이유가 없어 넓은 쪽을
 * 좁은 쪽에 맞춘다: 좌우로 갈린 행은 405px에서도 읽히지만, 가운데 기둥은 390px 전폭에서 좌우 여백만
 * 넓어졌다(같은 화면의 후기 카드가 전부 좌측 정렬 낱장인 것과도 어긋났다).
 *
 * 그래서 이 파일에는 max-[760px]:이 한 줄도 없다. 폭에 따라 달라지는 것은 부모 몫이다 —
 * FLUSH_GRID_CLASS가 그 폭에서 테두리를 지우고 좌우 24px을 준다. */
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
            // 승인 전제를 noCredits의 "작성 승인 시 지급"·툴팁의 "… 승인 시 2장 추가 지급"과 맞춘다.
            primaryCaption: "작성 승인 시 열람권 +2장",
            secondaryLabel: "열람권 관리",
            secondaryHref: MANAGE_HREF,
          };

  return (
    /* items-stretch — 상태 덩어리도 버튼 기둥도 카드 안쪽 폭을 그대로 쓴다.
       justify-start — 남는 높이는 전부 아래로 보낸다. 이 카드는 격자의 첫 칸이라 h-full로 같은 행의
       가장 큰 카드(후기 카드)만큼 늘어나는데, justify-center이던 종전에는 그 여유가 위아래로 반씩
       갈렸다. 위로 간 몫은 섹션 설명과 첫 글줄 사이에 그대로 얹혀, 카드가 자기 패딩보다 훨씬
       아래에서 시작하는 것처럼 보였다(@1440 실측 위쪽 여유 5~86px, 상태에 따라). 위 시작점은
       패딩이 정하고 남는 높이는 아래가 받는 편이 이웃 카드들과 첫 줄 높이를 맞춘다.
       h-full·min-h-[160px]는 그대로다 — 행 높이를 함께 쓰는 것 자체는 바뀌지 않는다.
       ≤760px는 1열이라 늘어날 여유 자체가 없어(실측 위아래 여유 0) 이 줄이 하는 일이 없다.
       gap-4 — 상태 덩어리와 버튼 기둥 사이.
       text-center — 두 글줄과 버튼 두 개가 카드 중심선 하나에 함께 선다. 버튼은 이미 라벨을 가운데
       두고 있었고(LinkButton의 justify-center) 글줄만 왼쪽에 붙어 있어 축이 둘로 보였다.
       pt-3 — 위쪽만 16px에서 12px로 줄인다. 이 카드 위에는 섹션 설명이 바로 붙는데, 그 사이는
       SectionShell의 mb-6(24px)이 이미 벌려 놓아 카드가 같은 크기를 한 번 더 얹을 자리가 아니다.
       아래·좌우는 그대로다(좌우는 ≤760px에서 부모 FLUSH_GRID_CLASS가 24px로 덮어쓴다). */
    <article className="flex h-full min-h-[160px] flex-col items-stretch justify-start gap-4 border border-border bg-white px-4 pb-4 pt-3 text-center">
      <div>
        {copy.label ? (
          /* 1줄 "보유 열람권 ⓘ 0장" / 2줄 "후기 승인 시 2장 지급".
             한 줄에 모아 두었을 때는 구분자(세로선)로 값과 조건을 갈라야 했고, 좁은 폭에서는 그 선이
             줄 머리에 남지 않도록 브레이크포인트 두 곳을 걸어야 했다. 줄을 나누면 그 둘이 함께 사라진다 —
             줄바꿈 자체가 구분자 노릇을 하고, 폭에 따라 달라질 것도 없다.

             items-baseline은 남는다 — 17px 숫자와 13px 라벨이 같은 줄에 섞여 있어 items-center면
             밑선이 어긋난다(실측 확인). 간격은 라벨→ⓘ 4px(안쪽 gap-1), ⓘ→숫자 8px(gap-2). */
          <div className="flex items-baseline justify-center gap-2">
            <span className="flex items-center gap-1">
              <p className="text-[13px] font-medium text-[#596373]">{copy.label}</p>
              <InfoTooltip title={REVIEW_ACCESS_INFO_TITLE} lines={REVIEW_ACCESS_INFO_LINES} />
            </span>
            {/* 17px/semibold — 상태값이지 제목이 아니다. 라벨(13px)보다 한 단계만 크면 어느 쪽이 값인지
                충분히 갈린다. 확정 스케일의 17. */}
            <span className="text-[17px] font-semibold leading-none tracking-[-0.02em] text-[#111111]">{copy.value}</span>
          </div>
        ) : (
          /* loggedOut은 셀 숫자가 없어 첫 줄이 제목 한 줄이다. 정렬·간격 문법은 위와 같다. */
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[14px] font-semibold text-[#171b21]">{copy.title}</span>
            <InfoTooltip title={REVIEW_ACCESS_INFO_TITLE} lines={REVIEW_ACCESS_INFO_LINES} />
          </div>
        )}
        {/* 2줄 — 세 상태가 같은 자리에 둔다. 첫 줄에 딸린 조건이라 mt-1.5(6px)로 바짝 붙인다.
            수량만 굵게(emphasizeAmount) — 조건문 안에서 실제 값은 그 한 토막이다. */}
        <p className="mt-1.5 text-[13px] font-normal text-[#9aa3af]">{emphasizeAmount(copy.subtext)}</p>
      </div>
      {/* 두 버튼은 같은 기둥이다 — items-stretch + w-full로 카드 안쪽 폭을 함께 채운다 */}
      <div className="flex w-full flex-col items-stretch gap-2">
        <div className="flex flex-col items-stretch gap-1">
          <LinkButton href={copy.primaryHref} variant={userState === "hasCredits" ? "gradient" : "primary"} size="sm" className="w-full">
            {copy.primaryLabel}
          </LinkButton>
          {copy.primaryCaption ? <span className="text-[12px] font-normal text-[#9aa3af]">{copy.primaryCaption}</span> : null}
        </div>
        <LinkButton href={copy.secondaryHref} variant="secondary" size="sm" className="w-full">
          {copy.secondaryLabel}
        </LinkButton>
      </div>
    </article>
  );
}
