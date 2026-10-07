"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MOCK_KEYS } from "@/lib/api/config";
import { getApi, type Session } from "@/lib/api";

/**
 * Session state for chrome components (header, footer).
 * Revalidates on every route change (covers login/logout redirects) and on
 * cross-tab storage updates. Returns undefined while loading so callers can
 * avoid flashing the wrong chrome.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      setSession(await getApi().getSession());
    } catch {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (!event.key || event.key === MOCK_KEYS.session) refresh();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  return { session, refresh };
}
