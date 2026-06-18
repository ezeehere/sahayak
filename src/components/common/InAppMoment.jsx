import { useMemo, useState } from "react";
import { getVisibleMoments, markMomentSeen } from "../../utils/inAppMoments";

export default function InAppMoment({ moments = [] }) {
  const visibleMoments = useMemo(() => getVisibleMoments(moments), [moments]);
  const [activeIndex, setActiveIndex] = useState(0);

  const moment = visibleMoments[activeIndex];

  if (!moment) return null;

  const toneClasses = {
    blue: "border-blue-100 bg-blue-50 text-blue-900",
    green: "border-green-100 bg-green-50 text-green-900",
    amber: "border-amber-100 bg-amber-50 text-amber-900",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
  };

  function dismissMoment() {
    markMomentSeen(moment.id);
    setActiveIndex((prev) => prev + 1);
  }

  function handleAction() {
    markMomentSeen(moment.id);

    if (moment.href) {
      window.location.href = moment.href;
    }
  }

  return (
    <section
      className={`mb-4 rounded-3xl border p-4 shadow-sm ${
        toneClasses[moment.tone] || toneClasses.slate
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold">
            {moment.title}
          </p>

          <p className="mt-1 text-sm opacity-80">
            {moment.message}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          {moment.cta && (
            <button
              type="button"
              onClick={handleAction}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-1 ring-black/5"
            >
              {moment.cta}
            </button>
          )}

          <button
            type="button"
            onClick={dismissMoment}
            className="rounded-full px-3 py-2 text-sm font-medium opacity-70"
          >
            Later
          </button>
        </div>
      </div>
    </section>
  );
}
