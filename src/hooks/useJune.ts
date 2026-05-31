import { useEffect, useState } from "react";
import { AnalyticsBrowser } from "@june-so/analytics-next";

export function useJune() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const juneKey = process.env.NEXT_PUBLIC_JUNE_KEY;
    const loadAnalytics = async () => {
      if (!juneKey) return;
      let response = AnalyticsBrowser.load({
        writeKey: juneKey,
      });
      setAnalytics(response);
    };
    loadAnalytics();
  }, []);
  return analytics;
}
