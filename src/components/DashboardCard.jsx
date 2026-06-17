import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Sahayak
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {profile?.role === "seeker" && (
          <>
            <Link to="/seeker/dashboard">Dashboard</Link>
          </>
        )}

        {profile?.role === "owner" && (
          <>
            <Link to="/owner/dashboard">Dashboard</Link>
          </>
        )}

        {profile?.role === "admin" && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
          </>
        )}

        {profile ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;