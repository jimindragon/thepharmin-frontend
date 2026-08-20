"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Lock } from "lucide-react";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
import { Button } from "@/components/ui/Button";
import { searchPharmacyRegistry, type PharmacyRegistryEntry } from "@/data/pharmacyRegistry";

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
 * 약국을 고르는 방법은 전국 약국 등록부 검색이다(pharmacyRegistry). 사이트에 등록된 약국만
 * 늘어놓던 select였을 때는, 아직 사이트에 없는 약국의 약사가 자기 약국을 찾을 길이 없었다 —
 * 실서비스가 심평원 공공데이터로 전국 약국을 조회하는 전제와 어긋난다.
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

const SEARCH_PLACEHOLDER = "약국명 또는 지역으로 검색";
const SEARCH_EMPTY_MESSAGE = "검색 결과가 없습니다. 약국명을 다시 확인해 주세요.";
const SEARCH_EMPTY_HINT = "찾는 약국이 없다면 고객센터로 문의해 주세요.";

export function PharmacyClaimGate() {
  const [step, setStep] = useState<ClaimStep>("intro");
  const [keyword, setKeyword] = useState("");
  /** null은 "아직 검색하지 않음"이다 — 빈 배열(결과 없음)과 달라 안내를 띄우지 않는다. */
  const [results, setResults] = useState<PharmacyRegistryEntry[] | null>(null);
  const [selected, setSelected] = useState<PharmacyRegistryEntry | null>(null);
  const [businessNumber, setBusinessNumber] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 새로 검색하면 고른 약국을 놓는다 — 결과 목록에 없는 약국이 선택된 채로 남으면
   * 화면에 보이지 않는 값으로 신청 버튼이 열린다.
   */
  const runSearch = () => {
    setResults(searchPharmacyRegistry(keyword));
    setSelected(null);
  };

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
        <div>
          <FieldLabel>약국 검색</FieldLabel>
          {/* form으로 감싸 Enter로도 검색되게 한다 — 검색창에서 Enter가 아무것도 하지 않으면 고장으로 읽힌다.
              바깥에 다른 form이 없어 중첩되지 않는다(이 화면의 제출은 아래 버튼이 직접 한다). */}
          <form
            className="mt-1.5 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch();
            }}
          >
            <div className="min-w-0 flex-1">
              <TextInput value={keyword} onChange={setKeyword} placeholder={SEARCH_PLACEHOLDER} />
            </div>
            <Button type="submit" variant="secondary" disabled={!keyword.trim()} className="shrink-0">
              검색
            </Button>
          </form>

          {results === null ? null : results.length ? (
            <div className="mt-3">
              <p className="text-[13px] font-normal text-[#8a95a5]">검색 결과 {results.length}곳</p>
              {/* 21곳이 다 걸리는 검색어("약국")도 있어 목록만 스크롤을 진다 — 패널 전체가 늘어나면
                  390px에서 아래 필드가 화면 밖으로 밀린다 */}
              <div className="mt-2 grid max-h-[320px] gap-2 overflow-y-auto">
                {results.map((pharmacy) => (
                  <label
                    key={pharmacy.id}
                    className={clsx(
                      "flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors",
                      selected?.id === pharmacy.id ? "border-[#111111] bg-[#f7f8fa]" : "border-[#dfe4ea] bg-white hover:border-[#b0bac6]",
                    )}
                  >
                    {/* mt-0.5 — 두 줄짜리 행이라 라디오를 첫 줄(약국명)의 광학 중심에 맞춘다 */}
                    <input
                      type="radio"
                      name="pharmacy-claim-target"
                      value={pharmacy.id}
                      checked={selected?.id === pharmacy.id}
                      onChange={() => setSelected(pharmacy)}
                      className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#111111]"
                    />
                    <span className="min-w-0">
                      <span className="block text-[16px] font-semibold leading-[1.4] text-[#17202c]">{pharmacy.name}</span>
                      <span className="mt-1 block text-[13px] font-normal leading-[1.6] text-[#8a95a5]">
                        {pharmacy.address} · {pharmacy.phone}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3 border border-dashed border-[#d8e0e8] bg-[#fbfcfd] px-5 py-6 text-center">
              <p className="text-[14px] font-medium leading-[1.6] text-[#303946]">{SEARCH_EMPTY_MESSAGE}</p>
              <p className="mt-1.5 text-[13px] font-normal leading-[1.6] text-[#8a95a5]">{SEARCH_EMPTY_HINT}</p>
            </div>
          )}
        </div>

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
