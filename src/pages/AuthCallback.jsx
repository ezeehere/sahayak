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

        const { data: existingProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (!existingProfile) {
            await supabase.from("profiles").insert({
                id: user.id,
                name,
                email: user.email,
                phone: "",
                role: selectedRole,
            });
        } else if (!existingProfile.role || existingProfile.role === "seeker") {
            await supabase
                .from("profiles")
                .update({
                    name: existingProfile.name || name,
                    email: existingProfile.email || user.email,
                    role: selectedRole,
                })
                .eq("id", user.id);
        }

        localStorage.removeItem("sahayak_google_role");

        if (selectedRole === "owner") {
            navigate("/owner/dashboard");
        } else if (selectedRole === "admin") {
            navigate("/admin/dashboard");
        } else {
            navigate("/seeker/dashboard");
        }
    }

    return (
        <main className="dashboard-section">
            <div className="dashboard-header">
                <p className="tagline">Google Login</p>
                <h1>Completing sign in...</h1>
                <p>Please wait while we prepare your Sahayak account.</p>
            </div>
        </main>
    );
}

export default AuthCallback;