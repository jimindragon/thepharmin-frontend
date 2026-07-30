/**
 * 공고 등록 4트랙(Industry/Hospital/Pharmacy/Research)이 공유하는 입력 클래스.
 *
 * 이전에는 네 파일이 같은 문자열을 각자 `const IN = ...`으로 들고 있어, 한 곳만 고치면
 * 트랙끼리 값이 갈라졌다. 여기 한 곳에서만 정의한다.
 *
 * 값은 BusinessFormControls의 TextInput(기관정보 관리에서 쓰는 공유 컴포넌트)과 같다.
 * 컴포넌트 자체를 재사용하지 못하는 이유는 이 폼들이 `id`(라벨 htmlFor 연결)와 `type`을
 * 넘겨야 하는데 TextInput이 그 prop을 받지 않고, select/textarea는 아예 커버하지 못하기 때문.
 */
const FIELD_BASE =
  "w-full border border-[#d8e0e8] bg-white px-3.5 text-[15px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8";

/** 한 줄 입력. leading-tight — 줄간격이 필요 없고, 기본값이면 h-11 상하 여유가 모자란다. */
export const IN = `h-11 ${FIELD_BASE} leading-tight`;

/** 셀렉트. 네이티브 화살표를 지우고 우측 여백으로 커스텀 화살표 자리를 만든다. */
export const SEL = `${IN} appearance-none pr-8`;

/** 여러 줄 입력. 높이 고정을 풀고 leading-relaxed를 쓴다(줄간격 필요). */
export const TA = `${FIELD_BASE} h-auto resize-y py-2.5 leading-relaxed`;

/** 입력 아래 보조 설명. */
export const HINT = "mt-1 text-[12px] text-[#a0a9b7]";
