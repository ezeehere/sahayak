import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function SeekerProfile() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const [form, setForm] = useState({
    skills: "",
    experience: "",
    preferred_job_type: "part-time",
    expected_salary: "",
    location: "",
    availability: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeekerProfile();
  }, []);

  async function fetchSeekerProfile() {
    if (!user) return;

    const { data, error } = await supabase
      .from("seeker_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      setMessage(t("couldNotLoadProfile"));
      setLoading(false);
      return;
    }

    if (data) {
      setForm({
        skills: data.skills || "",
        experience: data.experience || "",
        preferred_job_type: data.preferred_job_type || "part-time",
        expected_salary: data.expected_salary || "",
        location: data.location || "",
        availability: data.availability || "",
      });
    }

    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(t("savingProfile"));

    const { error } = await supabase.from("seeker_profiles").upsert(
      {
        user_id: user.id,
        skills: form.skills,
        experience: form.experience,
        preferred_job_type: form.preferred_job_type,
        expected_salary: form.expected_salary,
        location: form.location,
        availability: form.availability,
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage(t("profileSavedSuccess"));
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("seekerPanel")}</p>
            <h1>{t("loadingProfile")}</h1>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">{t("seekerPanel")}</p>
          <h1>{t("myProfile")}</h1>
          <p>
            {t("seekerProfileDesc")}
          </p>
        </div>

        <div className="form-card wide-form">
          <h2>{t("hello")}, {profile?.name}</h2>
          <p className="subtitle">{t("completeYourProfile")}</p>

          {message && <div className="message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <label>{t("skills")}</label>
            <textarea
              rows="4"
              placeholder={t("skillsPlaceholder")}
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              required
            />

            <label>{t("experience")}</label>
            <input
              type="text"
              placeholder={t("experiencePlaceholder")}
              value={form.experience}
              onChange={(e) =>
                setForm({ ...form, experience: e.target.value })
              }
              required
            />

            <label>{t("preferredJobType")}</label>
            <select
              value={form.preferred_job_type}
              onChange={(e) =>
                setForm({ ...form, preferred_job_type: e.target.value })
              }
              required
            >
              <option value="part-time">{t("partTime")}</option>
              <option value="full-time">{t("fullTime")}</option>
              <option value="any">{t("any")}</option>
            </select>

            <label>{t("expectedSalary")}</label>
            <input
              type="text"
              placeholder={t("salaryPlaceholder")}
              value={form.expected_salary}
              onChange={(e) =>
                setForm({ ...form, expected_salary: e.target.value })
              }
              required
            />

            <label>{t("location")}</label>
            <input
              type="text"
              placeholder={t("locationPlaceholder")}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />

            <label>{t("availability")}</label>
            <input
              type="text"
              placeholder={t("availabilityPlaceholder")}
              value={form.availability}
              onChange={(e) =>
                setForm({ ...form, availability: e.target.value })
              }
              required
            />

            <button type="submit" className="primary-btn">
              {t("saveProfile")}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default SeekerProfile;