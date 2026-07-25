import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const CONFIRM_FLAG = "--yes";

async function countRows() {
  return {
    users: await prisma.user.count(),
    groups: await prisma.group.count(),
    memberships: await prisma.membership.count(),
    meetings: await prisma.meeting.count(),
    meetingDecisions: await prisma.meetingDecision.count(),
    contributions: await prisma.contribution.count(),
    messages: await prisma.message.count(),
    invitations: await prisma.invitation.count(),
    loans: await prisma.loan.count(),
    loanPayments: await prisma.loanPayment.count(),
  };
}

async function main() {
  const counts = await countRows();
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  console.log("Current row counts:");
  console.log(counts);

  if (!process.argv.includes(CONFIRM_FLAG)) {
    console.log(
      `\nThis would permanently delete ${total} row(s) across every table — including real ` +
        "user accounts, not just test data. Nothing has been deleted.\n" +
        `Re-run with the ${CONFIRM_FLAG} flag if you're sure: npm run db:reset -- ${CONFIRM_FLAG}`,
    );
    return;
  }

  // Delete in dependency order (children first, then parents)
  console.log("\nConfirmed — truncating tables...");
  await prisma.loanPayment.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.message.deleteMany();
  await prisma.meetingDecision.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
  console.log("✓ All data wiped, schema intact.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
