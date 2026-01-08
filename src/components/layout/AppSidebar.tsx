import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Vacantes",
    href: "/vacancies",
    icon: Briefcase,
    roles: ["ADMIN", "GESTOR", "CODER"],
  },
  {
    title: "Mis Postulaciones",
    href: "/my-applications",
    icon: FileText,
    roles: ["CODER"],
  },
  {
    title: "Crear Vacante",
    href: "/vacancies/new",
    icon: PlusCircle,
    roles: ["ADMIN", "GESTOR"],
  },
  {
    title: "Administración",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["ADMIN", "GESTOR"],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "badge-destructive";
      case "GESTOR":
        return "badge-warning";
      case "CODER":
        return "badge-primary";
      default:
        return "badge-primary";
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <h1 className="text-lg font-semibold text-foreground">
            <span className="text-gradient">Vacantes</span>
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
              )}
            >
              <item.icon size={20} className={isActive ? "text-primary" : ""} />
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-4">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center"
          )}
        >
          <Link to="/profile" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
              <User size={20} />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 text-xs rounded-full mt-1",
                    user && getRoleBadgeClass(user.role)
                  )}
                >
                  {user?.role}
                </span>
              </div>
            )}
          </Link>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full mt-3 text-sidebar-foreground hover:text-destructive",
            collapsed && "px-0"
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span className="ml-2">Cerrar Sesión</span>}
        </Button>
      </div>
    </aside>
  );
}
