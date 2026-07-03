import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { BottomNav, SidebarNav } from "@/components/dashboard/nav";
import { logout } from "./actions";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const initial = (session.user.name ?? "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh bg-stone-50">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <span className="font-display font-bold text-emerald-950">
          Digital Ibimina
        </span>
        <Link
          href="/dashboard/profile"
          aria-label="Umwirondoro / Profile"
          className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800"
        >
          {initial}
        </Link>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <Link
          href="/dashboard"
          className="font-display px-3 py-2 text-lg font-bold text-emerald-950"
        >
          Digital Ibimina
        </Link>
        <div className="mt-4 flex-1">
          <SidebarNav />
        </div>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="h-11 w-full justify-start gap-3 px-3 text-slate-600"
          >
            <LogOut className="size-5" aria-hidden="true" />
            Sohoka / Sign out
          </Button>
        </form>
      </aside>

      {/* Content: bottom padding clears the mobile tab bar */}
      <main className="container mx-auto px-4 pb-28 pt-6 md:pb-10 md:pl-64 md:pr-8">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
