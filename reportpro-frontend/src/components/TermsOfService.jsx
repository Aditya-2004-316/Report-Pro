import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { MdGavel, MdInfo, MdSecurity, MdUpdate, MdMail } from "react-icons/md";
const TermsOfService = ({ theme }) => {
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
                id: "acceptance",
                title: "Acceptance of Terms",
                icon: <MdGavel color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        By accessing or using Report Pro ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
                    </p>
                ),
            },
            {
                id: "use",
                title: "Use of the Service",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        <li>You must provide accurate information during registration.</li>
                        <li>You are responsible for maintaining the confidentiality of your account.</li>
                        <li>You agree not to misuse the Service or attempt unauthorized access.</li>
                    </ul>
                ),
            },
            {
                id: "ip",
                title: "Intellectual Property",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        All content, trademarks, and data on the Service are the property of Report Pro or its licensors. You may not reproduce or distribute any part of the Service without permission.
                    </p>
                ),
            },
            {
                id: "user-content",
                title: "User Content",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        You retain ownership of content you submit, but grant us a license to use it for operating and improving the Service.
                    </p>
                ),
            },
            {
                id: "termination",
                title: "Termination",
                icon: <MdSecurity color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        We reserve the right to suspend or terminate your access for violations of these Terms or for any reason at our discretion.
                    </p>
                ),
            },
            {
                id: "disclaimer",
                title: "Disclaimer & Limitation of Liability",
                icon: <MdInfo color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        The Service is provided "as is" without warranties. We are not liable for any damages arising from your use of the Service.
                    </p>
                ),
            },
            {
                id: "changes",
                title: "Changes to Terms",
                icon: <MdUpdate color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        We may update these Terms from time to time. Continued use of the Service constitutes acceptance of the new Terms.
                    </p>
                ),
            },
            {
                id: "law",
                title: "Governing Law",
                icon: <MdGavel color={theme.accent} size={20} />,
                content: <p style={{ margin: 0 }}>These Terms are governed by the laws of your jurisdiction.</p>,
            },
            {
                id: "contact",
                title: "Contact",
                icon: <MdMail color={theme.accent} size={20} />,
                content: (
                    <p style={{ margin: 0 }}>
                        For questions about these Terms, please contact us via the Contact Us page or at {" "}
                        <a href="mailto:support@reportpro.com" style={{ color: theme.accent }}>support@reportpro.com</a>.
                    </p>
                ),
            },
        ],
        [theme.accent]
    );

    const sectionTitle = (title, icon) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {icon}
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>{title}</h3>
        </div>
    );

    return (
        <div style={{ maxWidth: 1100, width: "100%", margin: "2rem auto", padding: "0 1rem" }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 12px",
                            borderRadius: 999,
                            background: theme.name === "dark" ? "#232526" : "#ffeaea",
                            color: theme.accent,
                            fontWeight: 700,
                            border: `1px solid ${theme.border}`,
                        }}
                    >
                        <MdGavel /> Legal
                    </span>
                </div>
                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: theme.text }}>Terms of Service</h2>
                <p style={{ marginTop: 8, marginBottom: 14, color: theme.textSecondary }}>
                    The rules and guidelines for using Report Pro.
                </p>
                <div style={{ color: theme.textSecondary, fontSize: 14 }}>Last updated: {lastUpdatedText}</div>
            </div>

            {/* Content */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 16 }}>
                {/* TOC */}
                <div style={{ ...cardStyle, padding: 16 }}>
                    <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 18 }}>Contents</h3>
                    <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                        {sections.map((s) => (
                            <li key={s.id}>
                                <a href={`#${s.id}`} style={{ color: theme.accent, textDecoration: "none" }}>
                                    {s.title}
                                </a>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Sections */}
                {sections.map((s) => (
                    <div id={s.id} key={s.id} style={{ ...cardStyle, padding: 16 }}>
                        {sectionTitle(s.title, s.icon)}
                        <div style={{ marginTop: 10, color: theme.textSecondary }}>{s.content}</div>
                    </div>
                ))}

                {/* Contact CTA */}
                <div style={{ ...cardStyle, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <MdMail color={theme.accent} size={20} />
                        <strong>Questions about these Terms?</strong>
                    </div>
                    <p style={{ marginTop: 0, marginBottom: 12, color: theme.textSecondary }}>
                        We’re here to help clarify any part of our Terms of Service.
                    </p>
                    <Link to="/dashboard/contact" style={{ color: theme.accent, fontWeight: 700 }}>
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
