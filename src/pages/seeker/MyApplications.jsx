import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function MyApplications() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchApplications();
    }
  }, [user]);

  async function fetchApplications() {
    setLoading(true);

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        id,
        status,
        applied_at,
        jobs (
          *,
          shop_profiles (
            shop_name,
            address,
            is_verified
          )
        )
      `
      )
      .eq("seeker_id", user.id)
      .order("applied_at", { ascending: false });

    if (error) {
      console.log(error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setApplications(data || []);
    setLoading(false);
  }

  function formatDate(dateValue) {
    if (!dateValue) return t("notAvailable");

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (!user?.id || loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("seekerPanel")}</p>
            <h1>{t("loadingApplications")}</h1>
            <p>{t("fetchingAppliedJobs")}</p>
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
          <p className="tagline">{t("seekerPanel")}</p>
          <h1>{t("myApplications")}</h1>
          <p>{t("myApplicationsPageDesc")}</p>
        </div>

        {message && <div className="message">{message}</div>}

        {applications.length === 0 ? (
          <div className="empty-box">
            <h3>{t("noApplicationsYet")}</h3>
            <p>{t("browseAndApplyMsg")}</p>

            <Link to="/browse-jobs" className="btn btn-primary">
              {t("browseJobs")}
            </Link>
          </div>
        ) : (
          <div className="job-grid">
            {applications.map((application) => {
              const job = application.jobs;

              if (!job) return null;

              return (
                <div className="job-card" key={application.id}>
                  <div className="job-top">
                    <h3>{job.title}</h3>

                    <span
                      className={`status-badge status-${application.status}`}
                    >
                      {t(application.status) || application.status}
                    </span>
                  </div>

                  <p className="shop-name">
                    {job.shop_profiles?.shop_name || job.offline_shop_name || t("localShop")}

                    {(job.shop_profiles?.is_verified || job.offline_shop_verified) && (
                      <span className="verified-badge">{t("verified")}</span>
                    )}
                  </p>

                  <div className="job-info">
                    <p>
                      <strong>{t("appliedOn")}:</strong>{" "}
                      {formatDate(application.applied_at)}
                    </p>

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
                  </div>

                  <p className="job-desc">{job.description}</p>

                  <div className="job-actions">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="btn btn-primary"
                    >
                      {t("viewJob")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

export default MyApplications;