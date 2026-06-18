import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { getUserNextRoute } from "../utils/getUserNextRoute";

export default function SmartEntryRoute() {
  const [message, setMessage] = useState("Finding the right place for you...");
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let alive = true;

    const fallbackTimer = setTimeout(() => {
      if (alive) setShowFallback(true);
    }, 4500);

    async function sendUserToBestScreen() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          window.location.replace("/login");
          return;
        }

        if (alive) {
          setMessage("Checking your account...");
        }

        const nextRoute = await getUserNextRoute(user);

        if (!nextRoute) {
          window.location.replace("/browse-jobs");
          return;
        }

        window.location.replace(nextRoute);
      } catch (error) {
        console.error("Smart entry failed:", error);
        window.location.replace("/browse-jobs");
      } finally {
        clearTimeout(fallbackTimer);
      }
    }

    sendUserToBestScreen();

    return () => {
      alive = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-green-50 px-4">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm rounded-[2rem] border border-slate-200 bg-white/90 p-7 text-center shadow-xl shadow-slate-200/60 backdrop-blur">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Sahayak
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {message}
          </p>

          {showFallback && (
            <button
              type="button"
              onClick={() => window.location.replace("/browse-jobs")}
              className="mt-6 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Continue to jobs
            </button>
          )}
        </div>
      </div>
    </main>
  );
}