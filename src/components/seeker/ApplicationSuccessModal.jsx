// src/components/seeker/ApplicationSuccessModal.jsx

import React from "react";
import { X, CheckCircle } from "lucide-react";

export default function ApplicationSuccessModal({
  application,
  mode, // "new" or "existing"
  onClose,
  onViewApplications,
  onBrowseJobs,
}) {
  const statusLabel = application?.status || "pending";
  const isExisting = mode === "existing";

  const headerText = isExisting ? "Application Already Submitted" : "Application Successful";
  const bodyText = isExisting
    ? "You have already applied for this job. Here is the current status of your application."
    : "Your application has been submitted successfully!";

  const statusMessageMap = {
    pending: "Your application is pending review by the shop owner.",
    shortlisted: "The shop owner has shortlisted your application.",
    accepted: "Your application has been accepted! The shop owner will contact you.",
    rejected: "Unfortunately, your application was not selected.",
    hired: "Congratulations! You have been hired for this job.",
  };

  const statusMessage = statusMessageMap[statusLabel] || "Your application is pending review.";

  return (
    <div className="success-modal-backdrop" onClick={onClose}>
      <div className="success-modal-card" onClick={e => e.stopPropagation()}>
        <button className="success-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className="success-modal-head">
          <CheckCircle size={48} className="success-modal-check" />
          <h2>{headerText}</h2>
        </div>
        <p className="success-status-message">{bodyText}</p>
        <div className="success-job-badge-container">
          <span className="success-job-title">{application?.job_title || "Job"}</span>
          <span className="success-status-pill success-status-{statusLabel}">{statusLabel}</span>
        </div>
        <p className="success-status-message">{statusMessage}</p>
        <div className="success-modal-actions">
          <button className="btn btn-primary" onClick={onViewApplications}>
            View My Applications
          </button>
          <button className="btn btn-light" onClick={onBrowseJobs}>
            Browse More Jobs
          </button>
        </div>
      </div>
    </div>
  );
}
