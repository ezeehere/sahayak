import { supabase } from "../lib/supabase";

export async function trackJobEvent({
  jobId,
  userId = null,
  eventType,
  source = "web",
}) {
  if (!jobId || !eventType) return;

  const { error } = await supabase.from("job_events").insert({
    job_id: jobId,
    user_id: userId,
    event_type: eventType,
    source,
  });

  if (error) {
    console.log("Analytics event failed:", error.message);
  }
}
