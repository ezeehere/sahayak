import { NavLink, useNavigate } from "react-router-dom";
import { Home, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import MobileBottomNav from "./MobileBottomNav";

function Navbar() {
  const { profile, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <>
      <nav className="navbar app-topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">
            <img src="/sahayak-icon.svg" alt="Sahayak Logo" />
          </span>

          <span className="brand-text">{t("appName")}</span>
        </NavLink>

        {/* Desktop navigation */}
        <div className="nav-links desktop-nav-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-pill active" : "nav-pill"
            }
          >
            <Home size={17} strokeWidth={2.7} />
            <span>{t("home")}</span>
          </NavLink>

          {profile && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-pill active" : "nav-pill"
              }
            >
              <LayoutDashboard size={17} strokeWidth={2.7} />
              <span>{t("dashboard")}</span>
            </NavLink>
          )}

          {!profile && (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "nav-pill active" : "nav-pill"
                }
              >
                <span>{t("login")}</span>
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? "nav-pill active" : "nav-pill"
                }
              >
                <span>{t("register")}</span>
              </NavLink>
            </>
          )}

          <LanguageToggle />

          {profile && (
            <button onClick={handleLogout} className="nav-pill logout-pill">
              <LogOut size={17} strokeWidth={2.7} />
              <span>{t("logout")}</span>
            </button>
          )}
        </div>

        {/* Mobile only utility actions */}
        <div className="mobile-nav-actions">
          <LanguageToggle compact />

          {profile && (
            <button
              type="button"
              onClick={handleLogout}
              className="mobile-logout-button"
              aria-label={t("logout")}
              title={t("logout")}
            >
              <LogOut size={20} strokeWidth={2.8} />
            </button>
          )}
        </div>
      </nav>

      <MobileBottomNav />
    </>
  );
}

export default Navbar;