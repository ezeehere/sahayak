// src/utils/jobApplications.js

import { supabase } from "../lib/supabase";

const DB = {
  applications: "applications",
  seekerId: "seeker_id",
  jobId: "job_id",
  status: "status",
};

export function getApplicationStatusLabel(status) {
  switch (status) {
    case "shortlisted":
      return "Shortlisted";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "pending":
      return "Pending";
    case "hired":
      return "Hired";
    default:
      return "Pending";
  }
}

export function getApplicationStatusMessage(status) {
  switch (status) {
    case "shortlisted":
      return "The shop owner has shortlisted your application. They may contact you soon.";
    case "accepted":
      return "Your application has been accepted! The shop owner will reach out to you.";
    case "rejected":
      return "Unfortunately, your application was not selected.";
    case "pending":
      return "Your application is pending review by the shop owner.";
    case "hired":
      return "Congratulations! You have been hired for this job.";
    default:
      return "Your application is pending review.";
  }
}

export async function getExistingApplication({ seekerId, jobId }) {
  if (!seekerId || !jobId) return null;
  const { data, error } = await supabase
    .from(DB.applications)
    .select("*", { count: "exact", head: false })
    .eq(DB.seekerId, seekerId)
    .eq(DB.jobId, jobId)
    .maybeSingle();
  if (error) {
    console.error("Error checking existing application:", error);
    return null;
  }
  return data || null;
}

export { DB };
