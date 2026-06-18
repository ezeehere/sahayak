export function getSeekerNextBestActions({ applications = [] }) {
  const actions = [];

  const hasApplications = applications.length > 0;
  const hasShortlisted = applications.some(
    (app) => app.status === "shortlisted"
  );
  const hasAccepted = applications.some(
    (app) => app.status === "accepted"
  );
  const hasOnlyPending =
    hasApplications &&
    applications.every((app) => !app.status || app.status === "pending");

  if (!hasApplications) {
    actions.push({
      id: "browse-first-job",
      icon: "search",
      title: "Apply to your first job",
      description: "Find nearby shop jobs and send your first application.",
      cta: "Browse jobs",
      href: "/browse-jobs",
    });
  }

  if (hasAccepted) {
    actions.push({
      id: "view-accepted",
      icon: "status",
      title: "Check accepted application",
      description: "One shop has accepted your application. Review the details.",
      cta: "View applications",
      href: "/seeker/applications",
    });
  }

  if (hasShortlisted) {
    actions.push({
      id: "view-shortlisted",
      icon: "applicants",
      title: "You are shortlisted",
      description: "A shop liked your application. Check your application status.",
      cta: "View status",
      href: "/seeker/applications",
    });
  }

  if (hasOnlyPending) {
    actions.push({
      id: "apply-more",
      icon: "jobs",
      title: "Apply to more jobs",
      description: "Do not wait for one shop. Apply to more suitable jobs nearby.",
      cta: "Browse jobs",
      href: "/browse-jobs",
    });
  }

  actions.push({
    id: "update-preferences",
    icon: "settings",
    title: "Improve job matches",
    description: "Set your preferred work type, area, and timing.",
    cta: "Update preferences",
    href: "/seeker/preferences",
  });

  return actions.slice(0, 3);
}

export function getOwnerNextBestActions({
  jobs = [],
  applicants = [],
  stats = {},
}) {
  const actions = [];

  const unreadCount = stats.unreadApplicants || 0;
  const hasJobs = jobs.length > 0;
  const activeJobs = jobs.filter(
    (job) => (job.status || "active") === "active"
  );
  const hasApplicants = applicants.length > 0;

  if (unreadCount > 0) {
    actions.push({
      id: "review-new-applicants",
      icon: "applicants",
      title: `${unreadCount} new applicant${unreadCount > 1 ? "s" : ""}`,
      description: "Review new applicants before they move to another job.",
      cta: "Review applicants",
      href: "/owner/applicants",
    });
  }

  if (!hasJobs) {
    actions.push({
      id: "post-first-job",
      icon: "post",
      title: "Post your first job",
      description: "Add one local job so seekers can apply to your shop.",
      cta: "Post job",
      href: "/owner/post-job?firstJob=1",
    });
  }

  if (hasJobs && !hasApplicants) {
    actions.push({
      id: "share-job",
      icon: "share",
      title: "Share your job",
      description: "Share your active job on WhatsApp to get applicants faster.",
      cta: "View jobs",
      href: "/owner/dashboard?focus=jobs",
    });
  }

  if (activeJobs.length > 0) {
    actions.push({
      id: "post-another-job",
      icon: "jobs",
      title: "Need more staff?",
      description: "Post another opening for a different role or shift.",
      cta: "Post another job",
      href: "/owner/post-job",
    });
  }

  return actions.slice(0, 3);
}
