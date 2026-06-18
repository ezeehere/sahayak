const SEEN_MOMENTS_KEY = "sahayak_seen_moments";

export function getSeenMoments() {
  try {
    const raw = localStorage.getItem(SEEN_MOMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markMomentSeen(momentId) {
  if (!momentId) return;

  const seen = getSeenMoments();

  if (seen.includes(momentId)) return;

  localStorage.setItem(
    SEEN_MOMENTS_KEY,
    JSON.stringify([...seen, momentId])
  );
}

export function getVisibleMoments(moments = []) {
  const seen = getSeenMoments();

  return moments.filter((moment) => {
    if (!moment?.id) return false;
    return !seen.includes(moment.id);
  });
}

export function getSeekerMoments({ applications = [] }) {
  const moments = [];

  applications.forEach((application) => {
    const status = application.status || "pending";

    if (status === "shortlisted") {
      moments.push({
        id: `seeker-shortlisted-${application.id}`,
        tone: "blue",
        title: "You were shortlisted",
        message: `Your application for ${
          application.job?.title || "a job"
        } was shortlisted.`,
        cta: "View applications",
        href: "/seeker/applications",
      });
    }

    if (status === "accepted") {
      moments.push({
        id: `seeker-accepted-${application.id}`,
        tone: "green",
        title: "Application accepted",
        message: `Good news. Your application for ${
          application.job?.title || "a job"
        } was accepted.`,
        cta: "View details",
        href: "/seeker/applications",
      });
    }

    if (status === "rejected") {
      moments.push({
        id: `seeker-not-selected-${application.id}`,
        tone: "slate",
        title: "Application update",
        message: `One shop did not move ahead with your application. You can apply to more jobs nearby.`,
        cta: "Browse jobs",
        href: "/browse-jobs",
      });
    }
  });

  return moments;
}

export function getOwnerMoments({ applicants = [], stats = {} }) {
  const moments = [];

  const unreadApplicants = applicants.filter((applicant) => applicant.isUnread);
  const unreadCount = stats.unreadApplicants || unreadApplicants.length;

  if (unreadCount > 0) {
    const firstUnreadId = unreadApplicants[0]?.id || "new";

    moments.push({
      id: `owner-new-applicants-${firstUnreadId}`,
      tone: "blue",
      title: `${unreadCount} new applicant${unreadCount > 1 ? "s" : ""}`,
      message: "Review new applicants while the job is still fresh.",
      cta: "Review applicants",
      href: "/owner/applicants",
    });
  }

  return moments;
}

export function getUrlNoticeMoment() {
  const params = new URLSearchParams(window.location.search);
  const notice = params.get("notice");

  if (notice === "owner_cannot_apply") {
    return {
      id: "owner-cannot-apply",
      tone: "amber",
      title: "Owners cannot apply",
      message: "You are logged in as a shop owner. Job applications are only for job seekers.",
      cta: "Go to dashboard",
      href: "/owner/dashboard",
    };
  }

  return null;
}
