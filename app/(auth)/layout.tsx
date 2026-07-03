import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 px-4 py-8">
      <Link
        href="/"
        className="font-display mx-auto text-lg font-bold text-emerald-950"
      >
        Digital Ibimina
      </Link>
      <div className="mx-auto mt-8 w-full max-w-md flex-1">{children}</div>
    </div>
  );
}
