"use client";

import clsx from "clsx";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { myPageUser } from "@/config/myPageMenu";
import { qnaCategoryFilters } from "@/data/qna";
import type { QnaType } from "@/types/qna";

function ComposerAvatar() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center bg-[#222222] text-[13px] font-medium text-white">
      {myPageUser.name.slice(0, 1)}
    </span>
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
 * 다시 접힌 기본 상태로 되돌린다. 주제 태그는 목록 카테고리 필터와 동일한 qnaCategoryFilters를
 * 그대로 재사용한다 — "전체"는 초기/미선택 상태를 의미할 뿐 실제 선택 가능한 태그가 아니므로
 * 여기서는 칩으로 노출하지 않고 selectedTopic === null로만 표현한다(게시글 태그로 저장되지 않음).
 */
export function QnaComposer({ activeType, isLoggedIn, isVerifiedPharmacist, onNotify }: QnaComposerProps) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    setExpanded(false);
    setDraft("");
    setSelectedTopic(null);
  }, [activeType]);

  const topics = qnaCategoryFilters[activeType];

  const handleExpand = () => {
    if (!isLoggedIn) return;
    setExpanded(true);
  };

  const handleCancel = () => {
    setExpanded(false);
    setDraft("");
    setSelectedTopic(null);
  };

  const handleSubmit = () => {
    onNotify("글쓰기 기능은 추후 연결될 예정입니다.");
    handleCancel();
  };

  if (!isLoggedIn) {
    return (
      <div className="mt-6 border border-[#e5e9ef] bg-white px-4 py-3">
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
      <div className="mt-6 border border-[#e5e9ef] bg-white px-4 py-3">
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
            글쓰기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border border-[#e5e9ef] bg-white p-4">
      <div className="flex items-center gap-2">
        <ComposerAvatar />
        <span className="text-[14px] font-bold text-[#171d26]">{myPageUser.name}님</span>
        {isVerifiedPharmacist ? (
          <span className="inline-flex h-5 shrink-0 items-center border border-[#111111] px-1.5 text-[11px] font-medium text-[#111111]">약사 인증</span>
        ) : null}
      </div>

      <textarea
        autoFocus
        rows={4}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="어떤 경험이든 편하게 적어주세요. 면접 후기, 연봉 협상, 직무 전환 등 무엇이든 좋아요."
        className="mt-3 w-full resize-none border border-[#e5e9ef] bg-[#fbfcfd] p-3 text-[14px] leading-[1.6] text-[#202734] outline-none placeholder:text-[#a0a9b7]"
      />

      <div className="mt-4">
        <p className="text-[12px] font-medium text-[#8a94a3]">주제 선택</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {topics.map((topic) => {
            const active = selectedTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(active ? null : topic)}
                className={clsx(
                  "h-8 shrink-0 whitespace-nowrap border px-3 text-[13px] font-medium transition-colors",
                  active
                    ? "border-transparent text-white"
                    : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:bg-[#eeeeee] hover:text-[#111111]",
                )}
                style={active ? { backgroundImage: "var(--gradient-cta)" } : undefined}
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
          className="inline-flex h-9 items-center border border-[#cfd8e3] bg-white px-4 text-[13px] font-medium text-[#303946] transition hover:border-[#111111]"
        >
          취소
        </button>
        <Button type="button" variant="gradient" size="sm" onClick={handleSubmit} disabled={!draft.trim()} className="disabled:cursor-not-allowed disabled:opacity-45">
          글쓰기
        </Button>
      </div>
    </div>
  );
}
