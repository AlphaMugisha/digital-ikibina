import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRWF } from "@/lib/money";
import { MyLoansTabs, type MyLoanRow } from "./my-loans-tabs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loans");
  return { title: `${t("myLoans")} — Digital Ibimina` };
}

export default async function MyLoansPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [locale, t, loans] = await Promise.all([
    getLocale(),
    getTranslations("loans"),
    prisma.loan.findMany({
      where: { membership: { userId: session.user.id } },
      include: { membership: { include: { group: { select: { id: true, name: true } } } } },
      orderBy: { requestedAt: "desc" },
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  const rows: MyLoanRow[] = loans.map((loan) => ({
    id: loan.id,
    groupId: loan.membership.group.id,
    groupName: loan.membership.group.name,
    status: loan.status,
    amountLabel: formatRWF(loan.amount, locale),
    dueDateLabel: dateFormatter.format(loan.dueDate),
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
        {t("myLoans")}
      </h1>
      <div className="mt-4">
        <MyLoansTabs loans={rows} />
      </div>
    </div>
  );
}
