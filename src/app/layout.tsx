import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

/** Global metadata. Each page can override title and description. */
export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — International Remittance`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
};

/**
 * Root layout.
 * The header is a fixed floating capsule, so main carries top padding.
 * The footer hides itself for signed-in users (see SiteFooter).
 * Page content is injected via `children`.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1 pt-[92px]">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
