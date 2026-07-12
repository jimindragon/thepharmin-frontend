import { Bookmark, Clock3, Lightbulb, LucideIcon, Settings2 } from "lucide-react";

interface TipRowProps {
  icon: LucideIcon;
  title: string;
  badge?: number;
  description: string;
  onClick: () => void;
}

function TipRow({ icon: Icon, title, badge, description, onClick }: TipRowProps) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-start gap-3 py-4 text-left transition hover:bg-gray-50">
      <Icon size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-gray-700" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-[#171b20]">{title}</span>
          {badge != null ? <span className="text-[12px] font-medium text-gray-400">{badge}</span> : null}
        </span>
        <span className="mt-1 block text-[13px] leading-[1.5] text-gray-500">{description}</span>
      </span>
    </button>
  );
}

interface JobUsageTipsCardProps {
  savedCount: number;
  onSavedClick: () => void;
  onRecentClick: () => void;
  onPreferenceSettingsClick: () => void;
}

export function JobUsageTipsCard({ savedCount, onSavedClick, onRecentClick, onPreferenceSettingsClick }: JobUsageTipsCardProps) {
  return (
    <div className="border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Lightbulb size={17} strokeWidth={2} className="text-gray-700" />
        <h3 className="text-[15px] font-semibold text-[#171b20]">공고 활용 팁</h3>
      </div>

      <div className="mt-4 divide-y divide-gray-200 border-t border-gray-200">
        <TipRow
          icon={Bookmark}
          title="저장한 공고"
          badge={savedCount}
          description="관심 있는 공고를 저장하고 나중에 다시 확인할 수 있어요."
          onClick={onSavedClick}
        />
        <TipRow
          icon={Clock3}
          title="최근 본 공고"
          description="최근 확인한 공고를 빠르게 다시 볼 수 있어요."
          onClick={onRecentClick}
        />
        <TipRow
          icon={Settings2}
          title="관심조건 설정"
          description="원하는 조건을 저장하면 맞춤 공고를 빠르게 볼 수 있어요."
          onClick={onPreferenceSettingsClick}
        />
      </div>
    </div>
  );
}
