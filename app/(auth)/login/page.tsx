import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: `${t("loginTitle")} — Digital Ibimina` };
}

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
        {t("loginTitle")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("loginSubtitle")}
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("newHere")}{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          {t("createAccount")}
        </Link>
      </p>
    </div>
  );
}
