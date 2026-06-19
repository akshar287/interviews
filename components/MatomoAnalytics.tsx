"use client";

import { useEffect } from "react";

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
  const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
  const matomoSiteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

  useEffect(() => {
    if (!matomoUrl || !matomoSiteId || typeof window === "undefined") {
      return;
    }

    const baseUrl = normalizeBaseUrl(matomoUrl);
    const _paq = (window._paq = window._paq || []);
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const trackCurrentPageView = () => {
      _paq.push(["setCustomUrl", window.location.href]);
      _paq.push(["setDocumentTitle", document.title]);
      _paq.push(["trackPageView"]);
    };

    const dispatchRouteChange = () => {
      window.dispatchEvent(new Event("matomo-route-change"));
    };

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

    window.history.pushState = function pushState(...args) {
      const result = originalPushState.apply(this, args as Parameters<History["pushState"]>);
      dispatchRouteChange();
      return result;
    };

    window.history.replaceState = function replaceState(...args) {
      const result = originalReplaceState.apply(this, args as Parameters<History["replaceState"]>);
      dispatchRouteChange();
      return result;
    };

    const handleRouteChange = () => trackCurrentPageView();

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("matomo-route-change", handleRouteChange);

    trackCurrentPageView();

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("matomo-route-change", handleRouteChange);
    };
  }, [matomoSiteId, matomoUrl]);

  return null;
}