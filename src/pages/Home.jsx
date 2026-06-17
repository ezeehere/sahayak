import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

function Home() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />

      <main className="hero">
        <div className="hero-content">
          <p className="tagline">{t("tagline")}</p>

          <h1>
            {t("findLocalJobsWith")} <span>{t("appName")}</span>
          </h1>

          <p className="hero-text">
            {t("homeDescription")}
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              {t("getStarted")}
            </Link>

            <Link to="/login" className="btn btn-light">
              {t("login")}
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <h3>{t("coreModules")}</h3>

          <div className="category-grid">
            <span>{t("jobSeekerRole")}</span>
            <span>{t("shopOwnerRole")}</span>
            <span>{t("adminRole")}</span>
            <span>{t("jobPosts")}</span>
            <span>{t("applications")}</span>
            <span>{t("savedJobs")}</span>
            <span>{t("verifiedShops")}</span>
            <span>{t("supabase")}</span>
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;