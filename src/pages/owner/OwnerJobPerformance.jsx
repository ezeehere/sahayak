import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BriefcaseBusiness,
  Eye,
  MessageCircle,
  MousePointerClick,
  Phone,
  Send,
  Share2,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

function OwnerJobPerformance() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [jobs, setJobs] = useState([]);
  const [summary, setSummary] = useState({
    totalJobs: 0,
    totalViews: 0,
    totalShares: 0,
    totalApplications: 0,
    totalContacts: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchPerformance();
    }
  }, [user?.id]);

  async function fetchPerformance() {
    setLoading(true);

    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        salary,
        timing,
        location,
        status,
        hiring_status,
        created_at,
        offline_shop_name,
        shop_profiles (
          shop_name
        )
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (jobsError) {
      console.log(jobsError);
      setMessage(jobsError.message);
      setLoading(false);
      return;
    }

    const ownerJobs = jobsData || [];
    const jobIds = ownerJobs.map((job) => job.id);

    if (jobIds.length === 0) {
      setJobs([]);
      setSummary({
        totalJobs: 0,
        totalViews: 0,
        totalShares: 0,
        totalApplications: 0,
        totalContacts: 0,
      });
      setLoading(false);
      return;
    }

    const { data: eventsData, error: eventsError } = await supabase
      .from("job_events")
      .select("*")
      .in("job_id", jobIds);

    if (eventsError) {
      console.log(eventsError);
    }

    const { data: applicationsData, error: applicationsError } = await supabase
      .from("applications")
      .select("id, job_id, status")
      .eq("owner_id", user.id);

    if (applicationsError) {
      console.log(applicationsError);
    }

    const eventMap = {};
    const applicationMap = {};

    jobIds.forEach((id) => {
      eventMap[id] = {
        job_view: 0,
        job_share: 0,
        apply_click: 0,
        call_click: 0,
        whatsapp_click: 0,
      };

      applicationMap[id] = {
        total: 0,
        pending: 0,
        shortlisted: 0,
        hired: 0,
        rejected: 0,
      };
    });

    (eventsData || []).forEach((event) => {
      if (!eventMap[event.job_id]) return;

      if (eventMap[event.job_id][event.event_type] !== undefined) {
        eventMap[event.job_id][event.event_type] += 1;
      }
    });

    (applicationsData || []).forEach((application) => {
      if (!applicationMap[application.job_id]) return;

      applicationMap[application.job_id].total += 1;

      if (applicationMap[application.job_id][application.status] !== undefined) {
        applicationMap[application.job_id][application.status] += 1;
      }
    });

    const finalJobs = ownerJobs.map((job) => {
      const events = eventMap[job.id];
      const applications = applicationMap[job.id];

      const contacts = events.call_click + events.whatsapp_click;

      const performanceScore =
        events.job_view +
        events.job_share * 2 +
        events.apply_click * 3 +
        contacts * 4 +
        applications.total * 5;

      return {
        ...job,
        events,
        applications,
        contacts,
        performanceScore,
      };
    });

    setJobs(finalJobs);

    setSummary({
      totalJobs: finalJobs.length,
      totalViews: finalJobs.reduce((sum, job) => sum + job.events.job_view, 0),
      totalShares: finalJobs.reduce((sum, job) => sum + job.events.job_share, 0),
      totalApplications: finalJobs.reduce(
        (sum, job) => sum + job.applications.total,
        0
      ),
      totalContacts: finalJobs.reduce((sum, job) => sum + job.contacts, 0),
    });

    setLoading(false);
  }

  function getShopName(job) {
    return job.shop_profiles?.shop_name || job.offline_shop_name || t("localShop");
  }

  function getPerformanceLabel(score) {
    if (score >= 50) return t("highInterest");
    if (score >= 20) return t("goodInterest");
    if (score > 0) return t("gettingStarted");
    return t("noEngagementYet");
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">{t("ownerInsights")}</p>
          <h1>{t("jobPerformance")}</h1>
          <p>{t("jobPerformanceDesc")}</p>
        </div>

        <div className="section-title-row performance-title-row">
          <div>
            <p className="tagline">{t("overview")}</p>
            <h2>{t("yourHiringPerformance")}</h2>
          </div>

          <Link to="/owner/dashboard" className="btn btn-light">
            <ArrowLeft size={17} strokeWidth={2.7} />
            {t("back")}
          </Link>
        </div>

        {message && <div className="message">{message}</div>}

        {loading ? (
          <div className="empty-state">{t("loading")}</div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <BriefcaseBusiness size={36} strokeWidth={2.5} />
            <h3>{t("noJobsPostedYet")}</h3>
            <p>{t("noJobsPostedYetDesc")}</p>
            <Link to="/owner/post-job" className="btn btn-primary">
              {t("postJob")}
            </Link>
          </div>
        ) : (
          <>
            <section className="owner-performance-summary-grid">
              <article>
                <Eye size={20} strokeWidth={2.7} />
                <strong>{summary.totalViews}</strong>
                <span>{t("jobViews")}</span>
              </article>

              <article>
                <Share2 size={20} strokeWidth={2.7} />
                <strong>{summary.totalShares}</strong>
                <span>{t("jobShares")}</span>
              </article>

              <article>
                <Send size={20} strokeWidth={2.7} />
                <strong>{summary.totalApplications}</strong>
                <span>{t("applications")}</span>
              </article>

              <article>
                <Phone size={20} strokeWidth={2.7} />
                <strong>{summary.totalContacts}</strong>
                <span>{t("contactClicks")}</span>
              </article>
            </section>

            <section className="owner-performance-list">
              {jobs.map((job) => (
                <article className="owner-performance-card" key={job.id}>
                  <div className="owner-performance-top">
                    <span className="owner-performance-icon">
                      <BriefcaseBusiness size={21} strokeWidth={2.7} />
                    </span>

                    <div>
                      <h3>{job.title}</h3>
                      <p>
                        {getShopName(job)} • {job.location}
                      </p>
                    </div>

                    <span
                      className={
                        job.hiring_status === "filled"
                          ? "job-status-pill filled"
                          : "job-status-pill open"
                      }
                    >
                      {job.hiring_status === "filled" ? t("filled") : t("open")}
                    </span>
                  </div>

                  <div className="owner-performance-score">
                    <div>
                      <p>{t("performanceScore")}</p>
                      <h2>{job.performanceScore}</h2>
                    </div>

                    <span>
                      <TrendingUp size={16} strokeWidth={2.7} />
                      {getPerformanceLabel(job.performanceScore)}
                    </span>
                  </div>

                  <div className="owner-job-metrics-grid">
                    <div>
                      <Eye size={17} strokeWidth={2.7} />
                      <strong>{job.events.job_view}</strong>
                      <span>{t("views")}</span>
                    </div>

                    <div>
                      <Share2 size={17} strokeWidth={2.7} />
                      <strong>{job.events.job_share}</strong>
                      <span>{t("shares")}</span>
                    </div>

                    <div>
                      <MousePointerClick size={17} strokeWidth={2.7} />
                      <strong>{job.events.apply_click}</strong>
                      <span>{t("applyClicksShort")}</span>
                    </div>

                    <div>
                      <Phone size={17} strokeWidth={2.7} />
                      <strong>{job.events.call_click}</strong>
                      <span>{t("calls")}</span>
                    </div>

                    <div>
                      <MessageCircle size={17} strokeWidth={2.7} />
                      <strong>{job.events.whatsapp_click}</strong>
                      <span>WhatsApp</span>
                    </div>

                    <div>
                      <Send size={17} strokeWidth={2.7} />
                      <strong>{job.applications.total}</strong>
                      <span>{t("applications")}</span>
                    </div>
                  </div>

                  <div className="owner-performance-actions">
                    <Link to={`/owner/jobs`} className="btn btn-light">
                      {t("manageJobs")}
                    </Link>

                    <Link to={`/jobs/${job.id}`} className="btn btn-primary">
                      {t("viewPublicPage")}
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </>
  );
}

export default OwnerJobPerformance;
