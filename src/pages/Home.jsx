import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function Home() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  function getDashboardLink() {
    if (profile?.role === "seeker") return "/seeker/dashboard";
    if (profile?.role === "owner") return "/owner/dashboard";
    if (profile?.role === "admin") return "/admin/dashboard";
    return "/login";
  }

  function getPrimaryAction() {
    if (profile?.role === "seeker") {
      return { label: "Browse Jobs", link: "/seeker/jobs" };
    }

    if (profile?.role === "owner") {
      return { label: "Post a Job", link: "/owner/post-job" };
    }

    if (profile?.role === "admin") {
      return { label: "Manage System", link: "/admin/dashboard" };
    }

    return { label: "Get Started", link: "/register" };
  }

  const primaryAction = getPrimaryAction();

  return (
    <>
      <Navbar />

      <main className="home-page">
        <section className="home-hero">
          <div className="home-hero-content">
            <p className="tagline">Local Job Finder System</p>

            <h1>
              Find local jobs near you with <span>Sahayak</span>
            </h1>

            <p className="home-hero-desc">
              Sahayak connects job seekers with nearby shops and small
              businesses. Job seekers can find local work, shop owners can post
              vacancies, and admins can manage the complete system.
            </p>

            <div className="home-actions">
              <Link to={primaryAction.link} className="btn btn-primary">
                {primaryAction.label}
              </Link>

              {profile ? (
                <Link to={getDashboardLink()} className="btn btn-light">
                  Dashboard
                </Link>
              ) : (
                <Link to="/login" className="btn btn-light">
                  Login
                </Link>
              )}
            </div>
          </div>

          <div className="home-hero-panel">
            <div className="hero-panel-top">
              <div>
                <p className="mini-label">Live Platform</p>
                <h2>Core Modules</h2>
              </div>

              <span className="hero-status">Active</span>
            </div>

            <div className="module-chip-grid">
              <span>Job Seeker</span>
              <span>Shop Owner</span>
              <span>Admin</span>
              <span>Job Posts</span>
              <span>Applications</span>
              <span>Saved Jobs</span>
              <span>Verified Shops</span>
              <span>Supabase</span>
            </div>
          </div>
        </section>

        <section className="home-stats-strip">
          <div>
            <strong>3</strong>
            <span>User Roles</span>
          </div>

          <div>
            <strong>7+</strong>
            <span>Database Tables</span>
          </div>

          <div>
            <strong>PWA</strong>
            <span>Mobile Ready</span>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <p className="tagline">How It Works</p>
            <h2>Simple workflow for local hiring</h2>
          </div>

          <div className="home-role-grid">
            <article className="home-role-card seeker-card">
              <div className="home-role-icon">
                <UserRound size={26} strokeWidth={2.7} />
              </div>

              <h3>Job Seeker</h3>
              <p>
                Browse nearby jobs, save vacancies, apply online, and directly
                contact shop owners.
              </p>
            </article>

            <article className="home-role-card owner-card">
              <div className="home-role-icon">
                <Building2 size={26} strokeWidth={2.7} />
              </div>

              <h3>Shop Owner</h3>
              <p>
                Create a shop profile, post job vacancies, review applicants,
                and update application status.
              </p>
            </article>

            <article className="home-role-card admin-card">
              <div className="home-role-icon">
                <ShieldCheck size={26} strokeWidth={2.7} />
              </div>

              <h3>Admin</h3>
              <p>
                Manage users, job posts, categories, and keep the whole platform
                organized.
              </p>
            </article>
          </div>
        </section>

        <section className="home-section feature-section">
          <div className="home-section-head">
            <p className="tagline">Project Highlights</p>
            <h2>Built for real local job discovery</h2>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <BriefcaseBusiness size={24} strokeWidth={2.7} />
              <h3>Local Job Listings</h3>
              <p>Jobs from nearby shops with salary, timing, location, and job type.</p>
            </div>

            <div className="feature-card">
              <ClipboardList size={24} strokeWidth={2.7} />
              <h3>Application Tracking</h3>
              <p>Seekers can track application status from pending to hired.</p>
            </div>

            <div className="feature-card">
              <UsersRound size={24} strokeWidth={2.7} />
              <h3>Role-Based Dashboards</h3>
              <p>Separate dashboards for seekers, shop owners, and admin users.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;