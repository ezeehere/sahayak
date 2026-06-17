import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function ManageJobs() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select(
        `
        *,
        shop_profiles (
          shop_name,
          address,
          is_verified
        ),
        profiles (
          name,
          email,
          phone
        )
      `
      )
      .order("created_at", { ascending: false });

    if (jobError) {
      console.log(jobError);
      setMessage(jobError.message);
      setLoading(false);
      return;
    }

    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (!categoryError) {
      setCategories(categoryData || []);
    }

    setJobs(jobData || []);
    setLoading(false);
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        job.title?.toLowerCase().includes(searchText) ||
        job.category?.toLowerCase().includes(searchText) ||
        job.location?.toLowerCase().includes(searchText) ||
        job.shop_profiles?.shop_name?.toLowerCase().includes(searchText) ||
        job.profiles?.name?.toLowerCase().includes(searchText);

      const matchesStatus = statusFilter ? job.status === statusFilter : true;
      const matchesCategory = categoryFilter
        ? job.category === categoryFilter
        : true;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [jobs, search, statusFilter, categoryFilter]);

  async function updateJobStatus(jobId, newStatus) {
    setMessage(t("updatingJobStatus"));

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId);

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setJobs((previousJobs) =>
      previousJobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );

    setMessage(t("jobStatusUpdatedSuccess"));
  }

  function formatDate(dateValue) {
    if (!dateValue) return t("notAvailable");

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("adminPanel")}</p>
            <h1>{t("loadingJobs")}</h1>
            <p>{t("fetchingAllJobs")}</p>
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
          <p className="tagline">{t("adminPanel")}</p>
          <h1>{t("manageJobs")}</h1>
          <p>{t("manageJobsDesc")}</p>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="filter-box admin-job-filter">
          <input
            type="text"
            placeholder={t("searchJobPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t("allStatus")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="approved">{t("approved")}</option>
            <option value="closed">{t("closed")}</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">{t("allCategories")}</option>

            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <button
            className="btn btn-light"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setCategoryFilter("");
            }}
          >
            {t("reset")}
          </button>
        </div>

        <div className="admin-panel-card">
          <div className="section-title-row">
            <div>
              <p className="tagline">{t("jobs")}</p>
              <h2>{filteredJobs.length} {t("jobsFound")}</h2>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="empty-box">
              <h3>{t("noJobsFound")}</h3>
              <p>{t("changeFilterMsg")}</p>
            </div>
          ) : (
            <div className="admin-job-list">
              {filteredJobs.map((job) => (
                <div className="admin-job-card" key={job.id}>
                  <div className="admin-job-head">
                    <div>
                      <h3>{job.title}</h3>

                      <p>
                        {job.shop_profiles?.shop_name || t("localShop")}

                        {job.shop_profiles?.is_verified && (
                          <span className="verified-badge">{t("verified")}</span>
                        )}
                      </p>
                    </div>

                    <span className={`status-badge status-${job.status}`}>
                      {t(job.status) || job.status}
                    </span>
                  </div>

                  <div className="admin-job-details">
                    <p>
                      <strong>{t("owner")}:</strong>{" "}
                      {job.profiles?.name || t("notAvailable")}
                    </p>

                    <p>
                      <strong>{t("email")}:</strong>{" "}
                      {job.profiles?.email || t("notAvailable")}
                    </p>

                    <p>
                      <strong>{t("phone")}:</strong>{" "}
                      {job.profiles?.phone || t("notAvailable")}
                    </p>

                    <p>
                      <strong>{t("category")}:</strong> {job.category}
                    </p>

                    <p>
                      <strong>{t("jobType")}:</strong> {job.job_type}
                    </p>

                    <p>
                      <strong>{t("salary")}:</strong> {job.salary}
                    </p>

                    <p>
                      <strong>{t("timing")}:</strong> {job.timing}
                    </p>

                    <p>
                      <strong>{t("location")}:</strong> {job.location}
                    </p>

                    <p>
                      <strong>{t("postedOn")}:</strong> {formatDate(job.created_at)}
                    </p>
                  </div>

                  <p className="admin-job-desc">{job.description}</p>

                  <div className="status-control">
                    <label>{t("updateJobStatus")}</label>

                    <select
                      value={job.status}
                      onChange={(e) => updateJobStatus(job.id, e.target.value)}
                    >
                      <option value="pending">{t("pending")}</option>
                      <option value="approved">{t("approved")}</option>
                      <option value="closed">{t("closed")}</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default ManageJobs;