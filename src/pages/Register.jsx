import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";

function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "seeker",
  });

  const [message, setMessage] = useState("");

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
          role: form.role,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(t("accountCreatedSuccess"));
    setTimeout(() => {
      navigate("/login");
    }, 800);
  }
  async function registerWithGoogle(selectedRole) {
    localStorage.setItem("sahayak_google_role", selectedRole);

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
        <p className="subtitle">{t("createYourAccount")}</p>

        {message && <div className="message">{message}</div>}

        <form onSubmit={handleRegister}>
          <label>{t("fullName")}</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label>{t("email")}</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label>{t("phone")}</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />

          <label>{t("password")}</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <label>{t("role")}</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="seeker">{t("jobSeeker")}</option>
            <option value="owner">{t("shopOwner")}</option>
          </select>

          <button className="primary-btn" type="submit">
            {t("createAccount")}
          </button>
        </form>
        <div className="google-auth-box">
          <p>Or continue with Google</p>

          <button
            type="button"
            className="btn btn-google"
            onClick={() => registerWithGoogle("seeker")}
          >
            Google as Job Seeker
          </button>

          <button
            type="button"
            className="btn btn-google owner-google-btn"
            onClick={() => registerWithGoogle("owner")}
          >
            Google as Shop Owner
          </button>
        </div>

        <p className="form-bottom">
          {t("alreadyRegistered")} <Link to="/login">{t("login")}</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;