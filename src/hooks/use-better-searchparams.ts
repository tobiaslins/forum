import { useEffect, useState } from "react";

export function useBetterSearchParams(): URLSearchParams {
  // Initialize with empty params, will be populated on client
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    () => new URLSearchParams(),
  );

  useEffect(() => {
    // Set initial params from current URL
    setSearchParams(new URLSearchParams(window.location.search));

    // Listen for browser navigation events (back/forward)
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener("popstate", handlePopState);

    // Create observer for URL changes (handles all navigation types)
    const observer = new MutationObserver(() => {
      const newParams = new URLSearchParams(window.location.search);
      setSearchParams((prev) => {
        // Only update if actually changed to prevent unnecessary re-renders
        if (prev.toString() !== newParams.toString()) {
          return newParams;
        }
        return prev;
      });
    });

    // Observe changes to the URL
    observer.observe(document.querySelector("body")!, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      observer.disconnect();
    };
  }, []);

  return searchParams;
}
