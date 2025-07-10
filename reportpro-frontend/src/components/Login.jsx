import React, { useState } from "react";
import reportProLogo from "../assets/report-pro-logo.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login({ onLogin, switchToSignup }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: email, 2: code+newpw
    const [resetEmail, setResetEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [resetNewPassword, setResetNewPassword] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [resetError, setResetError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");
            onLogin(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Password reset handlers
    const handleResetRequest = async (e) => {
        e.preventDefault();
        setResetError("");
        setResetMessage("");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/request-reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resetEmail }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || "Failed to request reset");
            setResetMessage(
                "A reset code has been sent to your email (demo: " +
                    data.code +
                    ")"
            );
            setResetStep(2);
        } catch (err) {
            setResetError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetError("");
        setResetMessage("");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: resetEmail,
                    code: resetCode,
                    newPassword: resetNewPassword,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || "Failed to reset password");
            setResetMessage("Password reset successful. You can now log in.");
            setTimeout(() => {
                setShowReset(false);
                setResetStep(1);
                setResetEmail("");
                setResetCode("");
                setResetNewPassword("");
                setResetMessage("");
                setResetError("");
            }, 2000);
        } catch (err) {
            setResetError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="login-container"
            style={{
                minHeight: "100vh",
                width: "99vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "linear-gradient(135deg, #fff5f5 0%, #ffeaea 60%, #fbe9e7 100%)",
                animation: "fadeInBg 1s",
                padding: "1rem",
                boxSizing: "border-box",
            }}
        >
            <style>{`
                @keyframes fadeInCard { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
                @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
                .login-container { transition: all 0.3s ease; }
                .login-card { animation: fadeInCard 0.8s cubic-bezier(.4,0,.2,1); }
                .login-input:focus { border: 1.5px solid #e53935 !important; box-shadow: 0 0 0 2px #e5393533; }
                .login-btn:active { border: 2px solid #fff; }
                .login-divider { display: flex; align-items: center; margin: 18px 0 10px 0; }
                .login-divider span { margin: 0 12px; color: #b71c1c; font-weight: 600; }
                .login-divider:before, .login-divider:after { content: ""; flex: 1; height: 1.5px; background: #ffeaea; }
                .login-spinner { border: 2.5px solid #fff; border-top: 2.5px solid #e53935; border-radius: 50%; width: 18px; height: 18px; animation: spin 0.7s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                /* Large Desktop (1400px and up) */
                @media (min-width: 1400px) {
                    .login-container {
                        padding: 2rem !important;
                    }
                    .login-card {
                        max-width: 480px !important;
                        padding: 3rem 2.5rem !important;
                    }
                    .login-title {
                        font-size: 32px !important;
                        margin-bottom: 24px !important;
                    }
                    .login-logo {
                        width: 120px !important;
                        height: 120px !important;
                        margin-bottom: 16px !important;
                    }
                    .login-input {
                        padding: 14px !important;
                        font-size: 17px !important;
                    }
                    .login-btn {
                        padding: 16px 0 !important;
                        font-size: 17px !important;
                    }
                }
                
                /* Desktop (1024px to 1399px) */
                @media (min-width: 1024px) and (max-width: 1399px) {
                    .login-card {
                        max-width: 440px !important;
                        padding: 2.5rem 2rem !important;
                    }
                    .login-title {
                        font-size: 30px !important;
                        margin-bottom: 20px !important;
                    }
                    .login-logo {
                        width: 110px !important;
                        height: 110px !important;
                        margin-bottom: 14px !important;
                    }
                }
                
                /* Tablet Landscape (768px to 1023px) */
                @media (min-width: 768px) and (max-width: 1023px) {
                    .login-card {
                        max-width: 420px !important;
                        padding: 2.2rem 1.8rem !important;
                    }
                    .login-title {
                        font-size: 28px !important;
                        margin-bottom: 18px !important;
                    }
                    .login-logo {
                        width: 100px !important;
                        height: 100px !important;
                        margin-bottom: 12px !important;
                    }
                }
                
                /* Tablet Portrait (600px to 767px) */
                @media (min-width: 600px) and (max-width: 767px) {
                    .login-card {
                        max-width: 400px !important;
                        padding: 2rem 1.5rem !important;
                    }
                    .login-title {
                        font-size: 26px !important;
                        margin-bottom: 16px !important;
                    }
                    .login-logo {
                        width: 90px !important;
                        height: 90px !important;
                        margin-bottom: 10px !important;
                    }
                    .login-input {
                        padding: 12px !important;
                        font-size: 16px !important;
                    }
                    .login-btn {
                        padding: 14px 0 !important;
                        font-size: 16px !important;
                    }
                }
                
                /* Mobile Large (480px to 599px) */
                @media (min-width: 480px) and (max-width: 599px) {
                    .login-card {
                        max-width: 95vw !important;
                        padding: 1.8rem 1.2rem !important;
                    }
                    .login-title {
                        font-size: 24px !important;
                        margin-bottom: 14px !important;
                    }
                    .login-logo {
                        width: 80px !important;
                        height: 80px !important;
                        margin-bottom: 8px !important;
                    }
                    .login-input {
                        padding: 11px !important;
                        font-size: 15px !important;
                    }
                    .login-btn {
                        padding: 13px 0 !important;
                        font-size: 15px !important;
                    }
                }
                
                /* Mobile Small (320px to 479px) */
                @media (max-width: 479px) {
                    .login-container {
                        padding: 0.5rem !important;
                    }
                    .login-card {
                        max-width: 98vw !important;
                        padding: 1.5rem 1rem !important;
                        margin: 1rem !important;
                    }
                    .login-title {
                        font-size: 22px !important;
                        margin-bottom: 12px !important;
                    }
                    .login-logo {
                        width: 70px !important;
                        height: 70px !important;
                        margin-bottom: 6px !important;
                    }
                    .login-input {
                        padding: 10px !important;
                        font-size: 14px !important;
                    }
                    .login-btn {
                        padding: 12px 0 !important;
                        font-size: 14px !important;
                    }
                    .login-link-btn {
                        font-size: 14px !important;
                    }
                }
                
                /* Touch-friendly improvements */
                @media (hover: none) and (pointer: coarse) {
                    .login-input {
                        min-height: 44px !important;
                    }
                    .login-btn {
                        min-height: 44px !important;
                    }
                    .password-toggle-btn {
                        min-width: 44px !important;
                        min-height: 44px !important;
                    }
                }
                
                /* High contrast mode support */
                @media (prefers-contrast: high) {
                    .login-card {
                        border: 2px solid #e53935 !important;
                    }
                    .login-input {
                        border-width: 2px !important;
                    }
                }
                
                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    .login-card,
                    .login-input,
                    .login-btn {
                        animation: none !important;
                        transition: none !important;
                    }
                }
                
                /* Password reset form responsive improvements */
                @media (max-width: 767px) {
                    .reset-form {
                        gap: 14px !important;
                    }
                    .reset-form label {
                        font-size: 15px !important;
                    }
                    .reset-form input {
                        padding: 11px !important;
                        font-size: 15px !important;
                    }
                    .reset-form button {
                        padding: 13px 0 !important;
                        font-size: 15px !important;
                    }
                }
                
                @media (max-width: 479px) {
                    .reset-form {
                        gap: 12px !important;
                    }
                    .reset-form label {
                        font-size: 14px !important;
                    }
                    .reset-form input {
                        padding: 10px !important;
                        font-size: 14px !important;
                    }
                    .reset-form button {
                        padding: 12px 0 !important;
                        font-size: 14px !important;
                    }
                }
                
                .password-toggle-btn, .password-toggle-btn:focus, .password-toggle-btn:active { border: none !important; outline: none !important; box-shadow: none !important; }
                .login-link-btn, .login-link-btn:focus, .login-link-btn:active { border: none !important; outline: none !important; box-shadow: none !important; background: none; }
            `}</style>
            <div
                className="login-card"
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
                {/* Logo/Icon */}
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
                        className="login-logo"
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 22,
                            boxShadow: "0 2px 8px #e5393522",
                        }}
                    />
                </div>
                <h2
                    className="login-title"
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
                    Login
                </h2>
                {!showReset ? (
                    <>
                        <form
                            onSubmit={handleSubmit}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                            }}
                            aria-label="Login form"
                        >
                            <label
                                htmlFor="login-email"
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
                                    id="login-email"
                                    className="login-input"
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
                                        transition:
                                            "border .2s, box-shadow .2s",
                                        width: "100%",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                            <label
                                htmlFor="login-password"
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
                                    id="login-password"
                                    className="login-input"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    autoComplete="current-password"
                                    aria-required="true"
                                    aria-label="Password"
                                    style={{
                                        padding: 12,
                                        borderRadius: 6,
                                        border: "1.5px solid #eee",
                                        fontSize: 16,
                                        width: "100%",
                                        transition:
                                            "border .2s, box-shadow .2s",
                                        boxSizing: "border-box",
                                    }}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    onClick={() => setShowPassword((v) => !v)}
                                    style={{
                                        position: "absolute",
                                        right: 45,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#b71c1c",
                                        fontSize: 20,
                                        padding: 0,
                                        margin: 0,
                                    }}
                                    tabIndex={0}
                                >
                                    <i
                                        className={
                                            showPassword
                                                ? "fa fa-eye-slash"
                                                : "fa fa-eye"
                                        }
                                    ></i>
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
                            <button
                                type="submit"
                                disabled={loading}
                                className="login-btn"
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
                                {loading && <span className="login-spinner" />}
                                {loading ? "Logging in..." : "Login"}
                            </button>
                            {error && (
                                <div
                                    style={{
                                        color: "#e53935",
                                        fontWeight: 600,
                                        textAlign: "center",
                                        marginTop: 12,
                                        fontSize: 15,
                                        background: "none",
                                        borderRadius: 0,
                                        padding: 0,
                                        boxShadow: "none",
                                        border: "none",
                                        letterSpacing: 0.2,
                                    }}
                                >
                                    {error}
                                </div>
                            )}
                        </form>
                        <div style={{ textAlign: "center", marginTop: 18 }}>
                            <div>
                                Don't have an account?{" "}
                                <button
                                    onClick={switchToSignup}
                                    className="login-link-btn"
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
                                    Sign up
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowReset(true)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#b71c1c",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    fontSize: 15,
                                    margin: "10px 0 0 0",
                                    textAlign: "center",
                                }}
                            >
                                Forgot password?
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {resetStep === 1 ? (
                            <form
                                className="reset-form"
                                onSubmit={handleResetRequest}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 16,
                                }}
                                aria-label="Request password reset form"
                            >
                                <label
                                    htmlFor="reset-email"
                                    style={{
                                        fontWeight: 600,
                                        color: "#b71c1c",
                                    }}
                                >
                                    Enter your email
                                </label>
                                <input
                                    id="reset-email"
                                    className="login-input"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) =>
                                        setResetEmail(e.target.value)
                                    }
                                    required
                                    aria-required="true"
                                    aria-label="Reset email"
                                    style={{
                                        padding: 12,
                                        borderRadius: 6,
                                        border: "1.5px solid #eee",
                                        fontSize: 16,
                                        transition:
                                            "border .2s, box-shadow .2s",
                                    }}
                                />
                                {resetError && (
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
                                        {resetError}
                                    </div>
                                )}
                                {resetMessage && (
                                    <div
                                        style={{
                                            color: "#fff",
                                            background: "#43ea7b",
                                            borderRadius: 6,
                                            padding: "8px 0",
                                            fontWeight: 600,
                                            textAlign: "center",
                                            marginTop: 2,
                                            marginBottom: 2,
                                            letterSpacing: 0.2,
                                        }}
                                    >
                                        {resetMessage}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="login-btn"
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
                                        cursor: loading
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: loading ? 0.7 : 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                    }}
                                    aria-busy={loading}
                                >
                                    {loading && (
                                        <span className="login-spinner" />
                                    )}
                                    {loading ? "Sending..." : "Send Reset Code"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReset(false);
                                        setResetStep(1);
                                        setResetEmail("");
                                        setResetCode("");
                                        setResetNewPassword("");
                                        setResetMessage("");
                                        setResetError("");
                                    }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#b71c1c",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                        fontSize: 15,
                                        marginTop: -8,
                                    }}
                                >
                                    Back to login
                                </button>
                            </form>
                        ) : (
                            <form
                                className="reset-form"
                                onSubmit={handleResetPassword}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 16,
                                }}
                                aria-label="Reset password form"
                            >
                                <label
                                    htmlFor="reset-code"
                                    style={{
                                        fontWeight: 600,
                                        color: "#b71c1c",
                                    }}
                                >
                                    Enter the code sent to your email
                                </label>
                                <input
                                    id="reset-code"
                                    className="login-input"
                                    type="text"
                                    value={resetCode}
                                    onChange={(e) =>
                                        setResetCode(e.target.value)
                                    }
                                    required
                                    aria-required="true"
                                    aria-label="Reset code"
                                    style={{
                                        padding: 12,
                                        borderRadius: 6,
                                        border: "1.5px solid #eee",
                                        fontSize: 16,
                                        transition:
                                            "border .2s, box-shadow .2s",
                                    }}
                                />
                                <label
                                    htmlFor="reset-new-password"
                                    style={{
                                        fontWeight: 600,
                                        color: "#b71c1c",
                                    }}
                                >
                                    New password
                                </label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        id="reset-new-password"
                                        className="login-input"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={resetNewPassword}
                                        onChange={(e) =>
                                            setResetNewPassword(e.target.value)
                                        }
                                        required
                                        aria-required="true"
                                        aria-label="New password"
                                        style={{
                                            padding: 12,
                                            borderRadius: 6,
                                            border: "1.5px solid #eee",
                                            fontSize: 16,
                                            transition:
                                                "border .2s, box-shadow .2s",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        onClick={() =>
                                            setShowPassword((v) => !v)
                                        }
                                        style={{
                                            position: "absolute",
                                            right: 25,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#b71c1c",
                                            fontSize: 18,
                                            padding: 0,
                                        }}
                                        tabIndex={0}
                                    >
                                        <i
                                            className={
                                                showPassword
                                                    ? "fa fa-eye-slash"
                                                    : "fa fa-eye"
                                            }
                                        ></i>
                                    </button>
                                </div>
                                {resetError && (
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
                                        {resetError}
                                    </div>
                                )}
                                {resetMessage && (
                                    <div
                                        style={{
                                            color: "#fff",
                                            background: "#43ea7b",
                                            borderRadius: 6,
                                            padding: "8px 0",
                                            fontWeight: 600,
                                            textAlign: "center",
                                            marginTop: 2,
                                            marginBottom: 2,
                                            letterSpacing: 0.2,
                                        }}
                                    >
                                        {resetMessage}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="login-btn"
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
                                        cursor: loading
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: loading ? 0.7 : 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                    }}
                                    aria-busy={loading}
                                >
                                    {loading && (
                                        <span className="login-spinner" />
                                    )}
                                    {loading
                                        ? "Resetting..."
                                        : "Reset Password"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReset(false);
                                        setResetStep(1);
                                        setResetEmail("");
                                        setResetCode("");
                                        setResetNewPassword("");
                                        setResetMessage("");
                                        setResetError("");
                                    }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#b71c1c",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                        fontSize: 15,
                                        marginTop: -8,
                                    }}
                                >
                                    Back to login
                                </button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Login;
