import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadSession() {
    const { data } = await supabase.auth.getSession();

    setSession(data.session);
    setUser(data.session?.user || null);

    if (data.session?.user) {
      await fetchProfile(data.session.user.id);
    }

    setLoading(false);
  }

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.log(error);
      setProfile(null);
      return;
    }

    setProfile(data);
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}