import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";

function UpdatePassword() {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");

    async function handleUpdatePassword(e) {
        e.preventDefault();

        if (password.length < 6) {
            setMessage(t("passwordTooShort"));
            return;
        }

        setMessage(t("updatingPassword"));

        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage(t("passwordUpdatedSuccess"));

        setTimeout(() => {
            navigate("/login");
        }, 900);
    }

    return (
        <main className="auth-page">
            <section className="auth-shell">
                <div className="auth-card clean-auth-card">
                    <div className="auth-head">
                        <h1>{t("createNewPassword")}</h1>
                        <p>{t("createNewPasswordDesc")}</p>
                    </div>

                    {message && <div className="message">{message}</div>}

                    <form className="auth-form" onSubmit={handleUpdatePassword}>
                        <div className="field-group">
                            <label>{t("newPassword")}</label>

                            <div className="password-field">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    autoComplete="new-password"
                                    onChange={(e) => setPassword(e.target.value)}
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
                            {t("updatePassword")}
                        </button>
                    </form>

                    <p className="form-bottom clean-form-bottom">
                        <Link to="/login">{t("backToLogin")}</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default UpdatePassword;