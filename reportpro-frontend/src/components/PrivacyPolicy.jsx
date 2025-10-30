import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
    MdPrivacyTip,
    MdSecurity,
    MdInfo,
    MdMail,
    MdUpdate,
} from "react-icons/md";

const PrivacyPolicy = ({ theme }) => {
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
                label: "Encrypted Data",
                description: "Industry standard safeguards",
            },
            {
                label: "No Resell",
                description: "We never sell student info",
            },
            {
                label: "Full Control",
                description: "Admins manage access levels",
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
                id: "introduction",
                title: "Introduction",
                icon: <MdPrivacyTip color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        Report Pro ("we", "us", or "our") is committed to
                        protecting your privacy. This Privacy Policy explains
                        how we collect, use, disclose, and safeguard your
                        information when you use our platform.
                    </p>
                ),
            },
            {
                id: "data-we-collect",
                title: "Information We Collect",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        <li>
                            <strong>Personal Information:</strong> Name, email
                            address, and profile details provided during
                            registration.
                        </li>
                        <li>
                            <strong>Usage Data:</strong> Information about how
                            you use the platform, including log data and device
                            information.
                        </li>
                        <li>
                            <strong>Cookies:</strong> We use cookies to enhance
                            your experience and analyze usage.
                        </li>
                    </ul>
                ),
            },
            {
                id: "how-we-use",
                title: "How We Use Your Information",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        <li>To provide and maintain our services</li>
                        <li>
                            To communicate with you about your account or
                            updates
                        </li>
                        <li>To improve our platform and user experience</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                ),
            },
            {
                id: "sharing",
                title: "Information Sharing",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        We do not sell or rent your personal information. We may
                        share information with service providers who help us
                        operate the platform, or if required by law.
                    </p>
                ),
            },
            {
                id: "security",
                title: "Data Security",
                icon: <MdSecurity color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        We implement industry-standard security measures to
                        protect your data. However, no method of transmission
                        over the Internet is 100% secure.
                    </p>
                ),
            },
            {
                id: "your-rights",
                title: "Your Rights",
                icon: <MdPrivacyTip color={theme.accent} size={20} />,
                content: (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        <li>
                            Access, update, or delete your personal information
                        </li>
                        <li>Opt out of non-essential communications</li>
                        <li>Request a copy of your data</li>
                    </ul>
                ),
            },
            {
                id: "children",
                title: "Children's Privacy",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        Our platform is intended for educational use. We do not
                        knowingly collect data from children under 13 without
                        parental consent.
                    </p>
                ),
            },
            {
                id: "changes",
                title: "Changes to This Policy",
                icon: <MdUpdate color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        We may update this Privacy Policy from time to time. We
                        will notify you of any significant changes by posting
                        the new policy on this page.
                    </p>
                ),
            },
            {
                id: "contact",
                title: "Contact Us",
                icon: <MdMail color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        If you have questions about this Privacy Policy, please
                        contact us via the Contact Us page or at{" "}
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
            {/* Responsive styles for Privacy Policy page */}
            <style>{`
                /* Critical fix for the 730px overflow issue */
                .privacy-policy-container {
                    max-width: 1100px !important;
                    width: 100% !important;
                }

                .privacy-policy-content-grid {
                    display: grid !important;
                    gap: 20px !important;
                    margin-top: 24px !important;
                }

                .privacy-policy-toc {
                    position: sticky;
                    top: 96px;
                    align-self: flex-start;
                }

                .privacy-policy-hero-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-top: 18px;
                }

                .privacy-policy-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    align-self: flex-start;
                }

                .privacy-policy-sections {
                    display: grid;
                    gap: 18px;
                }

                @media (min-width: 992px) {
                    .privacy-policy-content-grid {
                        grid-template-columns: minmax(240px, 280px) minmax(0, 1fr) !important;
                        align-items: start !important;
                    }
                    .privacy-policy-sections {
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    }
                }

                @media (max-width: 730px) {
                    .privacy-policy-container {
                        max-width: 98vw !important;
                        padding: 1.3rem !important;
                        margin: 1rem auto !important;
                        box-sizing: border-box !important;
                        overflow-x: hidden !important;
                    }
                    .privacy-policy-content-grid {
                        grid-template-columns: 1fr !important;
                        gap: 14px !important;
                    }
                    .privacy-policy-toc {
                        padding: 14px !important;
                    }
                    .privacy-policy-section {
                        padding: 14px !important;
                    }
                    /* Ensure all elements stay within container */
                    .privacy-policy-container,
                    .privacy-policy-container *,
                    .privacy-policy-container *::before,
                    .privacy-policy-container *::after {
                        box-sizing: border-box !important;
                        max-width: 100% !important;
                    }
                }

                /* Tablets and large phones (600px to 767px) */
                @media (min-width: 600px) and (max-width: 767px) {
                    .privacy-policy-container {
                        max-width: 98vw !important;
                        padding: 1.2rem !important;
                        border-radius: 14px !important;
                        margin: 1rem auto !important;
                        overflow-x: hidden !important;
                    }
                    .privacy-policy-content-grid {
                        gap: 14px !important;
                    }
                }

                /* Small phones (480px to 599px) */
                @media (min-width: 480px) and (max-width: 599px) {
                    .privacy-policy-container {
                        padding: 1rem !important;
                        border-radius: 12px !important;
                        margin: 0.8rem auto !important;
                        overflow-x: hidden !important;
                    }
                    .privacy-policy-toc {
                        padding: 12px !important;
                    }
                    .privacy-policy-section {
                        padding: 12px !important;
                    }
                }

                /* Extra small phones (360px and below) */
                @media (max-width: 360px) {
                    .privacy-policy-container {
                        padding: 0.8rem !important;
                        margin: 0.5rem auto !important;
                        overflow-x: hidden !important;
                    }
                }

                /* Landscape orientation on phones */
                @media (max-height: 500px) and (orientation: landscape) {
                    .privacy-policy-container {
                        margin: 0.5rem auto !important;
                        padding: 1rem !important;
                        overflow-x: hidden !important;
                    }
                }

                /* Ensure no horizontal overflow on any screen size */
                .privacy-policy-container {
                    max-width: 100% !important;
                    overflow-x: hidden !important;
                    box-sizing: border-box !important;
                }
            `}</style>

            <div
                className="privacy-policy-container"
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
                            <div
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
                                <MdPrivacyTip /> Privacy
                            </div>
                            <h2
                                style={{
                                    marginTop: 14,
                                    marginBottom: 10,
                                    fontSize: 30,
                                    fontWeight: 900,
                                    color: theme.text,
                                    letterSpacing: 0.3,
                                }}
                            >
                                Privacy Policy
                            </h2>
                            <p
                                style={{
                                    marginTop: 0,
                                    marginBottom: 18,
                                    color: theme.textSecondary,
                                    lineHeight: 1.6,
                                }}
                            >
                                Learn how Report Pro collects, uses, and safeguards
                                the information that teachers and schools trust us
                                with every day.
                            </p>
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
                            {heroHighlights.map((fact) => (
                                <div
                                    key={fact.label}
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
                                        {fact.label}
                                    </div>
                                    <div style={{ color: theme.textSecondary, fontSize: 13 }}>
                                        {fact.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div
                            className="privacy-policy-hero-actions"
                            style={{
                                flexBasis: "100%",
                            }}
                        >
                            <Link
                                to="/dashboard/contact"
                                style={{
                                    ...actionButtonStyle,
                                    background: theme.accent,
                                    color: "#fff",
                                    boxShadow: theme.shadow,
                                }}
                            >
                                Contact Data Officer
                            </Link>
                            <Link
                                to="/dashboard/terms"
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
                                Review Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="privacy-policy-content-grid">
                    <div className="privacy-policy-sidebar">
                        {/* TOC */}
                        <div
                            className="privacy-policy-toc"
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
                                <strong>Need more help?</strong>
                            </div>
                            <p
                                style={{
                                    marginTop: 0,
                                    marginBottom: 12,
                                    color: theme.textSecondary,
                                }}
                            >
                                Have questions about privacy at Report Pro? Reach out to our
                                compliance team for tailored guidance.
                            </p>
                            <Link
                                to="/dashboard/contact"
                                style={{ ...anchorStyle }}
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>

                    <div className="privacy-policy-sections">
                        {sections.map((s) => (
                            <div
                                id={s.id}
                                key={s.id}
                                className="privacy-policy-section"
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

export default PrivacyPolicy;
