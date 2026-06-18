import { supabase } from "../lib/supabase";

export function getOwnerApplicationStatusLabel(status) {
  if (status === "shortlisted") return "Shortlisted";
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Not selected";
  return "Pending";
}

export async function getOwnerApplicantDashboardData(ownerId) {
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, status, created_at, expires_at, filled_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (jobsError) {
    console.error("Failed to fetch owner jobs:", jobsError.message);
    return {
      jobs: [],
      applicants: [],
      stats: {
        totalJobs: 0,
        totalApplicants: 0,
        unreadApplicants: 0,
        pendingApplicants: 0,
        shortlistedApplicants: 0,
      },
    };
  }

  const ownerJobs = jobs || [];
  const jobIds = ownerJobs.map((job) => job.id);

  if (!jobIds.length) {
    return {
      jobs: ownerJobs,
      applicants: [],
      stats: {
        totalJobs: ownerJobs.length,
        totalApplicants: 0,
        unreadApplicants: 0,
        pendingApplicants: 0,
        shortlistedApplicants: 0,
      },
    };
  }

  const { data: applications, error: applicationsError } = await supabase
    .from("applications")
    .select("id, job_id, seeker_id, status, message, created_at, updated_at, owner_seen_at")
    .in("job_id", jobIds)
    .order("created_at", { ascending: false })
    .limit(8);

  if (applicationsError) {
    console.error("Failed to fetch owner applicants:", applicationsError.message);
  }

  const appRows = applications || [];
  const seekerIds = [...new Set(appRows.map((app) => app.seeker_id).filter(Boolean))];

  let seekers = [];

  if (seekerIds.length) {
    const { data: seekerProfiles, error: seekersError } = await supabase
      .from("profiles")
      .select("id, name, phone, area, short_intro")
      .in("id", seekerIds);

    if (seekersError) {
      console.error("Failed to fetch seeker profiles:", seekersError.message);
    }

    seekers = seekerProfiles || [];
  }

  const jobsById = new Map(ownerJobs.map((job) => [job.id, job]));
  const seekersById = new Map(seekers.map((seeker) => [seeker.id, seeker]));

  const applicants = appRows.map((application) => ({
    ...application,
    isUnread: !application.owner_seen_at,
    job: jobsById.get(application.job_id),
    seeker: seekersById.get(application.seeker_id),
  }));

  const stats = {
    totalJobs: ownerJobs.length,
    totalApplicants: applicants.length,
    unreadApplicants: applicants.filter((app) => app.isUnread).length,
    pendingApplicants: applicants.filter((app) => !app.status || app.status === "pending").length,
    shortlistedApplicants: applicants.filter((app) => app.status === "shortlisted").length,
  };

  return {
    jobs: ownerJobs,
    applicants,
    stats,
  };
}

export async function markApplicationAsSeen(applicationId) {
  if (!applicationId) return false;

  const { error } = await supabase
    .from("applications")
    .update({
      owner_seen_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .is("owner_seen_at", null);

  if (error) {
    console.error("Failed to mark application as seen:", error.message);
    return false;
  }

  return true;
}
