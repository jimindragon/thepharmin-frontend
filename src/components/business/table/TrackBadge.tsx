import clsx from "clsx";

/**
 * 트랙(산업·연구·병원·약국) 배지. 5곳이 같은 마크업을 복제하고 있었다 —
 * 공고 관리·요금제 관리·결제 내역·영수증 모달(13px)과 대시보드 공고별 지원 현황(11px).
 *
 * leading-4: body의 line-height 1.65가 배지 안까지 상속되는 것을 끊은 국소 예외.
 * 이게 없으면 13px 라인박스가 21.45px가 되어 h-5(콘텐츠 18px)를 넘고, 11px도 18.15px로 0.15px 넘친다.
 * leading-4를 걸면 라인박스가 16px로 고정돼 두 크기 모두 h-5에 여유 2px로 들어간다.
 */
export function TrackBadge({ label, size = "md" }: { label: string; size?: "sm" | "md" }) {
  return (
    <span
      className={clsx(
        "inline-flex h-5 items-center border border-[#d8e0e8] px-1.5 font-medium leading-4 text-[#596373]",
        size === "sm" ? "text-[11px]" : "text-[13px]",
      )}
    >
      {label}
    </span>
  );
}
