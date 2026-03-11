import { BrentDashboard } from "@/components/brent-dashboard";
import { getBrentSnapshotByCommodity } from "@/lib/brent";
import { normalizeCommodity } from "@/lib/commodities";

export const revalidate = 0;

export default async function Home() {
  const initialCommodity = normalizeCommodity(process.env.NEXT_PUBLIC_DEFAULT_COMMODITY ?? "BRENT");
  let initialData: Awaited<ReturnType<typeof getBrentSnapshotByCommodity>> | null = null;

  try {
    initialData = await getBrentSnapshotByCommodity({ commodity: initialCommodity });
  } catch {
    initialData = null;
  }

  return (
    <main className="flex min-h-screen items-start justify-center p-4 sm:p-8">
      <BrentDashboard initialData={initialData} initialCommodity={initialCommodity} />
    </main>
  );
}
