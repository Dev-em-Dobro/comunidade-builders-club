import { notFound } from "next/navigation";
import { sanitizeUtmValue } from "@/lib/gifts/origem";
import { PresentePublico, utmFromPathContent } from "../../presente-publico";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string; utmContent: string }>;
};

export default async function PresenteComCampanhaPage({ params }: Props) {
  const { slug, utmContent } = await params;
  if (!sanitizeUtmValue(utmContent)) notFound();
  return <PresentePublico slug={slug} utm={utmFromPathContent(utmContent)} />;
}
