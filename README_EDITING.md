# THE PHARMA Recruit 채용공고 화면 수정 안내

이 프로젝트는 `/jobs` 채용공고 목록, `/jobs/ra-specialist` 공고 상세, `/company/jobs/new` 기업용 공고 등록 화면을 프론트엔드 Mock Data로 구현한 Next.js App Router 프로젝트입니다.

## 문구 수정

- 공통 사이트명, 페이지 제목, 검색 placeholder, 총 공고 수는 `src/config/site.ts`에서 수정합니다.
- 상단 메뉴와 헤더 CTA 문구는 `src/config/navigation.ts`에서 수정합니다.

## 색상과 디자인 토큰 수정

- 브랜드 청록색, 보조 포인트 컬러, 텍스트, 테두리, 배경, 위험 색상은 `src/styles/globals.css`의 `:root` CSS 변수에서 수정합니다.
- 주요 변수:
  - `--color-brand`: 기본 CTA, 활성 탭, 선택 상태
  - `--color-accent`: 추천 배지처럼 제한된 강조
  - `--color-danger`: 오늘 마감, 마감 임박
  - `--radius`: 카드와 버튼 모서리
  - `--shadow`: 카드 그림자
  - `--content-max-width`: 데스크톱 중앙 콘텐츠 최대 너비
  - `--sidebar-width`: 오른쪽 사이드바 너비

## 공고 데이터 수정

- 일반 공고 목록은 `src/data/jobs.ts`에서 수정합니다.
- RA Specialist 상세 페이지도 `src/data/jobs.ts`의 같은 공고 객체를 사용합니다. 제목, 경력, 학력, 지원 방식, 주요업무, 자격요건, 핵심 키워드는 이 파일에서 한 번만 수정하면 목록과 상세에 함께 반영됩니다.
- 추천 공고 3개는 `src/data/recommendedJobs.ts`에서 수정합니다.
- 추천 공고에서 상세 페이지로 연결하려면 `jobSlug` 값을 `src/data/jobs.ts`의 `slug`와 맞춥니다.
- 이미지가 필요한 추천 공고는 `public/images` 폴더의 SVG 파일을 교체하거나 새 파일을 추가한 뒤 `image` 경로를 바꾸면 됩니다.
- 상세 대표 이미지는 공고 객체의 `coverImage` 경로를 수정합니다.

## 기업용 공고 등록 화면 수정

- 등록 화면 경로는 `/company/jobs/new`입니다.
- 화면 컴포넌트는 `src/components/job-registration/JobPostingRegistrationForm.tsx`에 있습니다.
- 초기 입력값은 같은 파일의 `initialIntro`, `initialResponsibilities`, `initialRequirements`, `initialPreferredQualifications`에서 수정합니다.
- 핵심 역량 및 전문분야 추천 키워드는 `standardKeywordPool`에서 수정합니다.
- 키워드 유사어 자동 통합 규칙은 `keywordAliases`에서 수정합니다.
- 등록 화면의 기업 이미지 예시는 `public/images/company-office.svg`를 사용합니다.

## 컴포넌트 위치

- `Header`: `src/components/Header.tsx`
- `CategoryTabs`: `src/components/CategoryTabs.tsx`
- `SearchFilterPanel`: `src/components/SearchFilterPanel.tsx`
- `SelectedFilterChips`: `src/components/SelectedFilterChips.tsx`
- `RecommendedJobs`: `src/components/RecommendedJobs.tsx`
- `JobListToolbar`: `src/components/JobListToolbar.tsx`
- `JobCard`: `src/components/JobCard.tsx`
- `SidebarQuickLinks`: `src/components/SidebarQuickLinks.tsx`
- `Pagination`: `src/components/Pagination.tsx`
- `JobPostingRegistrationForm`: `src/components/job-registration/JobPostingRegistrationForm.tsx`

## 실행 방법

번들 Node/Pnpm을 PATH에 추가한 뒤 실행합니다.

```bash
export PATH="/Users/ijimin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/ijimin/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH"
pnpm install
pnpm dev
```

브라우저에서 아래 경로를 엽니다.

- 채용공고 목록: `http://localhost:3000/jobs`
- RA Specialist 상세: `http://localhost:3000/jobs/ra-specialist`
- 기업용 공고 등록: `http://localhost:3000/company/jobs/new`
