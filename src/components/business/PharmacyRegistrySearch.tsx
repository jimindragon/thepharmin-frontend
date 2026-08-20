"use client";

import { useState } from "react";
import clsx from "clsx";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
import { Button } from "@/components/ui/Button";
import { searchPharmacyRegistry, type PharmacyRegistryEntry } from "@/data/pharmacyRegistry";

/**
 * 전국 약국 등록부에서 약국 하나를 찾아 고르는 제어형 컴포넌트.
 *
 * 약국 인증 게이트(PharmacyClaimGate)가 인라인으로 들고 있던 블록을 그대로 떼어냈다. 가입 STEP1도
 * 같은 방식으로 약국을 골라야 해서다 — 두 벌로 두면 한쪽만 검색 규칙이 바뀌어, 가입 때 찾은 약국을
 * 인증 화면에서는 못 찾는 일이 생긴다.
 *
 * **검색어와 결과는 내부 상태다. 밖으로 나가는 것은 고른 약국 하나뿐이다.** 호출부가 알아야 하는
 * 것은 "어느 약국인가"이지 "어떻게 찾았는가"가 아니고, 검색 상태까지 밖에 두면 호출부마다
 * 재검색 시 선택 해제 같은 규칙을 각자 구현하게 된다.
 *
 * 검색 소스는 searchPharmacyRegistry 하나다(pharmacyRegistry.ts) — 실서비스에서 심평원 API로
 * 바뀔 때 이 컴포넌트는 그대로 둘 수 있다.
 */

const SEARCH_PLACEHOLDER = "약국명 또는 지역으로 검색";
const SEARCH_EMPTY_MESSAGE = "검색 결과가 없습니다. 약국명을 다시 확인해 주세요.";
const SEARCH_EMPTY_HINT = "찾는 약국이 없다면 고객센터로 문의해 주세요.";

export function PharmacyRegistrySearch({
  value,
  onChange,
  label = "약국 검색",
  required = false,
  radioName = "pharmacy-claim-target",
}: {
  /** 고른 약국. null은 아직 고르지 않음이다. */
  value: PharmacyRegistryEntry | null;
  onChange: (pharmacy: PharmacyRegistryEntry | null) => void;
  label?: string;
  required?: boolean;
  /** 라디오 그룹 이름 — 한 화면에 이 컴포넌트가 둘 이상 설 때 서로의 선택을 지우지 않게 한다. */
  radioName?: string;
}) {
  const [keyword, setKeyword] = useState("");
  /** null은 "아직 검색하지 않음"이다 — 빈 배열(결과 없음)과 달라 안내를 띄우지 않는다. */
  const [results, setResults] = useState<PharmacyRegistryEntry[] | null>(null);

  /**
   * 새로 검색하면 고른 약국을 놓는다 — 결과 목록에 없는 약국이 선택된 채로 남으면
   * 화면에 보이지 않는 값으로 신청 버튼이 열린다.
   */
  const runSearch = () => {
    setResults(searchPharmacyRegistry(keyword));
    onChange(null);
  };

  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      {/* form으로 감싸 Enter로도 검색되게 한다 — 검색창에서 Enter가 아무것도 하지 않으면 고장으로 읽힌다.
          바깥에 다른 form이 없어 중첩되지 않는다(호출부의 제출은 각자의 버튼이 직접 한다). */}
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
                  value?.id === pharmacy.id ? "border-[#111111] bg-[#f7f8fa]" : "border-[#dfe4ea] bg-white hover:border-[#b0bac6]",
                )}
              >
                {/* mt-0.5 — 두 줄짜리 행이라 라디오를 첫 줄(약국명)의 광학 중심에 맞춘다 */}
                <input
                  type="radio"
                  name={radioName}
                  value={pharmacy.id}
                  checked={value?.id === pharmacy.id}
                  onChange={() => onChange(pharmacy)}
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
  );
}
