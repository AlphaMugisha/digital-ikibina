import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LogOut } from "@/components/icons";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { logout } from "../../actions";
import { ChangePinForm } from "./change-pin-form";

export default async function ProfileSecurityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [t, tCommon] = await Promise.all([
    getTranslations("profile"),
    getTranslations("common"),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card shadow-warm-sm">
        <div className="border-b border-border p-5 sm:p-6">
          <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
            {t("changePinTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("changePinHint")}</p>
        </div>
        <div className="p-5 sm:p-6">
          <ChangePinForm />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-warm-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
              {t("signOutTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("signOutHint")}</p>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              className="h-11 w-full gap-2 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {tCommon("signOut")}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
