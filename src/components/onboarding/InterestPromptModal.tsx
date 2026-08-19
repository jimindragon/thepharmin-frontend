"use client";

import clsx from "clsx";
import { Building2, FlaskConical, Pill, Stethoscope, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ModalShell } from "@/components/ui/ModalShell";
import { jobTracks } from "@/config/jobTracks";
import {
  experienceOptions,
  hospitalJobCategoryOptions,
  industryJobCategoryOptions,
  pharmacyJobCategoryOptions,
  regionOptions,
  researchJobCategoryOptions,
} from "@/config/jobFilters";
import type { JobTrack } from "@/types/jobs";

/**
 * 리크루트 첫 진입 시 공고 목록 위에 뜨는 관심 조건 온보딩.
 *
 * 여기서 소속을 다시 묻지 않는다 — 공고를 보러 온 사람에게 "어디에서 일하십니까"를 먼저 물으면
 * 벽이 된다. 그리고 소속과 관심 분야는 애초에 답이 다를 수 있다(병원 약사가 산업으로 옮기려는 경우).
 *
 * 전용 라우트가 아니라 창인 이유도 같다 — 뒤에 실제 공고가 비쳐 보여야 "여기 뭐가 있구나"가 먼저 온다.
 *
 * 3스텝(분야 → 직무 → 경력·지역)으로 나눈 것은 한 화면에 네 가지를 쌓으면 세로가 길어져
 * 모바일 시트에서 아래 두 항목이 접히기 때문이다. 스텝이 나뉘어도 창은 그대로 창이다 —
 * 라우트로 빼지 않는다.
 *
 * 껍데기(오버레이·ESC·바깥 클릭·body 스크롤 잠금·헤더 X)는 ModalShell이 맡는다.
 */

/** 트랙별 직무 **대분류**만 쓴다(소분류 미사용). 목록 정본은 config/jobFilters다. */
const CATEGORY_OPTIONS_BY_TRACK: Record<JobTrack, Array<{ id: string; label: string }>> = {
  industry: industryJobCategoryOptions,
  research: researchJobCategoryOptions,
  hospital: hospitalJobCategoryOptions,
  pharmacy: pharmacyJobCategoryOptions,
};

/**
 * 분야 카드의 아이콘. 산업의 Building2는 코드베이스가 이미 "기관"에 쓰는 아이콘이고
 * (EntityLogo 로고 대체·마이페이지 스크랩 기업 탭·헤드헌팅 랜딩), 나머지 셋은 선례가 없어
 * 뜻이 가장 곧은 것으로 새로 정한다. 색은 카드가 정한다 — 아이콘은 currentColor로만 그린다.
 */
const TRACK_ICONS: Record<JobTrack, LucideIcon> = {
  industry: Building2,
  research: FlaskConical,
  hospital: Stethoscope,
  pharmacy: Pill,
};

/** 스텝별 헤더 문구. 겉틀은 headerVariant="emphasis" 하나로 고정하고 내용만 바뀐다. */
const STEP_HEADINGS: Record<number, { title: string; description: string }> = {
  1: { title: "관심 분야를 알려주세요", description: "선택하신 분야의 공고를 먼저 보여드립니다." },
  2: { title: "어떤 직무를 찾으시나요", description: "고르신 분야의 직무 중에서 선택해주세요." },
  3: { title: "경력과 지역을 알려주세요", description: "마지막입니다. 조건에 맞는 공고만 추려서 보여드립니다." },
};

const LAST_STEP = Object.keys(STEP_HEADINGS).length;

/**
 * 창을 닫고 나서도 남는 약속이라 마지막까지 보이는 자리(푸터)에 둔다 — 본문 끝에 두면
 * 선택지가 긴 2·3스텝에서는 스크롤 밖으로 밀려 정작 망설이는 순간에 보이지 않는다.
 */
const UTILITY_NOTE = "선택하신 조건으로 맞춤 공고를 추천해 드려요. 언제든 마이페이지에서 수정할 수 있습니다.";

/** 되돌리기·건너뛰기처럼 "고르지 않는 길"의 생김새. 종전 "이전" 링크가 쓰던 값 그대로다. */
const SUBTLE_ACTION_CLASS =
  "text-[13px] font-normal text-[#8a94a3] underline underline-offset-2 transition hover:text-[#4f5967]";

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

/**
 * 1스텝 분야 카드. 다른 스텝의 칩과 다른 형태를 쓰는 이유는 층이 다르기 때문이다 —
 * 분야는 이후 두 스텝의 선택지를 결정하는 상위 축이고, 넷뿐이라 카드로 벌려도 세로를 먹지 않는다.
 *
 * 선택 표시는 칩과 같은 검정 채움이다(색 상태를 새로 들이지 않는다). 아이콘·라벨은 색을 스스로
 * 정하지 않고 카드에서 물려받는다 — 채워졌을 때 흰색으로 함께 뒤집히도록.
 */
function TrackCard({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={clsx(
        "flex flex-col items-center justify-center gap-2 border px-2 py-4 transition-colors",
        selected
          ? "border-[#111111] bg-[#111111] text-white"
          : "border-border bg-white text-[#303946] hover:border-[#111111]",
      )}
    >
      <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
      <span className="text-[13px] font-medium">{label}</span>
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

/** 창이 돌려주는 답. 어디에 어떻게 저장되는지는 창이 알지 않는다(InterestPromptGate 몫). */
export interface InterestPromptAnswers {
  tracks: JobTrack[];
  /** 직무 **대분류** id. 트랙 구분 없이 한 배열이다 — 대분류 id는 트랙 간에 겹치지 않는다. */
  categoryIds: string[];
  experienceId: string | null;
  regionIds: string[];
}

export interface InterestPromptModalProps {
  open: boolean;
  /** 건너뛰기·X·ESC·바깥 클릭이 모두 이걸 호출한다. */
  onClose: () => void;
  onSubmit: (answers: InterestPromptAnswers) => void;
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
  const [step, setStep] = useState(1);
  const [tracks, setTracks] = useState<JobTrack[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [experienceId, setExperienceId] = useState<string | null>(null);
  const [regionIds, setRegionIds] = useState<string[]>([]);

  // 열릴 때마다 첫 스텝의 기본값에서 다시 시작한다 — 닫았다 다시 연 창이 중간 스텝에서 열리면
  // 무엇을 답했는지 모르는 화면부터 마주치게 된다.
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setTracks(defaultTracks ?? []);
    setCategoryIds(defaultCategoryIds ?? []);
    setExperienceId(null);
    setRegionIds([]);
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

  const toggleRegion = (id: string) => {
    setRegionIds((current) => (current.includes(id) ? current.filter((regionId) => regionId !== id) : [...current, id]));
  };

  /**
   * 분야를 2개 이상 골랐을 때만 분야별로 묶어 이름을 붙인다.
   * 병원의 "약사 직무"와 약국의 "약사"처럼 이름만으로는 구분되지 않는 짝이 있어, 두 분야를 함께
   * 고르면 소속 분야를 밝혀야 한다. 반대로 한 분야만 골랐을 때의 머리글은 같은 말의 반복이라 뺀다.
   */
  const selectedTracks = jobTracks.filter((track) => tracks.includes(track.id));
  const showGroupHeadings = selectedTracks.length > 1;

  /**
   * 그 스텝에서 아무것도 고르지 않았으면 다음으로 넘어갈 수 없다.
   * 3스텝은 경력·지역 둘 중 하나만 골라도 통과시킨다 — 지역만 정해 둔 사람에게 경력을 강요할
   * 이유가 없고, 고르지 않은 쪽은 emptyUserPreference의 빈 값 그대로 저장된다.
   */
  const canAdvance =
    step === 1 ? tracks.length > 0 : step === 2 ? categoryIds.length > 0 : experienceId !== null || regionIds.length > 0;

  const heading = STEP_HEADINGS[step];

  const handleNext = () => {
    if (step < LAST_STEP) {
      setStep(step + 1);
      return;
    }

    onSubmit({ tracks, categoryIds, experienceId, regionIds });
  };

  return (
    <ModalShell
      /*
        가로 스텝퍼(관심 분야 — 관심 직무 — 경력·지역)를 걷어내고 그 자리를 제목 위 "1/3" 한 줄로
        줄인다. 세 칸짜리 인디케이터는 이 창에서 제목만 한 덩어리를 더 얹어 놓고 정작 다음에
        무엇이 오는지는 제목이 이미 말하고 있었다. 검정 채움 칩을 쓰지 않는 것은 이 창에서
        검정 채움이 "고른 것"의 표시이기 때문이다 — 고르지 않은 진행 표시가 같은 옷을 입으면 안 된다.

        title이 문자열이 아니게 되므로 ariaLabel을 직접 넘긴다(ModalShell은 문자열 제목일 때만
        자동으로 대화상자 이름을 만든다).
      */
      title={
        <>
          <span className="block text-[13px] font-medium text-[#8a94a3]">
            {step}/{LAST_STEP}
          </span>
          <span className="mt-1.5 block">{heading.title}</span>
        </>
      }
      ariaLabel={heading.title}
      headerVariant="emphasis"
      /* 제목이 먼저 읽히도록 부제를 한 단 낮춘다 — 겉틀의 14px/#68717e를 이 창에서만 덮는다 */
      description={<span className="text-[13px] text-[#8a94a3]">{heading.description}</span>}
      onClose={onClose}
      maxWidth="max-w-[520px]"
      // 모바일에서는 하단에 붙는 86dvh 바텀시트가 된다 — 공고 필터 시트와 같은 경계다.
      sheetBreakpoint={760}
    >
      <div className="overflow-y-auto px-6 py-7">
        <div className="space-y-8">
          {step === 1 ? (
            <div className="space-y-3">
              <FieldHead label="분야" note="여러 개 선택 가능" />
              {/* 넷이 한 줄에 서고, 시트가 되는 폭에서는 2×2로 접힌다 — 카드가 좁아져 라벨이 접히는 것을 막는다 */}
              <div className="grid grid-cols-4 gap-2 max-[420px]:grid-cols-2" role="group" aria-label="분야">
                {jobTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    icon={TRACK_ICONS[track.id]}
                    label={track.label}
                    selected={tracks.includes(track.id)}
                    onClick={() => toggleTrack(track.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* 대분류까지만 묻는다 — 소분류는 목록에 들어가 필터로 좁히면 되고, 여기서 물으면 스텝이 길어진다. */}
          {step === 2 ? (
            <div className="space-y-3">
              <FieldHead label="직무" note="여러 개 선택 가능" />
              <div className="space-y-4">
                {selectedTracks.map((track) => (
                  <div key={track.id}>
                    {showGroupHeadings ? (
                      <p className="mb-2 text-[12px] font-medium text-[#8a94a3]">{track.label}</p>
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

          {step === 3 ? (
            <>
              <div className="space-y-3">
                <FieldHead label="경력" note="하나만 선택" />
                <div className="flex flex-wrap gap-2" role="group" aria-label="경력">
                  {experienceOptions.map((option) => (
                    <ChoiceButton
                      key={option.id}
                      label={option.label}
                      selected={experienceId === option.id}
                      // 고른 것을 다시 누르면 해제된다 — 단일 선택에 "선택 안 함"으로 돌아갈 길을 남긴다.
                      onClick={() => setExperienceId((current) => (current === option.id ? null : option.id))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <FieldHead label="지역" note="여러 개 선택 가능" />
                <div className="flex flex-wrap gap-2" role="group" aria-label="지역">
                  {regionOptions.map((option) => (
                    <ChoiceButton
                      key={option.id}
                      label={option.label}
                      selected={regionIds.includes(option.id)}
                      onClick={() => toggleRegion(option.id)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-6 pb-5 pt-4">
        {/* 박스도 아이콘도 두지 않는다 — 안내가 박스를 입으면 답해야 할 것이 하나 더 있는 것처럼 보인다.
            버튼보다 한 단 작은 12px로, 누를 것과 읽을 것의 층을 글자 크기로만 가른다. */}
        <p className="break-keep text-[12px] font-normal leading-[1.6] text-[#8a94a3]">{UTILITY_NOTE}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          {/* 되돌아갈 곳이 없는 1스텝에서도 자리는 비워 둔다 — 우측 버튼 묶음이 스텝마다 흔들리지 않게. */}
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className={SUBTLE_ACTION_CLASS}
              >
                이전
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            {/* 건너뛰기는 닫기와 같다 — 열람만 기록하고 아무것도 저장하지 않는다.
                박스 버튼에서 텍스트로 내린다: 이 창에서 누를 것은 "다음"이고, 건너뛰기는 이전과 같은
                되돌리기 층이다. 둘이 같은 생김새를 쓰면 좌우 어디에 있든 같은 무게로 읽힌다. */}
            <button type="button" onClick={onClose} className={SUBTLE_ACTION_CLASS}>
              건너뛰기
            </button>
            <Button
              type="button"
              // 마지막 스텝의 완료만 브랜드 CTA다 — 중간 "다음"까지 그라데이션이면 어디가 끝인지 흐려진다.
              variant={step === LAST_STEP ? "gradient" : "primary"}
              disabled={!canAdvance}
              onClick={handleNext}
            >
              {step === LAST_STEP ? "완료" : "다음"}
            </Button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
