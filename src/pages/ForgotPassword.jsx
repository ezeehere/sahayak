import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";

function ForgotPassword() {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    async function handleReset(e) {
        e.preventDefault();
        setMessage(t("sendingResetLink"));

        const redirectTo = `${window.location.origin}/update-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage(t("resetLinkSent"));
    }

    return (
        <main className="auth-page">
            <section className="auth-shell">
                <Link to="/login" className="auth-back-link">
                    <ArrowLeft size={18} strokeWidth={2.8} />
                    <span>{t("backToLogin")}</span>
                </Link>

                <div className="auth-card clean-auth-card">
                    <div className="auth-head">
                        <h1>{t("resetPassword")}</h1>
                        <p>{t("resetPasswordDesc")}</p>
                    </div>

                    {message && <div className="message">{message}</div>}

                    <form className="auth-form" onSubmit={handleReset}>
                        <div className="field-group">
                            <label>{t("email")}</label>
                            <input
                                type="email"
                                value={email}
                                autoComplete="email"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button className="primary-btn auth-submit-btn" type="submit">
                            {t("sendResetLink")}
                        </button>
                    </form>

                    <p className="form-bottom clean-form-bottom">
                        {t("rememberPassword")} <Link to="/login">{t("login")}</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default ForgotPassword;