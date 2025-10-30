import React, { useState } from "react";

const ContactUs = ({ theme }) => {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
        setStatus("");
    };

    const validate = () => {
        if (!form.name.trim()) return "Name is required.";
        if (
            !form.email.trim() ||
            !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)
        )
            return "Valid email is required.";
        if (!form.message.trim()) return "Message is required.";
        return "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        setStatus("Sending...");
        setTimeout(() => {
            setStatus(
                "Thank you for contacting us! We'll get back to you soon."
            );
            setForm({ name: "", email: "", message: "" });
        }, 1200);
    };

    return (
        <>
            <style>{`
                .contact-us-container {
                    max-width: 960px;
                    margin: 2.5rem auto;
                    padding: 0 1.25rem 2rem;
                    box-sizing: border-box;
                }

                .contact-us-grid {
                    display: grid;
                    grid-template-columns: 1.1fr 0.9fr;
                    gap: 24px;
                }

                @media (max-width: 992px) {
                    .contact-us-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 600px) {
                    .contact-us-container {
                        margin: 2rem auto;
                        padding: 0 1rem 1.5rem;
                    }
                }
            `}</style>

            <div className="contact-us-container">
                <div
                    style={{
                        background:
                            theme.name === "dark"
                                ? `linear-gradient(135deg, ${theme.surface} 0%, #2c3136 100%)`
                                : `linear-gradient(135deg, #fff 0%, #fff0f0 100%)`,
                        color: theme.text,
                        borderRadius: 16,
                        border: `1px solid ${theme.border}`,
                        boxShadow: theme.shadow,
                        padding: "2rem",
                        marginBottom: 24,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 20,
                            alignItems: "center",
                        }}
                    >
                        <div style={{ flex: "1 1 240px" }}>
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
                                Let's talk
                            </span>
                            <h2
                                style={{
                                    marginTop: 16,
                                    marginBottom: 10,
                                    fontSize: 30,
                                    fontWeight: 900,
                                }}
                            >
                                Contact Report Pro
                            </h2>
                            <p
                                style={{
                                    marginTop: 0,
                                    marginBottom: 16,
                                    color: theme.textSecondary,
                                    lineHeight: 1.6,
                                }}
                            >
                                Questions about onboarding, pricing, or getting the
                                most out of Report Pro? Drop us a message and our team
                                will follow up quickly.
                            </p>
                        </div>
                        <div
                            style={{
                                flex: "1 1 220px",
                                minWidth: 220,
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                                gap: 12,
                            }}
                        >
                            {["Average reply under 6 hours", "Dedicated onboarding support", "Secure communication"]
                                .map((item) => (
                                    <div
                                        key={item}
                                        style={{
                                            background:
                                                theme.name === "dark"
                                                    ? "rgba(255,255,255,0.04)"
                                                    : "rgba(229,57,53,0.08)",
                                            borderRadius: 12,
                                            padding: "14px 16px",
                                            border: `1px solid ${theme.border}`,
                                            color: theme.textSecondary,
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {item}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="contact-us-grid">
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            background: theme.surface,
                            color: theme.text,
                            borderRadius: 16,
                            border: `1px solid ${theme.border}`,
                            boxShadow: theme.shadow,
                            padding: "1.75rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}
                    >
                        <div>
                            <label htmlFor="name" style={{ fontWeight: 600 }}>
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                style={{
                                    marginTop: 6,
                                    padding: "12px 14px",
                                    borderRadius: 10,
                                    border: `1px solid ${theme.inputBorder}`,
                                    background: theme.inputBg,
                                    color: theme.text,
                                    fontSize: 16,
                                }}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" style={{ fontWeight: 600 }}>
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                style={{
                                    marginTop: 6,
                                    padding: "12px 14px",
                                    borderRadius: 10,
                                    border: `1px solid ${theme.inputBorder}`,
                                    background: theme.inputBg,
                                    color: theme.text,
                                    fontSize: 16,
                                }}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="message" style={{ fontWeight: 600 }}>
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                rows={6}
                                style={{
                                    marginTop: 6,
                                    padding: "12px 14px",
                                    borderRadius: 10,
                                    border: `1px solid ${theme.inputBorder}`,
                                    background: theme.inputBg,
                                    color: theme.text,
                                    fontSize: 16,
                                    resize: "vertical",
                                }}
                                required
                            />
                        </div>
                        {error && (
                            <div style={{ color: theme.accent, fontWeight: 600 }}>
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            style={{
                                background: theme.accent,
                                color: "#fff",
                                border: "none",
                                borderRadius: 10,
                                padding: "12px 24px",
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: "pointer",
                                marginTop: 4,
                            }}
                        >
                            Send Message
                        </button>
                        {status && (
                            <div
                                style={{
                                    color:
                                        status === "Sending..."
                                            ? theme.textSecondary
                                            : theme.accent,
                                    fontWeight: 600,
                                    marginTop: 8,
                                }}
                            >
                                {status}
                            </div>
                        )}
                    </form>

                    <div
                        style={{
                            background: theme.surface,
                            color: theme.text,
                            borderRadius: 16,
                            border: `1px solid ${theme.border}`,
                            boxShadow: theme.shadow,
                            padding: "1.75rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}
                    >
                        <div>
                            <strong style={{ fontSize: 16 }}>Email</strong>
                            <div style={{ marginTop: 6 }}>
                                <a
                                    href="mailto:info@reportpro.com"
                                    style={{
                                        color: theme.accent,
                                        fontWeight: 600,
                                        textDecoration: "none",
                                    }}
                                >
                                    info@reportpro.com
                                </a>
                            </div>
                        </div>
                        <div>
                            <strong style={{ fontSize: 16 }}>Phone</strong>
                            <div style={{ marginTop: 6 }}>
                                <a
                                    href="tel:+911234567890"
                                    style={{
                                        color: theme.accent,
                                        fontWeight: 600,
                                        textDecoration: "none",
                                    }}
                                >
                                    +91 12345 67890
                                </a>
                            </div>
                        </div>
                        <div>
                            <strong style={{ fontSize: 16 }}>Office Hours</strong>
                            <div style={{ marginTop: 6, color: theme.textSecondary }}>
                                Monday - Friday, 9:00 AM - 6:00 PM (IST)
                            </div>
                        </div>
                        <div>
                            <strong style={{ fontSize: 16 }}>Location</strong>
                            <div style={{ marginTop: 6, color: theme.textSecondary }}>
                                123 Academic Lane,
                                <br /> New Delhi, India
                            </div>
                        </div>
                        <div
                            style={{
                                marginTop: 12,
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            <a
                                href="mailto:support@reportpro.com"
                                style={{
                                    color: theme.accent,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                }}
                            >
                                support@reportpro.com
                            </a>
                            <a
                                href="https://reportpro.com/status"
                                style={{
                                    color: theme.accent,
                                    textDecoration: "none",
                                    fontWeight: 600,
                                }}
                                target="_blank"
                                rel="noreferrer"
                            >
                                System Status
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ContactUs;
