import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/site";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to QilaPay to see live rates and track transfers.",
};

type LoginPageProps = {
  searchParams: Promise<{ mode?: string }>;
};

/**
 * Auth entry (frontend-only for now).
 * `?mode=signup` toggles copy so Header "Get started" and "Log in"
 * share one route until real auth is wired.
 *
 * Backend handoff: LoginForm's submit becomes a Server Action
 * calling POST /api/auth/login (or your auth provider).
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isSignup = params.mode === "signup";

  return (
    <section className="py-12" aria-labelledby="login-title">
      <div className="qila-container max-w-[460px]">
        <Card className="p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h1
              id="login-title"
              className="text-2xl font-extrabold tracking-tight"
            >
              {isSignup ? "Create account" : "Welcome back"}
            </h1>
            <Link
              href={ROUTES.home}
              className="text-sm font-semibold text-muted hover:text-ink"
            >
              ← Back
            </Link>
          </div>

          <div className="mb-4 rounded-xl border border-dashed border-line bg-background px-3 py-2 text-sm text-muted">
            Frontend preview. Auth will be connected in the next milestone.
          </div>

          <LoginForm mode={isSignup ? "signup" : "login"} />

          <p className="mt-4 text-center text-sm text-muted">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link
                  href={ROUTES.login}
                  className="font-bold text-primary-dark"
                >
                  Log in
                </Link>
              </>
            ) : (
              <>
                New to QilaPay?{" "}
                <Link
                  href={ROUTES.signup}
                  className="font-bold text-primary-dark"
                >
                  Get started
                </Link>
              </>
            )}
          </p>
        </Card>
      </div>
    </section>
  );
}
