import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { calculateProfileStrength } from "../utils/profileStrength";

function ProfileStrengthCard({ profile, seekerProfile }) {
  const { t } = useLanguage();
  const strength = calculateProfileStrength(profile, seekerProfile);

  function getStrengthLabel() {
    if (strength.percentage >= 85) return t("strongProfile");
    if (strength.percentage >= 55) return t("goodProgress");
    return t("completeYourProfile");
  }

  return (
    <section className="profile-strength-card">
      <div className="profile-strength-top">
        <div>
          <p className="tagline">{t("profileStrength")}</p>
          <h2>{getStrengthLabel()}</h2>
          <p>{t("profileStrengthDesc")}</p>
        </div>

        <div className="profile-strength-score">
          <strong>{strength.percentage}%</strong>
          <span>{t("complete")}</span>
        </div>
      </div>

      <div className="profile-progress-track">
        <span style={{ width: `${strength.percentage}%` }}></span>
      </div>

      <div className="profile-checklist">
        {strength.checks.map((item) => (
          <div
            className={
              item.completed
                ? "profile-check-item completed"
                : "profile-check-item"
            }
            key={item.key}
          >
            {item.completed ? (
              <CheckCircle2 size={17} strokeWidth={2.8} />
            ) : (
              <Circle size={17} strokeWidth={2.4} />
            )}

            <span>{t(item.labelKey)}</span>
          </div>
        ))}
      </div>

      {strength.percentage < 100 && (
        <Link to="/seeker/profile" className="btn btn-primary profile-strength-btn">
          <Sparkles size={17} strokeWidth={2.7} />
          {t("improveProfile")}
        </Link>
      )}
    </section>
  );
}

export default ProfileStrengthCard;
