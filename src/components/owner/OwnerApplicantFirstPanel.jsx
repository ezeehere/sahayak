import { getOwnerApplicationStatusLabel, markApplicationAsSeen } from "../../utils/ownerApplicantData";

export default function OwnerApplicantFirstPanel({
  applicants = [],
  stats,
}) {
  async function handleReviewApplicant(applicationId) {
    await markApplicationAsSeen(applicationId);
    window.location.href = `/owner/applicants?application=${applicationId}`;
  }
  if (!applicants.length) {
    return (
      <div className="dashboard-card" style={{ background: "white" }}>
        <p className="tagline" style={{ background: "var(--pink)" }}>Applicants</p>

        <h2 style={{ fontSize: "28px", letterSpacing: "-1px", fontWeight: 900, marginTop: "12px" }}>
          No applicants yet
        </h2>

        <p style={{ color: "var(--muted)", marginTop: "10px", lineHeight: 1.6 }}>
          Share your job on WhatsApp or post another job to reach more local seekers.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
          <button
            type="button"
            onClick={() => (window.location.href = "/owner/post-job")}
            className="btn btn-primary"
          >
            Post another job
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/owner/dashboard?focus=jobs")}
            className="btn btn-light"
          >
            View my jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div className="dashboard-card" style={{ background: "white" }}>
        <p className="tagline" style={{ background: "var(--green)" }}>Welcome back</p>

        <h2 style={{ fontSize: "28px", letterSpacing: "-1px", fontWeight: 900, marginTop: "12px" }}>
          Review your applicants first
        </h2>

        <p style={{ color: "var(--muted)", marginTop: "8px", lineHeight: 1.6 }}>
          You have {stats.totalApplicants} recent applicant{stats.totalApplicants > 1 ? "s" : ""} across {stats.totalJobs} job{stats.totalJobs > 1 ? "s" : ""}.
          {stats.unreadApplicants > 0
            ? ` ${stats.unreadApplicants} new applicant${
                stats.unreadApplicants > 1 ? "s" : ""
              } need your attention.`
            : " No new applicants right now."}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(95px, 1fr))", gap: "12px", marginTop: "20px" }}>
          <div className="mobile-stat-chip" style={{ background: "#f9f7f1", border: "1.5px solid var(--line)", borderRadius: "20px", padding: "14px", textAlign: "center" }}>
            <strong style={{ fontSize: "24px", display: "block" }}>{stats.totalApplicants}</strong>
            <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 700 }}>Applicants</span>
          </div>

          <div className="mobile-stat-chip" style={{ background: "#e8f0ff", border: "1.5px solid var(--line)", borderRadius: "20px", padding: "14px", textAlign: "center" }}>
            <strong style={{ fontSize: "24px", display: "block", color: "#1e40af" }}>{stats.unreadApplicants || 0}</strong>
            <span style={{ fontSize: "12px", color: "#1e40af", fontWeight: 700 }}>New</span>
          </div>

          <div className="mobile-stat-chip" style={{ background: "#fff1a8", border: "1.5px solid var(--line)", borderRadius: "20px", padding: "14px", textAlign: "center" }}>
            <strong style={{ fontSize: "24px", display: "block" }}>{stats.pendingApplicants}</strong>
            <span style={{ fontSize: "12px", color: "var(--text)", fontWeight: 700 }}>Pending</span>
          </div>

          <div className="mobile-stat-chip" style={{ background: "#dff8c8", border: "1.5px solid var(--line)", borderRadius: "20px", padding: "14px", textAlign: "center" }}>
            <strong style={{ fontSize: "24px", display: "block" }}>{stats.shortlistedApplicants}</strong>
            <span style={{ fontSize: "12px", color: "var(--text)", fontWeight: 700 }}>Shortlisted</span>
          </div>

          <div className="mobile-stat-chip" style={{ background: "#f9f7f1", border: "1.5px solid var(--line)", borderRadius: "20px", padding: "14px", textAlign: "center" }}>
            <strong style={{ fontSize: "24px", display: "block" }}>{stats.totalJobs}</strong>
            <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 700 }}>Active jobs</span>
          </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ background: "white", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <p className="tagline" style={{ background: "var(--pink)" }}>
              Recent applicants
            </p>
            <h3 style={{ fontSize: "22px", fontWeight: 900, marginTop: "8px", letterSpacing: "-0.5px" }}>
              Take action on new applications
            </h3>
          </div>

          <button
            type="button"
            onClick={() => (window.location.href = "/owner/applicants")}
            className="btn btn-light"
          >
            View all
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {applicants.slice(0, 5).map((application) => {
            const seekerName = application.seeker?.name || "Job seeker";
            const statusVal = application.status || "pending";

            return (
              <div
                key={application.id}
                style={{
                  border: application.isUnread ? "1.5px solid #3b82f6" : "1.5px solid var(--line)",
                  borderRadius: "20px",
                  padding: "16px",
                  background: application.isUnread ? "rgba(59, 130, 246, 0.05)" : "white",
                  boxShadow: "var(--soft-shadow)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <h4 style={{ fontWeight: 900, fontSize: "16px" }}>{seekerName}</h4>
                    <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
                      Applied for <strong>{application.job?.title || "your job"}</strong>
                    </p>

                    {(application.seeker?.area || application.seeker?.phone) && (
                      <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                        {application.seeker?.area}
                        {application.seeker?.area && application.seeker?.phone ? " • " : ""}
                        {application.seeker?.phone}
                      </p>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    {application.isUnread && (
                      <span className="status-badge" style={{ border: "1.5px solid #2563eb", borderRadius: "999px", fontSize: "12px", fontWeight: 900, padding: "7px 11px", color: "#2563eb", background: "#e8f0ff" }}>
                        New
                      </span>
                    )}

                    <span className={`status-badge status-${statusVal}`}>
                      {getOwnerApplicationStatusLabel(statusVal)}
                    </span>
                  </div>
                </div>

                {application.message && (
                  <p style={{ marginTop: "12px", padding: "12px", background: "#f9f7f1", border: "1.5px solid var(--line)", borderRadius: "16px", fontSize: "13px", color: "var(--text)" }}>
                    {application.message}
                  </p>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleReviewApplicant(application.id)}
                    className="btn btn-primary"
                    style={{ fontSize: "13px", padding: "8px 16px" }}
                  >
                    Review applicant
                  </button>

                  {application.seeker?.phone && (
                    <a
                      href={`tel:${application.seeker.phone}`}
                      className="btn btn-light"
                      style={{ fontSize: "13px", padding: "8px 16px" }}
                    >
                      Call
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dashboard-card" style={{ background: "#f9f7f1" }}>
        <p style={{ fontWeight: 900, fontSize: "16px", color: "var(--text)" }}>
          Best next step
        </p>

        <p style={{ marginTop: "6px", fontSize: "14px", color: "var(--muted)", lineHeight: 1.6 }}>
          Review pending applicants first. If someone is suitable, shortlist them before the job gets old.
        </p>
      </div>
    </div>
  );
}
