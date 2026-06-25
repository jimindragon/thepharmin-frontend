export type QnaType = "pharmacist" | "industry";

export type QnaAuthorType = "anonymous" | "company" | "headhunter";

export interface QnaReply {
  id: string;
  authorType: QnaAuthorType;
  authorName: string;
  authorLabel?: string;
  avatarInitial: string;
  /** 게시글 작성자가 직접 남긴 답글인지 — "작성자" 배지 표시 여부 */
  isPostAuthor?: boolean;
  createdAtLabel: string;
  likeCount: number;
  body: string;
}

export interface QnaComment extends QnaReply {
  replies: QnaReply[];
}

export interface QnaPost {
  id: string;
  qnaType: QnaType;
  category: string;
  tags: string[];
  title: string;
  body: string[];
  authorType: QnaAuthorType;
  authorName: string;
  authorLabel?: string;
  avatarInitial: string;
  companyName?: string;
  createdAtLabel: string;
  /** 정렬(최신순)에만 쓰는 내부 값 — 화면에는 항상 createdAtLabel을 그대로 노출 */
  minutesAgo: number;
  viewCount: number;
  likeCount: number;
  isBest?: boolean;
  comments: QnaComment[];
  relatedPostIds: string[];
}

/** 상세 본문 없이 목록·관련 글 카드에서만 쓰는 보조 게시글 — 상세페이지로 연결하지 않는다 */
export interface QnaPreviewCard {
  id: string;
  qnaType: QnaType;
  category: string;
  tags: string[];
  title: string;
  preview: string;
  authorType: QnaAuthorType;
  authorName: string;
  avatarInitial: string;
  createdAtLabel: string;
  minutesAgo: number;
  likeCount: number;
  commentCount: number;
}

export type QnaListEntry = QnaPost | QnaPreviewCard;
