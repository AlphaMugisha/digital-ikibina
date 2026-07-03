import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Injira / Sign in — Digital Ibimina",
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
        Injira / Sign in
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Koresha telefoni yawe na PIN yawe.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Nta konti ufite? / New here?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Iyandikishe / Create account
        </Link>
      </p>
    </div>
  );
}
