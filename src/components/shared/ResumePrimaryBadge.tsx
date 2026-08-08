/**
 * 이력서 "대표" 배지 — 아웃라인 정보 라벨 표시용 공용 컴포넌트.
 * 대시보드 이력서 행 / 이력서 관리 카드(작성형·첨부형)에서 isPrimary 표시에 사용.
 * 직각(radius 없음), 배경 없이 border-[#767676] + text-[#595959] —
 * 일반 태그(JobTagChip, border-border·연회색)보다 반 단계 진해 속성 라벨로 구분되되
 * 화면 최고 농도는 아니게. 고정 높이 없이 padding으로 높이를 맞춤 —
 * 11px·py-[1px]로 JobTagChip(27.5px)보다 한 급 작게 두어
 * "제목 옆 꼬리표 < 콘텐츠 태그" 층위를 만든다. 제목 옆 수식 배지인
 * AttachmentResumeCard "첨부형" 칩도 같은 사양을 공유하니 함께 바꿀 것.
 */
export function ResumePrimaryBadge() {
  return (
    <span className="inline-flex shrink-0 items-center border border-[#767676] px-1.5 py-[1px] text-[11px] font-medium text-[#595959]">
      대표
    </span>
  );
}
