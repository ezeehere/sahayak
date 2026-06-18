export default function OwnerFirstJobSuccessModal({ job, shopName, onClose }) {
  const jobTitle = job?.title || "your job";
  const finalShopName = shopName || "your shop";

  function goToDashboard() {
    window.location.href = "/owner/dashboard?focus=jobs";
  }

  function postAnotherJob() {
    window.location.href = "/owner/post-job";
  }

  function shareJob() {
    const shareUrl = `${window.location.origin}/jobs/${job?.id}`;
    const text = `Local job opening: ${jobTitle} at ${finalShopName}. Apply here: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(4px)",
      padding: "20px"
    }}>
      <div className="dashboard-card" style={{
        background: "white",
        width: "100%",
        maxWidth: "480px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "30px",
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <div>
          <span className="success-icon" aria-hidden="true" style={{ marginBottom: "16px" }}>
            <svg viewBox="0 0 24 24">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
            </svg>
          </span>

          <p className="tagline" style={{ background: "var(--yellow)", display: "block", width: "fit-content" }}>
            Job is live
          </p>

          <h2 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1px", marginTop: "12px", lineHeight: 1.1 }}>
            Your first job is posted!
          </h2>

          <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--muted)", lineHeight: 1.5 }}>
            Seekers can now view and apply for <strong>{jobTitle}</strong> at <strong>{finalShopName}</strong>.
          </p>
        </div>

        <div style={{
          border: "1.5px dashed var(--line)",
          borderRadius: "20px",
          padding: "16px",
          background: "#fafafa"
        }}>
          <p style={{ fontWeight: 900, fontSize: "16px", color: "var(--text)" }}>{jobTitle}</p>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>{finalShopName}</p>

          <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--muted)" }}>
            Applicants will appear on your dashboard.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            type="button"
            onClick={goToDashboard}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            Go to owner dashboard
          </button>

          <button
            type="button"
            onClick={shareJob}
            className="btn btn-light"
            style={{ width: "100%", background: "#25D366", color: "white", borderColor: "#25D366" }}
          >
            Share job on WhatsApp
          </button>

          <button
            type="button"
            onClick={postAnotherJob}
            className="btn btn-light"
            style={{ width: "100%" }}
          >
            Post another job
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-light"
            style={{ width: "100%", border: "none", background: "none", boxShadow: "none", color: "var(--muted)" }}
          >
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}
