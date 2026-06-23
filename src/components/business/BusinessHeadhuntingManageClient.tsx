"use client";

import { ClipboardList, Plus, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { SectionCard } from "@/components/business/BusinessFormControls";
import {
  candidateStatusClass,
  candidateStatusLabel,
  headhuntingCandidates,
  headhuntingRequests,
  headhuntingStatusClass,
  headhuntingStatusLabel,
} from "@/data/headhunting";

export function BusinessHeadhuntingManageClient() {
  const activeCount = headhuntingRequests.filter((request) => request.status !== "completed" && request.status !== "on_hold").length;
  const totalCandidates = headhuntingCandidates.length;
  const hiredCount = headhuntingCandidates.filter((candidate) => candidate.status === "hired").length;
  const requestTitleById = new Map(headhuntingRequests.map((request) => [request.id, request.positionTitle]));

  const summaryStats = [
    { label: "진행 중인 의뢰", value: `${activeCount}건`, icon: ClipboardList },
    { label: "추천 후보자", value: `${totalCandidates}명`, icon: Users },
    { label: "입사 확정", value: `${hiredCount}명`, icon: UserCheck },
  ];

  return (
    <BusinessCenterShell>
      <div>
        <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
          <div>
            <PageBreadcrumb items={[{ label: "기업센터", href: "/business/dashboard" }, { label: "헤드헌팅" }, { label: "헤드헌팅 관리" }]} />
            <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">헤드헌팅 관리</h1>
            <p className="mt-2 text-[13px] font-normal text-[#68717e]">진행 중인 헤드헌팅 의뢰와 추천 후보자 현황을 확인합니다.</p>
          </div>
          <Link
            href="/business/headhunting/manage/new"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-[#111111] px-5 text-[13px] font-medium text-white transition hover:bg-[#2a2a2a] max-[760px]:w-full"
          >
            <Plus size={15} />
            새 헤드헌팅 의뢰
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 max-[760px]:grid-cols-1">
          {summaryStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 border border-[#dfe4ea] bg-white p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#dfe4ea] bg-[#f7f8fa] text-[#46505f]">
                <stat.icon size={18} />
              </span>
              <div>
                <p className="text-[12px] font-normal text-[#8a94a3]">{stat.label}</p>
                <p className="mt-0.5 text-[19px] font-bold tracking-[-0.02em] text-[#17202c]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-5">
          <SectionCard title="의뢰 목록" description="등록한 헤드헌팅 의뢰의 진행 상태입니다.">
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[minmax(0,1fr)_140px_130px_70px_100px_100px] gap-3 border-b border-[#e5e9ef] px-2 pb-3 text-[12px] font-medium text-[#8a94a3]">
                  <span>포지션</span>
                  <span>직무 분야</span>
                  <span>상태</span>
                  <span>인원</span>
                  <span>추천 후보자</span>
                  <span>신청일</span>
                </div>
                <div className="divide-y divide-[#e5e9ef]">
                  {headhuntingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="grid grid-cols-[minmax(0,1fr)_140px_130px_70px_100px_100px] items-center gap-3 px-2 py-4 text-[13px]"
                    >
                      <span className="font-medium text-[#17202c]">{request.positionTitle}</span>
                      <span className="font-normal text-[#596373]">{request.jobCategory}</span>
                      <span className={`inline-flex h-7 w-fit items-center justify-center border px-2 text-[11px] font-medium ${headhuntingStatusClass(request.status)}`}>
                        {headhuntingStatusLabel(request.status)}
                      </span>
                      <span className="font-normal text-[#303946]">{request.headcount}명</span>
                      <span className="font-normal text-[#303946]">{request.recommendedCandidateCount}명</span>
                      <span className="font-normal text-[#8a94a3]">{request.requestedAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="추천 후보자 현황" description="의뢰별로 추천된 후보자의 진행 상태입니다.">
            <div className="divide-y divide-[#e5e9ef] border border-[#dfe4ea]">
              {headhuntingCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="grid grid-cols-[110px_minmax(0,1fr)_180px_110px_100px] items-center gap-4 px-4 py-4 max-[760px]:grid-cols-1 max-[760px]:gap-2"
                >
                  <p className="text-[13px] font-medium text-[#303946]">{candidate.code}</p>
                  <p className="text-[13px] font-normal text-[#68717e]">{candidate.experienceSummary}</p>
                  <p className="text-[12px] font-normal text-[#8a94a3]">{requestTitleById.get(candidate.matchedRequestId)}</p>
                  <span className={`inline-flex h-7 w-fit items-center justify-center border px-2 text-[11px] font-medium ${candidateStatusClass(candidate.status)}`}>
                    {candidateStatusLabel(candidate.status)}
                  </span>
                  <p className="text-[12px] font-normal text-[#8a94a3]">{candidate.recommendedAt}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </BusinessCenterShell>
  );
}
