# 병원 트랙 — 공고 상세 설계 자료

> THE PHARMA Recruit / 4트랙 공통 골격 설계용 트랙별 자료 (3/4: 병원)
> 상태: **설계 자료** (구현 아님). 폼 진단 → 폼 정합 시나리오 → 표시 설계안.

---

## 0. 진단 요약 (병원 트랙 풀 진단 결과)

### 폼 구조
- 공고폼 `HospitalJobPostingForm.tsx`: §1 기본 / §2 모집내용 / §3 근무조건(병원 고유 필드 집중) / §4 검색노출 / §5 지원·마감 / §6 첨부. **저장 로직 없음.**
- 기관폼 `HospitalOrgProfileClient.tsx`(+`HospitalOrgProfile`): **병합형**(약국과 동일, 인증정보+공개+병원전용 단일 인터페이스). 산업의 Base+Admin 분리와 다름.

### 병원 트랙 특성
- **③ 재료가 3트랙 중 가장 풍부**: 정량지표(병상수·약사인원) + 분류태그(진료과 26종·전문약사 9종·병원유형·운영형태) + 자유서술(당직체계·약제부환경 2000자). 지표/태그/서술 3종 다 있음.
- **중복 거의 없음**: 근무지 주소만 유일한 중복(기관↔공고, 정상 연동). 나머지는 기관 aspect(병상/진료과/전문약사/당직)와 공고 aspect(직무/근무형태/급여)로 깔끔히 분리.
- **병원=약사 직무 전용**: 모집 직무가 약사 관련 5개뿐(의사·간호사·의료기사 없음). 더팜인=약사 플랫폼 정체성.

### 함정 (정본 작성 시 회피)
1. **specialtyLabel = 죽은 필드** ⚠️: "전문병원" 라벨은 hospitalType="hospital"+specialtyLabel 조합인데, **편집 폼에 specialtyLabel 입력 UI 없음**(grep 0건). 사업자가 채울 방법 없음. → 시나리오에서 **미사용**. 병원 유형은 6개 enum만.
2. 백로그 "hospitalType에 전문병원 없음"은 부분오류(조합 표현으로 설계는 됨) — 실제 문제는 "입력 UI 부재".

---

## 1. 병원 대표 시나리오 (폼 정합형, job/org 이원 구조)

**시나리오: 약제팀 토요근무 약사 채용 (가상 기관 "한림성심병원")**

### job (공고폼 출처)

| 필드 | 값 | 저장형태 |
|---|---|---|
| title | 약제팀 토요근무 약사 채용 | 자유 |
| categoryId | `hospital-pharmacist` | id → "약사 직무" |
| subcategoryId | `hospital_pharmacist` | id → "입원·조제 약사" |
| employmentTypeId | `contract` | id → "계약직" |
| experienceId | `any` | id → "경력무관" |
| educationId | `pharmacy` | id → "약사 면허" |
| isLeadership | false | bool → "일반 포지션" |
| summary | 대학병원 약제팀에서 토요일 조제·투약 업무를 담당할 약사님을 모십니다. | 자유 |
| responsibilities | (아래 4항목) | textarea |
| requirements | (아래 4항목) | textarea |
| preferred | (아래 3항목) | textarea |
| shiftTypeIds | `[weekend_work, day_shift]` | id → "주말근무", "주간근무" |
| workDays | 토요일 | 자유 |
| address | 경기 안양시 동안구 관평로170번길 22 약제팀 | 자유(공고 우선) |
| salary | 기관 내규 | 문자열(옵션값) |
| benefits | 의료비 지원, 식대 지원, 당직·휴일수당, 직원 주차 | 문자열 배열(옵션값) |
| workCondDetail | 토요일 08:00–17:30 근무이며, 1시간 휴게시간이 포함됩니다. 주말 외래·입원 처방 흐름에 따라 조제, 검수, 투약 지원 업무를 수행합니다. 근무 수당과 세부 조건은 기관 내규에 따라 안내됩니다. | 자유 |
| coreKeywords | 조제, 투약, 처방검토, 복약상담, 병동약료, 의약품 관리, 주말근무, 병원약사 | 문자열 배열(혼합입력) |
| applyMethodId | `email` | id → "이메일 지원" |
| applyEmail | pharmacy-recruit@hallym-hospital.example | 자유 |
| deadlineDate | null | (조기마감으로 대체) |
| isRolling | true | bool → "채용 시 마감" |

**responsibilities:**
- 입원·외래 처방 조제 및 검수
- 처방 검토와 투약 지원
- 병동 및 외래 환자 복약상담 보조
- 의약품 재고 확인 및 약제팀 업무 지원

**requirements:**
- 약사 면허 소지자
- 병원 약제 업무 수행이 가능한 분
- 토요일 근무가 가능한 분
- 처방 조제와 검수 업무를 책임감 있게 수행할 수 있는 분

**preferred:**
- 병원 약제팀 근무 경험자
- 입원·외래 처방 조제 경험자
- 병원 전산 사용 경험자

### org (기관정보폼 출처)

| 필드 | 값 | 저장형태 |
|---|---|---|
| institutionName | 한림성심병원 | 자유 |
| hospitalType | `tertiary` | id → "상급종합병원" |
| hospitalOperator | `university` | id → "대학병원" |
| foundedYear | 1999 | 숫자 |
| bedCount | 820병상 내외 | 자유 |
| address | 경기 안양시 동안구 관평로170번길 22 | 자유(fallback 소스) |
| detailAddress | 약제팀 | 자유 |
| homepageUrl | https://www.hallym-hospital.example | 자유 |
| logoText | 한림성심병원 | 자유(텍스트 로고) |
| coverImageUrl | null | — |
| shortIntro | 지역 중증질환 진료와 교육·연구 기능을 함께 수행하는 대학병원입니다. | 자유 |
| features | (아래 3개) | {title, text}[] |
| keywords | 대학병원, 약제팀, 주말근무, 병원약사, 교육 지원 | 문자열 배열(자유) |
| medicalDepartments | `[internal_medicine, surgery, pediatrics, emergency_medicine, orthopedics, neurology, laboratory_medicine]` | id 배열 → 내과·외과·소아청소년과·응급의학과·정형외과·신경과·진단검사의학과 |
| specialistPharmacists | 감염, 종양, 정맥영양, 중환자 | 문자열 배열(옵션값) |
| pharmacyStaffCount | 45명 내외 | 자유 |
| dutySystem | 주간 약제 업무와 야간·주말 당직 업무가 분리되어 운영됩니다. 주말 근무자는 토요일 외래·입원 처방 조제와 투약 지원을 담당합니다. | 자유서술 |
| pharmacyEnvironmentDescription | 입원·외래 처방 조제, 처방 검토, 복약상담, 의약품 관리 업무가 약제팀 내에서 분담되어 운영됩니다. 주말 근무 시에는 정해진 시간대의 처방 흐름에 맞춰 조제·검수·투약 업무를 수행합니다. | 자유서술 |

**features:**
1. title: 약제부 협업 체계 / text: 조제·검수·복약상담 업무가 약제팀 내 역할에 따라 분담됩니다.
2. title: 교육 지원 / text: 신규 근무자는 병원 전산과 약제부 업무 흐름을 단계적으로 안내받습니다.
3. title: 안정적인 진료 기반 / text: 다양한 진료과 처방을 기반으로 병원 약무 경험을 쌓을 수 있습니다.

**비공개(정본 미포함):** org.phone, org.email(대표 연락처), businessNumber·institutionCode·면허 등 인증정보, specialtyLabel(입력 UI 없음).

---

## 2. 섹션별 표시 설계안

공통 골격 1~9 대응. **③만 병원 고유(약제부 근무환경).**

### 1) 히어로
- 배지: `org.hospitalType`(상급종합병원) / `job.subcategory`(입원·조제 약사) / `job.shiftType`(주말근무)
  - ★ 배지 확정: 병원유형 + 직무 + 근무형태. (운영형태는 ③, 고용형태는 ②로)
  - 근무형태(주말근무)를 배지에 올려 토요근무 정체성 강조.
- 제목: job.title / 메타: org.institutionName · 지역 · 근무형태 / 요약: job.summary

### 2) 핵심 조건 (카드 그리드)
급여(기관 내규) / 근무형태(주말근무·주간근무) / 고용형태(계약직) / 경력(경력무관) / 학력(약사 면허) / 근무요일(토요일) / 마감(채용 시 마감)
- 조기마감(isRolling) → "채용 시 마감" 표시.

### 3) 약제부 근무환경 ★ (병원 ③ 슬롯, B안: 병원전체+약제부)
**상단 지표 카드:**
- 병원 유형: org.hospitalType label(상급종합병원)
- 병상 수: org.bedCount(820병상 내외)
- 약사 인원: org.pharmacyStaffCount(45명 내외)
- 근무 형태: job.shiftType labels(주말근무, 주간근무)

**중단 태그:**
- 주요 진료과목: org.medicalDepartments labels(내과, 외과, 소아청소년과, 응급의학과, 정형외과, 신경과, 진단검사의학과) — 태그
- 전문약사 보유: org.specialistPharmacists(감염, 종양, 정맥영양, 중환자) — 태그
- 운영 형태: org.hospitalOperator label(대학병원) — 여기서 표시

**하단 자유서술:**
- 당직 체계: org.dutySystem
- 약제부 근무환경: org.pharmacyEnvironmentDescription

규칙:
- 지표+태그+자유서술 3종 다 사용(병원 재료가 가장 풍부).
- EMR, 병동 배치, 팀 인원 구성 등 폼에 없는 정보 생성 금지. specialtyLabel 미사용.

### 4) 주요업무
job.responsibilities → 불릿. textarea 줄바꿈 유지.

### 5) 자격요건·우대사항 (2컬럼 카드)
필수: job.requirements / 우대: job.preferred(빈 배열이면 숨김).

### 6) 상세 근무조건
job.workCondDetail 문단 → job.benefits 태그(폼 칩 라벨 그대로).

### 7) 위치·근무지
job.address 우선, 없으면 org.address+detailAddress fallback. 지도 placeholder.
- 병원은 "기관 주소와 동일" 체크가 정상 연동(산업 레거시 버그 없음).

### 8) 기관 소개
org.shortIntro(굵은 상단) → org.features(3열) → org.keywords(하단 태그).
+ foundedYear, homepageUrl(외부 링크 스타일).
- ⚠️ 병상수·진료과·병원유형은 **③가 주인** → ⑧에선 반복 안 함(소개문만).
- org.phone/email 미표시. 기관 키워드 ≠ 공고 키워드 시각 구분.

### 9) 뉴스 / 리뷰·면접후기
- **뉴스**: 병원은 companyNews 유무 확인. 약국처럼 없으면 숨김. (골격에서 트랙별 유무 처리)
- 리뷰·면접후기: companyReviews를 companyId 매칭. 병원사 리뷰 데이터 다수 존재(national-fire-hospital 등). 있으면 "리뷰·면접후기 보기", 없으면 빈 상태.

---

## 3. 사이드바안 (약국·산업과 동일 2단, 구현 나중)
- A 지원카드: 지원방식(이메일 지원) / 마감(채용 시 마감) / 지원 버튼
- B 이 공고 핵심: 입원·조제 약사 / 계약직 / 주말근무 / 기관 내규 / 경력무관 / 상급종합병원(대학병원)
- C 저장/공유

---

## 4. ★ 골격 규칙 확정: ③↔⑧ 경계

병원·산업 공통으로 미결이던 "③와 ⑧ 중 어느 섹션이 주인인가"를 여기서 확정:

**규칙: 기관의 "구조적 스펙"(규모·분류·전문성)은 ③(핵심 환경)이 주인. ⑧(기관 소개)는 소개문(shortIntro/fullIntro/features/키워드)만.**

트랙별 적용:
| | ③ 주인 (핵심 환경) | ⑧ (기관 소개) |
|---|---|---|
| 약국 | 조제환경(처방/장비/전산/인원) | shortIntro/features/키워드 |
| 산업 | 직무+사업분야+대표제품+규모 | shortIntro/fullIntro/키워드 |
| 병원 | 병상수+진료과+전문약사+유형+운영 | shortIntro/features/키워드 |

→ 산업 설계 자료의 "③↔⑧ 중복 미결"도 이 규칙으로 해소: 사업분야·대표제품은 **③가 주인**, ⑧은 소개문만.

---

## 5. 골격 확정 시 반영할 병원 트랙 특이점

| 항목 | 값 |
|---|---|
| ③ 핵심 환경 | 약제부 환경 = 지표+태그+서술 **3종 다** (가장 풍부) |
| ⑧ 기관소개 정보량 | 중 (소개문+features, 스펙은 ③로) |
| ⑨ 뉴스 | 확인 필요(약국처럼 없을 가능성) |
| 인증구조 | **병합형** (HospitalOrgProfile 단일) |
| 중복 | 근무지 주소만 (가장 깔끔) |
| 직종 | 약사 전용 (의사·간호사 없음) |

---

*병원 트랙 설계 자료 끝. 다음: 연구 트랙 풀 진단 → 4트랙 골격 확정.*
