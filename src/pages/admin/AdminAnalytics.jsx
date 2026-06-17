import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  MousePointerClick,
  Send,
  Share2,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext";

function AdminAnalytics() {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [stats, setStats] = useState({
    totalUsers: 0,
    seekers: 0,
    owners: 0,
    shops: 0,
    verifiedShops: 0,
    totalJobs: 0,
    activeJobs: 0,
    filledJobs: 0,
    applications: 0,
    hired: 0,
    reports: 0,
    pendingReports: 0,
  });

  const [eventStats, setEventStats] = useState({
    job_view: 0,
    job_share: 0,
    apply_click: 0,
    call_click: 0,
    whatsapp_click: 0,
  });

  const [topJobs, setTopJobs] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function getCount(table, filters = []) {
    let query = supabase.from(table).select("*", {
      count: "exact",
      head: true,
    });

    filters.forEach((filter) => {
      query = query[filter.method](filter.column, filter.value);
    });

    const { count, error } = await query;

    if (error) {
      console.log(error);
      return 0;
    }

    return count || 0;
  }

  async function fetchAnalytics() {
    setLoading(true);

    const today = new Date().toISOString().slice(0, 10);

    try {
      const [
        totalUsers,
        seekers,
        owners,
        shops,
        verifiedShops,
        totalJobs,
        activeJobs,
        filledJobs,
        applications,
        hired,
        reports,
        pendingReports,
      ] = await Promise.all([
        getCount("profiles"),
        getCount("profiles", [{ method: "eq", column: "role", value: "seeker" }]),
        getCount("profiles", [{ method: "eq", column: "role", value: "owner" }]),

        getCount("shop_profiles"),
        getCount("shop_profiles", [
          { method: "eq", column: "is_verified", value: true },
        ]),

        getCount("jobs"),
        getCount("jobs", [
          { method: "eq", column: "status", value: "approved" },
          { method: "eq", column: "hiring_status", value: "open" },
          { method: "gte", column: "expires_at", value: today },
        ]),
        getCount("jobs", [
          { method: "eq", column: "hiring_status", value: "filled" },
        ]),

        getCount("applications"),
        getCount("applications", [{ method: "eq", column: "status", value: "hired" }]),

        getCount("job_reports"),
        getCount("job_reports", [{ method: "eq", column: "status", value: "pending" }]),
      ]);

      setStats({
        totalUsers,
        seekers,
        owners,
        shops,
        verifiedShops,
        totalJobs,
        activeJobs,
        filledJobs,
        applications,
        hired,
        reports,
        pendingReports,
      });

      await fetchEventAnalytics();
    } catch (error) {
      console.log(error);
      setMessage(error.message);
    }

    setLoading(false);
  }

  async function fetchEventAnalytics() {
    const { data, error } = await supabase
      .from("job_events")
      .select(`
        *,
        jobs (
          id,
          title,
          salary,
          location,
          offline_shop_name,
          shop_profiles (
            shop_name
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.log(error);
      return;
    }

    const events = data || [];

    const counts = {
      job_view: 0,
      job_share: 0,
      apply_click: 0,
      call_click: 0,
      whatsapp_click: 0,
    };

    const jobMap = {};

    events.forEach((event) => {
      if (counts[event.event_type] !== undefined) {
        counts[event.event_type] += 1;
      }

      if (!event.job_id) return;

      if (!jobMap[event.job_id]) {
        jobMap[event.job_id] = {
          jobId: event.job_id,
          title: event.jobs?.title || "Job",
          shop:
            event.jobs?.shop_profiles?.shop_name ||
            event.jobs?.offline_shop_name ||
            "Local Shop",
          location: event.jobs?.location || "",
          views: 0,
          shares: 0,
          applyClicks: 0,
          calls: 0,
          whatsapps: 0,
          total: 0,
        };
      }

      jobMap[event.job_id].total += 1;

      if (event.event_type === "job_view") jobMap[event.job_id].views += 1;
      if (event.event_type === "job_share") jobMap[event.job_id].shares += 1;
      if (event.event_type === "apply_click") jobMap[event.job_id].applyClicks += 1;
      if (event.event_type === "call_click") jobMap[event.job_id].calls += 1;
      if (event.event_type === "whatsapp_click") jobMap[event.job_id].whatsapps += 1;
    });

    setEventStats(counts);

    setTopJobs(
      Object.values(jobMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)
    );
  }

  const statCards = [
    {
      label: t("totalUsers"),
      value: stats.totalUsers,
      icon: UsersRound,
    },
    {
      label: t("jobSeekers"),
      value: stats.seekers,
      icon: UserRound,
    },
    {
      label: t("shopOwners"),
      value: stats.owners,
      icon: Building2,
    },
    {
      label: t("activeJobs"),
      value: stats.activeJobs,
      icon: BriefcaseBusiness,
    },
    {
      label: t("applications"),
      value: stats.applications,
      icon: Send,
    },
    {
      label: t("successfulHires"),
      value: stats.hired,
      icon: CheckCircle2,
    },
    {
      label: t("verifiedShops"),
      value: stats.verifiedShops,
      icon: BadgeCheck,
    },
    {
      label: t("pendingReports"),
      value: stats.pendingReports,
      icon: AlertTriangle,
    },
  ];

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">{t("startupMetrics")}</p>
          <h1>{t("adminAnalytics")}</h1>
          <p>{t("adminAnalyticsDesc")}</p>
        </div>

        <div className="section-title-row analytics-title-row">
          <div>
            <p className="tagline">{t("overview")}</p>
            <h2>{t("platformHealth")}</h2>
          </div>

          <Link to="/admin/dashboard" className="btn btn-light">
            <ArrowLeft size={17} strokeWidth={2.7} />
            {t("back")}
          </Link>
        </div>

        {message && <div className="message">{message}</div>}

        {loading ? (
          <div className="empty-state">{t("loading")}</div>
        ) : (
          <>
            <section className="analytics-stats-grid">
              {statCards.map((item) => {
                const Icon = item.icon;

                return (
                  <article className="analytics-stat-card" key={item.label}>
                    <span>
                      <Icon size={20} strokeWidth={2.7} />
                    </span>

                    <div>
                      <strong>{item.value}</strong>
                      <p>{item.label}</p>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="analytics-panel-grid">
              <article className="analytics-panel">
                <div className="analytics-panel-head">
                  <div>
                    <p className="tagline">{t("engagement")}</p>
                    <h2>{t("jobEngagement")}</h2>
                  </div>

                  <Activity size={24} strokeWidth={2.7} />
                </div>

                <div className="event-metrics-grid">
                  <div>
                    <MousePointerClick size={18} strokeWidth={2.7} />
                    <strong>{eventStats.job_view}</strong>
                    <span>{t("jobViews")}</span>
                  </div>

                  <div>
                    <Share2 size={18} strokeWidth={2.7} />
                    <strong>{eventStats.job_share}</strong>
                    <span>{t("jobShares")}</span>
                  </div>

                  <div>
                    <Send size={18} strokeWidth={2.7} />
                    <strong>{eventStats.apply_click}</strong>
                    <span>{t("applyClicks")}</span>
                  </div>

                  <div>
                    <MousePointerClick size={18} strokeWidth={2.7} />
                    <strong>{eventStats.call_click}</strong>
                    <span>{t("callClicks")}</span>
                  </div>

                  <div>
                    <MousePointerClick size={18} strokeWidth={2.7} />
                    <strong>{eventStats.whatsapp_click}</strong>
                    <span>{t("whatsappClicks")}</span>
                  </div>
                </div>
              </article>

              <article className="analytics-panel">
                <div className="analytics-panel-head">
                  <div>
                    <p className="tagline">{t("operations")}</p>
                    <h2>{t("marketplaceStatus")}</h2>
                  </div>

                  <BriefcaseBusiness size={24} strokeWidth={2.7} />
                </div>

                <div className="marketplace-status-list">
                  <div>
                    <span>{t("totalJobs")}</span>
                    <strong>{stats.totalJobs}</strong>
                  </div>

                  <div>
                    <span>{t("activeJobs")}</span>
                    <strong>{stats.activeJobs}</strong>
                  </div>

                  <div>
                    <span>{t("filledJobs")}</span>
                    <strong>{stats.filledJobs}</strong>
                  </div>

                  <div>
                    <span>{t("totalReports")}</span>
                    <strong>{stats.reports}</strong>
                  </div>

                  <div>
                    <span>{t("shops")}</span>
                    <strong>{stats.shops}</strong>
                  </div>

                  <div>
                    <span>{t("verifiedShops")}</span>
                    <strong>{stats.verifiedShops}</strong>
                  </div>
                </div>
              </article>
            </section>

            <section className="analytics-panel">
              <div className="analytics-panel-head">
                <div>
                  <p className="tagline">{t("topJobs")}</p>
                  <h2>{t("mostEngagedJobs")}</h2>
                </div>
              </div>

              {topJobs.length === 0 ? (
                <div className="empty-state">
                  <p>{t("noAnalyticsYet")}</p>
                </div>
              ) : (
                <div className="top-jobs-list">
                  {topJobs.map((job) => (
                    <Link
                      to={`/jobs/${job.jobId}`}
                      className="top-job-row"
                      key={job.jobId}
                    >
                      <div>
                        <h3>{job.title}</h3>
                        <p>
                          {job.shop} {job.location ? `• ${job.location}` : ""}
                        </p>
                      </div>

                      <div className="top-job-metrics">
                        <span>{job.views} {t("views")}</span>
                        <span>{job.shares} {t("shares")}</span>
                        <span>{job.applyClicks} {t("applyClicksShort")}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

export default AdminAnalytics;
