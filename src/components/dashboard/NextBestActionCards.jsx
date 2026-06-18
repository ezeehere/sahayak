function ActionIcon({ type = "default" }) {
  const icons = {
    applicants: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Z" />
        <path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Z" />
        <path d="M16 13c-2.33 0-7 1.17-7 3.5V18h14v-1.5c0-2.33-4.67-3.5-7-3.5Z" />
        <path d="M8 13c-.29 0-.62.02-.97.05C5.15 13.27 1 14.23 1 16.5V18h6v-1.5c0-1.03.42-1.9 1.13-2.61.21-.21.45-.41.72-.59A7.78 7.78 0 0 0 8 13Z" />
      </svg>
    ),
    share: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 1 0 15 5c0 .24.04.47.09.7L8.04 9.81a3 3 0 1 0 0 4.38l7.12 4.18c-.04.2-.06.41-.06.63a2.9 2.9 0 1 0 2.9-2.92Z" />
      </svg>
    ),
    post: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-1 10h-5v5h-2v-5H6v-2h5V6h2v5h5v2Z" />
      </svg>
    ),
    jobs: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4C8.9 2 8 2.9 8 4v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2Zm-6 0h-4V4h4v2Z" />
      </svg>
    ),
    search: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.5 3a6.5 6.5 0 0 0 0 13c1.61 0 3.09-.59 4.23-1.57L19.3 20 21 18.3l-5.57-5.57A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 0 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.28 7.28 0 0 0-1.69-.98L14.5 2.42A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.42L9.13 5.07c-.61.23-1.18.55-1.69.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.32-.07.65-.07.98s.02.66.07.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.13.22.39.31.61.22l2.49-1c.51.4 1.08.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.61-.25 1.18-.58 1.69-.98l2.49 1c.22.09.48 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" />
      </svg>
    ),
    status: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
      </svg>
    ),
    default: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.7 3.72L12 11.74 5.3 8.02 12 4.3ZM5 9.7l6 3.33v6.45l-6-3.33V9.7Zm8 9.78v-6.45l6-3.33v6.45l-6 3.33Z" />
      </svg>
    ),
  };

  return <span className="nba-icon">{icons[type] || icons.default}</span>;
}

export default function NextBestActionCards({
  title = "Next best actions",
  actions = [],
}) {
  if (!actions.length) return null;

  return (
    <section className="nba-section">
      <div className="nba-header">
        <p className="nba-kicker">Recommended</p>
        <h2>{title}</h2>
      </div>

      <div className="nba-grid">
        {actions.slice(0, 3).map((action) => (
          <button
            key={action.id}
            type="button"
            className="nba-card"
            onClick={() => {
              if (action.href) {
                window.location.href = action.href;
              }

              if (action.onClick) {
                action.onClick();
              }
            }}
          >
            <ActionIcon type={action.icon} />

            <div className="nba-card-content">
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>

            <span className="nba-cta">
              {action.cta || "Continue"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}