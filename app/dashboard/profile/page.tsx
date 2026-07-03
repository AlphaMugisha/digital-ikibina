import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { logout } from "../actions";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-bold text-emerald-950">
        Umwirondoro / Profile
      </h1>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-800">
            {(session.user.name ?? "?").charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-emerald-950">
              {session.user.name}
            </p>
            <p className="font-mono text-sm text-slate-500">
              {session.user.phone}
            </p>
          </div>
        </div>
      </div>

      <form action={logout} className="mt-6">
        <Button
          type="submit"
          variant="outline"
          className="h-12 w-full gap-2 text-base text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="size-5" aria-hidden="true" />
          Sohoka / Sign out
        </Button>
      </form>
    </div>
  );
}
