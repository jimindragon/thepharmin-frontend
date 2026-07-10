# 산업 트랙 — 공고 상세 설계 자료

> THE PHARMA Recruit / 4트랙 공통 골격 설계용 트랙별 자료 (2/4: 산업)
> 상태: **설계 자료** (구현 아님). 폼 진단 → 폼 정합 시나리오 → 표시 설계안까지 정리.
> 이 문서는 약국 정본(`pharmacyJobDetails.ts`)에 대응하는 산업 트랙 버전이며,
> 4트랙 골격 확정 후 실제 구현 시 정본 파일로 옮길 재료다.

---

## 0. 진단 요약 (산업 트랙 풀 진단 결과)

### 폼 구조
- 공고폼 `IndustryJobPostingForm.tsx`: §1 기본정보 / §2 모집내용 / §3 근무조건 / §4 검색노출 / §5 지원방법·마감 / §6 상세이미지·첨부. **저장 로직 없음**(validate만).
- 기관폼 `BusinessCompanyProfileClient.tsx`: `OrgProfileBase` 상속 + 별도 `OrgAdmin`(인증정보 분리). 약국(PharmacyOrgProfile 병합형)과 구조 다름 — 산업은 인증정보가 완전 분리.

### 주의할 정합성 함정 (정본 작성 시 교정)
1. **기업명 2중 소스**: 공고폼은 레거시 `initialBusinessCompanyProfile.displayName`, 기관폼은 신규 `IndustryOrgProfile.name` 참조. 초기값만 우연히 같음("더파마뉴스"). → **정본은 신규 `org.name` 기준.**
2. **산업 분류 vs 기관 유형 id 스킴 불일치**: 공고 `industryCat`(shared.ts, 7개, 하이픈) ≠ 기관 `orgType`(businessCompanyProfile.ts, 6개, 언더스코어). 대응도 안 맞음(`medical-device` vs `medical_device`, cro/cdmo 분리 vs cro_cdmo 통합). 회사 업종은 공고마다 안 바뀜 → **정본은 `org.orgType`만, 공고 `industryCat`은 제거.**
3. **근무지 주소**: 공고폼 "기업 주소와 동일" 체크가 레거시 주소를 복사(버그성). → 상세는 **공고 `job.address` 우선, fallback은 신규 `org.address`.** 레거시 주소 소스 미사용.

### 산업 트랙 ③"핵심 환경"의 성격 (골격 핵심 발견)
- 약국=조제환경(일평균처방/장비/전산/근무인원)처럼 **물리적 스펙 정형 필드가 산업엔 없음.**
- 대신 **직무(대/소분류) + 근무방식 + 사업분야 + 대표제품 + 기업규모**의 조합으로 "직무·사업 환경"을 구성. (B안 확정)
- → 골격 원칙: **③섹션은 트랙별 자유 슬롯.** 내부 표현은 트랙마다 다름(약국=지표카드, 산업=직무+사업맥락).

---

## 1. 산업 대표 시나리오 (폼 정합형, job/org 이원 구조)

**시나리오: 의료기기 RA·인허가 경력직 채용 (가상 기업 "메디넥스")**

교정 반영: industryCat 제거 / orgType=medical_device 기준 / 소분류 medical-device-ra 단일 / 히어로 유형배지는 orgType, 직무배지는 category·subcategory.

### job (공고폼 출처)

| 필드 | 값 | 저장형태 |
|---|---|---|
| title | 의료기기 RA·인허가 경력직 채용 | 자유 |
| categoryId | `regulatory` | id → "RA·인허가" |
| subcategoryId | `medical-device-ra` | id → "의료기기 RA" |
| headcount | 1명 | 문자열(옵션값) |
| employmentTypeId | `permanent` | id → "정규직" |
| experienceId | `1-3` | id → "1~3년" |
| educationId | `any` | id → "학력무관" |
| isLeadership | false | bool → "일반 포지션" |
| ~~industryCat~~ | **제거** (org.orgType 사용) | — |
| summary | 의료기기 인허가와 품질문서 관리를 함께 담당할 RA 경력자를 찾습니다. | 자유 |
| mainDuties | (아래 5항목) | textarea |
| requiredQual | (아래 4항목) | textarea |
| preferred | (아래 4항목) | textarea |
| workModeId | `onsite` | id → "출근" |
| address | 경기 군포시 농심로 3, 3층 | 자유(공고 우선) |
| salary | 회사 내규 | 문자열(옵션값) |
| welfare | 건강검진, 식대 지원, 연차·반차, 성과급, 학회·세미나 지원 | 문자열 배열(옵션값) |
| workCondDetail | 주 5일 출근 근무이며, 인허가 일정에 따라 개발·품질·사업 부서와 협업이 잦습니다. 정기적인 품질문서 리뷰와 규제 자료 업데이트가 있어 문서 관리 역량이 중요합니다. | 자유 |
| coreKeywords | RA, 의료기기 RA, 인허가, MFDS, GMP, QMS, FDA, 품질문서 | 문자열 배열(혼합입력) |
| applyMethodId | `quick` | id → "더파마 간편지원" |
| deadlineDate | 2026-08-08 | date |
| isRolling | true | bool |

**mainDuties:**
- 의료기기 국내 인허가 자료 작성 및 관리
- MFDS 인허가, 변경허가, 갱신 관련 문서 준비
- ISO 13485 기반 품질문서와 기술문서 관리
- 제품 개발·품질·임상 유관 부서와 인허가 일정 조율
- 해외 인증 및 규제 자료 조사 지원

**requiredQual:**
- 의료기기 RA 또는 품질 관련 업무 경험이 있는 분
- 인허가 문서, 기술문서, 품질문서 작성 경험이 있는 분
- 규제기관 제출 자료를 꼼꼼하게 관리할 수 있는 분
- 유관 부서와 원활하게 커뮤니케이션할 수 있는 분

**preferred:**
- MFDS 의료기기 인허가 경험자
- ISO 13485, GMP, QMS 문서 관리 경험자
- CE, MDR, FDA 등 해외 인허가 업무를 경험한 분
- 영어 문서 검토가 가능한 분

### org (기관정보폼 출처)

| 필드 | 값 | 저장형태 |
|---|---|---|
| name | 메디넥스 | 자유(정본=신규 name) |
| orgType | `medical_device` | id → "의료기기" |
| foundedYear | 2019 | 숫자 |
| employeeCount | `under_50` | id → "50명 이하" |
| address | 경기 군포시 농심로 3 | 자유(fallback 소스) |
| detailAddress | 3층 | 자유 |
| homepageUrl | https://www.medinex.co.kr | 자유 |
| logoText | 메디넥스 | 자유(텍스트 로고) |
| coverImageUrl | null | — |
| shortIntro | 의료기기 인허가와 품질관리 체계를 기반으로 진단·검사 제품을 개발하는 헬스케어 기업입니다. | 자유 |
| fullIntro | 메디넥스는 진단·검사 분야 의료기기를 개발하고 국내외 인허가와 품질관리 체계를 함께 운영하는 기업입니다. 제품 개발 초기 단계부터 인허가 전략, 품질문서 관리, 규제 대응까지 유관 부서가 협업하는 구조로 일합니다. | 자유 |
| keywords | 의료기기, 인허가, 품질관리, 진단·검사, 규제 대응 | 문자열 배열(자유) |
| businessFields | 진단·검사, 디지털헬스케어 | 문자열 배열(옵션값) |
| products | (아래 2개) | {name, description}[] |

**products:**
1. name: 현장 진단 보조기기 / description: 의료기관에서 사용하는 진단 보조 장비와 관련 소프트웨어를 개발합니다.
2. name: 검사 데이터 관리 솔루션 / description: 검사 결과와 품질 데이터를 관리하는 디지털 헬스케어 솔루션입니다.

**비공개(정본 미포함):** org.phone, org.email(대표 연락처 — 지원 창구와 혼동), OrgAdmin 전체(businessNumber/representativeName/approvedAt/businessLicenseFile/verificationStatus).

---

## 2. 섹션별 표시 설계안

공통 골격 1~9 대응. **③만 산업 고유(직무·사업 환경).**

### 1) 히어로
- 배지: `org.orgType` label(의료기기) / `job.category` label(RA·인허가) / `job.employmentType` label(정규직)
  - ⚠️ 유형 배지는 **orgType에서** (industryCat 아님). 직무 배지는 category/subcategory에서.
- 제목: job.title
- 메타: org.name · 지역(job.address 앞부분) · job.workMode label(출근)
- 요약: job.summary
- 규칙: 폼에 없는 문구("전문가 채용" 등) 생성 금지.

### 2) 핵심 조건 (카드 그리드)
급여(job.salary) / 근무방식(job.workMode label) / 고용형태(job.employmentType label) / 경력(job.experience label) / 학력(job.education label) / 모집인원(job.headcount) / 마감일(job.deadlineDate 포맷)
- 조기마감(job.isRolling) → 보조 문구 "기업 사정에 따라 조기 마감될 수 있습니다."
- 규칙: 폼 라벨 그대로(1~3년/학력무관). 날짜만 포맷 가능.

### 3) 직무·사업 환경 ★ (산업 ③ 슬롯, B안)
**상단 요약** (job 출처):
- 직무: job.subcategory label(의료기기 RA)
- 직무군: job.category label(RA·인허가)
- 근무 방식: job.workMode label(출근)
- 포지션: job.isLeadership → "일반 포지션" (또는 숨김 가능)

**하단 사업 맥락** (org 출처):
- 기업 유형: org.orgType label(의료기기)
- 기업 규모: org.employeeCount label(50명 이하)
- 사업·제품 분야: org.businessFields(진단·검사, 디지털헬스케어) — 태그
- 대표 제품: org.products(name + description) — 카드/목록

규칙:
- 약국식 지표카드 3개 고정 안 함. 산업은 "직무가 어떤 사업맥락에 놓이는가".
- 정형 선택지값(칩)과 자유서술 구분.
- isLeadership false는 "일반 포지션" 표시 또는 숨김. "팀 리딩 없음" 같은 폼에 없는 문구 금지.

### 4) 주요업무
job.mainDuties → 불릿. textarea 줄바꿈 구조 유지. 임의 카테고리 분할 금지.

### 5) 자격요건·우대사항 (2컬럼 카드)
필수: job.requiredQual / 우대: job.preferred(빈 배열이면 카드 숨김).

### 6) 상세 근무조건
job.workCondDetail 문단 → job.welfare 태그(폼 칩 라벨 그대로). welfare 비면 숨김.

### 7) 위치·근무지
job.address 우선, 없으면 org.address+detailAddress fallback(신규 프로필 기준). 지도 placeholder. 근무방식 보조 표시.
- 레거시 주소 소스 미사용.

### 8) 기업 소개
org.shortIntro(굵은 상단 문장) → org.fullIntro(본문) → org.keywords(하단 태그).
+ homepageUrl(외부 링크 스타일), foundedYear, employeeCount.
- ⚠️ 사업분야·대표제품이 ③에 이미 나옴 → ⑧에선 간략 반복 또는 "사업 정보"로 묶음. (골격 확정 시 주인 섹션 결정)
- org.phone/email 미표시. 기관 키워드 ≠ 공고 키워드 시각 구분.

### 9) 뉴스 / 리뷰·면접후기
- **뉴스**: Job.companyNews 있으면 유지, 없으면 숨김. (약국엔 없던 섹션 — 골격에서 트랙별 유무 처리)
- 리뷰·면접후기: companyReviews를 companyId 매칭. 있으면 "리뷰·면접후기 보기", 없으면 "아직 등록된 리뷰·면접후기가 없습니다".

---

## 3. 사이드바안 (약국과 동일 2단, 구현은 나중)
- A 지원카드: 지원방식(더파마 간편지원) / 마감일 / 조기마감 안내 / 지원 버튼
- B 이 공고 핵심: 의료기기 RA / 정규직 / 출근 / 회사 내규 / 1~3년 / 50명 이하 의료기기 기업
- C 저장/공유

---

## 4. 골격 확정 시 반영할 산업 트랙 특이점 (약국과 차이)

| 항목 | 약국 | 산업 |
|---|---|---|
| ③ 핵심 환경 | 조제환경(물리 스펙, 지표카드) | 직무·사업 환경(직무+사업맥락) |
| ⑧ 기업소개 정보량 | 적음(shortIntro/features/키워드) | 많음(fullIntro/사업분야/대표제품/규모/설립연도/홈페이지) |
| ⑨ 뉴스 | 없음 | 있음(companyNews) |
| ③↔⑧ 중복 | 없음 | 사업분야·대표제품이 양쪽 가능 → 주인 결정 필요 |
| 인증정보 구조 | 병합형(PharmacyOrgProfile) | 분리형(OrgProfileBase + OrgAdmin) |

→ 골격은 1·2·4·5·6·7 공통, ③·⑧·⑨는 트랙별 편차 수용 필요.

---

*산업 트랙 설계 자료 끝. 다음: 병원 트랙 풀 진단.*
