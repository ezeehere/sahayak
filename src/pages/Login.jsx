import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";

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

  return (
    <main className="page-center">
      <div className="auth-card">
        <h1>{t("appName")}</h1>
        <p className="subtitle">{t("loginToYourAccount")}</p>

        {message && <div className="message">{message}</div>}

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