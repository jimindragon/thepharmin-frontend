import type { CompanyProfile } from "@/data/companyProfiles";
import { CompanyAsidePanel, CompanyDetailOverview, CompanyOverview, ExtraInfoCards, RelatedCompanies } from "@/components/company/CompanyDetailSections";

interface CompanyOverviewClientProps {
  profile: CompanyProfile;
}

/** "기업 개요" 탭(/companies/{id})의 본문. hero/탭 네비는 [companyId]/layout.tsx가 담당한다 */
export function CompanyOverviewClient({ profile }: CompanyOverviewClientProps) {
  return (
    <div className="mt-6 grid grid-cols-[minmax(0,1fr)_300px] gap-6 max-[1120px]:grid-cols-1">
      <div className="grid gap-5">
        <CompanyOverview profile={profile} />
        <CompanyDetailOverview profile={profile} />
        <ExtraInfoCards profile={profile} />
        <RelatedCompanies profile={profile} />
      </div>
      <CompanyAsidePanel profile={profile} />
    </div>
  );
}
