import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { PharmacyJobPostingForm } from "@/components/job-registration/PharmacyJobPostingForm";

export const metadata = {
  title: "약국 공고 등록 · THE PHARMA Recruit",
};

export default function PharmacyJobPostPage() {
  return (
    <BusinessCenterShell>
      <PharmacyJobPostingForm />
    </BusinessCenterShell>
  );
}
