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
 * Keeps header/footer mounted across routes so navigation feels instant.
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
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
