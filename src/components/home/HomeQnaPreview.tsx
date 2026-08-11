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
            <Link key={entry.id} href={`/qna/${entry.id}`} className="block py-4 transition-colors hover:bg-[#fafafa]">
              <p className="line-clamp-2 text-[15px] font-medium leading-[1.45] text-[#111111]">{entry.title}</p>
              <p className="mt-1.5 text-[13px] font-normal text-[#8b95a1]">{meta}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
