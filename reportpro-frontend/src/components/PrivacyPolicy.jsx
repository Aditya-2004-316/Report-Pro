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
    const cardStyle = {
        background: theme.surface,
        color: theme.text,
        borderRadius: 12,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
    };

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
                    maxWidth: 1100,
                    width: "100%",
                    margin: "2rem auto",
                    padding: "0 1rem",
                }}
            >
                {/* Hero */}
                <div
                    style={{
                        ...cardStyle,
                        padding: "1.8rem",
                        background:
                            theme.name === "dark"
                                ? `linear-gradient(135deg, ${theme.surface} 0%, #2b2e33 100%)`
                                : `linear-gradient(135deg, #fff 0%, #fff6f6 100%)`,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 8,
                        }}
                    >
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "6px 12px",
                                borderRadius: 999,
                                background:
                                    theme.name === "dark"
                                        ? "#232526"
                                        : "#ffeaea",
                                color: theme.accent,
                                fontWeight: 700,
                                border: `1px solid ${theme.border}`,
                            }}
                        >
                            <MdPrivacyTip /> Privacy
                        </span>
                    </div>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: 28,
                            fontWeight: 900,
                            color: theme.text,
                        }}
                    >
                        Privacy Policy
                    </h2>
                    <p
                        style={{
                            marginTop: 8,
                            marginBottom: 14,
                            color: theme.textSecondary,
                        }}
                    >
                        This policy explains how Report Pro collects, uses, and
                        protects your data.
                    </p>
                    <div style={{ color: theme.textSecondary, fontSize: 14 }}>
                        Last updated: {lastUpdatedText}
                    </div>
                </div>

                {/* Content */}
                <div
                    className="privacy-policy-content-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: 16,
                        marginTop: 16,
                    }}
                >
                    {/* TOC */}
                    <div
                        className="privacy-policy-toc"
                        style={{ ...cardStyle, padding: 16 }}
                    >
                        <h3
                            style={{
                                marginTop: 0,
                                marginBottom: 10,
                                fontSize: 18,
                            }}
                        >
                            Contents
                        </h3>
                        <ol
                            style={{
                                margin: 0,
                                paddingLeft: 18,
                                lineHeight: 1.7,
                            }}
                        >
                            {sections.map((s, i) => (
                                <li key={s.id}>
                                    <a
                                        href={`#${s.id}`}
                                        style={{
                                            color: theme.accent,
                                            textDecoration: "none",
                                        }}
                                    >
                                        {s.title}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Sections */}
                    {sections.map((s) => (
                        <div
                            id={s.id}
                            key={s.id}
                            className="privacy-policy-section"
                            style={{ ...cardStyle, padding: 16 }}
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

                    {/* Contact CTA */}
                    <div style={{ ...cardStyle, padding: 16 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 8,
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
                            Have questions about privacy at Report Pro? Reach
                            out to our team.
                        </p>
                        <Link
                            to="/dashboard/contact"
                            style={{ color: theme.accent, fontWeight: 700 }}
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrivacyPolicy;
