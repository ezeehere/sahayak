import { savePendingJobAction } from "./pendingJobAction";

const VALID_ACTIONS = ["apply", "save", "contact"];

export function getJobAuthContextFromUrl() {
  const params = new URLSearchParams(window.location.search);

  const action = params.get("action");
  const jobId = params.get("job");

  if (!VALID_ACTIONS.includes(action) || !jobId) {
    return null;
  }

  return {
    action,
    jobId,
    query: `?action=${action}&job=${jobId}`,
  };
}

export function persistJobAuthContextFromUrl() {
  const context = getJobAuthContextFromUrl();

  if (!context) return null;

  savePendingJobAction({
    type: context.action,
    jobId: context.jobId,
    returnTo: `/jobs/${context.jobId}`,
  });

  return context;
}

export function getAuthContextKeys(action) {
  if (action === "apply") {
    return {
      titleKey: "continueToApplyTitle",
      bodyKey: "continueToApplyBody",
      defaultTitle: "Continue to apply",
      defaultBody: "Log in or create an account to apply for this job. Your selected job will stay saved.",
    };
  }

  if (action === "save") {
    return {
      titleKey: "continueToSaveTitle",
      bodyKey: "continueToSaveBody",
      defaultTitle: "Continue to save this job",
      defaultBody: "Log in or create an account to save this job.",
    };
  }

  if (action === "contact") {
    return {
      titleKey: "continueToContactTitle",
      bodyKey: "continueToContactBody",
      defaultTitle: "Continue to view contact",
      defaultBody: "Log in or create an account to view contact details safely.",
    };
  }

  return null;
}

export function getDefaultRoleForAuthContext(action) {
  if (action === "apply") return "seeker";
  return "seeker";
}
