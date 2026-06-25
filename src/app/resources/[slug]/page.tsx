import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ResourceDetailClient } from "@/components/resources/ResourceDetailClient";
import { resources } from "@/data/resources";

interface ResourceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ResourceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = resources.find((item) => item.slug === slug);

  if (!resource) {
    return { title: "자료실 | THE PHARMA Recruit." };
  }

  return {
    title: `${resource.title} | 자료실`,
    description: resource.shortDescription,
  };
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { slug } = await params;
  const resource = resources.find((item) => item.slug === slug);

  if (!resource) {
    notFound();
  }

  const relatedResources = (
    resource.relatedResourceIds
      ? resource.relatedResourceIds.map((id) => resources.find((item) => item.id === id))
      : resources.filter((item) => !item.isPackage && item.id !== resource.id && item.category === resource.category)
  )
    .filter((item): item is (typeof resources)[number] => Boolean(item))
    .slice(0, 4);

  return (
    <>
      <Header />
      <ResourceDetailClient resource={resource} relatedResources={relatedResources} />
    </>
  );
}
