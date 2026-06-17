import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function Applicants() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchApplicants();
    }
  }, [user]);

  async function fetchApplicants() {
    setLoading(true);

    const { data: applicationData, error: applicationError } = await supabase
      .from("applications")
      .select(
        `
        id,
        status,
        applied_at,
        seeker_id,
        jobs (
          id,
          title,
          category,
          salary,
          timing,
          location,
          job_type,
          description,
          shop_profiles (
            shop_name,
            is_verified
          )
        )
      `
      )
      .eq("owner_id", user.id)
      .order("applied_at", { ascending: false });

    if (applicationError) {
      console.log(applicationError);
      setMessage(applicationError.message);
      setLoading(false);
      return;
    }

    const seekerIds = [...new Set((applicationData || []).map((app) => app.seeker_id))];

    let profiles = [];
    let seekerProfiles = [];

    if (seekerIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name, email, phone")
        .in("id", seekerIds);

      const { data: seekerProfileData } = await supabase
        .from("seeker_profiles")
        .select("*")
        .in("user_id", seekerIds);

      profiles = profileData || [];
      seekerProfiles = seekerProfileData || [];
    }

    const finalData = (applicationData || []).map((application) => {
      const applicant = profiles.find((item) => item.id === application.seeker_id);
      const seekerProfile = seekerProfiles.find(
        (item) => item.user_id === application.seeker_id
      );

      return {
        ...application,
        applicant,
        seekerProfile,
      };
    });

    setApplications(finalData);
    setLoading(false);
  }

  async function updateStatus(applicationId, newStatus) {
    setMessage(t("updatingApplicationStatus"));

    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", applicationId)
      .eq("owner_id", user.id);

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage(t("applicationStatusUpdatedSuccess"));

    setApplications((previous) =>
      previous.map((application) =>
        application.id === applicationId
          ? { ...application, status: newStatus }
          : application
      )
    );
  }

  function formatDate(dateValue) {
    if (!dateValue) return t("notAvailable");

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getCleanPhone(phone) {
    if (!phone) return "";

    let cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }

    return cleanPhone;
  }

  function getWhatsAppLink(phone, jobTitle) {
    const cleanPhone = getCleanPhone(phone);

    if (!cleanPhone) return "#";

    const greetingStr = t("whatsappGreeting");
    const text = greetingStr === "whatsappGreeting" || !greetingStr 
      ? `Hello, this is regarding your application for ${jobTitle} on Sahayak.`
      : greetingStr.replace("{jobTitle}", jobTitle);

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  function getCallLink(phone) {
    const cleanPhone = getCleanPhone(phone);

    if (!cleanPhone) return "#";

    return `tel:+${cleanPhone}`;
  }

  if (!user?.id || loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("ownerPanel")}</p>
            <h1>{t("loadingApplicants")}</h1>
            <p>{t("fetchingApplicants")}</p>
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
          <h1>{t("applicants")}</h1>
          <p>{t("applicantsPageDesc")}</p>
        </div>

        {message && <div className="message">{message}</div>}

        {applications.length === 0 ? (
          <div className="empty-box">
            <h3>{t("noApplicantsYet")}</h3>
            <p>{t("applicantsAppearHereMsg")}</p>
          </div>
        ) : (
          <div className="applicant-grid">
            {applications.map((application) => {
              const job = application.jobs;
              const applicant = application.applicant;
              const seekerProfile = application.seekerProfile;

              return (
                <div className="applicant-card" key={application.id}>
                  <div className="job-top">
                    <div>
                      <h3>{applicant?.name || t("applicant")}</h3>
                      <p className="shop-name">{applicant?.email}</p>
                    </div>

                    <span className={`status-badge status-${application.status}`}>
                      {t(application.status) || application.status}
                    </span>
                  </div>

                  <div className="applicant-section">
                    <h4>{t("appliedJob")}</h4>

                    <div className="job-info">
                      <p>
                        <strong>{t("job")}:</strong> {job?.title || t("notAvailable")}
                      </p>
                      <p>
                        <strong>{t("category")}:</strong> {job?.category || t("notAvailable")}
                      </p>
                      <p>
                        <strong>{t("salary")}:</strong> {job?.salary || t("notAvailable")}
                      </p>
                      <p>
                        <strong>{t("timing")}:</strong> {job?.timing || t("notAvailable")}
                      </p>
                      <p>
                        <strong>{t("location")}:</strong> {job?.location || t("notAvailable")}
                      </p>
                      <p>
                        <strong>{t("appliedOn")}:</strong>{" "}
                        {formatDate(application.applied_at)}
                      </p>
                    </div>
                  </div>

                  <div className="applicant-section">
                    <h4>{t("applicantDetails")}</h4>

                    <div className="job-info">
                      <p>
                        <strong>{t("phone")}:</strong>{" "}
                        {applicant?.phone || t("notAvailable")}
                      </p>
                      <p>
                        <strong>{t("skills")}:</strong>{" "}
                        {seekerProfile?.skills || t("notAdded")}
                      </p>
                      <p>
                        <strong>{t("experience")}:</strong>{" "}
                        {seekerProfile?.experience || t("notAdded")}
                      </p>
                      <p>
                        <strong>{t("expectedSalary")}:</strong>{" "}
                        {seekerProfile?.expected_salary || t("notAdded")}
                      </p>
                      <p>
                        <strong>{t("availability")}:</strong>{" "}
                        {seekerProfile?.availability || t("notAdded")}
                      </p>
                    </div>
                  </div>

                  <div className="status-control">
                    <label>{t("updateStatus")}</label>

                    <select
                      value={application.status}
                      onChange={(e) =>
                        updateStatus(application.id, e.target.value)
                      }
                    >
                      <option value="pending">{t("pending")}</option>
                      <option value="shortlisted">{t("shortlisted")}</option>
                      <option value="rejected">{t("rejected")}</option>
                      <option value="hired">{t("hired")}</option>
                    </select>
                  </div>

                  <div className="job-actions">
                    <a
                      href={getCallLink(applicant?.phone)}
                      className="btn btn-light"
                    >
                      {t("callApplicant")}
                    </a>

                    <a
                      href={getWhatsAppLink(applicant?.phone, job?.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-whatsapp"
                    >
                      {t("whatsapp")}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

export default Applicants;