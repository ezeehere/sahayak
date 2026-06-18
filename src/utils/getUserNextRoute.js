import { supabase } from "../supabaseClient";
import {
  getPendingJobAction,
  clearPendingJobAction,
} from "./pendingJobAction";

const ROUTES = {
  login: "/login",

  browseJobs: "/browse-jobs",

  seekerDashboard: "/seeker/dashboard",
  matchingJobs: "/seeker/matching-jobs",

  ownerDashboard: "/owner/dashboard",
  ownerShopProfile: "/owner/shop-profile?setup=1",
  ownerPostJob: "/owner/post-job?firstJob=1",

  adminDashboard: "/admin/dashboard",

  jobWithAction: (jobId, action) => `/jobs/${jobId}?action=${action}`,
  ownerBlockedApply: "/owner/dashboard?notice=owner_cannot_apply",
};

const DB = {
  profiles: "profiles",
  profileUserId: "id",
  profileRole: "role",

  applications: "applications",
  applicationSeekerId: "seeker_id",
  applicationJobId: "job_id",

  jobPreferences: "job_preferences",
  jobPreferencesUserId: "user_id",

  shopProfiles: "shop_profiles",
  shopOwnerId: "owner_id",

  jobs: "jobs",
  jobOwnerId: "owner_id",
};

async function getProfile(userId) {
  const { data, error } = await supabase
    .from(DB.profiles)
    .select("*")
    .eq(DB.profileUserId, userId)
    .maybeSingle();

  if (error) {
    console.error("Profile fetch failed:", error.message);
    return null;
  }

  return data;
}

async function hasSeekerApplications(userId) {
  const { count, error } = await supabase
    .from(DB.applications)
    .select("id", { count: "exact", head: true })
    .eq(DB.applicationSeekerId, userId);

  if (error) {
    console.error("Seeker applications check failed:", error.message);
    return false;
  }

  return (count || 0) > 0;
}

async function hasSeekerPreferences(userId) {
  const { count, error } = await supabase
    .from(DB.jobPreferences)
    .select("id", { count: "exact", head: true })
    .eq(DB.jobPreferencesUserId, userId);

  if (error) {
    console.error("Seeker preferences check failed:", error.message);
    return false;
  }

  return (count || 0) > 0;
}

async function hasOwnerShopProfile(userId) {
  const { count, error } = await supabase
    .from(DB.shopProfiles)
    .select("id", { count: "exact", head: true })
    .eq(DB.shopOwnerId, userId);

  if (error) {
    console.error("Owner shop profile check failed:", error.message);
    return false;
  }

  return (count || 0) > 0;
}

async function getOwnerJobIds(userId) {
  const { data, error } = await supabase
    .from(DB.jobs)
    .select("id")
    .eq(DB.jobOwnerId, userId)
    .limit(100);

  if (error) {
    console.error("Owner jobs fetch failed:", error.message);
    return [];
  }

  return data?.map((job) => job.id) || [];
}

async function hasOwnerApplicants(jobIds) {
  if (!jobIds.length) return false;

  const { count, error } = await supabase
    .from(DB.applications)
    .select("id", { count: "exact", head: true })
    .in(DB.applicationJobId, jobIds);

  if (error) {
    console.error("Owner applicants check failed:", error.message);
    return false;
  }

  return (count || 0) > 0;
}

function normalizeRole(role) {
  if (!role) return null;

  const value = String(role).toLowerCase();

  if (value === "job_seeker") return "seeker";
  if (value === "shop_owner") return "owner";

  return value;
}

export async function getUserNextRoute(user) {
  try {
    if (!user?.id) return ROUTES.login;

    const profile = await getProfile(user.id);

    if (!profile) {
      console.warn("No profile found. Sending user to browse jobs.");
      return ROUTES.browseJobs;
    }

    const role = normalizeRole(profile[DB.profileRole]);
    const pendingAction = getPendingJobAction();

    if (role === "admin") {
      clearPendingJobAction();
      return ROUTES.adminDashboard;
    }

    if (role === "owner") {
      if (pendingAction?.type === "apply") {
        clearPendingJobAction();
        return ROUTES.ownerBlockedApply;
      }

      const hasShop = await hasOwnerShopProfile(user.id);

      if (!hasShop) {
        return ROUTES.ownerShopProfile;
      }

      const jobIds = await getOwnerJobIds(user.id);

      if (!jobIds.length) {
        return ROUTES.ownerPostJob;
      }

      const hasApplicants = await hasOwnerApplicants(jobIds);

      if (hasApplicants) {
        return `${ROUTES.ownerDashboard}?focus=applicants`;
      }

      return ROUTES.ownerDashboard;
    }

    if (role === "seeker") {
      if (pendingAction?.jobId && pendingAction?.type) {
        const nextRoute = ROUTES.jobWithAction(
          pendingAction.jobId,
          pendingAction.type
        );

        clearPendingJobAction();
        return nextRoute;
      }

      const hasApplications = await hasSeekerApplications(user.id);

      if (hasApplications) {
        return `${ROUTES.seekerDashboard}?focus=status`;
      }

      const hasPreferences = await hasSeekerPreferences(user.id);

      if (hasPreferences) {
        return ROUTES.matchingJobs;
      }

      return ROUTES.browseJobs;
    }

    console.warn("Unknown role:", role);
    return ROUTES.browseJobs;
  } catch (error) {
    console.error("Smart entry route failed:", error);
    return ROUTES.browseJobs;
  }
}