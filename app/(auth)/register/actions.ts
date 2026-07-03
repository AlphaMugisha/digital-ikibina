"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeRwandanPhone } from "@/lib/phone";
import { registerSchema, type RegisterValues } from "@/lib/schemas";

export async function registerUser(
  values: RegisterValues,
): Promise<{ error: string } | undefined> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Amakuru winjije ntiyemewe / Please check the form and try again" };
  }

  const phone = normalizeRwandanPhone(parsed.data.phone);
  if (!phone) {
    return { error: "Numero ya telefoni ntiyemewe / Invalid phone number" };
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return {
      error:
        "Iyi numero isanzwe iyandikishije — injira / This phone number is already registered — sign in instead",
    };
  }

  const pinHash = await bcrypt.hash(parsed.data.pin, 10);

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        phone,
        nationalId: parsed.data.nationalId || null,
        pinHash,
      },
    });
  } catch {
    // Unique-constraint race on phone/nationalId or connection issue —
    // never leak Prisma internals to the user.
    return {
      error:
        "Kwiyandikisha ntibyakunze — telefoni cyangwa indangamuntu bisanzwe byanditse / Registration failed — phone or national ID already in use",
    };
  }

  // Sign in with the same credentials and land on the dashboard.
  // On success this throws NEXT_REDIRECT, which Next.js handles.
  await signIn("credentials", {
    phone,
    pin: parsed.data.pin,
    redirectTo: "/dashboard",
  });
}
