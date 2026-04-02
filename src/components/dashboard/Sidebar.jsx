import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  BarChart3,
  Users,
  Briefcase,
  FileText,
  Calendar,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  DollarSign,
  Target,
  Building,
  Shield,
  PieChart,
  TrendingUp,
  CreditCard,
  Download,
  ShoppingBag,
  ClipboardCheck,
  Package,
  User2,
  Mail,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(true);
  const location = useLocation();
  const { t } = useLanguage();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const navItems = [
    {
      path: "/dashboard/main",
      icon: Home,
      label: "Tableau de bord",
      badge: null,
    },
    {
      path: "/dashboard/users",
      icon: Users,
      label: "Utilisateurs",
      badge: null,
    },
    {
      path: "/dashboard/offres",
      icon: Briefcase,
      label: "Offres d'emplois",
      badge: null,
    },
    {
      path: "/dashboard/candidatures",
      icon: ClipboardCheck,
      label: "Candidatures",
      badge: "8",
    },
    {
      path: "/dashboard/orders",
      icon: ShoppingBag,
      label: "Commandes",
      badge: "5",
    },
    {
      path: "/dashboard/articles",
      icon: Package,
      label: "Produits/Prestations",
      badge: null,
    },
    { path: "/dashboard/clients", icon: User2, label: "Clients", badge: "3" },
    { path: "/dashboard/mails", icon: Mail, label: "Mails", badge: null },
    {
      path: "/dashboard/factures",
      icon: CreditCard,
      label: "Factures",
      badge: "5",
    },
    { path: "/dashboard/devis", icon: FileText, label: "Devis", badge: null },
    { path: "/dashboard/avoirs", icon: Receipt, label: "Avoirs", badge: null },
  ];

  const secondaryItems = [
    { path: "/dashboard/settings", icon: Settings, label: "Paramètres" },
    { path: "/dashboard/help", icon: HelpCircle, label: "Aide & Support" },
  ];

  const SidebarContent = () => (
    <>
      {/* En-tête utilisateur */}
      <div
        className={`flex ${isCollapsed ? "justify-center" : "items-center gap-3"} p-4`}
      >
        <Avatar className={`${isCollapsed ? "w-8 h-8" : "w-10 h-10"}`}>
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>

        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">Admin Dashboard</p>
            <p className="text-xs truncate text-muted-foreground">
              Administrateur
            </p>
          </div>
        )}

        {!isCollapsed && (
          <Badge variant="outline" className="text-xs">
            Admin
          </Badge>
        )}
      </div>

      <Separator />

      {/* Navigation principale */}
      <nav className="flex-1 p-4 overflow-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? "justify-center" : "justify-between"} gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`
                  }
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${isCollapsed ? "" : "shrink-0"}`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <Separator className="my-4" />

        {/* Navigation secondaire */}
        <ul className="space-y-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`
                  }
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Bouton mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed z-50 top-4 left-4 md:hidden"
        onClick={toggleMobileSidebar}
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar desktop */}
      <aside
        className={`
        hidden md:flex flex-col h-screen bg-background border-r
        sticky left-0 top-0 z-40
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-16" : "w-64"}
      `}
      >
        {/* Bouton de réduction */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute z-50 border rounded-full shadow-md -right-3 top-6 bg-background"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>

        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      <aside
        className={`
        md:hidden flex flex-col bg-background border-r
        fixed left-0 top-16 z-50 bottom-0
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        w-64
      `}
      >
        {/* Bouton de fermeture mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 z-50 border rounded-full shadow-md translate-x-2/3 top-6 bg-background"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>

        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
