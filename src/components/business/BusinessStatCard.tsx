import clsx from "clsx";
import Link from "next/link";
import { Children, cloneElement, isValidElement } from "react";

interface BusinessStatCardProps {
  label: string;
  /** 숫자 값. unit prop을 함께 쓸 때는 숫자만 전달하세요. */
  value: string;
  /** 단위(명/건/개/원 등). 숫자보다 작고 연한 보조 색으로 렌더링됩니다. */
  unit?: string;
  /** 강조 보조 문구. emphasisVariant에 따라 색이 결정됩니다. */
  subEmphasis?: string;
  /** "urgent" = 빨강(경고), "neutral" = 회색(기본) */
  emphasisVariant?: "neutral" | "urgent";
  /** 일반 보조 문구(항상 회색) */
  sub?: string;
  /**
   * 넘기면 카드 전체가 해당 목적지로 가는 링크가 된다(hover 강조 포함).
   * 넘기지 않으면 클릭 영역도 hover도 없는 기존 표시 전용 카드 그대로다 —
   * 지원자 관리·헤드헌팅 관리·요금제 관리의 카드는 링크가 아니므로 이 prop을 쓰지 않는다.
   */
  href?: string;
  /**
   * ≤760px에서만 셀을 세로 스택 대신 가로 행으로 접는다 — 좌측에 라벨(+보조문구), 우측에 값.
   * BusinessStatGrid가 같은 이름의 prop으로 내려주므로 호출부가 카드마다 넘길 필요는 없다.
   *
   * 기본 false, 즉 옵트인이다 — 지원자 관리·헤드헌팅 관리·요금제 관리의 카드는 이 prop을 쓰지 않아
   * 모든 폭에서 기존 렌더 그대로다. 현재 소비처는 대시보드 하나뿐이다.
   */
  mobileCompact?: boolean;
}

export function BusinessStatCard({
  label,
  value,
  unit,
  subEmphasis,
  emphasisVariant = "neutral",
  sub,
  href,
  mobileCompact = false,
}: BusinessStatCardProps) {
  // 컴팩트 행에서는 빈 보조문구 칸이 세로로 한 줄을 더 먹는다 — 내용이 있을 때만 남긴다.
  const hasSub = Boolean(subEmphasis || sub);

  const body = (
    <>
      <p
        className={clsx(
          "text-[13px] font-medium text-[#8a94a3]",
          mobileCompact && "max-[760px]:col-start-1 max-[760px]:row-start-1",
        )}
      >
        {label}
      </p>
      <p
        className={clsx(
          "mt-2 text-[24px] font-bold leading-none tracking-[-0.03em] text-[#17202c]",
          // row-span-2 — 보조문구가 있는 카드에서 값이 라벨·보조 두 줄 전체에 걸쳐 세로 중앙에 선다.
          mobileCompact &&
            "max-[760px]:col-start-2 max-[760px]:row-start-1 max-[760px]:row-span-2 max-[760px]:mt-0 max-[760px]:text-[18px]",
        )}
      >
        {value}
        {unit && (
          <span
            className={clsx(
              "ml-1 text-[15px] font-normal text-[#8a94a3]",
              mobileCompact && "max-[760px]:text-[13px]",
            )}
          >
            {unit}
          </span>
        )}
      </p>
      {/* min-h — 보조문구가 없는 카드도 같은 높이를 차지해 그리드 셀 정렬이 어긋나지 않게 한다.
          13px 한 줄(line-height 약 21.5px)에 맞춰 22px.
          컴팩트 행에서는 셀이 1열로 서서 서로 높이를 맞출 이유가 없으므로 min-h를 푼다.
          비어 있을 때 요소를 지우지 않고 ≤760px에서만 숨기는 이유는 >760px 렌더를 건드리지 않기 위해서다. */}
      <div
        className={clsx(
          "mt-1.5 min-h-[22px] text-[13px] font-normal text-[#68717e]",
          mobileCompact &&
            "max-[760px]:col-start-1 max-[760px]:row-start-2 max-[760px]:mt-0 max-[760px]:min-h-0",
          mobileCompact && !hasSub && "max-[760px]:hidden",
        )}
      >
        {subEmphasis && (
          <span
            className={clsx(
              "font-semibold",
              emphasisVariant === "urgent" ? "text-status-urgent" : "text-[#68717e]",
            )}
          >
            {subEmphasis}
          </span>
        )}
        {subEmphasis && sub && <span className="text-[#c0c8d2]"> · </span>}
        {sub && <span>{sub}</span>}
      </div>
    </>
  );

  // 컴팩트 행: 좌측 1fr(라벨·보조) + 우측 auto(값). py는 한 단계 내린다(20→16px).
  const compactShell =
    mobileCompact &&
    "max-[760px]:grid max-[760px]:grid-cols-[minmax(0,1fr)_auto] max-[760px]:items-center max-[760px]:gap-x-3 max-[760px]:py-4";

  // hover 토큰은 캘린더 공고 카드(RecruitmentCalendarClient)와 같은 계열을 쓴다 —
  // "카드 전체가 눌린다"는 신호를 화면마다 다르게 주지 않기 위해서다.
  if (href) {
    return (
      <Link href={href} className={clsx("block px-5 py-5 transition hover:bg-[#fbfbfb]", compactShell)}>
        {body}
      </Link>
    );
  }

  return <div className={clsx("px-5 py-5", compactShell)}>{body}</div>;
}

interface BusinessStatGridProps {
  children: React.ReactNode;
  cols?: 3 | 4;
  className?: string;
  /**
   * ≤760px에서 셀을 컴팩트 가로 행으로 접고, 1열 전환도 640이 아니라 760에서 한다 —
   * 접힌 행은 이미 한 줄짜리라 2열로 늘어놓을 이유가 없다.
   * 자식 BusinessStatCard 전부에 같은 값이 내려간다(호출부는 그리드에만 넘기면 된다).
   *
   * 기본 false. false일 때는 children을 손대지 않고 그대로 렌더해 기존 소비처의 렌더를 보존한다.
   */
  mobileCompact?: boolean;
}

export function BusinessStatGrid({
  children,
  cols = 4,
  className,
  mobileCompact = false,
}: BusinessStatGridProps) {
  return (
    <div className={clsx("mt-6 border border-border bg-white", className)}>
      <div
        className={clsx(
          "grid",
          mobileCompact
            ? "max-[900px]:grid-cols-2 max-[760px]:grid-cols-1"
            : "max-[900px]:grid-cols-2 max-[640px]:grid-cols-1",
          cols === 3 ? "grid-cols-3" : "grid-cols-4",
          // 기본(데스크톱): 각 행 첫 셀만 좌측 구분선 제거, 둘째 행부터 상단 구분선
          "[&>*]:border-l [&>*]:border-border",
          cols === 3
            ? "[&>*:nth-child(3n+1)]:border-l-0 [&>*:nth-child(n+4)]:border-t [&>*:nth-child(n+4)]:border-border"
            : "[&>*:nth-child(4n+1)]:border-l-0 [&>*:nth-child(n+5)]:border-t [&>*:nth-child(n+5)]:border-border",
          // max-900px(2열)에서는 홀수 번째가 각 행의 시작 셀
          "max-[900px]:[&>*:nth-child(2n+1)]:border-l-0 max-[900px]:[&>*:nth-child(n+3)]:border-t max-[900px]:[&>*:nth-child(n+3)]:border-border",
          // 1열 구간에서는 좌측 구분선 없이 모든 행 사이에 상단 구분선.
          // 경계는 위 grid-cols 전환과 같은 값이어야 한다 — 어긋나면 2열 구간에 1열 규칙이 걸린다.
          mobileCompact
            ? "max-[760px]:[&>*]:border-l-0 max-[760px]:[&>*:nth-child(n+2)]:border-t max-[760px]:[&>*:nth-child(n+2)]:border-border"
            : "max-[640px]:[&>*]:border-l-0 max-[640px]:[&>*:nth-child(n+2)]:border-t max-[640px]:[&>*:nth-child(n+2)]:border-border",
        )}
      >
        {/* mobileCompact=false면 children을 그대로 통과시킨다 — Children.map은 key를 다시 쓰므로
            기존 소비처에 불필요한 차이를 만들지 않기 위해 분기 자체를 건너뛴다. */}
        {mobileCompact
          ? Children.map(children, (child) =>
              isValidElement<BusinessStatCardProps>(child)
                ? cloneElement(child, { mobileCompact: true })
                : child,
            )
          : children}
      </div>
    </div>
  );
}
