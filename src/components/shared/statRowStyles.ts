/**
 * ≤760px에서 "아이콘 카드 그리드"를 "행 리스트"로 바꾸는 공통 클래스 묶음.
 *
 * 세로 카드는 한 칸에 아이콘·라벨·값을 3층으로 쌓아 한 항목이 122px을 먹는다. 데스크톱에선 3~4장이
 * 가로로 놓여 이 높이가 문제되지 않지만, 좁은 폭에서 카드가 1열로 서면 항목 6개짜리 "공고 상세"가
 * 800px을 넘겨 화면 두 판이 된다. 좁은 폭에서 정보를 세로로 쌓을 이유가 없다 — 가로 한 줄로 눕히면
 * 라벨과 값이 눈높이에 나란히 오고 높이는 절반 아래로 떨어진다.
 *
 * 클래스를 컴포넌트가 아니라 문자열로 내보내는 이유: 이 처방을 쓰는 자리가 클라이언트 컴포넌트
 * (job-detail/shared.tsx)와 서버 컴포넌트(company/CompanyDetailSections.tsx)에 걸쳐 있다. 서버
 * 컴포넌트는 "use client" 모듈의 값을 그대로 가져다 쓸 수 없어(클라이언트 참조로 바뀐다) 양쪽이
 * 함께 import할 수 있는 중립 모듈이 필요하다. 그 두 파일의 카드가 원래 같은 시각 스타일의 복제본
 * 관계라(IndustryStatCard 주석 참조) 처방도 한 벌로 유지한다.
 *
 * 그리드(부모)에 STAT_ROW_LIST, 셀에 STAT_ROW_CELL, 그 안 아이콘·라벨·값에 나머지를 덧붙인다.
 * 전부 max-[760px] 변형이라 데스크톱 그리드에는 한 줄도 닿지 않는다.
 */

/** 부모 그리드 → 1열 행 리스트. 카드 사이 gap을 없애고 1px 구분선과 바깥 테두리로 묶는다. */
export const STAT_ROW_LIST =
  "max-[760px]:grid-cols-1 max-[760px]:gap-0 max-[760px]:divide-y max-[760px]:divide-[#edf1f4] max-[760px]:border max-[760px]:border-[#e2e8ef] max-[760px]:px-4";

/** 셀 → 가로 행. 카드의 박스(테두리·배경·라운드)와 가운데 정렬을 벗는다.
 *  flex-wrap은 caption(있는 셀만)을 값 아래 줄로 내리기 위한 것이다. */
export const STAT_ROW_CELL =
  "max-[760px]:flex max-[760px]:flex-wrap max-[760px]:items-start max-[760px]:gap-x-3 max-[760px]:gap-y-0 max-[760px]:rounded-none max-[760px]:border-0 max-[760px]:bg-transparent max-[760px]:px-0 max-[760px]:py-4 max-[760px]:text-left";

/** 아이콘 20px, 값보다 한 단계 옅게. mt-0.5는 20px 아이콘을 15px 텍스트의 시각 중심에 맞춘다. */
export const STAT_ROW_ICON = "max-[760px]:mx-0 max-[760px]:mt-0.5 max-[760px]:shrink-0 max-[760px]:text-[#8a94a3]";

/** 라벨 13px·고정폭 88px — 행마다 값의 시작점이 같아야 리스트로 읽힌다. */
export const STAT_ROW_LABEL =
  "max-[760px]:mt-0 max-[760px]:w-[88px] max-[760px]:shrink-0 max-[760px]:text-[13px] max-[760px]:font-normal max-[760px]:leading-[1.55] max-[760px]:text-[#8a94a3]";

/** 값 15px·600·좌측. flex-1+min-w-0으로 긴 값(사업 분야 등)은 이 칸 안에서 자연 줄바꿈한다. */
export const STAT_ROW_VALUE =
  "max-[760px]:mt-0 max-[760px]:min-w-0 max-[760px]:flex-1 max-[760px]:text-[15px] max-[760px]:font-semibold max-[760px]:leading-[1.55]";

/** 값 아래 보조 문구(caption). w-full로 제 줄을 받고, 값의 시작선(아이콘 20+12 + 라벨 88+12 = 132px)에 맞춘다. */
export const STAT_ROW_CAPTION = "max-[760px]:mt-1 max-[760px]:w-full max-[760px]:pl-[132px] max-[760px]:text-left";
