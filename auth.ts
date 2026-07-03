import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeRwandanPhone } from "@/lib/phone";
import { authConfig } from "@/auth.config";

const credentialsSchema = z.object({
  phone: z.string().min(1),
  pin: z.string().regex(/^\d{4,6}$/),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        phone: {},
        pin: {},
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const phone = normalizeRwandanPhone(parsed.data.phone);
        if (!phone) return null;

        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) return null;

        const pinMatches = await bcrypt.compare(parsed.data.pin, user.pinHash);
        if (!pinMatches) return null;

        return { id: user.id, name: user.name, phone: user.phone };
      },
    }),
  ],
});
