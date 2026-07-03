import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LogOut } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { logout } from "../actions";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const t = await getTranslations("common");

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {t("profile")}
      </h1>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-warm-sm">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
              {(session.user.name ?? "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display font-semibold text-foreground">
              {session.user.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {session.user.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Language — kept off the mobile top bar, lives here instead */}
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-warm-sm md:hidden">
        <span className="text-sm font-medium text-foreground">
          {t("language")}
        </span>
        <LanguageSwitcher />
      </div>

      <form action={logout} className="mt-6">
        <Button
          type="submit"
          variant="outline"
          className="h-12 w-full gap-2 rounded-full border-destructive/30 text-base text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-5" aria-hidden="true" />
          {t("signOut")}
        </Button>
      </form>
    </div>
  );
}
