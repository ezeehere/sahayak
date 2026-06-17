import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

  if (errorMessage.toLowerCase().includes("invalid login")) {
    return "Email or password is incorrect. Please try again.";
  }

  if (errorMessage.toLowerCase().includes("email not confirmed")) {
    return "Please confirm your email before logging in.";
  }

  return errorMessage;
}

function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get("redirect");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMessage(t("loggingIn"));

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setMessage(friendlyAuthError(error.message));
      return;
    }

    setMessage(t("loginSuccessful"));
    navigate(redirectPath || "/dashboard");
  }

  async function loginWithGoogle() {
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

        <div className="auth-card clean-auth-card">
          <div className="auth-head">
            <h1>{t("welcomeBack")}</h1>
            <p>{t("loginToContinue")}</p>
          </div>

          {message && <div className="message">{message}</div>}

          <button
            type="button"
            className="btn-google-auth"
            onClick={loginWithGoogle}
          >
            <span className="google-icon">
              <GoogleIcon />
            </span>
            <span>{t("continueWithGoogle")}</span>
          </button>

          <p className="auth-reassurance">{t("googlePrivacyNote")}</p>

          <div className="auth-divider">
            <span>{t("orLoginWithEmail")}</span>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="field-group">
              <label>{t("email")}</label>
              <input
                type="email"
                value={form.email}
                autoComplete="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label>{t("password")}</label>
                <Link to="/forgot-password" className="forgot-link">
                  {t("forgotPassword")}
                </Link>
              </div>

              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  autoComplete="current-password"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
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
              {t("login")}
            </button>
          </form>

          <p className="form-bottom clean-form-bottom">
            {t("newToSahayak")}{" "}
            <Link to="/register">{t("createAccount")}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;