import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Runs the edge-safe config only; unauthenticated requests to /dashboard/*
// are redirected to /login by the `authorized` callback.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
