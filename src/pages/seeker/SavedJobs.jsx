import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookmarkX,
  BriefcaseBusiness,
  Clock,
  MapPin,
  Store,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";

function SavedJobs() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [savedJobs, setSavedJobs] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchSavedJobs();
    }
  }, [user]);

  async function fetchSavedJobs() {
    setLoading(true);

    const { data, error } = await supabase
      .from("saved_jobs")
      .select(
        `
        id,
        saved_at,
        jobs (
          *,
          shop_profiles (
            shop_name,
            is_verified,
            address
          )
        )
      `
      )
      .eq("seeker_id", user.id)
      .order("saved_at", { ascending: false });

    if (error) {
      console.log(error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setSavedJobs(data || []);
    setLoading(false);
  }

  async function removeSavedJob(savedId) {
    setMessage(t("removingSavedJob"));

    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("id", savedId)
      .eq("seeker_id", user.id);

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage(t("jobRemovedSaved"));
    setSavedJobs(savedJobs.filter((item) => item.id !== savedId));
  }

  if (!user?.id || loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("seekerPanel")}</p>
            <h1>{t("loadingSavedJobs")}</h1>
            <p>{t("savedJobsDesc")}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section saved-jobs-page">
        <div className="dashboard-header saved-mobile-header">
          <p className="tagline">{t("seekerPanel")}</p>

          <h1>{t("savedJobs")}</h1>

          <p>{t("savedJobsPageDesc")}</p>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="mobile-results-head">
          <h2>
            {savedJobs.length} {t("savedJobs")}
          </h2>

          <Link to="/browse-jobs" className="mobile-small-link">
            {t("browseJobs")}
          </Link>
        </div>

        {savedJobs.length === 0 ? (
          <div className="mobile-empty-state">
            <h3>{t("noSavedJobs")}</h3>
            <p>{t("noSavedJobsDesc")}</p>

            <Link to="/browse-jobs" className="btn btn-primary">
              {t("browseJobs")}
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile clean saved list */}
            <div className="mobile-saved-results">
              {savedJobs.map((item) => {
                const job = item.jobs;

                if (!job) return null;

                return (
                  <article className="mobile-job-card" key={item.id}>
                    <div className="mobile-job-top">
                      <div>
                        <h3>{job.title}</h3>

                        <p className="mobile-shop-line">
                          <Store size={14} strokeWidth={2.6} />
                          <span>{job.shop_profiles?.shop_name || job.offline_shop_name || t("localShop")}</span>

                          {(job.shop_profiles?.is_verified || job.offline_shop_verified) && (
                            <span className="tiny-verified">{t("verified")}</span>
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="mobile-save-button remove"
                        onClick={() => removeSavedJob(item.id)}
                        aria-label={t("removeSaved")}
                      >
                        <BookmarkX size={20} strokeWidth={2.7} />
                      </button>
                    </div>

                    <div className="mobile-job-meta">
                      <span>
                        <BriefcaseBusiness size={14} strokeWidth={2.6} />
                        {job.category}
                      </span>

                      <span>
                        <Clock size={14} strokeWidth={2.6} />
                        {job.timing}
                      </span>

                      <span>
                        <MapPin size={14} strokeWidth={2.6} />
                        {job.location}
                      </span>
                    </div>

                    <p className="mobile-job-desc">{job.description}</p>

                    <div className="mobile-job-bottom">
                      <div>
                        <strong>{job.salary}</strong>
                        <small>{job.job_type}</small>
                      </div>

                      <Link
                        to={`/jobs/${job.id}`}
                        className="btn btn-primary compact-detail-btn"
                      >
                        {t("viewDetails")}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Desktop grid */}
            <div className="desktop-job-grid-only job-grid">
              {savedJobs.map((item) => {
                const job = item.jobs;

                if (!job) return null;

                return (
                  <div className="job-card" key={item.id}>
                    <div className="job-top">
                      <h3>{job.title}</h3>
                      <span className={`status-badge status-${job.status}`}>
                        {t(job.status)}
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
                        {t("viewDetails")}
                      </Link>

                      <button
                        className="btn btn-light"
                        onClick={() => removeSavedJob(item.id)}
                      >
                        {t("removeSaved")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default SavedJobs;