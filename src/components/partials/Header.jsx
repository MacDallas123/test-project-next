/**
 * Header.jsx — Zéro Tailwind, Zéro shadcn
 * Tous les styles sont des objets JS inline.
 * Seules dépendances : react, react-router-dom, framer-motion, lucide-react
 * + tes propres composants : LanguageSelector, CurrencySelector, SiteTitleForm1, useAuth, useLanguage
 */

import {
  ChevronDown, Home, LayoutDashboard, LogIn, LogOut,
  Menu, Search, ServerIcon, ShoppingCart, User, UserPlus, X,
  FileText, Receipt, CreditCard, Briefcase, UserCheck, Utensils, Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/assets/logo_fibem3.jpg";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "@/components/custom/languageSelector";
import CurrencySelector from "@/components/custom/CurrencySelector";
import SiteTileForm1 from "@/components/custom/SiteTitleForm1";
import { useAuth } from "@/hooks/useAuth";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — modifie ici pour changer les couleurs globalement
// ─────────────────────────────────────────────────────────────────────────────
const TOKEN = {
  primary: "#1a6fc4",
  primaryDark: "#155da0",
  accent: "#e8380d",
  accentHover: "#c42d08",
  white: "#ffffff",
  whiteAlpha20: "rgba(255,255,255,0.20)",
  whiteAlpha10: "rgba(255,255,255,0.10)",
  orange300: "#fdba74",
  textMuted: "rgba(255,255,255,0.55)",
  bgDropdown: "#ffffff",
  textDark: "#1e293b",
  textMutedDark: "#64748b",
  red600: "#dc2626",
  red50: "#fef2f2",
  hoverRow: "#f1f5f9",
  megaBg: "#1a6fc4",
  iconBg: "rgba(255,255,255,0.15)",
  iconBgActive: "#fee2e2",
  badgeBg: "#f59e0b",
  badgeText: "#ffffff",
  divider: "rgba(255,255,255,0.15)",
  mobileMenuBg: "#155da0",
  searchBg: "#ffffff",
  searchRadius: "9999px",
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles partagés (objets statiques — aucune purge possible)
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  header: {
    position: "sticky",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1500,
    backgroundColor: TOKEN.primary,
    boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
  },
  inner: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "6px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    flexShrink: 0,
  },
  logoImg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    objectFit: "contain",
  },
  searchWrap: {
    position: "relative",
    flex: 1,
    maxWidth: 380,
  },
  searchInput: {
    width: "100%",
    padding: "8px 48px 8px 36px",
    borderRadius: "9999px",
    border: "none",
    outline: "none",
    fontSize: 13,
    backgroundColor: TOKEN.searchBg,
    color: TOKEN.textDark,
    boxSizing: "border-box",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  searchBtn: {
    position: "absolute",
    right: 4,
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: TOKEN.accent,
    color: TOKEN.white,
    border: "none",
    borderRadius: "9999px",
    padding: "4px 12px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    lineHeight: 1.6,
  },
  desktopNav: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  navBtn: (isActive) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 8px",
    fontSize: 13,
    fontWeight: 500,
    color: isActive ? TOKEN.accent : TOKEN.white,
    background: "none",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "color 0.15s, background 0.15s",
  }),
  activeBar: {
    position: "absolute",
    bottom: 0,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: TOKEN.accent,
    borderRadius: 2,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: TOKEN.divider,
    margin: "0 4px",
    flexShrink: 0,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    backgroundColor: TOKEN.accent,
    color: TOKEN.white,
    fontWeight: 700,
    fontSize: 13,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 6px)",
    zIndex: 9999,
    width: 224,
    backgroundColor: TOKEN.bgDropdown,
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: "10px 14px",
    borderBottom: "1px solid #e2e8f0",
  },
  dropdownName: {
    fontSize: 13,
    fontWeight: 600,
    color: TOKEN.textDark,
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dropdownRole: {
    fontSize: 11,
    color: TOKEN.textMutedDark,
    margin: "2px 0 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dropdownItem: (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    fontSize: 13,
    color: isActive ? TOKEN.red600 : TOKEN.textDark,
    backgroundColor: isActive ? TOKEN.red50 : "transparent",
    textDecoration: "none",
    fontWeight: isActive ? 600 : 400,
    cursor: "pointer",
    transition: "background 0.12s",
  }),
  dropdownLogout: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: "8px 14px",
    fontSize: 13,
    color: TOKEN.accent,
    background: "none",
    border: "none",
    borderTop: "1px solid #e2e8f0",
    cursor: "pointer",
    fontWeight: 500,
    marginTop: 2,
    transition: "background 0.12s",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 18,
    height: 18,
    padding: "0 5px",
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 9999,
    backgroundColor: TOKEN.badgeBg,
    color: TOKEN.badgeText,
    marginLeft: "auto",
    flexShrink: 0,
  },
  authLogin: {
    padding: "5px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: TOKEN.white,
    backgroundColor: TOKEN.accent,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 0.15s",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
  },
  authRegister: {
    padding: "5px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: TOKEN.white,
    backgroundColor: "transparent",
    border: `1px solid ${TOKEN.whiteAlpha20}`,
    borderRadius: 6,
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 0.15s, border-color 0.15s",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
  },
  mobileControls: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "none",
    border: "none",
    color: TOKEN.white,
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.12s",
  },
  mobileMenu: {
    backgroundColor: TOKEN.mobileMenuBg,
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    overflowY: "auto",
    maxHeight: "80vh",
  },
  mobileUserBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderBottom: `1px solid ${TOKEN.divider}`,
  },
  mobileAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    backgroundColor: TOKEN.accent,
    color: TOKEN.white,
    fontWeight: 700,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  mobileUserName: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    color: TOKEN.white,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  mobileUserEmail: {
    margin: "2px 0 0",
    fontSize: 11,
    color: TOKEN.textMuted,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  mobileNavList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "10px 10px",
  },
  mobileNavItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    fontSize: 13,
    fontWeight: 500,
    color: TOKEN.orange300,
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 0.12s",
    width: "100%",
    textAlign: "left",
  },
  mobileDivider: {
    height: 1,
    backgroundColor: TOKEN.divider,
    margin: "6px 10px",
  },
  mobileLogout: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "calc(100% - 20px)",
    margin: "8px 10px 10px",
    padding: "9px 14px",
    fontSize: 13,
    fontWeight: 600,
    color: TOKEN.white,
    backgroundColor: TOKEN.accent,
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  mobileAuthRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "6px 10px 12px",
  },
  mobileAuthBtn: (isLogin) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 14px",
    fontSize: 13,
    fontWeight: 500,
    color: TOKEN.orange300,
    backgroundColor: isLogin ? "rgba(255,255,255,0.08)" : "transparent",
    border: `1px solid ${TOKEN.divider}`,
    borderRadius: 7,
    textDecoration: "none",
    transition: "background 0.12s",
  }),
  megaPanel: {
    position: "fixed",
    left: 0,
    right: 0,
    zIndex: 1400,
    backgroundColor: TOKEN.megaBg,
    borderTop: `1px solid ${TOKEN.divider}`,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
  megaInner: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "20px 24px",
  },
  megaTitle: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 14,
  },
  megaGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  megaItem: (isActive) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "12px 10px",
    borderRadius: 12,
    textDecoration: "none",
    minWidth: 90,
    backgroundColor: isActive ? "rgba(255,255,255,0.18)" : "transparent",
    border: isActive ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
    transition: "background 0.15s, border-color 0.15s",
    cursor: "pointer",
  }),
  megaIconWrap: (isActive) => ({
    width: 52,
    height: 52,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isActive ? TOKEN.iconBgActive : TOKEN.iconBg,
    transition: "background 0.15s",
  }),
  megaLabel: (isActive) => ({
    fontSize: 11,
    fontWeight: 500,
    color: isActive ? TOKEN.accent : TOKEN.white,
    textAlign: "center",
    lineHeight: 1.3,
  }),
  collapseBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    fontSize: 13,
    fontWeight: 500,
    color: TOKEN.orange300,
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "background 0.12s",
  },
  subItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px 8px 30px",
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    textDecoration: "none",
    borderRadius: 6,
    transition: "background 0.12s, color 0.12s",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CollapsibleMenuItem — inline, sans shadcn, sans Tailwind
// ─────────────────────────────────────────────────────────────────────────────
const CollapsibleMenuItem = ({ label, icon, children = [], closeMobileMenu }) => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...S.collapseBtn,
          backgroundColor: hovered ? TOKEN.whiteAlpha10 : "transparent",
        }}
      >
        <span style={{ color: TOKEN.accent, display: "flex", alignItems: "center", flexShrink: 0 }}>
          {icon}
        </span>
        <span style={{ flex: 1 }}>{label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <ChevronDown size={15} color="rgba(255,255,255,0.5)" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="sub"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {children.map((sub, i) => {
              const SubIcon = sub.icon;
              return (
                <Link
                  key={sub.href || i}
                  to={sub.href}
                  onClick={closeMobileMenu}
                  style={S.subItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = TOKEN.whiteAlpha10;
                    e.currentTarget.style.color = TOKEN.white;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                  }}
                >
                  <span style={{ width: 1, height: 20, backgroundColor: TOKEN.divider, marginRight: 4, flexShrink: 0 }} />
                  {SubIcon && <SubIcon size={14} color={TOKEN.accent} style={{ flexShrink: 0 }} />}
                  <span>{sub.label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MegaMenuItem
// ─────────────────────────────────────────────────────────────────────────────
const MegaMenuItem = ({ sub, isActive, onClose }) => {
  const [hovered, setHovered] = useState(false);
  const active = isActive || hovered;
  const Icon = sub.icon;

  return (
    <Link
      to={sub.href}
      onClick={onClose}
      style={S.megaItem(active)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={S.megaIconWrap(active)}>
        {sub.image
          ? <img src={sub.image} alt={sub.label} style={{ width: 28, height: 28, objectFit: "contain" }} />
          : <Icon size={22} color={active ? TOKEN.accent : TOKEN.white} />
        }
      </div>
      <span style={S.megaLabel(active)}>{sub.label}</span>
      {active && <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: TOKEN.accent }} />}
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MegaMenuPanel
// ─────────────────────────────────────────────────────────────────────────────
const MegaMenuPanel = ({ item, activeIdx, onClose, onMouseEnter, onMouseLeave }) => (
  <AnimatePresence>
    {activeIdx !== null && (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{ ...S.megaPanel, top: "var(--header-height, 58px)" }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div style={S.megaInner}>
          <p style={S.megaTitle}>{item.label}</p>
          <div style={S.megaGrid}>
            {item.subMenus.map((sub, i) => (
              <MegaMenuItem key={sub.href || i} sub={sub} isActive={false} onClose={onClose} />
            ))}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─────────────────────────────────────────────────────────────────────────────
// DesktopNavItem
// ─────────────────────────────────────────────────────────────────────────────
const DesktopNavItem = ({ item, idx, isActive, hoveredMenu, onEnter, onLeave }) => {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);
  const style = {
    ...S.navBtn(isActive),
    backgroundColor: hovered ? TOKEN.whiteAlpha10 : "transparent",
  };

  if (!item.subMenus) {
    return (
      <Link
        to={item.href}
        style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Icon size={15} />
        {item.label}
        {isActive && <span style={S.activeBar} />}
      </Link>
    );
  }

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => { setHovered(true); onEnter(idx); }}
      onMouseLeave={() => { setHovered(false); onLeave(); }}
    >
      <button style={style}>
        <Icon size={15} />
        {item.label}
        <motion.span
          animate={{ rotate: hoveredMenu === idx ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: "flex", alignItems: "center" }}
        >
          <ChevronDown size={13} />
        </motion.span>
        {isActive && <span style={S.activeBar} />}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MobileMenuList
// ─────────────────────────────────────────────────────────────────────────────
const MobileMenuList = ({ items, closeMobileMenu }) =>
  items.map((item, index) => {
    const Icon = item.icon;
    if (item.subMenus) {
      return (
        <CollapsibleMenuItem
          key={index}
          label={item.label}
          icon={<Icon size={15} />}
          children={item.subMenus}
          closeMobileMenu={closeMobileMenu}
        />
      );
    }
    return (
      <Link key={index} to={item.href} onClick={closeMobileMenu} style={S.mobileNavItem}>
        <Icon size={15} color={TOKEN.accent} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.badge != null && <span style={S.chip}>{item.badge}</span>}
      </Link>
    );
  });

// ─────────────────────────────────────────────────────────────────────────────
// Header principal
// ─────────────────────────────────────────────────────────────────────────────
const Header = ({ authPage = false, dasboardPage = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const hoverTimeoutRef = useRef(null);
  const headerRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1280);

  const location = useLocation();
  const { t } = useLanguage();
  const { isLoggedIn, user, logout } = useAuth();

  const userInitials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  // ── Menu data ──────────────────────────────────────────────────────────────
  const mainMenus = [
    {
      icon: Home,
      label: t("mainMenu.home.label", "Accueil"),
      href: "/",
      subMenus: [
        { label: t("mainMenu.home.about", "À propos"), href: "/#about", icon: Star },
        { label: t("mainMenu.home.us", "Qui sommes-nous ?"), href: "/#us", icon: User },
        { label: t("mainMenu.home.blog", "Blog"), href: "/#blog", icon: FileText },
      ],
    },
    {
      icon: ServerIcon,
      label: t("mainMenu.service.label", "Services"),
      subMenus: [
        { label: t("mainMenu.service.prestation", "Rechercher un repas"), href: "/services", icon: Utensils },
        { label: t("mainMenu.service.formulaireCV", "Formulaire CV FIBEM"), href: "/cv", icon: FileText },
        { label: t("mainMenu.service.formulaireDevis", "Devis"), href: "/devis", icon: Receipt },
        { label: t("mainMenu.service.formulaireFacture", "Facture"), href: "/facture", icon: FileText },
        { label: t("mainMenu.service.formulaireAvoirs", "Avoirs"), href: "/avoirs", icon: CreditCard },
        { label: t("mainMenu.emploi.espaceAbonnement", "Espace abonnement"), href: "/abonnements", icon: Star },
      ],
    },
    {
      icon: LayoutDashboard,
      label: t("mainMenu.emploi.label", "Emploi"),
      subMenus: [
        { label: t("mainMenu.emploi.espaceCandidat", "Espace candidat"), href: "/emploi", icon: UserCheck },
        { label: t("mainMenu.emploi.espaceRecruteur", "Espace recruteur"), href: "/dashboard/offres", icon: Briefcase },
      ],
    },
    { icon: User, label: "Contact", href: "/contact" },
  ];

  const authMenus = [
    { icon: LogIn, label: t("authMenu.login", "Connexion"), href: "/auth/login" },
    { icon: UserPlus, label: t("authMenu.register", "Inscription"), href: "/auth/register" },
  ];

  const userMenuItems = [
    { icon: ShoppingCart, label: t("userMenu.shoppingCart", "Panier"), href: "/cart", badge: 4 },
    { icon: LayoutDashboard, label: t("userMenu.dashboard", "Tableau de bord"), href: "/dashboard" },
    { icon: User, label: t("userMenu.profile", "Profil"), href: "/profile" },
  ];

  // ── Active route helpers ───────────────────────────────────────────────────
  const isMenuActive = (menuItem) => {
    if (menuItem.href) {
      return location.pathname === menuItem.href || location.pathname.startsWith(menuItem.href + "/");
    }
    return menuItem.subMenus?.some((sub) => {
      if (sub.href === "/" && location.pathname === "/") return true;
      if (sub.href?.includes("#")) {
        const [p, h] = sub.href.split("#");
        return location.pathname === (p || "/") && location.hash.replace("#", "") === h;
      }
      return location.pathname === sub.href || location.pathname.startsWith((sub.href || "") + "/");
    }) ?? false;
  };

  // ── Hover management ──────────────────────────────────────────────────────
  const handleMouseEnter = (idx) => {
    clearTimeout(hoverTimeoutRef.current);
    setHoveredMenu(idx);
  };
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredMenu(null), 150);
  };

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty("--header-height", `${headerRef.current.offsetHeight}px`);
      }
      setIsDesktop(window.innerWidth >= 1280);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleMobileMenu = () => { setIsMobileSearchOpen(false); setIsMobileMenuOpen((v) => !v); };
  const toggleMobileSearch = () => { setIsMobileMenuOpen(false); setIsMobileSearchOpen((v) => !v); };
  const closeMobileMenu = () => { setIsMobileMenuOpen(false); setIsMobileSearchOpen(false); };
  const handleLogout = async () => { await logout(); window.location.reload(); };

  const activeMegaMenu = hoveredMenu !== null ? mainMenus[hoveredMenu] : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={S.header}
      >
        <div style={S.inner}>

          {/* Logo */}
          <Link to="/" style={S.logoWrap} onClick={closeMobileMenu}>
            <img src={Logo} alt="FIBEM" style={S.logoImg} />
            <SiteTileForm1 />
          </Link>

          {/* Recherche desktop */}
          {isDesktop && (
            <div style={S.searchWrap}>
              <div style={S.searchIcon}><Search size={15} /></div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t("search_placeholder", "Rechercher")}
                style={S.searchInput}
              />
              <button type="button" style={S.searchBtn}>OK</button>
            </div>
          )}

          {/* Navigation desktop */}
          {isDesktop ? (
            <div style={S.desktopNav}>
              <LanguageSelector />

              {mainMenus.map((item, idx) => (
                <DesktopNavItem
                  key={item.href || idx}
                  item={item}
                  idx={idx}
                  isActive={isMenuActive(item)}
                  hoveredMenu={hoveredMenu}
                  onEnter={handleMouseEnter}
                  onLeave={handleMouseLeave}
                />
              ))}

              <CurrencySelector />
              <div style={S.divider} />

              {isLoggedIn() ? (
                <div style={{ position: "relative" }}>
                  <button style={S.avatar} onClick={() => setUserMenuOpen((v) => !v)}>
                    {userInitials}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div
                          style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          style={S.dropdown}
                        >
                          <div style={S.dropdownHeader}>
                            <p style={S.dropdownName}>{user?.firstName} {user?.lastName}</p>
                            <p style={S.dropdownRole}>{user?.role}</p>
                          </div>

                          {userMenuItems.map((item) => {
                            const active = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
                            return (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                style={S.dropdownItem(active)}
                                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = TOKEN.hoverRow; }}
                                onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = active ? TOKEN.red50 : "transparent"; }}
                              >
                                <item.icon size={15} color={active ? TOKEN.red600 : TOKEN.textMutedDark} style={{ flexShrink: 0 }} />
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {item.badge != null && <span style={S.chip}>{item.badge}</span>}
                              </Link>
                            );
                          })}

                          <button
                            onClick={handleLogout}
                            style={S.dropdownLogout}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fff1ee"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            <LogOut size={15} style={{ flexShrink: 0 }} />
                            Déconnexion
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Link to="/auth/login" style={S.authLogin}>{t("authMenu.login", "Connexion")}</Link>
                  <Link to="/auth/register" style={S.authRegister}>{t("authMenu.register", "Inscription")}</Link>
                </div>
              )}
            </div>
          ) : (
            /* Contrôles mobiles */
            <div style={S.mobileControls}>
              <LanguageSelector />
              <CurrencySelector />
              <button type="button" style={S.iconBtn} onClick={toggleMobileSearch} aria-label="Rechercher">
                {isMobileSearchOpen ? <X size={18} /> : <Search size={18} />}
              </button>
              <button type="button" style={S.iconBtn} onClick={toggleMobileMenu} aria-label="Menu">
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          )}
        </div>

        {/* Recherche mobile dépliable */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden", backgroundColor: TOKEN.primaryDark, padding: "0 14px" }}
            >
              <div style={{ position: "relative", padding: "10px 0" }}>
                <div style={S.searchIcon}><Search size={15} /></div>
                <input
                  type="text"
                  autoFocus
                  placeholder={t("search_placeholder", "Rechercher...")}
                  style={S.searchInput}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
              <div style={S.mobileMenu}>
                {isLoggedIn() && (
                  <div style={S.mobileUserBar}>
                    <div style={S.mobileAvatar}>{userInitials}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={S.mobileUserName}>{user?.firstName} {user?.lastName}</p>
                      <p style={S.mobileUserEmail}>{user?.email}</p>
                    </div>
                  </div>
                )}

                <div style={S.mobileNavList}>
                  <MobileMenuList items={mainMenus} closeMobileMenu={closeMobileMenu} />

                  {isLoggedIn() ? (
                    <>
                      <div style={S.mobileDivider} />
                      <MobileMenuList items={userMenuItems} closeMobileMenu={closeMobileMenu} />
                      <button
                        onClick={() => { closeMobileMenu(); handleLogout(); }}
                        style={S.mobileLogout}
                      >
                        <LogOut size={15} />
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={S.mobileDivider} />
                      <div style={S.mobileAuthRow}>
                        {authMenus.map((item, i) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            style={S.mobileAuthBtn(i === 0)}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon size={14} color={TOKEN.accent} style={{ flexShrink: 0 }} />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mega-menu pleine largeur */}
      {activeMegaMenu?.subMenus && (
        <div
          onMouseEnter={() => handleMouseEnter(hoveredMenu)}
          onMouseLeave={handleMouseLeave}
        >
          <MegaMenuPanel
            item={activeMegaMenu}
            activeIdx={hoveredMenu}
            onClose={() => setHoveredMenu(null)}
            onMouseEnter={() => handleMouseEnter(hoveredMenu)}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      )}
    </>
  );
};

export default Header;