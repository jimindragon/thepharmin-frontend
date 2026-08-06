"use client";

import clsx from "clsx";
import Link from "next/link";
import { ArrowLeft, Bookmark, Flag, Share2, ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1f5] pt-5">
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

      <textarea
        rows={3}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={isLoggedIn ? placeholder : "로그인 후 이용할 수 있습니다."}
        disabled={!isLoggedIn}
        className="mt-3 w-full resize-none border border-[#e5e9ef] bg-[#fbfcfd] p-3 text-[14px] leading-[1.6] text-[#202734] outline-none placeholder:text-[#a0a9b7] disabled:cursor-not-allowed"
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
    <main className="bg-[#f7f8fa] pb-20">
      <div className="app-shell pt-8">
        <Link href={backHref} className="inline-flex h-9 items-center gap-1.5 text-[13px] font-medium text-[#596373] transition hover:text-[#111111]">
          <ArrowLeft size={14} aria-hidden="true" />
          채용 QNA
        </Link>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_280px] gap-8 max-[1024px]:grid-cols-1">
          <div className="min-w-0 space-y-5">
            <article className="border border-border bg-white p-7 max-[640px]:p-5">
              {post.isBest ? (
                <span className="mb-2.5 inline-flex h-6 items-center bg-[#111111] px-2 text-[12px] font-semibold text-white">BEST</span>
              ) : null}
              <h1 className="text-[22px] font-bold leading-[1.35] tracking-[-0.02em] text-[#171d26] max-[640px]:text-[20px]">{post.title}</h1>

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

            <section className="border border-border bg-white p-7 max-[640px]:p-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">댓글 {totalCommentCount}</h2>
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
              <section className="border border-border bg-white p-7 max-[640px]:p-5">
                <h2 className="text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">이런 글은 어때요?</h2>
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

          <aside className="space-y-5">
            <TrendingPostsPanel entries={trendingEntries} previewQuery={previewQuery} />
            {isLoggedIn ? <MyActivityPanel activeType={post.qnaType} /> : null}
            <PopularTagsPanel activeType={post.qnaType} tagHref={popularTagHref} />
            <QnaOperationPrinciplePanel />
          </aside>
        </div>

        <QnaNotice message={notice} />
      </div>
    </main>
  );
}
