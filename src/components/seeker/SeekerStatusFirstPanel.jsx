import {
  getApplicationStats,
  getStatusHelper,
  getStatusLabel,
} from "../../utils/seekerDashboardData";

export default function SeekerStatusFirstPanel({ applications = [] }) {
  const stats = getApplicationStats(applications);
  const latest = applications[0];

  if (!applications.length) {
    return (
      <div className="dashboard-card" style={{ background: "white" }}>
        <p className="tagline" style={{ background: "var(--green)" }}>Your applications</p>

        <h2 style={{ fontSize: "28px", letterSpacing: "-1px", fontWeight: 900, marginTop: "12px" }}>
          Start with your first application
        </h2>

        <p style={{ color: "var(--muted)", marginTop: "10px", lineHeight: 1.6 }}>
          Apply to nearby shop jobs and track every application from here.
        </p>

        <button
          type="button"
          onClick={() => (window.location.href = "/browse-jobs")}
          className="btn btn-primary"
          style={{ marginTop: "20px" }}
        >
          Browse jobs
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div className="dashboard-card" style={{ background: "white" }}>
        <p className="tagline" style={{ background: "var(--green)" }}>Welcome back</p>

        <h2 style={{ fontSize: "28px", letterSpacing: "-1px", fontWeight: 900, marginTop: "12px" }}>
          Your job applications
        </h2>

        <p style={{ color: "var(--muted)", marginTop: "8px", lineHeight: 1.6 }}>
          You have applied to {stats.total} job{stats.total > 1 ? "s" : ""}.
          Track status updates here before applying again.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "12px", marginTop: "20px" }}>
          <div className="mobile-stat-chip" style={{ background: "#f9f7f1", border: "1.5px solid var(--line)", borderRadius: "20px", padding: "14px", textAlign: "center" }}>
            <strong style={{ fontSize: "24px", display: "block" }}>{stats.total}</strong>
            <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 700 }}>Total</span>
          </div>

          <div className="mobile-stat-chip" style={{ background: "#fff1a8", border: "1.5px solid var(--line)", borderRadius: "20px", padding: "14px", textAlign: "center" }}>
            <strong style={{ fontSize: "24px", display: "block" }}>{stats.pending}</strong>
            <span style={{ fontSize: "12px", color: "var(--text)", fontWeight: 700 }}>Pending</span>
          </div>

          <div className="mobile-stat-chip" style={{ background: "#dff8c8", border: "1.5px solid var(--line)", borderRadius: "20px", padding: "14px", textAlign: "center" }}>
            <strong style={{ fontSize: "24px", display: "block" }}>{stats.shortlisted}</strong>
            <span style={{ fontSize: "12px", color: "var(--text)", fontWeight: 700 }}>Shortlisted</span>
          </div>

          <div className="mobile-stat-chip" style={{ background: "#e8f0ff", border: "1.5px solid var(--line)", borderRadius: "20px", padding: "14px", textAlign: "center" }}>
            <strong style={{ fontSize: "24px", display: "block" }}>{stats.accepted}</strong>
            <span style={{ fontSize: "12px", color: "var(--text)", fontWeight: 700 }}>Accepted</span>
          </div>
        </div>
      </div>

      {latest && (
        <div className="dashboard-card" style={{ background: "white", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <p className="tagline" style={{ background: "var(--pink)" }}>
                Latest application
              </p>

              <h3 style={{ fontSize: "22px", letterSpacing: "-0.5px", fontWeight: 900, marginTop: "8px" }}>
                {latest.job?.title || "Job application"}
              </h3>

              <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "4px", fontWeight: 700 }}>
                {latest.shopName}
              </p>
            </div>

            <span className={`status-badge status-${latest.status}`}>
              {getStatusLabel(latest.status)}
            </span>
          </div>

          <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.6 }}>
            {getStatusHelper(latest.status)}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={() => (window.location.href = "/seeker/applications")}
              className="btn btn-primary"
            >
              View all applications
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = "/browse-jobs")}
              className="btn btn-light"
            >
              Apply to more jobs
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-card" style={{ background: "#f9f7f1" }}>
        <p style={{ fontWeight: 900, fontSize: "16px", color: "var(--text)" }}>
          Best next step
        </p>

        <p style={{ marginTop: "6px", fontSize: "14px", color: "var(--muted)", lineHeight: 1.6 }}>
          Do not wait for only one shop. Apply to 2 or 3 suitable nearby jobs to
          improve your chances.
        </p>
      </div>
    </div>
  );
}
