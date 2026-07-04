const LEADING_SKIP_PATTERN = /[0-9\s!-/:-@[-`{-~“”‘’·…"'()（）]/;
const OPEN_PAREN_PATTERN = /[([（]/;
const CLOSE_PAREN_PATTERN = /[)\]）]/;

/**
 * 로고 이미지가 없을 때 표시할 이니셜을 회사/기관명에서 추출한다.
 * 숫자·공백·기호를 건너뛰고(괄호로 묶인 구간은 "(주)"처럼 내용과 무관하게 통째로 건너뜀)
 * 처음 나오는 한글 또는 영문 글자부터 2글자를 반환한다.
 * 접미사("약국"/"병원" 등) 제거는 하지 않는다.
 */
export function getCompanyInitial(name: string): string {
  let start = 0;

  while (start < name.length) {
    if (OPEN_PAREN_PATTERN.test(name[start])) {
      const closeIndex = name.slice(start).search(CLOSE_PAREN_PATTERN);
      start += closeIndex === -1 ? 1 : closeIndex + 1;
      continue;
    }

    if (LEADING_SKIP_PATTERN.test(name[start])) {
      start += 1;
      continue;
    }

    break;
  }

  return name.slice(start, start + 2);
}
