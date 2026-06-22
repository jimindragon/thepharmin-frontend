import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { JobPostingRegistrationForm } from "@/components/job-registration/JobPostingRegistrationForm";

export default function BusinessNewJobPage() {
  return (
    <BusinessCenterShell>
      <div className="business-job-registration">
        <JobPostingRegistrationForm />
      </div>
    </BusinessCenterShell>
  );
}
