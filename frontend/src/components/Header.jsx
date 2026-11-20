import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, LogOut, Menu, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import Logo from "./Logo";
import { buttonClass } from "./ui/Button";
import { useAuth } from "../context/AuthContext";
import { NAV_BY_ROLE, ROLE_LABEL } from "../config/site";

// Links for visitors who aren't logged in - they scroll to sections on the home page
const GUEST_LINKS = [
  { id: "top", label: "Home" },
  { id: "how", label: "How it works" },
  { id: "journey", label: "Journey" },
  { id: "recruiters", label: "For recruiters" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Glass background once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Close the user menu when clicking outside it
  useEffect(() => {
    const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goToSection = (id) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out. See you soon!");
    navigate("/");
  };

  const roleLinks = user ? NAV_BY_ROLE[user.role] || [] : [];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-cream-100/80 shadow-soft backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 rounded-full border border-cream-300/80 bg-cream-50/60 p-1.5 backdrop-blur md:flex">
          {user
            ? roleLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end
                  className={({ isActive }) =>
                    `relative rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive ? "text-cream-100" : "text-forest-600 hover:text-forest-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-forest-800"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative">{link.label}</span>
                    </>
                  )}
                </NavLink>
              ))
            : GUEST_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => goToSection(link.id)}
                  className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-forest-600 transition hover:bg-forest-800 hover:text-cream-100"
                >
                  {link.label}
                </button>
              ))}
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex cursor-pointer items-center gap-3 rounded-full border border-cream-300 bg-cream-50 py-1.5 pl-1.5 pr-4 transition hover:shadow-soft"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-hotpink-500 font-display text-lg font-bold text-white">
                  {user.name?.[0]?.toUpperCase()}
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-sm font-semibold text-forest-800">{user.name}</span>
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-forest-400">
                    {ROLE_LABEL[user.role]}
                  </span>
                </span>
                <ChevronDown className={`h-4 w-4 text-forest-400 transition ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 shadow-lift"
                  >
                    <div className="border-b border-cream-300 bg-cream-100 px-4 py-3">
                      <p className="text-xs text-forest-400">Signed in as</p>
                      <p className="truncate text-sm font-semibold text-forest-800">{user.email}</p>
                    </div>
                    {user.role === "STUDENT" && (
                      <Link
                        to="/student/profile"
                        className="flex w-full items-center gap-2 border-b border-cream-200 px-4 py-3 text-sm font-medium text-forest-700 transition hover:bg-cream-200"
                      >
                        <UserRound className="h-4 w-4" /> My profile
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-hotpink-700 transition hover:bg-hotpink-50"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className={buttonClass("ghost", "sm")}>
                Log in
              </Link>
              <Link to="/signup" className={buttonClass("primary", "sm")}>
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-forest-800 text-cream-100 md:hidden"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-cream-300 bg-cream-100/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {user
                ? roleLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end
                      className={({ isActive }) =>
                        `block rounded-xl px-4 py-3 font-medium ${
                          isActive ? "bg-forest-800 text-cream-100" : "text-forest-700 hover:bg-cream-200"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))
                : GUEST_LINKS.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => goToSection(link.id)}
                      className="block w-full cursor-pointer rounded-xl px-4 py-3 text-left font-medium text-forest-700 hover:bg-cream-200"
                    >
                      {link.label}
                    </button>
                  ))}
              {user?.role === "STUDENT" && (
                <NavLink
                  to="/student/profile"
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 font-medium ${isActive ? "bg-forest-800 text-cream-100" : "text-forest-700 hover:bg-cream-200"}`
                  }
                >
                  My profile
                </NavLink>
              )}
              <div className="flex gap-3 pt-3">
                {user ? (
                  <button onClick={handleLogout} className={buttonClass("outline", "md", "w-full")}>
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                ) : (
                  <>
                    <Link to="/login" className={buttonClass("outline", "md", "flex-1")}>
                      Log in
                    </Link>
                    <Link to="/signup" className={buttonClass("primary", "md", "flex-1")}>
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
