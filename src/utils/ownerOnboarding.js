import { supabase } from "../lib/supabase";

const DB = {
  shopProfiles: "shop_profiles",
  shopOwnerId: "owner_id",

  jobs: "jobs",
  jobOwnerId: "owner_id",
};

export async function getOwnerSetupState(userId) {
  const { data: shopProfile, error: shopError } = await supabase
    .from(DB.shopProfiles)
    .select("*")
    .eq(DB.shopOwnerId, userId)
    .maybeSingle();

  if (shopError) {
    console.error("Owner shop check failed:", shopError.message);
  }

  const { data: jobs, error: jobError } = await supabase
    .from(DB.jobs)
    .select("id, title, status, created_at")
    .eq(DB.jobOwnerId, userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (jobError) {
    console.error("Owner jobs check failed:", jobError.message);
  }

  return {
    shopProfile: shopProfile || null,
    jobs: jobs || [],
    hasShopProfile: Boolean(shopProfile),
    hasJobs: Boolean(jobs?.length),
  };
}

export function isOwnerSetupMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("setup") === "1" || params.get("firstJob") === "1";
}
