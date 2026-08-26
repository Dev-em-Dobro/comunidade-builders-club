import { PresentePublico, utmFromSearch } from "../presente-publico";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PresentePublicoPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  return <PresentePublico slug={slug} utm={utmFromSearch(sp)} />;
}
