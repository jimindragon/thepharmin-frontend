import type { PreferenceScenarioId, UserJobPreference } from "@/types/jobs";

export const mockUserPreferences: Record<PreferenceScenarioId, UserJobPreference | null> = {
  unset: null,
  configured: {
    jobSubcategoryIds: ["ra", "cmc-ra", "clinical-pm"],
    experienceId: "3-5",
    educationId: "bachelor",
    regionIds: ["seoul", "gyeonggi"],
    employmentTypeIds: ["permanent"],
    workModeIds: ["onsite", "hybrid"],
    emailAlertEnabled: true,
    emailFrequency: "daily",
  },
  applied: {
    jobSubcategoryIds: ["ra", "cmc-ra", "clinical-pm"],
    experienceId: "3-5",
    educationId: "bachelor",
    regionIds: ["seoul", "gyeonggi"],
    employmentTypeIds: ["permanent"],
    workModeIds: ["onsite", "hybrid"],
    emailAlertEnabled: true,
    emailFrequency: "daily",
  },
};

export const defaultPreferenceScenario: PreferenceScenarioId = "configured";
