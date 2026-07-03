import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Injira / Sign in — Digital Ibimina",
};

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-emerald-950">
        Injira / Sign in
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Koresha telefoni yawe na PIN yawe.
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        Nta konti ufite? / New here?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-700 hover:underline"
        >
          Iyandikishe / Create account
        </Link>
      </p>
    </div>
  );
}
