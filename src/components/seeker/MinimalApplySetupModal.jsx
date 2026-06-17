import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { saveSeekerApplySetup } from "../../utils/seekerApplySetup";

export default function MinimalApplySetupModal({
  user,
  profile,
  onClose,
  onComplete,
}) {
  const { t } = useLanguage();

  const [form, setForm] = useState({
    fullName: profile?.name || "",
    phone: profile?.phone || "",
    area: profile?.area || "",
    shortIntro: profile?.short_intro || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError(t("nameRequiredError") || "Please enter your full name.");
      return;
    }

    if (!form.phone.trim()) {
      setError(t("phoneRequiredError") || "Please enter your phone number.");
      return;
    }

    if (!form.area.trim()) {
      setError(t("areaRequiredError") || "Please enter your area or locality.");
      return;
    }

    try {
      setSaving(true);
      const updatedProfile = await saveSeekerApplySetup(user.id, form);
      onComplete(updatedProfile);
    } catch (err) {
      console.error(err);
      setError(t("saveDetailsError") || "Could not save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="setup-modal-backdrop">
      <div className="setup-modal-card">
        <div className="setup-modal-head">
          <p className="tagline">
            {t("oneTimeSetup") || "One-time setup"}
          </p>
          <h2>
            {t("addBasicDetailsTitle") || "Add basic details to apply"}
          </h2>
          <p>
            {t("addBasicDetailsDesc") || "Shops need these details to contact you. You can update them later."}
          </p>
        </div>

        {error && (
          <div className="setup-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="setup-modal-form">
          <div className="field-group">
            <label>{t("fullName") || "Full name"}</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder={t("fullName") || "Your name"}
              required
            />
          </div>

          <div className="field-group">
            <label>{t("phone") || "Phone number"}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder={t("phone") || "Your phone number"}
              required
            />
          </div>

          <div className="field-group">
            <label>{t("areaLocality") || "Area / locality"}</label>
            <input
              type="text"
              value={form.area}
              onChange={(event) => updateField("area", event.target.value)}
              placeholder={t("areaLocalityPlaceholder") || "Example: Jorhat town, Gar Ali"}
              required
            />
          </div>

          <div className="field-group">
            <label>{t("shortIntroOptional") || "Short intro (optional)"}</label>
            <textarea
              value={form.shortIntro}
              onChange={(event) =>
                updateField("shortIntro", event.target.value)
              }
              placeholder={t("shortIntroPlaceholder") || "Example: I can work morning shifts and have shop experience."}
            />
          </div>

          <div className="setup-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-light"
            >
              {t("back") || "Cancel"}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? "..." : (t("continue") || "Continue")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
