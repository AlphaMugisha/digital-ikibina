import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LogOut } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BottomNav, SidebarNav } from "@/components/dashboard/nav";
import { logout } from "./actions";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const t = await getTranslations("common");
  const initial = (session.user.name ?? "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh bg-background">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:hidden">
        <Logo />
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {initial}
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <div className="px-2 py-2">
          <Logo />
        </div>
        <div className="mt-6 flex-1">
          <SidebarNav />
        </div>
        <LanguageSwitcher className="w-full justify-start px-4" />
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="h-11 w-full justify-start gap-3 rounded-full px-4 text-muted-foreground"
          >
            <LogOut className="size-5" aria-hidden="true" />
            {t("signOut")}
          </Button>
        </form>
      </aside>

      {/* Content: bottom padding clears the floating mobile tab bar */}
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-10 md:pl-72 md:pr-8">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
