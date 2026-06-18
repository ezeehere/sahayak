import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";
import { getOwnerSetupState } from "../../utils/ownerOnboarding";
import { getOwnerApplicantDashboardData } from "../../utils/ownerApplicantData";
import OwnerApplicantFirstPanel from "../../components/owner/OwnerApplicantFirstPanel";
import MarkJobFilledPrompt from "../../components/owner/MarkJobFilledPrompt";
import { shouldPromptMarkFilled } from "../../utils/jobFilledPrompt";
import NextBestActionCards from "../../components/dashboard/NextBestActionCards";
import { getOwnerNextBestActions } from "../../utils/nextBestActions";
import InAppMoment from "../../components/common/InAppMoment";
import { getOwnerMoments, getUrlNoticeMoment } from "../../utils/inAppMoments";
import JobFreshnessBadge from "../../components/jobs/JobFreshnessBadge";
import JobFreshnessMeta from "../../components/jobs/JobFreshnessMeta";

function OwnerDashboard() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [shopProfile, setShopProfile] = useState(null);

  const [ownerApplicantData, setOwnerApplicantData] = useState({
    jobs: [],
    applicants: [],
    stats: {
      totalJobs: 0,
      totalApplicants: 0,
      unreadApplicants: 0,
      pendingApplicants: 0,
      shortlistedApplicants: 0,
    },
  });

  const [loadingApplicants, setLoadingApplicants] = useState(true);

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0,
    applicants: 0,
    pendingApplicants: 0,
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [pendingApplicants, setPendingApplicants] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingSetup, setCheckingSetup] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const focus = params.get("focus");
  const shouldShowApplicantsFirst = focus === "applicants" || ownerApplicantData.applicants.length > 0;

  const [dismissedFilledPrompts, setDismissedFilledPrompts] = useState([]);

  const jobsNeedingFilledPrompt = ownerApplicantData.jobs.filter((job) => {
    const jobApplicants = ownerApplicantData.applicants.filter(
      (applicant) => applicant.job_id === job.id
    );

    const dismissed = dismissedFilledPrompts.includes(job.id);

    return !dismissed && shouldPromptMarkFilled({
      job,
      applicants: jobApplicants,
    });
  });

  const ownerNextActions = getOwnerNextBestActions({
    jobs: ownerApplicantData.jobs,
    applicants: ownerApplicantData.applicants,
    stats: ownerApplicantData.stats,
  });

  const urlNoticeMoment = getUrlNoticeMoment();

  const ownerMoments = [
    ...(urlNoticeMoment ? [urlNoticeMoment] : []),
    ...getOwnerMoments({
      applicants: ownerApplicantData.applicants,
      stats: ownerApplicantData.stats,
    }),
  ];

  useEffect(() => {
    async function checkOwnerSetupAndLoadDashboard() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        window.location.href = "/login";
        return;
      }

      const state = await getOwnerSetupState(authUser.id);

      if (!state.hasShopProfile) {
        window.location.replace("/owner/shop-profile?setup=1");
        return;
      }

      if (!state.hasJobs) {
        window.location.replace("/owner/post-job?firstJob=1");
        return;
      }

      const applicantData = await getOwnerApplicantDashboardData(authUser.id);
      setOwnerApplicantData(applicantData);

      setLoadingApplicants(false);
      setCheckingSetup(false);
    }

    checkOwnerSetupAndLoadDashboard();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  async function fetchDashboardData() {
    setLoading(true);

    const { data: shopData, error: shopError } = await supabase
      .from("shop_profiles")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    const { data: applicationsData, error: applicationsError } = await supabase
      .from("applications")
      .select(
        `
        id,
        status,
        applied_at,
        seeker_id,
        jobs (
          id,
          title,
          salary,
          location
        )
      `
      )
      .eq("owner_id", user.id)
      .order("applied_at", { ascending: false });

    if (shopError || jobsError || applicationsError) {
      console.log(shopError || jobsError || applicationsError);
      setMessage(t("dashboardDataError"));
    }

    const jobs = jobsData || [];
    const applications = applicationsData || [];

    setShopProfile(shopData || null);

    setStats({
      totalJobs: jobs.length,
      activeJobs: jobs.filter((job) => job.status === "approved").length,
      closedJobs: jobs.filter((job) => job.status === "closed").length,
      applicants: applications.length,
      pendingApplicants: applications.filter((app) => app.status === "pending")
        .length,
    });

    setRecentJobs(jobs.filter((job) => job.status === "approved").slice(0, 3));
    setPendingApplicants(
      applications.filter((app) => app.status === "pending").slice(0, 3)
    );
    setRecentApplicants(applications.slice(0, 3));

    setLoading(false);
  }

  if (!user?.id || loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("ownerPanel")}</p>
            <h1>{t("loadingDashboard")}</h1>
            <p>{t("dashboardOwnerDesc")}</p>
          </div>
        </main>
      </>
    );
  }

  if (checkingSetup) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-card" style={{ background: "white" }}>
            <p style={{ color: "var(--muted)" }}>Checking your shop setup...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section mobile-clean-dashboard">
        <div className="dashboard-header mobile-hero-clean owner-mobile-hero">
          <p className="tagline">{t("ownerPanel")}</p>

          <h1>
            {shopProfile?.shop_name || `${t("welcome")}, ${profile?.name || t("owner")}`}
          </h1>

          {shopProfile ? (
            <p>
              {shopProfile.is_verified
                ? t("verifiedShop")
                : t("notVerifiedYet")}{" "}
              • {shopProfile.category}
            </p>
          ) : (
            <p>{t("createShopProfileDesc")}</p>
          )}

          <div className="mobile-primary-action">
            {shopProfile ? (
              <Link to="/owner/post-job" className="btn btn-primary">
                {t("postJob")}
              </Link>
            ) : (
              <Link to="/owner/shop-profile" className="btn btn-primary">
                {t("createShopProfile")}
              </Link>
            )}
          </div>
        </div>

        {message && <div className="message">{message}</div>}

        <InAppMoment moments={ownerMoments} />

        {!shopProfile && (
          <div className="mobile-alert-card">
            <div>
              <h3>{t("shopProfileRequired")}</h3>
              <p>{t("shopProfileRequiredDesc")}</p>
            </div>

            <Link to="/owner/shop-profile" className="btn btn-light compact-btn">
              {t("openShopProfile")}
            </Link>
          </div>
        )}

        {loadingApplicants ? (
          <div style={{ margin: "24px 0" }}>
            <section className="dashboard-card" style={{ background: "white" }}>
              <p style={{ color: "var(--muted)" }}>Loading applicants...</p>
            </section>
          </div>
        ) : shouldShowApplicantsFirst ? (
          <div style={{ margin: "24px 0" }}>
            <OwnerApplicantFirstPanel
              applicants={ownerApplicantData.applicants}
              stats={ownerApplicantData.stats}
            />
          </div>
        ) : null}

        {jobsNeedingFilledPrompt.map((job) => (
          <div key={job.id} style={{ margin: "24px 0" }}>
            <MarkJobFilledPrompt
              job={job}
              onMarkedFilled={(updatedJob) => {
                setOwnerApplicantData((prev) => ({
                  ...prev,
                  jobs: prev.jobs.map((item) =>
                    item.id === updatedJob.id ? updatedJob : item
                  ),
                }));
              }}
              onDismiss={() => {
                setDismissedFilledPrompts((prev) => [...prev, job.id]);
              }}
            />
          </div>
        ))}

        <div style={{ margin: "24px 0" }}>
          <NextBestActionCards
            title="What needs your attention"
            actions={ownerNextActions}
          />
        </div>

        <div className="mobile-stat-strip owner-mobile-stats">
          <div className="mobile-stat-chip">
            <strong>{stats.activeJobs}</strong>
            <span>{t("activeJobs")}</span>
          </div>

          <div className="mobile-stat-chip">
            <strong>{stats.applicants}</strong>
            <span>{t("applicants")}</span>
          </div>

          <div className="mobile-stat-chip">
            <strong>{stats.pendingApplicants}</strong>
            <span>{t("pendingApplicants")}</span>
          </div>
        </div>

        <div className="desktop-dashboard-only">
          <div className="stats-grid owner-stats">
            <div className="stat-card">
              <h3>{stats.totalJobs}</h3>
              <p>{t("totalJobs")}</p>
            </div>

            <div className="stat-card">
              <h3>{stats.activeJobs}</h3>
              <p>{t("activeJobs")}</p>
            </div>

            <div className="stat-card">
              <h3>{stats.closedJobs}</h3>
              <p>{t("closedJobs")}</p>
            </div>

            <div className="stat-card">
              <h3>{stats.applicants}</h3>
              <p>{t("totalApplicants")}</p>
            </div>

            <div className="stat-card">
              <h3>{stats.pendingApplicants}</h3>
              <p>{t("pendingApplicants")}</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>{t("shopProfile")}</h3>
              <p>{t("shopProfileDesc")}</p>
              <Link to="/owner/shop-profile" className="btn btn-primary">
                {t("openShopProfile")}
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>{t("postJob")}</h3>
              <p>{t("postJobDesc")}</p>
              <Link to="/owner/post-job" className="btn btn-primary">
                {t("postNewJob")}
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>{t("myJobs")}</h3>
              <p>{t("myJobsDesc")}</p>
              <Link to="/owner/jobs" className="btn btn-primary">
                {t("manageJobs")}
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>{t("applicants")}</h3>
              <p>{t("applicantsDesc")}</p>
              <Link to="/owner/applicants" className="btn btn-primary">
                {t("viewApplicants")}
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>{t("jobPerformance")}</h3>
              <p>{t("jobPerformanceShortcutDesc")}</p>
              <Link to="/owner/performance" className="btn btn-primary">
                {t("viewPerformance")}
              </Link>
            </div>
          </div>
        </div>

        <section className="mobile-info-section">
          <div className="mobile-list">
            <Link to="/owner/performance" className="mobile-list-row">
              <div>
                <h3>{t("jobPerformance")}</h3>
                <p>{t("jobPerformanceShortcutDesc")}</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="mobile-info-section">
          <div className="mobile-section-head">
            <div>
              <p className="tagline mini-tagline">{t("needsAttention")}</p>
              <h2>{t("pendingApplications")}</h2>
            </div>

            <Link to="/owner/applicants">{t("viewAll")}</Link>
          </div>

          {pendingApplicants.length === 0 ? (
            <div className="mobile-empty-state">
              <h3>{t("noPendingApplicants")}</h3>
              <p>{t("noPendingApplicantsDesc")}</p>
            </div>
          ) : (
            <div className="mobile-list">
              {pendingApplicants.map((application) => (
                <Link
                  to="/owner/applicants"
                  className="mobile-list-row"
                  key={application.id}
                >
                  <div>
                    <h3>{application.jobs?.title || t("job")}</h3>
                    <p>
                      {application.jobs?.location || t("location")} •{" "}
                      {application.jobs?.salary || t("salary")}
                    </p>
                  </div>

                  <span className={`status-badge status-${application.status}`}>
                    {t(application.status)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mobile-info-section">
          <div className="mobile-section-head">
            <div>
              <p className="tagline mini-tagline">{t("recentActivity")}</p>
              <h2>{t("activeJobs")}</h2>
            </div>

            <Link to="/owner/jobs">{t("viewAll")}</Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="mobile-empty-state">
              <h3>{t("noActiveJobs")}</h3>
              <p>{t("noActiveJobsDesc")}</p>
            </div>
          ) : (
            <div className="mobile-list">
              {recentJobs.map((job) => (
                <Link to="/owner/jobs" className="mobile-list-row" key={job.id} style={{ display: 'block', padding: '16px 20px' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900" style={{ margin: 0 }}>
                        {job.title}
                      </h3>
                      <JobFreshnessMeta job={job} />
                      <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--muted)' }}>
                        {job.category} • {job.location} • {job.salary}
                      </p>
                    </div>

                    <JobFreshnessBadge job={job} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="dashboard-two-column desktop-dashboard-only">
          <div className="admin-panel-card">
            <div className="section-title-row">
              <div>
                <p className="tagline">{t("recentActivity")}</p>
                <h2>{t("latestJobs")}</h2>
              </div>

              <Link to="/owner/jobs" className="btn btn-light">
                {t("viewAll")}
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="empty-box">
                <h3>{t("noActiveJobs")}</h3>
                <p>{t("noActiveJobsDesc")}</p>
              </div>
            ) : (
              <div className="admin-list">
                {recentJobs.map((job) => (
                  <div className="admin-list-item" key={job.id} style={{ display: 'block', padding: '16px 20px' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900" style={{ margin: 0 }}>
                          {job.title}
                        </h3>
                        <JobFreshnessMeta job={job} />
                        <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--muted)' }}>
                          {job.category} • {job.location} • {job.salary}
                        </p>
                      </div>

                      <JobFreshnessBadge job={job} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel-card">
            <div className="section-title-row">
              <div>
                <p className="tagline">{t("recentActivity")}</p>
                <h2>{t("recentApplicants")}</h2>
              </div>

              <Link to="/owner/applicants" className="btn btn-light">
                {t("viewAll")}
              </Link>
            </div>

            {recentApplicants.length === 0 ? (
              <div className="empty-box">
                <h3>{t("noApplicants")}</h3>
                <p>{t("noApplicantsDesc")}</p>
              </div>
            ) : (
              <div className="admin-list">
                {recentApplicants.map((application) => (
                  <div className="admin-list-item" key={application.id}>
                    <div>
                      <h3>{application.jobs?.title || t("job")}</h3>
                      <p>{t("newApplicationReceived")}</p>
                    </div>

                    <span className={`status-badge status-${application.status}`}>
                      {t(application.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default OwnerDashboard;