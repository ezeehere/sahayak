import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Store,
  Wallet,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";

function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [job, setJob] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && id) {
      fetchJobDetails();
    }
  }, [user, id]);

  async function fetchJobDetails() {
    setLoading(true);

    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select(
        `
        *,
        shop_profiles (
          shop_name,
          category,
          address,
          opening_time,
          closing_time,
          is_verified
        )
      `
      )
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle();

    if (jobError) {
      console.log(jobError);
      setMessage(jobError.message);
      setLoading(false);
      return;
    }

    if (!jobData) {
      setMessage(t("jobNotFoundDesc"));
      setLoading(false);
      return;
    }

    setJob(jobData);

    const { data: ownerData, error: ownerError } = await supabase
      .from("profiles")
      .select("id, name, email, phone")
      .eq("id", jobData.owner_id)
      .maybeSingle();

    if (!ownerError && ownerData) {
      setOwner(ownerData);
    }

    const { data: savedData } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("job_id", id)
      .eq("seeker_id", user.id)
      .maybeSingle();

    setIsSaved(!!savedData);

    const { data: applicationData } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", id)
      .eq("seeker_id", user.id)
      .maybeSingle();

    setAlreadyApplied(!!applicationData);

    setLoading(false);
  }

  async function toggleSavedJob() {
    if (!job || !user?.id) return;

    if (isSaved) {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("job_id", job.id)
        .eq("seeker_id", user.id);

      if (error) {
        console.log(error);
        setMessage(error.message);
        return;
      }

      setIsSaved(false);
      setMessage(t("jobRemovedSaved"));
    } else {
      const { error } = await supabase.from("saved_jobs").insert({
        job_id: job.id,
        seeker_id: user.id,
      });

      if (error) {
        console.log(error);
        setMessage(error.message);
        return;
      }

      setIsSaved(true);
      setMessage(t("jobSavedSuccess"));
    }
  }

  async function applyJob() {
    if (!job || !user?.id) return;

    if (alreadyApplied) {
      setMessage(t("alreadyAppliedMessage"));
      return;
    }

    setMessage(t("submittingApplication"));

    const { error } = await supabase.from("applications").insert({
      job_id: job.id,
      seeker_id: user.id,
      owner_id: job.owner_id,
      status: "pending",
    });

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setAlreadyApplied(true);
    setMessage(t("applicationSubmittedSuccess"));
  }

  function getCleanPhone(phone) {
    if (!phone) return "";

    let cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }

    return cleanPhone;
  }

  const cleanPhone = getCleanPhone(owner?.phone);

  const whatsappText = job
    ? `Hello, I saw your job post on Sahayak: ${job.title}`
    : "";

  const whatsappLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`
    : "#";

  const callLink = cleanPhone ? `tel:+${cleanPhone}` : "#";

  if (!user?.id || loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("seekerPanel")}</p>
            <h1>{t("loadingJobDetails")}</h1>
            <p>{t("loadingJobDetailsDesc")}</p>
          </div>
        </main>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="mobile-empty-state">
            <h3>{t("jobNotFound")}</h3>
            <p>{message || t("jobNotFoundDesc")}</p>

            <Link to="/seeker/jobs" className="btn btn-primary">
              {t("backToJobs")}
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section job-details-page">
        <div className="mobile-detail-topbar">
          <Link to="/seeker/jobs" className="mobile-back-link">
            <ArrowLeft size={18} strokeWidth={2.8} />
            <span>{t("back")}</span>
          </Link>

          <button
            type="button"
            className={isSaved ? "mobile-save-button saved" : "mobile-save-button"}
            onClick={toggleSavedJob}
            aria-label={isSaved ? t("removeSaved") : t("saveJob")}
          >
            {isSaved ? (
              <BookmarkCheck size={20} strokeWidth={2.7} />
            ) : (
              <Bookmark size={20} strokeWidth={2.7} />
            )}
          </button>
        </div>

        <article className="details-card mobile-job-detail-card">
          <p className="tagline">{t("jobDetails")}</p>

          <div className="mobile-job-detail-head">
            <h1>{job.title}</h1>

            <p className="mobile-shop-line detail-shop-line">
              <Store size={15} strokeWidth={2.6} />
              <span>{job.shop_profiles?.shop_name || t("localShop")}</span>

              {job.shop_profiles?.is_verified && (
                <span className="tiny-verified">{t("verified")}</span>
              )}
            </p>
          </div>

          {message && <div className="message">{message}</div>}

          <div className="mobile-detail-summary">
            <div className="mobile-detail-pill salary-pill">
              <Wallet size={16} strokeWidth={2.7} />
              <div>
                <small>{t("salary")}</small>
                <strong>{job.salary}</strong>
              </div>
            </div>

            <div className="mobile-detail-pill">
              <Clock size={16} strokeWidth={2.7} />
              <div>
                <small>{t("timing")}</small>
                <strong>{job.timing}</strong>
              </div>
            </div>

            <div className="mobile-detail-pill">
              <MapPin size={16} strokeWidth={2.7} />
              <div>
                <small>{t("location")}</small>
                <strong>{job.location}</strong>
              </div>
            </div>

            <div className="mobile-detail-pill">
              <BriefcaseBusiness size={16} strokeWidth={2.7} />
              <div>
                <small>{t("jobType")}</small>
                <strong>{job.job_type}</strong>
              </div>
            </div>
          </div>

          <div className="mobile-main-actions">
            {alreadyApplied ? (
              <button className="btn btn-disabled" disabled>
                {t("alreadyApplied")}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={applyJob}>
                {t("applyNow")}
              </button>
            )}

            <div className="mobile-contact-actions">
              <a href={callLink} className="btn btn-light">
                <Phone size={17} strokeWidth={2.7} />
                {t("callOwner")}
              </a>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={17} strokeWidth={2.7} />
                {t("whatsapp")}
              </a>
            </div>
          </div>

          <section className="mobile-detail-section">
            <h3>{t("jobDescription")}</h3>
            <p>{job.description}</p>
          </section>

          <section className="mobile-detail-section">
            <h3>{t("shopInformation")}</h3>

            <div className="mobile-info-list">
              <p>
                <strong>{t("shopName")}:</strong>{" "}
                {job.shop_profiles?.shop_name || t("notAvailable")}
              </p>

              <p>
                <strong>{t("shopAddress")}:</strong>{" "}
                {job.shop_profiles?.address || t("notAvailable")}
              </p>

              <p>
                <strong>{t("openingTime")}:</strong>{" "}
                {job.shop_profiles?.opening_time || t("notMentioned")}
              </p>

              <p>
                <strong>{t("closingTime")}:</strong>{" "}
                {job.shop_profiles?.closing_time || t("notMentioned")}
              </p>
            </div>
          </section>

          <section className="mobile-detail-section">
            <h3>{t("ownerContact")}</h3>

            <div className="mobile-info-list">
              <p>
                <strong>{t("name")}:</strong> {owner?.name || t("notAvailable")}
              </p>

              <p>
                <strong>{t("phone")}:</strong>{" "}
                {owner?.phone || t("notAvailable")}
              </p>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}

export default JobDetails;