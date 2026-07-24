/**
 * 이력서 "대표" 배지 — 검정 배지 표시용 공용 컴포넌트.
 * 대시보드 이력서 행 / 이력서 관리 카드(작성형·첨부형)에서 isPrimary 표시에 사용.
 * 직각(radius 없음), bg-[#111111] text-white 유지. 고정 높이(h-[22px]) 대신
 * py-0.5로 슬림화해 JobTagChip 높이와 균형을 맞춤.
 * 다른 도메인의 검정 배지(QNA BEST, FormSection 상태 배지 등)와는 무관.
 */
export function ResumePrimaryBadge() {
  return (
    <span className="inline-flex shrink-0 items-center bg-[#111111] px-2 py-[1px] text-[11px] font-medium text-white">
      대표
    </span>
  );
}
