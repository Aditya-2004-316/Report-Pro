import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function EditProfile({
    token,
    user,
    onProfileUpdate,
    onBack,
    theme = "light",
}) {
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [avatar, setAvatar] = useState(user?.profilePicture || "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarError, setAvatarError] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setName(data.name || "");
                setEmail(data.email || "");
                setAvatar(data.profilePicture || "");
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const handleAvatarChange = (e) => {
        setAvatarError("");
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setAvatarError("Only image files are allowed.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setAvatarError("Image must be less than 2MB.");
            return;
        }
        setAvatarFile(file);
        setAvatar(URL.createObjectURL(file));
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setUploading(true);
        setAvatarError("");
        try {
            const formData = new FormData();
            formData.append("profilePicture", avatarFile);
            const res = await fetch(`${API_BASE}/api/profile-picture`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");
            setAvatar(data.profilePicture);
            setAvatarFile(null);
            if (onProfileUpdate)
                onProfileUpdate({ profilePicture: data.profilePicture });
        } catch (err) {
            setAvatarError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        setAvatar("");
        setAvatarFile(null);
        setAvatarError("");
        if (onProfileUpdate) onProfileUpdate({ profilePicture: "" });
    };

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
                    profilePicture: avatar || undefined,
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
            className="edit-profile-container"
            style={{
                minHeight: "100vh",
                width: "100vw",
                background:
                    theme === "dark"
                        ? "linear-gradient(135deg, #232526 0%, #18191a 100%)"
                        : "linear-gradient(135deg, #fff5f5 0%, #ffeaea 60%, #fbe9e7 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                boxSizing: "border-box",
            }}
        >
            <style>{`
                .edit-profile-container {
                    transition: all 0.3s ease;
                }
                .edit-profile-content {
                    transition: all 0.3s ease;
                }
                
                /* Large Desktop (1400px and up) */
                @media (min-width: 1400px) {
                    .edit-profile-content {
                        max-width: 480px !important;
                        padding: 3rem 2.5rem !important;
                    }
                }
                
                /* Desktop (1024px to 1399px) */
                @media (min-width: 1024px) and (max-width: 1399px) {
                    .edit-profile-content {
                        max-width: 450px !important;
                        padding: 2.5rem 2rem !important;
                    }
                }
                
                /* Tablet Landscape (768px to 1023px) */
                @media (min-width: 768px) and (max-width: 1023px) {
                    .edit-profile-content {
                        max-width: 420px !important;
                        padding: 2.2rem 1.8rem !important;
                    }
                }
                
                /* Tablet Portrait (600px to 767px) */
                @media (min-width: 600px) and (max-width: 767px) {
                    .edit-profile-content {
                        max-width: 400px !important;
                        padding: 2rem 1.5rem !important;
                    }
                }
                
                /* Mobile Large (480px to 599px) */
                @media (min-width: 480px) and (max-width: 599px) {
                    .edit-profile-container {
                        padding: 0.8rem !important;
                    }
                    .edit-profile-content {
                        max-width: 95vw !important;
                        padding: 1.8rem 1.2rem !important;
                    }
                }
                
                /* Mobile Small (320px to 479px) */
                @media (max-width: 479px) {
                    .edit-profile-container {
                        padding: 0.5rem !important;
                    }
                    .edit-profile-content {
                        max-width: 98vw !important;
                        padding: 1.5rem 1rem !important;
                        margin: 1rem auto !important;
                    }
                }
                
                /* Touch-friendly improvements */
                @media (hover: none) and (pointer: coarse) {
                    .edit-profile-content input {
                        min-height: 44px !important;
                    }
                    .edit-profile-content button {
                        min-height: 44px !important;
                    }
                }
                
                /* High contrast mode support */
                @media (prefers-contrast: high) {
                    .edit-profile-content {
                        border: 2px solid #e53935 !important;
                    }
                }
                
                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    .edit-profile-container,
                    .edit-profile-content {
                        transition: none !important;
                    }
                }
            `}</style>
            <div
                className="edit-profile-content"
                style={{
                    maxWidth: 420,
                    width: "100%",
                    background: theme === "dark" ? "#232526" : "#fff",
                    borderRadius: 16,
                    boxShadow:
                        theme === "dark"
                            ? "0 4px 24px #0006"
                            : "0 4px 24px #e5393522",
                    padding: "2.5rem 2rem 2rem 2rem",
                    position: "relative",
                    margin: "2rem auto",
                    color: theme === "dark" ? "#f5f5f5" : undefined,
                }}
            >
                <button
                    onClick={onBack}
                    style={{
                        position: "absolute",
                        top: 18,
                        left: 18,
                        background: "none",
                        border: "none",
                        fontSize: 22,
                        color: "#e53935",
                        cursor: "pointer",
                        fontWeight: 700,
                    }}
                    aria-label="Back"
                >
                    ←
                </button>
                <h2
                    style={{
                        background:
                            "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
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
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginBottom: 18,
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <img
                            src={avatar || "/vite.svg"}
                            alt="Profile"
                            style={{
                                width: 84,
                                height: 84,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2.5px solid #e53935",
                                background: "#fff",
                            }}
                        />
                        {avatar && (
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                style={{
                                    position: "absolute",
                                    right: -8,
                                    top: -8,
                                    background: "#fff",
                                    border: "1.5px solid #e53935",
                                    borderRadius: "50%",
                                    color: "#e53935",
                                    fontWeight: 700,
                                    fontSize: 18,
                                    width: 28,
                                    height: 28,
                                    cursor: "pointer",
                                    boxShadow: "0 2px 8px #e5393533",
                                }}
                                aria-label="Remove profile picture"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ marginTop: 10 }}
                        disabled={uploading}
                    />
                    {avatarFile && (
                        <button
                            type="button"
                            onClick={handleAvatarUpload}
                            disabled={uploading}
                            style={{
                                marginTop: 8,
                                background:
                                    "linear-gradient(90deg, #ff5252 0%, #e53935 100%)",
                                color: "#fff",
                                border: "none",
                                fontWeight: 700,
                                fontSize: 15,
                                borderRadius: 6,
                                boxShadow: "0 2px 8px #e5393533",
                                padding: "8px 18px",
                                cursor: uploading ? "not-allowed" : "pointer",
                                opacity: uploading ? 0.7 : 1,
                            }}
                        >
                            {" "}
                            {uploading ? "Uploading..." : "Save Picture"}{" "}
                        </button>
                    )}
                    {avatarError && (
                        <div
                            style={{
                                color: "#e53935",
                                fontWeight: 600,
                                marginTop: 6,
                            }}
                        >
                            {avatarError}
                        </div>
                    )}
                </div>
                {loading ? (
                    <div style={{ textAlign: "center", color: "#b71c1c" }}>
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
                        <label style={{ fontWeight: 600, color: "#b71c1c" }}>
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
                                border: "1.5px solid #eee",
                                fontSize: 16,
                            }}
                        />
                        <label style={{ fontWeight: 600, color: "#b71c1c" }}>
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
                                border: "1.5px solid #eee",
                                fontSize: 16,
                            }}
                        />
                        <div
                            style={{
                                margin: "10px 0 0 0",
                                fontWeight: 600,
                                color: "#b71c1c",
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
                                border: "1.5px solid #eee",
                                fontSize: 16,
                                marginBottom: 4,
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
                                border: "1.5px solid #eee",
                                fontSize: 16,
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
                            {" "}
                            {loading ? "Saving..." : "Save Changes"}{" "}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default EditProfile;
