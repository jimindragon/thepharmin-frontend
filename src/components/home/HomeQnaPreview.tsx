"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getEntryCommentCount, getEntryLikeCount, getPopularQnaEntries } from "@/data/qna";

/** 2열 × 2행. 홀수로 두면 마지막 행 오른쪽 칸이 빈다 — 열 수를 바꾸면 이 값도 배수로 맞출 것. */
const HOME_QNA_LIMIT = 4;

/**
 * 채용 QNA는 "industry"만 가져온다. 하드코딩이지 기본값이 아니다.
 *
 * "pharmacist" 글은 약사 인증을 통과한 열람자에게만 보이는 자료다. 그 판정은
 * resolveQnaViewerState(config/qnaAccess.ts)가 서버에서 내리고, 미인증이면 데이터 자체가
 * 클라이언트로 내려가지 않는 구조다(사후에 가리는 방식이 아니다). 홈은 그 판정을 받지 않는
 * 클라이언트 컴포넌트라, 여기서 pharmacist 글을 부르면 게이트를 우회해 노출하게 된다.
 * 이 인자를 변수로 바꾸거나 호출부에서 주입받게 만들지 말 것.
 */
const popularQnaEntries = getPopularQnaEntries("industry", HOME_QNA_LIMIT);

/**
 * 홈 흰색 영역 마지막에 서는 "채용 QNA 인기글" 세 줄.
 *
 * 회색 박스 없이 구분선과 타이포만으로 짠다 — 바로 위 "주목할 만한 공고"까지가 전부 카드라,
 * 여기에 또 박스를 얹으면 카드가 한 겹 더 쌓인 것으로 읽힌다. 글 목록은 카드가 아니다.
 *
 * QnaShared의 TrendingPostsPanel을 쓰지 않은 이유는 그쪽이 자기 제목과 박스를 함께 들고 와
 * SectionHeader와 제목이 겹치기 때문이다.
 */
export function HomeQnaPreview() {
  if (!popularQnaEntries.length) return null;

  return (
    <section className="mt-16" aria-label="채용 QNA 인기글">
      <SectionHeader title="채용 QNA 인기글" viewAll={{ href: "/qna" }} />
      {/*
        데스크톱 2열. 1열 전폭에서는 1240~1320px 행에 15px 제목 한 줄만 서서 오른쪽 절반이 비었고,
        바로 위 두 섹션(마감 임박·주목할 만한 공고)이 모두 2열이라 홈에서 이 목록만 리듬이 달랐다.

        행 구분선을 divide-y로 그리지 않는다 — divide-y는 "2번째 자식부터 상단선"이라 2열 그리드에서는
        첫 행 오른쪽 칸에도 선이 생긴다(mobile-guidelines 3절). 대신 "둘째 행 첫 칸부터"를
        nth-child로 명시한다: 2열이면 n+3, ≤760px 1열로 접히면 n+2다.
        두 규칙은 같은 값(border-top-width:1px)을 걸어 겹치는 구간에서도 다툼이 없다 —
        ≤760px에서는 둘이 합쳐져 2·3·4번이 선을 받고, 761px 이상에서는 앞의 것만 남아 3·4번이 받는다.
        어느 쪽이든 첫 줄 위·마지막 줄 아래에는 선이 없다. 섹션 사이는 mt-16이 이미 가른다.

        세로 gap은 주지 않는다. 칸이 맞닿아야 border-t가 두 행을 가르는 그 선이 된다(종전 divide-y와 같은 자리).
        선 색은 각 행이 직접 들고 있다(아래 Link) — 컨테이너 선택자에 색까지 얹으면 규칙이 두 배로 길어진다.
      */}
      <div className="grid grid-cols-2 gap-x-10 [&>*:nth-child(n+3)]:border-t max-[760px]:grid-cols-1 max-[760px]:[&>*:nth-child(n+2)]:border-t">
        {popularQnaEntries.map((entry, index) => {
          /* 첫 태그를 카테고리 라벨로 쓴다 — 데이터에 별도 category 필드가 없다(qnaCategoryFilters가
             태그 풀 자체를 참조한다). 태그가 빈 글이 섞이면 라벨 없이 제목만 세운다. */
          const categoryLabel = entry.tags[0] ?? null;
          // 태그는 제목 앞 라벨로 올라갔다 — 메타 줄에 다시 적으면 같은 값이 한 행에 두 번 선다.
          const meta = `댓글 ${getEntryCommentCount(entry)} · 공감 ${getEntryLikeCount(entry)}`;

          return (
            /* 반응은 배경이 아니라 제목 글자색으로 준다. 이 목록은 카드가 아니라 글줄이라
               행 배경을 칠하면 회색 판이 하나 생기는데, 그 판의 좌우 끝이 행의 인셋(셸 여백)에
               맞춰 서서 풀블리드로 화면 끝까지 가는 아래 섹션들과 어긋난 선을 하나 더 만든다.

               터치 잔상까지 배경 없이 두려면 -webkit-tap-highlight-color도 함께 꺼야 한다 —
               모바일 브라우저 기본값이 탭 순간 링크 위에 반투명 회색 판을 덧칠하는데,
               그게 방금 걷어낸 hover 배경과 같은 것이 손가락으로만 보이는 꼴이 된다.
               전역으로 끄지 않고 이 행에만 건다. */
            <Link
              key={entry.id}
              href={`/qna/${entry.id}`}
              className="group flex items-start gap-3 border-border py-4 [-webkit-tap-highlight-color:transparent]"
            >
              {/* 순위는 숫자만 세운다 — 배지나 원을 씌우면 방금 걷어낸 박스가 행마다 하나씩 되돌아온다.
                  leading을 제목과 같은 1.45로 맞춰 15px 두 글자가 제목 첫 줄과 같은 줄에 앉는다.
                  tabular-nums는 두 자리로 넘어가도 숫자 폭이 흔들리지 않게 한다. */}
              <span className="shrink-0 text-[15px] font-medium leading-[1.45] tabular-nums text-[#6c7684]">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                {/* 라벨은 제목 p 바깥이 아니라 안쪽 선행 span이다 — 바깥에 두면 제목이 두 줄로 접힐 때
                    라벨이 제 줄을 하나 더 먹어 행 높이가 글마다 달라진다. 안에 두면 line-clamp-2가
                    라벨까지 한 흐름으로 세어 첫 줄 맨 앞에 라벨, 그 뒤로 제목이 이어진다. */}
                <p className="line-clamp-2 text-[15px] font-medium leading-[1.45] text-[#111111] transition-colors group-hover:text-[#333333] group-active:text-[#333333]">
                  {categoryLabel ? (
                    <span className="mr-2 text-[13px] font-medium text-[#6c7684]">{categoryLabel}</span>
                  ) : null}
                  {entry.title}
                </p>
                <p className="mt-1.5 text-[13px] font-normal text-[#8b95a1]">{meta}</p>
              </div>
              {/* createdAtLabel을 그대로 찍는다 — 데이터가 이미 "3시간 전" 형태의 완성 문자열이고,
                  정렬용 minutesAgo로 다시 계산하면 두 값이 어긋나는 순간이 생긴다.
                  self-start로 제목 첫 줄에 맞춰 세우고, 좁은 폭에서도 줄바꿈 없이 한 덩어리로 둔다. */}
              <span className="ml-auto shrink-0 self-start whitespace-nowrap text-[13px] font-normal leading-[1.45] text-[#8b95a1]">
                {entry.createdAtLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
