import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <AppShell email={session.user.email ?? undefined} username={session.user.name ?? undefined}>
        {children}
      </AppShell>
    </>
  );
}
