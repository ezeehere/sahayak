const PENDING_JOB_ACTION_KEY = "sahayak_pending_job_action";

export function savePendingJobAction({ type, jobId, returnTo }) {
  if (!type || !jobId) return;

  localStorage.setItem(
    PENDING_JOB_ACTION_KEY,
    JSON.stringify({
      type,
      jobId,
      returnTo: returnTo || `/jobs/${jobId}`,
      createdAt: Date.now(),
    })
  );
}

export function getPendingJobAction() {
  try {
    const raw = localStorage.getItem(PENDING_JOB_ACTION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    const oneDay = 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - parsed.createdAt > oneDay;

    if (isExpired) {
      clearPendingJobAction();
      return null;
    }

    return parsed;
  } catch {
    clearPendingJobAction();
    return null;
  }
}

export function clearPendingJobAction() {
  localStorage.removeItem(PENDING_JOB_ACTION_KEY);
}
