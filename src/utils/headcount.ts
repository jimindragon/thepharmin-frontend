/**
 * 병원 트랙 모집인원 표시 규칙. 각 원소는 단일 모집 또는 부문별 모집인원 숫자이며, 미정인 항목은 null로 전달한다.
 * 단일(원소 1개): 숫자면 "N명", 미정이면 "인원 미정".
 * 복수(원소 2개 이상): 전부 숫자면 "총 N명", 일부만 미정이면 "N명+"(확정분 합계), 전부 미정이면 "인원 미정".
 */
export function formatHeadcount(counts: (number | null)[]): string {
  if (counts.length <= 1) {
    const only = counts[0];
    return only != null ? `${only}명` : "인원 미정";
  }

  const known = counts.filter((count): count is number => count != null);
  if (known.length === 0) return "인원 미정";

  const total = known.reduce((sum, count) => sum + count, 0);
  return known.length === counts.length ? `총 ${total}명` : `${total}명+`;
}
