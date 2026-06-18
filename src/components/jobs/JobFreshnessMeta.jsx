import {
  getExpiryLabel,
  getPostedTimeLabel,
} from "../../utils/jobFreshness";

export default function JobFreshnessMeta({ job }) {
  const postedLabel = getPostedTimeLabel(job?.created_at);
  const expiryLabel = getExpiryLabel(job?.expires_at);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <span>{postedLabel}</span>

      {expiryLabel && (
        <>
          <span>•</span>
          <span>{expiryLabel}</span>
        </>
      )}
    </div>
  );
}
