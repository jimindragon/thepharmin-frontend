"use client";

import clsx from "clsx";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { QNA_TAG_MAX } from "@/config/qnaTags";
import { myPageUser } from "@/config/myPageMenu";
import { qnaCategoryFilters } from "@/data/qna";
import type { QnaType } from "@/types/qna";
import { QnaAuthorAvatar } from "@/components/qna/QnaShared";

/** "익명"이면 QnaAuthorAvatar가 항상 단색으로 렌더링하고, 실명이면 myPageUser.name을 해시 시드로 로테이션 톤을 받는다 */
function ComposerAvatar({ anonymous = false }: { anonymous?: boolean }) {
  return anonymous ? (
    <QnaAuthorAvatar id="qna-composer-anonymous" nickname="익명" size={32} />
  ) : (
    <QnaAuthorAvatar id={myPageUser.name} nickname={myPageUser.name} size={32} />
  );
}

interface QnaComposerProps {
  activeType: QnaType;
  isLoggedIn: boolean;
  isVerifiedPharmacist: boolean;
  onNotify: (message: string) => void;
}

/**
 * 목록 상단의 프로필 요약 + 글쓰기 유도 영역을 하나로 합친 접힘·펼침형 글쓰기 컴포넌트.
 * 실제 글쓰기 API가 없어 등록은 항상 onNotify로만 안내하고(추후 연결될 예정), 제출 후에는
 * 다시 접힌 기본 상태로 되돌린다. 주제 태그는 목록 카테고리 필터와 동일한 qnaCategoryFilters(=태그 풀)를
 * 그대로 재사용하며, 최대 QNA_TAG_MAX개까지 복수 선택할 수 있다(리뷰 태그 셀렉터와 동일 UX).
 */
export function QnaComposer({ activeType, isLoggedIn, isVerifiedPharmacist, onNotify }: QnaComposerProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [draft, setDraft] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);

  useEffect(() => {
    setExpanded(false);
    setTitle("");
    setDraft("");
    setSelectedTags([]);
    setIsAnonymous(true);
  }, [activeType]);

  const topics = qnaCategoryFilters[activeType];

  const handleExpand = () => {
    if (!isLoggedIn) return;
    setExpanded(true);
  };

  const handleCancel = () => {
    setExpanded(false);
    setTitle("");
    setDraft("");
    setSelectedTags([]);
    setIsAnonymous(true);
  };

  const handleSubmit = () => {
    onNotify("질문하기 기능은 추후 연결될 예정입니다.");
    handleCancel();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((selected) => selected !== tag);
      if (prev.length >= QNA_TAG_MAX) return prev;
      return [...prev, tag];
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="mt-6 border border-border bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <ComposerAvatar />
          <p className="flex-1 truncate text-[13px] font-normal text-[#a0a9b7]">로그인 후 글을 작성할 수 있습니다.</p>
          <LinkButton href="/qna" variant="gradient" size="sm" className="shrink-0">
            로그인하기
          </LinkButton>
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="mt-6 border border-border bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <ComposerAvatar />
          <button
            type="button"
            onClick={handleExpand}
            className="flex flex-1 items-center gap-2 truncate text-left text-[13px] font-normal text-[#a0a9b7]"
          >
            <Pencil size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate">커리어·이직·전형 경험을 나눠보세요</span>
          </button>
          <Button type="button" variant="gradient" size="sm" onClick={handleExpand} className="shrink-0">
            질문하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border border-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ComposerAvatar anonymous={isAnonymous} />
          <span className="text-[14px] font-bold text-[#171d26]">{isAnonymous ? "익명" : `${myPageUser.name}님`}</span>
          {isVerifiedPharmacist ? (
            <span className="inline-flex h-6 shrink-0 items-center border border-[#111111] px-1.5 text-[12px] font-medium text-[#111111]">약사 인증</span>
          ) : null}
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

      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="제목을 입력해 주세요"
        className="mt-3 w-full border border-[#e5e9ef] bg-[#fbfcfd] px-3 py-2.5 text-[14px] font-medium text-[#202734] outline-none placeholder:font-normal placeholder:text-[#a0a9b7]"
      />

      <textarea
        rows={4}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="어떤 경험이든 편하게 적어주세요. 면접 후기, 연봉 협상, 직무 전환 등 무엇이든 좋아요."
        className="mt-2 w-full resize-none border border-[#e5e9ef] bg-[#fbfcfd] p-3 text-[14px] leading-[1.6] text-[#202734] outline-none placeholder:text-[#a0a9b7]"
      />

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-medium text-[#8a94a3]">주제 선택</p>
          <p className="text-[12px] font-medium text-[#8a94a3]">
            선택 {selectedTags.length} / {QNA_TAG_MAX}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {topics.map((topic) => {
            const active = selectedTags.includes(topic);
            const disabled = !active && selectedTags.length >= QNA_TAG_MAX;
            return (
              <button
                key={topic}
                type="button"
                disabled={disabled}
                onClick={() => toggleTag(topic)}
                className={clsx(
                  "h-9 shrink-0 whitespace-nowrap border px-4 text-[13px] font-medium transition-colors",
                  active
                    ? "border-[#111111] bg-[#111111] text-white"
                    : "border-[#dce2ea] bg-white text-[#3d4653] hover:border-[#cfd8e3] hover:bg-[#f7f8fa] hover:text-[#111111]",
                  disabled && "cursor-not-allowed opacity-45 hover:border-[#dce2ea] hover:bg-white hover:text-[#3d4653]",
                )}
              >
                #{topic}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#edf1f5] pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex h-9 items-center border border-[#dce2ea] bg-white px-4 text-[13px] font-medium text-[#303946] transition hover:border-[#111111]"
        >
          취소
        </button>
        <Button type="button" variant="gradient" size="sm" onClick={handleSubmit} disabled={!draft.trim()}>
          질문하기
        </Button>
      </div>
    </div>
  );
}
