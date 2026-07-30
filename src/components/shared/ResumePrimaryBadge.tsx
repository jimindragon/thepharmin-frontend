/**
 * 이력서 "대표" 배지 — 검정 배지 표시용 공용 컴포넌트.
 * 대시보드 이력서 행 / 이력서 관리 카드(작성형·첨부형)에서 isPrimary 표시에 사용.
 * 직각(radius 없음), bg-[#111111] text-white 유지. 고정 높이 없이 padding으로 높이를 맞춤 —
 * 이 배지만 테두리가 없으므로 py를 2px 더 줘야(py-[3px]) JobTagChip·"첨부형" 배지와
 * 같은 27.5px 높이로 정렬됨. 글자 크기는 기준표 "배지 13px"를 따름.
 * 다른 도메인의 검정 배지(QNA BEST, FormSection 상태 배지 등)와는 무관.
 */
export function ResumePrimaryBadge() {
  return (
    <span className="inline-flex shrink-0 items-center bg-[#111111] px-2 py-[3px] text-[13px] font-medium text-white">
      대표
    </span>
  );
}
