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
    /* items-stretch — 상태 행도 버튼 기둥도 카드 안쪽 폭을 그대로 쓴다. 세로는 가운데 정렬이되
       내용이 min-h-[160px]를 넘기면 자연히 늘어난다.
       gap-3 — 상태 덩어리와 버튼 기둥 사이. gap-4(16px)이던 자리를 한 스텝 줄여, 읽은 상태(보유 N장)와
       그에 대해 할 일(작성하기·관리)이 한 흐름으로 이어지게 한다. */
    <article className="flex h-full min-h-[160px] flex-col items-stretch justify-center gap-3 border border-border bg-white p-4 text-left">
      <div>
        {copy.label ? (
          /* 상태는 한 줄로 읽힌다: "보유 열람권 ⓘ 2장". 종전에는 라벨 덩어리를 왼쪽, 숫자를 오른쪽 끝으로
             밀어(justify-between) 405px 칸에서 둘 사이가 300px 가까이 벌어졌다 — 한 문장인데 두 덩어리로
             갈려 읽혔다. 붙여 두면 라벨이 숫자의 단위 노릇을 하고, 보조 문구는 그 아래 한 줄로 딸린다.
             items-baseline이 필수다 — 13px 라벨과 24px 숫자는 크기가 달라 items-center로 맞추면 글자
             밑선이 어긋난다(가운데를 맞추면 큰 글자가 더 아래로 내려앉는다).
             gap-2(8px)는 라벨 덩어리↔숫자 사이만이고, 라벨↔ⓘ는 안쪽 gap-1(4px) 그대로다. */
          <div className="flex items-baseline gap-2">
            <span className="flex items-center gap-1">
              <p className="text-[13px] font-medium text-[#596373]">{copy.label}</p>
              <InfoTooltip title={ACCESS_INFO_TITLE} lines={ACCESS_INFO_LINES} />
            </span>
            {/* 24px/semibold — 이 숫자는 카드의 제목이 아니라 상태값이다. 28px/bold는 같은 화면에서
                가장 큰 활자라 후기 카드들보다 먼저 눈에 들어왔다. 확정 타이포 스케일 안에서 한 단계씩 내린다. */}
            <span className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#111111]">{copy.value}</span>
          </div>
        ) : (
          /* loggedOut은 셀 숫자가 없다 — 그 자리를 제목 한 줄이 대신하므로 baseline을 맞출 상대도 없고,
             인라인으로 끌어올 값도 없다. 종전 배치(제목 + ⓘ, items-center)를 그대로 둔다. */
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-[#171b21]">{copy.title}</span>
            <InfoTooltip title={ACCESS_INFO_TITLE} lines={ACCESS_INFO_LINES} />
          </div>
        )}
        {/* 보조 문구는 세 상태가 같은 자리에 둔다 — 위 헤더 행(숫자든 제목이든)에 딸린 단서라
            mt-1.5(6px)로 바짝 붙여 한 정보 묶음으로 읽히게 한다. */}
        <p className="mt-1.5 text-[12px] font-normal text-[#9aa3af]">{copy.subtext}</p>
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
