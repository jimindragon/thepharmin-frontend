"use client";

import clsx from "clsx";
import { applicationStages, type ApplicationStage } from "@/data/mockApplications";

export function ApplicationStepper({ currentStage }: { currentStage: ApplicationStage }) {
  const currentIndex = applicationStages.findIndex((stage) => stage.id === currentStage);

  return (
    <div className="mt-5 flex items-start">
      {applicationStages.map((stage, index) => {
        const reached = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === applicationStages.length - 1;

        return (
          <div key={stage.id} className={clsx("flex items-start", isLast ? "shrink-0" : "flex-1")}>
            <div className="flex shrink-0 flex-col items-center">
              <span
                className={clsx(
                  "h-3 w-3 shrink-0",
                  reached ? "bg-[#111111]" : "border-2 border-[#d8dee7] bg-white",
                  isCurrent && "ring-4 ring-[#111111]/12",
                )}
              />
              <span
                className={clsx(
                  "mt-2.5 whitespace-nowrap text-[12px]",
                  isCurrent
                    ? "font-bold text-[#111111]"
                    : reached
                      ? "font-medium text-[#4f5967]"
                      : "font-normal text-[#a0a9b7]",
                )}
              >
                {stage.label}
              </span>
            </div>
            {!isLast ? (
              <div
                className={clsx(
                  "mt-[5px] h-[2px] flex-1",
                  index < currentIndex ? "bg-[#111111]" : "bg-[#e5e9ef]",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
