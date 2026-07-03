import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RegisterForm } from "./register-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: `${t("registerTitle")} — Digital Ibimina` };
}

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
        {t("registerTitle")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("registerSubtitle")}
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t("loginTitle")}
        </Link>
      </p>
    </div>
  );
}
