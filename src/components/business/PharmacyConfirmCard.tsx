"use client";

import { Button } from "@/components/ui/Button";
import type { PharmacyRegistryEntry } from "@/data/pharmacyRegistry";

/**
 * 미리 지목된 약국이 맞는지 한 번 묻는 카드. 약국 가입 STEP1과 약국 인증 게이트가 함께 쓴다.
 *
 * 약국 상세에서 "약국 인증하기"로 넘어오면 어느 약국인지는 이미 정해져 있다. 그 자리에 빈 검색창을
 * 세우면 방금 보고 온 약국을 다시 찾아야 하고, 반대로 아무것도 묻지 않고 통과시키면 링크를 잘못 눌러
 * 남의 약국을 인증하러 들어온 사람을 막을 자리가 없다. 그래서 검색창 대신 이 한 장이 선다.
 *
 * **역할은 표시와 확인까지다.** 확인 뒤에 무엇이 오는지는 부모가 정한다 — 가입은 나머지 입력으로,
 * 게이트는 증빙 폼으로 간다. 여기서 저장하거나 화면을 옮기지 않는다.
 *
 * 확인 버튼이 검정 채움(primary)인 것은 이 화면의 목적지가 아니라 통과 지점이라서다 —
 * 브랜드 그라데이션은 가입 "다음"·제출처럼 그 화면이 끝나는 자리에만 쓴다.
 */

const LABEL = "인증할 약국";
const QUESTION = "이 약국이 맞나요?";
const CONFIRM_LABEL = "네, 이 약국이 맞아요";
const CHANGE_LABEL = "다른 약국 선택";

export function PharmacyConfirmCard({
  entry,
  onConfirm,
  onChange,
}: {
  entry: PharmacyRegistryEntry;
  onConfirm: () => void;
  onChange: () => void;
}) {
  return (
    <div className="border border-border bg-white p-6">
      <p className="text-[13px] font-normal text-[#8a94a3]">{LABEL}</p>
      <p className="mt-1.5 text-[16px] font-semibold text-[#17202c]">{entry.name}</p>
      <p className="mt-1 text-[14px] font-normal leading-[1.6] text-[#68717e]">{entry.address}</p>

      <p className="mt-5 text-[15px] font-normal text-[#333333]">{QUESTION}</p>
      {/* 좁은 폭에서는 두 버튼이 한 줄에 다 서지 못한다 — flex-wrap으로 아래로 접는다 */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="primary" onClick={onConfirm}>
          {CONFIRM_LABEL}
        </Button>
        {/* Button의 secondary는 회색 테두리다 — 여기는 검정 아웃라인이라 이 코드베이스가 이미 쓰는
            검정 아웃라인 한 줄(NoticeRow·후기 빈 상태 CTA와 같은 색·hover 반전)을 쓰되,
            높이·좌우 여백·글자 크기는 옆의 Button(md)에 맞춰 두 버튼이 같은 줄에 선다. */}
        <button
          type="button"
          onClick={onChange}
          className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap border border-[#111111] px-6 text-[14px] font-medium text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
        >
          {CHANGE_LABEL}
        </button>
      </div>
    </div>
  );
}
