import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabase";

function ReportedJobs() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);

    const { data, error } = await supabase
      .from("job_reports")
      .select(`
        *,
        jobs (
          id,
          title,
          salary,
          timing,
          location,
          hiring_status,
          offline_shop_name,
          offline_shop_phone,
          shop_profiles (
            shop_name
          )
        ),
        profiles (
          name,
          email,
          phone
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setMessage(error.message);
    } else {
      setReports(data || []);
    }

    setLoading(false);
  }

  async function updateReportStatus(reportId, status) {
    setMessage("Updating report...");

    const { error } = await supabase
      .from("job_reports")
      .update({ status })
      .eq("id", reportId);

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage("Report updated.");
    fetchReports();
  }

  async function markJobFilled(jobId) {
    setMessage("Marking job as filled...");

    const { error } = await supabase
      .from("jobs")
      .update({
        hiring_status: "filled",
        filled_at: new Date().toISOString(),
        last_checked_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setMessage("Job marked as filled.");
    fetchReports();
  }

  function getShopName(report) {
    return (
      report.jobs?.shop_profiles?.shop_name ||
      report.jobs?.offline_shop_name ||
      "Local Shop"
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">Trust & Safety</p>
          <h1>Reported Jobs</h1>
          <p>Review fake, filled, suspicious, or incorrect job reports.</p>
        </div>

        <div className="admin-form-card">
          <div className="section-title-row">
            <div>
              <p className="tagline">Report Queue</p>
              <h2>Job Reports</h2>
            </div>

            <Link to="/admin/dashboard" className="btn btn-light">
              <ArrowLeft size={17} strokeWidth={2.7} />
              Back
            </Link>
          </div>

          {message && <div className="message">{message}</div>}

          {loading ? (
            <div className="empty-state">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={36} strokeWidth={2.5} />
              <h3>No reports yet</h3>
              <p>Reported jobs will appear here.</p>
            </div>
          ) : (
            <div className="reported-job-list">
              {reports.map((report) => (
                <div className="reported-job-card" key={report.id}>
                  <div className="reported-job-top">
                    <span className="report-card-icon">
                      <Flag size={18} strokeWidth={2.8} />
                    </span>

                    <div>
                      <h3>{report.jobs?.title || "Deleted Job"}</h3>
                      <p>
                        {getShopName(report)} • {report.jobs?.location || "No location"}
                      </p>
                    </div>

                    <span className={`report-status-pill ${report.status}`}>
                      {report.status}
                    </span>
                  </div>

                  <div className="reported-job-details">
                    <div>
                      <strong>Reason</strong>
                      <p>{report.reason}</p>
                    </div>

                    <div>
                      <strong>Details</strong>
                      <p>{report.details || "No extra details provided."}</p>
                    </div>

                    <div>
                      <strong>Reported By</strong>
                      <p>
                        {report.profiles?.name || "User"} •{" "}
                        {report.profiles?.phone || report.profiles?.email || "No contact"}
                      </p>
                    </div>

                    <div>
                      <strong>Job Status</strong>
                      <p>{report.jobs?.hiring_status || "unknown"}</p>
                    </div>
                  </div>

                  <div className="reported-job-actions">
                    {report.jobs?.id && (
                      <button
                        type="button"
                        className="btn mark-filled-btn"
                        onClick={() => markJobFilled(report.jobs.id)}
                      >
                        Mark Job Filled
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => updateReportStatus(report.id, "reviewed")}
                    >
                      Mark Reviewed
                    </button>

                    <button
                      type="button"
                      className="btn reopen-job-btn"
                      onClick={() => updateReportStatus(report.id, "resolved")}
                    >
                      Resolve
                    </button>
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

export default ReportedJobs;
