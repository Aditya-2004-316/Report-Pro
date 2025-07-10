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
        <div
            style={{
                maxWidth: 700,
                margin: "2rem auto",
                padding: "2rem",
                background: theme.surface,
                color: theme.text,
                borderRadius: 12,
                boxShadow: theme.shadow,
            }}
        >
            <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Contact Us</h2>
            <p style={{ marginBottom: 18 }}>
                We'd love to hear from you! Fill out the form below or use the
                contact details provided.
            </p>
            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                <label htmlFor="name" style={{ fontWeight: 500 }}>
                    Name
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    style={{
                        padding: 10,
                        borderRadius: 6,
                        border: `1px solid ${theme.inputBorder}`,
                        background: theme.inputBg,
                        color: theme.text,
                        fontSize: 16,
                    }}
                    required
                />
                <label htmlFor="email" style={{ fontWeight: 500 }}>
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    style={{
                        padding: 10,
                        borderRadius: 6,
                        border: `1px solid ${theme.inputBorder}`,
                        background: theme.inputBg,
                        color: theme.text,
                        fontSize: 16,
                    }}
                    required
                />
                <label htmlFor="message" style={{ fontWeight: 500 }}>
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    style={{
                        padding: 10,
                        borderRadius: 6,
                        border: `1px solid ${theme.inputBorder}`,
                        background: theme.inputBg,
                        color: theme.text,
                        fontSize: 16,
                        resize: "vertical",
                    }}
                    required
                />
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
                        borderRadius: 6,
                        padding: "10px 24px",
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: "pointer",
                        marginTop: 8,
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
            <div style={{ marginBottom: 10 }}>
                <strong>Email:</strong>{" "}
                <a
                    href="mailto:info@reportpro.com"
                    style={{ color: theme.accent }}
                >
                    info@reportpro.com
                </a>
            </div>
            <div style={{ marginBottom: 10 }}>
                <strong>Phone:</strong>{" "}
                <a href="tel:+911234567890" style={{ color: theme.accent }}>
                    +91 12345 67890
                </a>
            </div>
            <div style={{ marginBottom: 10 }}>
                <strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00
                PM (IST)
            </div>
            <div style={{ marginBottom: 10 }}>
                <strong>Location:</strong> 123 Academic Lane, New Delhi, India
            </div>
        </div>
    );
};

export default ContactUs;
