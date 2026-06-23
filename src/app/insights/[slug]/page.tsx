import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { InsightDetailClient } from "@/components/insights/InsightDetailClient";
import { insightRelatedJobIds, insights } from "@/data/insights";
import { jobs } from "@/data/jobs";

interface InsightDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: InsightDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = insights.find((item) => item.slug === slug);

  if (!insight) {
    return {
      title: "Insight+ | THE PHARMA Recruit.",
    };
  }

  return {
    title: `${insight.title} | Insight+`,
    description: insight.description,
  };
}

export default async function InsightDetailPage({ params }: InsightDetailPageProps) {
  const { slug } = await params;
  const insight = insights.find((item) => item.slug === slug);

  if (!insight) {
    notFound();
  }

  const relatedArticles = insights.filter((item) => item.slug !== slug);
  const relatedJobs = insightRelatedJobIds.map((id) => jobs.find((job) => job.id === id)).filter((job): job is (typeof jobs)[number] => Boolean(job));

  return (
    <>
      <Header />
      <InsightDetailClient insight={insight} relatedArticles={relatedArticles} relatedJobs={relatedJobs} />
    </>
  );
}
