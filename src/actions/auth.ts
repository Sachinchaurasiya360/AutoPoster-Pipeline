"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(password: string) {
  const expected = process.env.AUTH_PASSWORD;
  if (!expected) {
    return { ok: false, error: "AUTH_PASSWORD is not configured on the server." };
  }
  if (password !== expected) {
    return { ok: false, error: "Wrong password. Try again." };
  }

  const jar = await cookies();
  jar.set("auth", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { ok: true };
}

export async function logout() {
  const jar = await cookies();
  jar.delete("auth");
  redirect("/login");
}
