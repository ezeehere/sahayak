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
  Share2,
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
  function getShopName(job) {
    return job.shop_profiles?.shop_name || job.offline_shop_name || t("localShop");
  }

  function isVerifiedJob(job) {
    return job.shop_profiles?.is_verified || job.offline_shop_verified;
  }

  function getShareText(job) {
    const jobUrl = `${window.location.origin}/jobs/${job.id}`;

    return `Sahayak Job Alert

${job.title}
Shop: ${getShopName(job)}
Salary: ${job.salary}
Timing: ${job.timing}
Location: ${job.location}

View job:
${jobUrl}`;
  }

  function shareJobOnWhatsApp(job) {
    const text = getShareText(job);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  function getExpiryText(job) {
    if (!job.expires_at) return t("noExpiry");

    const today = new Date();
    const expiry = new Date(job.expires_at);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return t("expired");
    if (diffDays === 0) return t("expiresToday");
    if (diffDays === 1) return t("expiresTomorrow");

    return `${t("expiresIn")} ${diffDays} ${t("days")}`;
  }


  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    setLoading(true);

    const today = new Date().toISOString().slice(0, 10);
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
      .eq("hiring_status", "open")
      .gte("expires_at", today)
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
                          <span>{getShopName(job)}</span>

                          {isVerifiedJob(job) && (
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

                      <span className="job-freshness-pill">
                        {getExpiryText(job)}
                      </span>
                    </div>

                    <p className="mobile-job-desc">{job.description}</p>

                    <div className="mobile-job-bottom">
                      <div>
                        <strong>{job.salary}</strong>
                        <small>{job.job_type}</small>
                      </div>

                      <div className="mobile-job-action-buttons">
                        <button
                          type="button"
                          className="btn whatsapp-share-btn compact-share-btn"
                          onClick={() => shareJobOnWhatsApp(job)}
                        >
                          <Share2 size={15} strokeWidth={2.7} />
                          {t("share")}
                        </button>

                        <Link
                          to={`/seeker/jobs/${job.id}`}
                          className="btn btn-primary compact-detail-btn"
                        >
                          {t("viewDetails")}
                        </Link>
                      </div>
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
                    {getShopName(job)}

                    {isVerifiedJob(job) && (
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
                    <p>
                      <span className="job-freshness-pill">
                        {getExpiryText(job)}
                      </span>
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

                    <button
                      type="button"
                      className="btn whatsapp-share-btn"
                      onClick={() => shareJobOnWhatsApp(job)}
                    >
                      <Share2 size={16} strokeWidth={2.7} />
                      {t("shareOnWhatsApp")}
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