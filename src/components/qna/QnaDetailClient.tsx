"use client";

import clsx from "clsx";
import Link from "next/link";
import { ArrowLeft, Bookmark, Flag, Share2, ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FLUSH_SECTION_CLASS } from "@/components/flushListStyles";
import { Button } from "@/components/ui/Button";
import { myPageUser } from "@/config/myPageMenu";
import { getPopularQnaEntries, getRelatedQnaEntries } from "@/data/qna";
import { readQnaScraps, writeQnaScraps } from "@/components/qna/qnaScraps";
import type { QnaPost, QnaReply, QnaType } from "@/types/qna";
import {
  MyActivityPanel,
  PopularTagsPanel,
  QnaAuthorAvatar,
  QnaAuthorLabelBadge,
  QnaNotice,
  QnaOperationPrinciplePanel,
  TrendingPostsPanel,
  showQnaNotice,
} from "@/components/qna/QnaShared";

type CommentSortOption = "인기순" | "최신순";

/**
 * 본문 하단 "이런 글은 어때요?" 전용 행 — /qna/activity 목록 행과 같은 뼈대(제목 · 메타 · 본문 발췌)를 쓰고
 * 메타·발췌·넘침 처리(line-clamp)까지 동일하다. 제목 크기만 갈리는데(상세 15/600 · 활동 16/600),
 * 상세 하단은 보조 섹션의 항목이고 활동 목록은 그 페이지의 주인공이라 한 단 차이를 둔 것.
 */
const qnaTypeLabel: Record<QnaType, string> = {
  pharmacist: "약사 QNA",
  industry: "산업 QNA",
};

function RelatedQnaRow({ entry, previewQuery }: { entry: QnaPost; previewQuery: string }) {
  const excerpt = entry.body[0];
  return (
    <Link href={`/qna/${entry.id}${previewQuery}`} className="block transition hover:opacity-70">
      <p className="line-clamp-2 text-[15px] font-semibold leading-[1.4] text-[#171d26]">{entry.title}</p>
      <p className="mt-1 text-[13px] font-normal text-[#8b95a1]">
        {qnaTypeLabel[entry.qnaType]} · {entry.createdAtLabel}
      </p>
      <p className="mt-1.5 line-clamp-1 text-[14px] font-normal leading-[1.6] text-[#596373]">{excerpt}</p>
    </Link>
  );
}

function ReactionRow({
  likeCount,
  onLike,
  onScrap,
  scrapActive,
  onShare,
  onReport,
}: {
  likeCount: number;
  onLike: () => void;
  onScrap: () => void;
  scrapActive?: boolean;
  onShare: () => void;
  onReport: () => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1f5] pt-5 max-[760px]:mt-5 max-[760px]:pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onLike}
          className="inline-flex h-9 items-center gap-1.5 border border-[#cfd8e3] bg-white px-3 text-[13px] font-medium text-[#596373] transition hover:border-[#111111] hover:text-[#111111]"
        >
          <ThumbsUp size={15} aria-hidden="true" />
          공감 {likeCount}
        </button>
        <button
          type="button"
          onClick={onScrap}
          className={clsx(
            "inline-flex h-9 items-center gap-1.5 border px-3 text-[13px] font-medium transition",
            scrapActive
              ? "border-[#111111] bg-[#111111] text-white"
              : "border-[#cfd8e3] bg-white text-[#596373] hover:border-[#111111] hover:text-[#111111]",
          )}
        >
          <Bookmark size={15} aria-hidden="true" fill={scrapActive ? "currentColor" : "none"} />
          스크랩
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex h-9 items-center gap-1.5 border border-[#cfd8e3] bg-white px-3 text-[13px] font-medium text-[#596373] transition hover:border-[#111111] hover:text-[#111111]"
        >
          <Share2 size={15} aria-hidden="true" />
          공유
        </button>
      </div>
      <button type="button" onClick={onReport} className="inline-flex items-center gap-1 text-[12px] font-medium text-[#a0a9b7] hover:text-[#596373]">
        <Flag size={12} aria-hidden="true" />
        신고
      </button>
    </div>
  );
}

function CommentSortControl({ value, onChange }: { value: CommentSortOption; onChange: (option: CommentSortOption) => void }) {
  const options: CommentSortOption[] = ["인기순", "최신순"];
  return (
    <div className="flex items-center gap-3 text-[13px] font-medium text-[#596373]">
      {options.map((option, index) => (
        <span key={option} className="flex items-center gap-3">
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          <button type="button" onClick={() => onChange(option)} className={value === option ? "text-[#111111]" : "hover:text-[#596373]"}>
            {option}
          </button>
        </span>
      ))}
    </div>
  );
}

function CommentRow({
  id,
  nickname,
  jobRole,
  authorLabel,
  isPostAuthor,
  createdAtLabel,
  likeCount,
  body,
  onReact,
  onReply,
}: {
  id: string;
  nickname: string;
  jobRole: string;
  authorLabel?: string;
  isPostAuthor?: boolean;
  createdAtLabel: string;
  likeCount: number;
  body: string;
  onReact: () => void;
  onReply?: () => void;
}) {
  return (
    <div className="flex gap-3">
      <QnaAuthorAvatar id={id} nickname={nickname} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {isPostAuthor ? (
            <QnaAuthorLabelBadge>{nickname}</QnaAuthorLabelBadge>
          ) : (
            <span className="text-[13px] font-semibold text-[#3d4653]">{nickname}</span>
          )}
          {authorLabel ? <QnaAuthorLabelBadge>{authorLabel}</QnaAuthorLabelBadge> : null}
        </div>
        <p className="mt-0.5 text-[13px] font-normal text-[#8b95a1]">{[jobRole, createdAtLabel].filter(Boolean).join(" · ")}</p>
        <p className="mt-1.5 text-[14px] font-normal leading-[1.65] text-[#3d4653]">{body}</p>
        <div className="mt-1.5 flex items-center gap-3 text-[13px] font-normal text-[#596373]">
          <button type="button" onClick={onReact} className="hover:text-[#111111]">
            공감 {likeCount}
          </button>
          {onReply ? (
            <button type="button" onClick={onReply} className="hover:text-[#111111]">
              답글
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** 글 작성 폼(QnaComposer)의 ComposerAvatar와 동일 패턴 — 익명은 항상 단색, 실명은 로테이션 톤 */
function CommentComposerAvatar({ anonymous }: { anonymous: boolean }) {
  return anonymous ? (
    <QnaAuthorAvatar id="qna-comment-composer-anonymous" nickname="익명" size={32} />
  ) : (
    <QnaAuthorAvatar id={myPageUser.name} nickname={myPageUser.name} size={32} />
  );
}

function CommentComposer({ isLoggedIn, placeholder, onSubmit }: { isLoggedIn: boolean; placeholder: string; onSubmit: () => void }) {
  const [draft, setDraft] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);

  return (
    <div className="border border-border bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CommentComposerAvatar anonymous={isAnonymous} />
          <span className="truncate text-[13px] font-semibold text-[#3d4653]">{isAnonymous ? "익명" : `${myPageUser.name}님`}</span>
        </div>
        <label className="flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#596373]">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
            className="h-3.5 w-3.5 accent-[#111111]"
          />
          익명으로 작성
        </label>
      </div>

      {/* text-[16px] 분기: 16px 미만이면 iOS Safari가 포커스 시 뷰포트를 확대한다 */}
      <textarea
        rows={3}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={isLoggedIn ? placeholder : "로그인 후 이용할 수 있습니다."}
        disabled={!isLoggedIn}
        className="mt-3 w-full resize-none border border-[#e5e9ef] bg-[#fbfcfd] p-3 text-[14px] leading-[1.6] text-[#202734] outline-none placeholder:text-[#a0a9b7] disabled:cursor-not-allowed max-[760px]:text-[16px]"
      />
      <div className="mt-3 flex items-center justify-end border-t border-[#edf1f5] pt-3">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onSubmit}
          disabled={!isLoggedIn}
        >
          등록
        </Button>
      </div>
    </div>
  );
}

interface QnaDetailClientProps {
  post: QnaPost;
  backHref: string;
  previewQuery: string;
  isLoggedIn: boolean;
}

export function QnaDetailClient({ post, backHref, previewQuery, isLoggedIn }: QnaDetailClientProps) {
  const [commentSort, setCommentSort] = useState<CommentSortOption>("인기순");
  const [notice, setNotice] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [isScraped, setIsScraped] = useState(false);

  useEffect(() => {
    setIsScraped(readQnaScraps().has(post.id));
  }, [post.id]);

  const relatedEntries = useMemo(() => getRelatedQnaEntries(post).slice(0, 3), [post]);
  /** 허브 사이드바와 동일한 "실시간 인기 글" — 현재 글의 qnaType 기준, 지금 보고 있는 글은 제외 */
  const trendingEntries = useMemo(
    () => getPopularQnaEntries(post.qnaType).filter((entry) => entry.id !== post.id),
    [post],
  );
  const totalCommentCount = useMemo(
    () => post.comments.reduce((total, comment) => total + 1 + comment.replies.length, 0),
    [post.comments],
  );

  const sortedComments = useMemo(() => {
    const list = [...post.comments];
    if (commentSort === "인기순") return list.sort((a, b) => b.likeCount - a.likeCount);
    return list.reverse();
  }, [post.comments, commentSort]);

  const notify = (message: string) => showQnaNotice(setNotice, message);

  const handleScrapToggle = () => {
    if (!isLoggedIn) {
      notify("로그인 후 이용할 수 있습니다.");
      return;
    }
    const scraps = readQnaScraps();
    const next = !scraps.has(post.id);
    if (next) {
      scraps.add(post.id);
    } else {
      scraps.delete(post.id);
    }
    writeQnaScraps(scraps);
    setIsScraped(next);
    notify(next ? "스크랩했습니다." : "스크랩을 해제했습니다.");
  };

  /** 상세페이지엔 리스트의 로컬 필터 상태가 없어, 인기 태그 클릭은 해당 태그로 리스트를 여는 링크로 처리한다 */
  const popularTagHref = (tag: string) => {
    const params = new URLSearchParams(previewQuery.replace(/^\?/, ""));
    params.set("type", post.qnaType);
    params.set("tag", tag);
    return `/qna?${params.toString()}`;
  };

  return (
    <main className="bg-[#f7f8fa] pb-20 max-[760px]:pb-16">
      {/* ≤760px 상단 여백은 캘린더(pt-8 = 32px) 기준으로 통일 — 이전 max-[760px]:pt-6(24px)에서 수렴 */}
      <div className="app-shell pt-8">
        <Link href={backHref} className="inline-flex h-9 items-center gap-1.5 text-[13px] font-medium text-[#596373] transition hover:text-[#111111]">
          <ArrowLeft size={14} aria-hidden="true" />
          채용 QNA
        </Link>

        {/*
          gap-8·max-[760px]:gap-6은 두 열 **사이**의 가로 거터다. ≤1040px에서 1열로 접히면 같은 값이
          세로 이음새로 재사용되는데, 그 자리가 본문 카드 리듬(gap-5 / ≤760px gap-4)보다 넓어
          "본문 3장 → 사이드 패널" 접합부만 혼자 벌어져 보였다. 그래서 1열 구간에서만 row gap을
          카드 리듬과 같은 값으로 눌러 둔다 — 가로 거터는 2열 폭에서 그대로 32px이다.
          같은 축(row)에 gap과 gap-y가 겹치지만 Tailwind가 gap → gap-x → gap-y 순으로 출력하고
          max-* 변형은 폭 내림차순(1040 → 760)이라, 좁은 쪽 gap-y가 항상 이긴다.
        */}
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_280px] gap-8 max-[1040px]:grid-cols-1 max-[1040px]:gap-y-5 max-[760px]:gap-6 max-[760px]:gap-y-4">
          {/*
            ≤760px 풀블리드 — 본문·댓글·"이런 글은 어때요?" 세 카드가 공고 상세·기업 상세와 같은 한 줄
            (FLUSH_SECTION_CLASS)로 화면 폭을 채운다. 이 페이지만 회색 배경 위에 좌우로 물러난 카드였다.
            카드 사이는 종전 회색 간격(≤760px 16px) 그대로 둔다 — 목록(FLUSH_LIST_CLASS)과 달리
            이 셋은 서로 다른 성격의 섹션 덩어리라, 붙여서 divide-y로 가르면 한 장짜리 문서로 읽힌다.

            padding은 축을 나눠 둔다: 좌우는 FLUSH_SECTION_CLASS의 max-[760px]:px-6(=24px, h1·칩이 서 있는
            --shell-gutter/2 선)이 맡고 여기서는 변형 없는 px-7만 남긴다. p 단축형을 그대로 두면 같은 축에
            변형이 둘 겹쳐 Tailwind 출력 순서에 기대게 된다(flushListStyles 주석의 규칙).
            뒤로가기 행과 댓글 컴포저는 카드 안쪽 요소라 자리가 그대로다.
          */}
          <div className="flex min-w-0 flex-col gap-5 max-[760px]:gap-4">
            <article className={clsx("border border-border bg-white px-7 py-7 max-[760px]:py-5", FLUSH_SECTION_CLASS)}>
              {post.isBest ? (
                <span className="mb-2.5 inline-flex h-6 items-center bg-[#111111] px-2 text-[12px] font-semibold text-white">BEST</span>
              ) : null}
              <h1 className="text-[22px] font-bold leading-[1.35] tracking-[-0.02em] text-[#171d26] max-[760px]:text-[20px]">{post.title}</h1>

              <div className="mt-4 flex items-center gap-3 border-b border-[#edf1f5] pb-5">
                <QnaAuthorAvatar id={post.id} nickname={post.nickname} size={40} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[14px] font-semibold text-[#3d4653]">{post.nickname}</span>
                    {post.authorLabel ? <QnaAuthorLabelBadge>{post.authorLabel}</QnaAuthorLabelBadge> : null}
                  </div>
                  <p className="mt-0.5 truncate text-[13px] font-normal text-[#8b95a1]">
                    {[post.jobRole, post.createdAtLabel].filter(Boolean).join(" · ")} · 조회 {post.viewCount.toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4 text-[15px] font-normal leading-[1.8] text-[#3d4653]">
                {post.body.map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-[#596373]">
                {post.tags.map((tag) => (
                  <span key={tag} className="whitespace-nowrap">
                    #{tag}
                  </span>
                ))}
              </div>

              <ReactionRow
                likeCount={post.likeCount}
                onLike={() => notify("공감 기능은 준비 중입니다.")}
                onScrap={handleScrapToggle}
                scrapActive={isScraped}
                onShare={() => notify("공유 기능은 준비 중입니다.")}
                onReport={() => notify("신고 접수 화면은 준비 중입니다.")}
              />
            </article>

            <section className={clsx("border border-border bg-white px-7 py-7 max-[760px]:py-5", FLUSH_SECTION_CLASS)}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[17px] font-bold tracking-[-0.01em] text-[#17202c] max-[760px]:text-[16px]">댓글 {totalCommentCount}</h2>
                <CommentSortControl value={commentSort} onChange={setCommentSort} />
              </div>

              <div className="mt-4">
                <CommentComposer
                  isLoggedIn={isLoggedIn}
                  placeholder="댓글을 남겨보세요"
                  onSubmit={() => notify("댓글 등록 기능은 준비 중입니다.")}
                />
              </div>

              {sortedComments.length ? (
                <div className="mt-2 divide-y divide-[#edf1f5]">
                  {sortedComments.map((comment) => (
                    <div key={comment.id} className="py-5">
                      <CommentRow
                        id={comment.id}
                        nickname={comment.nickname}
                        jobRole={comment.jobRole}
                        authorLabel={comment.authorLabel}
                        isPostAuthor={comment.isPostAuthor}
                        createdAtLabel={comment.createdAtLabel}
                        likeCount={comment.likeCount}
                        body={comment.body}
                        onReact={() => notify("공감 기능은 준비 중입니다.")}
                        onReply={() => setReplyTargetId((current) => (current === comment.id ? null : comment.id))}
                      />
                      {comment.replies.length || replyTargetId === comment.id ? (
                        <div className="mt-4 ml-11 space-y-4 border-l border-[#edf1f5] pl-4">
                          {comment.replies.map((reply: QnaReply) => (
                            <CommentRow
                              key={reply.id}
                              id={reply.id}
                              nickname={reply.nickname}
                              jobRole={reply.jobRole}
                              authorLabel={reply.authorLabel}
                              isPostAuthor={reply.isPostAuthor}
                              createdAtLabel={reply.createdAtLabel}
                              likeCount={reply.likeCount}
                              body={reply.body}
                              onReact={() => notify("공감 기능은 준비 중입니다.")}
                            />
                          ))}
                          {replyTargetId === comment.id ? (
                            <CommentComposer
                              isLoggedIn={isLoggedIn}
                              placeholder="답글을 입력해 주세요"
                              onSubmit={() => {
                                notify("답글 작성 기능은 준비 중입니다.");
                                setReplyTargetId(null);
                              }}
                            />
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-center text-[13px] font-normal text-[#8791a0]">아직 등록된 댓글이 없습니다.</p>
              )}
            </section>

            {relatedEntries.length ? (
              <section className={clsx("border border-border bg-white px-7 py-7 max-[760px]:py-5", FLUSH_SECTION_CLASS)}>
                <h2 className="text-[17px] font-bold tracking-[-0.01em] text-[#17202c] max-[760px]:text-[16px]">이런 글은 어때요?</h2>
                <div className="mt-3 divide-y divide-[#edf1f5] border-t border-[#edf1f5]">
                  {relatedEntries.map((entry) => (
                    <div key={entry.id} className="py-4 last:pb-0">
                      <RelatedQnaRow entry={entry} previewQuery={previewQuery} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/*
            ≤760px 풀블리드 — 위 본문 3카드가 화면 폭을 채우는 폭에서 사이드 패널만 셸 인셋(좌우 24px)에
            남아 있었다. 사이드바가 본문 아래로 밀리는 폭이라 같은 세로줄에 좌측 선이 두 개 서고,
            한 페이지의 흰 블록들이 서로 다른 곳에서 시작하는 것으로 읽혔다.

            본문처럼 카드마다 FLUSH_SECTION_CLASS를 붙이지 않고 aside가 자식을 직접 눌러쓴다. 두 가지 이유다.
              1) 네 패널 중 QnaOperationPrinciplePanel에는 className 통로가 없다. 그 하나 때문에
                 프로퍼티를 뚫는 것보다 목록 한 줄이 덜 침습적이다(FLUSH_GRID_CLASS가 카드 3종을
                 상대로 이미 쓰는 방식).
              2) 패널들의 안쪽 여백이 p-5 단축형이다. 단축형과 px 변형을 같은 요소에서 겹치면 승부가
                 Tailwind 출력 순서에 달리는데, 자식 선택자 쪽은 그 다툼 자체가 없다.
            음수 마진은 자식이 아니라 aside가 받으므로 자식 간격(gap)과 부딪히지 않는다(가이드라인 3절).

            패널 간격은 space-y가 아니라 gap이다. space-y의 셀렉터는 `> :not([hidden]) ~ :not([hidden])`으로
            HTML **속성** hidden만 거르는데, 아래 패널들이 쓰는 것은 max-[1040px]:hidden **클래스**(display:none)라
            숨은 패널도 형제로 카운트됐다. 그래서 ≤1040px에서 첫 가시 패널이 마진을 하나 물려받아
            (본문↔사이드 접합부에 grid row gap 위로 20/16px 순증) 그 자리만 벌어져 보였다.
            display:none 자식은 flex 아이템으로 존재하지 않으므로 gap은 그 간격을 아예 만들지 않는다.
          */}
          <aside className="flex flex-col gap-5 max-[760px]:-mx-[calc(var(--shell-gutter)/2)] max-[760px]:gap-4 max-[760px]:[&>*]:border-x-0 max-[760px]:[&>*]:px-6">
            {/* 1열에서는 바로 위 "이런 글은 어때요?"와 성격이 겹친다 — 댓글 뒤에 글 목록이 두 벌 이어진다 */}
            <TrendingPostsPanel entries={trendingEntries} previewQuery={previewQuery} className="max-[1040px]:hidden" />
            {/* 1열에서는 댓글 전체 아래로 밀려 도달률이 사실상 0이다. /qna/activity 진입점은 허브가
                모든 폭에서 보장하므로(≤1040px는 compact 사본) 상세는 그 폭에서 면제한다. */}
            {isLoggedIn ? <MyActivityPanel activeType={post.qnaType} className="max-[1040px]:hidden" /> : null}
            {/* 1열에서도 남긴다 — 상세에는 허브의 카테고리 칩 nav 같은 중복 대상이 없고,
                태그로 목록을 여는 유일한 통로다(tagHref). 칩 wrap이라 전폭에서도 형태가 무너지지 않는다. */}
            <PopularTagsPanel activeType={post.qnaType} tagHref={popularTagHref} />
            <QnaOperationPrinciplePanel />
          </aside>
        </div>

        <QnaNotice message={notice} />
      </div>
    </main>
  );
}
