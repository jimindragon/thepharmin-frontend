"use client";

import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { FLUSH_LIST_CLASS } from "@/components/flushListStyles";
import { ApplicationStepper } from "@/components/ui/ApplicationStepper";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { Button, LinkButton } from "@/components/ui/Button";
import { companyLogos } from "@/config/companyImages";
import { sharedRoutes } from "@/config/routes";
import { mockApplications, type JobApplication } from "@/data/mockApplications";

type TabId = "all" | "active" | "closed";

function getStatusDetail(application: JobApplication): string | undefined {
  if (application.isClosed) {
    return application.resultDate ? `결과 발표일 ${application.resultDate}` : undefined;
  }
  if (application.applyChannel === "external") {
    return application.deadlineDate ? `마감 ${application.deadlineDate}` : undefined;
  }
  if (application.currentStage === "screening" && application.expectedDate) {
    return `서류 발표 예정일 ${application.expectedDate}`;
  }
  if (application.currentStage === "interview" && application.expectedDate) {
    return `면접일 ${application.expectedDate}`;
  }
  return undefined;
}

function ApplicationCard({ application }: { application: JobApplication }) {
  const isQuick = application.applyChannel === "quick";
  const statusDetail = getStatusDetail(application);
  const statusText = application.isClosed && application.resultLabel ? application.resultLabel : application.statusLabel;

  // 회사명은 이 체인에서 빠져 제목 아래 독립 줄이 됐다 — 남은 것은 부가 정보뿐이다.
  const metaItems: { label?: string; value: string }[] = [
    application.resumeUsed ? { label: "사용 이력서", value: application.resumeUsed } : null,
    { label: "지원", value: application.appliedDate },
    !isQuick ? { value: "외부 지원" } : null,
  ].filter((item): item is { label?: string; value: string } => item !== null);

  return (
    // ≤760px 풀블리드 목록의 낱장 — 카드 사이 선은 목록 컨테이너의 divide-y가 그린다.
    // 화면 끝에 닿은 세로선은 테두리가 아니라 잘린 자국으로 읽히므로 그 폭에서는 테두리를 두지 않는다.
    <article className="bg-white min-[761px]:border min-[761px]:border-border">
      {/* 상단 층: 공고 정보 + 상태 */}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-6 pt-6 pb-4">
        {/* 좌측: 로고 + 공고 정보.
            flex-1(basis 0%)이라 상태 칸이 들어갈 자리를 항상 내준다 — 종전 basis-[260px]은
            데이터가 짧아도 260px을 요구해서, 상태 칸 폭(58~118px)이 카드마다 다른 만큼
            줄이 깨지는 지점도 카드마다 달랐다. */}
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {/* ≤640px에서 로고 칸을 숨긴다. 640px은 디자인 브레이크포인트가 아니라 로고가 빠지는
              콘텐츠 브레이크포인트다. JobCard(≤480px)와 숫자가 다른 것은 규칙 복제가 아니라,
              이 카드의 정보 밀도가 높아 동일한 모바일 위계를 더 일찍 적용한 것이다.
              회사명이 제목 아래 텍스트로 서 있어 로고가 빠져도 식별이 끊기지 않는다.
              items-start(부모): 종전 items-center는 로고를 텍스트 스택 높이의 중앙에 띄워
              스택 줄 수에 따라 카드마다 로고 top이 달라졌다(390px 실측 46~72px). */}
          <EntityLogo
            name={application.company}
            logoUrl={companyLogos[application.company]}
            size={48}
            className="max-[640px]:hidden"
          />
          <div className="min-w-0 flex-1">
            {/* 배지가 제목 앞에 선다 — 뒤에 두면 flex-wrap 안에서 제목 길이에 따라 같은 줄/다음 줄이
                갈렸다(390px에서 카드 0만 같은 줄). 앞에 두면 위치가 데이터 길이와 무관하다.
                truncate(white-space:nowrap)와 line-clamp(display:-webkit-box)는 서로 충돌하므로
                겹치지 않게 브레이크포인트로 완전히 분리한다. */}
            <div className="flex min-w-0 items-center gap-2 max-[640px]:items-start">
              <span className="shrink-0 border border-border bg-white px-2 py-0.5 text-[13px] font-medium text-[#596373]">
                {application.applyChannelLabel}
              </span>
              {application.jobHref ? (
                <Link
                  href={application.jobHref}
                  className="min-w-0 text-[17px] font-bold tracking-[-0.01em] text-[#17202c] hover:underline min-[641px]:truncate max-[640px]:line-clamp-2"
                >
                  {application.jobTitle}
                </Link>
              ) : (
                <p className="min-w-0 text-[17px] font-bold tracking-[-0.01em] text-[#17202c] min-[641px]:truncate max-[640px]:line-clamp-2">
                  {application.jobTitle}
                </p>
              )}
            </div>

            {/* 회사명은 메타 체인에서 빠져 제목 바로 아래 독립 줄이 된다 — 로고가 없는 ≤640px에서
                주체를 식별하는 것이 이 줄이므로, 부가 정보와 같은 줄에서 경쟁시키지 않는다. */}
            <p className="mt-1.5 truncate text-[13px] font-medium text-[#5b6472]">{application.company}</p>

            {/* 메타는 flex 항목 나열이 아니라 하나의 텍스트 흐름이다. 구분자는 앞 항목과 같은
                nowrap 덩어리 안에 꼬리로 붙는다 — 종전 1px 막대 span은 항목 래퍼(display:flex) 안
                머리에 있어서 항목이 다음 줄로 내려갈 때 구분자가 줄 머리에 앉았다(390px 실측).
                꼬리로 붙이면 구조적으로 줄 끝에만 설 수 있다. */}
            <p className="mt-1.5 text-[13px] font-normal text-[#4b5563]">
              {metaItems.map((item, index) => (
                <span key={index} className="whitespace-nowrap">
                  {item.label ? <span className="text-[#9ca3af]">{item.label} </span> : null}
                  {item.value}
                  {index < metaItems.length - 1 ? <span className="px-1.5 text-[#c2c8d1]">·</span> : null}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* 우측: 상태.
            ≤640px basis-full이 이 겹에 자기 줄을 확정해 주고, 그 줄 안에서 양끝 정렬이
            [상태 텍스트 ↔ 보조 날짜]를 잡는다. 종전에는 자연 줄바꿈으로 내려간 뒤 겹 폭이
            콘텐츠 폭이라 items-end가 무력화돼 카드 왼쪽에 좌측 정렬로 붙었다.
            줄이 갈리는 시점을 데이터(상태 문자열 폭)가 아니라 폭 하나가 정하게 만드는 것이 요점이다.
            렌더 조건 분기(getStatusDetail·점 유무·색)는 손대지 않는다 — 배치만 바뀐다. */}
        <div className="flex shrink-0 flex-col items-end gap-2 max-[640px]:basis-full max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-between">
          <p
            className={clsx(
              "inline-flex items-center gap-[8px] text-[15px] font-semibold tracking-[-0.01em]",
              application.isClosed && application.resultLabel ? "text-status-error" : "text-[#111111]",
            )}
          >
            {application.isClosed && application.resultLabel ? (
              <span className="h-[8px] w-[8px] rounded-full shrink-0 bg-status-error-dot" />
            ) : null}
            {statusText}
          </p>
          {statusDetail ? <p className="text-[13px] font-normal text-[#8a94a3]">{statusDetail}</p> : null}
        </div>
      </div>

      {/* 하단 층: 진행 상태 + 액션 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#eef1f4] px-6 pt-4 pb-5">
        {isQuick ? (
          <div className="max-w-[520px] min-w-[280px] flex-1">
            <ApplicationStepper currentStage={application.currentStage} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-status-neutral-dot" />
            <span className="text-[13px] text-[#6b7280]">
              {application.isClosed ? "전형이 종료되었습니다" : "전형 상태는 기업에서 관리됩니다"}
            </span>
          </div>
        )}
        <div className="flex justify-end gap-2">
          {!isQuick ? (
            <Button type="button" variant="secondary" size="sm">
              결과 직접 입력
            </Button>
          ) : null}
          {application.jobHref ? (
            <LinkButton href={application.jobHref} variant="secondary" size="sm">
              공고 보기
            </LinkButton>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function MyPageApplicationsClient() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const counts = useMemo(
    () => ({
      all: mockApplications.length,
      active: mockApplications.filter((application) => !application.isClosed).length,
      closed: mockApplications.filter((application) => application.isClosed).length,
    }),
    [],
  );

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "all", label: "전체", count: counts.all },
    { id: "active", label: "진행중", count: counts.active },
    { id: "closed", label: "종료", count: counts.closed },
  ];

  const visibleApplications = useMemo(() => {
    if (activeTab === "active") return mockApplications.filter((application) => !application.isClosed);
    if (activeTab === "closed") return mockApplications.filter((application) => application.isClosed);
    return mockApplications;
  }, [activeTab]);

  return (
    <MyPageShell>
      <PageBreadcrumb keepOnMobile items={[{ label: "마이페이지" }, { label: "지원 현황" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">지원 현황</h1>
      <p className="mt-2.5 text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        지원완료부터 최종 결과까지 진행 상황을 확인합니다. 간편지원은 전형 단계를 실시간으로, 외부 지원은 기업이 관리하는 일정 기준으로 보여드립니다.
      </p>

      <div className="mt-7 flex items-center gap-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "relative flex items-center gap-1.5 pb-3 text-[15px] font-medium transition-colors",
              activeTab === tab.id
                ? "text-[#111111] after:absolute after:-bottom-px after:left-0 after:h-[2px] after:w-full after:bg-[#111111]"
                : "text-[#8a94a3] hover:text-[#111111]",
            )}
          >
            {tab.label}
            <span className={clsx("text-[13px]", activeTab === tab.id ? "font-bold text-[#111111]" : "font-normal text-[#a0a9b7]")}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        {visibleApplications.length > 0 ? (
          /* 스크랩·최근 본 공고와 같은 풀블리드 문법(FLUSH_LIST_CLASS + 카드의 ≤760px 테두리 제거).
             min-[761px]:gap-4는 종전 space-y-4를 데스크톱에서 그대로 지키기 위한 것 —
             FLUSH_LIST_CLASS의 기본 gap-3(12px)을 변형 없이 덮으면 어느 쪽이 이길지가 Tailwind
             출력 순서에 달리므로, 변형 붙은 유틸리티로 승부를 확정한다(ThemeHubClient와 같은 이유). */
          <div className={clsx(FLUSH_LIST_CLASS, "min-[761px]:gap-4")}>
            {visibleApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        ) : (
          <div className="border border-border bg-white p-10 text-center">
            <p className="text-[15px] font-medium text-[#303946]">해당하는 지원 내역이 없습니다.</p>
            <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">관심 있는 공고에 지원하면 이곳에서 진행 상황을 확인할 수 있습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-border bg-white px-5 py-4">
        <p className="flex items-center gap-2 text-[13px] font-normal text-[#68717e]">
          <span aria-hidden="true" className="text-[13px] text-[#9aa3af]">
            ⓘ
          </span>
          지원한 공고가 보이지 않나요? 다른 계정으로 지원했거나, 삭제된 공고일 수 있습니다.
        </p>
        <Link href={sharedRoutes.support} className="shrink-0 text-[13px] font-medium text-[#111111] hover:underline">
          문의하기
        </Link>
      </div>
    </MyPageShell>
  );
}
