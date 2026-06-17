import { supabase } from "../lib/supabase";
import { savePendingJobAction } from "./pendingJobAction";

export async function requireLoginForJobAction({ type, jobId }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return user;
  }

  savePendingJobAction({
    type,
    jobId,
    returnTo: window.location.pathname + window.location.search,
  });

  window.location.href = `/login?action=${type}&job=${jobId}`;
  return null;
}
