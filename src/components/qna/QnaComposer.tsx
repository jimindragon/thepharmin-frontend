"use client";

import clsx from "clsx";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { ModalShell } from "@/components/ui/ModalShell";
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
 * 목록 상단의 글쓰기 유도 트리거 + 탭했을 때 열리는 작성 레이어.
 *
 * 트리거는 한 줄짜리 가짜 입력창이고, 실제 작성은 ModalShell 위에서 이뤄진다 —
 * ≤760px에서는 바텀시트, 그 위에서는 중앙 다이얼로그다(sheetBreakpoint=760, 공고 FilterSheet와 같은 경계).
 * 한때는 같은 자리에서 인라인으로 펼쳤지만, 폼이 목록을 아래로 밀어내 "지금 뭘 보고 있었는지"가 사라졌다.
 * 레이어로 띄우면 뒤에 목록이 남아 그 맥락이 유지되고, 트리거와 작성 화면이 하나의 흐름으로 읽힌다.
 *
 * 렌더 경로는 한 벌이다 — 데스크톱용 인라인 폼을 따로 두면 폼 필드를 두 곳에서 고쳐야 하고,
 * ModalShell은 마운트 시점에 Escape·스크롤 잠금을 걸어서 CSS로 한쪽만 숨기는 방식이 성립하지 않는다.
 *
 * 실제 글쓰기 API가 없어 등록은 항상 onNotify로만 안내하고(준비 중), 제출 후에는 레이어를 닫고 폼을 비운다.
 * 주제 태그는 목록 카테고리 필터와 동일한 qnaCategoryFilters(=태그 풀)를 그대로 재사용하며,
 * 최대 QNA_TAG_MAX개까지 복수 선택할 수 있다(리뷰 태그 셀렉터와 동일 UX).
 */
export function QnaComposer({ activeType, isLoggedIn, isVerifiedPharmacist, onNotify }: QnaComposerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [draft, setDraft] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);

  useEffect(() => {
    setIsOpen(false);
    setTitle("");
    setDraft("");
    setSelectedTags([]);
    setIsAnonymous(true);
  }, [activeType]);

  const topics = qnaCategoryFilters[activeType];

  const handleOpen = () => {
    if (!isLoggedIn) return;
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTitle("");
    setDraft("");
    setSelectedTags([]);
    setIsAnonymous(true);
  };

  const handleSubmit = () => {
    onNotify("질문하기 기능은 준비 중입니다.");
    handleClose();
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

  return (
    <>
      <div className="mt-6 border border-border bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          {/* ≤760px에서는 아바타와 연필 아이콘을 걷어낸다. 둘 다 "여기가 글쓰기 자리"라는 같은 말을 하는데,
              그 폭에서 문구를 자르는 값이 정확히 그 둘이다(아바타 32 + gap 12 + 아이콘 14 + gap 8 = 66px).
              남는 것은 placeholder 문구와 "질문하기" 버튼 — 무엇을 하는 자리인지는 그 둘로 충분하다.
              span 래퍼를 쓰는 이유는 QnaAuthorAvatar가 className을 받지 않기 때문이다. */}
          <span className="max-[760px]:hidden">
            <ComposerAvatar />
          </span>
          <button
            type="button"
            onClick={handleOpen}
            className="flex flex-1 items-center gap-2 truncate text-left text-[13px] font-normal text-[#a0a9b7]"
          >
            <Pencil size={14} className="shrink-0 max-[760px]:hidden" aria-hidden="true" />
            <span className="truncate">커리어·이직·전형 경험을 나눠보세요</span>
          </button>
          {/* 목록 상단의 글쓰기 진입 CTA — 페이지 대표 CTA라 어두운 변형.
              시트의 등록 버튼은 폼 제출이므로 기존 gradient를 유지한다. */}
          <Button type="button" variant="gradient-dark" size="sm" onClick={handleOpen} className="shrink-0">
            질문하기
          </Button>
        </div>
      </div>

      {/*
        panelClassName으로 높이를 고정하지 않는다(=auto). FilterSheet가 고정 높이를 주는 이유는 상위 분류를
        고르면 하위 목록이 통째로 갈아끼워져 시트가 출렁이기 때문인데, 이 폼은 열려 있는 동안 항목 수가
        변하지 않는다 — 주제 칩은 pharmacist·industry 모두 9개 고정이고, activeType이 바뀌면 위 effect가
        레이어를 먼저 닫는다. 남는 변수는 textarea 줄 수뿐이고 그건 rows로 고정돼 있다.
      */}
      {isOpen ? (
        <ModalShell
          title={
            <span className="flex min-w-0 items-center gap-2">
              {/* QnaAuthorAvatar가 className을 받지 않아 여기서도 span 래퍼로 감싼다 */}
              <span>
                <ComposerAvatar anonymous={isAnonymous} />
              </span>
              <span className="truncate text-[15px] font-bold text-[#171d26]">
                {isAnonymous ? "익명" : `${myPageUser.name}님`}
              </span>
              {isVerifiedPharmacist ? (
                <span className="inline-flex h-6 shrink-0 items-center border border-[#111111] px-1.5 text-[12px] font-medium text-[#111111]">
                  약사 인증
                </span>
              ) : null}
            </span>
          }
          ariaLabel="질문 작성"
          onClose={handleClose}
          sheetBreakpoint={760}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {/* 아래 두 입력의 max-[760px]:text-[16px]: 16px 미만이면 iOS Safari가 포커스 시 뷰포트를 확대한다 */}
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력해 주세요"
              className="w-full border border-[#e5e9ef] bg-[#fbfcfd] px-3 py-2.5 text-[14px] font-medium text-[#202734] outline-none placeholder:font-normal placeholder:text-[#a0a9b7] max-[760px]:text-[16px]"
            />

            <textarea
              rows={4}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="어떤 경험이든 편하게 적어주세요. 면접 후기, 연봉 협상, 직무 전환 등 무엇이든 좋아요."
              className="mt-2 w-full resize-none border border-[#e5e9ef] bg-[#fbfcfd] p-3 text-[14px] leading-[1.6] text-[#202734] outline-none placeholder:text-[#a0a9b7] max-[760px]:text-[16px]"
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
          </div>

          {/* 취소 버튼은 두지 않는다 — 헤더 X·오버레이 클릭·Escape가 이미 같은 일을 하고, 시트 푸터에서
              닫기와 등록이 나란히 서면 주 동작이 어느 쪽인지 흐려진다. 대신 그 자리를 익명 토글이 쓴다.
              ModalShell 바텀시트에 safe-area 보정이 없어 홈 인디케이터에 CTA가 걸리지 않도록 여기서 준다
              (FilterSheet·AddToCalendarSheet와 같은 처리). */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-white px-6 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
            <label className="flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-[#596373]">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.target.checked)}
                className="h-3.5 w-3.5 shrink-0 accent-[#111111]"
              />
              익명으로 작성
            </label>
            <Button type="button" variant="gradient" size="sm" onClick={handleSubmit} disabled={!draft.trim()}>
              등록
            </Button>
          </div>
        </ModalShell>
      ) : null}
    </>
  );
}
