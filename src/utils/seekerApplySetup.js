import { supabase } from "../lib/supabase";

const DB = {
  profiles: "profiles",
  userId: "id",

  fullName: "name", // Table uses name for user full name values
  phone: "phone",
  area: "area",
  shortIntro: "short_intro",
};

export function isSeekerApplySetupComplete(profile) {
  if (!profile) return false;

  return Boolean(
    profile[DB.fullName]?.trim() &&
      profile[DB.phone]?.trim() &&
      profile[DB.area]?.trim()
  );
}

export async function getSeekerApplySetup(userId) {
  const { data, error } = await supabase
    .from(DB.profiles)
    .select("*")
    .eq(DB.userId, userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch seeker setup:", error.message);
    return {
      profile: null,
      isComplete: false,
    };
  }

  return {
    profile: data,
    isComplete: isSeekerApplySetupComplete(data),
  };
}

export async function saveSeekerApplySetup(userId, values) {
  const payload = {
    [DB.fullName]: values.fullName?.trim(),
    [DB.phone]: values.phone?.trim(),
    [DB.area]: values.area?.trim(),
    [DB.shortIntro]: values.shortIntro?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(DB.profiles)
    .update(payload)
    .eq(DB.userId, userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Failed to save seeker setup:", error.message);
    throw error;
  }

  return data;
}
