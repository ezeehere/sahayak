import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Clock,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function extractSalaryNumber(salaryText) {
  if (!salaryText) return 0;

  const numbers = salaryText.match(/\d+/g);

  if (!numbers) return 0;

  return Math.max(...numbers.map((item) => Number(item)));
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function MatchingJobs() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [preferences, setPreferences] = useState(null);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchMatchingJobs();
    }
  }, [user?.id]);

  async function fetchMatchingJobs() {
    setLoading(true);

    const { data: preferenceData } = await supabase
      .from("job_preferences")
      .select("*")
      .eq("seeker_id", user.id)
      .maybeSingle();

    setPreferences(preferenceData || null);

    const today = new Date().toISOString().slice(0, 10);

    const { data: jobsData, error } = await supabase
      .from("jobs")
      .select(`
        *,
        shop_profiles (
          shop_name,
          address,
          category,
          is_verified
        )
      `)
      .eq("status", "approved")
      .eq("hiring_status", "open")
      .gte("expires_at", today)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.log(error);
      setMatchingJobs([]);
      setLoading(false);
      return;
    }

    const scoredJobs = (jobsData || [])
      .map((job) => ({
        ...job,
        matchScore: getMatchScore(job, preferenceData),
      }))
      .filter((job) => job.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4);

    setMatchingJobs(scoredJobs);
    setLoading(false);
  }

  function getMatchScore(job, preference) {
    if (!preference) return 1;

    let score = 0;

    const preferredCategory = normalizeText(preference.preferred_category);
    const preferredLocation = normalizeText(preference.preferred_location);
    const preferredJobType = normalizeText(preference.preferred_job_type);
    const preferredTiming = normalizeText(preference.preferred_timing);

    const jobCategory = normalizeText(job.category);
    const jobLocation = normalizeText(job.location);
    const jobType = normalizeText(job.job_type);
    const jobTiming = normalizeText(job.timing);
    const jobSalary = extractSalaryNumber(job.salary);

    if (preferredCategory && jobCategory === preferredCategory) score += 35;
    if (preferredLocation && jobLocation.includes(preferredLocation)) score += 25;
    if (preferredJobType && jobType === preferredJobType) score += 20;

    if (
      preference.minimum_salary &&
      jobSalary >= Number(preference.minimum_salary)
    ) {
      score += 15;
    }

    if (preferredTiming && jobTiming.includes(preferredTiming)) score += 10;

    if (
      !preferredCategory &&
      !preferredLocation &&
      !preferredJobType &&
      !preference.minimum_salary &&
      !preferredTiming
    ) {
      score = 1;
    }

    return score;
  }

  function getShopName(job) {
    return job.shop_profiles?.shop_name || job.offline_shop_name || t("localShop");
  }

  return (
    <section className="matching-jobs-card">
      <div className="matching-jobs-head">
        <div>
          <p className="tagline">{t("smartMatching")}</p>
          <h2>{t("jobsMatchingYou")}</h2>
          <p>{t("jobsMatchingYouDesc")}</p>
        </div>

        <Link to="/seeker/preferences" className="btn btn-light">
          <SlidersHorizontal size={17} strokeWidth={2.7} />
          {t("editPreferences")}
        </Link>
      </div>

      {!preferences && (
        <div className="matching-empty">
          <Sparkles size={26} strokeWidth={2.7} />
          <div>
            <h3>{t("setPreferencesTitle")}</h3>
            <p>{t("setPreferencesDesc")}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state">{t("loading")}</div>
      ) : matchingJobs.length === 0 ? (
        <div className="matching-empty">
          <BriefcaseBusiness size={26} strokeWidth={2.7} />
          <div>
            <h3>{t("noMatchingJobs")}</h3>
            <p>{t("noMatchingJobsDesc")}</p>
          </div>
        </div>
      ) : (
        <div className="matching-jobs-list">
          {matchingJobs.map((job) => (
            <Link
              to={`/seeker/jobs/${job.id}`}
              className="matching-job-row"
              key={job.id}
            >
              <div className="matching-job-icon">
                <BriefcaseBusiness size={19} strokeWidth={2.7} />
              </div>

              <div className="matching-job-main">
                <h3>{job.title}</h3>

                <p>
                  <Store size={14} strokeWidth={2.6} />
                  {getShopName(job)}
                </p>

                <div className="matching-job-meta">
                  <span>
                    <MapPin size={14} strokeWidth={2.6} />
                    {job.location}
                  </span>

                  <span>
                    <Clock size={14} strokeWidth={2.6} />
                    {job.timing}
                  </span>
                </div>
              </div>

              <div className="matching-job-side">
                <strong>{job.salary}</strong>
                <span>{job.matchScore}% {t("match")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default MatchingJobs;
