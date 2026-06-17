import { useEffect, useState } from "react";
import { ArrowLeft, SlidersHorizontal, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

function JobPreferences() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    preferredCategory: "",
    preferredLocation: "",
    preferredJobType: "",
    minimumSalary: "",
    preferredTiming: "",
  });

  useEffect(() => {
    if (user?.id) {
      fetchInitialData();
    }
  }, [user?.id]);

  async function fetchInitialData() {
    setLoading(true);

    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    setCategories(categoryData || []);

    const { data: preferenceData, error } = await supabase
      .from("job_preferences")
      .select("*")
      .eq("seeker_id", user.id)
      .maybeSingle();

    if (error) {
      console.log(error);
    }

    if (preferenceData) {
      setForm({
        preferredCategory: preferenceData.preferred_category || "",
        preferredLocation: preferenceData.preferred_location || "",
        preferredJobType: preferenceData.preferred_job_type || "",
        minimumSalary: preferenceData.minimum_salary || "",
        preferredTiming: preferenceData.preferred_timing || "",
      });
    }

    setLoading(false);
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user?.id) {
      setMessage(t("pleaseLoginAgain"));
      return;
    }

    setMessage(t("savingPreferences"));

    const { error } = await supabase.from("job_preferences").upsert(
      {
        seeker_id: user.id,
        preferred_category: form.preferredCategory || null,
        preferred_location: form.preferredLocation || null,
        preferred_job_type: form.preferredJobType || null,
        minimum_salary: form.minimumSalary ? Number(form.minimumSalary) : null,
        preferred_timing: form.preferredTiming || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "seeker_id",
      }
    );

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage(t("preferencesSaved"));
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header preferences-header">
          <p className="tagline">{t("personalizedJobs")}</p>
          <h1>{t("jobPreferences")}</h1>
          <p>{t("jobPreferencesDesc")}</p>
        </div>

        <div className="preferences-card">
          <div className="section-title-row">
            <div>
              <p className="tagline">{t("matchingSetup")}</p>
              <h2>{t("tellUsYourPreference")}</h2>
            </div>

            <Link to="/seeker/dashboard" className="btn btn-light">
              <ArrowLeft size={17} strokeWidth={2.7} />
              {t("back")}
            </Link>
          </div>

          {message && <div className="message">{message}</div>}

          {loading ? (
            <div className="empty-state">{t("loading")}</div>
          ) : (
            <form className="preferences-form" onSubmit={handleSubmit}>
              <div className="preferences-grid">
                <div>
                  <label>{t("preferredCategory")}</label>
                  <select
                    name="preferredCategory"
                    value={form.preferredCategory}
                    onChange={handleChange}
                  >
                    <option value="">{t("anyCategory")}</option>

                    {categories.map((category) => (
                      <option value={category.name} key={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>{t("preferredLocation")}</label>
                  <input
                    name="preferredLocation"
                    value={form.preferredLocation}
                    onChange={handleChange}
                    placeholder="Jorhat, AT Road, Gar Ali..."
                  />
                </div>

                <div>
                  <label>{t("preferredJobType")}</label>
                  <select
                    name="preferredJobType"
                    value={form.preferredJobType}
                    onChange={handleChange}
                  >
                    <option value="">{t("anyJobType")}</option>
                    <option value="part-time">{t("partTime")}</option>
                    <option value="full-time">{t("fullTime")}</option>
                    <option value="daily">{t("daily")}</option>
                    <option value="temporary">{t("temporary")}</option>
                    <option value="internship">{t("internship")}</option>
                    <option value="contract">{t("contract")}</option>
                  </select>
                </div>

                <div>
                  <label>{t("minimumSalary")}</label>
                  <input
                    type="number"
                    name="minimumSalary"
                    value={form.minimumSalary}
                    onChange={handleChange}
                    placeholder="6000"
                    min="0"
                  />
                </div>

                <div className="preferences-full-field">
                  <label>{t("preferredTiming")}</label>
                  <input
                    name="preferredTiming"
                    value={form.preferredTiming}
                    onChange={handleChange}
                    placeholder="Evening, morning, 5 PM to 9 PM..."
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary preferences-submit">
                <Sparkles size={18} strokeWidth={2.7} />
                {t("savePreferences")}
              </button>
            </form>
          )}
        </div>

        <div className="preferences-help-card">
          <SlidersHorizontal size={22} strokeWidth={2.7} />
          <div>
            <h3>{t("howMatchingWorks")}</h3>
            <p>{t("howMatchingWorksDesc")}</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default JobPreferences;
