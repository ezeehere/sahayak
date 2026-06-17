import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        completeGoogleLogin();
    }, []);

    async function completeGoogleLogin() {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session?.user) {
            console.log(error);
            navigate("/login");
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
            navigate("/login");
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
                navigate("/login");
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

        if (finalRole === "owner") {
            navigate("/owner/dashboard");
        } else if (finalRole === "admin") {
            navigate("/admin/dashboard");
        } else {
            navigate("/seeker/dashboard");
        }
    }

    return (
        <main className="page-center">
            <div className="auth-card">
                <h1>Completing sign in...</h1>
                <p className="subtitle">Please wait while we prepare your account.</p>
            </div>
        </main>
    );
}

export default AuthCallback;