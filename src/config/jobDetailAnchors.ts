import type { AnchorSection } from "@/components/shared/SectionAnchorNav";
import type { JobTrack } from "@/types/jobs";

/**
 * 공고 상세 4트랙의 ≤760px 섹션 앵커 목록.
 *
 * 각 배열은 그 트랙이 **가질 수 있는** 섹션을 전부 담는다 — 옵셔널 섹션(전형절차·추가 안내 등)이
 * 실제로 렌더됐는지는 SectionAnchorNav가 DOM에서 확인해 거른다. 같은 조건을 페이지의 렌더 분기와
 * 여기에 두 벌로 적어 두면 언젠가 한쪽만 바뀐다.
 *
 * 모듈 상수로 두는 이유는 둘이다. 참조가 매 렌더 바뀌지 않아 앵커 쪽 이펙트가 헛돌지 않고,
 * 네 트랙이 공유하는 문구("공고 상세"·"주요 업무"…)가 한곳에 모여 트랙마다 갈리지 않는다.
 * id는 각 트랙 파일의 IconSectionShell id와 1:1이며, 라벨은 섹션 제목을 탭 한 칸 폭에 맞게 줄인 것이다
 * ("자격 요건 및 우대사항" → "자격 요건", "전형절차 및 제출서류" → "전형절차").
 *
 * ≤720px에서만 뜨는 두 블록(마감일·지원 정보)은 일부러 뺐다. display로만 감춘 섹션이라
 * 721~760px 구간에서도 DOM에는 남아 있어 앵커의 DOM 확인을 통과해 버리고, 그러면 그 폭에서
 * 보이지 않는 자리로 보내는 탭이 생긴다. 최하단 "비슷한 공고"도 뺐다 — 이 공고를 읽는 흐름이
 * 아니라 다음으로 볼 공고를 고르는 다른 성격의 구역이다.
 */
const COMMON_HEAD: AnchorSection[] = [
  { id: "summary", label: "공고 상세" },
  { id: "duties", label: "주요 업무" },
  { id: "qualifications", label: "자격 요건" },
  { id: "conditions", label: "근무 조건" },
];

const COMMON_TAIL: AnchorSection[] = [
  { id: "hiring-process", label: "전형절차" },
  { id: "additional-info", label: "추가 안내" },
];

export const jobDetailAnchors: Record<JobTrack, AnchorSection[]> = {
  industry: [
    { id: "position-intro", label: "포지션 소개" },
    ...COMMON_HEAD,
    ...COMMON_TAIL,
    { id: "company", label: "기업 정보" },
    { id: "news", label: "관련 뉴스" },
  ],
  pharmacy: [...COMMON_HEAD, { id: "workenv", label: "근무환경" }, ...COMMON_TAIL, { id: "pharmacy", label: "약국 정보" }],
  hospital: [...COMMON_HEAD, { id: "workenv", label: "근무환경" }, ...COMMON_TAIL, { id: "hospital", label: "병원 정보" }],
  research: [...COMMON_HEAD, { id: "research-env", label: "연구 환경" }, ...COMMON_TAIL, { id: "org", label: "기관 정보" }],
};
