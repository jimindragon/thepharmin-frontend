"use client";

import { Button } from "@/components/ui/Button";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";

export interface ManagerInfo {
  managerName: string;
  department: string;
  position: string;
  phone: string;
  email: string;
}

export const emptyManagerInfo: ManagerInfo = {
  managerName: "",
  department: "",
  position: "",
  phone: "",
  email: "",
};

/** STEP 2 — 담당자 정보. 통합/약국 두 갈래가 그대로 공유하는 컴포넌트. */
export function ManagerInfoStep({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: ManagerInfo;
  onChange: <K extends keyof ManagerInfo>(key: K, next: ManagerInfo[K]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const canProceed = Boolean(value.managerName.trim() && value.phone.trim() && value.email.trim());

  return (
    <div>
      <div className="space-y-5">
        <div className="space-y-2">
          <FieldLabel required>담당자명</FieldLabel>
          <TextInput value={value.managerName} onChange={(v) => onChange("managerName", v)} placeholder="담당자 이름" />
        </div>
        <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
          <div className="space-y-2">
            <FieldLabel>부서</FieldLabel>
            <TextInput value={value.department} onChange={(v) => onChange("department", v)} placeholder="예: 인사팀" />
          </div>
          <div className="space-y-2">
            <FieldLabel>직책</FieldLabel>
            <TextInput value={value.position} onChange={(v) => onChange("position", v)} placeholder="예: 채용 담당자" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
          <div className="space-y-2">
            <FieldLabel required>연락처</FieldLabel>
            <TextInput value={value.phone} onChange={(v) => onChange("phone", v)} placeholder="'-' 없이 숫자만 입력" />
          </div>
          <div className="space-y-2">
            <FieldLabel required>이메일</FieldLabel>
            <TextInput value={value.email} onChange={(v) => onChange("email", v)} placeholder="business@company.com" />
          </div>
        </div>
      </div>

      <div className="mt-9 flex justify-between gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          이전
        </Button>
        <Button type="button" variant="gradient" disabled={!canProceed} onClick={onNext}>
          다음
        </Button>
      </div>
    </div>
  );
}
