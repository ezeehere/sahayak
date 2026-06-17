import { supabase } from "../lib/supabase";
import {
  getPendingJobAction,
  clearPendingJobAction,
} from "./pendingJobAction";

const ROUTES = {
  login: "/login",

  browseJobs: "/browse-jobs",

  seekerDashboard: "/seeker/dashboard",
  matchingJobs: "/seeker/dashboard",

  ownerDashboard: "/owner/dashboard",
  ownerShopProfile: "/owner/shop-profile",
  ownerPostJob: "/owner/post-job",

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
  jobPreferencesUserId: "seeker_id",

  shopProfiles: "shop_profiles",
  shopOwnerId: "owner_id",

  jobs: "jobs",
  jobOwnerId: "owner_id",
};

async function hasAnyRow(query) {
  const { count, error } = await query.select("id", {
    count: "exact",
    head: true,
  });

  if (error) {
    console.error("Smart entry check failed:", error.message);
    return false;
  }

  return (count || 0) > 0;
}

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

async function seekerHasApplications(userId) {
  return hasAnyRow(
    supabase
      .from(DB.applications)
      .eq(DB.applicationSeekerId, userId)
  );
}

async function seekerHasPreferences(userId) {
  return hasAnyRow(
    supabase
      .from(DB.jobPreferences)
      .eq(DB.jobPreferencesUserId, userId)
  );
}

async function ownerHasShopProfile(userId) {
  return hasAnyRow(
    supabase
      .from(DB.shopProfiles)
      .eq(DB.shopOwnerId, userId)
  );
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

async function ownerHasApplicants(jobIds) {
  if (!jobIds.length) return false;

  return hasAnyRow(
    supabase
      .from(DB.applications)
      .in(DB.applicationJobId, jobIds)
  );
}

export async function getUserNextRoute(user) {
  if (!user?.id) return ROUTES.login;

  const profile = await getProfile(user.id);
  const role = profile?.[DB.profileRole];

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

    const hasShop = await ownerHasShopProfile(user.id);

    if (!hasShop) {
      return ROUTES.ownerShopProfile;
    }

    const jobIds = await getOwnerJobIds(user.id);

    if (!jobIds.length) {
      return ROUTES.ownerPostJob;
    }

    const hasApplicants = await ownerHasApplicants(jobIds);

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

    const hasApplications = await seekerHasApplications(user.id);

    if (hasApplications) {
      return `${ROUTES.seekerDashboard}?focus=status`;
    }

    const hasPreferences = await seekerHasPreferences(user.id);

    if (hasPreferences) {
      return ROUTES.matchingJobs;
    }

    return ROUTES.browseJobs;
  }

  return ROUTES.browseJobs;
}
