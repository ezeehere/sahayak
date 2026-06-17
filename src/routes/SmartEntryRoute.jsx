import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserNextRoute } from "../utils/getUserNextRoute";
import { useLanguage } from "../context/LanguageContext";

export default function SmartEntryRoute() {
  const { t } = useLanguage();
  const [message, setMessage] = useState(t("preparingWorkspace") || "Preparing your workspace...");

  useEffect(() => {
    async function sendUserToBestScreen() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        window.location.replace("/login");
        return;
      }

      setMessage(t("findingRightPlace") || "Finding the right place for you...");

      const nextRoute = await getUserNextRoute(user);
      window.location.replace(nextRoute);
    }

    sendUserToBestScreen();
  }, [t]);

  return (
    <main className="smart-entry-page">
      <div className="smart-entry-card">
        <div className="smart-entry-spinner" />
        <h1>Sahayak</h1>
        <p>{message}</p>
      </div>
    </main>
  );
}
