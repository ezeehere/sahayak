import { AlertTriangle, ShieldCheck, WalletCards } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function JobSafetyNotice() {
  const { t } = useLanguage();

  return (
    <section className="job-safety-notice">
      <div className="job-safety-icon">
        <ShieldCheck size={22} strokeWidth={2.7} />
      </div>

      <div className="job-safety-content">
        <h3>{t("jobSafetyTitle")}</h3>
        <p>{t("jobSafetyDesc")}</p>

        <div className="job-safety-points">
          <span>
            <WalletCards size={15} strokeWidth={2.7} />
            {t("neverPayForJob")}
          </span>

          <span>
            <AlertTriangle size={15} strokeWidth={2.7} />
            {t("reportIfAskedMoney")}
          </span>
        </div>
      </div>
    </section>
  );
}

export default JobSafetyNotice;
