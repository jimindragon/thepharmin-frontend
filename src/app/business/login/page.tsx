import { BusinessLoginClient } from "@/components/business/BusinessLoginClient";

interface BusinessLoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function BusinessLoginPage({ searchParams }: BusinessLoginPageProps) {
  const { redirect } = await searchParams;

  return <BusinessLoginClient redirectTo={redirect || "/business/dashboard"} />;
}
