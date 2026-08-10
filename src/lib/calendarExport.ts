import { MOCK_TODAY_DATE } from "@/config/mockToday";

/**
 * "내 캘린더에 추가" 내보내기 유틸.
 *
 * 이벤트 1건을 두 경로로 내보낸다 — 구글 캘린더(URL 이동)와 기기 캘린더(.ics 다운로드).
 * 두 경로의 난이도가 비대칭이라는 점이 이 파일의 구조를 정한다: 구글은 순수 문자열 조립이고,
 * .ics는 Blob·objectURL·iOS 분기까지 필요한 브라우저 전용 동작이다. 그래서 문자열을 만드는
 * 함수(buildIcs·buildGoogleCalendarUrl)는 순수 함수로 두고, 브라우저를 만지는 것은
 * downloadIcs·toAbsoluteUrl 둘로 격리했다.
 *
 * 이 코드베이스에 파일 다운로드 선례가 없어(Blob·createObjectURL·download 속성 모두 0건)
 * downloadIcs는 신규 패턴이다. iOS 분기는 아직 실기기 검증 대기 상태다 — downloadIcs의
 * 주석을 함께 볼 것.
 */

export type CalendarEventKind = "deadline" | "start";

export interface CalendarExportEvent {
  /** 이벤트 식별자. 도메인 접미사는 buildIcs가 붙인다. */
  uid: string;
  /** 공고명 */
  title: string;
  /** 회사·기관명 */
  company: string;
  /** "YYYY-MM-DD". 종일 이벤트의 날짜 */
  date: string;
  /**
   * 날짜의 성격. CalendarJob.deadline은 eventType이 "start"일 때 실제로는 접수 시작일이라
   * 날짜만 보고 마감으로 적으면 캘린더에 거짓이 박힌다 — SUMMARY 접두어를 여기서 가른다.
   */
  kind: CalendarEventKind;
  /**
   * 공고 상세 URL. buildIcs·buildGoogleCalendarUrl에 넘길 때는 **절대 URL**이어야 한다.
   * 사이트 상대 경로를 가진 호출부는 이벤트 핸들러 안에서 toAbsoluteUrl로 바꿔 넘긴다 —
   * 렌더 중 window를 읽으면 하이드레이션이 어긋난다.
   */
  url?: string;
  /** 근무지 등 장소 문자열 */
  location?: string;
}

const PRODID = "-//THE PHARMA Recruit//Job Calendar//KO";
const UID_DOMAIN = "thepharma-recruit";

const SUMMARY_PREFIX: Record<CalendarEventKind, string> = {
  deadline: "서류 마감",
  start: "접수 시작",
};

/** "YYYY-MM-DD" → 로컬 Date. UTC 파싱(new Date("YYYY-MM-DD"))은 시간대에 따라 하루 밀린다. */
function parseIsoDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Date → "YYYYMMDD" (iCalendar DATE 값) */
function toIcsDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** 종일 이벤트의 DTEND는 배타적이라 하루를 더한 날짜를 쓴다(9/8 하루짜리 → DTEND 9/9). */
function nextDay(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
}

/**
 * DTSTAMP는 "이 객체를 만든 실제 UTC 시각"이지만, 이 프로젝트는 실제 시계(new Date()) 사용
 * 금지 규칙(config/mockToday.ts)을 전역으로 지킨다. 목업에서 DTSTAMP의 의미 정확성은 검증
 * 대상이 아니고, 여기서 예외를 열면 규칙이 무너지므로 기준일을 그대로 쓴다.
 *
 * 로컬 구성요소를 그대로 UTC 표기에 얹는다 — toISOString()은 실행 머신 시간대에 따라 값이
 * 달라져 같은 코드가 기기마다 다른 파일을 만든다.
 *
 * 실데이터 전환 시 실제 UTC로 교체.
 */
function buildDtstamp(): string {
  const y = MOCK_TODAY_DATE.getFullYear();
  const m = String(MOCK_TODAY_DATE.getMonth() + 1).padStart(2, "0");
  const d = String(MOCK_TODAY_DATE.getDate()).padStart(2, "0");
  return `${y}${m}${d}T000000Z`;
}

/**
 * iCalendar TEXT 값 이스케이프(RFC 5545 §3.3.11).
 * 역슬래시를 가장 먼저 처리해야 뒤에서 넣은 이스케이프가 두 번 먹지 않는다.
 * 콜론은 TEXT 값에서 이스케이프 대상이 아니라 URL이 그대로 들어간다.
 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * 75옥텟 초과 줄을 접는다(RFC 5545 §3.1). 접힌 줄은 공백 1칸으로 시작한다.
 *
 * 바이트로 세는 이유 — 한글은 UTF-8에서 3바이트라 글자 수로 자르면 한도를 넘긴다.
 * 코드포인트 단위로 누적해 다중바이트 문자 중간에서 잘리는 일도 막는다.
 * 접기를 생략해도 대개는 열리지만, 실패할 때 조용히 "가져오기 실패"로만 끝나 원인을 못 찾는다.
 */
function foldLine(line: string): string {
  const MAX_OCTETS = 75;
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= MAX_OCTETS) return line;

  const folded: string[] = [];
  let current = "";
  let currentOctets = 0;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (currentOctets + size > MAX_OCTETS) {
      folded.push(current);
      current = ` ${char}`;
      currentOctets = 1 + size;
    } else {
      current += char;
      currentOctets += size;
    }
  }
  folded.push(current);

  return folded.join("\r\n");
}

function summaryOf(input: CalendarExportEvent): string {
  return `[${SUMMARY_PREFIX[input.kind]}] ${input.company} ${input.title}`;
}

function descriptionOf(input: CalendarExportEvent): string {
  return input.url ? `공고 상세: ${input.url}` : "";
}

/**
 * 종일 VEVENT 1건짜리 iCalendar 문서를 만든다.
 *
 * 개행은 CRLF 고정이다(RFC 5545). LF만 쓰면 일부 클라이언트가 통째로 거부한다.
 */
export function buildIcs(input: CalendarExportEvent): string {
  const start = parseIsoDate(input.date);
  const description = descriptionOf(input);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${input.uid}@${UID_DOMAIN}`,
    `DTSTAMP:${buildDtstamp()}`,
    `DTSTART;VALUE=DATE:${toIcsDate(start)}`,
    `DTEND;VALUE=DATE:${toIcsDate(nextDay(start))}`,
    `SUMMARY:${escapeText(summaryOf(input))}`,
    ...(description ? [`DESCRIPTION:${escapeText(description)}`] : []),
    ...(input.url ? [`URL:${escapeText(input.url)}`] : []),
    ...(input.location ? [`LOCATION:${escapeText(input.location)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

/**
 * 구글 캘린더 일정 추가 화면 URL.
 * dates는 종일 이벤트 형식(YYYYMMDD/YYYYMMDD)이며 종료일은 .ics와 같은 배타적 익일이다.
 */
export function buildGoogleCalendarUrl(input: CalendarExportEvent): string {
  const start = parseIsoDate(input.date);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summaryOf(input),
    dates: `${toIcsDate(start)}/${toIcsDate(nextDay(start))}`,
  });

  const description = descriptionOf(input);
  if (description) params.set("details", description);
  if (input.location) params.set("location", input.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * 사이트 상대 경로를 절대 URL로 바꾼다. **브라우저에서만** 호출할 것 —
 * 렌더 중 window를 읽으면 서버 HTML과 달라져 하이드레이션이 어긋난다.
 * 이미 절대 URL이면 그대로 돌려준다.
 */
export function toAbsoluteUrl(pathOrUrl: string): string {
  if (typeof window === "undefined") return pathOrUrl;
  return new URL(pathOrUrl, window.location.origin).toString();
}

/**
 * iOS 계열 추정.
 *
 * iPadOS 13+는 userAgent를 데스크톱 맥으로 위장하므로 "MacIntel + 터치포인트"까지 봐야
 * 아이패드가 걸린다(맥에는 maxTouchPoints가 0이다). 사파리만이 아니라 iOS 브라우저 전반이
 * 대상이다 — iOS의 크롬·인앱 웹뷰도 결국 같은 WebKit이라 a[download] 동작이 같다.
 *
 * 오판의 대가가 대칭이 아니다. 데스크톱을 iOS로 잘못 보면(맥+터치 트랙패드는 maxTouchPoints
 * 0이라 실제로는 걸리지 않는다) 다운로드 대신 blob 이동이 일어나 화면이 바뀐다.
 * 반대로 iOS를 놓치면 기존 다운로드 동작으로 떨어질 뿐이다.
 */
function isIosLike(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/iP(hone|ad|od)/.test(navigator.userAgent)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/**
 * blob URL 해제 지연(ms). navigation·다운로드가 시작되기 전에 revoke하면 URL이 사라져
 * 동작 자체가 실패한다. iOS의 blob 이동은 미리보기 창이 뜰 때까지 URL이 살아 있어야 해서
 * 한 틱으로는 부족하다 — 넉넉히 준다. 지연 동안 남는 건 문서 1건 분량의 메모리다.
 */
const OBJECT_URL_REVOKE_DELAY_MS = 60_000;

/**
 * .ics를 사용자에게 넘긴다. 경로는 둘이고 갈림길은 iOS 여부다.
 *
 *   1) iOS 추정 → blob URL로 직접 이동(window.location.href)
 *   2) 그 외 전부 → Blob + a[download] (표준 경로)
 *
 * 1)의 근거 — iOS 사파리는 a[download]를 무시하고 파일 저장으로 흘리고, 앞서 쓰던
 * navigator.share({ files })는 실기기에서 공유 시트에 앱 목록과 "파일에 저장"만 띄울 뿐
 * 캘린더 직행을 주지 않았다(실기기 확인). text/calendar blob으로 직접 이동하면 사파리가
 * 내장 뷰어로 열어 "캘린더에 추가" 미리보기까지 한 번에 가는 것이 목표다.
 *
 * ⚠️ 실기기 검증 필요. blob: 최상위 이동 허용 여부와 text/calendar 뷰어 동작은 iOS 버전·
 * 브라우저(사파리/크롬/인앱 웹뷰)마다 편차가 있다 — 버전에 따라 미리보기 대신 빈 화면이나
 * 파일 저장으로 떨어질 수 있다. 실패가 확인되면 iOS는 구글 캘린더 단일 경로로 후퇴한다
 * (AddToCalendarSheet에서 .ics 버튼을 감추는 쪽).
 *
 * 폴백을 두지 않은 이유 — 이동이 성공했는지는 스크립트에서 알 수 없다(성공하면 페이지가
 * 떠나거나 뷰어가 덮는다). 실패를 감지할 수 없으니 뒤에 a[download]를 붙이면 성공한 경우에도
 * 파일이 한 벌 더 떨어진다.
 *
 * 대가 하나 — 이 경로는 filename을 못 쓴다. blob URL에는 이름을 실을 수 없어, 뷰어가 아니라
 * "파일에 저장"으로 흐르면 blob UUID가 파일명이 된다. 캘린더 미리보기로 바로 가는 게
 * 목표이므로 감수하되, 실기기에서 저장 흐름으로 떨어진다면 이것도 후퇴 판단 근거가 된다.
 */
export async function downloadIcs(filename: string, ics: string): Promise<void> {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  if (isIosLike()) {
    window.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_DELAY_MS);
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  // 문서에 붙이지 않으면 일부 브라우저가 click()을 무시한다.
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // 즉시 revoke하면 사파리에서 다운로드가 시작되기 전에 URL이 사라진다 — 뒤로 미룬다.
  window.setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_DELAY_MS);
}
