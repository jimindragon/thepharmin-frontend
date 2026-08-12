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

  // 회사명은 이 체인에서 빠져 제목 위 독립 줄이고, 지원방법은 배지로 이 줄의 머리에 선다.
  // "외부 지원"은 그 배지("홈페이지 지원")와 같은 말이라 텍스트로 한 번 더 쓰지 않는다
  // — applyChannel 자체는 아래 분기들이 그대로 쓴다(데이터·타입 무변경).
  const metaItems: { label: string; value: string }[] = [
    application.resumeUsed ? { label: "사용 이력서", value: application.resumeUsed } : null,
    { label: "지원", value: application.appliedDate },
  ].filter((item): item is { label: string; value: string } => item !== null);

  // ≤640px 버튼 풀폭 전환은 개수에 따라 문법이 갈린다(하나면 w-full, 둘이면 2열 그리드).
  const showResultInput = !isQuick && !application.isClosed;
  const actionCount = (showResultInput ? 1 : 0) + (application.jobHref ? 1 : 0);

  return (
    // ≤760px 풀블리드 목록의 낱장 — 카드 사이 선은 목록 컨테이너의 divide-y가 그린다.
    // 화면 끝에 닿은 세로선은 테두리가 아니라 잘린 자국으로 읽히므로 그 폭에서는 테두리를 두지 않는다.
    <article className="bg-white min-[761px]:border min-[761px]:border-border">
      {/* 상단 층: 공고 정보. 상태는 구분선 아래로 내려가 여기는 회사명·제목·메타 3층만 남는다. */}
      <div className="flex items-start gap-4 px-6 pt-6 pb-4">
        {/* ≤640px에서 로고 칸을 숨긴다. 640px은 디자인 브레이크포인트가 아니라 로고가 빠지는
            콘텐츠 브레이크포인트다. JobCard(≤480px)와 숫자가 다른 것은 규칙 복제가 아니라,
            이 카드의 정보 밀도가 높아 동일한 모바일 위계를 더 일찍 적용한 것이다.
            회사명이 제목 위에 텍스트로 서 있어 로고가 빠져도 식별이 끊기지 않는다.
            items-start(부모): 종전 items-center는 로고를 텍스트 스택 높이의 중앙에 띄워
            스택 줄 수에 따라 카드마다 로고 top이 달라졌다(390px 실측 46~72px). */}
        <EntityLogo
          name={application.company}
          logoUrl={companyLogos[application.company]}
          size={48}
          className="max-[640px]:hidden"
        />
        <div className="min-w-0 flex-1">
          {/* 회사명이 제목 위에 선다 — JobCard와 같은 위계다. 로고가 빠지는 ≤640px에서 카드 첫 줄이
              곧 주체 식별이 되고, 그 아래로 제목·부가 정보가 한 방향으로 내려간다. */}
          <p className="truncate text-[13px] font-medium text-[#5b6472]">{application.company}</p>

          {/* 제목이 줄을 통째로 쓴다 — 배지가 메타로 내려가면서 같은 줄에서 폭을 다툴 상대가 없다.
              truncate(white-space:nowrap)와 line-clamp(display:-webkit-box)는 서로 충돌하므로
              겹치지 않게 브레이크포인트로 완전히 분리한다.
              Link 쪽 block: 인라인 요소에는 truncate가 걸리지 않는다(종전에는 flex 항목이라
              자동으로 블록화됐지만 이제는 일반 흐름이다). */}
          {application.jobHref ? (
            <Link
              href={application.jobHref}
              className="mt-1.5 block text-[17px] font-bold tracking-[-0.01em] text-[#17202c] hover:underline min-[641px]:truncate max-[640px]:line-clamp-2"
            >
              {application.jobTitle}
            </Link>
          ) : (
            <p className="mt-1.5 text-[17px] font-bold tracking-[-0.01em] text-[#17202c] min-[641px]:truncate max-[640px]:line-clamp-2">
              {application.jobTitle}
            </p>
          )}

          {/* 메타. 구분자는 앞 항목과 같은 nowrap 덩어리 안에 꼬리로 붙는다 — 머리에 두면 항목이
              다음 줄로 내려갈 때 구분자가 줄 머리에 앉는다(종전 1px 막대 span의 실패). 꼬리로
              붙이면 구조적으로 줄 끝에만 설 수 있다.
              텍스트 흐름이 아니라 flex인 것은 첫 항목이 칩이기 때문이다 — 흐름에 그냥 흘리면
              베이스라인 정렬이라 칩이 텍스트보다 아래로 처진다. items-center로 세로 중앙을 잡는다.
              항목 자체가 nowrap 덩어리라 flex여도 줄바꿈 단위는 텍스트 흐름일 때와 같다. */}
          <div className="mt-1.5 flex flex-wrap items-center gap-y-1 text-[13px] font-normal text-[#4b5563]">
            {/* 배지 뒤에는 구분자를 두지 않는다 — 테두리가 이미 자기 경계를 그어서, 점을 하나 더
                찍으면 경계가 두 겹이 된다. 대신 mr-2로 간격만 준다(글자끼리인 · 자리 12px보다
                좁은 8px — 칩은 테두리 바깥 여백이 더 있어 보이므로 같은 값을 쓰면 벌어져 보인다). */}
            <span className="mr-2 border border-border bg-white px-2 py-0.5 text-[13px] font-medium text-[#596373]">
              {application.applyChannelLabel}
            </span>
            {metaItems.map((item, index) => (
              <span key={index} className="whitespace-nowrap">
                <span className="text-[#9ca3af]">{item.label} </span>
                {item.value}
                {index < metaItems.length - 1 ? <span className="px-1.5 text-[#c2c8d1]">·</span> : null}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 층: 상태 → 진행 상태(진행 바·문구) → 액션 */}
      <div className="border-t border-[#eef1f4] px-6 pt-4 pb-5">
        {/* 상태 줄. 상단 우측 열에서 여기로 내려왔다 — 폭에 따라 오른쪽 열/독립 행으로 갈리던 것이
            전 폭 같은 한 줄이 되고, "지금 어느 단계인가"를 말하는 것들(상태·진행 바·문구)이
            구분선 아래 한 층에 모인다.
            렌더 조건 분기(getStatusDetail·점 유무·색)는 손대지 않는다 — 배치만 바뀐다. */}
        <div className="flex items-center justify-between gap-2">
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

        {/* ≤640px는 flex-col로 두 행을 명시적으로 가른다 — 종전 flex-wrap은 진행 바/문구와 버튼의
            폭 합이 넘칠 때만 갈라져서, 깨지는 지점이 카드마다 달랐고(480px에서 카드 2만 2행)
            갈라진 뒤에는 버튼 겹이 콘텐츠 폭이라 justify-end가 무력화돼 좌측에 몰렸다.
            >640px는 wrap 없는 한 줄이다 — 넘칠 때 조용히 같은 상태로 되돌아가지 않게 flex-wrap을 뺀다.
            상태 줄과의 간격은 진행 바 쪽에는 주지 않는다 — ApplicationStepper가 mt-5를 갖고 있어
            이미 자기 몫을 벌어 둔다. 문구 쪽에만 mt-3으로 같은 리듬을 맞춘다. */}
        <div
          className={clsx(
            "flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-3",
            !isQuick && "mt-3",
          )}
        >
          {isQuick ? (
            /* ≤640px: 행이 세로로 서므로 flex-1(basis 0%)은 높이를 0으로 접는다 — flex-none으로 되돌린다.
               min-w-[280px]도 함께 푼다. 진행 바의 좁은 폭 대응은 ApplicationStepper(캘린더와 공유)를
               건드리지 않고 호출부의 폭 제약만으로 처리한다는 뜻이다. 360px 풀블리드 기준
               실가용폭은 360-48=312px이라 4칸 그리드가 그대로 들어간다. */
            <div className="max-w-[520px] min-w-[280px] flex-1 max-[640px]:max-w-none max-[640px]:min-w-0 max-[640px]:flex-none">
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
          {/* ≤640px 버튼은 줄 전체를 쓴다 — 손가락으로 누르는 폭에서 오른쪽 끝에 붙은 소형 버튼은
              한 손 조작에서 가장 먼 자리다. 개수에 따라 문법이 갈린다.
                하나  — 겹은 items-stretch가 이미 줄 폭으로 늘려 두므로 버튼에 w-full만 걸면 된다.
                둘    — 2열 그리드로 폭을 반씩 나눈다. flex + w-full로는 둘 다 100%를 요구해 어긋난다.
              w-full은 두 경우에 같은 클래스로 둔다 — 그리드 칸에서는 stretch가 이미 같은 결과라
              개수 분기를 겹 쪽 한 곳(grid-cols-2)으로만 몰 수 있다.
              >640px는 종전대로 오른쪽 끝에 선 소형 버튼이다. */}
          <div
            className={clsx(
              "flex shrink-0 justify-end gap-2",
              actionCount === 2 && "max-[640px]:grid max-[640px]:grid-cols-2",
            )}
          >
            {/* 종료된 지원 건에는 입력할 결과가 이미 확정돼 있다. 종전 분기가 !isQuick 하나뿐이라
                종료 카드에도 버튼이 남아 있었다. */}
            {showResultInput ? (
              <Button type="button" variant="secondary" size="sm" className="max-[640px]:w-full">
                결과 직접 입력
              </Button>
            ) : null}
            {application.jobHref ? (
              <LinkButton href={application.jobHref} variant="secondary" size="sm" className="max-[640px]:w-full">
                공고 보기
              </LinkButton>
            ) : null}
          </div>
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

      {/* ≤640px에서는 안내 행이 [질문 + 설명 + 버튼]으로 세 줄까지 늘어난다. 설명 문장을 접고
          문의하기를 같은 문장 안의 인라인 링크로 끌어와 한 줄로 줄인다 —
          "지원한 공고가 보이지 않나요? 문의하기".
          겹을 block으로, 문단을 inline으로 접으면 문단과 링크가 한 텍스트 흐름이 된다. 링크를
          모바일용으로 하나 더 두지 않는 이유가 이것이다 — href가 두 군데로 갈리면 나중에 어긋난다.
          한 줄에 안 들어가면 "문의하기"만 다음 줄로 내려간다(nowrap을 걸지 않는다).
          display 유틸리티가 둘씩이지만 승부가 출력 순서에 달리지 않는다 —
          변형 없는 flex < 변형 붙은 max-[640px]:block/inline으로 확정된다.
          >640px는 한 클래스도 적용되지 않아 종전 그대로다(설명 문장·버튼 마크업은 그대로 남는다). */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-border bg-white px-5 py-4 max-[640px]:block">
        <p className="flex items-center gap-2 text-[13px] font-normal text-[#68717e] max-[640px]:inline">
          {/* ≤640px에서 문단이 inline이 되면 gap-2가 사라지므로 아이콘이 직접 여백을 갖는다. */}
          <span aria-hidden="true" className="text-[13px] text-[#9aa3af] max-[640px]:mr-2">
            ⓘ
          </span>
          {/* 문장 전체가 한 겹 안에 있어야 >640px에서 문단의 flex 항목이 [아이콘 · 문장] 둘로
              유지된다 — 문장을 쪼개 문단의 직계로 두면 gap-2가 문장 한가운데에 8px을 넣는다. */}
          <span>
            지원한 공고가 보이지 않나요?{" "}
            <span className="max-[640px]:hidden">다른 계정으로 지원했거나, 삭제된 공고일 수 있습니다.</span>
          </span>
        </p>
        {/* ≤640px 밑줄: 문장 안에 섞여 흐르므로 굵기·색만으로는 링크인지 문장 일부인지 갈리지 않는다.
            브랜드 그린을 쓰지 않는 것은 이 화면 전체가 모노크롬이기 때문이다. */}
        <Link
          href={sharedRoutes.support}
          className="shrink-0 text-[13px] font-medium text-[#111111] hover:underline max-[640px]:ml-1 max-[640px]:underline"
        >
          문의하기
        </Link>
      </div>
    </MyPageShell>
  );
}
