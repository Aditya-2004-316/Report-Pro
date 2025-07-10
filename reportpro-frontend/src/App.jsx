import React, { useState, useRef, useEffect } from "react";
import MarkEntryForm from "./components/MarkEntryForm";
import StudentList from "./components/StudentList";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProfileModal from "./components/ProfileModal";
import Footer from "./components/Footer";
import { MdEdit, MdListAlt, MdBarChart, MdSchool } from "react-icons/md";
import reportProLogo from "./assets/report-pro-logo.png";
import { useState as useReactState } from "react";
import {
    Routes,
    Route,
    useNavigate,
    Navigate,
    useLocation,
    Outlet,
} from "react-router-dom";
import AdmissionDetails from "./components/AdmissionDetails";
import HelpSupport from "./components/HelpSupport";
import ContactUs from "./components/ContactUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import Settings from "./components/Settings";
import MainLayout from "./components/MainLayout";
import DashboardLayout from "./components/DashboardLayout";
import Welcome from "./components/Welcome";
import { DARK_THEME, LIGHT_THEME } from "./theme";

const ACCENT = "#e53935"; // Red accent
const ACCENT_DARK = "#b71c1c";
const BG_GRADIENT = "linear-gradient(135deg, #fff 0%, #ffeaea 100%)";

function ThemeToggle({ theme, setTheme }) {
    const isDark = theme === "dark";
    return (
        <button
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            style={{
                background: isDark ? "#232526" : "#fff",
                border: "none",
                borderRadius: 20,
                width: 48,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: isDark ? "flex-end" : "flex-start",
                padding: 3,
                cursor: "pointer",
                boxShadow: isDark ? "0 2px 8px #0002" : "0 2px 8px #e5393533",
                transition: "background 0.3s, box-shadow 0.3s",
                outline: "none",
                position: "relative",
                marginRight: 10,
            }}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    setTheme(isDark ? "light" : "dark");
                }
            }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <span
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: isDark ? "#ffeaea" : "#b71c1c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isDark ? "#b71c1c" : "#fff",
                    fontSize: 16,
                    transition: "background 0.3s, color 0.3s",
                }}
            >
                {isDark ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="5" fill="#b71c1c" />
                        <g stroke="#b71c1c" strokeWidth="2">
                            <line x1="12" y1="2" x2="12" y2="5" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                            <line x1="2" y1="12" x2="5" y2="12" />
                            <line x1="19" y1="12" x2="22" y2="12" />
                            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
                            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
                            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
                            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
                        </g>
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                            fill="#fff"
                            stroke="#fff"
                            strokeWidth="2"
                        />
                    </svg>
                )}
            </span>
        </button>
    );
}

function App() {
    const [view, setView] = useState("home");
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("Hindi");
    const [session, setSession] = useState("");
    const [user, setUser] = useState(() => {
        const u = sessionStorage.getItem("user");
        return u ? JSON.parse(u) : null;
    });
    const [token, setToken] = useState(
        () => sessionStorage.getItem("token") || ""
    );
    const [authPage, setAuthPage] = useState("login"); // or "signup"
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef();
    const [showProfile, setShowProfile] = useState(false);
    const [theme, setTheme] = useReactState(
        () => localStorage.getItem("theme") || "light"
    );
    // Accent color state
    const [accent, setAccent] = useReactState(
        () => localStorage.getItem("accent") || "#e53935"
    );
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const [isConnected, setIsConnected] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const navigate = useNavigate();
    const location = useLocation();

    // Dynamically generate theme object with accent
    const themeObj = {
        ...(theme === "dark" ? DARK_THEME : LIGHT_THEME),
        accent,
        accentHover: accent + "cc", // fallback for hover
    };

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // Validate stored token on app load
    useEffect(() => {
        const validateStoredToken = async () => {
            const storedToken = sessionStorage.getItem("token");
            const storedUser = sessionStorage.getItem("user");

            if (!storedToken || !storedUser) {
                setIsValidatingToken(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/profile`, {
                    headers: { Authorization: `Bearer ${storedToken}` },
                });

                if (res.ok) {
                    // Token is valid, user can stay logged in
                    setIsValidatingToken(false);
                } else {
                    // Token is invalid, clear stored data
                    sessionStorage.removeItem("user");
                    sessionStorage.removeItem("token");
                    setUser(null);
                    setToken("");
                    setIsValidatingToken(false);
                }
            } catch (error) {
                // Network error or server down, clear stored data
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("token");
                setUser(null);
                setToken("");
                setIsValidatingToken(false);
            }
        };

        validateStoredToken();
    }, []);

    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);
    useEffect(() => {
        localStorage.setItem("accent", accent);
    }, [accent]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!profileMenuOpen) return;
        function handleClick(e) {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(e.target)
            ) {
                setProfileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [profileMenuOpen]);

    const handleMarkEntry = async (data) => {
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/api/students`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                let errorMsg = "Error saving marks.";
                try {
                    const errData = await res.json();
                    if (errData && errData.error) {
                        errorMsg = errData.error;
                    }
                } catch (e) {
                    // ignore JSON parse error, use default message
                }
                setMessage(errorMsg);
                return;
            }
            setMessage("Student marks saved successfully!");
            setLastUpdated(new Date());
        } catch (err) {
            setMessage("Error saving marks.");
        }
    };

    // Auth handlers
    const handleLogin = (userData) => {
        setUser(userData);
        setToken(userData.token);
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("token", userData.token);
        setAuthPage(null);
        setView("home");
        navigate("/dashboard");
    };
    const handleSignup = (userData) => {
        setUser(userData);
        setToken(userData.token);
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("token", userData.token);
        setAuthPage(null);
        setView("home");
        navigate("/dashboard");
    };
    const handleLogout = () => {
        setUser(null);
        setToken("");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        setAuthPage("login");
        navigate("/");
    };

    // Update user info in state/localStorage after profile edit
    const handleProfileUpdate = (updated) => {
        if (updated && user) {
            const newUser = { ...user, ...updated };
            setUser(newUser);
            sessionStorage.setItem("user", JSON.stringify(newUser));
        }
    };

    // Responsive: center 99vw on mobile, 100% on desktop
    const isMobile = window.innerWidth < 600;
    const mainStyle = {
        padding: isMobile ? "1rem 0.5rem" : "2rem",
        width: isMobile ? "99vw" : "100%",
        margin: isMobile ? "0 auto" : "0",
        minHeight: "calc(100vh - 120px)",
        background: "transparent",
        fontSize: isMobile ? 16 : 18,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    };
    const navBtn = (tab) => ({
        margin: "0 1rem",
        padding: "0.5rem 1.2rem",
        background:
            view === tab
                ? theme === "dark"
                    ? "#b71c1c"
                    : themeObj.accent
                : theme === "dark"
                ? themeObj.surface
                : "#fff",
        color:
            view === tab
                ? "#fff"
                : theme === "dark"
                ? themeObj.text
                : ACCENT_DARK,
        border:
            view === tab ? `2px solid #fff` : `2px solid ${themeObj.accent}`,
        boxShadow: view === tab ? `0 0 0 2px ${themeObj.accent}` : "none",
        borderRadius: "6px",
        fontWeight: 600,
        fontSize: 16,
        cursor: "pointer",
        transition: "all 0.2s",
        outline: "none",
    });

    // Responsive nav grid styles
    const navGridStyle = {
        display: "flex",
        flexWrap: isMobile ? "wrap" : "nowrap",
        justifyContent: "center",
        gap: 16,
        maxWidth: isMobile ? 340 : 600,
        margin: "0 auto",
    };
    const navBtnWrapStyle = {
        flex: isMobile ? "1 1 45%" : "0 0 auto",
        minWidth: isMobile ? 140 : 0,
        display: "flex",
        justifyContent: "center",
        marginBottom: isMobile ? 12 : 0,
    };
    // Comprehensive responsive style tag for nav grid and overall layout
    const navResponsiveStyleTag = (
        <style>{`
            /* Large Desktop (1400px and up) */
            @media (min-width: 1400px) {
                .nav-grid {
                    display: flex !important;
                    flex-wrap: nowrap !important;
                    gap: 20px !important;
                    max-width: 700px !important;
                }
                .nav-btn-wrap {
                    flex: 0 0 auto !important;
                    min-width: 0 !important;
                    margin-bottom: 0 !important;
                }
                .app-header {
                    padding: 2rem 3rem !important;
                }
                .app-title {
                    font-size: 48px !important;
                }
                .app-logo {
                    width: 90px !important;
                    height: 90px !important;
                }
            }
            
            /* Desktop (1024px to 1399px) */
            @media (min-width: 1024px) and (max-width: 1399px) {
                .nav-grid {
                    display: flex !important;
                    flex-wrap: nowrap !important;
                    gap: 18px !important;
                    max-width: 650px !important;
                }
                .nav-btn-wrap {
                    flex: 0 0 auto !important;
                    min-width: 0 !important;
                    margin-bottom: 0 !important;
                }
                .app-header {
                    padding: 1.8rem 2.5rem !important;
                }
                .app-title {
                    font-size: 42px !important;
                }
                .app-logo {
                    width: 85px !important;
                    height: 85px !important;
                }
            }
            
            /* Tablet Landscape (768px to 1023px) */
            @media (min-width: 768px) and (max-width: 1023px) {
                .nav-grid {
                    display: flex !important;
                    flex-wrap: nowrap !important;
                    gap: 16px !important;
                    max-width: 600px !important;
                }
                .nav-btn-wrap {
                    flex: 0 0 auto !important;
                    min-width: 0 !important;
                    margin-bottom: 0 !important;
                }
                .app-header {
                    padding: 1.5rem 2rem !important;
                }
                .app-title {
                    font-size: 38px !important;
                }
                .app-logo {
                    width: 80px !important;
                    height: 80px !important;
                }
            }
            
                            /* Tablet Portrait (600px to 767px) */
                @media (min-width: 600px) and (max-width: 767px) {
                    .nav-grid {
                        display: flex !important;
                        flex-wrap: wrap !important;
                        gap: 14px !important;
                        max-width: 500px !important;
                    }
                    .nav-btn-wrap {
                        flex: 1 1 48% !important;
                        min-width: 160px !important;
                        margin-bottom: 10px !important;
                    }
                    .app-header {
                        padding: 1.3rem 1.5rem !important;
                    }
                    .app-title {
                        font-size: 34px !important;
                    }
                    .app-logo {
                        width: 75px !important;
                        height: 75px !important;
                    }
                    .app-title-text {
                        display: none !important;
                    }
                    .app-title {
                        justify-content: center !important;
                    }
                }
            
                            /* Mobile Large (480px to 599px) */
                @media (min-width: 480px) and (max-width: 599px) {
                    .nav-grid {
                        display: flex !important;
                        flex-wrap: wrap !important;
                        gap: 12px !important;
                        max-width: 400px !important;
                    }
                    .nav-btn-wrap {
                        flex: 1 1 46% !important;
                        min-width: 150px !important;
                        margin-bottom: 8px !important;
                    }
                    .app-header {
                        padding: 1.2rem 1rem !important;
                    }
                    .app-title {
                        font-size: 30px !important;
                    }
                    .app-logo {
                        width: 70px !important;
                        height: 70px !important;
                    }
                    .app-title-text {
                        display: none !important;
                    }
                    .app-title {
                        justify-content: center !important;
                    }
                }
            
                            /* Mobile Small (320px to 479px) */
                @media (max-width: 479px) {
                    .nav-grid {
                        display: flex !important;
                        flex-wrap: wrap !important;
                        gap: 10px !important;
                        max-width: 340px !important;
                    }
                    .nav-btn-wrap {
                        flex: 1 1 45% !important;
                        min-width: 140px !important;
                        margin-bottom: 8px !important;
                    }
                    .app-header {
                        padding: 1rem 0.8rem !important;
                    }
                    .app-title {
                        font-size: 26px !important;
                    }
                    .app-logo {
                        width: 60px !important;
                        height: 60px !important;
                    }
                    .app-title-text {
                        display: none !important;
                    }
                    .app-title {
                        justify-content: center !important;
                    }
                }
            
            /* Touch-friendly improvements */
            @media (hover: none) and (pointer: coarse) {
                .nav-btn {
                    min-height: 44px !important;
                    min-width: 120px !important;
                }
                .profile-avatar-btn {
                    min-width: 48px !important;
                    min-height: 48px !important;
                }
            }
            
            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .nav-btn {
                    border-width: 2px !important;
                }
                .app-header {
                    border-bottom: 2px solid #e53935 !important;
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .nav-grid,
                .nav-btn-wrap,
                .app-header,
                .app-title,
                .app-logo {
                    transition: none !important;
                    animation: none !important;
                }
            }
        `}</style>
    );

    // Show loading screen while validating token
    if (isValidatingToken) {
        return (
            <div
                style={{
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    background: theme === "dark" ? "#18191a" : BG_GRADIENT,
                    minHeight: "100vh",
                    width: "100vw",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme === "dark" ? "#f5f5f5" : "#333",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        padding: "2rem",
                        background: theme === "dark" ? "#232526" : "#fff",
                        borderRadius: 16,
                        boxShadow:
                            theme === "dark"
                                ? "0 4px 24px #0006"
                                : "0 4px 24px #e5393522",
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            border: "3px solid #e53935",
                            borderTop: "3px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto 1rem auto",
                        }}
                    />
                    <p style={{ margin: 0, fontWeight: 600 }}>Loading...</p>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // Add export data handler
    const handleExportData = () => {
        // TODO: Implement export logic
        alert("Export Data functionality coming soon!");
    };

    // Routing logic
    return (
        <Routes>
            <Route
                path="/"
                element={
                    !user ? (
                        authPage === "signup" ? (
                            <Signup
                                onSignup={handleSignup}
                                switchToLogin={() => setAuthPage("login")}
                                theme={themeObj}
                            />
                        ) : (
                            <Login
                                onLogin={handleLogin}
                                switchToSignup={() => setAuthPage("signup")}
                                theme={themeObj}
                            />
                        )
                    ) : (
                        <Navigate to="/dashboard" replace />
                    )
                }
            />
            <Route
                path="/dashboard"
                element={
                    user ? (
                        <DashboardLayout
                            theme={theme}
                            user={user}
                            setTheme={setTheme}
                            onLogout={handleLogout}
                            onProfileUpdate={handleProfileUpdate}
                        />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            >
                <Route index element={<Navigate to="welcome" replace />} />
                <Route path="welcome" element={<Welcome />} />
                <Route
                    path="results"
                    element={
                        <StudentList
                            accent={themeObj.accent}
                            accentDark={themeObj.accentHover}
                            session={session}
                            setSession={setSession}
                            token={token}
                            theme={themeObj}
                        />
                    }
                />
                <Route
                    path="statistics"
                    element={
                        <Dashboard
                            accent={themeObj.accent}
                            accentDark={themeObj.accentHover}
                            session={session}
                            setSession={setSession}
                            token={token}
                            theme={themeObj}
                        />
                    }
                />
                <Route
                    path="admission"
                    element={<AdmissionDetails theme={themeObj} />}
                />
                <Route
                    path="markEntry"
                    element={
                        <MarkEntryForm
                            onSubmit={handleMarkEntry}
                            accent={themeObj.accent}
                            accentDark={themeObj.accentHover}
                            subject={subject}
                            setSubject={setSubject}
                            session={session}
                            setSession={setSession}
                            theme={themeObj}
                        />
                    }
                />
                <Route path="help" element={<HelpSupport theme={themeObj} />} />
                <Route
                    path="contact"
                    element={<ContactUs theme={themeObj} />}
                />
                <Route
                    path="privacy"
                    element={<PrivacyPolicy theme={themeObj} />}
                />
                <Route
                    path="terms"
                    element={<TermsOfService theme={themeObj} />}
                />
                <Route
                    path="settings"
                    element={
                        <Settings
                            theme={themeObj}
                            user={user}
                            onProfileUpdate={handleProfileUpdate}
                            onThemeChange={setTheme}
                            onAccentChange={setAccent}
                        />
                    }
                />
            </Route>
            <Route
                path="*"
                element={<Navigate to={user ? "/dashboard" : "/"} replace />}
            />
        </Routes>
    );
}

export default App;
