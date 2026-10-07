import Link from "next/link";
import { HEADER_NAV, ROUTES, SITE } from "@/lib/site";
import { Button } from "@/components/ui/Button";

/**
 * Public site header (pre-login).
 * Sticky + blurred. Pill buttons match the bold language.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="qila-container flex min-h-[72px] items-center justify-between gap-4">
        <Link
          href={ROUTES.home}
          className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight"
          aria-label={`${SITE.name} home`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-base font-extrabold text-white">
            Q
          </span>
          {SITE.name}
          <span className="hidden rounded-full bg-accent px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-accent-deep sm:inline-block">
            Beta
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary">
          <div className="mr-1 hidden items-center gap-6 lg:flex">
            {HEADER_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-semibold text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Button href={ROUTES.login} variant="secondary">
            Log in
          </Button>
          <Button href={ROUTES.signup} variant="primary" className="hidden sm:inline-flex">
            Get started
          </Button>
        </nav>
      </div>
    </header>
  );
}
