import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Iyandikishe / Register — Digital Ibimina",
};

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-emerald-950">
        Iyandikishe / Create account
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Ukoresha telefoni yawe na PIN y&apos;imibare 5.
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        Usanzwe ufite konti? / Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-700 hover:underline"
        >
          Injira / Sign in
        </Link>
      </p>
    </div>
  );
}
