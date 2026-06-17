import { NavLink } from "react-router-dom";
import {
  Home,
  BriefcaseBusiness,
  Bookmark,
  FileText,
  PlusCircle,
  Users,
  UserRound,
  Tags,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function MobileBottomNav() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  if (!profile) return null;

  let links = [];

  if (profile.role === "seeker") {
    links = [
      {
        to: "/seeker/dashboard",
        label: t("home"),
        icon: Home,
      },
      {
        to: "/browse-jobs",
        label: t("browseJobs"),
        icon: BriefcaseBusiness,
      },
      {
        to: "/seeker/saved",
        label: t("savedJobs"),
        icon: Bookmark,
      },
      {
        to: "/seeker/applications",
        label: t("myApplications"),
        icon: FileText,
      },
    ];
  }

  if (profile.role === "owner") {
    links = [
      {
        to: "/owner/dashboard",
        label: t("home"),
        icon: Home,
      },
      {
        to: "/owner/post-job",
        label: t("postJob"),
        icon: PlusCircle,
      },
      {
        to: "/owner/jobs",
        label: t("myJobs"),
        icon: BriefcaseBusiness,
      },
      {
        to: "/owner/applicants",
        label: t("applicants"),
        icon: Users,
      },
    ];
  }

  if (profile.role === "admin") {
    links = [
      {
        to: "/admin/dashboard",
        label: t("home"),
        icon: Home,
      },
      {
        to: "/admin/users",
        label: t("manageUsers"),
        icon: UserRound,
      },
      {
        to: "/admin/jobs",
        label: t("manageJobs"),
        icon: BriefcaseBusiness,
      },
      {
        to: "/admin/categories",
        label: t("categories"),
        icon: Tags,
      },
    ];
  }

  return (
    <div className="mobile-bottom-nav">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "mobile-nav-item active" : "mobile-nav-item"
            }
          >
            <Icon size={20} strokeWidth={2.6} />
            <small>{link.label}</small>
          </NavLink>
        );
      })}
    </div>
  );
}

export default MobileBottomNav;