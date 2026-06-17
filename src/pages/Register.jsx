import { useState } from "react";
import { ArrowLeft, Building2, Eye, EyeOff, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.4 39.4 16.1 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function friendlyAuthError(errorMessage) {
  if (!errorMessage) return "Something went wrong. Please try again.";

  if (errorMessage.toLowerCase().includes("already registered")) {
    return "This email is already registered. Please login instead.";
  }

  if (errorMessage.toLowerCase().includes("password")) {
    return "Password should be at least 6 characters.";
  }

  return errorMessage;
}

function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("seeker");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "seeker",
  });

  const [message, setMessage] = useState("");

  function changeRole(role) {
    setSelectedRole(role);
    setForm({ ...form, role });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setMessage(t("creatingAccount"));

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          phone: form.phone,
          role: selectedRole,
        },
      },
    });

    if (error) {
      setMessage(friendlyAuthError(error.message));
      return;
    }

    setMessage(t("accountCreatedSuccess"));

    setTimeout(() => {
      navigate("/login");
    }, 900);
  }

  async function registerWithGoogle() {
    localStorage.setItem("sahayak_google_role", selectedRole);
    setMessage(t("redirectingToGoogle"));

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setMessage(friendlyAuthError(error.message));
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={18} strokeWidth={2.8} />
          <span>{t("backToHome")}</span>
        </Link>

        <div className="auth-card clean-auth-card register-auth-card">
          <div className="auth-head">
            <h1>{t("createAccount")}</h1>
            <p>{t("chooseRoleToContinue")}</p>
          </div>

          {message && <div className="message">{message}</div>}

          <div className="role-choice-grid">
            <button
              type="button"
              className={
                selectedRole === "seeker"
                  ? "role-choice-card active"
                  : "role-choice-card"
              }
              onClick={() => changeRole("seeker")}
            >
              <span className="role-choice-icon">
                <UserRound size={23} strokeWidth={2.7} />
              </span>

              <span>
                <strong>{t("jobSeeker")}</strong>
                <small>{t("jobSeekerRoleDesc")}</small>
              </span>
            </button>

            <button
              type="button"
              className={
                selectedRole === "owner"
                  ? "role-choice-card active"
                  : "role-choice-card"
              }
              onClick={() => changeRole("owner")}
            >
              <span className="role-choice-icon">
                <Building2 size={23} strokeWidth={2.7} />
              </span>

              <span>
                <strong>{t("shopOwner")}</strong>
                <small>{t("shopOwnerRoleDesc")}</small>
              </span>
            </button>
          </div>

          <button
            type="button"
            className="btn-google-auth"
            onClick={registerWithGoogle}
          >
            <span className="google-icon">
              <GoogleIcon />
            </span>
            <span>{t("continueWithGoogle")}</span>
          </button>

          <p className="auth-reassurance">
            {selectedRole === "owner"
              ? t("ownerSetupNote")
              : t("seekerSetupNote")}
          </p>

          <button
            type="button"
            className="email-toggle-button"
            onClick={() => setShowEmailForm(!showEmailForm)}
          >
            {showEmailForm ? t("hideEmailForm") : t("useEmailInstead")}
          </button>

          {showEmailForm && (
            <>
              <div className="auth-divider">
                <span>{t("orRegisterWithEmail")}</span>
              </div>

              <form className="auth-form" onSubmit={handleRegister}>
                <div className="field-group">
                  <label>{t("fullName")}</label>
                  <input
                    type="text"
                    value={form.name}
                    autoComplete="name"
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field-group">
                  <label>{t("email")}</label>
                  <input
                    type="email"
                    value={form.email}
                    autoComplete="email"
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field-group">
                  <label>{t("phone")}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    autoComplete="tel"
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field-group">
                  <label>{t("password")}</label>

                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      autoComplete="new-password"
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? t("hidePassword") : t("showPassword")
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} strokeWidth={2.6} />
                      ) : (
                        <Eye size={19} strokeWidth={2.6} />
                      )}
                    </button>
                  </div>
                </div>

                <button className="primary-btn auth-submit-btn" type="submit">
                  {t("createAccount")}
                </button>
              </form>
            </>
          )}

          <p className="form-bottom clean-form-bottom">
            {t("alreadyRegistered")} <Link to="/login">{t("login")}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;