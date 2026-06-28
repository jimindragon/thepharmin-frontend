import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { HospitalJobPostingForm } from "@/components/job-registration/HospitalJobPostingForm";

export const metadata = {
  title: "병원약사 공고 등록 · THE PHARMA Recruit",
};

export default function HospitalJobPostPage() {
  return (
    <BusinessCenterShell>
      <HospitalJobPostingForm />
    </BusinessCenterShell>
  );
}
