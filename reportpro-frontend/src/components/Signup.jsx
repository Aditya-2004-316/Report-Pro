import React, { useState } from "react";
import reportProLogo from "../assets/report-pro-logo.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Signup({ onSignup, switchToLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Signup failed");
            onSignup(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "linear-gradient(135deg, #fff5f5 0%, #ffeaea 60%, #fbe9e7 100%)",
                animation: "fadeInBg 1s",
            }}
        >
            <style>{`
                @keyframes fadeInCard { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
                @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
                .signup-card { animation: fadeInCard 0.8s cubic-bezier(.4,0,.2,1); }
                .signup-input:focus { border: 1.5px solid #e53935 !important; box-shadow: 0 0 0 2px #e5393533; }
                .signup-btn:active { border: 2px solid #fff; }
                .signup-spinner { border: 2.5px solid #fff; border-top: 2.5px solid #e53935; border-radius: 50%; width: 18px; height: 18px; animation: spin 0.7s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @media (max-width: 500px) { .signup-card { padding: 1.5rem 0.5rem !important; max-width: 98vw !important; } }
                .password-toggle-btn, .password-toggle-btn:focus, .password-toggle-btn:active { border: none !important; outline: none !important; box-shadow: none !important; }
                .signup-link-btn, .signup-link-btn:focus, .signup-link-btn:active { border: none !important; outline: none !important; box-shadow: none !important; background: none; }
            `}</style>
            <div
                className="signup-card"
                style={{
                    maxWidth: 400,
                    width: "100%",
                    background: "#fff",
                    borderRadius: 16,
                    boxShadow: "0 4px 24px #e5393522",
                    padding: "2.5rem 2rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 10,
                    }}
                >
                    <img
                        src={reportProLogo}
                        alt="ReportPro Logo"
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 22,
                            boxShadow: "0 2px 8px #e5393522",
                        }}
                    />
                </div>
                <h2
                    style={{
                        background:
                            "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: 800,
                        fontSize: 28,
                        marginBottom: 18,
                        letterSpacing: 1,
                        textAlign: "center",
                    }}
                >
                    Sign Up
                </h2>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                    }}
                    aria-label="Signup form"
                >
                    <label
                        htmlFor="signup-name"
                        style={{ fontWeight: 600, color: "#b71c1c" }}
                    >
                        Name
                    </label>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        <input
                            id="signup-name"
                            className="signup-input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            aria-required="true"
                            aria-label="Name"
                            style={{
                                padding: 12,
                                borderRadius: 6,
                                border: "1.5px solid #eee",
                                fontSize: 16,
                                transition: "border .2s, box-shadow .2s",
                                width: "100%",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>
                    <label
                        htmlFor="signup-email"
                        style={{ fontWeight: 600, color: "#b71c1c" }}
                    >
                        Email
                    </label>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        <input
                            id="signup-email"
                            className="signup-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            aria-required="true"
                            aria-label="Email"
                            style={{
                                padding: 12,
                                borderRadius: 6,
                                border: "1.5px solid #eee",
                                fontSize: 16,
                                transition: "border .2s, box-shadow .2s",
                                width: "100%",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>
                    <label
                        htmlFor="signup-password"
                        style={{ fontWeight: 600, color: "#b71c1c" }}
                    >
                        Password
                    </label>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            boxSizing: "border-box",
                            position: "relative",
                        }}
                    >
                        <input
                            id="signup-password"
                            className="signup-input"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            aria-required="true"
                            aria-label="Password"
                            style={{
                                padding: 12,
                                borderRadius: 6,
                                border: "1.5px solid #eee",
                                fontSize: 16,
                                width: "100%",
                                transition: "border .2s, box-shadow .2s",
                                boxSizing: "border-box",
                            }}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                            onClick={() => setShowPassword((v) => !v)}
                            style={{
                                position: "absolute",
                                right: 20,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                                margin: 0,
                                color: "#b71c1c",
                                fontSize: 20,
                            }}
                        >
                            <span
                                role="img"
                                aria-label={showPassword ? "Hide" : "Show"}
                            >
                                {showPassword ? (
                                    "🙈"
                                ) : (
                                    <svg
                                        width="22"
                                        height="22"
                                        fill="none"
                                        stroke="#b71c1c"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        viewBox="0 0 24 24"
                                    >
                                        <ellipse
                                            cx="12"
                                            cy="12"
                                            rx="8"
                                            ry="5"
                                        />
                                        <circle cx="12" cy="12" r="2.5" />
                                    </svg>
                                )}
                            </span>
                        </button>
                    </div>
                    <div
                        style={{
                            fontSize: 13,
                            color: "#b71c1c99",
                            marginTop: -8,
                            marginBottom: 2,
                        }}
                    >
                        Password must be at least 6 characters.
                    </div>
                    {error && (
                        <div
                            style={{
                                color: "#fff",
                                background: "#e53935",
                                borderRadius: 6,
                                padding: "8px 0",
                                fontWeight: 600,
                                textAlign: "center",
                                marginTop: 2,
                                marginBottom: 2,
                                letterSpacing: 0.2,
                            }}
                        >
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="signup-btn"
                        style={{
                            background:
                                "linear-gradient(90deg, #ff5252 0%, #e53935 100%)",
                            color: "#fff",
                            border: "none",
                            fontWeight: 700,
                            fontSize: 16,
                            borderRadius: 6,
                            boxShadow: "0 2px 8px #e5393533",
                            marginTop: 10,
                            padding: "14px 0",
                            letterSpacing: 1,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                        }}
                        aria-busy={loading}
                    >
                        {loading && <span className="signup-spinner" />}
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>
                <div style={{ textAlign: "center", marginTop: 18 }}>
                    Already have an account?{" "}
                    <button
                        onClick={switchToLogin}
                        className="signup-link-btn"
                        style={{
                            background: "none",
                            border: "none",
                            color: "#e53935",
                            fontWeight: 700,
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontSize: 15,
                            marginLeft: -20,
                        }}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Signup;
