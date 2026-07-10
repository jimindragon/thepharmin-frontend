# 연구 트랙 — 공고 상세 설계 자료

> THE PHARMA Recruit / 4트랙 공통 골격 설계용 트랙별 자료 (4/4: 연구)
> 상태: **설계 자료** (구현 아님). 폼 진단 → 폼 정합 시나리오 → 표시 설계안.

---

## 0. 진단 요약 (연구 트랙 풀 진단 결과)

### 폼 구조
- 공고폼 `ResearchJobPostingForm.tsx`(7-step): §1 기본+연구분야 / §2 연구실 정보(연구 고유) / §3 모집내용+연구주제 / §4 근무조건+계약기간 / §5 검색노출 / §6 지원·마감 / §7 첨부. **저장 로직 없음.**
- 기관폼 `ResearchOrgProfileClient.tsx`(+`ResearchOrgProfile`): **병합형**(병원·약국과 동일). STEP 7에서 병원식 단일 인터페이스로 신설.

### 연구 트랙 특성 — "서술 중심" (4번째 성격)
- 약국=지표+태그(물리), 산업=분류(직무·사업), 병원=지표+태그+서술(복합), **연구=서술 중심.**
- 정확한 숫자 지표 약함(인력규모도 구간 분류뿐, 병상수 같은 정량값 없음). 연구분야(태그) + PI/연구실명/연구주제/장비/성과(서술)에 크게 의존. "누가·무엇을 연구하는가".
- 연구 고유 필드 최다: PI·책임자명, 연구실명, 연구주제, 계약기간, 연구분야, 기관유형, 인력규모, 장비인프라, 성과.

### 연구만의 구조적 차이 3가지 (★골격 중요)
1. **리뷰/뉴스 데이터 아예 없음** ⚠️: 병원·약국은 companies.ts에 리뷰 있고 렌더만 안 됨. 연구는 **Company 엔티티 자체를 안 씀**(Job.researchLab로만 동작). companyReviews에 연구기관 id 0건. → ⑨는 빈 상태 기본, 붙이려면 데이터부터 새로.
2. **연구실 vs 기관 계층**: labIntro/labHomepage(연구실 단위)와 shortIntro/homepageUrl(기관 단위)는 중복 아닌 계층. 큰 기관(KIST) 산하 개별 연구실이 자체 소개·URL 가질 수 있음. → 상세엔 연구실 값 우선, 없으면 기관 fallback.
3. **주소 체크박스가 가짜 mock 상수 참조**: §2 "기관 주소와 동일"이 `MOCK_INSTITUTION_ADDRESS` 하드코딩 복사(실제 프로필 아님). → 시나리오는 job.labAddress 직접 채움.

### 미완성 (참고)
- 연구만 "브랜드 페이지 미리보기" 비활성("준비 중"). `saveResearchOrgProfileDraft` 정의는 있으나 컴포넌트가 import 안 함. `getMissingRequiredResearchFields` 헬퍼 부재. (구현 범위 밖)

### 정합성 함정 회피
- 기관유형: 공고 §2 labInstitutionType ↔ 기관 institutionType이 **동일 옵션 소스**(산업의 id스킴 불일치 없음). 정본은 org.institutionType.
- 연구분야: 공고=이 공고 한정, 기관=기관 전체. 값 다를 정당한 이유(대형기관 여러 분야, 공고는 일부). 상세 상단은 job 우선.

---

## 1. 연구 대표 시나리오 (폼 정합형, job/org 이원 구조)

**시나리오: 중추신경발달·신경질환 박사후연구원 모집 (가상 "한국과학기술연구원 KIST" 산하 신경생리연구실)**

Claude Code가 폼에 없는 값(박사수료→박사, 신경생물학→neuroscience, 구체연봉→기관 내규)을 자체 교정해 제출. 추가 교정 불필요.

### job (공고폼 출처)

| 필드 | 값 | 저장형태 |
|---|---|---|
| title | 중추신경발달·신경질환 박사후연구원 모집 | 자유 |
| categoryId | `research-position` | id → "연구직" |
| subcategoryId | `postdoc` | id → "박사후연구원·포닥" |
| researchFieldIds | `[neuroscience, molecular-cell-biology, pharmacology-toxicology]` | id 배열 → 신경과학·분자세포생물학·약리독성 (이 공고 한정) |
| headcount | 1명 | 문자열 |
| employmentTypeId | `contract` | id → "계약직" |
| experienceId | `any` | id → "경력무관" |
| educationId | `doctor` | id → "박사" |
| isLeadership | false | bool → "일반 포지션" |
| **§2 연구실 정보 (연구 고유)** | | |
| labInstitutionType | `government_research_institute` | id (org 정본과 일치) |
| labName | 신경생리연구실 | 자유 |
| labPi | 한규철 | 자유 (연구 고유, 기관폼 대응 없음) |
| labAddress | 서울 성북구 화랑로14길 5 뇌과학연구소 | 자유(공고 우선) |
| labHomepage | https://neurophysiology-lab.example | 자유(연구실 단위) |
| labCareerPage | null | — |
| labIntro | 신경생리연구실은 중추신경발달과 신경질환의 기초 기전을 연구하며, 동물모델, 조직 이미징, 분자생물학 실험을 결합해 신경회로와 질환 관련 변화를 분석합니다. | 자유(연구실 단위) |
| **§3 모집내용** | | |
| summary | 중추신경발달과 신경질환 기초연구를 함께 수행할 박사후연구원을 모집합니다. | 자유 |
| researchTopics | 중추신경발달 과정에서 나타나는 신경회로 변화와 신경질환 관련 기전을 연구합니다. 동물모델, 조직면역염색, 칼슘이미징, 분자생물학 분석을 활용해 신경발달과 질환 관련 변화를 분석하고, 신경질환 치료제 개발 가능성을 탐색합니다. | 자유서술(연구 고유) |
| responsibilities | (아래 5항목) | textarea |
| requirements | (아래 4항목) | textarea |
| preferred | (아래 4항목) | textarea |
| **§4 근무조건** | | |
| workModeId | `onsite` | id → "출근" |
| salary | 기관 내규 | 문자열(옵션값) |
| contractPeriodId | `project-based` | id → "과제 단위" (연구 고유) |
| benefits | 연차휴가, 유연근무제, 식대지원, 건강검진, 학회세미나지원, 연구활동지원, 장비인프라지원 | 문자열 배열(옵션값) |
| workCondDetail | 국가연구개발과제 기반 계약이며, 과제 일정과 연구실 내규에 따라 계약 기간과 세부 근무조건을 협의합니다. 실험 일정에 따라 연구실 출근 근무를 기본으로 하며, 학회 발표와 논문 작성 등 연구활동을 지원합니다. | 자유 |
| coreKeywords | 신경과학, 신경질환, 중추신경발달, 동물실험, 조직면역염색, 칼슘이미징, RNAscope, 박사후연구원 | 문자열 배열(동적추천+직접) |
| applyMethodId | `email` | id → "이메일 지원" |
| applyEmail | neuro-recruit@kist-research.example | 자유 |
| deadlineDate | 2026-08-31 | date |
| isRolling | true | bool |

**responsibilities:**
- 마우스 행동실험 및 신경발달 관련 표현형 분석
- 조직면역염색, RNAscope, 칼슘이미징 실험 수행
- 신경질환 관련 분자·세포 수준 분석
- 연구 데이터 정리와 통계 분석
- 연구계획서, 결과보고서, 논문 작성 지원

**requirements:**
- 생명과학, 약학, 의생명과학, 신경과학 등 관련 분야 박사 학위 소지자
- 동물실험 또는 조직·세포 기반 실험 경험이 있는 분
- 연구 데이터를 체계적으로 정리하고 분석할 수 있는 분
- 연구실 구성원과 협업하며 과제 일정을 관리할 수 있는 분

**preferred:**
- 신경발달, 신경질환, 뇌과학 관련 연구 경험자
- 조직면역염색, RNAscope, 칼슘이미징 경험자
- 동물행동실험 또는 신경회로 분석 경험자
- 국내외 논문 작성 및 국가연구개발과제 수행 경험자

### org (기관정보폼 출처)

| 필드 | 값 | 저장형태 |
|---|---|---|
| institutionName | 한국과학기술연구원 KIST | 자유 |
| institutionType | `government_research_institute` | id → "정부출연연구기관" |
| foundedYear | 1966 | 숫자 |
| address | 서울 성북구 화랑로14길 5 | 자유(fallback) |
| detailAddress | 뇌과학연구소 | 자유 |
| homepageUrl | https://www.kist.research.example | 자유(기관 단위) |
| logoText | KIST | 자유(텍스트 로고) |
| coverImageUrl | null | — |
| **연구 환경 (STEP 7 §4)** | | |
| researchFieldIds | `[neuroscience, molecular-cell-biology, pharmacology-toxicology]` | id 배열(기관 전체) |
| staffScale | `over_100` | id → "100명 이상" |
| equipmentInfra | 동물행동분석실, 조직면역염색 장비, 형광현미경, 칼슘이미징 장비, 분자생물학 실험 장비를 활용합니다. | 자유서술 |
| achievements | 신경발달과 신경질환 기전 연구를 기반으로 국내외 학술 논문, 국가연구개발과제, 공동연구 성과를 축적하고 있습니다. | 자유서술 |
| **공개 프로필** | | |
| shortIntro | 뇌과학과 신경질환 기초연구를 중심으로 중개 가능성이 있는 연구 주제를 수행하는 정부출연연구기관입니다. | 자유 |
| features | (아래 3개) | {title, text}[] |
| keywords | 정부출연연구기관, 뇌과학, 신경질환, 기초연구, 국가연구개발과제 | 문자열 배열(자유) |

**features:**
1. title: 뇌과학 연구 기반 / text: 신경발달, 신경회로, 신경질환 관련 기초연구를 수행합니다.
2. title: 연구 장비 인프라 / text: 조직 이미징, 행동분석, 분자생물학 실험 장비를 활용할 수 있습니다.
3. title: 과제 중심 연구 / text: 국가연구개발과제 기반으로 연구 주제와 실험 계획을 운영합니다.

**비공개(정본 미포함):** org.phone, org.email(기관 대표 연락처), businessNumber·institutionCode·면허 등 인증정보.

---

## 2. 섹션별 표시 설계안

공통 골격 1~9 대응. **③=연구실·연구환경(A안), ④=연구주제 먼저.**

### 1) 히어로
- 배지: `org.institutionType`(정부출연연구기관) / `job.subcategory`(박사후연구원·포닥) / `job.researchFields[0]`(신경과학)
  - ★ 배지 확정: 기관유형 + 직무 + 대표 연구분야. (고용형태·계약기간은 ②로)
- 제목: job.title / 메타: org.institutionName · 지역 · 근무방식 / 요약: job.summary

### 2) 핵심 조건 (카드 그리드)
고용형태(계약직) / 경력(경력무관) / 학력(박사) / 모집인원(1명) / 근무방식(출근) / 급여(기관 내규) / **계약기간(과제 단위)** / 마감일(2026.08.31)
- 계약기간이 연구 트랙 핵심조건에 추가됨(다른 트랙엔 없음).
- 조기마감 → 보조 문구.

### 3) 연구실·연구환경 ★ (연구 ③ 슬롯, A안: 연구실 정체성 중심)
**상단 요약 카드:**
- 직무: job.subcategory(박사후연구원·포닥)
- 기관 유형: org.institutionType(정부출연연구기관)
- 연구 인력 규모: org.staffScale(100명 이상)
- 계약 기간: job.contractPeriod(과제 단위)

**중단 정체성 (A안 핵심):**
- 연구실: job.labName(신경생리연구실)
- PI: job.labPi(한규철)
- 연구 분야: job.researchFields(신경과학, 분자·세포생물학, 약리·독성) — 태그

**하단 자유서술:**
- 연구 주제: job.researchTopics
- 주요 장비·인프라: org.equipmentInfra
- 주요 연구 성과: org.achievements

규칙:
- 연구실명·PI·연구주제 반드시 ③에. 연구는 "연구실 단위"가 실질 근무단위.
- 연구분야는 job 우선(기관 전체는 ⑧ 보조).
- 기관유형은 org.institutionType 기준(공고 labInstitutionType은 중복).
- 장비·성과는 자유서술 → 지표카드처럼 과하게 쪼개지 않음.
- 연구실 홈페이지(labHomepage)는 ③ 또는 ⑧ 보조 링크.

### 4) 연구 주제 및 주요업무 ★ (연구 고유: 연구주제 먼저)
- job.researchTopics 먼저 문단(별도 소제목 강조).
- job.responsibilities 불릿.
규칙: 연구는 연구주제가 주요업무보다 먼저. 둘을 뭉개지 않음. (다른 트랙은 ④=주요업무만)

### 5) 자격요건·우대사항 (2컬럼 카드)
필수: job.requirements / 우대: job.preferred(빈 배열이면 숨김).

### 6) 상세 근무조건
job.workCondDetail 문단 → job.benefits 태그(연구 WELFARE_OPTS 그대로). 계약기간 보조 표시.

### 7) 위치·근무지
job.labAddress 우선, 없으면 org.address+detailAddress fallback. 지도 placeholder.
- "기관 주소와 동일" 체크가 하드코딩 mock 참조 → 이 체크값은 정본 판단에 미사용.

### 8) 연구기관 소개
org.shortIntro(굵은 상단) → org.features(3열) → org.keywords(하단 태그).
+ org.researchFieldIds(기관 전체 연구분야, 보조) + org.staffScale + org.equipmentInfra/achievements 요약 + org.homepageUrl.
- ③가 연구실 단위 → ⑧은 기관 전체 소개 역할.
- labIntro(연구실) ≠ org.shortIntro(기관) 섞지 않음.
- org.phone/email 미표시.

### 9) 리뷰·뉴스 (연구는 데이터 없음 → 자리만/숨김)
- **연구는 Company/CompanyReview 미연결.** 병원·약국처럼 기존 리뷰 붙이기 불가.
- 새 리뷰/뉴스 데이터 만들지 않음.
- ⑨ 섹션 **숨기거나** "추후 연구기관 리뷰 확장 예정" 내부 자리만. 빈 섹션 크게 노출 안 함.

---

## 3. 사이드바안 (구현 나중)
- A 지원카드: 지원방식(이메일 지원) / 마감(2026.08.31) / 조기마감 안내 / 지원 버튼
- B 이 공고 핵심: 박사후연구원·포닥 / 신경과학 / 계약직 / 박사 / 출근 / 기관 내규 / 과제 단위
- C(보조): 연구실(신경생리연구실) / PI(한규철) / 기관유형(정부출연연구기관)
- 지원 이메일은 로그인/지원 단계 공개. 비로그인 직접 노출 안 함.

---

## 4. 골격 확정 시 반영할 연구 트랙 특이점

| 항목 | 값 |
|---|---|
| ③ 핵심 환경 | 연구실·연구환경 = **서술 중심**(연구실 정체성, A안) |
| ③↔⑧ 경계 | **예외**: 기관 스펙(유형/규모/장비/성과)을 ③ 보조로만, 주인은 연구실 정보 |
| ④ 특이 | **연구주제(고유)를 주요업무보다 먼저**, 별도 소제목 |
| 핵심조건 특이 | **계약기간** 추가(다른 트랙 없음) |
| ⑧ 기관소개 | 기관 전체 소개(연구실은 ③) |
| ⑨ 리뷰/뉴스 | **데이터 자체 없음**(Company 미사용) → 숨김/자리만 |
| 인증구조 | **병합형** |
| 중복 | 계층 관계(연구실↔기관), fallback 자연스러움 |

★ ③↔⑧ 경계 규칙 예외: 병원 규칙("기관 구조 스펙은 ③가 주인")과 반대. 연구는 "연구실"이 실질 근무단위라 연구실 정보가 ③ 주인, 기관 스펙은 ⑧ 또는 ③ 보조. **트랙 특성이 규칙보다 우선하는 케이스.**

---

*연구 트랙 설계 자료 끝. 4트랙 완료 → 다음: 공통 골격 최종 확정.*
