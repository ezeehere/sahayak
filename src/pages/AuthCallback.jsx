import { useEffect } from "react";
import { supabase } from "../lib/supabase";

function AuthCallback() {
    useEffect(() => {
        completeGoogleLogin();
    }, []);

    async function completeGoogleLogin() {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session?.user) {
            console.log(error);
            window.location.replace("/login");
            return;
        }

        const user = data.session.user;

        const selectedRole =
            localStorage.getItem("sahayak_google_role") || "seeker";

        const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Sahayak User";

        const { data: existingProfile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
            console.log(profileError);
            window.location.replace("/login");
            return;
        }

        let finalRole = selectedRole;

        if (!existingProfile) {
            const { error: insertError } = await supabase.from("profiles").insert({
                id: user.id,
                name,
                email: user.email,
                phone: "",
                role: selectedRole,
            });

            if (insertError) {
                console.log(insertError);
                window.location.replace("/login");
                return;
            }
        } else {
            finalRole = existingProfile.role;

            await supabase
                .from("profiles")
                .update({
                    name: existingProfile.name || name,
                    email: existingProfile.email || user.email,
                })
                .eq("id", user.id);
        }

        localStorage.removeItem("sahayak_google_role");

        window.location.replace("/smart-entry");
    }

    return (
        <main className="auth-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <div className="auth-card clean-auth-card" style={{ maxWidth: "420px", width: "100%", textAlign: "center", padding: "40px" }}>
                <div className="auth-head" style={{ marginBottom: "0" }}>
                    <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Completing sign in...</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0" }}>
                        Please wait while we prepare your account.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default AuthCallback;