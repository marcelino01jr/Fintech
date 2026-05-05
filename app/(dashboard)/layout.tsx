import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { ActivityTracker } from "@/components/session/activity-tracker";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // loginAt dari JWT — fallback ke now jika tidak ada
  const loginAt = (session as any).loginAt ?? Date.now();

  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      {/* Track user activity untuk idle timeout & max session */}
      <ActivityTracker loginAt={loginAt} />
      <AppShell email={session.user.email ?? undefined} username={session.user.name ?? undefined}>
        {children}
      </AppShell>
    </>
  );
}
