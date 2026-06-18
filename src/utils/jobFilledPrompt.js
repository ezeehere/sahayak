import { supabase } from "../supabaseClient";

export function shouldPromptMarkFilled({ job, applicants = [] }) {
  if (!job) return false;

  const jobStatus = job.status || "active";

  if (jobStatus === "filled" || jobStatus === "closed" || jobStatus === "expired") {
    return false;
  }

  const hasAcceptedApplicant = applicants.some(
    (applicant) => applicant.status === "accepted"
  );

  const hasShortlistedApplicants = applicants.filter(
    (applicant) => applicant.status === "shortlisted"
  ).length >= 2;

  return hasAcceptedApplicant || hasShortlistedApplicants;
}

export async function markJobAsFilled(jobId) {
  if (!jobId) {
    throw new Error("Job id is required");
  }

  const { data, error } = await supabase
    .from("jobs")
    .update({
      status: "filled",
      filled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .select()
    .single();

  if (error) {
    console.error("Failed to mark job as filled:", error.message);
    throw error;
  }

  return data;
}
