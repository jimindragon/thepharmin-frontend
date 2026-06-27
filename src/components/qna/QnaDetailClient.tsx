"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, Flag, Heart, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { myPageUser } from "@/config/myPageMenu";
import { getEntryCommentCount, getRelatedQnaEntries, isQnaPost } from "@/data/qna";
import type { QnaComment, QnaPost, QnaReply } from "@/types/qna";
import {
  PopularTagsPanel,
  QnaAuthorLabelBadge,
  QnaAvatar,
  QnaNotice,
  QnaOperationPrinciplePanel,
  QnaTagChip,
  showQnaNotice,
} from "@/components/qna/QnaShared";

type CommentSortOption = "인기순" | "최신순";

function displayAuthorName(authorType: QnaComment["authorType"], authorName: string): string {
  if (authorType === "anonymous") return authorName.replace(/^익명\s*·\s*/, "");
  return authorName;
}

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
          className="inline-flex h-9 items-center gap-1.5 border border-[#cfd8e3] bg-white px-3 text-[13px] font-medium text-[#303946] transition hover:border-[#111111]"
        >
          <Heart size={15} aria-hidden="true" />
          공감 {likeCount}
        </button>
        <button
          type="button"
          onClick={onScrap}
          className="inline-flex h-9 items-center gap-1.5 border border-[#cfd8e3] bg-white px-3 text-[13px] font-medium text-[#303946] transition hover:border-[#111111]"
        >
          <Bookmark size={15} aria-hidden="true" />
          스크랩
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex h-9 items-center gap-1.5 border border-[#cfd8e3] bg-white px-3 text-[13px] font-medium text-[#303946] transition hover:border-[#111111]"
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
  authorType,
  authorName,
  authorLabel,
  avatarInitial,
  isPostAuthor,
  createdAtLabel,
  likeCount,
  body,
  onReact,
  onReply,
}: {
  authorType: QnaComment["authorType"];
  authorName: string;
  authorLabel?: string;
  avatarInitial: string;
  isPostAuthor?: boolean;
  createdAtLabel: string;
  likeCount: number;
  body: string;
  onReact: () => void;
  onReply?: () => void;
}) {
  return (
    <div className="flex gap-3">
      <QnaAvatar authorType={authorType} initial={avatarInitial} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-[#171d26]">{displayAuthorName(authorType, authorName)}</span>
          {authorLabel ? <QnaAuthorLabelBadge>{authorLabel}</QnaAuthorLabelBadge> : null}
          {isPostAuthor && !authorLabel ? <QnaAuthorLabelBadge>작성자</QnaAuthorLabelBadge> : null}
        </div>
        <p className="mt-1.5 text-[14px] font-normal leading-[1.65] text-[#3d4653]">{body}</p>
        <div className="mt-1.5 flex items-center gap-3 text-[12px] font-medium text-[#a0a9b7]">
          <span>{createdAtLabel}</span>
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
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isLoggedIn}
          className="inline-flex h-9 items-center px-5 text-[13px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundImage: "var(--gradient-cta)" }}
        >
          등록
        </button>
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

  return (
    <main className="bg-[#f7f8fa] pb-20">
      <div className="app-shell--default pt-8">
        <Link href={backHref} className="inline-flex h-9 items-center gap-1.5 text-[13px] font-medium text-[#596373] transition hover:text-[#111111]">
          <ArrowLeft size={14} aria-hidden="true" />
          채용 QNA
        </Link>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_280px] gap-8 max-[1024px]:grid-cols-1">
          <div className="min-w-0 space-y-5">
            <article className="border border-[#e5e9ef] bg-white p-7 max-[640px]:p-5">
              <div className="flex flex-wrap items-center gap-1.5">
                {post.tags.map((tag) => (
                  <QnaTagChip key={tag}>{tag}</QnaTagChip>
                ))}
              </div>
              <h1 className="mt-3 text-[26px] font-bold leading-[1.35] tracking-[-0.02em] text-[#171d26] max-[640px]:text-[21px]">{post.title}</h1>

              <div className="mt-4 flex items-center gap-3 border-b border-[#edf1f5] pb-5">
                <QnaAvatar authorType={post.authorType} initial={post.avatarInitial} size={40} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[14px] font-bold text-[#171d26]">{displayAuthorName(post.authorType, post.authorName)}</span>
                    {post.authorLabel ? <QnaAuthorLabelBadge>{post.authorLabel}</QnaAuthorLabelBadge> : null}
                  </div>
                  <p className="mt-0.5 text-[12px] font-normal text-[#8a94a3]">
                    {post.createdAtLabel} · 조회 {post.viewCount.toLocaleString("ko-KR")}
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

              <div className="mt-5 flex flex-wrap items-center gap-1.5">
                {post.tags.map((tag) => (
                  <QnaTagChip key={`bottom-${tag}`} muted>
                    {tag}
                  </QnaTagChip>
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
                        authorType={comment.authorType}
                        authorName={comment.authorName}
                        authorLabel={comment.authorLabel}
                        avatarInitial={comment.avatarInitial}
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
                              authorType={reply.authorType}
                              authorName={reply.authorName}
                              authorLabel={reply.authorLabel}
                              avatarInitial={reply.avatarInitial}
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
                    const clickable = isQnaPost(entry);
                    const itemContent = (
                      <>
                        <QnaTagChip muted>{entry.tags[0]}</QnaTagChip>
                        <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-[1.5] text-[#303946]">{entry.title}</p>
                        <p className="mt-1 text-[11px] font-normal text-[#a0a9b7]">
                          댓글 {getEntryCommentCount(entry)} · 공감 {entry.likeCount}
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
            <PopularTagsPanel />
            <QnaOperationPrinciplePanel />
          </aside>
        </div>

        <QnaNotice message={notice} />
      </div>
    </main>
  );
}
