import { useState } from "react";
import { markJobAsFilled } from "../../utils/jobFilledPrompt";

export default function MarkJobFilledPrompt({ job, onMarkedFilled, onDismiss }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleMarkFilled() {
    try {
      setSaving(true);
      setError("");

      const updatedJob = await markJobAsFilled(job.id);
      onMarkedFilled?.(updatedJob);
    } catch {
      setError("Could not mark this job as filled. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-green-100 bg-green-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-green-900">
            Did you hire someone?
          </p>

          <p className="mt-1 text-sm text-green-800">
            Mark this job as filled so new seekers do not keep applying.
          </p>

          {job?.title && (
            <p className="mt-3 text-sm font-medium text-green-950">
              {job.title}
            </p>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:min-w-40">
          <button
            type="button"
            onClick={handleMarkFilled}
            disabled={saving}
            className="rounded-2xl bg-green-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Mark as filled"}
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="rounded-2xl border border-green-200 px-4 py-2.5 text-sm font-medium text-green-900"
          >
            Later
          </button>
        </div>
      </div>
    </section>
  );
}
