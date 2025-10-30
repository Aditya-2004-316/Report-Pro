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

    const heroHighlights = useMemo(
        () => [
            {
                title: "Response Time",
                description: "Avg. under 6 hours on weekdays",
            },
            {
                title: "System Status",
                description: "99.9% uptime with live monitoring",
            },
            {
                title: "Guided Onboarding",
                description: "Step-by-step videos and docs",
            },
        ],
        []
    );

    const highlightCardWidth = useMemo(() => {
        const longest = heroHighlights.reduce((max, item) => {
            const titleLen = item.title.length;
            const descLen = item.description.length;
            return Math.max(max, titleLen, descLen);
        }, 0);
        return Math.min(240, Math.max(160, longest * 7));
    }, [heroHighlights]);

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
                        Email us at{" "}
                        <a
                            href="mailto:support@reportpro.com"
                            style={{ color: theme.accent }}
                        >
                            support@reportpro.com
                        </a>{" "}
                        or use the{" "}
                        <Link
                            to="/dashboard/contact"
                            style={{ color: theme.accent }}
                        >
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
        return faqs.filter(
            (f) =>
                (typeof f.a === "string" ? f.a : "")
                    .toString()
                    .toLowerCase()
                    .includes(ql) || f.q.toLowerCase().includes(ql)
        );
    }, [faqs, query]);

    const filteredTips = useMemo(() => {
        const ql = query.trim().toLowerCase();
        if (!ql) return tips;
        return tips.filter(
            (t) =>
                t.t.toLowerCase().includes(ql) || t.d.toLowerCase().includes(ql)
        );
    }, [tips, query]);

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

    const anchorStyle = {
        color: theme.accent,
        textDecoration: "none",
        fontWeight: 600,
    };

    const sectionTitle = (icon, text) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "8px 0 12px 0",
            }}
        >
            {icon}
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>{text}</h3>
        </div>
    );

    const AccordionItem = ({
        id,
        title,
        content,
        openSet,
        setOpenSet,
        icon,
    }) => {
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
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        {icon}
                        <span style={{ fontWeight: 700 }}>{title}</span>
                    </div>
                    <span
                        style={{
                            transform: isOpen
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                            transition: "transform 0.2s",
                            color: theme.accent,
                        }}
                    >
                        <MdArrowForward size={20} />
                    </span>
                </button>
                {isOpen && (
                    <div
                        style={{
                            marginTop: 10,
                            color: theme.textSecondary || theme.text,
                        }}
                    >
                        {content}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Responsive styles for Help & Support page */}
            <style>{`
                /* Critical fix for the 730px overflow issue */
                .help-support-container {
                    max-width: 1100px !important;
                    width: 100% !important;
                }

                .help-support-content-grid {
                    display: grid !important;
                    gap: 18px !important;
                    margin-top: 20px !important;
                }

                .help-support-main-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 18px;
                }

                @media (max-width: 992px) {
                    .help-support-main-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 730px) {
                    .help-support-container {
                        max-width: 98vw !important;
                        padding: 1.3rem !important;
                        margin: 1rem auto !important;
                        box-sizing: border-box !important;
                        overflow-x: hidden !important;
                    }
                    .help-support-content-grid {
                        grid-template-columns: 1fr !important;
                        gap: 14px !important;
                    }
                    .help-support-search-container {
                        flex-direction: column !important;
                        gap: 12px !important;
                        align-items: stretch !important;
                    }
                    .help-support-search-input {
                        width: 100% !important;
                    }
                    .help-support-contact-grid {
                        grid-template-columns: 1fr !important;
                        gap: 14px !important;
                    }
                    /* Ensure all elements stay within container */
                    .help-support-container,
                    .help-support-container *,
                    .help-support-container *::before,
                    .help-support-container *::after {
                        box-sizing: border-box !important;
                        max-width: 100% !important;
                    }
                }

                /* Tablets and large phones (600px to 767px) */
                @media (min-width: 600px) and (max-width: 767px) {
                    .help-support-container {
                        max-width: 98vw !important;
                        padding: 1.2rem !important;
                        border-radius: 14px !important;
                        margin: 1rem auto !important;
                        overflow-x: hidden !important;
                    }
                    .help-support-contact-grid {
                        grid-template-columns: 1fr !important;
                        gap: 14px !important;
                    }
                }

                /* Small phones (480px to 599px) */
                @media (min-width: 480px) and (max-width: 599px) {
                    .help-support-container {
                        padding: 1rem !important;
                        border-radius: 12px !important;
                        margin: 0.8rem auto !important;
                        overflow-x: hidden !important;
                    }
                }

                /* Extra small phones (360px and below) */
                @media (max-width: 360px) {
                    .help-support-container {
                        padding: 0.8rem !important;
                        margin: 0.5rem auto !important;
                        overflow-x: hidden !important;
                    }
                }

                /* Landscape orientation on phones */
                @media (max-height: 500px) and (orientation: landscape) {
                    .help-support-container {
                        margin: 0.5rem auto !important;
                        padding: 1rem !important;
                        overflow-x: hidden !important;
                    }
                }

                /* Ensure no horizontal overflow on any screen size */
                .help-support-container {
                    max-width: 100% !important;
                    overflow-x: hidden !important;
                    box-sizing: border-box !important;
                }
            }

            /* Tablets and large phones (600px to 767px) */
            @media (min-width: 600px) and (max-width: 767px) {
                .help-support-container {
                    max-width: 98vw !important;
                    padding: 1.2rem !important;
                    border-radius: 14px !important;
                    margin: 1rem auto !important;
                    overflow-x: hidden !important;
                }
                .help-support-contact-grid {
                    grid-template-columns: 1fr !important;
                    gap: 14px !important;
                }
            }

            /* Small phones (480px to 599px) */
            @media (min-width: 480px) and (max-width: 599px) {
                .help-support-container {
                    padding: 1rem !important;
                    border-radius: 12px !important;
                    margin: 0.8rem auto !important;
                    overflow-x: hidden !important;
                }
            }

            /* Extra small phones (360px and below) */
            @media (max-width: 360px) {
                .help-support-container {
                    padding: 0.8rem !important;
                    margin: 0.5rem auto !important;
                    overflow-x: hidden !important;
                }
            }

            /* Landscape orientation on phones */
            @media (max-height: 500px) and (orientation: landscape) {
                .help-support-container {
                    margin: 0.5rem auto !important;
                    padding: 1rem !important;
                    overflow-x: hidden !important;
                }
            }

            /* Ensure no horizontal overflow on any screen size */
            .help-support-container {
                max-width: 100% !important;
                overflow-x: hidden !important;
                box-sizing: border-box !important;
            }
        `}</style>

        <div
            className="help-support-container"
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
                            <MdSupportAgent /> Support Center
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
                            Help & Support
                        </h2>
                        <p
                            style={{
                                marginTop: 0,
                                marginBottom: 18,
                                color: theme.textSecondary,
                                lineHeight: 1.6,
                            }}
                        >
                            Find answers, troubleshoot issues, and reach our
                            support team. The knowledge base updates alongside
                            every major release.
                        </p>
                        <div
                            className="help-support-search-container"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <div
                                className="help-support-search-input"
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: theme.inputBg,
                                    border: `1px solid ${
                                        theme.inputBorder || theme.border
                                    }`,
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
                                    ...anchorStyle,
                                    background: theme.accent,
                                    color: "#fff",
                                    padding: "10px 16px",
                                    borderRadius: 10,
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

                    <div
                        style={{
                            flex: "1 1 220px",
                            minWidth: 220,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                            justifyContent: "center",
                        }}
                    >
                        {heroHighlights.map((stat) => (
                            <div
                                key={stat.title}
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
                                    {stat.title}
                                </div>
                                <div style={{ color: theme.textSecondary, fontSize: 13 }}>
                                    {stat.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="help-support-content-grid">
                <div className="help-support-main-grid">
                    {/* FAQs */}
                    <div style={{ ...cardStyle, padding: 18 }}>
                        {sectionTitle(
                            <MdQuestionAnswer color={theme.accent} size={22} />,
                            "Frequently Asked Questions"
                        )}
                        <div>
                            {filteredFaqs.length === 0 ? (
                                <div style={{ color: theme.textSecondary }}>
                                    No FAQs match your search.
                                </div>
                            ) : (
                                filteredFaqs.map((item, idx) => (
                                    <AccordionItem
                                        key={idx}
                                        id={idx}
                                        title={item.q}
                                        content={item.a}
                                        openSet={openFaq}
                                        setOpenSet={setOpenFaq}
                                        icon={
                                            <MdQuestionAnswer
                                                size={20}
                                                color={theme.accent}
                                            />
                                        }
                                    />
                                ))
                            )}
                        </div>
                    </div>

                        {/* Troubleshooting */}
                        <div style={{ ...cardStyle, padding: 18 }}>
                            {sectionTitle(
                                <MdBugReport color={theme.accent} size={22} />,
                                "Troubleshooting Tips"
                            )}
                            <div>
                                {filteredTips.length === 0 ? (
                                    <div style={{ color: theme.textSecondary }}>
                                        No troubleshooting items match your search.
                                    </div>
                                ) : (
                                    filteredTips.map((item, idx) => (
                                        <AccordionItem
                                            key={idx}
                                            id={idx}
                                            title={item.t}
                                            content={item.d}
                                            openSet={openTips}
                                            setOpenSet={setOpenTips}
                                            icon={
                                                <MdBugReport
                                                    size={20}
                                                    color={theme.accent}
                                                />
                                            }
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Cards */}
                    <div
                        className="help-support-contact-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: 16,
                        }}
                    >
                        <div style={{ ...cardStyle, padding: 18 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: 8,
                                }}
                            >
                                <MdEmail color={theme.accent} size={22} />
                                <strong>Support Email</strong>
                            </div>
                            <p
                                style={{
                                    marginTop: 0,
                                    marginBottom: 12,
                                    color: theme.textSecondary,
                                }}
                            >
                                For general queries or issues, email us.
                            </p>
                            <a
                                href="mailto:support@reportpro.com"
                                style={{ ...anchorStyle }}
                            >
                                support@reportpro.com
                            </a>
                        </div>
                        <div style={{ ...cardStyle, padding: 18 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: 8,
                                }}
                            >
                                <MdChat color={theme.accent} size={22} />
                                <strong>Contact Form</strong>
                            </div>
                            <p
                                style={{
                                    marginTop: 0,
                                    marginBottom: 12,
                                    color: theme.textSecondary,
                                }}
                            >
                                Prefer a form? Use our in-app contact page.
                            </p>
                            <Link
                                to="/dashboard/contact"
                                style={{ ...anchorStyle }}
                            >
                                Open Contact Page
                            </Link>
                        </div>
                        <div style={{ ...cardStyle, padding: 18 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: 8,
                                }}
                            >
                                <MdPhone color={theme.accent} size={22} />
                                <strong>Business Hours</strong>
                            </div>
                            <p style={{ marginTop: 0, marginBottom: 8 }}>
                                Monday - Friday
                            </p>
                            <p
                                style={{
                                    marginTop: 0,
                                    marginBottom: 0,
                                    color: theme.textSecondary,
                                }}
                            >
                                9:00 AM - 6:00 PM (IST)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HelpSupport;
