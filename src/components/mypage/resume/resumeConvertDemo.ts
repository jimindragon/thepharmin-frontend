import type {
  BuiltResume,
  ResumeCareerEntry,
  ResumeCertificate,
  ResumeContent,
  ResumeEducation,
  ResumeLanguage,
  ResumeWorkPreference,
} from "@/data/resumes";

/**
 * 첨부 이력서 → 구조화 이력서 변환 — patch 타입과 데모 분석기.
 *
 * 공고 쪽 aiFillDemo.ts와 같은 형태지만 공용화하지 않는다. 다루는 도메인(공고 폼 필드 ↔ 이력서 섹션)과
 * patch 모양이 전혀 달라, 하나로 묶으면 양쪽 다 남의 필드를 이고 다니게 된다.
 *
 * patch 규칙도 같다 — 값이 있는 키만 반영하고, undefined인 키는 "원문에 없었다"는 뜻이라 건드리지 않는다.
 * 옵션 값은 라벨이 아니라 config/jobFilters의 id를 그대로 쓴다.
 *
 * 파일 내용을 실제로 읽지는 않는다. 사용자가 붙여넣은 텍스트를 받아 고정 fixture를 돌려주며,
 * 실제 분석이 붙으면 analyzeResumeDemo만 진짜 호출로 갈아치우면 된다.
 */

/** 이력서 섹션 단위 patch. 이력서 제목은 담지 않는다 — 파일명에서 유추하지 않고 사용자가 직접 정한다. */
export interface ResumeConvertPatch {
  /** 희망 근무조건. 원문에서 읽어낸 항목만 담기므로 부분 갱신이다. */
  workPreference?: Partial<ResumeWorkPreference>;
  education?: Partial<ResumeEducation>;
  certificates?: ResumeCertificate[];
  /** industryJobCategoryOptions 등의 소분류 id */
  jobSubcategoryIds?: string[];
  careers?: ResumeCareerEntry[];
  languages?: ResumeLanguage[];
  selfIntroduction?: string;
}

/**
 * 데모 fixture — 기존 목데이터(RA 직무·서울대 약학 석사·더파마제약)와 겹치지 않는 별개 인물이다.
 * 임상(CRA) 경력자로 잡아 두 이력서를 나란히 놓아도 같은 사람으로 읽히지 않게 했다.
 *
 * 이력서 제목·급여·고용형태는 일부러 비웠다 — "원문에 없는 내용은 채우지 않는다"가 화면에서 드러나야 한다.
 * 완성도(getSectionCompletion)는 이 셋을 보지 않으므로 7개 섹션이 다 차면 100%가 되는 것이 맞다.
 */
export const RESUME_CONVERT_DEMO: ResumeConvertPatch = {
  workPreference: {
    track: "industry",
    experienceId: "3-5",
    regionIds: ["seoul", "gyeonggi"],
  },
  education: { school: "한국대학교", degreeId: "master", major: "약학" },
  certificates: [{ id: "convert-cert-1", name: "약사 면허", issuedYear: "2019", issuer: "보건복지부" }],
  jobSubcategoryIds: ["clinical-ops", "cra", "clinical-pm"],
  careers: [
    {
      id: "convert-career-1",
      company: "한빛임상연구소",
      role: "임상시험 모니터링(CRA)",
      period: "2021.03 - 2026.02",
      description: "3상 임상시험 모니터링, 기관 선정·개시 방문, 데이터 정합성 확인과 규제기관 실사 대응을 담당했습니다.",
    },
  ],
  languages: [{ id: "convert-lang-1", name: "영어", level: "비즈니스 회화 가능" }],
  selfIntroduction:
    "임상시험 모니터링 업무를 5년간 담당하며 다기관 3상 시험의 개시부터 종료까지 전 과정을 경험했습니다.\n" +
    "기관·연구자와의 커뮤니케이션을 통해 프로토콜 준수율을 높이고, 데이터 오류를 조기에 잡아내는 데 강점이 있습니다.\n" +
    "규제기관 실사에 두 차례 대응하며 문서 정합성 관리의 중요성을 체득했습니다.\n" +
    "앞으로는 임상운영 전반을 설계하는 역할로 나아가고자 합니다.",
};

/** 분석 흉내 시간(ms). 실제 호출이 붙으면 이 상수와 setTimeout이 함께 사라진다. */
const FAKE_ANALYZE_MS = 1200;

/** 개발용 실패 트리거. 붙여넣은 원문이 이 접두어로 시작하면 분석이 실패한다(공고 쪽과 같은 규칙). */
export const DEMO_ERROR_PREFIX = "!error";

/** 고정 fixture를 돌려주는 가짜 분석기. 취소 처리(대기 중 모달 닫기)는 호출부가 맡는다. */
export function analyzeResumeDemo(sourceText: string): Promise<ResumeConvertPatch> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (sourceText.trimStart().startsWith(DEMO_ERROR_PREFIX)) {
        reject(new Error("이력서 변환 실패(데모 트리거)"));
        return;
      }
      resolve(RESUME_CONVERT_DEMO);
    }, FAKE_ANALYZE_MS);
  });
}

/** 채운 섹션 수. 토스트의 "N개 항목"이 이 값이다 — 이력서는 섹션이 곧 항목이다. */
export function countPatchedSections(patch: ResumeConvertPatch): number {
  return Object.values(patch).filter((value) => value !== undefined).length;
}

/** patch를 이력서 draft에 얹는다. 없는 키는 건드리지 않고, 중첩 객체는 덮어쓰지 않고 병합한다. */
export function applyResumeConvertPatch(base: BuiltResume, patch: ResumeConvertPatch): BuiltResume {
  return {
    ...base,
    workPreference: patch.workPreference ? { ...base.workPreference, ...patch.workPreference } : base.workPreference,
    education: patch.education ? { ...base.education, ...patch.education } : base.education,
    certificates: patch.certificates ?? base.certificates,
    jobSubcategoryIds: patch.jobSubcategoryIds ?? base.jobSubcategoryIds,
    careers: patch.careers ?? base.careers,
    languages: patch.languages ?? base.languages,
    selfIntroduction: patch.selfIntroduction ?? base.selfIntroduction,
  };
}

/** 이력서의 내용 필드만 뽑아낸다 — 제목·대표 여부처럼 새 이력서가 새로 정할 값은 넘기지 않는다. */
export function toResumeContent(resume: BuiltResume): ResumeContent {
  return {
    workPreference: resume.workPreference,
    education: resume.education,
    certificates: resume.certificates,
    jobSubcategoryIds: resume.jobSubcategoryIds,
    careers: resume.careers,
    languages: resume.languages,
    selfIntroduction: resume.selfIntroduction,
  };
}

/**
 * 인계 묶음. base가 없으면 "빈 이력서를 채운다"(관리 페이지에서 첨부 이력서를 변환하는 기존 흐름),
 * 있으면 "기존 이력서를 바탕으로 새 버전을 만든다"(편집 화면의 AI 새 버전)라는 뜻이다.
 */
export interface ResumeConvertHandoff {
  patch: ResumeConvertPatch;
  /** 편집 중이던 이력서의 내용 스냅샷. 새 폼이 이 위에 patch를 얹는다. */
  base?: ResumeContent;
  /** 원본 제목. 새 이력서 제목의 앞부분이 된다. */
  baseTitle?: string;
}

/**
 * 변환 결과 인계 — 목록(/mypage/resume)이나 편집 화면에서 분석하고 에디터(/mypage/resume/new)에서 받는다.
 * 서로 다른 라우트라 props로 넘길 수 없어 sessionStorage를 쓴다(기관 프로필 미리보기와 같은 방식).
 *
 * 콜론형 키는 개인 회원 데이터(thepharmin:job-preferences 등)의 규칙을 따른다.
 */
const CONVERT_DRAFT_KEY = "thepharmin:resume-convert-draft";

export function saveResumeConvertDraft(handoff: ResumeConvertHandoff) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CONVERT_DRAFT_KEY, JSON.stringify(handoff));
}

/**
 * 인계분을 읽고 **즉시 지운다**. 한 번만 반영되어야 하기 때문이다 —
 * 남겨 두면 이후에 이력서를 새로 작성할 때마다 지난 변환 결과가 다시 채워진다.
 */
export function readResumeConvertDraft(): ResumeConvertHandoff | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(CONVERT_DRAFT_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(CONVERT_DRAFT_KEY);
  try {
    const parsed = JSON.parse(raw) as ResumeConvertHandoff | ResumeConvertPatch;
    // 묶음 형태로 바꾸기 전에 저장된 값(patch 단독)이 남아 있을 수 있다 — 그대로 감싸서 받는다.
    return "patch" in parsed ? (parsed as ResumeConvertHandoff) : { patch: parsed as ResumeConvertPatch };
  } catch {
    return null;
  }
}
