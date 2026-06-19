"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

const TRACKER_SCRIPT_ID = "matomo-tracker-script";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export default function MatomoAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
  const matomoSiteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

  useEffect(() => {
    if (!matomoUrl || !matomoSiteId || typeof window === "undefined") {
      return;
    }

    const baseUrl = normalizeBaseUrl(matomoUrl);
    const _paq = (window._paq = window._paq || []);

    _paq.push(["setTrackerUrl", `${baseUrl}/matomo.php`]);
    _paq.push(["setSiteId", matomoSiteId]);
    _paq.push(["enableLinkTracking"]);

    if (!document.getElementById(TRACKER_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = TRACKER_SCRIPT_ID;
      script.async = true;
      script.src = `${baseUrl}/matomo.js`;
      document.head.appendChild(script);
    }
  }, [matomoSiteId, matomoUrl]);

  useEffect(() => {
    if (!matomoUrl || !matomoSiteId || typeof window === "undefined") {
      return;
    }

    const _paq = (window._paq = window._paq || []);
    _paq.push(["setCustomUrl", window.location.href]);
    _paq.push(["setDocumentTitle", document.title]);
    _paq.push(["trackPageView"]);
  }, [matomoSiteId, matomoUrl, pathname, search]);

  return null;
}