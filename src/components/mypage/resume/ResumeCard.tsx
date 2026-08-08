"use client";

import Link from "next/link";
import { isResumeUsable, type BuiltResume } from "@/data/resumes";
import { ResumeActionsMenu } from "@/components/mypage/resume/ResumeActionsMenu";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ResumePrimaryBadge } from "@/components/shared/ResumePrimaryBadge";

export function ResumeCard({
  resume,
  onSetPrimary,
  onDuplicate,
  onDelete,
  onToggleProposal,
}: {
  resume: BuiltResume;
  onSetPrimary: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleProposal: (enabled: boolean) => void;
}) {
  /* 완료 판정은 필수 3영역(관문)만 본다 — 자격·경력·자기소개는 매칭 품질을 올릴 뿐
     비어 있어도 지원에는 쓸 수 있어서, 이들 때문에 "작성 중"으로 남지 않는다. */
  const complete = isResumeUsable(resume);

  /* 직무 태그 칩 줄은 정보 다이어트로 뺐다 — jobSubcategoryIds 자체는 편집 화면·매칭에서 계속 쓰이니 데이터는 그대로다.
     대시보드 "내 이력서" 행은 아직 칩을 유지한다(별도 판단). */
  return (
    <article className="border border-border bg-white p-6 max-[640px]:p-5">
      {/* 액션이 가로 한 줄이라 좌우 높이 차가 10px뿐이다 — items-center로 제목·버튼 글자 중심을 맞춘다.
          좁은 폭에서는 flex-wrap으로 액션 그룹이 제목 아래로 내려간다(한 줄 고집 금지). */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-[#1c2128]">{resume.title}</h3>
            {resume.isPrimary ? <ResumePrimaryBadge /> : null}
            {/* 완료는 표시하지 않는다 — 목록의 기본 상태라 알릴 것이 없고, 색 텍스트가 카드마다 붙으면
                정작 손봐야 할 "작성 중" 카드가 묻힌다. 미완료일 때만 말한다.
                (퍼센트도 붙이지 않는다 — 선택 항목까지 분모에 넣은 수치라 "지원 가능한가"와 어긋났다.) */}
            {complete ? null : (
              <span className="inline-flex items-center gap-[8px]">
                <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-status-pending-dot" />
                <span className="text-[13px] font-medium text-status-pending">작성 중</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {/* 라벨과 토글은 한 덩이의 컨트롤이라 안쪽 간격만 8px로 좁게 두고, 액션끼리는 12px로 띄운다. */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#8a94a3]">제안 받기</span>
            <ToggleSwitch label={`${resume.title} 제안 받기`} checked={resume.proposalEnabled} onChange={onToggleProposal} />
          </div>
          {/* 주 버튼은 고정폭 슬롯이다 — 첨부형 카드의 "첨부형" 표시가 같은 자리에 오므로
              토글·⋯의 x좌표가 카드마다 어긋나지 않는다. 폭은 대시보드 "내 이력서" 행 CTA와 같은 120px.
              단 640px 아래에서는 액션 줄 폭이 모자라 120px가 카드 밖으로 삐져나온다 — 첨부형 쪽 슬롯과 함께
              모바일에서는 정렬을 포기하고 내용 폭으로 되돌린다.
              문구는 완료·작성 중 구분 없이 "수정하기"로 통일한다(이동 대상은 아래 링크 하나로 동일). */}
          <Link
            href={`/mypage/resume/${resume.id}`}
            className="inline-flex h-9 w-[120px] items-center justify-center border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-medium text-[#44505f] hover:border-[#111111] hover:text-[#111111] max-[640px]:w-auto"
          >
            수정하기
          </Link>
          <ResumeActionsMenu
            label={resume.title}
            isPrimary={resume.isPrimary}
            onSetPrimary={onSetPrimary}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </div>
      </div>

      <p className="mt-3 text-[13px] font-normal text-[#8a94a3]">
        최종 수정 {resume.updatedAt.replaceAll("-", ".")}
        <span className="px-1.5 text-[#d3d9e1]">·</span>
        {complete ? "간편지원 가능" : "작성을 완료하면 간편지원에 사용할 수 있어요"}
      </p>
    </article>
  );
}
