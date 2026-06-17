import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Clock,
  MapPin,
  Share2,
  MessageCircle,
  Phone,
  Store,
  Wallet,
  Flag,
  X,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";
import JobSafetyNotice from "../../components/JobSafetyNotice";

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

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  async function submitJobReport(e) {
    e.preventDefault();

    if (!user?.id || !job?.id) {
      setReportMessage(t("pleaseLoginAgain"));
      return;
    }

    if (!reportReason) {
      setReportMessage(t("pleaseSelectReason"));
      return;
    }

    setReportMessage(t("submittingReport"));

    const { error } = await supabase.from("job_reports").insert({
      job_id: job.id,
      reporter_id: user.id,
      reason: reportReason,
      details: reportDetails,
      status: "pending",
    });

    if (error) {
      console.log(error);
      setReportMessage(error.message);
      return;
    }

    setReportMessage(t("reportSubmittedSuccess"));

    setTimeout(() => {
      setShowReportModal(false);
      setReportReason("");
      setReportDetails("");
      setReportMessage("");
    }, 1200);
  }
  function getShopName() {
    return job?.shop_profiles?.shop_name || job?.offline_shop_name || t("localShop");
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

    const text = getShareText();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

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

  const cleanPhone = getCleanPhone(job?.offline_shop_phone || owner?.phone);

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
              <span>{getShopName()}</span>

              {(job.shop_profiles?.is_verified || job.offline_shop_verified) && (
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

          <JobSafetyNotice />

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

            <button
              type="button"
              className="btn whatsapp-share-btn detail-share-button"
              onClick={shareJobOnWhatsApp}
            >
              <Share2 size={17} strokeWidth={2.7} />
              {t("shareOnWhatsApp")}
            </button>

            <div className="detail-secondary-action-grid">
              <a
                href={cleanPhone ? `tel:${cleanPhone}` : undefined}
                className="btn call-owner-btn"
              >
                <Phone size={17} strokeWidth={2.7} />
                {t("callOwner")}
              </a>

              <button
                type="button"
                className="btn report-job-btn"
                onClick={() => setShowReportModal(true)}
              >
                <Flag size={17} strokeWidth={2.7} />
                {t("report")}
              </button>
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
                {job.offline_shop_phone || owner?.phone || t("notAvailable")}
              </p>
            </div>
          </section>
        </article>

        {showReportModal && (
          <div className="report-modal-backdrop">
            <div className="report-modal-card">
              <div className="report-modal-head">
                <div>
                  <span className="report-icon">
                    <AlertTriangle size={20} strokeWidth={2.8} />
                  </span>
                  <h2>{t("reportJob")}</h2>
                  <p>{t("reportJobDesc")}</p>
                </div>

                <button
                  type="button"
                  className="report-close-btn"
                  onClick={() => setShowReportModal(false)}
                >
                  <X size={20} strokeWidth={2.8} />
                </button>
              </div>

              {reportMessage && <div className="message">{reportMessage}</div>}

              <form className="report-form" onSubmit={submitJobReport}>
                <div>
                  <label>{t("reason")}</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                  >
                    <option value="">{t("selectReason")}</option>
                    <option value="already_filled">{t("jobAlreadyFilled")}</option>
                    <option value="fake_job">{t("fakeOrSuspiciousJob")}</option>
                    <option value="wrong_contact">{t("wrongContactNumber")}</option>
                    <option value="salary_mismatch">{t("salaryMismatch")}</option>
                    <option value="owner_not_responding">{t("ownerNotResponding")}</option>
                    <option value="asking_money">{t("askingForMoney")}</option>
                    <option value="other">{t("other")}</option>
                  </select>
                </div>

                <div>
                  <label>{t("detailsOptional")}</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows="4"
                    placeholder={t("reportDetailsPlaceholder")}
                  />
                </div>

                <button type="submit" className="btn report-submit-btn">
                  {t("submitReport")}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default JobDetails;