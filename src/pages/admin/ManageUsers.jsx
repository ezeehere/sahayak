import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";

function ManageUsers() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setUsers(data || []);
    setLoading(false);
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        user.name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText) ||
        user.phone?.toLowerCase().includes(searchText);

      const matchesRole = roleFilter ? user.role === roleFilter : true;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  async function updateRole(userId, newRole) {
    setMessage(t("updatingUserRole"));

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.log(error);
      setMessage(error.message);
      return;
    }

    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    setMessage(t("userRoleUpdatedSuccess"));
  }

  function formatDate(dateValue) {
    if (!dateValue) return t("notAvailable");

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard-section">
          <div className="dashboard-header">
            <p className="tagline">{t("adminPanel")}</p>
            <h1>{t("loadingUsers")}</h1>
            <p>{t("fetchingUsers")}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-section">
        <div className="dashboard-header">
          <p className="tagline">{t("adminPanel")}</p>
          <h1>{t("manageUsers")}</h1>
          <p>{t("manageUsersPageDesc")}</p>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="filter-box">
          <input
            type="text"
            placeholder={t("searchUserPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">{t("allRoles")}</option>
            <option value="seeker">{t("jobSeeker")}</option>
            <option value="owner">{t("shopOwner")}</option>
            <option value="admin">{t("admin")}</option>
          </select>

          <button
            className="btn btn-light"
            onClick={() => {
              setSearch("");
              setRoleFilter("");
            }}
          >
            {t("reset")}
          </button>
        </div>

        <div className="admin-panel-card">
          <div className="section-title-row">
            <div>
              <p className="tagline">{t("users")}</p>
              <h2>{filteredUsers.length} {t("usersFound")}</h2>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-box">
              <h3>{t("noUsersFound")}</h3>
              <p>{t("changeUserFilterMsg")}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t("user")}</th>
                    <th>{t("phone")}</th>
                    <th>{t("role")}</th>
                    <th>{t("joined")}</th>
                    <th>{t("changeRole")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </td>

                      <td>{user.phone || t("notAdded")}</td>

                      <td>
                        <span className={`status-badge role-${user.role}`}>
                          {t(user.role) || user.role}
                        </span>
                      </td>

                      <td>{formatDate(user.created_at)}</td>

                      <td>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateRole(user.id, e.target.value)
                          }
                        >
                          <option value="seeker">{t("jobSeeker")}</option>
                          <option value="owner">{t("shopOwner")}</option>
                          <option value="admin">{t("admin")}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default ManageUsers;