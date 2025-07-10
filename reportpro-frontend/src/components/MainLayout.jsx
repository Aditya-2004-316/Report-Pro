import React from "react";
import Footer from "./Footer";
import reportProLogo from "../assets/report-pro-logo.png";
import { useNavigate } from "react-router-dom";

function MainLayout({
    children,
    theme,
    user,
    setTheme,
    onLogout,
    onEditProfile,
}) {
    const navigate = useNavigate();
    const isMobile = window.innerWidth < 600;
    const themeObj = theme;
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
                        justifyContent: "space-between",
                        maxWidth: 1400,
                        margin: "0 auto",
                        position: "relative",
                    }}
                >
                    <h1
                        className="app-title"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: isMobile ? 32 : 44,
                            fontWeight: 800,
                            letterSpacing: 1,
                            margin: 0,
                            fontFamily: "Segoe UI, Arial, sans-serif",
                            cursor: "pointer",
                        }}
                        onClick={() => navigate("/dashboard")}
                    >
                        <img
                            src={reportProLogo}
                            alt="ReportPro Logo"
                            className="app-logo"
                            style={{
                                width: 80,
                                height: 80,
                                marginRight: 28,
                                borderRadius: 18,
                                verticalAlign: "middle",
                                boxShadow: "0 2px 8px #e5393522",
                            }}
                        />
                        <span className="app-title-text">Report Pro</span>
                    </h1>
                    {/* Add more header content if needed */}
                </div>
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
                {children}
            </main>
            <Footer theme={themeObj} style={{ width: "100%" }} />
        </div>
    );
}

export default MainLayout;
