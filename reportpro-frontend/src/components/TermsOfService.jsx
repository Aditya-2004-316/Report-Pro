import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { MdGavel, MdInfo, MdSecurity, MdUpdate, MdMail } from "react-icons/md";

const TermsOfService = ({ theme }) => {
    const accentGradient =
        theme.name === "dark"
            ? `linear-gradient(135deg, ${theme.surface} 0%, #2c3136 100%)`
            : `linear-gradient(135deg, #fff 0%, #fff0f0 100%)`;

    const cardStyle = {
        background: theme.surface,
        color: theme.text,
        borderRadius: 14,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
    };

    const sectionCardStyle = {
        ...cardStyle,
        padding: 20,
    };

    const anchorStyle = {
        color: theme.accent,
        textDecoration: "none",
        fontWeight: 600,
    };

    const actionButtonStyle = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 15,
        textDecoration: "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        whiteSpace: "nowrap",
    };

    const heroHighlights = useMemo(
        () => [
            {
                label: "Secure records",
                description: "Data encrypted in transit & rest",
            },
            {
                label: "Role-based access",
                description: "Granular permissions for staff",
            },
            {
                label: "Compliance",
                description: "Aligned with local education laws",
            },
        ],
        []
    );

    const highlightCardWidth = useMemo(() => {
        const longest = heroHighlights.reduce((max, item) => {
            const labelLen = item.label.length;
            const descLen = item.description.length;
            return Math.max(max, labelLen, descLen);
        }, 0);
        return Math.min(240, Math.max(160, longest * 7));
    }, [heroHighlights]);

    const lastUpdatedText = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const sections = useMemo(
        () => [
            {
                id: "acceptance",
                title: "Acceptance of Terms",
                icon: <MdGavel color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        By accessing or using Report Pro ("the Service"), you
                        agree to be bound by these Terms of Service. If you do
                        not agree, please do not use the Service.
                    </p>
                ),
            },
            {
                id: "use",
                title: "Use of the Service",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        <li>
                            You must provide accurate information during
                            registration.
                        </li>
                        <li>
                            You are responsible for maintaining the
                            confidentiality of your account.
                        </li>
                        <li>
                            You agree not to misuse the Service or attempt
                            unauthorized access.
                        </li>
                    </ul>
                ),
            },
            {
                id: "ip",
                title: "Intellectual Property",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        All content, trademarks, and data on the Service are the
                        property of Report Pro or its licensors. You may not
                        reproduce or distribute any part of the Service without
                        permission.
                    </p>
                ),
            },
            {
                id: "user-content",
                title: "User Content",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        You retain ownership of content you submit, but grant us
                        a license to use it for operating and improving the
                        Service.
                    </p>
                ),
            },
            {
                id: "termination",
                title: "Termination",
                icon: <MdSecurity color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        We reserve the right to suspend or terminate your access
                        for violations of these Terms or for any reason at our
                        discretion.
                    </p>
                ),
            },
            {
                id: "disclaimer",
                title: "Disclaimer & Limitation of Liability",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        The Service is provided "as is" without warranties. We
                        are not liable for any damages arising from your use of
                        the Service.
                    </p>
                ),
            },
            {
                id: "changes",
                title: "Changes to Terms",
                icon: <MdUpdate color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        We may update these Terms from time to time. Continued
                        use of the Service constitutes acceptance of the new
                        Terms.
                    </p>
                ),
            },
            {
                id: "law",
                title: "Governing Law",
                icon: <MdGavel color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        These Terms are governed by the laws of your
                        jurisdiction.
                    </p>
                ),
            },
            {
                id: "contact",
                title: "Contact",
                icon: <MdMail color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        For questions about these Terms, please contact us via
                        the Contact Us page or at{" "}
                        <a
                            href="mailto:support@reportpro.com"
                            style={{ color: theme.accent }}
                        >
                            support@reportpro.com
                        </a>
                        .
                    </p>
                ),
            },
        ],
        [theme.accent]
    );

    const sectionTitle = (title, icon) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {icon}
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>
                {title}
            </h3>
        </div>
    );

    return (
        <>
            {/* Responsive styles for Terms of Service page */}
            <style>{`
                /* Critical fix for the 730px overflow issue */
                .terms-service-container {
                    max-width: 1100px !important;
                    width: 100% !important;
                }

                .terms-service-content-grid {
                    display: grid !important;
                    gap: 20px !important;
                    margin-top: 24px !important;
                }

                .terms-service-toc {
                    position: sticky;
                    top: 96px;
                    align-self: flex-start;
                }

                .terms-service-hero-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-top: 18px;
                }

                .terms-service-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    align-self: flex-start;
                }

                .terms-service-sections {
                    display: grid;
                    gap: 18px;
                }

                @media (min-width: 992px) {
                    .terms-service-content-grid {
                        grid-template-columns: minmax(240px, 280px) minmax(0, 1fr) !important;
                        align-items: start !important;
                    }
                    .terms-service-sections {
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    }
                }

                @media (max-width: 730px) {
                    .terms-service-container {
                        max-width: 98vw !important;
                        padding: 1.3rem !important;
                        margin: 1rem auto !important;
                        box-sizing: border-box !important;
                        overflow-x: hidden !important;
                    }
                    .terms-service-content-grid {
                        grid-template-columns: 1fr !important;
                        gap: 14px !important;
                    }
                    .terms-service-toc {
                        padding: 14px !important;
                    }
                    .terms-service-section {
                        padding: 14px !important;
                    }
                    /* Ensure all elements stay within container */
                    .terms-service-container,
                    .terms-service-container *,
                    .terms-service-container *::before,
                    .terms-service-container *::after {
                        box-sizing: border-box !important;
                        max-width: 100% !important;
                    }
                }

                /* Tablets and large phones (600px to 767px) */
                @media (min-width: 600px) and (max-width: 767px) {
                    .terms-service-container {
                        max-width: 98vw !important;
                        padding: 1.2rem !important;
                        border-radius: 14px !important;
                        margin: 1rem auto !important;
                        overflow-x: hidden !important;
                    }
                    .terms-service-content-grid {
                        gap: 14px !important;
                    }
                }

                /* Small phones (480px to 599px) */
                @media (min-width: 480px) and (max-width: 599px) {
                    .terms-service-container {
                        padding: 1rem !important;
                        border-radius: 12px !important;
                        margin: 0.8rem auto !important;
                        overflow-x: hidden !important;
                    }
                    .terms-service-toc {
                        padding: 12px !important;
                    }
                    .terms-service-section {
                        padding: 12px !important;
                    }
                }

                /* Extra small phones (360px and below) */
                @media (max-width: 360px) {
                    .terms-service-container {
                        padding: 0.8rem !important;
                        margin: 0.5rem auto !important;
                        overflow-x: hidden !important;
                    }
                }

                /* Landscape orientation on phones */
                @media (max-height: 500px) and (orientation: landscape) {
                    .terms-service-container {
                        margin: 0.5rem auto !important;
                        padding: 1rem !important;
                        overflow-x: hidden !important;
                    }
                }

                /* Ensure no horizontal overflow on any screen size */
                .terms-service-container {
                    max-width: 100% !important;
                    overflow-x: hidden !important;
                    box-sizing: border-box !important;
                }
            `}</style>

            <div
                className="terms-service-container"
                style={{
                    margin: "2.5rem auto",
                    padding: "0 1.25rem 2rem",
                }}
            >
                {/* Hero */}
                <div
                    style={{
                        ...cardStyle,
                        padding: "2rem",
                        background: accentGradient,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 20,
                            alignItems: "stretch",
                        }}
                    >
                        <div style={{ flex: "1 1 260px" }}>
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "6px 14px",
                                    borderRadius: 999,
                                    background:
                                        theme.name === "dark"
                                            ? "#232526"
                                            : "#ffe4e4",
                                    color: theme.accent,
                                    fontWeight: 700,
                                    border: `1px solid ${theme.border}`,
                                }}
                            >
                                <MdGavel /> Legal
                            </span>
                            <h2
                                style={{
                                    marginTop: 14,
                                    marginBottom: 10,
                                    fontSize: 30,
                                    fontWeight: 900,
                                    color: theme.text,
                                }}
                            >
                                Terms of Service
                            </h2>
                            <p
                                style={{
                                    marginTop: 0,
                                    marginBottom: 18,
                                    color: theme.textSecondary,
                                    lineHeight: 1.6,
                                }}
                            >
                                Understand the policies that keep Report Pro secure,
                                reliable, and fair for every educator and student in
                                your network.
                            </p>
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 12,
                                    color: theme.textSecondary,
                                    fontSize: 14,
                                }}
                            >
                                <span style={{ fontWeight: 600 }}>
                                    Last updated: {lastUpdatedText}
                                </span>
                                <span style={{ opacity: 0.8 }}>
                                    Review every semester
                                </span>
                            </div>
                        </div>
                        <div
                            style={{
                                flex: "1 1 260px",
                                minWidth: 240,
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                alignItems: "flex-end",
                                justifyContent: "flex-start",
                                marginBottom: 0,
                            }}
                        >
                            {heroHighlights.map((item) => (
                                <div
                                    key={item.label}
                                    style={{
                                        width: highlightCardWidth,
                                        background:
                                            theme.name === "dark"
                                                ? "rgba(255,255,255,0.04)"
                                                : "rgba(229,57,53,0.08)",
                                        borderRadius: 12,
                                        padding: "12px 16px",
                                        border: `1px solid ${theme.border}`,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        textAlign: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            color: theme.text,
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                    <div style={{ color: theme.textSecondary, fontSize: 13 }}>
                                        {item.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div
                            className="terms-service-hero-actions"
                            style={{
                                flexBasis: "100%",
                            }}
                        >
                            <Link
                                to="/dashboard/privacy"
                                style={{
                                    ...actionButtonStyle,
                                    background: theme.accent,
                                    color: "#fff",
                                    boxShadow: theme.shadow,
                                }}
                            >
                                Review Privacy Policy
                            </Link>
                            <Link
                                to="/dashboard/contact"
                                style={{
                                    ...actionButtonStyle,
                                    background:
                                        theme.name === "dark"
                                            ? "rgba(255,255,255,0.04)"
                                            : "rgba(229,57,53,0.12)",
                                    color: theme.accent,
                                    border: `1px solid ${theme.border}`,
                                }}
                            >
                                Contact Legal Team
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="terms-service-content-grid">
                    <div className="terms-service-sidebar">
                        {/* TOC */}
                        <div
                            className="terms-service-toc"
                            style={{
                                ...cardStyle,
                                padding: 18,
                                position: "sticky",
                                top: 104,
                            }}
                        >
                            <h3
                                style={{
                                    marginTop: 0,
                                    marginBottom: 10,
                                    fontSize: 18,
                                }}
                            >
                                On this page
                            </h3>
                            <ol
                                style={{
                                    margin: 0,
                                    paddingLeft: 18,
                                    lineHeight: 1.7,
                                    display: "grid",
                                    gap: 8,
                                }}
                            >
                                {sections.map((s) => (
                                    <li key={s.id}>
                                        <a
                                            href={`#${s.id}`}
                                            style={{ ...anchorStyle }}
                                        >
                                            {s.title}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div
                            style={{
                                ...sectionCardStyle,
                                borderLeft: `4px solid ${theme.accent}`,
                                padding: 18,
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: 4,
                                }}
                            >
                                <MdMail color={theme.accent} size={20} />
                                <strong>Questions about these Terms?</strong>
                            </div>
                            <p
                                style={{
                                    marginTop: 0,
                                    marginBottom: 12,
                                    color: theme.textSecondary,
                                }}
                            >
                                We’re here to help clarify any part of our Terms of Service.
                                Reach out for a dedicated walkthrough of obligations.
                            </p>
                            <Link
                                to="/dashboard/contact"
                                style={{ ...anchorStyle }}
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>

                    <div className="terms-service-sections">
                        {sections.map((s) => (
                            <div
                                id={s.id}
                                key={s.id}
                                className="terms-service-section"
                                style={{
                                    ...sectionCardStyle,
                                    borderLeft: `4px solid ${theme.accent}`,
                                }}
                            >
                                {sectionTitle(s.title, s.icon)}
                                <div
                                    style={{
                                        marginTop: 10,
                                        color: theme.textSecondary,
                                    }}
                                >
                                    {s.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default TermsOfService;
