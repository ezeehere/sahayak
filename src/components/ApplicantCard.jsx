import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  UserRound,
  XCircle,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function cleanPhoneNumber(phone) {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

function ApplicantCard({ application, seekerProfile, onStatusChange }) {
  const { t } = useLanguage();

  const applicant = application.profiles || {};
  const cleanPhone = cleanPhoneNumber(applicant.phone);

  const whatsappText = `Hello ${applicant.name || ""}, I saw your application for ${application.jobs?.title || "a job"} on Sahayak.`;

  const whatsappUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(
        whatsappText
      )}`
    : "";

  return (
    <article className="better-applicant-card">
      <div className="better-applicant-top">
        <span className="better-applicant-avatar">
          <UserRound size={22} strokeWidth={2.7} />
        </span>

        <div>
          <h3>{applicant.name || t("applicant")}</h3>
          <p>{application.jobs?.title || t("job")}</p>
        </div>

        <span className={`application-status-pill ${application.status}`}>
          {t(application.status) || application.status}
        </span>
      </div>

      <div className="applicant-profile-grid">
        <div>
          <Phone size={16} strokeWidth={2.7} />
          <span>{applicant.phone || t("notAvailable")}</span>
        </div>

        <div>
          <MapPin size={16} strokeWidth={2.7} />
          <span>{seekerProfile?.location || seekerProfile?.preferred_location || t("notAvailable")}</span>
        </div>

        <div>
          <BriefcaseBusiness size={16} strokeWidth={2.7} />
          <span>{seekerProfile?.experience || t("noExperienceAdded")}</span>
        </div>

        <div>
          <Clock size={16} strokeWidth={2.7} />
          <span>{seekerProfile?.availability || t("availabilityNotAdded")}</span>
        </div>

        <div>
          <BadgeCheck size={16} strokeWidth={2.7} />
          <span>{seekerProfile?.skills || t("skillsNotAdded")}</span>
        </div>

        <div>
          <CalendarDays size={16} strokeWidth={2.7} />
          <span>
            {seekerProfile?.can_join_from
              ? `${t("canJoinFrom")} ${seekerProfile.can_join_from}`
              : t("joinDateNotAdded")}
          </span>
        </div>
      </div>

      {(!seekerProfile?.skills || !seekerProfile?.availability) && (
        <div className="profile-incomplete-note">
          {t("applicantProfileIncomplete")}
        </div>
      )}

      <div className="better-applicant-actions">
        {cleanPhone ? (
          <a href={`tel:${cleanPhone}`} className="btn btn-light">
            <Phone size={16} strokeWidth={2.7} />
            {t("call")}
          </a>
        ) : (
          <button type="button" className="btn btn-light" disabled>
            {t("noPhone")}
          </button>
        )}

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="btn whatsapp-share-btn"
          >
            <MessageCircle size={16} strokeWidth={2.7} />
            WhatsApp
          </a>
        ) : (
          <button type="button" className="btn btn-light" disabled>
            WhatsApp
          </button>
        )}

        <button
          type="button"
          className="btn shortlist-btn"
          onClick={() => onStatusChange(application.id, "shortlisted")}
        >
          <CheckCircle2 size={16} strokeWidth={2.7} />
          {t("shortlist")}
        </button>

        <button
          type="button"
          className="btn reject-applicant-btn"
          onClick={() => onStatusChange(application.id, "rejected")}
        >
          <XCircle size={16} strokeWidth={2.7} />
          {t("reject")}
        </button>
      </div>
    </article>
  );
}

export default ApplicantCard;
