import { Navigate, Route, Routes, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "./lib/supabase";
import { useAuth } from "./context/AuthContext";
import SeekerProfile from "./pages/seeker/SeekerProfile";
import ShopProfile from "./pages/owner/ShopProfile";
import PostJob from "./pages/owner/PostJob";
import MyJobs from "./pages/owner/MyJobs";
import BrowseJobs from "./pages/seeker/BrowseJobs";
import JobDetails from "./pages/seeker/JobDetails";
import SavedJobs from "./pages/seeker/SavedJobs";
import MyApplications from "./pages/seeker/MyApplications";
import Applicants from "./pages/owner/Applicants";
import AdminDashboardPage from "./pages/admin/AdminDashboard";
import ManageUsersPage from "./pages/admin/ManageUsers";
import ManageJobsPage from "./pages/admin/ManageJobs";
import CategoriesPage from "./pages/admin/Categories";
import OwnerDashboardPage from "./pages/owner/OwnerDashboard";
import SeekerDashboardPage from "./pages/seeker/SeekerDashboard";


function LoadingScreen({ text = "Loading..." }) {
  return (
    <main className="page-center">
      <div className="auth-card">
        <h1>Sahayak</h1>
        <p className="subtitle">{text}</p>
      </div>
    </main>
  );
}

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

        {profile && <Link to="/dashboard">Dashboard</Link>}

        {!profile && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {profile && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

function Home() {
  return (
    <>
      <Navbar />

      <main className="hero">
        <div className="hero-content">
          <p className="tagline">Local Job Finder System</p>

          <h1>
            Find local jobs near you with <span>Sahayak</span>
          </h1>

          <p className="hero-text">
            Sahayak connects job seekers with nearby shops and small businesses.
            Job seekers can find work, shop owners can post vacancies, and admin
            can manage the complete system.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>

            <Link to="/login" className="btn btn-light">
              Login
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <h3>Core Modules</h3>

          <div className="category-grid">
            <span>Job Seeker</span>
            <span>Shop Owner</span>
            <span>Admin</span>
            <span>Job Posts</span>
            <span>Applications</span>
            <span>Saved Jobs</span>
            <span>Verified Shops</span>
            <span>Supabase</span>
          </div>
        </div>
      </main>
    </>
  );
}

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("Logging in...");

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Login successful.");
    navigate("/dashboard");
  }

  return (
    <main className="page-center">
      <div className="auth-card">
        <h1>Sahayak</h1>
        <p className="subtitle">Login to your account</p>

        {message && <div className="message">{message}</div>}

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button className="primary-btn" type="submit">
            Login
          </button>
        </form>

        <p className="form-bottom">
          New user? <Link to="/register">Create account</Link>
        </p>
      </div>
    </main>
  );
}

function Register() {
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
    setMessage("Creating account...");

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

    setMessage("Account created successfully. Redirecting to login...");

    setTimeout(() => {
      navigate("/login");
    }, 800);
  }

  return (
    <main className="page-center">
      <div className="auth-card">
        <h1>Sahayak</h1>
        <p className="subtitle">Create your account</p>

        {message && <div className="message">{message}</div>}

        <form onSubmit={handleRegister}>
          <label>Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label>Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <label>Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="seeker">Job Seeker</option>
            <option value="owner">Shop Owner</option>
          </select>

          <button className="primary-btn" type="submit">
            Create Account
          </button>
        </form>

        <p className="form-bottom">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Checking your session..." />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function DashboardRedirect() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Preparing dashboard..." />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <LoadingScreen text="Loading profile data..." />;
  }

  if (profile.role === "seeker") {
    return <Navigate to="/seeker/dashboard" replace />; 
  }

  if (profile.role === "owner") {
    return <Navigate to="/owner/dashboard" replace />;
  }

  if (profile.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

function RoleRoute({ allowedRole, children }) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Checking your role..." />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <LoadingScreen text="Loading profile..." />;
  }

  if (profile.role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function DashboardCard({ title, text, link, button }) {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to={link} className="btn btn-light">
        {button}
      </Link>
    </div>
  );
}

function SeekerDashboard() {
  const { profile } = useAuth();

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">Job Seeker Panel</p>
          <h1>Welcome, {profile?.name}</h1>
          <p>Find jobs, save jobs, apply, and track your application status.</p>
        </div>

        <div className="dashboard-grid">
          <DashboardCard
            title="My Profile"
            text="Add your skills, experience, expected salary, and availability."
            link="/seeker/profile"
            button="Edit Profile"
          />

          <DashboardCard
            title="Browse Jobs"
            text="Search and apply for local jobs from nearby shops."
            link="/seeker/jobs"
            button="Browse Jobs"
          />

          <DashboardCard
            title="Saved Jobs"
            text="View jobs you saved for later."
            link="/seeker/saved"
            button="View Saved"
          />

          <DashboardCard
            title="My Applications"
            text="Track pending, shortlisted, rejected, and hired applications."
            link="/seeker/applications"
            button="View Applications"
          />
        </div>
      </main>
    </>
  );
}

function OwnerDashboard() {
  const { profile } = useAuth();

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">Shop Owner Panel</p>
          <h1>Welcome, {profile?.name}</h1>
          <p>Manage your shop, post jobs, and review applicants.</p>
        </div>

        <div className="dashboard-grid">
          <DashboardCard
            title="Shop Profile"
            text="Add your shop name, address, category, and timing."
            link="/owner/shop-profile"
            button="Manage Shop"
          />

          <DashboardCard
            title="Post Job"
            text="Post new local job vacancies for seekers."
            link="/owner/post-job"
            button="Post Job"
          />

          <DashboardCard
            title="My Jobs"
            text="View all jobs posted by your shop."
            link="/owner/jobs"
            button="View Jobs"
          />

          <DashboardCard
            title="Applicants"
            text="View applicants and update application status."
            link="/owner/applicants"
            button="View Applicants"
          />
        </div>
      </main>
    </>
  );
}

function AdminDashboard() {
  const { profile } = useAuth();

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">Admin Panel</p>
          <h1>Welcome, {profile?.name}</h1>
          <p>Monitor users, jobs, categories, and system activity.</p>
        </div>

        <div className="dashboard-grid">
          <DashboardCard
            title="Manage Users"
            text="View all job seekers, shop owners, and admins."
            link="/admin/users"
            button="View Users"
          />

          <DashboardCard
            title="Manage Jobs"
            text="Review job posts and update job status."
            link="/admin/jobs"
            button="View Jobs"
          />

          <DashboardCard
            title="Categories"
            text="Add and manage job categories."
            link="/admin/categories"
            button="Manage Categories"
          />
        </div>
      </main>
    </>
  );
}

function ComingSoon({ title }) {
  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">Sahayak Module</p>
          <h1>{title}</h1>
          <p>
            This route is ready. We will connect this page to Supabase in the
            next step.
          </p>
        </div>
      </main>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seeker/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="seeker">
              <SeekerDashboardPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seeker/profile"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="seeker">
                <SeekerProfile />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seeker/jobs"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="seeker">
              <BrowseJobs />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seeker/jobs/:id"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="seeker">
              <JobDetails />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seeker/saved"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="seeker">
              < SavedJobs />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seeker/applications"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="seeker">
              <MyApplications />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="owner">
              <OwnerDashboardPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/shop-profile"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="owner">
              <ShopProfile />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/post-job"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="owner">
              <PostJob />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/jobs"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="owner">
              <MyJobs />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/applicants"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="owner">
              <Applicants />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <AdminDashboardPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <ManageUsersPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <ManageJobsPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <CategoriesPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;