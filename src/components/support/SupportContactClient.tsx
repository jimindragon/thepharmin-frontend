"use client";

import clsx from "clsx";
import { ChevronDown, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Button, LinkButton } from "@/components/ui/Button";

type MemberType = "personal" | "business";

const memberTypeOptions: { id: MemberType; label: string }[] = [
  { id: "personal", label: "개인회원 (구직)" },
  { id: "business", label: "기업회원 (채용담당)" },
];

const inquiryTypesByMember: Record<MemberType, string[]> = {
  personal: ["이력서 · 지원", "저장한 공고 · 알림", "계정 · 로그인", "기타 문의"],
  business: ["공고 등록 · 관리", "헤드헌팅", "결제 · 이용권", "기업정보 관리", "계정 · 로그인", "기타 문의"],
};

function FieldGroup({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="mt-6">
      <label className="text-[14px] font-medium text-[#2f3845]">
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
        {hint ? <span className="ml-1.5 text-[13px] font-normal text-[#8a94a3]">{hint}</span> : null}
      </label>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

const inputClassName =
  "h-12 w-full border border-[#d8e0e8] bg-white px-4 text-[14px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] focus:border-[#111111]";

export function SupportContactClient() {
  const router = useRouter();
  const [memberType, setMemberType] = useState<MemberType>("personal");
  const [inquiryType, setInquiryType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = inquiryType.length > 0 && email.trim().length > 0 && title.trim().length > 0 && content.trim().length > 0 && agreed;

  const handleMemberTypeChange = (next: MemberType) => {
    setMemberType(next);
    setInquiryType("");
  };

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main className="bg-[#f5f6f7] pb-20 pt-[18px]">
          <div className="app-shell--text">
            <PageBreadcrumb items={[{ label: "고객센터", href: "/support" }, { label: "1:1 문의하기" }]} />
            <section className="mt-7 border border-[#dfe4ea] bg-white p-10 text-center">
              <p className="text-[12px] font-medium text-[#111111]">접수 완료</p>
              <h1 className="mt-3 text-[26px] font-bold tracking-[-0.02em] text-[#17202c]">문의가 접수되었습니다.</h1>
              <p className="mt-3 text-[14px] font-normal leading-[1.8] text-[#68717e]">
                담당자가 문의 내용을 확인한 후 영업일 기준 1~2일 이내에 입력하신 이메일로 답변드립니다.
              </p>
              <div className="mt-7 flex justify-center gap-2">
                <LinkButton href="/support" variant="secondary" size="md">
                  고객센터로 돌아가기
                </LinkButton>
              </div>
            </section>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-[#f5f6f7] pb-20 pt-[18px]">
        <div className="app-shell--text">
          <PageBreadcrumb items={[{ label: "고객센터", href: "/support" }, { label: "1:1 문의하기" }]} />

          <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">1:1 문의하기</h1>
          <p className="mt-3 text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
            문의를 남겨주시면 영업일 기준 1~2일 이내 답변드립니다.
          </p>

          <div className="mt-7 border border-[#dfe4ea] bg-white p-8 max-[760px]:p-5">
            <p className="border border-[#dfe4ea] bg-[#f7f8fa] px-4 py-3 text-[13px] font-normal leading-[1.6] text-[#596373]">
              정확한 답변을 위해 회원 유형과 문의 유형을 먼저 선택해주세요.
            </p>

            <FieldGroup label="회원 유형" required>
              <div className="grid grid-cols-2 border border-[#dfe4ea]">
                {memberTypeOptions.map((option, index) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleMemberTypeChange(option.id)}
                    className={clsx(
                      "h-12 text-[14px] font-medium transition",
                      index === 0 && "border-r border-[#dfe4ea]",
                      memberType === option.id ? "bg-[#111111] text-white" : "bg-white text-[#4f5967] hover:bg-[#f7f8fa]",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="문의 유형" required>
              <div className="relative">
                <select
                  value={inquiryType}
                  onChange={(event) => setInquiryType(event.target.value)}
                  className={clsx(inputClassName, "appearance-none pr-10", !inquiryType && "text-[#a4adba]")}
                >
                  <option value="" disabled>
                    문의 유형을 선택해주세요
                  </option>
                  {inquiryTypesByMember[memberType].map((type) => (
                    <option key={type} value={type} className="text-[#303946]">
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a95a5]" size={17} />
              </div>
            </FieldGroup>

            <FieldGroup label="답변받을 이메일" required>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="답변받을 이메일 주소를 입력해주세요"
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup label="연락처" hint="(선택)">
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/[^0-9]/g, ""))}
                placeholder="'-' 없이 숫자만 입력"
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup label="제목" required>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="문의 내용을 한 줄로 요약해주세요"
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup label="내용" required>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="상세 내용을 입력해주시면 정확한 답변에 도움이 됩니다."
                className="min-h-[160px] w-full resize-y border border-[#d8e0e8] bg-white px-4 py-3 text-[14px] font-normal leading-[1.65] text-[#303946] outline-none transition placeholder:text-[#a4adba] focus:border-[#111111]"
              />
            </FieldGroup>

            <FieldGroup label="파일 첨부" hint="(선택)">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="grid min-h-[100px] w-full place-items-center border border-dashed border-[#bfcbd7] bg-[#fbfcfd] px-6 text-center transition hover:border-[#111111] hover:bg-[#f4f4f4]"
              >
                {fileName ? (
                  <span className="text-[13px] font-medium text-[#303946]">{fileName}</span>
                ) : (
                  <span>
                    <Upload className="mx-auto text-[#596373]" size={22} />
                    <span className="mt-2 block text-[13px] font-medium text-[#364050]">
                      <span className="text-[#111111] underline">파일 추가</span> 또는 여기로 드래그
                    </span>
                    <span className="mt-1 block text-[12px] font-normal text-[#8a95a5]">10MB 이내 · jpg, png, pdf, hwp, zip</span>
                  </span>
                )}
              </button>
            </FieldGroup>

            <label className="mt-7 flex items-start gap-2.5 border-t border-[#edf1f5] pt-6">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#111111]"
              />
              <span>
                <span className="text-[14px] font-medium text-[#2f3845]">
                  개인정보 수집·이용에 동의합니다. <span className="text-danger">*</span>
                </span>
                <p className="mt-1 text-[12px] font-normal leading-[1.6] text-[#8a94a3]">
                  수집 항목: 이메일, 연락처(선택) · 목적: 문의 응대 및 서비스 품질 향상 · 보유 기간: 접수일로부터 3년
                </p>
              </span>
            </label>

            <div className="mt-7 flex justify-end gap-2">
              <Button type="button" variant="secondary" size="md" onClick={() => router.push("/support")}>
                취소
              </Button>
              <Button
                type="button"
                variant="gradient"
                size="md"
                disabled={!isValid}
                onClick={handleSubmit}
                className={clsx(!isValid && "cursor-not-allowed opacity-40")}
              >
                문의 접수
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
