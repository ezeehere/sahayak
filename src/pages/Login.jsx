import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";

function GoogleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
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

function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMessage(t("loggingIn"));

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(t("loginSuccessful"));
    navigate("/dashboard");
  }


  async function loginWithGoogle() {
    setMessage("Redirecting to Google...");

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.log(error);
      setMessage(error.message);
    }
  }

  return (
    <main className="page-center">
      <div className="auth-card">
        <h1>{t("appName")}</h1>
        <p className="subtitle">{t("loginToYourAccount")}</p>

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
        <div className="auth-divider">
          <span>or login with email</span>
        </div>

        <form onSubmit={handleLogin}>
          <label>{t("email")}</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label>{t("password")}</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button className="primary-btn" type="submit">
            {t("login")}
          </button>
        </form>

        <p className="form-bottom">
          {t("newUser")} <Link to="/register">{t("createAccount")}</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;