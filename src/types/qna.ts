export type QnaType = "pharmacist" | "industry";

export type QnaAuthorType = "anonymous" | "company" | "headhunter";

export interface QnaReply {
  id: string;
  authorType: QnaAuthorType;
  authorName: string;
  authorLabel?: string;
  avatarInitial: string;
  /** 댓글 작성자 블록에 노출하는 닉네임 — 글 nickname/jobRole과 동일한 체계(같은 글에서 작성자 본인이면 글의 nickname을 재사용) */
  nickname: string;
  jobRole: string;
  /** 게시글 작성자가 직접 남긴 답글인지 — "작성자" 배지 표시 여부 */
  isPostAuthor?: boolean;
  createdAtLabel: string;
  likeCount: number;
  body: string;
  /** 현재 로그인 사용자(김더팜)가 작성한 댓글/답글인지 — "내 활동" 집계 전용 내부 플래그, 닉네임 표시엔 영향 없음 */
  isMine?: boolean;
}

export interface QnaComment extends QnaReply {
  replies: QnaReply[];
}

export interface QnaPost {
  id: string;
  qnaType: QnaType;
  tags: string[];
  title: string;
  body: string[];
  authorType: QnaAuthorType;
  authorName: string;
  authorLabel?: string;
  avatarInitial: string;
  /** 작성자 블록에 노출하는 닉네임 — 익명 글은 "익명1"~"익명N", 기업/헤드헌터 계정은 authorName과 동일 */
  nickname: string;
  /** 작성자 블록 두 번째 줄에 쓰는 직무 표기 — 기업/헤드헌터 계정은 authorLabel과 동일 */
  jobRole: string;
  companyName?: string;
  createdAtLabel: string;
  /** 정렬(최신순)에만 쓰는 내부 값 — 화면에는 항상 createdAtLabel을 그대로 노출 */
  minutesAgo: number;
  viewCount: number;
  likeCount: number;
  isBest?: boolean;
  comments: QnaComment[];
  relatedPostIds: string[];
  /** 현재 로그인 사용자(김더팜)가 작성한 글인지 — "내 활동" 집계 전용 내부 플래그, 닉네임 표시엔 영향 없음 */
  isMine?: boolean;
}

/** 목록·상세가 항상 같은 형태의 글을 다루도록 QnaPost로 단일화(과거 QnaPreviewCard는 폐기) */
export type QnaListEntry = QnaPost;
