import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import ProfileModal from "./ProfileModal";
import reportProLogo from "../assets/report-pro-logo.png";
import { MdEdit, MdListAlt, MdBarChart, MdSchool } from "react-icons/md";
import ThemeToggle from "./ThemeToggle";
import { DARK_THEME, LIGHT_THEME } from "../theme";

function DashboardLayout({ theme, user, setTheme, onLogout, onProfileUpdate }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const profileMenuRef = useRef();
    const profileBtnRef = useRef();
    const [dropdownLeft, setDropdownLeft] = useState(false); // false = open right, true = open left
    // Responsive: update isMobile and isTablet on window resize
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
    const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 600);
            setIsTablet(window.innerWidth < 1024);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    useEffect(() => {
        if (
            profileMenuOpen &&
            profileBtnRef.current &&
            profileMenuRef.current
        ) {
            // Check available space to the right of the profile icon
            const btnRect = profileBtnRef.current.getBoundingClientRect();
            const dropdownRect = profileMenuRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const margin = 16; // px from edge
            // If dropdown would overflow right edge, open to left
            if (btnRect.right + dropdownRect.width + margin > viewportWidth) {
                setDropdownLeft(true);
            } else {
                setDropdownLeft(false);
            }
        }
    }, [profileMenuOpen, isMobile]);
    // Fix themeObj to be the actual theme object, not a state tuple
    const themeObj = theme === "dark" ? DARK_THEME : LIGHT_THEME;

    // Original nav button style
    const navBtn = (path) => ({
        margin: "0 1rem",
        padding: "0.5rem 1.2rem",
        background:
            location.pathname === path
                ? themeObj.accent
                : themeObj.name === "dark"
                ? themeObj.surface
                : "#fff",
        color:
            location.pathname === path
                ? "#fff"
                : themeObj.name === "dark"
                ? themeObj.text
                : "#b71c1c",
        border:
            location.pathname === path
                ? `2px solid ${themeObj.accent}`
                : `2px solid ${themeObj.accent}`,
        boxShadow:
            location.pathname === path
                ? `0 0 0 2px ${themeObj.accent}`
                : "none",
        borderRadius: "6px",
        fontWeight: 600,
        fontSize: 16,
        cursor: "pointer",
        transition: "all 0.2s",
        outline: "none",
        display: "flex",
        alignItems: "center",
        gap: 8,
    });
    const navGridStyle = {
        display: "flex",
        flexWrap: isMobile ? "wrap" : "nowrap",
        justifyContent: "flex-start",
        gap: 16,
        maxWidth: isMobile ? "100%" : 600,
        width: isMobile ? "100%" : undefined,
        marginLeft: isTablet ? 0 : -24, // shift left for tablet and mobile
        paddingLeft: isTablet ? -16 : 0, // add left padding for tablet and mobile
        paddingRight: isTablet ? 24 : 0,
        boxSizing: "border-box",
    };
    const navBtnWrapStyle = {
        flex: isMobile ? "1 1 45%" : "0 0 auto",
        minWidth: isMobile ? 140 : 0,
        display: "flex",
        justifyContent: "center",
        marginBottom: isMobile ? 12 : 0,
    };

    return (
        <div
            style={{
                width: "100vw",
                minHeight: "100vh",
                background: themeObj.background,
                color: themeObj.text,
                display: "flex",
                flexDirection: "column",
                fontFamily: "Segoe UI, Arial, sans-serif",
                overflowX: "hidden",
            }}
        >
            <header
                className="app-header"
                style={{
                    width: "100%",
                    background:
                        themeObj.name === "dark"
                            ? "linear-gradient(90deg, #7b1f24 0%, #b71c1c 100%)"
                            : "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
                    color: "#fff",
                    padding: isMobile ? "1.2rem 0.5rem" : "1.5rem 2rem",
                    textAlign: "center",
                    borderRadius: "0 0 18px 18px",
                    boxShadow: themeObj.shadow,
                    marginBottom: 24,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        paddingLeft: 8, // restore original padding
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                            src={reportProLogo}
                            alt="ReportPro Logo"
                            className="app-logo"
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 18,
                                verticalAlign: "middle",
                                boxShadow: "0 2px 8px #e5393522",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/dashboard")}
                        />
                        <h1
                            className="app-title"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                fontSize: isMobile ? 32 : 44,
                                fontWeight: 800,
                                letterSpacing: 1,
                                margin: 0,
                                marginLeft: 20,
                                fontFamily: "Segoe UI, Arial, sans-serif",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/dashboard")}
                        >
                            <span className="app-title-text">Report Pro</span>
                        </h1>
                    </div>
                    <div style={{ flex: 1 }} />
                    <div
                        className="header-actions"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 18,
                            position: "relative",
                            paddingRight: 88,
                        }}
                    >
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                        <span
                            onClick={() => setProfileMenuOpen((v) => !v)}
                            aria-label="Profile menu"
                            tabIndex={0}
                            ref={profileBtnRef}
                            className="profile-avatar-btn"
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
                                boxShadow: "0 2px 8px #e5393533",
                                border: "none",
                                outline: "none",
                                transition: "box-shadow 0.2s",
                            }}
                        >
                            {user?.name ? (
                                (() => {
                                    const parts = user.name.trim().split(" ");
                                    if (parts.length === 1) return parts[0][0];
                                    return (
                                        parts[0][0] + parts[parts.length - 1][0]
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
                                style={{
                                    position: "absolute",
                                    top: 54,
                                    right:
                                        !isMobile && !dropdownLeft ? 0 : "auto",
                                    left:
                                        !isMobile && dropdownLeft
                                            ? -60
                                            : isMobile
                                            ? "50%"
                                            : "auto",
                                    transform: isMobile
                                        ? "translateX(-80%)"
                                        : !isMobile && dropdownLeft
                                        ? "none"
                                        : "none",
                                    background: "#fff",
                                    color: "#b71c1c",
                                    borderRadius: 12,
                                    boxShadow: "0 4px 24px #e5393533",
                                    minWidth: 160,
                                    zIndex: 100,
                                    padding: "0.5rem 0",
                                    display: "flex",
                                    flexDirection: "column",
                                    marginRight:
                                        !isMobile && !dropdownLeft ? 16 : 0,
                                    marginLeft:
                                        !isMobile && dropdownLeft ? 16 : 0,
                                }}
                            >
                                <button
                                    className="profile-dropdown-btn"
                                    onClick={() => {
                                        setShowProfile(true);
                                        setProfileMenuOpen(false);
                                    }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#b71c1c",
                                        fontSize: 16,
                                        fontWeight: 600,
                                        textAlign: "left",
                                        padding: "12px 20px",
                                        cursor: "pointer",
                                        borderRadius: 8,
                                        transition: "background 0.15s",
                                    }}
                                >
                                    Edit Profile
                                </button>
                                <button
                                    className="profile-dropdown-btn"
                                    onClick={onLogout}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#b71c1c",
                                        fontSize: 16,
                                        fontWeight: 600,
                                        textAlign: "left",
                                        padding: "12px 20px",
                                        cursor: "pointer",
                                        borderRadius: 8,
                                        transition: "background 0.15s",
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* nav grid below */}
                <nav
                    style={{
                        marginTop: isMobile ? "1rem" : "1.5rem",
                        display: "flex",
                        justifyContent: "flex-start",
                    }}
                >
                    <div className="nav-grid" style={navGridStyle}>
                        <div className="nav-btn-wrap" style={navBtnWrapStyle}>
                            <button
                                className="nav-btn"
                                onClick={() => navigate("/dashboard/markEntry")}
                                style={navBtn("/dashboard/markEntry")}
                            >
                                <span style={{ marginRight: 8 }}>
                                    <MdEdit />
                                </span>
                                Enter Marks
                            </button>
                        </div>
                        <div className="nav-btn-wrap" style={navBtnWrapStyle}>
                            <button
                                className="nav-btn"
                                onClick={() => navigate("/dashboard/results")}
                                style={navBtn("/dashboard/results")}
                            >
                                <span style={{ marginRight: 8 }}>
                                    <MdListAlt />
                                </span>
                                View Results
                            </button>
                        </div>
                        <div className="nav-btn-wrap" style={navBtnWrapStyle}>
                            <button
                                className="nav-btn"
                                onClick={() =>
                                    navigate("/dashboard/statistics")
                                }
                                style={navBtn("/dashboard/statistics")}
                            >
                                <span style={{ marginRight: 8 }}>
                                    <MdBarChart />
                                </span>
                                Statistics
                            </button>
                        </div>
                        <div className="nav-btn-wrap" style={navBtnWrapStyle}>
                            <button
                                className="nav-btn"
                                onClick={() => navigate("/dashboard/admission")}
                                style={navBtn("/dashboard/admission")}
                            >
                                <span style={{ marginRight: 8 }}>
                                    <MdSchool />
                                </span>
                                Admission Details
                            </button>
                        </div>
                    </div>
                </nav>
            </header>
            <main
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: isMobile ? "1rem 0.5rem" : "2rem",
                    boxSizing: "border-box",
                }}
            >
                <Outlet />
            </main>
            {showProfile && (
                <ProfileModal
                    token={user?.token}
                    onClose={() => setShowProfile(false)}
                    onProfileUpdate={onProfileUpdate}
                    profilePicture={user?.profilePicture}
                    theme={themeObj}
                />
            )}
            <Footer theme={themeObj} style={{ width: "100%" }} />
            <style>{`
@media (max-width: 700px) {
    .header-actions {
        position: absolute !important;
        top: 38px !important;
        right: 18px !important;
        padding-right: 0 !important;
        gap: 10px !important;
    }
}
`}</style>
        </div>
    );
}

export default DashboardLayout;
