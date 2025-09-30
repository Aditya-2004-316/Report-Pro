import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExportDataModal from "./ExportDataModal";
import Settings from "./Settings";
import PreviousYearsModal from "./PreviousYearsModal";

function Footer({
    theme,
    session,
    lastUpdated,
    isConnected = true,
    onExportData,
}) {
    // Responsive state for mobile detection
    const [isMobile, setIsMobile] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showPreviousYearsModal, setShowPreviousYearsModal] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const navigate = useNavigate();

    // Fix: Use a gradient directly for light mode, solid color for dark mode
    const isDark = theme.name === "dark";
    const footerStyle = {
        background: isDark
            ? theme.background
            : "linear-gradient(135deg, #fff 0%, #ffeaea 100%)",
        borderTop: `2px solid ${theme.border}`,
        padding: "3rem 2rem 2rem 2rem",
        marginTop: "auto",
        color: theme.textSecondary,
        position: "relative",
        overflow: "hidden",
        width: "100%",
        boxSizing: "border-box",
    };

    const footerOverlayStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(45deg, ${theme.accent}05 0%, transparent 50%, ${theme.accent}03 100%)`,
        pointerEvents: "none",
    };

    const footerContentStyle = {
        maxWidth: "1400px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
        width: "100%",
        boxSizing: "border-box",
    };

    const footerMainStyle = {
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
        gridTemplateAreas: '"brand links status academic"',
        gap: "3rem",
        marginBottom: "2.5rem",
        alignItems: "start",
        width: "100%",
        boxSizing: "border-box",
    };

    const footerBrandStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        minWidth: 0, // Allow shrinking
    };

    const brandTitleStyle = {
        color: "#e53935",
        fontWeight: "800",
        fontSize: "24px",
        margin: 0,
        letterSpacing: "1px",
        wordBreak: "break-word",
        lineHeight: "1.2",
    };

    const brandSubtitleStyle = {
        color: theme.textSecondary,
        fontSize: "16px",
        fontWeight: "500",
        margin: 0,
        lineHeight: "1.6",
        wordBreak: "break-word",
        overflowWrap: "break-word",
    };

    const brandFeaturesStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: "0.8rem",
        marginTop: "0.5rem",
    };

    const featureTagStyle = {
        background: `${theme.accent}15`,
        color: theme.accent,
        padding: "0.4rem 0.8rem",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        border: `1px solid ${theme.accent}30`,
        whiteSpace: "nowrap",
        flexShrink: 0,
    };

    const footerSectionStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        minWidth: 0, // Allow shrinking
    };

    const sectionTitleStyle = {
        color: theme.text,
        fontWeight: "700",
        fontSize: "16px",
        margin: 0,
        marginBottom: "0.5rem",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        position: "relative",
        wordBreak: "break-word",
        lineHeight: "1.3",
    };

    const sectionTitleUnderlineStyle = {
        position: "absolute",
        bottom: "-4px",
        left: 0,
        width: "30px",
        height: "2px",
        background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentHover} 100%)`,
        borderRadius: "1px",
    };

    // Responsive styles for links and status items
    const mobileCenter = isMobile
        ? {
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
          }
        : {};

    const footerLinkStyle = {
        color: theme.textSecondary,
        textDecoration: "none",
        fontSize: "14px",
        transition: "all 0.3s ease",
        cursor: "pointer",
        display: "flex",
        alignItems: isMobile ? "center" : "center",
        gap: "0.5rem",
        padding: "0.3rem 0",
        borderRadius: "4px",
        position: "relative",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        lineHeight: "1.4",
        justifyContent: isMobile ? "center" : undefined,
        textAlign: isMobile ? "center" : undefined,
        ...mobileCenter,
    };

    const footerLinkHoverStyle = {
        color: theme.accent,
        transform: "translateX(4px)",
    };

    const statusContainerStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "0.8rem",
    };

    const statusItemStyle = {
        display: "flex",
        alignItems: isMobile ? "center" : "flex-start",
        gap: "0.8rem",
        fontSize: "14px",
        padding: "0.5rem 0",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        lineHeight: "1.4",
        justifyContent: isMobile ? "center" : undefined,
        flexDirection: isMobile ? "row" : undefined,
        textAlign: isMobile ? "center" : undefined,
        ...mobileCenter,
    };

    const statusDotStyle = {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: isConnected
            ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
            : "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
        boxShadow: isConnected ? "0 0 8px #4caf5040" : "0 0 8px #f4433640",
        position: "relative",
        flexShrink: 0,
        marginTop: "2px",
    };

    const statusDotPulseStyle = {
        position: "absolute",
        top: "-2px",
        left: "-2px",
        right: "-2px",
        bottom: "-2px",
        borderRadius: "50%",
        background: isConnected ? "#4caf50" : "#f44336",
        opacity: 0.3,
        animation: "pulse 2s infinite",
    };

    const statusTextStyle = {
        fontSize: "13px",
        flex: 1,
        minWidth: 0,
        wordBreak: "break-word",
        overflowWrap: "break-word",
        textAlign: isMobile ? "center" : undefined,
        ...mobileCenter,
    };

    const footerBottomStyle = {
        borderTop: `1px solid ${theme.border}`,
        paddingTop: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        width: "100%",
        boxSizing: "border-box",
    };

    const copyrightStyle = {
        color: theme.textSecondary,
        fontSize: "14px",
        fontWeight: "500",
        margin: 0,
        wordBreak: "break-word",
        overflowWrap: "break-word",
        lineHeight: "1.4",
    };

    const footerActionsStyle = {
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        flexWrap: "wrap",
    };

    const actionButtonStyle = {
        background: "none",
        border: `1px solid ${theme.border}`,
        color: theme.textSecondary,
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s ease",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        whiteSpace: "nowrap",
        flexShrink: 0,
    };

    const actionButtonHoverStyle = {
        background: theme.accent,
        borderColor: theme.accent,
        color: "#fff",
        transform: "translateY(-1px)",
        boxShadow: `0 4px 12px ${theme.accent}40`,
    };

    return (
        <footer style={footerStyle} className="footer">
            {/* Decorative overlay */}
            <div style={footerOverlayStyle}></div>

            <div style={footerContentStyle}>
                {/* Main footer content */}
                <div style={footerMainStyle} className="footer-main">
                    {/* Brand section */}
                    <div
                        style={{ ...footerBrandStyle, gridArea: "brand" }}
                        className="footer-brand"
                    >
                        <h3 style={brandTitleStyle} className="brand-title">
                            Report Pro
                        </h3>
                        <p
                            style={brandSubtitleStyle}
                            className="brand-subtitle"
                        >
                            Advanced Student Result Management System designed
                            for modern educational institutions. Streamline your
                            academic processes with our comprehensive solution.
                        </p>
                        <div
                            style={brandFeaturesStyle}
                            className="brand-features"
                        >
                            <span
                                style={featureTagStyle}
                                className="feature-tag"
                            >
                                Secure
                            </span>
                            <span
                                style={featureTagStyle}
                                className="feature-tag"
                            >
                                Reliable
                            </span>
                            <span
                                style={featureTagStyle}
                                className="feature-tag"
                            >
                                User-Friendly
                            </span>
                            <span
                                style={featureTagStyle}
                                className="feature-tag"
                            >
                                Real-time
                            </span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div
                        style={{ ...footerSectionStyle, gridArea: "links" }}
                        className="footer-section"
                    >
                        <h4 style={sectionTitleStyle} className="section-title">
                            Quick Links
                            <div style={sectionTitleUnderlineStyle}></div>
                        </h4>
                        <Link
                            to="/dashboard/help"
                            style={footerLinkStyle}
                            className="footer-link"
                            onMouseEnter={(e) => {
                                Object.assign(
                                    e.target.style,
                                    footerLinkHoverStyle
                                );
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = theme.textSecondary;
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            <span>📚</span> Help & Support
                        </Link>
                        <Link
                            to="/dashboard/contact"
                            style={footerLinkStyle}
                            className="footer-link"
                            onMouseEnter={(e) => {
                                Object.assign(
                                    e.target.style,
                                    footerLinkHoverStyle
                                );
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = theme.textSecondary;
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            <span>📧</span> Contact Us
                        </Link>
                        <Link
                            to="/dashboard/privacy"
                            style={footerLinkStyle}
                            className="footer-link"
                            onMouseEnter={(e) => {
                                Object.assign(
                                    e.target.style,
                                    footerLinkHoverStyle
                                );
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = theme.textSecondary;
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            <span>🔒</span> Privacy Policy
                        </Link>
                        <Link
                            to="/dashboard/terms"
                            style={footerLinkStyle}
                            className="footer-link"
                            onMouseEnter={(e) => {
                                Object.assign(
                                    e.target.style,
                                    footerLinkHoverStyle
                                );
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = theme.textSecondary;
                                e.target.style.transform = "translateX(0)";
                            }}
                        >
                            <span>📄</span> Terms of Service
                        </Link>
                    </div>

                    {/* System Status */}
                    <div
                        style={{ ...footerSectionStyle, gridArea: "status" }}
                        className="footer-section"
                    >
                        <h4 style={sectionTitleStyle} className="section-title">
                            System Status
                            <div style={sectionTitleUnderlineStyle}></div>
                        </h4>
                        <div style={statusContainerStyle}>
                            <div
                                style={statusItemStyle}
                                className="status-item"
                            >
                                <div style={statusDotStyle}>
                                    <div style={statusDotPulseStyle}></div>
                                </div>
                                <span
                                    style={statusTextStyle}
                                    className="status-text"
                                >
                                    Backend:{" "}
                                    {isConnected ? "Connected" : "Disconnected"}
                                </span>
                            </div>
                            {lastUpdated && (
                                <div
                                    style={statusItemStyle}
                                    className="status-item"
                                >
                                    <span style={{ flexShrink: 0 }}>🕒</span>
                                    <span
                                        style={statusTextStyle}
                                        className="status-text"
                                    >
                                        Updated:{" "}
                                        {lastUpdated.toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            <div
                                style={statusItemStyle}
                                className="status-item"
                            >
                                <span style={{ flexShrink: 0 }}>🌐</span>
                                <span
                                    style={statusTextStyle}
                                    className="status-text"
                                >
                                    {navigator.userAgent.includes("Chrome")
                                        ? "Chrome"
                                        : navigator.userAgent.includes(
                                              "Firefox"
                                          )
                                        ? "Firefox"
                                        : navigator.userAgent.includes("Safari")
                                        ? "Safari"
                                        : "Other"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Updates */}
                    <div
                        style={{ ...footerSectionStyle, gridArea: "academic" }}
                        className="footer-section"
                    >
                        <h4 style={sectionTitleStyle} className="section-title">
                            Recent Updates
                            <div style={sectionTitleUnderlineStyle}></div>
                        </h4>
                        <ul
                            style={{
                                fontSize: "13px",
                                color: theme.textSecondary,
                                lineHeight: 1.6,
                                margin: 0,
                                paddingLeft: 8,
                                listStyle: isMobile ? "none" : "disc inside",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                minHeight: 110,
                                maxHeight: 110,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                gap: 10,
                                marginTop: 52,
                                ...(isMobile
                                    ? {
                                          alignItems: "center",
                                          textAlign: "center",
                                          width: "100%",
                                      }
                                    : {}),
                            }}
                        >
                            <li
                                style={{
                                    marginBottom: 10,
                                    display: isMobile ? "flex" : undefined,
                                    alignItems: isMobile ? "center" : undefined,
                                    justifyContent: isMobile
                                        ? "center"
                                        : undefined,
                                    width: isMobile ? "100%" : undefined,
                                }}
                            >
                                {isMobile && (
                                    <span
                                        style={{ marginRight: 8, fontSize: 18 }}
                                    >
                                        •
                                    </span>
                                )}
                                <span>CSV export feature</span>
                            </li>
                            <li
                                style={{
                                    marginBottom: 10,
                                    display: isMobile ? "flex" : undefined,
                                    alignItems: isMobile ? "center" : undefined,
                                    justifyContent: isMobile
                                        ? "center"
                                        : undefined,
                                    width: isMobile ? "100%" : undefined,
                                }}
                            >
                                {isMobile && (
                                    <span
                                        style={{ marginRight: 8, fontSize: 18 }}
                                    >
                                        •
                                    </span>
                                )}
                                <span>Dark mode added</span>
                            </li>
                            <li
                                style={{
                                    marginBottom: 10,
                                    display: isMobile ? "flex" : undefined,
                                    alignItems: isMobile ? "center" : undefined,
                                    justifyContent: isMobile
                                        ? "center"
                                        : undefined,
                                    width: isMobile ? "100%" : undefined,
                                }}
                            >
                                {isMobile && (
                                    <span
                                        style={{ marginRight: 8, fontSize: 18 }}
                                    >
                                        •
                                    </span>
                                )}
                                <span>Stats dashboard upgrade</span>
                            </li>
                            <li
                                style={{
                                    marginBottom: 10,
                                    display: isMobile ? "flex" : undefined,
                                    alignItems: isMobile ? "center" : undefined,
                                    justifyContent: isMobile
                                        ? "center"
                                        : undefined,
                                    width: isMobile ? "100%" : undefined,
                                }}
                            >
                                {isMobile && (
                                    <span
                                        style={{ marginRight: 8, fontSize: 18 }}
                                    >
                                        •
                                    </span>
                                )}
                                <span>Performance fixes</span>
                            </li>
                            {/* Padding for equal height if fewer updates */}
                            <li style={{ visibility: "hidden" }}>-</li>
                            <li style={{ visibility: "hidden" }}>-</li>
                        </ul>
                    </div>
                </div>

                {/* Footer bottom */}
                <div style={footerBottomStyle} className="footer-bottom">
                    <p style={copyrightStyle} className="copyright">
                        © {new Date().getFullYear()} Report Pro. All rights
                        reserved. | Version 1.0.0
                    </p>
                    <div style={footerActionsStyle} className="footer-actions">
                        <button
                            style={actionButtonStyle}
                            className="action-button"
                            onMouseEnter={(e) => {
                                Object.assign(
                                    e.target.style,
                                    actionButtonHoverStyle
                                );
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "none";
                                e.target.style.borderColor = theme.border;
                                e.target.style.color = theme.textSecondary;
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                            }}
                            onClick={() => setShowPreviousYearsModal(true)}
                        >
                            <span role="img" aria-label="Previous Years">
                                📚
                            </span>{" "}
                            Previous Years
                        </button>
                        <button
                            style={actionButtonStyle}
                            className="action-button"
                            onMouseEnter={(e) => {
                                Object.assign(
                                    e.target.style,
                                    actionButtonHoverStyle
                                );
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "none";
                                e.target.style.borderColor = theme.border;
                                e.target.style.color = theme.textSecondary;
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                            }}
                            onClick={() => setShowExportModal(true)}
                        >
                            <span role="img" aria-label="Export Data">
                                📋
                            </span>{" "}
                            Export Data
                        </button>
                        <button
                            style={actionButtonStyle}
                            className="action-button"
                            onMouseEnter={(e) => {
                                Object.assign(
                                    e.target.style,
                                    actionButtonHoverStyle
                                );
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "none";
                                e.target.style.borderColor = theme.border;
                                e.target.style.color = theme.textSecondary;
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                            }}
                            onClick={() => navigate("/dashboard/settings")}
                        >
                            <span>⚙️</span> Settings
                        </button>
                    </div>
                </div>
            </div>

            {showPreviousYearsModal && (
                <PreviousYearsModal
                    open={showPreviousYearsModal}
                    onClose={() => setShowPreviousYearsModal(false)}
                    theme={theme}
                    session={session}
                />
            )}

            {showExportModal && (
                <ExportDataModal
                    open={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    theme={theme}
                    session={session}
                    selectedClass="9th"
                    selectedExamType="Monthly Test"
                />
            )}

            {/* Responsive Styles */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.2); opacity: 0.1; }
                    100% { transform: scale(1); opacity: 0.3; }
                }
                /* Desktop: 4 columns */
                .footer-main {
                    display: grid !important;
                    grid-template-columns: 1.5fr 1fr 1fr 1fr !important;
                    grid-template-areas: 'brand links status academic' !important;
                    gap: 3rem !important;
                    text-align: left !important;
                }
                .footer-brand { grid-area: brand !important; align-items: flex-start !important; }
                .footer-section[style*='grid-area: links'] { grid-area: links !important; align-items: flex-start !important; }
                .footer-section[style*='grid-area: status'] { grid-area: status !important; align-items: flex-start !important; }
                .footer-section[style*='grid-area: academic'] { grid-area: academic !important; align-items: flex-start !important; }
                /* Medium: 2x2 grid */
                @media (max-width: 1199px) and (min-width: 768px) {
                    .footer-main {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        grid-template-areas:
                            'brand links'
                            'status academic' !important;
                        gap: 2.5rem !important;
                        text-align: center !important;
                    }
                    .footer-brand { grid-area: brand !important; align-items: center !important; }
                    .footer-section[style*='grid-area: links'] { grid-area: links !important; align-items: center !important; }
                    .footer-section[style*='grid-area: status'] { grid-area: status !important; align-items: center !important; }
                    .footer-section[style*='grid-area: academic'] { grid-area: academic !important; align-items: center !important; }
                    .section-title {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        text-align: center !important;
                        justify-content: center !important;
                    }
                    .section-title > div {
                        margin: 0 auto !important;
                        left: unset !important;
                        right: unset !important;
                    }
                    .footer-section .footer-link,
                    .footer-section .status-item,
                    .footer-section .status-text {
                        justify-content: center !important;
                        align-items: center !important;
                        text-align: center !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
                    .footer-section .status-item {
                        flex-direction: row !important;
                    }
                }
                /* Mobile: stacked */
                @media (max-width: 767px) {
                    .footer-main {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 1.2rem !important;
                        width: 100% !important;
                    }
                    .footer-brand, .footer-section {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        text-align: center !important;
                        width: 100% !important;
                    }
                    .footer-section[style*='grid-area: status'] {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        text-align: center !important;
                    }
                    .footer-section[style*='grid-area: academic'] .section-title {
                        text-align: center !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
                    .footer-section[style*='grid-area: links'] {
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: center !important;
                        align-items: center !important;
                        min-height: 180px !important;
                    }
                    .footer-section {
                        padding-top: 1.2rem !important;
                        padding-bottom: 0.8rem !important;
                        border-top: 1px solid #e5e5e5 !important;
                    }
                    .footer-section:first-child {
                        border-top: none !important;
                        padding-top: 0 !important;
                    }
                    .section-title {
                        font-size: 15px !important;
                        margin-bottom: 0.3rem !important;
                        margin-top: 0 !important;
                        padding-bottom: 0.1rem !important;
                    }
                    .section-title > div {
                        margin: 0.2rem auto 0 auto !important;
                        left: unset !important;
                        right: unset !important;
                    }
                    .footer-section .footer-link,
                    .footer-section .status-item,
                    .footer-section .status-text {
                        text-align: center !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                        justify-content: center !important;
                        align-items: center !important;
                        gap: 0.4rem !important;
                    }
                    .footer-section .footer-link {
                        display: flex !important;
                        flex-direction: row !important;
                        font-size: 14px !important;
                        padding: 0.2rem 0 !important;
                    }
                    .footer-section .status-item {
                        display: flex !important;
                        flex-direction: row !important;
                        font-size: 13px !important;
                        padding: 0.2rem 0 !important;
                    }
                    .footer-section .status-text {
                        font-size: 13px !important;
                    }
                    .footer-section .feature-tag {
                        margin-bottom: 0.2rem !important;
                    }
                    .footer-bottom {
                        flex-direction: column !important;
                        align-items: center !important;
                        text-align: center !important;
                        gap: 0.5rem !important;
                        margin-top: 0.5rem !important;
                    }
                    .footer-actions {
                        justify-content: center !important;
                        gap: 0.5rem !important;
                    }
                }
                /* Small screens: tighter spacing */
                @media (max-width: 480px) {
                    .footer-main { gap: 1.2rem !important; }
                }
                /* Section titles always bold and spaced */
                .section-title {
                    font-weight: 700 !important;
                    margin-bottom: 0.5rem !important;
                    font-size: 16px !important;
                    letter-spacing: 0.5px !important;
                }
                .footer-link, .footer-link:visited, .footer-link:active {
                    color: #888;
                    transition: color 0.3s, transform 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 0.7rem;
                }
                .footer-link span:first-child {
                    display: flex;
                    align-items: center;
                    font-size: 1.15em;
                    min-width: 1.5em;
                    justify-content: center;
                }
                .footer-link:hover {
                    color: #e53935;
                    transform: translateX(4px);
                }
            `}</style>
        </footer>
    );
}

export default Footer;
