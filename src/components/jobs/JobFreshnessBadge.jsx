import { getFreshnessBadge } from "../../utils/jobFreshness";

export default function JobFreshnessBadge({ job }) {
  const badge = getFreshnessBadge(job);

  const toneClasses = {
    green: "bg-green-50 text-green-800 ring-green-100",
    blue: "bg-blue-50 text-blue-800 ring-blue-100",
    amber: "bg-amber-50 text-amber-800 ring-amber-100",
    red: "bg-red-50 text-red-800 ring-red-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${
        toneClasses[badge.tone] || toneClasses.slate
      }`}
    >
      {badge.label}
    </span>
  );
}
