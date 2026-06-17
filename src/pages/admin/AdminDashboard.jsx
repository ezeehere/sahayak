import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";

function AdminDashboard() {
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    users: 0,
    seekers: 0,
    owners: 0,
    jobs: 0,
    applications: 0,
    categories: 0,
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);

    const { data: usersData, error: usersError } = await supabase
      .from("profiles")
      .select("*");

    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: applicationsData, error: applicationsError } = await supabase
      .from("applications")
      .select("*");

    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("*");

    if (usersError || jobsError || applicationsError || categoriesError) {
      console.log(
        usersError || jobsError || applicationsError || categoriesError
      );
      setMessage(t("dashboardDataError"));
      setLoading(false);
      return;
    }

    const users = usersData || [];
    const jobs = jobsData || [];

    setStats({
      users: users.length,
      seekers: users.filter((user) => user.role === "seeker").length,
      owners: users.filter((user) => user.role === "owner").length,
      jobs: jobs.length,
      applications: applicationsData?.length || 0,
      categories: categoriesData?.length || 0,
    });

    setRecentJobs(jobs.slice(0, 4));
    setLoading(false);
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("adminPanel")}</p>
            <h1>{t("loadingDashboard")}</h1>
            <p>{t("adminDashboardDesc")}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section mobile-clean-dashboard">
        <div className="dashboard-header mobile-hero-clean admin-mobile-hero">
          <p className="tagline">{t("adminPanel")}</p>

          <h1>{t("adminDashboard")}</h1>

          <p>{t("adminDashboardDesc")}</p>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="mobile-stat-strip admin-mobile-stats">
          <div className="mobile-stat-chip">
            <strong>{stats.users}</strong>
            <span>{t("totalUsers")}</span>
          </div>

          <div className="mobile-stat-chip">
            <strong>{stats.jobs}</strong>
            <span>{t("totalJobs")}</span>
          </div>

          <div className="mobile-stat-chip">
            <strong>{stats.applications}</strong>
            <span>{t("applications")}</span>
          </div>

          <div className="mobile-stat-chip">
            <strong>{stats.categories}</strong>
            <span>{t("categories")}</span>
          </div>
        </div>

        <div className="desktop-dashboard-only">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.users}</h3>
              <p>{t("totalUsers")}</p>
            </div>

            <div className="stat-card">
              <h3>{stats.seekers}</h3>
              <p>{t("jobSeekers")}</p>
            </div>

            <div className="stat-card">
              <h3>{stats.owners}</h3>
              <p>{t("shopOwners")}</p>
            </div>

            <div className="stat-card">
              <h3>{stats.jobs}</h3>
              <p>{t("totalJobs")}</p>
            </div>

            <div className="stat-card">
              <h3>{stats.applications}</h3>
              <p>{t("applications")}</p>
            </div>

            <div className="stat-card">
              <h3>{stats.categories}</h3>
              <p>{t("categories")}</p>
            </div>
          </div>

          <div className="dashboard-grid admin-action-grid">
            <div className="dashboard-card">
              <h3>{t("manageUsers")}</h3>
              <p>{t("manageUsersDesc")}</p>
              <Link to="/admin/users" className="btn btn-primary">
                {t("openUsers")}
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>{t("manageJobs")}</h3>
              <p>{t("manageJobsDesc")}</p>
              <Link to="/admin/jobs" className="btn btn-primary">
                {t("openJobs")}
              </Link>
            </div>

            <div className="dashboard-card">
              <h3>{t("categories")}</h3>
              <p>{t("categoriesDesc")}</p>
              <Link to="/admin/categories" className="btn btn-primary">
                {t("openCategories")}
              </Link>
            </div>
          </div>
        </div>

        <section className="mobile-info-section">
          <div className="mobile-section-head">
            <div>
              <p className="tagline mini-tagline">{t("quickManage")}</p>
              <h2>{t("adminTools")}</h2>
            </div>
          </div>

          <div className="mobile-list">
            <Link to="/admin/users" className="mobile-list-row admin-tool-row">
              <div>
                <h3>{t("manageUsers")}</h3>
                <p>{t("manageUsersDesc")}</p>
              </div>
            </Link>

            <Link to="/admin/jobs" className="mobile-list-row admin-tool-row">
              <div>
                <h3>{t("manageJobs")}</h3>
                <p>{t("manageJobsDesc")}</p>
              </div>
            </Link>

            <Link
              to="/admin/categories"
              className="mobile-list-row admin-tool-row"
            >
              <div>
                <h3>{t("categories")}</h3>
                <p>{t("categoriesDesc")}</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="mobile-info-section">
          <div className="mobile-section-head">
            <div>
              <p className="tagline mini-tagline">{t("recentActivity")}</p>
              <h2>{t("latestJobs")}</h2>
            </div>

            <Link to="/admin/jobs">{t("viewAll")}</Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="mobile-empty-state">
              <h3>{t("noJobsFound")}</h3>
              <p>{t("noJobsFoundDesc")}</p>
            </div>
          ) : (
            <div className="mobile-list">
              {recentJobs.map((job) => (
                <Link to="/admin/jobs" className="mobile-list-row" key={job.id}>
                  <div>
                    <h3>{job.title}</h3>
                    <p>
                      {job.category} • {job.location} • {job.salary}
                    </p>
                  </div>

                  <span className={`status-badge status-${job.status}`}>
                    {t(job.status)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="admin-panel-card desktop-dashboard-only">
          <div className="section-title-row">
            <div>
              <p className="tagline">{t("recentActivity")}</p>
              <h2>{t("latestJobs")}</h2>
            </div>

            <Link to="/admin/jobs" className="btn btn-light">
              {t("viewAll")}
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="empty-box">
              <h3>{t("noJobsFound")}</h3>
              <p>{t("noJobsFoundDesc")}</p>
            </div>
          ) : (
            <div className="admin-list">
              {recentJobs.map((job) => (
                <div className="admin-list-item" key={job.id}>
                  <div>
                    <h3>{job.title}</h3>
                    <p>
                      {job.category} • {job.location} • {job.salary}
                    </p>
                  </div>

                  <span className={`status-badge status-${job.status}`}>
                    {t(job.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default AdminDashboard;