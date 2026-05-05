import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const username = (user.user_metadata?.username as string) || undefined;

  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <AppShell email={user.email} username={username}>{children}</AppShell>
    </>
  );
}
