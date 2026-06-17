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
import Home from "./pages/Home";
import AuthCallback from "./pages/AuthCallback";
import Login from "./pages/Login";
import Register from "./pages/Register";




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
      <Route path="/auth/callback" element={<AuthCallback />} />
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