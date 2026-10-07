/**
 * Signed-in shell. Route group, so URLs stay clean (/dashboard, /send...).
 * Navigation lives in the floating header capsule (session-aware), so this
 * layout only adds page spacing. Auth guard lives in each screen (demo),
 * and moves to middleware when the backend lands.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="qila-container py-8 sm:py-10">{children}</div>;
}
