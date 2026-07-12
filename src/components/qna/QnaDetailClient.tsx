"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, Flag, Share2, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { myPageUser } from "@/config/myPageMenu";
import { getEntryCommentCount, getRelatedQnaEntries } from "@/data/qna";
import type { QnaPost, QnaReply } from "@/types/qna";
import {
  PopularTagsPanel,
  QnaAuthorAvatar,
  QnaAuthorLabelBadge,
  QnaAvatar,
  QnaNotice,
  QnaOperationPrinciplePanel,
  showQnaNotice,
} from "@/components/qna/QnaShared";

type CommentSortOption = "인기순" | "최신순";

function ReactionRow({
  likeCount,
  onLike,
  onScrap,
  onShare,
  onReport,
}: {
  likeCount: number;
  onLike: () => void;
  onScrap: () => void;
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
          className="inline-flex h-9 items-center gap-1.5 border border-[#cfd8e3] bg-white px-3 text-[13px] font-medium text-[#596373] transition hover:border-[#111111] hover:text-[#111111]"
        >
          <Bookmark size={15} aria-hidden="true" />
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
    <div className="flex items-center gap-3 text-[13px] font-medium text-[#a0a9b7]">
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
            <span className="text-[13px] font-bold text-[#171d26]">{nickname}</span>
          )}
          {authorLabel ? <QnaAuthorLabelBadge>{authorLabel}</QnaAuthorLabelBadge> : null}
        </div>
        <p className="mt-0.5 text-[13px] font-normal text-[#8b95a1]">{[jobRole, createdAtLabel].filter(Boolean).join(" · ")}</p>
        <p className="mt-1.5 text-[14px] font-normal leading-[1.65] text-[#3d4653]">{body}</p>
        <div className="mt-1.5 flex items-center gap-3 text-[12px] font-medium text-[#a0a9b7]">
          <button type="button" onClick={onReact} className="hover:text-[#596373]">
            공감 {likeCount}
          </button>
          {onReply ? (
            <button type="button" onClick={onReply} className="hover:text-[#596373]">
              답글
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CommentComposer({ isLoggedIn, onSubmit }: { isLoggedIn: boolean; onSubmit: () => void }) {
  const [draft, setDraft] = useState("");

  return (
    <div className="border border-[#e5e9ef] bg-white p-4">
      <div className="flex gap-3">
        <QnaAvatar authorType="anonymous" initial={myPageUser.name.slice(0, 1)} size={32} />
        <textarea
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={isLoggedIn ? "댓글을 남겨보세요" : "로그인 후 댓글을 남길 수 있습니다"}
          disabled={!isLoggedIn}
          className="flex-1 resize-none bg-transparent text-[14px] leading-[1.6] text-[#202734] outline-none placeholder:text-[#a0a9b7] disabled:cursor-not-allowed"
        />
      </div>
      <div className="mt-3 flex items-center justify-end border-t border-[#edf1f5] pt-3">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onSubmit}
          disabled={!isLoggedIn}
          className="disabled:cursor-not-allowed disabled:opacity-50"
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

  const relatedEntries = useMemo(() => getRelatedQnaEntries(post), [post]);
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
            <article className="border border-[#e5e9ef] bg-white p-7 max-[640px]:p-5">
              {post.isBest ? (
                <span className="mb-2.5 inline-flex h-6 items-center bg-[#111111] px-2 text-[11px] font-bold text-white">BEST</span>
              ) : null}
              <h1 className="text-[22px] font-bold leading-[1.35] tracking-[-0.02em] text-[#171d26] max-[640px]:text-[20px]">{post.title}</h1>

              <div className="mt-4 flex items-center gap-3 border-b border-[#edf1f5] pb-5">
                <QnaAuthorAvatar id={post.id} nickname={post.nickname} size={40} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-bold text-[#17202c]">{post.nickname}</span>
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

              <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-normal text-[#8b95a1]">
                {post.tags.map((tag) => (
                  <span key={tag} className="whitespace-nowrap">
                    #{tag}
                  </span>
                ))}
              </div>

              <ReactionRow
                likeCount={post.likeCount}
                onLike={() => notify("공감 기능은 추후 연결될 예정입니다.")}
                onScrap={() => notify("스크랩 기능은 추후 연결될 예정입니다.")}
                onShare={() => notify("공유 기능은 추후 연결될 예정입니다.")}
                onReport={() => notify("신고 접수 화면은 추후 연결될 예정입니다.")}
              />
            </article>

            <section className="border border-[#e5e9ef] bg-white p-7 max-[640px]:p-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">댓글 {totalCommentCount}</h2>
                <CommentSortControl value={commentSort} onChange={setCommentSort} />
              </div>

              <div className="mt-4">
                <CommentComposer isLoggedIn={isLoggedIn} onSubmit={() => notify("댓글 등록 기능은 추후 연결될 예정입니다.")} />
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
                        onReact={() => notify("공감 기능은 추후 연결될 예정입니다.")}
                        onReply={() => notify("답글 작성 화면은 추후 연결될 예정입니다.")}
                      />
                      {comment.replies.length ? (
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
                              onReact={() => notify("공감 기능은 추후 연결될 예정입니다.")}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-center text-[13px] font-normal text-[#8791a0]">아직 등록된 댓글이 없습니다.</p>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            {relatedEntries.length ? (
              <section className="border border-[#e5e9ef] bg-white p-5">
                <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#17202c]">이런 글은 어때요?</h2>
                <div className="mt-3 divide-y divide-[#edf1f5]">
                  {relatedEntries.map((entry) => {
                    const clickable = true;
                    const itemContent = (
                      <>
                        <p className="line-clamp-2 text-[13px] font-medium leading-[1.5] text-[#303946]">{entry.title}</p>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[11px] font-normal text-[#a0a9b7]">
                          <span>#{entry.tags[0]}</span>
                          <span>
                            댓글 {getEntryCommentCount(entry)} · 공감 {entry.likeCount}
                          </span>
                        </p>
                      </>
                    );
                    return clickable ? (
                      <Link key={entry.id} href={`/qna/${entry.id}${previewQuery}`} className="block py-4 first:pt-0 last:pb-0 transition hover:opacity-70">
                        {itemContent}
                      </Link>
                    ) : (
                      <div key={entry.id} className="cursor-default py-4 first:pt-0 last:pb-0">
                        {itemContent}
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}
            <PopularTagsPanel activeType={post.qnaType} tagHref={popularTagHref} />
            <QnaOperationPrinciplePanel />
          </aside>
        </div>

        <QnaNotice message={notice} />
      </div>
    </main>
  );
}
