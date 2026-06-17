import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Clock,
  LogIn,
  MapPin,
  Send,
  Share2,
  Store,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import JobSafetyNotice from "../components/JobSafetyNotice";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function PublicJobDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicJob();
  }, [id]);

  async function fetchPublicJob() {
    setLoading(true);

    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        category,
        description,
        job_type,
        salary,
        timing,
        location,
        created_at,
        expires_at,
        hiring_status,
        offline_shop_name,
        offline_shop_address,
        offline_shop_category,
        offline_shop_verified,
        shop_profiles (
          shop_name,
          address,
          category,
          is_verified
        )
      `)
      .eq("id", id)
      .eq("status", "approved")
      .eq("hiring_status", "open")
      .gte("expires_at", today)
      .maybeSingle();

    if (error) {
      console.log(error);
    }

    setJob(data || null);
    setLoading(false);
  }

  function getShopName() {
    return job?.shop_profiles?.shop_name || job?.offline_shop_name || t("localShop");
  }

  function getShopAddress() {
    return job?.shop_profiles?.address || job?.offline_shop_address || job?.location;
  }

  function isVerifiedJob() {
    return job?.shop_profiles?.is_verified || job?.offline_shop_verified;
  }

  function getShareText() {
    const jobUrl = `${window.location.origin}/jobs/${job.id}`;

    return `Sahayak Job Alert

${job.title}
Shop: ${getShopName()}
Salary: ${job.salary}
Timing: ${job.timing}
Location: ${job.location}

View job:
${jobUrl}`;
  }

  function shareJobOnWhatsApp() {
    if (!job) return;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(getShareText())}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  function getApplyLink() {
    if (user && profile?.role === "seeker") {
      return `/seeker/jobs/${job.id}`;
    }

    return `/login?redirect=/seeker/jobs/${job.id}`;
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="public-job-page">
          <div className="public-job-shell">
            <div className="public-job-card">
              <p>{t("loading")}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <main className="public-job-page">
          <div className="public-job-shell">
            <Link to="/" className="auth-back-link">
              <ArrowLeft size={18} strokeWidth={2.8} />
              <span>{t("backToHome")}</span>
            </Link>

            <div className="public-job-card public-job-empty">
              <h1>{t("jobNoLongerAvailable")}</h1>
              <p>{t("jobNoLongerAvailableDesc")}</p>

              <Link to="/" className="btn btn-primary">
                {t("goToHome")}
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="public-job-page">
        <div className="public-job-shell">
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={18} strokeWidth={2.8} />
            <span>{t("backToHome")}</span>
          </Link>

          <section className="public-job-card">
            <div className="public-job-brand-row">
              <span className="public-job-logo">
                <img src="/sahayak-icon.svg" alt="Sahayak" />
              </span>

              <div>
                <p className="tagline">{t("sharedJob")}</p>
                <strong>{t("appName")}</strong>
              </div>
            </div>

            <div className="public-job-head">
              <div>
                <div className="public-shop-line">
                  <Store size={17} strokeWidth={2.7} />
                  <span>{getShopName()}</span>

                  {isVerifiedJob() && (
                    <span className="tiny-verified">
                      <BadgeCheck size={13} strokeWidth={2.8} />
                      {t("verified")}
                    </span>
                  )}
                </div>

                <h1>{job.title}</h1>

                <p>
                  {job.category} • {job.job_type}
                </p>
              </div>
            </div>

            <div className="public-job-meta-grid">
              <div>
                <BriefcaseBusiness size={18} strokeWidth={2.7} />
                <span>{job.salary}</span>
              </div>

              <div>
                <Clock size={18} strokeWidth={2.7} />
                <span>{job.timing}</span>
              </div>

              <div>
                <MapPin size={18} strokeWidth={2.7} />
                <span>{job.location}</span>
              </div>
            </div>

            <div className="public-job-section">
              <h2>{t("description")}</h2>
              <p>{job.description}</p>
            </div>

            <div className="public-job-section">
              <h2>{t("shopLocation")}</h2>
              <p>{getShopAddress()}</p>
            </div>

            <JobSafetyNotice />

            <div className="public-job-actions">
              <Link to={getApplyLink()} className="btn btn-primary public-apply-btn">
                {user ? (
                  <>
                    <Send size={17} strokeWidth={2.7} />
                    {t("applyNow")}
                  </>
                ) : (
                  <>
                    <LogIn size={17} strokeWidth={2.7} />
                    {t("loginToApply")}
                  </>
                )}
              </Link>

              <button
                type="button"
                className="btn whatsapp-share-btn public-share-btn"
                onClick={shareJobOnWhatsApp}
              >
                <Share2 size={17} strokeWidth={2.7} />
                {t("shareOnWhatsApp")}
              </button>
            </div>

            {!user && (
              <p className="public-login-note">
                {t("publicJobLoginNote")}
              </p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default PublicJobDetails;
