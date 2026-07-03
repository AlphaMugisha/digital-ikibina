import type { DefaultSession } from "next-auth";
// Import forces TS to resolve the module so the JWT augmentation merges.
import type {} from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    phone: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    phone?: string;
  }
}
