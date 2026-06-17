import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function MyJobs() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [applicationCounts, setApplicationCounts] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchMyJobs();
    }
  }, [user]);

  async function fetchMyJobs() {
    setLoading(true);

    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select(
        `
        *,
        shop_profiles (
          shop_name,
          is_verified
        )
      `
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (jobError) {
      console.log(jobError);
      setMessage(jobError.message);
      setLoading(false);
      return;
    }

    setJobs(jobData || []);

    const { data: appData, error: appError } = await supabase
      .from("applications")
      .select("job_id")
      .eq("owner_id", user.id);

    if (!appError && appData) {
      const counts = {};

      appData.forEach((application) => {
        counts[application.job_id] = (counts[application.job_id] || 0) + 1;
      });

      setApplicationCounts(counts);
    }

    setLoading(false);
  }

  async function updateStatus(jobId, newStatus) {
    setMessage(t("updatingJobStatus"));

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId)
      .eq("owner_id", user.id);

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage(t("jobStatusUpdatedSuccess"));
    fetchMyJobs();
  }

  async function toggleJobHiringStatus(job) {
    const nextStatus = job.hiring_status === "filled" ? "open" : "filled";

    const updateData =
      nextStatus === "filled"
        ? {
            hiring_status: "filled",
            filled_at: new Date().toISOString(),
            last_checked_at: new Date().toISOString(),
          }
        : {
            hiring_status: "open",
            filled_at: null,
            last_checked_at: new Date().toISOString(),
          };

    const { error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", job.id);

    if (error) {
      console.log(error);
      return;
    }

    fetchMyJobs();
  }

  if (!user?.id || loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("ownerPanel")}</p>
            <h1>{t("loadingJobs")}</h1>
            <p>{t("fetchingPostedJobs")}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">{t("ownerPanel")}</p>
          <h1>{t("myJobs")}</h1>
          <p>{t("myJobsPageDesc")}</p>
        </div>

        {message && <div className="message">{message}</div>}

        {jobs.length === 0 ? (
          <div className="empty-box">
            <h3>{t("noJobsPostedYet")}</h3>
            <p>{t("createFirstJobDesc")}</p>
            <Link to="/owner/post-job" className="btn btn-primary">
              {t("postJob")}
            </Link>
          </div>
        ) : (
          <div className="job-grid">
            {jobs.map((job) => (
              <div className="job-card" key={job.id}>
                <div className="job-top">
                  <h3>{job.title}</h3>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span
                      className={
                        job.hiring_status === "filled"
                          ? "job-status-pill filled"
                          : "job-status-pill open"
                      }
                    >
                      {job.hiring_status === "filled" ? t("filled") : t("open")}
                    </span>
                    <span className={`status-badge status-${job.status}`}>
                      {t(job.status) || job.status}
                    </span>
                  </div>
                </div>

                <p className="shop-name">
                  {job.shop_profiles?.shop_name || t("myShop")}

                  {job.shop_profiles?.is_verified && (
                    <span className="verified-badge">{t("verified")}</span>
                  )}
                </p>

                <div className="job-info">
                  <p>
                    <strong>{t("category")}:</strong> {job.category}
                  </p>
                  <p>
                    <strong>{t("jobType")}:</strong> {job.job_type}
                  </p>
                  <p>
                    <strong>{t("salary")}:</strong> {job.salary}
                  </p>
                  <p>
                    <strong>{t("timing")}:</strong> {job.timing}
                  </p>
                  <p>
                    <strong>{t("location")}:</strong> {job.location}
                  </p>
                  <p>
                    <strong>{t("applicants")}:</strong>{" "}
                    {applicationCounts[job.id] || 0}
                  </p>
                </div>

                <p className="job-desc">{job.description}</p>

                <div className="job-actions">
                  <Link to="/owner/applicants" className="btn btn-primary">
                    {t("viewApplicants")}
                  </Link>

                  <button
                    type="button"
                    className={
                      job.hiring_status === "filled"
                        ? "btn reopen-job-btn"
                        : "btn mark-filled-btn"
                    }
                    onClick={() => toggleJobHiringStatus(job)}
                  >
                    {job.hiring_status === "filled" ? t("reopenJob") : t("markAsFilled")}
                  </button>

                  {job.status === "closed" ? (
                    <button
                      className="btn btn-light"
                      onClick={() => updateStatus(job.id, "approved")}
                    >
                      {t("reopenJob")}
                    </button>
                  ) : (
                    <button
                      className="btn btn-light"
                      onClick={() => updateStatus(job.id, "closed")}
                    >
                      {t("closeJob")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default MyJobs;