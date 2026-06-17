import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  Languages,
  MapPin,
  PlusCircle,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  UserPlus,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const sahayakWords = [
  { word: "Sahayak" },
  { word: "सहायक" },
  { word: "সহায়ক" },
];

function splitLetters(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (item) => item.segment);
  }

  return Array.from(text);
}

function AnimatedSahayakWord() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("enter");

  useEffect(() => {
    let timeoutId;

    const intervalId = setInterval(() => {
      setPhase("exit");

      timeoutId = setTimeout(() => {
        setIndex((current) => (current + 1) % sahayakWords.length);
        setPhase("enter");
      }, 360);
    }, 2200);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  const activeWord = sahayakWords[index];
  const letters = splitLetters(activeWord.word);

  return (
    <span className={`premium-sahayak-wrap ${phase}`}>
      <span className="premium-word-glow"></span>

      <span className="premium-word" key={activeWord.word}>
        {letters.map((letter, letterIndex) => (
          <span
            className="premium-word-letter"
            style={{ "--letter-index": letterIndex }}
            key={`${letter}-${letterIndex}-${activeWord.word}`}
          >
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
}

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
      return { label: t("browseJobs"), link: "/seeker/jobs" };
    }

    if (profile?.role === "owner") {
      return { label: t("postJob"), link: "/owner/post-job" };
    }

    if (profile?.role === "admin") {
      return { label: t("manageSystem"), link: "/admin/dashboard" };
    }

    return { label: t("getStarted"), link: "/register" };
  }

  const primaryAction = getPrimaryAction();

  return (
    <>
      <Navbar />

      <main className="home-page enhanced-home-page">
        <section className="home-hero enhanced-home-hero">

          <div className="hero-glow hero-glow-two"></div>

          <div className="home-hero-content">
            <p className="tagline hero-main-tag">
              <Sparkles size={16} strokeWidth={2.7} />
              {t("localJobFinderSystem")}
            </p>

            <h1 className="enhanced-hero-title">
              {t("findLocalJobsNearYouWith")} <AnimatedSahayakWord />
            </h1>

            <p className="home-hero-desc enhanced-hero-desc">
              {t("homeDescription")}
            </p>

            <div className="home-actions enhanced-home-actions">
              <Link
                to={primaryAction.link}
                className="btn btn-primary hero-primary-btn"
              >
                {primaryAction.label}
                <ArrowRight size={18} strokeWidth={2.8} />
              </Link>

              {profile ? (
                <Link to={getDashboardLink()} className="btn btn-light">
                  {t("dashboard")}
                </Link>
              ) : (
                <Link to="/login" className="btn btn-light">
                  {t("login")}
                </Link>
              )}
            </div>

            <div className="hero-trust-row">
              <span>
                <MapPin size={15} strokeWidth={2.6} />
                {t("localJobs")}
              </span>

              <span>
                <Store size={15} strokeWidth={2.6} />
                {t("nearbyShops")}
              </span>

              <span>
                <Languages size={15} strokeWidth={2.6} />
                {t("multiLanguage")}
              </span>
            </div>
          </div>

          <div className="enhanced-hero-panel">
            <div className="floating-mini-card card-one">
              <span>{t("new")}</span>
              <strong>{t("pharmacyHelper")}</strong>
              <p>{t("sampleSalaryLocation")}</p>
            </div>

            <div className="floating-mini-card card-two">
              <span>{t("pending")}</span>
              <strong>{t("twoApplications")}</strong>
              <p>{t("reviewApplicantsQuickly")}</p>
            </div>

            <div className="home-hero-panel main-module-panel">
              <div className="hero-panel-top">
                <div>
                  <p className="mini-label">{t("livePlatform")}</p>
                  <h2>{t("coreModules")}</h2>
                </div>

                <span className="hero-status">{t("active")}</span>
              </div>

              <div className="module-chip-grid">
                <span>{t("jobSeeker")}</span>
                <span>{t("shopOwner")}</span>
                <span>{t("admin")}</span>
                <span>{t("jobPosts")}</span>
                <span>{t("applications")}</span>
                <span>{t("savedJobs")}</span>
                <span>{t("verifiedShops")}</span>
                <span>Jorhat</span>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section onboarding-section">
          <div className="home-section-head onboarding-head">
            <p className="tagline">{t("quickSetupGuide")}</p>
            <h2>{t("startUsingSahayak")}</h2>
            <p>{t("startUsingSahayakDesc")}</p>
          </div>

          <div className="onboarding-grid">
            <article className="onboarding-card seeker-onboarding-card">
              <div className="onboarding-card-top">
                <div className="onboarding-icon">
                  <UserRound size={28} strokeWidth={2.7} />
                </div>

                <div>
                  <p className="mini-label">{t("forJobSeekers")}</p>
                  <h3>{t("findAndApplyJobs")}</h3>
                </div>
              </div>

              <div className="onboarding-steps">
                <div className="onboarding-step">
                  <span>1</span>
                  <div>
                    <h4>{t("createYourAccount")}</h4>
                    <p>{t("createYourAccountDesc")}</p>
                  </div>
                  <UserPlus size={22} strokeWidth={2.6} />
                </div>

                <div className="onboarding-step">
                  <span>2</span>
                  <div>
                    <h4>{t("completeYourProfile")}</h4>
                    <p>{t("completeYourProfileDesc")}</p>
                  </div>
                  <BadgeCheck size={22} strokeWidth={2.6} />
                </div>

                <div className="onboarding-step">
                  <span>3</span>
                  <div>
                    <h4>{t("browseLocalJobs")}</h4>
                    <p>{t("browseLocalJobsDesc")}</p>
                  </div>
                  <SearchCheck size={22} strokeWidth={2.6} />
                </div>

                <div className="onboarding-step">
                  <span>4</span>
                  <div>
                    <h4>{t("applyAndContact")}</h4>
                    <p>{t("applyAndContactDesc")}</p>
                  </div>
                  <Send size={22} strokeWidth={2.6} />
                </div>
              </div>
            </article>

            <article className="onboarding-card owner-onboarding-card">
              <div className="onboarding-card-top">
                <div className="onboarding-icon">
                  <Building2 size={28} strokeWidth={2.7} />
                </div>

                <div>
                  <p className="mini-label">{t("forShopOwners")}</p>
                  <h3>{t("postJobsAndManageApplicants")}</h3>
                </div>
              </div>

              <div className="onboarding-steps">
                <div className="onboarding-step">
                  <span>1</span>
                  <div>
                    <h4>{t("createOwnerAccount")}</h4>
                    <p>{t("createOwnerAccountDesc")}</p>
                  </div>
                  <UserPlus size={22} strokeWidth={2.6} />
                </div>

                <div className="onboarding-step">
                  <span>2</span>
                  <div>
                    <h4>{t("addShopProfile")}</h4>
                    <p>{t("addShopProfileDesc")}</p>
                  </div>
                  <Store size={22} strokeWidth={2.6} />
                </div>

                <div className="onboarding-step">
                  <span>3</span>
                  <div>
                    <h4>{t("postAJob")}</h4>
                    <p>{t("postAJobDesc")}</p>
                  </div>
                  <PlusCircle size={22} strokeWidth={2.6} />
                </div>

                <div className="onboarding-step">
                  <span>4</span>
                  <div>
                    <h4>{t("reviewApplicants")}</h4>
                    <p>{t("reviewApplicantsDesc")}</p>
                  </div>
                  <Users size={22} strokeWidth={2.6} />
                </div>
              </div>
            </article>
          </div>


        </section>


      </main>
    </>
  );
}

export default Home;