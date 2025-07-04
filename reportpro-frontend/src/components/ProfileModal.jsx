import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ProfileModal({ token, onClose, onProfileUpdate, theme }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setName(data.name || "");
                setEmail(data.email || "");
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    email,
                    currentPassword: newPassword ? currentPassword : undefined,
                    newPassword: newPassword || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");
            setMessage("Profile updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            if (onProfileUpdate) onProfileUpdate(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.25)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 0",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    background: theme.surface,
                    borderRadius: 16,
                    boxShadow: theme.shadow,
                    padding: "2.5rem 2rem 2rem 2rem",
                    minWidth: 320,
                    maxWidth: 420,
                    width: "90vw",
                    position: "relative",
                    margin: "3rem auto",
                    boxSizing: "border-box",
                    color: theme.text,
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 18,
                        right: 18,
                        background: "none",
                        border: "none",
                        fontSize: 22,
                        color: theme.accent,
                        cursor: "pointer",
                        fontWeight: 700,
                    }}
                    aria-label="Close"
                >
                    ×
                </button>
                <h2
                    style={{
                        background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accentHover} 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: 800,
                        fontSize: 24,
                        marginBottom: 18,
                        letterSpacing: 1,
                        textAlign: "center",
                    }}
                >
                    Edit Profile
                </h2>
                {loading ? (
                    <div style={{ textAlign: "center", color: theme.text }}>
                        Loading...
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}
                    >
                        <label style={{ fontWeight: 600, color: theme.text }}>
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                padding: 12,
                                borderRadius: 6,
                                border: `1.5px solid ${theme.inputBorder}`,
                                fontSize: 16,
                                background: theme.inputBg,
                                color: theme.text,
                            }}
                        />
                        <label style={{ fontWeight: 600, color: theme.text }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                padding: 12,
                                borderRadius: 6,
                                border: `1.5px solid ${theme.inputBorder}`,
                                fontSize: 16,
                                background: theme.inputBg,
                                color: theme.text,
                            }}
                        />
                        <div
                            style={{
                                margin: "10px 0 0 0",
                                fontWeight: 600,
                                color: theme.text,
                            }}
                        >
                            Change Password
                        </div>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Current password"
                            style={{
                                padding: 12,
                                borderRadius: 6,
                                border: `1.5px solid ${theme.inputBorder}`,
                                fontSize: 16,
                                marginBottom: 4,
                                background: theme.inputBg,
                                color: theme.text,
                            }}
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            style={{
                                padding: 12,
                                borderRadius: 6,
                                border: `1.5px solid ${theme.inputBorder}`,
                                fontSize: 16,
                                background: theme.inputBg,
                                color: theme.text,
                            }}
                        />
                        {error && (
                            <div
                                style={{
                                    color: "#e53935",
                                    fontWeight: 600,
                                    textAlign: "center",
                                }}
                            >
                                {error}
                            </div>
                        )}
                        {message && (
                            <div
                                style={{
                                    color: "#43ea7b",
                                    fontWeight: 600,
                                    textAlign: "center",
                                }}
                            >
                                {message}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
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
                            }}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ProfileModal;
