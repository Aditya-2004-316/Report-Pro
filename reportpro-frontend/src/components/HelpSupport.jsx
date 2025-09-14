import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    MdSupportAgent,
    MdSearch,
    MdQuestionAnswer,
    MdBugReport,
    MdEmail,
    MdChat,
    MdPhone,
    MdArrowForward,
} from "react-icons/md";
const HelpSupport = ({ theme }) => {
    const [query, setQuery] = useState("");
    const [openFaq, setOpenFaq] = useState(new Set());
    const [openTips, setOpenTips] = useState(new Set());

    const faqs = useMemo(
        () => [
            {
                q: "How do I add a new student?",
                a: 'Go to the "Admission Details" section and fill out the required information. Click "Save" to add the student to the system.',
            },
            {
                q: "How can I enter or update marks?",
                a: 'Use the "Enter Marks" button on the dashboard. Select the student, subject, and exam type, then enter the marks and submit.',
            },
            {
                q: "How do I export student results?",
                a: 'Click the "Export Data" button in the footer. You can download results as a CSV file for offline use or reporting.',
            },
            {
                q: "How do I reset my password?",
                a: 'Go to the login page and click "Forgot Password?". Follow the instructions sent to your registered email address.',
            },
            {
                q: "Who can I contact for technical support?",
                a: (
                    <span>
                        Email us at {" "}
                        <a href="mailto:support@reportpro.com" style={{ color: theme.accent }}>
                            support@reportpro.com
                        </a>{" "}
                        or use the {" "}
                        <Link to="/dashboard/contact" style={{ color: theme.accent }}>
                            Contact Us
                        </Link>{" "}
                        page.
                    </span>
                ),
            },
        ],
        [theme.accent]
    );

    const tips = useMemo(
        () => [
            {
                t: "Page not loading or slow?",
                d: "Try refreshing the page or checking your internet connection. If the issue persists, clear your browser cache and try again.",
            },
            {
                t: "Unable to log in?",
                d: 'Make sure your username and password are correct. If you forgot your password, use the "Forgot Password?" link on the login page.',
            },
            {
                t: "Exported CSV file is empty or missing data?",
                d: "Ensure you have selected the correct filters and that there is data available for export. Try again or contact support if the problem continues.",
            },
        ],
        []
    );

    const filteredFaqs = useMemo(() => {
        const ql = query.trim().toLowerCase();
        if (!ql) return faqs;
        return faqs.filter((f) =>
            (typeof f.a === "string" ? f.a : "")
                .toString()
                .toLowerCase()
                .includes(ql) || f.q.toLowerCase().includes(ql)
        );
    }, [faqs, query]);

    const filteredTips = useMemo(() => {
        const ql = query.trim().toLowerCase();
        if (!ql) return tips;
        return tips.filter((t) => t.t.toLowerCase().includes(ql) || t.d.toLowerCase().includes(ql));
    }, [tips, query]);

    const cardStyle = {
        background: theme.surface,
        color: theme.text,
        borderRadius: 12,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
    };

    const sectionTitle = (icon, text) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 12px 0" }}>
            {icon}
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>{text}</h3>
        </div>
    );

    const AccordionItem = ({ id, title, content, openSet, setOpenSet, icon }) => {
        const isOpen = openSet.has(id);
        const toggle = () => {
            const next = new Set(openSet);
            if (isOpen) next.delete(id);
            else next.add(id);
            setOpenSet(next);
        };
        return (
            <div style={{ ...cardStyle, padding: 14, marginBottom: 10 }}>
                <button
                    onClick={toggle}
                    aria-expanded={isOpen}
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "transparent",
                        color: theme.text,
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {icon}
                        <span style={{ fontWeight: 700 }}>{title}</span>
                    </div>
                    <span
                        style={{
                            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                            color: theme.accent,
                        }}
                    >
                        <MdArrowForward size={20} />
                    </span>
                </button>
                {isOpen && (
                    <div style={{ marginTop: 10, color: theme.textSecondary || theme.text }}>
                        {content}
                    </div>
                )}
            </div>
        );
    };

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
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
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
                        <MdSupportAgent /> Support Center
                    </span>
                </div>
                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: theme.text }}>
                    Help & Support
                </h2>
                <p style={{ marginTop: 8, marginBottom: 14, color: theme.textSecondary }}>
                    Find answers, troubleshoot issues, and contact our team. We’re here to help.
                </p>

                {/* Search */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: theme.inputBg,
                            border: `1px solid ${theme.inputBorder || theme.border}`,
                            borderRadius: 10,
                            padding: "10px 12px",
                        }}
                    >
                        <MdSearch size={20} color={theme.textSecondary} />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search FAQs and troubleshooting..."
                            style={{
                                width: "100%",
                                border: "none",
                                outline: "none",
                                background: "transparent",
                                color: theme.text,
                                fontSize: 16,
                            }}
                        />
                    </div>
                    <Link
                        to="/dashboard/contact"
                        style={{
                            textDecoration: "none",
                            background: theme.accent,
                            color: "#fff",
                            padding: "10px 14px",
                            borderRadius: 10,
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: theme.shadow,
                        }}
                    >
                        <MdChat /> Contact Support
                    </Link>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 16 }}>
                {/* FAQs */}
                <div style={{ ...cardStyle, padding: 16 }}>
                    {sectionTitle(<MdQuestionAnswer color={theme.accent} size={22} />, "Frequently Asked Questions")}
                    <div>
                        {filteredFaqs.length === 0 ? (
                            <div style={{ color: theme.textSecondary }}>No FAQs match your search.</div>
                        ) : (
                            filteredFaqs.map((item, idx) => (
                                <AccordionItem
                                    key={idx}
                                    id={idx}
                                    title={item.q}
                                    content={item.a}
                                    openSet={openFaq}
                                    setOpenSet={setOpenFaq}
                                    icon={<MdQuestionAnswer size={20} color={theme.accent} />}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Troubleshooting */}
                <div style={{ ...cardStyle, padding: 16 }}>
                    {sectionTitle(<MdBugReport color={theme.accent} size={22} />, "Troubleshooting Tips")}
                    <div>
                        {filteredTips.length === 0 ? (
                            <div style={{ color: theme.textSecondary }}>No troubleshooting items match your search.</div>
                        ) : (
                            filteredTips.map((item, idx) => (
                                <AccordionItem
                                    key={idx}
                                    id={idx}
                                    title={item.t}
                                    content={item.d}
                                    openSet={openTips}
                                    setOpenSet={setOpenTips}
                                    icon={<MdBugReport size={20} color={theme.accent} />}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Contact Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                    <div style={{ ...cardStyle, padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <MdEmail color={theme.accent} size={22} />
                            <strong>Support Email</strong>
                        </div>
                        <p style={{ marginTop: 0, marginBottom: 12, color: theme.textSecondary }}>
                            For general queries or issues, email us.
                        </p>
                        <a href="mailto:support@reportpro.com" style={{ color: theme.accent, fontWeight: 700 }}>
                            support@reportpro.com
                        </a>
                    </div>
                    <div style={{ ...cardStyle, padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <MdChat color={theme.accent} size={22} />
                            <strong>Contact Form</strong>
                        </div>
                        <p style={{ marginTop: 0, marginBottom: 12, color: theme.textSecondary }}>
                            Prefer a form? Use our in-app contact page.
                        </p>
                        <Link to="/dashboard/contact" style={{ color: theme.accent, fontWeight: 700 }}>
                            Open Contact Page
                        </Link>
                    </div>
                    <div style={{ ...cardStyle, padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <MdPhone color={theme.accent} size={22} />
                            <strong>Business Hours</strong>
                        </div>
                        <p style={{ marginTop: 0, marginBottom: 8 }}>
                            Monday - Friday
                        </p>
                        <p style={{ marginTop: 0, marginBottom: 0, color: theme.textSecondary }}>
                            9:00 AM - 6:00 PM (IST)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
