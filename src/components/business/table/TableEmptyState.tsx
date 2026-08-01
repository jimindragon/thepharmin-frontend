import type { ReactNode } from "react";

/**
 * 표 빈 상태. 6곳이 패딩 py-20/py-16/py-14, 제목색 #17202c/#303946으로 갈려 있던 것을 하나로 고정했다.
 *
 * py-16: 세 값의 중간. 컨테이너 패딩이 계열마다 달라(A는 0, B는 pt-6 pb-2, B′는 py-6)
 * 실제 렌더 높이를 완전히 맞추려면 구조 통합이 필요하다 — 그건 셸 도입 단계의 몫이다.
 * 여기서는 다수결(py-14)이 아니라 중간값을 골라 A가 32px 줄고 B가 16px 느는 선에서 모았다.
 *
 * 제목 #17202c: 잉크 3단에서 제목 자리의 색이다(주요값 #303946 / 보조 #8a94a3).
 * 빈 상태의 제목은 그 순간 화면에서 가장 중요한 텍스트라 최상단 잉크를 쓴다.
 */
export function TableEmptyState({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="py-16 text-center">
      <p className="text-[15px] font-medium text-[#17202c]">{title}</p>
      <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">{description}</p>
      {action}
    </div>
  );
}
