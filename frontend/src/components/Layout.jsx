import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowRightLeft,
  ArrowLeftRight,
  Banknote,
  Bookmark,
  BarChart3,
  UserCog,
  Library,
  ChevronRight,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Settings,
} from "lucide-react";

// small util: convert hex to rgba for brand-light variable
function hexToRgb(hex, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const cleaned = hex.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const NAV = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Catalogue",
    items: [
      { to: "/books", icon: BookOpen, label: "Books" },
      { to: "/reservations", icon: Bookmark, label: "Reservations" },
    ],
  },
  {
    label: "Circulation",
    items: [
      { to: "/borrowings", icon: ArrowRightLeft, label: "Issue Books" },
      { to: "/returns", icon: ArrowLeftRight, label: "Returns" },
      { to: "/fines", icon: Banknote, label: "Fines" },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/members", icon: Users, label: "Members" },
      { to: "/staff", icon: UserCog, label: "Staff" },
    ],
  },
  {
    label: "Insights",
    items: [{ to: "/reports", icon: BarChart3, label: "Reports" }],
  },
  {
    label: "System",
    items: [{ to: "/settings", icon: Settings, label: "Settings" }],
  },
];

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    return stored ? stored === "true" : false;
  });
  const [sidebarAvatarDataUrl, setSidebarAvatarDataUrl] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Apply saved theme settings on mount
  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("selectedTheme");
    const savedTextSize = localStorage.getItem("textSize");
    const savedFontFamily = localStorage.getItem("fontFamily");

    if (savedTheme) {
      // Parse theme from THEMES
      const THEMES_LOCAL = {
        default: { colors: { brand: "#4f46e5", accent: "#7c3aed" } },
        ocean: { colors: { brand: "#0369a1", accent: "#0ea5e9" } },
        forest: { colors: { brand: "#15803d", accent: "#16a34a" } },
        sunset: { colors: { brand: "#ea580c", accent: "#f97316" } },
        purple: { colors: { brand: "#9333ea", accent: "#a855f7" } },
        rose: { colors: { brand: "#e11d48", accent: "#f43f5e" } },
      };
      const theme = THEMES_LOCAL[savedTheme];
      if (theme) {
        Object.entries(theme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value);
        });
        root.style.setProperty(
          "--brand-light",
          hexToRgb(theme.colors.brand, 0.08),
        );
      }
    }

    // Apply custom colors if user saved them
    const savedCustom = localStorage.getItem("customColors");
    if (savedCustom) {
      try {
        const c = JSON.parse(savedCustom);
        if (c.brand) root.style.setProperty("--brand", c.brand);
        if (c.accent) root.style.setProperty("--accent", c.accent);
        if (c.brand)
          root.style.setProperty("--brand-light", hexToRgb(c.brand, 0.08));
      } catch (e) {
        /* ignore parse errors */
      }
    }

    if (savedTextSize) {
      const TEXT_SIZES_LOCAL = {
        small: 0.9,
        normal: 1,
        large: 1.1,
        xlarge: 1.2,
      };
      const scale = TEXT_SIZES_LOCAL[savedTextSize] || 1;
      root.style.setProperty("--text-scale", scale);
    }

    if (savedFontFamily) {
      const FONT_FAMILIES_LOCAL = {
        inter: "'Inter var','Inter','system-ui','sans-serif'",
        poppins: "'Poppins','system-ui','sans-serif'",
        nunito: "'Nunito','system-ui','sans-serif'",
        roboto: "'Roboto','system-ui','sans-serif'",
        monospace: "'Monaco','Courier New','monospace'",
      };
      const font = FONT_FAMILIES_LOCAL[savedFontFamily];
      if (font) {
        root.style.fontFamily = font;
      }
    }

    // Apply custom background if user saved one (build gradients that include a black mix)
    const savedBg = localStorage.getItem("customBg");
    if (savedBg) {
      try {
        const bg = JSON.parse(savedBg);
        let bgValue = "";
        const BLACK_ALPHA = "rgba(0,0,0,0.6)";
        const makeLinear = (angle, c1, c2) =>
          `linear-gradient(${angle}deg, ${BLACK_ALPHA}, ${c1} 30%, ${c2})`;
        const makeRadial = (shape, c1, c2) =>
          `radial-gradient(${shape}, ${BLACK_ALPHA}, ${c1} 35%, ${c2})`;

        if (bg.type === "solid") {
          bgValue = bg.solidColor;
        } else if (bg.type === "linear") {
          const c1 = bg.gradientColor1 || bg.presetColor1;
          const c2 = bg.gradientColor2 || bg.presetColor2;
          bgValue = makeLinear(
            bg.gradientAngle || bg.presetAngle || 135,
            c1,
            c2,
          );
        } else if (bg.type === "radial") {
          const c1 = bg.gradientColor1 || bg.presetColor1;
          const c2 = bg.gradientColor2 || bg.presetColor2;
          bgValue = makeRadial(bg.radialShape || "circle", c1, c2);
        } else if (bg.type === "preset" && bg.preset) {
          const c1 = bg.presetColor1 || "#4f46e5";
          const c2 = bg.presetColor2 || "#7c3aed";
          bgValue = makeLinear(bg.presetAngle || 135, c1, c2);
        }
        if (bgValue) root.style.setProperty("--custom-bg", bgValue);
      } catch (e) {
        /* ignore parse errors */
      }
    }

    // Generate sidebar avatar (try local DiceBear packages, fall back to API)
    try {
      const savedProfileRaw = localStorage.getItem("profile");
      if (savedProfileRaw) {
        const p = JSON.parse(savedProfileRaw);
        if (p && p.avatarSeed && p.avatarStyle) {
          (async () => {
            try {
              const { createAvatar } = await import("@dicebear/core");
              const col = await import("@dicebear/collection");
              const toKey = (s) =>
                s.replace(/[-_ ]([a-z])/g, (_, c) => c.toUpperCase());
              const candidates = [
                p.avatarStyle,
                toKey(p.avatarStyle),
                p.avatarStyle.replace(/[-_ ]/g, ""),
                p.avatarStyle.toLowerCase(),
                p.avatarStyle.charAt(0).toUpperCase() + p.avatarStyle.slice(1),
              ];
              let styleModule = null;
              for (const k of candidates) {
                if (col[k]) {
                  styleModule = col[k];
                  break;
                }
                if (col.default && col.default[k]) {
                  styleModule = col.default[k];
                  break;
                }
              }
              if (styleModule) {
                const svg = createAvatar(styleModule, {
                  seed: p.avatarSeed,
                }).toString();
                setSidebarAvatarDataUrl(
                  "data:image/svg+xml;utf8," + encodeURIComponent(svg),
                );
                return;
              }
            } catch (e) {
              // fall through to API fallback
            }
            // fallback to API
            setSidebarAvatarDataUrl(
              `https://api.dicebear.com/9.x/${p.avatarStyle}/${encodeURIComponent(p.avatarSeed)}.svg?background=%23ffffff`,
            );
          })();
        }
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const pageTitle = () => {
    const flat = NAV.flatMap((g) => g.items);
    return flat.find((i) => pathname.startsWith(i.to))?.label ?? "Library";
  };

  const Sidebar = ({ collapsed = false }) => (
    <aside
      style={{
        width: collapsed ? "calc(var(--sidebar-w) * 0.3)" : "var(--sidebar-w)",
      }}
      className="flex-shrink-0 flex flex-col h-full transition-all duration-500 ease-in-out"
      onClick={() => setSidebarOpen(false)}
    >
      {/* Logo */}
      <div
        className="h-14 sm:h-16 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)",
          }}
        >
          <Library
            className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-white"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p
              className="text-xs sm:text-sm font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              LMS
            </p>
            <p
              className="text-[8px] sm:text-[10px] leading-tight font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Library System
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 sm:py-4 px-2 space-y-4 sm:space-y-5">
        {NAV.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p
                className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-3 mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 justify-${collapsed ? "center" : "start"} ${
                        isActive ? "text-white shadow-sm" : ""
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? {
                            background:
                              "linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)",
                            color: "#fff",
                          }
                        : { color: "var(--text-secondary)" }
                    }
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.classList.contains("text-white")) {
                        e.currentTarget.style.backgroundColor =
                          "var(--bg-subtle)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.classList.contains("text-white")) {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }
                    }}
                    title={collapsed ? label : ""}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ opacity: isActive ? 1 : 0.7 }}
                        />
                        {!collapsed && label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="p-2 sm:p-3 flex items-center justify-between flex-shrink-0"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2 sm:gap-3 min-w-0 px-2 sm:px-2 py-1.5 sm:py-2 rounded-xl cursor-pointer w-full`}
          style={{ color: "var(--text-primary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bg-subtle)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
        >
         

          {!collapsed ? (
            <div className="flex-1 min-w-0 pl-1 flex items-center justify-between">
              <div className="min-w-0">
                <p
                  className="text-[8px] sm:text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                 Logout
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors ml-2 flex-shrink-0"
                style={{
                  color: "var(--danger)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(220, 38, 38, 0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                style={{
                  color: "var(--danger)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(220, 38, 38, 0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--custom-bg, var(--bg-base))" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div
        className="hidden lg:flex flex-col relative transition-all duration-500 ease-in-out"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <Sidebar collapsed={sidebarCollapsed} />

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-125 active:scale-95 sidebar-collapse-btn"
          style={{
            backgroundColor: "var(--brand)",
            border: "2px solid var(--bg-surface)",
            color: "#ffffff",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent)";
            e.currentTarget.style.transform = "scale(1.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--brand)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden flex flex-col transition-all duration-500 ease-in-out overflow-y-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: "min(var(--sidebar-w), 85vw)",
          backgroundColor: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <button
          className="absolute top-3 right-2 p-1.5 rounded-lg z-10"
          style={{ color: "var(--text-muted)" }}
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-4 h-4" />
        </button>
        <Sidebar collapsed={false} />
      </div>

      {/* Main */}
      <div className="flex-1 w-full flex flex-col overflow-hidden transition-all duration-500 ease-in-out">
        {/* Topbar */}
        <header
          className="h-14 w-full sm:h-16 flex items-center px-3 sm:px-5 gap-3 sm:gap-4 flex-shrink-0 transition-all duration-500 ease-in-out"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            className="lg:hidden p-1.5 rounded-lg"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <Library
              className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            />
            <ChevronRight
              className="w-2.5 sm:w-3 h-2.5 sm:h-3 flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            />
            <span
              className="font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {pageTitle()}
            </span>
            
          </div>


          {/* Dark mode toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
             {/* Dark mode toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0"
          style={{
            backgroundColor: "var(--bg-subtle)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-muted)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-subtle)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
            <div
              className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "var(--bg-subtle)" }}
            >
               <div
            className="w-6 sm:w-7 h-6 sm:h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
            }}
          >
            {sidebarAvatarDataUrl ? (
              <img
                src={sidebarAvatarDataUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand), var(--accent))",
                }}
              >
                A
              </div>
            )}
          </div>
              <div className="flex flex-col text-xs">
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {(() => {
                    try {
                      const u = JSON.parse(
                        localStorage.getItem("user") || "{}",
                      );
                      return u.name || "User";
                    } catch {
                      return "User";
                    }
                  })()}
                </p>
                <p style={{ color: "var(--text-muted)" }}>
                  {(() => {
                    try {
                      const u = JSON.parse(
                        localStorage.getItem("user") || "{}",
                      );
                      return u.role || "Staff";
                    } catch {
                      return "Staff";
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
