"use client";

import clsx from "clsx";
import { jobTracks } from "@/config/jobTracks";
import type { JobTrack } from "@/types/jobs";

interface CategoryTabsProps {
  activeTrack: JobTrack;
  onChange: (track: JobTrack) => void;
}

export function CategoryTabs({ activeTrack, onChange }: CategoryTabsProps) {
  return (
    <div className="mt-5 flex gap-2 border-b border-[#eceff1] pb-3.5">
      {jobTracks.map((track) => (
        <button
          key={track.id}
          type="button"
          onClick={() => onChange(track.id)}
          className={clsx(
            "h-[40px] min-w-[84px] border px-5 text-[14px] font-medium transition-colors max-[520px]:min-w-[74px] max-[520px]:px-4",
            activeTrack === track.id
              ? "border-[#111111] bg-[#111111] text-white shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
              : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:bg-[#eeeeee] hover:text-[#111111]",
          )}
          title={track.description}
        >
          {track.label}
        </button>
      ))}
    </div>
  );
}
