import { supabase } from "../lib/supabase";

export function getStatusLabel(status) {
  if (status === "shortlisted") return "Shortlisted";
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Not selected";
  return "Pending";
}

export function getStatusTone(status) {
  if (status === "shortlisted") return "blue";
  if (status === "accepted") return "green";
  if (status === "rejected") return "slate";
  return "amber";
}

export function getStatusHelper(status) {
  if (status === "shortlisted") {
    return "The shop owner may contact you soon.";
  }

  if (status === "accepted") {
    return "The shop owner accepted your application.";
  }

  if (status === "rejected") {
    return "This shop did not move ahead. Keep applying to other jobs.";
  }

  return "Waiting for the shop owner to review.";
}

export async function getRecentSeekerApplications(userId) {
  const { data: applications, error: appError } = await supabase
    .from("applications")
    .select("id, job_id, status, message, created_at, updated_at")
    .eq("seeker_id", userId)
    .order("created_at", { ascending: false })
    .limit(6);

  if (appError) {
    console.error("Failed to fetch seeker applications:", appError.message);
    return [];
  }

  if (!applications?.length) return [];

  const jobIds = applications
    .map((application) => application.job_id)
    .filter(Boolean);

  const { data: jobs, error: jobError } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      location,
      area,
      salary,
      job_type,
      owner_id,
      offline_shop_name,
      offline_shop_phone,
      offline_shop_address,
      offline_shop_verified,
      created_at,
      expires_at,
      status
    `
    )
    .in("id", jobIds);

  if (jobError) {
    console.error("Failed to fetch application jobs:", jobError.message);
  }

  const jobsById = new Map((jobs || []).map((job) => [job.id, job]));

  return applications.map((application) => {
    const job = jobsById.get(application.job_id);

    return {
      ...application,
      job,
      shopName:
        job?.offline_shop_name ||
        job?.shop_name ||
        job?.shop_profiles?.shop_name ||
        "Shop",
    };
  });
}

export function getApplicationStats(applications) {
  const stats = {
    total: applications.length,
    pending: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0,
  };

  applications.forEach((application) => {
    const status = application.status || "pending";

    if (stats[status] !== undefined) {
      stats[status] += 1;
    } else {
      stats.pending += 1;
    }
  });

  return stats;
}
