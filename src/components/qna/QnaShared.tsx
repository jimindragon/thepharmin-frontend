import clsx from "clsx";
import type { ReactNode } from "react";
import { qnaOperationPrinciple, qnaPopularTags } from "@/data/qna";
import type { QnaAuthorType } from "@/types/qna";

/** 글쓰기/댓글/공감/스크랩/공유/신고 — 백엔드가 없는 동작은 이 토스트로 통일해서 알린다 */
export function showQnaNotice(setNotice: (message: string) => void, message: string) {
  setNotice(message);
  window.setTimeout(() => setNotice(""), 2400);
}

export function QnaNotice({ message }: { message: string }) {
  if (!message) return null;
  return <p className="mt-3 text-[12px] font-medium text-[#596373]">{message}</p>;
}

const avatarToneClassName: Record<QnaAuthorType, string> = {
  anonymous: "border border-[#dfe4ea] bg-[#f4f4f4] text-[#555555]",
  company: "bg-[#111111] text-white",
  headhunter: "bg-[#3d4653] text-white",
};

export function QnaAvatar({ authorType, initial, size = 36 }: { authorType: QnaAuthorType; initial: string; size?: number }) {
  return (
    <span
      className={clsx("grid shrink-0 place-items-center text-[13px] font-bold", avatarToneClassName[authorType])}
      style={{ width: size, height: size, fontSize: size <= 28 ? 12 : 13 }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

/** id 문자열을 0~mod-1 범위로 결정론적으로 매핑(djb2) — Math.random 대신 매 렌더링 동일한 값을 내도록 */
function hashToIndex(id: string, mod: number): number {
  let hash = 5381;
  for (let i = 0; i < id.length; i += 1) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

const authorAvatarTones = [
  "bg-[#eef1f5] text-[#596373]",
  "bg-[#dde3ea] text-[#45505f]",
  "bg-[#c9d1db] text-[#333d4b]",
  "bg-[#b3bec9] text-[#202734]",
];

/** QNA 카드 상단 작성자 블록 전용 원형 아바타 — 닉네임 이니셜 + id 해시 기반 회색 톤 로테이션 */
export function QnaAuthorAvatar({ id, initial, size = 38 }: { id: string; initial: string; size?: number }) {
  const tone = authorAvatarTones[hashToIndex(id, authorAvatarTones.length)];
  return (
    <span
      className={clsx("grid shrink-0 place-items-center rounded-full text-[14px] font-bold", tone)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

export function QnaAuthorLabelBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[20px] items-center border border-[#cfd8e3] bg-[#f7f8fa] px-1.5 text-[11px] font-medium text-[#596373]">
      {children}
    </span>
  );
}

export function QnaTagChip({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex h-6 items-center whitespace-nowrap border px-2 text-[12px] font-medium",
        muted ? "border-[#e5e9ef] text-[#8a94a3]" : "border-[#cfd8e3] bg-[#f7f8fa] text-[#596373]",
      )}
    >
      #{children}
    </span>
  );
}

export function PopularTagsPanel() {
  return (
    <section className="border border-[#e5e9ef] bg-white p-5">
      <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-[#17202c]">
        <span className="inline-block h-3.5 w-[3px] bg-[#111111]" aria-hidden="true" />
        인기 태그
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {qnaPopularTags.map((tag) => (
          <span key={tag} className="inline-flex h-6 items-center whitespace-nowrap bg-[#f4f6f8] px-2 text-[12px] font-medium text-[#596373]">
            #{tag}
          </span>
        ))}
      </div>
    </section>
  );
}

export function QnaOperationPrinciplePanel() {
  return (
    <section className="border border-[#dfe4ea] bg-[#050505] p-5 text-white">
      <h2 className="text-[15px] font-bold tracking-[-0.01em] text-white">{qnaOperationPrinciple.title}</h2>
      <p className="mt-2.5 text-[13px] font-normal leading-[1.8] text-[#b9c0ca]">{qnaOperationPrinciple.description}</p>
    </section>
  );
}
