"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Lock } from "lucide-react";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
import { PharmacyRegistrySearch } from "@/components/business/PharmacyRegistrySearch";
import { Button } from "@/components/ui/Button";
import type { PharmacyRegistryEntry } from "@/data/pharmacyRegistry";

/**
 * 약국 인증(claim) 게이트. 계정이 아직 어느 약국의 주인인지 잇지 않았을 때 후기 관리 자리에 대신 선다.
 *
 * 기업 인증 게이트(ApprovalGatePanel)와 문법은 같지만 갈 곳이 다르다 — 그쪽은 이미 낸 서류를 기다리는
 * 중이라 "상태 확인하기"로 보내고, 이쪽은 아직 아무것도 시작하지 않아 신청 자체를 여기서 받는다.
 * 그래서 화면을 옮기지 않고 같은 자리에서 단계만 바꾼다(안내 → 신청 → 접수 완료).
 *
 * **기본 흐름은 기업 가입 시 약국 선택·인증으로 통합될 예정이고, 이 화면은 가입 후 별도로 인증하는
 * 예외 경로다.** 가입 때 건너뛰었거나 계정이 아직 어느 약국에도 묶이지 않은 경우가 여기로 온다 —
 * 그래서 안내에도 "가입 시 이미 인증했다면 필요 없다"는 줄이 함께 선다.
 *
 * 약국을 고르는 방법은 전국 약국 등록부 검색이다(PharmacyRegistrySearch). 사이트에 등록된 약국만
 * 늘어놓던 select였을 때는, 아직 사이트에 없는 약국의 약사가 자기 약국을 찾을 길이 없었다 —
 * 실서비스가 심평원 공공데이터로 전국 약국을 조회하는 전제와 어긋난다.
 *
 * 검색 블록 자체는 가입 STEP1과 공유한다 — 이 화면이 가입의 예외 경로인 이상, 두 곳이 같은 등록부를
 * 같은 규칙으로 뒤져야 한다.
 *
 * 전부 목업이다. 사업자등록번호도 첨부 파일도 검증하지 않고, 접수는 마지막 단계 문구로만 표현된다.
 */

type ClaimStep = "intro" | "form" | "done";

const GATE_TITLE = "약국 인증이 필요합니다";
const GATE_DESCRIPTION =
  "우리 약국을 인증하면 재직 후기 확인, 공식 답변 작성, 채용공고 등록 기능을 무료로 이용할 수 있습니다.";
const DONE_NOTICE = "인증 신청이 접수되었습니다. 영업일 기준 1~2일 내 검토 결과를 알려드립니다.";
/** 가입 흐름에 통합될 예정이라, 이 화면에 잘못 들어온 사람을 여기서 돌려세운다 */
const GATE_SIGNUP_NOTE = "가입 시 약국 인증을 완료했다면 이 절차는 필요하지 않습니다.";

export function PharmacyClaimGate() {
  const [step, setStep] = useState<ClaimStep>("intro");
  const [selected, setSelected] = useState<PharmacyRegistryEntry | null>(null);
  const [businessNumber, setBusinessNumber] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = Boolean(selected && businessNumber.trim() && applicantName.trim() && applicantPhone.trim());

  if (step === "done") {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
        <CheckCircle2 size={20} className="text-[#6b7280]" />
        <h2 className="mt-4 text-[17px] font-bold text-[#17202c]">인증 신청 접수</h2>
        <p className="mt-2 max-w-[520px] text-[15px] font-normal leading-[1.7] text-[#68717e]">{DONE_NOTICE}</p>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
        <Lock size={20} className="text-[#6b7280]" />
        <h2 className="mt-4 text-[17px] font-bold text-[#17202c]">{GATE_TITLE}</h2>
        <p className="mt-2 max-w-[520px] text-[15px] font-normal leading-[1.7] text-[#68717e]">{GATE_DESCRIPTION}</p>
        {/* 본문보다 한 단 낮은 13px 회색 — 대부분에게는 해당하지 않는 단서라 안내를 밀어내지 않는다 */}
        <p className="mt-2.5 max-w-[520px] text-[13px] font-normal leading-[1.7] text-[#8a95a5]">{GATE_SIGNUP_NOTE}</p>
        <div className="mt-7">
          <Button type="button" variant="primary" onClick={() => setStep("form")}>
            약국 인증 신청
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[560px] py-4">
      <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#17202c]">약국 인증 신청</h2>
      <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">{GATE_DESCRIPTION}</p>

      <div className="mt-7 grid gap-5 border border-border bg-white p-6 max-[760px]:p-4">
        <PharmacyRegistrySearch value={selected} onChange={setSelected} />

        <div>
          <FieldLabel>사업자등록번호</FieldLabel>
          <div className="mt-1.5">
            <TextInput value={businessNumber} onChange={setBusinessNumber} placeholder="000-00-00000" />
          </div>
        </div>

        <div>
          <FieldLabel>약국 개설등록증</FieldLabel>
          {/* 실제 업로드는 없다 — 고른 파일의 이름만 들고 있는다(AttachmentUploader와 같은 목업 방식) */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
            />
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              파일 선택
            </Button>
            <span className={clsx("text-[13px] font-normal", fileName ? "text-[#3f4855]" : "text-[#9aa3af]")}>
              {fileName ?? "선택된 파일 없음"}
            </span>
          </div>
        </div>

        <div className="border-t border-[#edf1f5] pt-5">
          <p className="text-[14px] font-medium text-[#2f3845]">신청자 확인</p>
          <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-[18px] max-[640px]:grid-cols-1">
            <div>
              <FieldLabel>이름</FieldLabel>
              <div className="mt-1.5">
                <TextInput value={applicantName} onChange={setApplicantName} placeholder="예: 김약사" />
              </div>
            </div>
            <div>
              <FieldLabel>연락처</FieldLabel>
              <div className="mt-1.5">
                <TextInput value={applicantPhone} onChange={setApplicantPhone} placeholder="010-0000-0000" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => setStep("intro")}>
          취소
        </Button>
        <Button type="button" variant="primary" disabled={!canSubmit} onClick={() => setStep("done")}>
          인증 신청하기
        </Button>
      </div>
    </div>
  );
}
