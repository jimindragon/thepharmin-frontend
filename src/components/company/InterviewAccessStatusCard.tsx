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
            // 승인 전제를 noCredits의 "작성 승인 시 지급"·툴팁의 "면접 후기 승인 시 2장 추가 지급"과 맞춘다.
            primaryCaption: "작성 승인 시 열람권 +2장",
            secondaryLabel: "열람권 관리",
            secondaryHref: MANAGE_HREF,
          };

  return (
    /* items-stretch — 상태 덩어리도 버튼 기둥도 카드 안쪽 폭을 그대로 쓴다. 세로는 가운데 정렬이되
       내용이 min-h-[160px]를 넘기면 자연히 늘어난다.
       gap-4 — 상태 덩어리와 버튼 기둥 사이. 상태가 두 줄 블록이 되면서 12px로는 문구와 버튼이 눌어붙어,
       한 스텝 되돌린다. */
    <article className="flex h-full min-h-[160px] flex-col items-stretch justify-center gap-4 border border-border bg-white p-4 text-left">
      <div>
        {copy.label ? (
          /* 상태 전체가 한 줄이다: "보유 열람권 ⓘ 0장 | 후기 승인 시 2장 지급".
             라벨·숫자·조건이 서로 다른 덩어리로 흩어져 있을 이유가 없다 — 셋이 합쳐 한 문장이고,
             그렇게 두면 카드 맨 위 한 줄만 읽어도 상태가 끝난다.

             items-baseline이 필수다 — 17px 숫자와 13px 라벨·문구가 섞여 있어 items-center로 맞추면
             글자 밑선이 어긋난다(실측 확인). 간격은 라벨→ⓘ 4px(안쪽 gap-1), 나머지는 8px(gap-x-2). */
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="flex items-center gap-1">
              <p className="text-[13px] font-medium text-[#596373]">{copy.label}</p>
              <InfoTooltip title={ACCESS_INFO_TITLE} lines={ACCESS_INFO_LINES} />
            </span>
            {/* 17px/semibold — 상태값이지 제목이 아니다. 한 줄 안에서 라벨·문구(13px)보다 한 단계만
                크면 어느 쪽이 값인지 충분히 갈린다. 확정 스케일의 17. */}
            <span className="text-[17px] font-semibold leading-none tracking-[-0.02em] text-[#111111]">{copy.value}</span>
            {/* 구분자 — 1px 세로선. " · " 문자 대신 선을 쓰는 이유는 같은 줄에 이미 문장 부호처럼 읽히는
                토막(ⓘ)이 있어서다. 문자 안으로 바꾸려면 이 span을 {" · "} 하나로 갈아 끼우면 된다.
                줄바꿈이 일어나는 폭에서는 숨는다(아래 보조 문구의 w-full과 한 쌍) — 둘 다 같은
                브레이크포인트를 쓰므로, 문구가 둘째 줄로 내려간 줄 머리에 선만 남는 일이 없다. */}
            <span aria-hidden="true" className="h-3 w-px self-center bg-[#dce2ea] max-[359px]:hidden" />
            {/* 수량만 굵게(emphasizeAmount) — 조건문 안에서 실제 값은 그 한 토막이다 */}
            <span className="text-[13px] font-normal text-[#9aa3af] max-[359px]:w-full">{emphasizeAmount(copy.subtext)}</span>
          </div>
        ) : (
          /* loggedOut은 셀 숫자가 없다 — 한 줄로 이을 값이 없어 제목 + ⓘ 한 줄과 그 밑 단서라는
             종전 배치를 그대로 둔다. 수량 강조만 위와 같이 쓴다. */
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-semibold text-[#171b21]">{copy.title}</span>
              <InfoTooltip title={ACCESS_INFO_TITLE} lines={ACCESS_INFO_LINES} />
            </div>
            <p className="mt-1.5 text-[13px] font-normal text-[#9aa3af]">{emphasizeAmount(copy.subtext)}</p>
          </div>
        )}
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
