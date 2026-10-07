"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type LoginFormProps = {
  mode: "login" | "signup";
};

/**
 * Frontend-only auth form (no backend yet).
 * Keeps all interactive state isolated so page.tsx stays a Server Component.
 * TODO(auth): replace handleSubmit with a Server Action / API call.
 */
export function LoginForm({ mode }: LoginFormProps) {
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();

    if (!email) {
      setNotice("Please enter your email to continue.");
      return;
    }
    setNotice(
      mode === "signup"
        ? `Demo only. Account creation for ${email} will be wired to the backend next.`
        : `Demo only. Login for ${email} will be wired to the backend next.`,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" aria-label={`${mode} form`}>
      {notice ? (
        <div
          role="status"
          className="rounded-xl border border-line bg-background px-3 py-2 text-sm font-semibold text-ink"
        >
          {notice}
        </div>
      ) : null}

      {mode === "signup" ? (
        <div>
          <label htmlFor="name" className="mb-2 block font-bold">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Maria Santos"
            className="min-h-12 w-full rounded-[14px] border border-line bg-surface px-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="mb-2 block font-bold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="min-h-12 w-full rounded-[14px] border border-line bg-surface px-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block font-bold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder="••••••••"
          className="min-h-12 w-full rounded-[14px] border border-line bg-surface px-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
      </div>

      <Button type="submit" size="lg" className="w-full">
        {mode === "signup" ? "Create account" : "Log in"}
      </Button>
    </form>
  );
}
