import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import OwnerSetupProgress from "../../components/owner/OwnerSetupProgress";
import OwnerFirstJobSuccessModal from "../../components/owner/OwnerFirstJobSuccessModal";

function PostJob() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const [shopProfile, setShopProfile] = useState(null);
  const [categories, setCategories] = useState([]);

  const params = new URLSearchParams(window.location.search);
  const firstJobMode = params.get("firstJob") === "1";

  const [postedJob, setPostedJob] = useState(null);
  const [showFirstJobSuccess, setShowFirstJobSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    job_type: "part-time",
    salary: "",
    timing: "",
    location: "",
    expiresAt: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchInitialData();
    }
  }, [user]);

  async function fetchInitialData() {
    setLoading(true);

    const { data: shopData, error: shopError } = await supabase
      .from("shop_profiles")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (shopError) {
      console.log(shopError);
      setMessage(shopError.message);
    } else {
      setShopProfile(shopData);
    }

    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (categoryError) {
      console.log(categoryError);
    } else {
      setCategories(categoryData || []);
    }

    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user?.id) {
      setMessage(t("userNotLoaded"));
      return;
    }

    if (!shopProfile) {
      setMessage(t("createProfileFirst"));
      return;
    }

    setMessage(t("postingJob"));

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        owner_id: user.id,
        shop_id: shopProfile.id,
        title: form.title,
        category: form.category,
        description: form.description,
        job_type: form.job_type,
        salary: form.salary,
        timing: form.timing,
        location: form.location,
        status: "approved",
        hiring_status: "open",
        expires_at: form.expiresAt || null,
        last_checked_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage(t("jobPostedSuccess"));

    setForm({
      title: "",
      category: "",
      description: "",
      job_type: "part-time",
      salary: "",
      timing: "",
      location: "",
      expiresAt: "",
    });

    if (firstJobMode) {
      setPostedJob(data);
      setShowFirstJobSuccess(true);
      return;
    }

    setTimeout(() => {
      window.location.href = "/owner/dashboard?focus=jobs";
    }, 1000);
  }

  if (!user?.id || loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("ownerPanel")}</p>
            <h1>{t("loading")}</h1>
            <p>{t("preparingJobForm")}</p>
          </div>
        </main>
      </>
    );
  }

  if (!shopProfile) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("ownerPanel")}</p>
            <h1>{t("shopProfileRequired")}</h1>
            <p>{t("needProfileToPostJob")}</p>
          </div>

          <div className="form-card wide-form">
            <h2>{t("noShopProfileFound")}</h2>
            <p className="subtitle">
              {t("addShopDetailsFirst")}
            </p>

            {message && <div className="message">{message}</div>}

            <Link to="/owner/shop-profile" className="btn btn-primary">
              {t("createShopProfile")}
            </Link>
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
          <p className="tagline">{t("ownerPanel")}</p>
          <h1>{t("postNewJob")}</h1>
          <p>
            {t("postJobPageDesc")}
          </p>
        </div>

        {firstJobMode && <OwnerSetupProgress currentStep={2} />}

        <div className="form-card wide-form">
          <h2>{t("hello")}, {profile?.name || t("owner")}</h2>
          <p className="subtitle">
            {t("postingAs")} {shopProfile.shop_name}
            {shopProfile.is_verified ? ` • ${t("verifiedShop")}` : ""}
          </p>

          {message && <div className="message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <label>{t("jobTitle")}</label>
            <input
              type="text"
              placeholder={t("jobTitlePlaceholder")}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <label>{t("jobCategory")}</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">{t("selectCategory")}</option>

              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <label>{t("jobDescription")}</label>
            <textarea
              rows="5"
              placeholder={t("jobDescPlaceholder")}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />

            <label>{t("jobType")}</label>
            <select
              value={form.job_type}
              onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              required
            >
              <option value="part-time">{t("partTime")}</option>
              <option value="full-time">{t("fullTime")}</option>
            </select>

            <label>{t("salary")}</label>
            <input
              type="text"
              placeholder={t("postJobSalaryPlaceholder")}
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              required
            />

            <label>{t("timing")}</label>
            <input
              type="text"
              placeholder={t("postJobTimingPlaceholder")}
              value={form.timing}
              onChange={(e) => setForm({ ...form, timing: e.target.value })}
              required
            />

            <label>{t("location")}</label>
            <input
              type="text"
              placeholder={t("postJobLocationPlaceholder")}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />

            <label>{t("expiryDate") || "Expiry Date"}</label>
            <input
              type="date"
              name="expiresAt"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              required
            />

            <button type="submit" className="primary-btn">
              {t("postJob")}
            </button>
          </form>
        </div>

        {showFirstJobSuccess && postedJob && (
          <OwnerFirstJobSuccessModal
            job={postedJob}
            shopName={shopProfile?.shop_name || "your shop"}
            onClose={() => setShowFirstJobSuccess(false)}
          />
        )}
      </main>
    </>
  );
}

export default PostJob;