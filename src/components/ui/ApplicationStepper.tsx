"use client";

import clsx from "clsx";
import { applicationStages, type ApplicationStage } from "@/data/mockApplications";

export function ApplicationStepper({ currentStage }: { currentStage: ApplicationStage }) {
  const currentIndex = applicationStages.findIndex((stage) => stage.id === currentStage);
  const lastIndex = applicationStages.length - 1;

  return (
    <div className="mt-5 grid grid-cols-4">
      {applicationStages.map((stage, index) => {
        const reached = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isFirst = index === 0;
        const isLast = index === lastIndex;

        return (
          <div key={stage.id} className="flex flex-col items-center">
            <div className="relative flex w-full items-center">
              <div
                className={clsx(
                  "h-[2px] flex-1",
                  isFirst ? "bg-transparent" : index <= currentIndex ? "bg-[#111111]" : "bg-[#e5e9ef]",
                )}
              />
              <span
                className={clsx(
                  "h-3 w-3 shrink-0 rounded-full",
                  reached ? "bg-[#111111]" : "border-2 border-[#d8dee7] bg-white",
                )}
              />
              <div
                className={clsx(
                  "h-[2px] flex-1",
                  isLast ? "bg-transparent" : index < currentIndex ? "bg-[#111111]" : "bg-[#e5e9ef]",
                )}
              />
            </div>
            <span
              className={clsx(
                "mt-2.5 whitespace-nowrap text-[12px]",
                isCurrent
                  ? "font-bold text-[#111111]"
                  : reached
                    ? "font-medium text-[#111111]"
                    : "font-normal text-[#a0a9b7]",
              )}
            >
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
