import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { IndustryJobPostingForm } from "@/components/job-registration/IndustryJobPostingForm";

export const metadata = {
  title: "산업 공고 등록 · THE PHARMA Recruit",
};

export default function IndustryJobPostPage() {
  return (
    <BusinessCenterShell>
      <IndustryJobPostingForm />
    </BusinessCenterShell>
  );
}
