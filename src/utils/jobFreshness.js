export function getDaysDiffFromNow(dateValue) {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getDaysUntil(dateValue) {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  const now = new Date();

  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getPostedTimeLabel(createdAt) {
  const days = getDaysDiffFromNow(createdAt);

  if (days === null) return "Recently posted";
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days <= 7) return `Posted ${days} days ago`;
  if (days <= 14) return "Posted over a week ago";
  if (days <= 30) return "Posted over 2 weeks ago";

  return "Posted over a month ago";
}

export function getFreshnessBadge(job) {
  if (!job) {
    return {
      label: "Active",
      tone: "slate",
      priority: 5,
    };
  }

  const status = job.status || "active";

  if (status === "filled") {
    return {
      label: "Filled",
      tone: "slate",
      priority: 1,
    };
  }

  if (status === "expired") {
    return {
      label: "Expired",
      tone: "slate",
      priority: 1,
    };
  }

  if (status === "closed") {
    return {
      label: "Closed",
      tone: "slate",
      priority: 1,
    };
  }

  const daysSincePosted = getDaysDiffFromNow(job.created_at);
  const daysUntilExpiry = getDaysUntil(job.expires_at);

  if (daysUntilExpiry !== null && daysUntilExpiry < 0) {
    return {
      label: "Expired",
      tone: "slate",
      priority: 1,
    };
  }

  if (daysUntilExpiry === 0) {
    return {
      label: "Expires today",
      tone: "red",
      priority: 2,
    };
  }

  if (daysUntilExpiry === 1) {
    return {
      label: "Expires tomorrow",
      tone: "amber",
      priority: 3,
    };
  }

  if (daysSincePosted !== null && daysSincePosted <= 1) {
    return {
      label: "New",
      tone: "green",
      priority: 4,
    };
  }

  if (daysSincePosted !== null && daysSincePosted <= 7) {
    return {
      label: "Fresh",
      tone: "blue",
      priority: 5,
    };
  }

  return {
    label: "Active",
    tone: "slate",
    priority: 6,
  };
}

export function getExpiryLabel(expiresAt) {
  const days = getDaysUntil(expiresAt);

  if (days === null) return null;
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  if (days <= 7) return `Expires in ${days} days`;

  return null;
}

export function shouldAllowApply(job) {
  if (!job) return false;

  const status = job.status || "active";
  const daysUntilExpiry = getDaysUntil(job.expires_at);

  if (status === "filled") return false;
  if (status === "closed") return false;
  if (status === "expired") return false;
  if (daysUntilExpiry !== null && daysUntilExpiry < 0) return false;

  return true;
}
