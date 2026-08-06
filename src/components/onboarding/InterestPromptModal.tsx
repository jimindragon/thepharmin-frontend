"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ModalShell } from "@/components/ui/ModalShell";
import { jobTracks } from "@/config/jobTracks";
import {
  hospitalJobCategoryOptions,
  industryJobCategoryOptions,
  pharmacyJobCategoryOptions,
  researchJobCategoryOptions,
} from "@/config/jobFilters";
import type { JobTrack } from "@/types/jobs";

/**
 * 리크루트 첫 진입 시 공고 목록 위에 뜨는 관심 분야 안내.
 *
 * 여기서 소속을 다시 묻지 않는다 — 공고를 보러 온 사람에게 "어디에서 일하십니까"를 먼저 물으면
 * 벽이 된다. 그리고 소속과 관심 분야는 애초에 답이 다를 수 있다(병원 약사가 산업으로 옮기려는 경우).
 *
 * 전용 라우트가 아니라 창인 이유도 같다 — 뒤에 실제 공고가 비쳐 보여야 "여기 뭐가 있구나"가 먼저 온다.
 *
 * 껍데기(오버레이·ESC·바깥 클릭·body 스크롤 잠금·헤더 X)는 BoostModal(business/BoostModal.tsx)의
 * 구조를 그대로 따른다 — 코드베이스의 모달 중 그 4가지를 모두 갖춘 것은 그 계열뿐이다.
 */

/** 트랙별 직무 **대분류**만 쓴다(소분류 미사용). 목록 정본은 config/jobFilters다. */
const CATEGORY_OPTIONS_BY_TRACK: Record<JobTrack, Array<{ id: string; label: string }>> = {
  industry: industryJobCategoryOptions,
  research: researchJobCategoryOptions,
  hospital: hospitalJobCategoryOptions,
  pharmacy: pharmacyJobCategoryOptions,
};

/** 선택 버튼 — AffiliationConfirmClient·가입 폼의 OptionButtonGroup과 같은 스펙(h-9 px-3, 선택 시 검정). */
function ChoiceButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={clsx(
        "h-9 border px-3 text-[13px] font-medium transition-colors",
        selected
          ? "border-[#111111] bg-[#111111] text-white"
          : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:text-[#111111]",
      )}
    >
      {label}
    </button>
  );
}

function FieldHead({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[13px] font-medium text-[#303946]">{label}</span>
      <span className="text-[12px] font-normal text-[#8a94a3]">{note}</span>
    </div>
  );
}

export interface InterestPromptModalProps {
  open: boolean;
  /** 건너뛰기·X·ESC·바깥 클릭이 모두 이걸 호출한다. */
  onClose: () => void;
  onSubmit: (tracks: JobTrack[], categoryIds: string[]) => void;
  /** 미리 선택해 둘 분야. 잠그지 않는다 — 바꿀 수 있어야 한다. */
  defaultTracks?: JobTrack[];
  /** 미리 선택해 둘 직무 대분류. */
  defaultCategoryIds?: string[];
}

export function InterestPromptModal({
  open,
  onClose,
  onSubmit,
  defaultTracks,
  defaultCategoryIds,
}: InterestPromptModalProps) {
  const [tracks, setTracks] = useState<JobTrack[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  // 열릴 때마다 기본값에서 다시 시작한다 — BoostModal이 initialJobId를 다루는 방식과 같다.
  useEffect(() => {
    if (!open) return;
    setTracks(defaultTracks ?? []);
    setCategoryIds(defaultCategoryIds ?? []);
  }, [open, defaultTracks, defaultCategoryIds]);

  // 오버레이·패널·헤더·닫기 X·Escape·body 스크롤 잠금은 ModalShell이 맡는다.
  // ModalShell은 열림 여부를 갖지 않으므로 아래 조기 반환이 마운트/언마운트를 결정한다.
  if (!open) return null;

  // 분야를 끄면 그 분야의 직무 선택도 함께 거둔다 — 화면에서 사라진 항목이 값에만 남으면 안 된다.
  const toggleTrack = (id: JobTrack) => {
    setTracks((current) => {
      if (!current.includes(id)) return [...current, id];
      const next = current.filter((track) => track !== id);
      const removed = new Set(CATEGORY_OPTIONS_BY_TRACK[id].map((option) => option.id));
      setCategoryIds((ids) => ids.filter((categoryId) => !removed.has(categoryId)));
      return next;
    });
  };

  const toggleCategory = (id: string) => {
    setCategoryIds((current) => (current.includes(id) ? current.filter((categoryId) => categoryId !== id) : [...current, id]));
  };

  /**
   * 분야를 2개 이상 골랐을 때만 분야별로 묶어 이름을 붙인다.
   * 병원의 "약사 직무"와 약국의 "약사"처럼 이름만으로는 구분되지 않는 짝이 있어, 두 분야를 함께
   * 고르면 소속 분야를 밝혀야 한다. 반대로 한 분야만 골랐을 때의 머리글은 같은 말의 반복이라 뺀다.
   */
  const selectedTracks = jobTracks.filter((track) => tracks.includes(track.id));
  const showGroupHeadings = selectedTracks.length > 1;

  const canSubmit = tracks.length > 0;

  return (
    <ModalShell
      title="관심 분야를 알려주세요"
      headerVariant="emphasis"
      description="선택하신 분야의 공고를 먼저 보여드립니다."
      onClose={onClose}
      maxWidth="max-w-[520px]"
    >
      <div className="overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <FieldHead label="분야" note="여러 개 선택 가능" />
            <div className="flex flex-wrap gap-2" role="group" aria-label="분야">
              {jobTracks.map((track) => (
                <ChoiceButton
                  key={track.id}
                  label={track.label}
                  selected={tracks.includes(track.id)}
                  onClick={() => toggleTrack(track.id)}
                />
              ))}
            </div>
          </div>

          {/* 분야를 고르기 전에는 직무 영역 자체를 내보내지 않는다 — 고를 것이 없는 빈 칸이 된다. */}
          {selectedTracks.length > 0 ? (
            <div className="space-y-2">
              <FieldHead label="직무" note="선택 사항" />
              <div className="space-y-3">
                {selectedTracks.map((track) => (
                  <div key={track.id}>
                    {showGroupHeadings ? (
                      <p className="mb-1.5 text-[12px] font-medium text-[#8a94a3]">{track.label}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2" role="group" aria-label={`${track.label} 직무`}>
                      {CATEGORY_OPTIONS_BY_TRACK[track.id].map((option) => (
                        <ChoiceButton
                          key={option.id}
                          label={option.label}
                          selected={categoryIds.includes(option.id)}
                          onClick={() => toggleCategory(option.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-6 py-5">
        <Button
          type="button"
          variant="gradient"
          className="w-full"
          disabled={!canSubmit}
          onClick={() => onSubmit(tracks, categoryIds)}
        >
          맞춤 공고 보기
        </Button>
        {/* 건너뛸 수는 있되 눈에 먼저 띄지 않게 — 버튼이 아니라 작은 링크. */}
        <p className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] font-normal text-[#8a94a3] underline underline-offset-2 transition hover:text-[#4f5967]"
          >
            나중에 설정하기
          </button>
        </p>
      </div>
    </ModalShell>
  );
}
