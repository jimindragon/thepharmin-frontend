import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { ResearchJobPostingForm } from "@/components/job-registration/ResearchJobPostingForm";

export const metadata = {
  title: "연구 공고 등록 · THE PHARMA Recruit",
};

export default function ResearchJobPostPage() {
  return (
    <BusinessCenterShell>
      <ResearchJobPostingForm />
    </BusinessCenterShell>
  );
}
