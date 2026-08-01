import clsx from "clsx";
import { STATUS_TONE, type StatusTone } from "@/config/statusTone";

/**
 * 점 + 라벨 상태 표시. 기업센터 6곳(공고 관리·지원자 관리·헤드헌팅 의뢰·추천 후보자·
 * 대시보드 처리할 항목·대시보드 다가오는 면접)이 같은 마크업을 복제하고 있던 것을 하나로 모았다.
 *
 * 점 8px·gap 8px·font-medium은 6곳이 이미 같던 값이라 props로 열지 않았다.
 * 색은 tone으로만 정해진다 — 호출부가 색 문자열을 직접 넘기지 못하게 하는 것이 이 부품의 요점이다.
 *
 * size: 표 상태 열은 md(13px), 대시보드 우측 레일처럼 밀집한 카드는 sm(12px).
 *
 * w-fit: 표에서는 필수다. 그리드 자식은 blockify되어 inline-flex가 flex로 바뀌고
 * 트랙 폭(80px)까지 늘어난다 — w-fit이 있어야 38px로 줄어든다.
 * 인라인 문맥(대시보드 레일)에서는 이미 shrink-to-fit이라 무영향이므로 그냥 둔다.
 *
 * 요금제 관리·결제 내역은 점 없이 텍스트만 쓰는 표라 대상이 아니다.
 */
export function StatusPill({
  tone,
  label,
  size = "md",
}: {
  tone: StatusTone;
  label: string;
  size?: "sm" | "md";
}) {
  const { text, dot } = STATUS_TONE[tone];

  return (
    <span className="inline-flex w-fit items-center gap-[8px]">
      {dot ? <span className={clsx("h-[8px] w-[8px] rounded-full shrink-0", dot)} /> : null}
      <span className={clsx("font-medium", size === "sm" ? "text-[12px]" : "text-[13px]", text)}>
        {label}
      </span>
    </span>
  );
}
