import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Iyandikishe / Register — Digital Ibimina",
};

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
        Iyandikishe / Create account
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ukoresha telefoni yawe na PIN y&apos;imibare 5.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Usanzwe ufite konti? / Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Injira / Sign in
        </Link>
      </p>
    </div>
  );
}
