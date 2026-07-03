"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema, type LoginValues } from "@/lib/schemas";

// Deliberately generic message — never reveal whether the phone exists.
const INVALID_CREDENTIALS =
  "Telefoni cyangwa PIN sibyo / Phone or PIN is incorrect";

export async function loginUser(
  values: LoginValues,
): Promise<{ error: string } | undefined> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: INVALID_CREDENTIALS };
  }

  try {
    await signIn("credentials", {
      phone: parsed.data.phone,
      pin: parsed.data.pin,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: INVALID_CREDENTIALS };
    }
    // NEXT_REDIRECT (successful sign-in) and anything unexpected
    throw error;
  }
}
