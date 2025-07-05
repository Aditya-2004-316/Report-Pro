import React, { useState, useRef, useEffect } from "react";
import MarkEntryForm from "./components/MarkEntryForm";
import StudentList from "./components/StudentList";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProfileModal from "./components/ProfileModal";
import { MdEdit, MdListAlt, MdBarChart, MdSchool } from "react-icons/md";
import reportProLogo from "./assets/report-pro-logo.png";
import { useState as useReactState } from "react";
import {
    Routes,
    Route,
    useNavigate,
    Navigate,
    useLocation,
} from "react-router-dom";

const ACCENT = "#e53935"; // Red accent
const ACCENT_DARK = "#b71c1c";
const BG_GRADIENT = "linear-gradient(135deg, #fff 0%, #ffeaea 100%)";

const DARK_THEME = {
    background: "#18191a",
    surface: "#32353b",
    border: "rgba(255,255,255,0.10)",
    text: "#f5f6fa",
    textSecondary: "#b0b3b8",
    accent: "#ff6f61",
    accentHover: "#e57373",
    inputBg: "#232526",
    inputBorder: "#44474a",
    shadow: "0 4px 24px #0008",
};
const LIGHT_THEME = {
    background: BG_GRADIENT,
    surface: "#fff",
    border: "#fbe9e7",
    text: "#222",
    textSecondary: "#888",
    accent: ACCENT,
    accentHover: ACCENT_DARK,
    inputBg: "#fff",
    inputBorder: "#eee",
    shadow: "0 4px 24px #e5393522",
};

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
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u) : null;
    });
    const [token, setToken] = useState(
        () => localStorage.getItem("token") || ""
    );
    const [authPage, setAuthPage] = useState("login"); // or "signup"
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef();
    const [showProfile, setShowProfile] = useState(false);
    const [theme, setTheme] = useReactState(
        () => localStorage.getItem("theme") || "light"
    );
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const themeObj = theme === "dark" ? DARK_THEME : LIGHT_THEME;

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // Validate stored token on app load
    useEffect(() => {
        const validateStoredToken = async () => {
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

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
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    setUser(null);
                    setToken("");
                    setIsValidatingToken(false);
                }
            } catch (error) {
                // Network error or server down, clear stored data
                localStorage.removeItem("user");
                localStorage.removeItem("token");
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
        } catch (err) {
            setMessage("Error saving marks.");
        }
    };

    // Auth handlers
    const handleLogin = (userData) => {
        setUser(userData);
        setToken(userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userData.token);
        setAuthPage(null);
        setView("home");
        navigate("/dashboard");
    };
    const handleSignup = (userData) => {
        setUser(userData);
        setToken(userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userData.token);
        setAuthPage(null);
        setView("home");
        navigate("/dashboard");
    };
    const handleLogout = () => {
        setUser(null);
        setToken("");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setAuthPage("login");
        navigate("/");
    };

    // Update user info in state/localStorage after profile edit
    const handleProfileUpdate = (updated) => {
        if (updated && user) {
            const newUser = { ...user, ...updated };
            setUser(newUser);
            localStorage.setItem("user", JSON.stringify(newUser));
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
    // Responsive style tag for nav grid
    const navResponsiveStyleTag = (
        <style>{`
            @media (max-width: 600px) {
                .nav-grid {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 12px !important;
                    max-width: 340px !important;
                }
                .nav-btn-wrap {
                    flex: 1 1 45% !important;
                    min-width: 140px !important;
                    margin-bottom: 12px !important;
                }
            }
            @media (min-width: 601px) {
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
                        <div
                            style={{
                                fontFamily: "Segoe UI, Arial, sans-serif",
                                background:
                                    theme === "dark" ? "#18191a" : BG_GRADIENT,
                                minHeight: "100vh",
                                width: "99vw",
                                overflowX: "hidden",
                                color: theme === "dark" ? "#f5f5f5" : undefined,
                                transition: "background 0.3s, color 0.3s",
                            }}
                        >
                            <header
                                style={{
                                    background:
                                        theme === "dark"
                                            ? "linear-gradient(90deg, #7b1f24 0%, #b71c1c 100%)"
                                            : "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
                                    color: "#fff",
                                    padding: isMobile
                                        ? "1.2rem 0.5rem"
                                        : "1.5rem 2rem",
                                    textAlign: "center",
                                    borderRadius: "0 0 18px 18px",
                                    boxShadow: themeObj.shadow,
                                    marginBottom: 24,
                                }}
                            >
                                <style>{`
                .profile-avatar-btn { background: #fff; border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: ${ACCENT_DARK}; box-shadow: 0 2px 8px #e5393533; cursor: pointer; position: relative; transition: box-shadow 0.2s; }
                .profile-avatar-btn:focus, .profile-avatar-btn:active { outline: none; border: none; box-shadow: 0 0 0 2px ${ACCENT}; }
                .profile-dropdown { position: absolute; top: 54px; right: 0; background: #fff; color: ${ACCENT_DARK}; border-radius: 12px; box-shadow: 0 4px 24px #e5393533; min-width: 160px; z-index: 100; padding: 0.5rem 0; display: flex; flex-direction: column; }
                .profile-dropdown-btn { background: none; border: none; color: ${ACCENT_DARK}; font-size: 16px; font-weight: 600; text-align: left; padding: 12px 20px; cursor: pointer; border-radius: 8px; transition: background 0.15s; }
                .profile-dropdown-btn:hover { background: #ffeaea; }
                `}</style>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        maxWidth: 1400,
                                        margin: "0 auto",
                                        position: "relative",
                                    }}
                                >
                                    <h1
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            fontSize: isMobile ? 32 : 44,
                                            fontWeight: 800,
                                            letterSpacing: 1,
                                            margin: 0,
                                            fontFamily:
                                                "Segoe UI, Arial, sans-serif",
                                        }}
                                    >
                                        <img
                                            src={reportProLogo}
                                            alt="ReportPro Logo"
                                            style={{
                                                width: 80,
                                                height: 80,
                                                marginRight: 28,
                                                borderRadius: 18,
                                                verticalAlign: "middle",
                                                boxShadow:
                                                    "0 2px 8px #e5393522",
                                            }}
                                        />
                                        Report Pro
                                    </h1>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 18,
                                            position: "relative",
                                        }}
                                    >
                                        <ThemeToggle
                                            theme={theme}
                                            setTheme={setTheme}
                                        />
                                        <span
                                            onClick={() =>
                                                setProfileMenuOpen((v) => !v)
                                            }
                                            aria-label="Profile menu"
                                            tabIndex={0}
                                            ref={profileMenuRef}
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: "50%",
                                                background: "#ffeaea",
                                                color: "#b71c1c",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 700,
                                                fontSize: 22,
                                                textTransform: "uppercase",
                                                letterSpacing: 1,
                                                userSelect: "none",
                                                aspectRatio: "1 / 1",
                                                verticalAlign: "middle",
                                                cursor: "pointer",
                                                boxShadow:
                                                    "0 2px 8px #e5393533",
                                                border: "none",
                                                outline: "none",
                                                transition: "box-shadow 0.2s",
                                            }}
                                        >
                                            {user?.name ? (
                                                (() => {
                                                    const parts = user.name
                                                        .trim()
                                                        .split(" ");
                                                    if (parts.length === 1)
                                                        return parts[0][0];
                                                    return (
                                                        parts[0][0] +
                                                        parts[
                                                            parts.length - 1
                                                        ][0]
                                                    );
                                                })()
                                            ) : (
                                                <i
                                                    className="fa fa-user"
                                                    aria-hidden="true"
                                                ></i>
                                            )}
                                        </span>
                                        {profileMenuOpen && (
                                            <div
                                                className="profile-dropdown"
                                                ref={profileMenuRef}
                                            >
                                                <button
                                                    className="profile-dropdown-btn"
                                                    onClick={() => {
                                                        setShowProfile(true);
                                                        setProfileMenuOpen(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    Edit Profile
                                                </button>
                                                <button
                                                    className="profile-dropdown-btn"
                                                    onClick={() => {
                                                        handleLogout();
                                                        setProfileMenuOpen(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <nav
                                    style={{
                                        marginTop: isMobile ? "1rem" : "1.5rem",
                                    }}
                                >
                                    {navResponsiveStyleTag}
                                    <div
                                        className="nav-grid"
                                        style={navGridStyle}
                                    >
                                        <div
                                            className="nav-btn-wrap"
                                            style={navBtnWrapStyle}
                                        >
                                            <button
                                                onClick={() =>
                                                    setView("markEntry")
                                                }
                                                style={navBtn("markEntry")}
                                            >
                                                <MdEdit
                                                    style={{
                                                        marginRight: 8,
                                                        verticalAlign: "middle",
                                                        fontSize: 20,
                                                    }}
                                                />
                                                Enter Marks
                                            </button>
                                        </div>
                                        <div
                                            className="nav-btn-wrap"
                                            style={navBtnWrapStyle}
                                        >
                                            <button
                                                onClick={() =>
                                                    setView("results")
                                                }
                                                style={navBtn("results")}
                                            >
                                                <MdListAlt
                                                    style={{
                                                        marginRight: 8,
                                                        verticalAlign: "middle",
                                                        fontSize: 20,
                                                    }}
                                                />
                                                View Results
                                            </button>
                                        </div>
                                        <div
                                            className="nav-btn-wrap"
                                            style={navBtnWrapStyle}
                                        >
                                            <button
                                                onClick={() =>
                                                    setView("statistics")
                                                }
                                                style={navBtn("statistics")}
                                            >
                                                <MdBarChart
                                                    style={{
                                                        marginRight: 8,
                                                        verticalAlign: "middle",
                                                        fontSize: 20,
                                                    }}
                                                />
                                                Statistics
                                            </button>
                                        </div>
                                        <div
                                            className="nav-btn-wrap"
                                            style={navBtnWrapStyle}
                                        >
                                            <button
                                                onClick={() =>
                                                    setView("admission")
                                                }
                                                style={navBtn("admission")}
                                            >
                                                <MdSchool
                                                    style={{
                                                        marginRight: 8,
                                                        verticalAlign: "middle",
                                                        fontSize: 20,
                                                    }}
                                                />
                                                Admission Details
                                            </button>
                                        </div>
                                    </div>
                                </nav>
                            </header>
                            <main style={mainStyle}>
                                {view === "markEntry" && (
                                    <>
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
                                        {message && (
                                            <div
                                                style={{
                                                    marginTop: 16,
                                                    color: message.includes(
                                                        "Error"
                                                    )
                                                        ? ACCENT
                                                        : ACCENT_DARK,
                                                    textAlign: "center",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {message}
                                            </div>
                                        )}
                                    </>
                                )}
                                {view === "home" && (
                                    <>
                                        <h2
                                            style={{
                                                color: ACCENT_DARK,
                                                fontWeight: 700,
                                                fontSize: 28,
                                                margin: "2rem 0 1rem",
                                            }}
                                        >
                                            Welcome to Report Pro
                                        </h2>
                                        <p
                                            style={{
                                                color: "#666",
                                                fontSize: 18,
                                            }}
                                        >
                                            Select an option above to get
                                            started.
                                        </p>
                                    </>
                                )}
                                {view === "results" && (
                                    <StudentList
                                        accent={themeObj.accent}
                                        accentDark={themeObj.accentHover}
                                        session={session}
                                        setSession={setSession}
                                        token={token}
                                        theme={themeObj}
                                    />
                                )}
                                {view === "statistics" && (
                                    <Dashboard
                                        accent={themeObj.accent}
                                        accentDark={themeObj.accentHover}
                                        session={session}
                                        setSession={setSession}
                                        token={token}
                                        theme={themeObj}
                                    />
                                )}
                                {view === "admission" && (
                                    <div
                                        style={{
                                            background: themeObj.surface,
                                            borderRadius: 16,
                                            boxShadow: themeObj.shadow,
                                            padding: isMobile ? 24 : 40,
                                            maxWidth: 480,
                                            margin: "2rem auto",
                                            color: themeObj.text,
                                        }}
                                    >
                                        <h2
                                            style={{
                                                color: ACCENT_DARK,
                                                fontWeight: 700,
                                                fontSize: 26,
                                                marginBottom: 18,
                                                letterSpacing: 1,
                                            }}
                                        >
                                            Admission Details
                                        </h2>
                                        <p
                                            style={{
                                                color: ACCENT,
                                                fontSize: 18,
                                                fontWeight: 600,
                                            }}
                                        >
                                            This feature will be added soon.
                                        </p>
                                    </div>
                                )}
                            </main>
                            {showProfile && (
                                <ProfileModal
                                    token={token}
                                    onClose={() => setShowProfile(false)}
                                    onProfileUpdate={handleProfileUpdate}
                                    profilePicture={user?.profilePicture}
                                    theme={themeObj}
                                />
                            )}
                            <style>{`
              [data-theme="dark"] {
                background: #18191a !important;
                color: #f5f5f5 !important;
              }
              [data-theme="dark"] .dashboard-container,
              [data-theme="dark"] .results-container,
              [data-theme="dark"] .results-card,
              [data-theme="dark"] .markentry-form {
                background: #232526 !important;
                color: #f5f5f5 !important;
              }
              [data-theme="dark"] input,
              [data-theme="dark"] select,
              [data-theme="dark"] textarea {
                background: #232526 !important;
                color: #f5f5f5 !important;
                border-color: #444 !important;
              }
              [data-theme="dark"] .profile-dropdown {
                background: #232526 !important;
                color: #f5f5f5 !important;
              }
              [data-theme="dark"] .profile-dropdown-btn:hover {
                background: #333 !important;
              }
              [data-theme="dark"] .profile-avatar-btn,
              [data-theme="dark"] .profile-avatar-btn:focus,
              [data-theme="dark"] .profile-avatar-btn:active {
                background: #232526 !important;
                color: #ffeaea !important;
              }
            `}</style>
                        </div>
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />
            <Route
                path="*"
                element={<Navigate to={user ? "/dashboard" : "/"} replace />}
            />
        </Routes>
    );
}

export default App;
