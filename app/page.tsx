import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  HandCoins,
  HeartPulse,
  Landmark,
  Mail,
  MapPinned,
  Megaphone,
  Phone,
  Scale,
  Search,
  ShieldCheck,
  Sprout,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const heroImage =
  "https://commons.wikimedia.org/wiki/Special:FilePath/An%20aerial%20of%20Kigali%20Convention%20Center%20on%20June%2019%2C%202019.%20Photo%20by%20Emmanuel%20Kwizera.jpg";
const hillsImage =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Rwanda%20landscape.jpg";
const communityImage =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Rwanda%20Nyungwe%20Forest%20National%20Park.jpg";

const navItems = ["Home", "About", "Services", "Programs", "News", "Documents", "Contact"];

const services = [
  {
    icon: UsersRound,
    title: "Register an Ikibina",
    detail: "Submit basic group details, member information, and leadership contacts.",
  },
  {
    icon: HandCoins,
    title: "Contribution Records",
    detail: "Keep records of savings, penalties, loans, repayments, and meeting decisions.",
  },
  {
    icon: ShieldCheck,
    title: "Member Management",
    detail: "Update member lists, roles, attendance, and approval records.",
  },
  {
    icon: FileText,
    title: "Reports",
    detail: "Prepare summaries for meetings, internal review, and local administration.",
  },
];

const priorities = [
  { icon: Landmark, title: "Governance", text: "Constitutions, elected committees, and recorded meeting decisions." },
  { icon: Scale, title: "Accountability", text: "Clear contribution rules and loan approval records for every group." },
  { icon: Sprout, title: "Local Development", text: "Better information for community-based savings and small initiatives." },
  { icon: HeartPulse, title: "Household Resilience", text: "Organized group funds that can respond to member needs on time." },
];

const updates = [
  {
    tag: "Notice",
    date: "Jul 2026",
    title: "Guidance for savings groups preparing registration information",
  },
  {
    tag: "Training",
    date: "Jul 2026",
    title: "Orientation sessions for chairpersons, treasurers, and secretaries",
  },
  {
    tag: "Guidance",
    date: "Jun 2026",
    title: "Model constitution and meeting record templates available for review",
  },
];

const districts = [
  "Gasabo",
  "Kicukiro",
  "Nyarugenge",
  "Musanze",
  "Huye",
  "Rubavu",
  "Rwamagana",
  "Rusizi",
];

const documents = [
  "Group registration checklist",
  "Monthly contribution summary template",
  "Loan decision record form",
  "Meeting minutes template",
];

const partners = [
  "District administration",
  "Sector offices",
  "Cell leadership",
  "Cooperative officers",
  "Community development officers",
  "Financial inclusion programmes",
];

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-4 leading-relaxed text-muted-foreground">{text}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="bg-[#1d5fbf] text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs md:px-8">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold">
              <Globe2 className="size-4" aria-hidden="true" />
              GOV.RW
            </Link>
            <div className="flex items-center gap-4">
              <Link href="#services" className="hover:underline">
                Government services
              </Link>
              <Link href="/login" className="hover:underline">
                Sign in
              </Link>
              <Link href="/register" className="hover:underline">
                Register
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-md bg-primary text-sm font-black text-primary-foreground">
              DI
            </span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Republic of Rwanda
              </span>
              <span className="block text-2xl font-semibold tracking-tight">
                Digital Ibimina
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-4 lg:justify-end">
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
              {navItems.map((item) => (
                <Link
                  key={item}
                  href={item === "Home" ? "/" : `#${item.toLowerCase()}`}
                  className="hover:text-foreground"
                >
                  {item}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2 border-l border-border pl-5">
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section
          className="relative min-h-[620px] overflow-hidden bg-[#123a2d] text-white"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(7, 28, 34, 0.9), rgba(7, 28, 34, 0.62), rgba(7, 28, 34, 0.24)), url("${heroImage}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-4 pb-12 pt-20 md:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f4d03f]">
              Community savings digital services
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
                Digital Ibimina
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/86">
                Information and online services for community savings groups,
                local leaders, and support officers working with ibimina across
                Rwanda.
              </p>

              <div className="mt-8 max-w-2xl border border-white/20 bg-white p-2 shadow-warm-lg">
                <form className="flex flex-col gap-2 sm:flex-row">
                  <label className="sr-only" htmlFor="service-search">
                    Search services
                  </label>
                  <div className="flex min-h-14 flex-1 items-center gap-3 px-4 text-foreground">
                    <Search className="size-5 text-muted-foreground" aria-hidden="true" />
                    <input
                      id="service-search"
                      className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                      placeholder="Search services, documents, notices..."
                    />
                  </div>
                  <Button className="h-14 rounded-md px-7">
                    Search
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </form>
              </div>

              <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                {[
                  ["Online", "service requests"],
                  ["District", "support offices"],
                  ["Forms", "and guidance"],
                ].map(([value, label]) => (
                  <div key={label} className="border-l-4 border-[#f4d03f] bg-white/10 p-4 backdrop-blur">
                    <p className="text-3xl font-semibold">{value}</p>
                    <p className="mt-1 text-sm text-white/78">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-4 md:px-8">
            {["Apply for service", "Check status", "Download forms", "Report an issue"].map(
              (item) => (
                <Link
                  key={item}
                  href="#services"
                  className="group flex items-center justify-between rounded-md border border-border bg-background p-4 text-sm font-semibold hover:border-primary"
                >
                  {item}
                  <ChevronRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                </Link>
              ),
            )}
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Online services"
              title="Services commonly requested by savings groups"
              text="Find registration support, group records, templates, and guidance in one place."
            />
            <Button asChild variant="outline" className="h-12 rounded-md">
              <Link href="/register">
                Start registration
                <ExternalLink className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map(({ icon: Icon, title, detail }) => (
              <Link
                key={title}
                href="/register"
                className="group rounded-md border border-border bg-card p-6 shadow-warm-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-warm-lg"
              >
                <span className="grid size-12 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{detail}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Access service
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="about" className="border-y border-border bg-secondary/50">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading
                eyebrow="About the platform"
                title="Supporting community savings with better records"
                text="Digital Ibimina helps groups organize savings information, meeting decisions, and loan records so members and local leaders can follow group activity more easily."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="h-12 rounded-md">
                  <Link href="/register">Create a group</Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-md">
                  <Link href="#documents">View documents</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {priorities.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-md border border-border bg-card p-6">
                  <Icon className="size-8 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="programs"
          className="relative overflow-hidden border-b border-border bg-[#0d3f30] text-white"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(13, 63, 48, 0.92), rgba(13, 63, 48, 0.78), rgba(13, 63, 48, 0.42)), url("${hillsImage}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 md:px-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d03f]">
                District rollout
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                Services designed for local group administration
              </h2>
            </div>
            <div className="space-y-5 text-white/84">
              <p className="leading-relaxed">
                Groups can prepare their information online and continue working
                with the nearest administrative office when physical verification
                or follow-up is required.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {districts.map((district) => (
                  <div key={district} className="flex items-center gap-3 border border-white/20 bg-white/10 p-3">
                    <MapPinned className="size-4 text-[#f4d03f]" aria-hidden="true" />
                    <span className="text-sm font-medium">{district}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="news" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Latest updates"
              title="News, announcements, and public notices"
              text="Recent notices, guidance, and training information for savings groups and local support teams."
            />
            <Link href="#news" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View all updates
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {updates.map((update) => (
              <article key={update.title} className="rounded-md border border-border bg-card p-6">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <span className="text-primary">{update.tag}</span>
                  <span>{update.date}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold leading-snug">{update.title}</h3>
                <Link href="#news" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Read more
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          className="border-y border-border bg-white"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.96), rgba(255,255,255,0.9), rgba(255,255,255,0.7)), url("${communityImage}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-8 lg:grid-cols-[1fr_1.1fr]">
            <SectionHeading
              eyebrow="Service delivery"
              title="Information for members, leaders, and support officers"
              text="The service is organized around the people who use group records every month: members checking contributions, leaders preparing meetings, and officers helping groups resolve issues."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["For citizens", "Join a savings group, view contribution status, and request statements."],
                ["For leaders", "Approve members, organize meetings, and record financial decisions."],
                ["For officers", "Follow group activity, review submitted information, and support service requests."],
                ["For partners", "Work with organized group records when planning financial inclusion support."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-md border border-border bg-card/95 p-5 shadow-warm-sm">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="documents" className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeading
              eyebrow="Documents"
              title="Public forms and reference material"
              text="Download commonly used templates for registration, meetings, contributions, and loan decisions."
            />
          </div>
          <div className="grid gap-4">
            {documents.map((document) => (
              <Link
                key={document}
                href="#documents"
                className="flex items-center justify-between rounded-md border border-border bg-card p-5 hover:border-primary"
              >
                <span className="flex items-center gap-3 font-medium">
                  <Download className="size-5 text-primary" aria-hidden="true" />
                  {document}
                </span>
                <span className="text-sm text-muted-foreground">PDF</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-secondary/50">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
            <SectionHeading
              eyebrow="Affiliated institutions"
              title="Working with local administrative structures"
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner) => (
                <div key={partner} className="flex items-center gap-4 rounded-md border border-border bg-card p-5">
                  <Building2 className="size-6 text-primary" aria-hidden="true" />
                  <span className="font-medium">{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <SectionHeading
              eyebrow="Contact"
              title="Need support with an application or group record?"
              text="For questions about a group record, start with your sector office or the officer responsible for community development in your area."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [Phone, "Phone support", "Available through local offices"],
                [Mail, "Written requests", "Submit through the service desk"],
                [MapPinned, "In-person support", "District and sector offices"],
                [CalendarDays, "Working hours", "Monday to Friday"],
              ].map(([Icon, title, value]) => (
                <div key={title as string} className="rounded-md border border-border bg-card p-5">
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <p className="mt-4 text-sm text-muted-foreground">{title as string}</p>
                  <p className="mt-1 font-semibold">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0d2538] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
          <div>
            <p className="text-2xl font-semibold">Digital Ibimina</p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Digital services and guidance for community savings groups in Rwanda.
            </p>
          </div>
          {[
            ["Services", ["Register a group", "Check application", "Download forms"]],
            ["Information", ["About", "Programs", "News", "Documents"]],
            ["Government", ["GOV.RW", "Irembo", "Local government"]],
          ].map(([heading, links]) => (
            <div key={heading as string}>
              <p className="font-semibold">{heading as string}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {(links as string[]).map((link) => (
                  <li key={link}>
                    <Link href="#services" className="hover:text-white">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-white/65 md:flex-row md:items-center md:justify-between md:px-8">
            <p>&copy; {new Date().getFullYear()} Digital Ibimina. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Megaphone className="size-4" aria-hidden="true" />
              <span>Public notices and service updates</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
