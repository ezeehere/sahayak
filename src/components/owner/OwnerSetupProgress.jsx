export default function OwnerSetupProgress({ currentStep = 1 }) {
  const steps = [
    {
      number: 1,
      title: "Shop details",
      text: "Add your shop name, phone, area, and category.",
    },
    {
      number: 2,
      title: "First job",
      text: "Post one local job so seekers can apply.",
    },
  ];

  return (
    <section className="dashboard-card" style={{ background: "white", marginBottom: "20px" }}>
      <p className="tagline" style={{ background: "var(--pink)" }}>
        First-time shop setup
      </p>

      <h2 style={{ fontSize: "24px", fontWeight: 900, marginTop: "12px", letterSpacing: "-0.5px" }}>
        Get your first job post live
      </h2>

      <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--muted)", lineHeight: 1.6 }}>
        Complete these two steps so local job seekers can find your shop.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "20px" }}>
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isDone = step.number < currentStep;

          return (
            <div
              key={step.number}
              style={{
                border: isActive ? "2.5px solid var(--line)" : "1.5px solid #e2e8f0",
                borderRadius: "20px",
                padding: "16px",
                background: isActive ? "rgba(255, 217, 61, 0.08)" : "white",
                boxShadow: isActive ? "var(--soft-shadow)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    height: "32px",
                    width: "32px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 900,
                    border: "1.5px solid var(--line)",
                    background: isDone
                      ? "var(--green)"
                      : isActive
                      ? "var(--yellow)"
                      : "#f1f5f9",
                    color: "var(--text)"
                  }}
                >
                  {isDone ? "✓" : step.number}
                </span>

                <p style={{ fontWeight: 900, fontSize: "16px", color: "var(--text)" }}>{step.title}</p>
              </div>

              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>{step.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
