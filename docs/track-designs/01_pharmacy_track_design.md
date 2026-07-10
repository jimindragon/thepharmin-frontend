# 약국 트랙 — 공고 상세 설계 자료

> THE PHARMA Recruit / 4트랙 공통 골격 설계용 트랙별 자료 (1/4: 약국)
> 상태: **정본 이미 구현됨** (`src/data/pharmacyJobDetails.ts`, job/org 이원 구조).
> 목업도 렌더 완료(v2). 이 문서는 4트랙 비교용 요약.

---

## 0. 진단 요약
- 공고폼 `PharmacyJobPostingForm.tsx` / 기관폼 `PharmacyOrgProfileClient.tsx`(+`PharmacyOrgProfile` 타입, **병합형** — 인증정보 같은 인터페이스).
- 저장 로직 없음(4트랙 공통).
- 조제환경 입력은 9-a로 공고폼에서 제거됨(약국 고정속성이라 기관폼에만).

## 1. 정본 시나리오 (은행약국, 확정·구현됨)
job/org 이원 구조. 상세는 job 우선, 없으면 org fallback.

**job (공고):** title="주 3일 파트타임 근무약사 채용" / workTypeIds=[part_time,weekend] / employmentTypeId=part-time / experienceId=any / educationId=bachelor / headcount=1명 / summary·responsibilities·requirements·preferred·workConditionDetail / workDays="화·목·토" / workHours / salary{시급 35,000~38,000원} / benefits=[4대보험,식대 지원,주차 지원,명절 상여] / coreKeywords / staffPharmacistCount=1·staffSupportCount=2(근무시간대 기준, 공고 우선) / mainPrescribingHospital=""(빈값→org fallback) / apply / deadlineLabel="채용 시 마감" / isRolling=true

**org (기관):** pharmacyName=은행약국 / logoText / address·detailAddress·parking·transit / businessHours / pharmacyTypeId=local / pharmacyFeatureId=prescription_focused / shortIntro / features[3] / keywords / avgDailyPrescriptions="170건 내외" / mainDepartments / software=유팜 / dispensingEquipment=[자동조제기,산제포장기] / mainHospitals[3](job 빈값 시 fallback) / staffPharmacistCount=3·staffSupportCount=2(평상시 총원)

**비공개:** 기관 대표 phone/email, businessNumber·면허 등 인증정보.

## 2. 섹션 구조 (골격 1~9)
1. 히어로 — 유형/특성/마감 배지, 제목, 약국명·지역·근무요일, 요약
2. 핵심조건 — 급여/근무요일/근무시간/고용형태/경력/모집인원(카드 그리드)
3. **약국 근무환경 ★(③ 슬롯)** — 지표카드(일평균처방/근무인원/전산) + 라벨-값(주요처방과/주요처방병원/영업시간) + 조제장비 태그
4. 주요업무 — 불릿
5. 자격요건·우대 — 2컬럼 카드
6. 상세근무조건 — 소제목 분할(근무일정/근무안내/복리후생 태그)
7. 위치·교통 — 주소/주차/교통/지도 placeholder
8. 약국 소개 — shortIntro/features 3열/기관 키워드
9. 리뷰·면접후기 — companyReviews 매칭(뉴스 없음)

## 3. 트랙 특성
| 항목 | 값 |
|---|---|
| ③ 핵심 환경 | 조제환경 = **물리적 스펙**(숫자·장비 → 지표카드 적합) |
| ⑧ 기관소개 정보량 | 적음 (shortIntro/features/키워드) |
| ⑨ 뉴스 | **없음** |
| ③↔⑧ 중복 | 없음 |
| 인증정보 구조 | **병합형** (PharmacyOrgProfile 단일) |
| 중복 필드 처리 | 근무인원·주요처방병원 = job 우선, org fallback |

---

*약국 트랙 요약 끝.*
