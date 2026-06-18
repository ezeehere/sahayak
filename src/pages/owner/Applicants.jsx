import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import ApplicantCard from "../../components/ApplicantCard";
import { markApplicationAsSeen } from "../../utils/ownerApplicantData";

function Applicants() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);

  const params = new URLSearchParams(window.location.search);
  const selectedApplicationId = params.get("application");

  useEffect(() => {
    if (selectedApplicationId) {
      markApplicationAsSeen(selectedApplicationId);
    }
  }, [selectedApplicationId]);
  const [seekerProfilesMap, setSeekerProfilesMap] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchApplications();
    }
  }, [user]);

  async function fetchApplications() {
    setLoading(true);

    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        jobs (
          id,
          title,
          salary,
          timing,
          location
        ),
        profiles (
          id,
          name,
          email,
          phone
        )
      `)
      .eq("owner_id", user.id)
      .order("applied_at", { ascending: false });

    if (error) {
      console.log(error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const apps = data || [];
    setApplications(apps);

    const seekerIds = apps
      .map((item) => item.seeker_id)
      .filter(Boolean);

    if (seekerIds.length === 0) {
      setSeekerProfilesMap({});
      setLoading(false);
      return;
    }

    const { data: seekerProfiles, error: seekerError } = await supabase
      .from("seeker_profiles")
      .select("*")
      .in("user_id", seekerIds);

    if (seekerError) {
      console.log(seekerError);
      setMessage(seekerError.message);
      setLoading(false);
      return;
    }

    const map = {};

    (seekerProfiles || []).forEach((item) => {
      map[item.user_id] = item;
    });

    setSeekerProfilesMap(map);
    setLoading(false);
  }

  async function updateApplicationStatus(applicationId, status) {
    setMessage(t("updatingApplicationStatus"));

    const { error } = await supabase
      .from("applications")
      .update({
        status,
        last_status_updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage(t("applicationStatusUpdatedSuccess"));
    fetchApplications();
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
          <div className="better-applicants-list">
            {applications.map((application) => (
              <ApplicantCard
                key={application.id}
                application={application}
                seekerProfile={seekerProfilesMap[application.seeker_id]}
                onStatusChange={updateApplicationStatus}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Applicants;