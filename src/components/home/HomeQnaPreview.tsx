"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getEntryCommentCount, getEntryLikeCount, getPopularQnaEntries } from "@/data/qna";

const HOME_QNA_LIMIT = 3;

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
      {/* 첫 줄 위·마지막 줄 아래에는 선이 없다(divide-y). 섹션 사이는 mt-16이 이미 가른다. */}
      <div className="divide-y divide-[var(--color-border)]">
        {popularQnaEntries.map((entry) => {
          // 태그가 빈 글이 섞여도 "#undefined"가 찍히지 않도록 조각을 모아서 잇는다.
          const meta = [
            entry.tags[0] ? `#${entry.tags[0]}` : null,
            `댓글 ${getEntryCommentCount(entry)}`,
            `공감 ${getEntryLikeCount(entry)}`,
          ]
            .filter(Boolean)
            .join(" · ");

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
              className="group block py-4 [-webkit-tap-highlight-color:transparent]"
            >
              <p className="line-clamp-2 text-[15px] font-medium leading-[1.45] text-[#111111] transition-colors group-hover:text-[#333333] group-active:text-[#333333]">
                {entry.title}
              </p>
              <p className="mt-1.5 text-[13px] font-normal text-[#8b95a1]">{meta}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
