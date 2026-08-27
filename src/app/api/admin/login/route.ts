import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword, passwordMatches } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  // No password configured means no way in, rather than a way in for everyone.
  const expected = adminPassword();
  if (!expected) {
    console.error("[admin] ADMIN_PASSWORD is not set — refusing all logins.");
    return NextResponse.json(
      { error: "Admin access is not configured." },
      { status: 503 }
    );
  }

  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
