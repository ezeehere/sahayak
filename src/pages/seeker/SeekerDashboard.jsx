import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";

function SeekerDashboard() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    availableJobs: 0,
    savedJobs: 0,
    applications: 0,
    profileCompleted: false,
  });

  const [latestApplications, setLatestApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  async function fetchDashboardData() {
    setLoading(true);

    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select(
        `
        *,
        shop_profiles (
          shop_name,
          is_verified
        )
      `
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    const { data: savedData, error: savedError } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("seeker_id", user.id);

    const { data: applicationData, error: applicationError } = await supabase
      .from("applications")
      .select(
        `
        id,
        status,
        applied_at,
        jobs (
          id,
          title,
          salary,
          location,
          shop_profiles (
            shop_name
          )
        )
      `
      )
      .eq("seeker_id", user.id)
      .order("applied_at", { ascending: false });

    const { data: seekerProfileData, error: seekerProfileError } = await supabase
      .from("seeker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (jobsError || savedError || applicationError || seekerProfileError) {
      console.log(jobsError || savedError || applicationError || seekerProfileError);
      setMessage("Some dashboard data could not be loaded.");
    }

    setStats({
      availableJobs: jobsData?.length || 0,
      savedJobs: savedData?.length || 0,
      applications: applicationData?.length || 0,
      profileCompleted: !!seekerProfileData,
    });

    setLatestApplications((applicationData || []).slice(0, 3));
    setRecommendedJobs((jobsData || []).slice(0, 3));
    setLoading(false);
  }

  if (!user?.id || loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("seekerPanel")}</p>
            <h1>{t("loadingDashboard")}</h1>
            <p>{t("dashboardSeekerDesc")}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section mobile-clean-dashboard">
        <div className="dashboard-header mobile-hero-clean">
          <p className="tagline">{t("seekerPanel")}</p>

          <h1>
            {t("welcome")}, {profile?.name || t("jobSeeker")}
          </h1>

          <p>{t("dashboardSeekerDesc")}</p>

          <div className="mobile-primary-action">
            <Link to="/seeker/jobs" className="btn btn-primary">
              {t("browseJobs")}
            </Link>
          </div>
        </div>

        {message && <div className="message">{message}</div>}

        {!stats.profileCompleted && (
          <div className="mobile-alert-card">
            <div>
              <h3>{t("completeProfile")}</h3>
              <p>{t("completeProfileDesc")}</p>
            </div>

            <Link to="/seeker/profile" className="btn btn-light compact-btn">
              {t("openProfile")}
            </Link>
          </div>
        )}

        <div className="mobile-stat-strip">
          <div className="mobile-stat-chip">
            <strong>{stats.availableJobs}</strong>
            <span>{t("availableJobs")}</span>
          </div>

          <div className="mobile-stat-chip">
            <strong>{stats.savedJobs}</strong>
            <span>{t("savedJobs")}</span>
          </div>

          <div className="mobile-stat-chip">
            <strong>{stats.applications}</strong>
            <span>{t("applications")}</span>
          </div>
        </div>

        <div className="desktop-dashboard-only">
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>{t("myProfile")}</h3>
              <p>{t("myProfileDesc")}</p>
              <Link to="/seeker/profile" className="btn btn-primary">
                {t("openProfile")}
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>{t("browseJobs")}</h3>
              <p>{t("browseJobsDesc")}</p>
              <Link to="/seeker/jobs" className="btn btn-primary">
                {t("browseJobs")}
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>{t("savedJobs")}</h3>
              <p>{t("savedJobsDesc")}</p>
              <Link to="/seeker/saved" className="btn btn-primary">
                {t("viewSaved")}
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>{t("myApplications")}</h3>
              <p>{t("myApplicationsDesc")}</p>
              <Link to="/seeker/applications" className="btn btn-primary">
                {t("viewApplications")}
              </Link>
            </div>
          </div>
        </div>

        <section className="mobile-info-section">
          <div className="mobile-section-head">
            <div>
              <p className="tagline mini-tagline">{t("recentActivity")}</p>
              <h2>{t("latestApplications")}</h2>
            </div>

            <Link to="/seeker/applications">{t("viewAll")}</Link>
          </div>

          {latestApplications.length === 0 ? (
            <div className="mobile-empty-state">
              <h3>{t("noApplications")}</h3>
              <p>{t("noApplicationsDesc")}</p>
            </div>
          ) : (
            <div className="mobile-list">
              {latestApplications.map((application) => (
                <Link
                  to={`/seeker/jobs/${application.jobs?.id}`}
                  className="mobile-list-row"
                  key={application.id}
                >
                  <div>
                    <h3>{application.jobs?.title || t("job")}</h3>
                    <p>
                      {application.jobs?.shop_profiles?.shop_name || t("localShop")} •{" "}
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
              <p className="tagline mini-tagline">{t("recommended")}</p>
              <h2>{t("recommendedJobs")}</h2>
            </div>

            <Link to="/seeker/jobs">{t("viewAll")}</Link>
          </div>

          {recommendedJobs.length === 0 ? (
            <div className="mobile-empty-state">
              <h3>{t("noJobsFound")}</h3>
              <p>{t("noJobsFoundDesc")}</p>
            </div>
          ) : (
            <div className="mobile-list">
              {recommendedJobs.map((job) => (
                <Link
                  to={`/seeker/jobs/${job.id}`}
                  className="mobile-list-row"
                  key={job.id}
                >
                  <div>
                    <h3>{job.title}</h3>
                    <p>
                      {job.shop_profiles?.shop_name || t("localShop")} • {job.location} •{" "}
                      {job.salary}
                    </p>
                  </div>

                  <span className="status-badge">{job.job_type}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default SeekerDashboard;