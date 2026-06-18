import {
  getDaysDiffFromNow,
  getDaysUntil,
} from "../../utils/jobFreshness";

function getSimplePostedLabel(createdAt) {
  const days = getDaysDiffFromNow(createdAt);

  if (days === null) return "Recently posted";
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days <= 7) return `Posted ${days} days ago`;

  return "Posted over a week ago";
}

function getSimpleExpiryLabel(expiresAt) {
  const days = getDaysUntil(expiresAt);

  if (days === null) return null;
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  if (days <= 3) return `Closes in ${days} days`;

  return null;
}

export default function JobFreshnessLine({ job }) {
  const postedLabel = getSimplePostedLabel(job?.created_at);
  const expiryLabel = getSimpleExpiryLabel(job?.expires_at);

  return (
    <div className="job-freshness-line">
      <span>{postedLabel}</span>

      {expiryLabel && (
        <>
          <span className="freshness-separator">·</span>
          <span>{expiryLabel}</span>
        </>
      )}
    </div>
  );
}
