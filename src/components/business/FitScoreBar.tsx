/**
 * 직무 적합도 막대 + 점수. 지원자 관리 목록·지원자 상세·헤드헌팅 의뢰 관리 세 곳이 공유한다.
 *
 * 원래 세 파일에 같은 마크업이 복제돼 있어 점수 칸 폭을 한 번 고치는 데도 세 곳을 동시에
 * 손봐야 했다. 막대·점수만 여기 두고, 아래에 붙는 "N개 요건 중 M개 충족" 보조 문구는
 * 화면마다 크기·여백이 달라(목록 11px / 헤드헌팅 12px / 상세 13px) 호출부에 남겼다.
 *
 * 점수 칸 w-7 — 세 자리("100")가 13px/600 tabular-nums에서 24.5px라 w-6(24px)이면 넘친다.
 */
export function FitScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-[72px] bg-[#e5e9ef]">
        <div className="h-full bg-[#111111]" style={{ width: `${score}%` }} />
      </div>
      <span className="w-7 text-right text-[13px] font-semibold tabular-nums text-[#17202c]">{score}</span>
    </div>
  );
}
