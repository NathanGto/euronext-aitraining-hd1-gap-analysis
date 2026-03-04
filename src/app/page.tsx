import { BrentDashboard } from "@/components/brent-dashboard";
import { getBrentSnapshot } from "@/lib/brent";

export const revalidate = 0;

export default async function Home() {
  let initialData: Awaited<ReturnType<typeof getBrentSnapshot>> | null = null;

  try {
    initialData = await getBrentSnapshot();
  } catch {
    initialData = null;
  }

  return (
    <main className="flex min-h-screen items-start justify-center p-4 sm:p-8">
      <BrentDashboard initialData={initialData} />
    </main>
  );
}
