import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Clock,
  MapPin,
  Search,
  Store,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";

function BrowseJobs() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    setLoading(true);

    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select(
        `
        *,
        shop_profiles (
          shop_name,
          address,
          is_verified
        )
      `
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (jobError) {
      console.log(jobError);
      setMessage(jobError.message);
    } else {
      setJobs(jobData || []);
    }

    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (!categoryError) {
      setCategories(categoryData || []);
    }

    const { data: savedData, error: savedError } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("seeker_id", user.id);

    if (!savedError && savedData) {
      setSavedJobIds(savedData.map((item) => item.job_id));
    }

    setLoading(false);
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        job.title?.toLowerCase().includes(searchText) ||
        job.location?.toLowerCase().includes(searchText) ||
        job.category?.toLowerCase().includes(searchText) ||
        job.shop_profiles?.shop_name?.toLowerCase().includes(searchText);

      const matchesCategory = category ? job.category === category : true;

      return matchesSearch && matchesCategory;
    });
  }, [jobs, search, category]);

  async function toggleSavedJob(jobId) {
    if (!user?.id) {
      setMessage(t("loginAgain"));
      return;
    }

    const alreadySaved = savedJobIds.includes(jobId);

    if (alreadySaved) {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("job_id", jobId)
        .eq("seeker_id", user.id);

      if (error) {
        console.log(error);
        setMessage(error.message);
        return;
      }

      setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
      setMessage(t("jobRemovedSaved"));
    } else {
      const { error } = await supabase.from("saved_jobs").insert({
        job_id: jobId,
        seeker_id: user.id,
      });

      if (error) {
        console.log(error);
        setMessage(error.message);
        return;
      }

      setSavedJobIds([...savedJobIds, jobId]);
      setMessage(t("jobSavedSuccess"));
    }
  }

  if (!user?.id || loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("seekerPanel")}</p>
            <h1>{t("loadingJobs")}</h1>
            <p>{t("browseJobsDesc")}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section browse-jobs-page">
        <div className="dashboard-header browse-mobile-header">
          <p className="tagline">{t("seekerPanel")}</p>

          <h1>{t("browseJobs")}</h1>

          <p>{t("browseJobsDesc")}</p>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="mobile-search-panel">
          <div className="mobile-search-input">
            <Search size={18} strokeWidth={2.7} />
            <input
              type="text"
              placeholder={t("searchJobsPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t("allCategories")}</option>

            {categories.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          {(search || category) && (
            <button
              className="btn btn-light"
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
            >
              {t("reset")}
            </button>
          )}
        </div>

        <div className="mobile-results-head">
          <h2>
            {filteredJobs.length} {t("jobsFound")}
          </h2>

          {category && <span className="status-badge">{category}</span>}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="mobile-empty-state">
            <h3>{t("noJobsFound")}</h3>
            <p>{t("noJobsFoundDesc")}</p>
          </div>
        ) : (
          <>
            {/* Mobile clean list */}
            <div className="mobile-job-results">
              {filteredJobs.map((job) => {
                const saved = savedJobIds.includes(job.id);

                return (
                  <article className="mobile-job-card" key={job.id}>
                    <div className="mobile-job-top">
                      <div>
                        <h3>{job.title}</h3>

                        <p className="mobile-shop-line">
                          <Store size={14} strokeWidth={2.6} />
                          <span>{job.shop_profiles?.shop_name || t("localShop")}</span>

                          {job.shop_profiles?.is_verified && (
                            <span className="tiny-verified">{t("verified")}</span>
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        className={
                          saved
                            ? "mobile-save-button saved"
                            : "mobile-save-button"
                        }
                        onClick={() => toggleSavedJob(job.id)}
                        aria-label={saved ? t("removeSaved") : t("saveJob")}
                      >
                        {saved ? (
                          <BookmarkCheck size={20} strokeWidth={2.7} />
                        ) : (
                          <Bookmark size={20} strokeWidth={2.7} />
                        )}
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
                        to={`/seeker/jobs/${job.id}`}
                        className="btn btn-primary compact-detail-btn"
                      >
                        {t("viewDetails")}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Desktop old-style grid */}
            <div className="desktop-job-grid-only job-grid">
              {filteredJobs.map((job) => (
                <div className="job-card" key={job.id}>
                  <div className="job-top">
                    <h3>{job.title}</h3>
                    <span className="status-badge">{job.job_type}</span>
                  </div>

                  <p className="shop-name">
                    {job.shop_profiles?.shop_name || t("localShop")}

                    {job.shop_profiles?.is_verified && (
                      <span className="verified-badge">{t("verified")}</span>
                    )}
                  </p>

                  <div className="job-info">
                    <p>
                      <strong>{t("category")}:</strong> {job.category}
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
                      to={`/seeker/jobs/${job.id}`}
                      className="btn btn-primary"
                    >
                      {t("viewDetails")}
                    </Link>

                    <button
                      className="btn btn-light"
                      onClick={() => toggleSavedJob(job.id)}
                    >
                      {savedJobIds.includes(job.id)
                        ? t("removeSaved")
                        : t("saveJob")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default BrowseJobs;