import clsx from "clsx";
import type { ReactNode } from "react";
import { TableEmptyState } from "@/components/business/table/TableEmptyState";

/**
 * 기업센터 표 공용 셸.
 *
 * 이 부품이 푸는 문제는 grid-cols 문자열이 헤더와 행에 각각 하드코딩돼
 * 표당 2번, 6종 합쳐 12번 복제돼 있던 것이다. columns에서 한 번 조립해
 * 두 곳에 같은 값을 넘긴다 — 열 폭을 고치는 데 한 곳만 보면 된다.
 *
 * 구조는 A계열(공고 관리·결제 내역) 기준이다:
 *   카드 > overflow-x-auto > min-w > 헤더(px-6 py-3) + 행(px-6 py-4)
 * 좌우 패딩을 헤더·행이 소유하므로 divide-y 구분선이 카드 폭 전체를 가로지른다.
 * (B계열은 패딩이 스크롤 컨테이너에 있어 구분선이 24px 안으로 들어와 있었다.)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ★ minWidth의 의미 — "패딩을 포함한 행 전체 폭"이다. 열 트랙 합이 아니다.
 *
 * 기존 표에서 옮겨올 때 기존 min-w에 무엇을 더할지는 그 표의 패딩 위치에 달렸다:
 *   · 패딩이 스크롤 컨테이너에 있던 표(B계열: 헤드헌팅 873·요금제 740·지원자 900)
 *     → 그 min-w는 "트랙 폭"이었으므로 좌우 패딩 48을 더한다 (921 / 788 / 948)
 *   · 패딩이 행에 있던 표(A계열: 공고 940·결제 950)
 *     → 그 min-w는 이미 "총폭"이었으므로 그대로 쓴다
 * 이걸 틀리면 없던 가로 스크롤이 생긴다(공고 관리에서 988로 넣었다가 946 컨테이너를
 * 넘겨 42px 스크롤이 발생했다).
 * ─────────────────────────────────────────────────────────────────────────────
 * ★ blockify 함정 — 셀은 min-w-0 래퍼(div/span) 한 겹을 거쳐 렌더된다.
 *
 * 그리드 직속 자식은 display가 블록으로 승격(blockify)되지만, 래퍼가 끼면 그 특권이
 * 사라진다. 그래서 "블록 문맥을 전제하는" 것들이 tsc·렌더 오류 없이 조용히 틀어진다:
 *   · overflow 계열 — truncate / line-clamp가 인라인 요소에서는 아예 먹지 않는다
 *   · 인라인 대체요소(input·img) — 라인박스 descender가 붙어 높이가 커진다
 *
 * 실제로 두 번 밟았다:
 *   1) 추천 후보자 "매칭 포지션" 칩 — w-fit truncate가 죽어 잘리지 않음 → block 명시
 *   2) 지원자 관리 전체선택 체크박스 — 16px여야 할 것이 22.45px가 되어 헤더가
 *      46.4 → 47.4로 커짐 → block 명시
 *
 * 열을 추가하거나 셀 마크업을 바꿀 때는 반드시 실측으로 확인할 것. 타입도 콘솔도
 * 알려주지 않는다.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type DataTableColumn<T> = {
  key: string;
  /** 헤더 라벨. 툴팁 등 노드 허용. 비우면 빈 헤더 셀(액션 열) */
  header?: ReactNode;
  /** grid-template-columns 트랙 — "minmax(0,1fr)" | "120px" */
  width: string;
  /** 액션 열만 "end" */
  align?: "start" | "end";
  /**
   * 제목 열 줄 처리. 6종 모두 아직 미적용이라 자리만 있다 —
   * 긴 값이 오면 행이 무너지는 문제(결제 81.8 → 137.2 실측)를 다룰 때 켠다.
   */
  clamp?: "truncate" | 1 | 2;
  cell: (row: T) => ReactNode;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** 패딩 포함 행 전체 최소 폭 */
  minWidth: number;
  /** 있으면 행 전체가 클릭 대상이 되고 cursor-pointer·hover 배경이 붙는다 */
  onRowClick?: (row: T) => void;
  /** 선택된 행 배경. onRowClick과 짝으로 쓴다 */
  isRowSelected?: (row: T) => boolean;
  /** 마지막 행 아래 구분선 위 영역(결제 내역 합계 행) */
  footer?: ReactNode;
  /** 표 아래 페이지네이션. 마크업이 화면마다 달라 슬롯으로 받는다 */
  pagination?: ReactNode;
  empty: { title: ReactNode; description: ReactNode; action?: ReactNode };
  /**
   * ≤760px에서 표 대신 그릴 카드 한 장. 주면 그 폭에서 표가 통째로 감춰지고 카드 목록이 선다.
   *
   * 안 주면 종전 그대로(전 폭 표 + 가로 스크롤)다 — 아직 이걸 넘기지 않는 표 5종은 무변경이다.
   *
   * 두 모습을 한 DOM에 오버라이드로 얹지 않고 따로 렌더한다: 표는 grid 트랙 6칸,
   * 카드는 자유 배치라 공유할 뼈대가 없고, 합치면 카드 쪽에서 grid-cols·min-w·가로 스크롤을
   * 전부 되돌려야 한다(CategoryTabs page 변형과 같은 판단).
   *
   * ★ 풀블리드는 이 부품이 하지 않는다 — 목록은 divide-y 세로 스택까지만 만든다.
   * 셸 거터를 얼마나 되밀어야 하는지가 화면마다 다르므로(기업센터 본문 px-0 ↔ 마이페이지 ↔ 일반
   * 페이지) 음수 마진은 호출부가 <DataTable>을 감싸며 건다. 스크랩·QNA의 FLUSH_LIST_CLASS와
   * 같은 분담이다.
   */
  mobileCard?: (row: T) => ReactNode;
};

/** 셀 정렬·줄처리 래퍼. min-w-0을 일괄로 준다 — 없으면 grid 자식이 안 줄어든다 */
function cellClass<T>(col: DataTableColumn<T>): string {
  return clsx(
    "min-w-0",
    col.align === "end" && "flex justify-end",
    col.clamp === "truncate" && "truncate",
    col.clamp === 1 && "line-clamp-1",
    col.clamp === 2 && "line-clamp-2",
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  minWidth,
  onRowClick,
  isRowSelected,
  footer,
  pagination,
  empty,
  mobileCard,
}: DataTableProps<T>) {
  // grid-cols를 한 번만 조립해 헤더·행이 같은 값을 쓴다
  const gridTemplate = { gridTemplateColumns: columns.map((c) => c.width).join(" ") };

  const emptyState = (
    <TableEmptyState title={empty.title} description={empty.description} action={empty.action} />
  );

  return (
    <div
      className={clsx(
        "mt-3 border border-border bg-white",
        // 풀블리드로 화면 끝까지 나간 목록에 좌우 테두리가 남으면 화면 가장자리에 선이 붙는다.
        // 위아래 선은 목록의 시작·끝을 잡아 주므로 남긴다.
        mobileCard && "max-[760px]:border-x-0",
      )}
    >
      {mobileCard ? (
        <div className="min-[761px]:hidden">
          {rows.length > 0 ? (
            <div className="divide-y divide-[#e5e9ef]">
              {rows.map((row) => (
                <div
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={clsx(
                    // 카드 안쪽 패딩은 카드가 갖는다 — 표의 px-6 py-4를 여기서 강요하면
                    // 배치가 자유롭지 않다. 여기서 주는 것은 선택/클릭 상태뿐이다.
                    onRowClick && "cursor-pointer transition",
                    onRowClick && (isRowSelected?.(row) ? "bg-[#f7f8fa]" : "hover:bg-[#fafafa]"),
                  )}
                >
                  {mobileCard(row)}
                </div>
              ))}
            </div>
          ) : (
            emptyState
          )}
          {/* footer는 카드 모드에서도 그대로 흘려보낸다 — 표 트랙에 맞춘 마크업이면
              그 호출부가 카드용으로 갈라 주는 것이 맞고, 여기서 조용히 지우면 값이 사라진다. */}
          {footer}
        </div>
      ) : null}

      <div className={clsx("overflow-x-auto", mobileCard && "max-[760px]:hidden")}>
        <div style={{ minWidth }}>
          {/* 헤더 — 헤더 전용 슬롯은 두지 않는다. 헤더에만 노드를 더하면 행과 그리드 칸이
              어긋나기 때문이다. 전체선택 체크박스처럼 헤더·행 양쪽에 필요한 것은 "열"로 정의한다
              (지원자 관리 key: "select" 참고). */}
          <div
            style={gridTemplate}
            className="grid items-center gap-4 border-b border-border px-6 py-3 text-[13px] font-medium text-[#8a94a3] max-[760px]:px-4"
          >
            {columns.map((col) => (
              <span key={col.key} className={cellClass(col)}>
                {col.header}
              </span>
            ))}
          </div>

          {rows.length > 0 ? (
            <div className="divide-y divide-[#e5e9ef]">
              {rows.map((row) => (
                <div
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={clsx(
                    "grid items-center gap-4 px-6 py-4 text-[13px] max-[760px]:px-4",
                    onRowClick && "cursor-pointer transition",
                    onRowClick && (isRowSelected?.(row) ? "bg-[#f7f8fa]" : "hover:bg-[#fafafa]"),
                  )}
                  style={gridTemplate}
                >
                  {columns.map((col) => (
                    <div key={col.key} className={cellClass(col)}>
                      {col.cell(row)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            emptyState
          )}

          {footer}
        </div>
      </div>
      {pagination}
    </div>
  );
}
