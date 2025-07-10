import React, { useState } from "react";

// Icon SVGs for sidebar
const icons = {
    profile: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <circle
                cx="12"
                cy="8"
                r="4"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M4 20c0-2.5 3.6-4.5 8-4.5s8 2 8 4.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    ),
    theme: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <circle
                cx="12"
                cy="12"
                r="5"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    ),
    notifications: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path
                d="M18 16v-5a6 6 0 10-12 0v5l-1.5 2h15L18 16z"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M9 20a3 3 0 006 0"
                stroke="currentColor"
                strokeWidth="1.7"
            />
        </svg>
    ),
    security: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <rect
                x="5"
                y="11"
                width="14"
                height="8"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <path
                d="M12 15v2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <path
                d="M8 11V7a4 4 0 118 0v4"
                stroke="currentColor"
                strokeWidth="1.7"
            />
        </svg>
    ),
};

const sections = [
    { key: "profile", label: "Profile", icon: icons.profile },
    { key: "theme", label: "Theme & Appearance", icon: icons.theme },
    { key: "notifications", label: "Notifications", icon: icons.notifications },
    { key: "security", label: "Account & Security", icon: icons.security },
];

const Settings = ({
    theme,
    user,
    onThemeChange,
    onAccentChange,
    onEditProfile,
    onProfileUpdate,
}) => {
    const [activeSection, setActiveSection] = useState("profile");
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
    });
    // Profile editing state
    const [editing, setEditing] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        avatar: user?.avatar || user?.profilePicture || "",
    });
    const [profileMsg, setProfileMsg] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);
    // Notifications editing state
    const [notifEdit, setNotifEdit] = useState(false);
    const [notifForm, setNotifForm] = useState({ ...notifications });
    const [notifMsg, setNotifMsg] = useState("");
    const [notifLoading, setNotifLoading] = useState(false);
    const notifChanged =
        notifForm.email !== notifications.email ||
        notifForm.sms !== notifications.sms;
    const handleNotifChange = (e) => {
        setNotifications({
            ...notifications,
            [e.target.name]: e.target.checked,
        });
    };
    const handleNotifToggle = (e) => {
        const { name, checked } = e.target;
        setNotifForm((prev) => ({ ...prev, [name]: checked }));
        setNotifMsg("");
    };
    const handleNotifEdit = () => {
        setNotifEdit(true);
        setNotifForm({ ...notifications });
        setNotifMsg("");
    };
    const handleNotifCancel = () => {
        setNotifEdit(false);
        setNotifForm({ ...notifications });
        setNotifMsg("");
    };
    const handleProfileEdit = () => {
        setEditing(true);
        setProfileForm({
            name: user?.name || "",
            email: user?.email || "",
            avatar: user?.avatar || user?.profilePicture || "",
        });
        setProfileMsg("");
    };
    const handleProfileCancel = () => {
        setEditing(false);
        setProfileMsg("");
    };
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleProfileSave = async () => {
        setProfileLoading(true);
        try {
            // Simulate API call or call onProfileUpdate
            await new Promise((res) => setTimeout(res, 800));
            onProfileUpdate && onProfileUpdate(profileForm);
            setProfileMsg("Profile updated successfully!");
            setEditing(false);
        } catch (err) {
            setProfileMsg("Failed to update profile.");
        } finally {
            setProfileLoading(false);
        }
    };
    const handleNotifSave = async () => {
        setNotifLoading(true);
        try {
            // Simulate API call or localStorage update
            await new Promise((res) => setTimeout(res, 700));
            setNotifications({ ...notifForm });
            setNotifMsg("Notification preferences saved!");
            setNotifEdit(false);
        } catch (err) {
            setNotifMsg("Failed to save preferences.");
        } finally {
            setNotifLoading(false);
        }
    };
    // Theme editing state
    const [themeEdit, setThemeEdit] = useState(false);
    const [themeForm, setThemeForm] = useState(theme.name || "light");
    const [themeMsg, setThemeMsg] = useState("");
    const [themeLoading, setThemeLoading] = useState(false);
    const themeOptions = [
        {
            value: "light",
            label: "Light",
            desc: "Bright and clean, best for daylight.",
        },
        {
            value: "dark",
            label: "Dark",
            desc: "Easy on the eyes, great for low light.",
        },
        {
            value: "system",
            label: "System",
            desc: "Follows your device's theme.",
        },
    ];
    const themeChanged = themeForm !== theme.name;
    const handleThemeEdit = () => {
        setThemeEdit(true);
        setThemeForm(theme.name || "light");
        setThemeMsg("");
    };
    const handleThemeCancel = () => {
        setThemeEdit(false);
        setThemeForm(theme.name || "light");
        setThemeMsg("");
    };
    const handleThemeChange = (e) => {
        setThemeForm(e.target.value);
        setThemeMsg("");
    };
    const handleThemeSave = async () => {
        setThemeLoading(true);
        try {
            // Simulate API/localStorage update
            await new Promise((res) => setTimeout(res, 700));
            if (onThemeChange) onThemeChange(themeForm);
            setThemeMsg("Theme updated!");
            setThemeEdit(false);
        } catch (err) {
            setThemeMsg("Failed to update theme.");
        } finally {
            setThemeLoading(false);
        }
    };
    // Accent color state
    const accentSwatches = [
        "#e53935",
        "#3949ab",
        "#00897b",
        "#fbc02d",
        "#8e24aa",
        "#039be5",
        "#43a047",
        "#fb8c00",
    ];
    const [accent, setAccent] = useState(theme.accent || "#e53935");
    const [accentEdit, setAccentEdit] = useState(false);
    const [accentForm, setAccentForm] = useState(theme.accent || "#e53935");
    // Keep accent in sync with prop
    React.useEffect(() => {
        setAccent(theme.accent || "#e53935");
        setAccentForm(theme.accent || "#e53935");
    }, [theme.accent]);
    const accentChanged = accentForm !== accent;
    const handleAccentChange = (e) => {
        setAccentForm(e.target.value);
    };
    const handleAccentSwatch = (color) => {
        setAccentForm(color);
    };
    const handleAccentSave = () => {
        if (onAccentChange) onAccentChange(accentForm);
        setAccentEdit(false);
    };
    const handleAccentEdit = () => {
        setAccentEdit(true);
    };
    const handleAccentCancel = () => {
        setAccentForm(accent);
        setAccentEdit(false);
    };
    // Security section state
    const [showChangePwd, setShowChangePwd] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [pwdForm, setPwdForm] = useState({
        current: "",
        new: "",
        confirm: "",
    });
    const [pwdMsg, setPwdMsg] = useState("");
    const [pwdLoading, setPwdLoading] = useState(false);
    const [deleteMsg, setDeleteMsg] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const lastPwdChange = "2024-05-01"; // Placeholder
    const handlePwdChange = (e) => {
        const { name, value } = e.target;
        setPwdForm((prev) => ({ ...prev, [name]: value }));
        setPwdMsg("");
    };
    const handlePwdSubmit = async (e) => {
        e.preventDefault();
        setPwdLoading(true);
        setPwdMsg("");
        // Simple validation
        if (!pwdForm.current || !pwdForm.new || !pwdForm.confirm) {
            setPwdMsg("All fields are required.");
            setPwdLoading(false);
            return;
        }
        if (pwdForm.new.length < 6) {
            setPwdMsg("New password must be at least 6 characters.");
            setPwdLoading(false);
            return;
        }
        if (pwdForm.new !== pwdForm.confirm) {
            setPwdMsg("Passwords do not match.");
            setPwdLoading(false);
            return;
        }
        try {
            // Simulate API call
            await new Promise((res) => setTimeout(res, 900));
            setPwdMsg("Password changed successfully!");
            setPwdForm({ current: "", new: "", confirm: "" });
            setShowChangePwd(false);
        } catch {
            setPwdMsg("Failed to change password.");
        } finally {
            setPwdLoading(false);
        }
    };
    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        setDeleteMsg("");
        try {
            // Simulate API call
            await new Promise((res) => setTimeout(res, 1200));
            setDeleteMsg("Account deleted. (Demo only)");
            setShowDeleteConfirm(false);
        } catch {
            setDeleteMsg("Failed to delete account.");
        } finally {
            setDeleteLoading(false);
        }
    };
    // Hamburger menu state for mobile
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div
            style={{
                display: "flex",
                minHeight: "80vh",
                fontFamily: "Segoe UI, Arial, sans-serif",
                background: theme.background,
                color: theme.text,
                position: "relative",
                width: "100vw",
                maxWidth: "100vw",
                overflowX: "hidden",
            }}
        >
            {/* Hamburger for mobile */}
            <button
                className="settings-hamburger"
                style={{
                    display: "none",
                    position: "absolute",
                    top: 24,
                    left: 18,
                    zIndex: 2001,
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                }}
                aria-label="Open settings menu"
                onClick={() => setSidebarOpen(true)}
            >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect
                        y="7"
                        width="32"
                        height="3.5"
                        rx="1.5"
                        fill={theme.accent}
                    />
                    <rect
                        y="14"
                        width="32"
                        height="3.5"
                        rx="1.5"
                        fill={theme.accent}
                    />
                    <rect
                        y="21"
                        width="32"
                        height="3.5"
                        rx="1.5"
                        fill={theme.accent}
                    />
                </svg>
            </button>
            {/* Sidebar Navigation */}
            <nav
                style={{
                    width: 240,
                    background: theme.surface,
                    borderRight: `1.5px solid ${theme.border}`,
                    padding: "2.5rem 1.5rem 2.5rem 2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    zIndex: 10,
                    boxShadow: "0 2px 16px 0 rgba(0,0,0,0.03)",
                }}
                aria-label="Settings sections"
                className="settings-sidebar"
            >
                <h2
                    style={{
                        fontWeight: 800,
                        fontSize: 24,
                        marginBottom: 32,
                        color: theme.accent,
                        letterSpacing: 1,
                    }}
                >
                    Settings
                </h2>
                {sections.map((s) => (
                    <button
                        key={s.key}
                        onClick={() => {
                            setActiveSection(s.key);
                            setSidebarOpen(false); // close drawer on mobile
                        }}
                        aria-label={s.label}
                        style={{
                            background:
                                activeSection === s.key
                                    ? theme.accent + "22"
                                    : "none",
                            color:
                                activeSection === s.key
                                    ? theme.accent
                                    : theme.textSecondary,
                            border:
                                activeSection === s.key
                                    ? `1.5px solid ${theme.accent}`
                                    : "none",
                            borderRadius: 10,
                            padding: "0.85rem 1.2rem",
                            marginBottom: 10,
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: "pointer",
                            textAlign: "left",
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            boxShadow:
                                activeSection === s.key
                                    ? `0 2px 8px ${theme.accent}18`
                                    : "none",
                            transition:
                                "background 0.2s, color 0.2s, box-shadow 0.2s, border 0.2s",
                            outline:
                                activeSection === s.key
                                    ? `2px solid ${theme.accent}`
                                    : "none",
                        }}
                        aria-current={
                            activeSection === s.key ? "page" : undefined
                        }
                    >
                        <span style={{ display: "flex", alignItems: "center" }}>
                            {s.icon}
                        </span>
                        <span>{s.label}</span>
                    </button>
                ))}
            </nav>
            {/* Mobile Drawer Overlay */}
            {sidebarOpen && (
                <div
                    className="settings-drawer-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.18)",
                        zIndex: 3000,
                        display: "flex",
                        alignItems: "flex-start",
                    }}
                    onClick={() => setSidebarOpen(false)}
                >
                    <nav
                        className="settings-drawer"
                        style={{
                            width: 220,
                            background: theme.surface,
                            borderRight: `1.5px solid ${theme.border}`,
                            padding: "2.2rem 1.2rem 2.2rem 1.2rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: 18,
                            minHeight: "100vh",
                            boxShadow: "0 2px 16px 0 rgba(0,0,0,0.08)",
                            position: "relative",
                        }}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Settings menu drawer"
                    >
                        <button
                            style={{
                                position: "absolute",
                                top: 16,
                                right: 12,
                                background: "none",
                                border: "none",
                                fontSize: 26,
                                color: theme.accent,
                                cursor: "pointer",
                                fontWeight: 700,
                                zIndex: 10,
                            }}
                            aria-label="Close menu"
                            onClick={() => setSidebarOpen(false)}
                        >
                            ×
                        </button>
                        <h2
                            style={{
                                fontWeight: 800,
                                fontSize: 22,
                                marginBottom: 28,
                                color: theme.accent,
                                letterSpacing: 1,
                            }}
                        >
                            Settings
                        </h2>
                        {sections.map((s) => (
                            <button
                                key={s.key}
                                onClick={() => {
                                    setActiveSection(s.key);
                                    setSidebarOpen(false);
                                }}
                                aria-label={s.label}
                                style={{
                                    background:
                                        activeSection === s.key
                                            ? theme.accent + "22"
                                            : "none",
                                    color:
                                        activeSection === s.key
                                            ? theme.accent
                                            : theme.textSecondary,
                                    border:
                                        activeSection === s.key
                                            ? `1.5px solid ${theme.accent}`
                                            : "none",
                                    borderRadius: 10,
                                    padding: "0.85rem 1.2rem",
                                    marginBottom: 10,
                                    fontWeight: 600,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    boxShadow:
                                        activeSection === s.key
                                            ? `0 2px 8px ${theme.accent}18`
                                            : "none",
                                    transition:
                                        "background 0.2s, color 0.2s, box-shadow 0.2s, border 0.2s",
                                    outline:
                                        activeSection === s.key
                                            ? `2px solid ${theme.accent}`
                                            : "none",
                                }}
                                aria-current={
                                    activeSection === s.key ? "page" : undefined
                                }
                            >
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {s.icon}
                                </span>
                                <span>{s.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            )}
            {/* Main Content */}
            <main
                className="settings-main-content"
                style={{
                    flex: 1,
                    minWidth: 0,
                    width: "100%",
                    maxWidth: "90vw",
                    boxSizing: "border-box",
                    padding: "2.5rem 2rem",
                }}
            >
                {/* Profile Section */}
                {activeSection === "profile" && (
                    <section
                        style={{
                            background: theme.surface,
                            borderRadius: 18,
                            boxShadow: "0 4px 32px 0 rgba(229,57,53,0.06)",
                            padding: "2.5rem 2.5rem 2rem 2.5rem",
                            marginBottom: 40,
                            display: "flex",
                            alignItems: "center",
                            gap: 40,
                            flexWrap: "wrap",
                            border: `1.5px solid ${theme.border}`,
                            position: "relative",
                            animation: "fadeIn 0.5s cubic-bezier(.4,0,.2,1)",
                        }}
                        aria-labelledby="profile-section-title"
                    >
                        <img
                            src={
                                profileForm.avatar ||
                                user?.avatar ||
                                user?.profilePicture ||
                                "https://ui-avatars.com/api/?name=" +
                                    encodeURIComponent(
                                        profileForm.name || user?.name || "User"
                                    ) +
                                    "&background=E53935&color=fff&size=128"
                            }
                            alt="User avatar"
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: "50%",
                                border: `3px solid ${theme.accent}`,
                                boxShadow: `0 2px 12px ${theme.accent}22`,
                                objectFit: "cover",
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 220 }}>
                            <h3
                                id="profile-section-title"
                                style={{
                                    fontWeight: 800,
                                    fontSize: 24,
                                    margin: 0,
                                    letterSpacing: 0.5,
                                }}
                            >
                                {editing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileForm.name}
                                        onChange={handleProfileChange}
                                        style={{
                                            fontWeight: 800,
                                            fontSize: 22,
                                            border: `1.5px solid ${theme.border}`,
                                            borderRadius: 6,
                                            padding: "0.4rem 0.8rem",
                                            marginBottom: 8,
                                            width: "100%",
                                            color: theme.text,
                                            background:
                                                theme.inputBg || theme.surface,
                                        }}
                                        placeholder="Full Name"
                                        autoFocus
                                    />
                                ) : (
                                    user?.name || "-"
                                )}
                            </h3>
                            <p
                                style={{
                                    color: theme.textSecondary,
                                    margin: "8px 0 22px 0",
                                    fontSize: 17,
                                    fontWeight: 500,
                                }}
                            >
                                {editing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileForm.email}
                                        onChange={handleProfileChange}
                                        style={{
                                            fontWeight: 500,
                                            fontSize: 16,
                                            border: `1.5px solid ${theme.border}`,
                                            borderRadius: 6,
                                            padding: "0.4rem 0.8rem",
                                            width: "100%",
                                            color: theme.text,
                                            background:
                                                theme.inputBg || theme.surface,
                                        }}
                                        placeholder="Email"
                                    />
                                ) : (
                                    user?.email || "-"
                                )}
                            </p>
                            {editing && (
                                <div style={{ marginBottom: 18 }}>
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 15,
                                            color: theme.textSecondary,
                                            marginRight: 8,
                                        }}
                                    >
                                        Avatar URL:
                                    </label>
                                    <input
                                        type="text"
                                        name="avatar"
                                        value={profileForm.avatar}
                                        onChange={handleProfileChange}
                                        style={{
                                            fontWeight: 500,
                                            fontSize: 15,
                                            border: `1.5px solid ${theme.border}`,
                                            borderRadius: 6,
                                            padding: "0.3rem 0.7rem",
                                            width: "60%",
                                            color: theme.text,
                                            background:
                                                theme.inputBg || theme.surface,
                                        }}
                                        placeholder="Avatar image URL"
                                    />
                                    <span
                                        style={{
                                            color: theme.textSecondary,
                                            fontSize: 13,
                                            marginLeft: 8,
                                        }}
                                        title="Paste a direct image URL or leave blank for default avatar."
                                    >
                                        <svg
                                            width="15"
                                            height="15"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke={theme.accent}
                                                strokeWidth="1.5"
                                            />
                                            <path
                                                d="M12 7v5l3 3"
                                                stroke={theme.accent}
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            )}
                            {profileMsg && (
                                <div
                                    style={{
                                        color: profileMsg.includes("success")
                                            ? theme.accent
                                            : theme.error || "#e53935",
                                        fontWeight: 600,
                                        marginBottom: 10,
                                        fontSize: 15,
                                    }}
                                >
                                    {profileMsg}
                                </div>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    marginTop: 8,
                                }}
                            >
                                {editing ? (
                                    <>
                                        <button
                                            onClick={handleProfileSave}
                                            disabled={profileLoading}
                                            style={{
                                                padding: "0.5rem 1.5rem",
                                                borderRadius: 8,
                                                border: "none",
                                                background: theme.accent,
                                                color: "#fff",
                                                fontWeight: 700,
                                                cursor: profileLoading
                                                    ? "not-allowed"
                                                    : "pointer",
                                                fontSize: 16,
                                                boxShadow: `0 2px 8px ${theme.accent}22`,
                                                opacity: profileLoading
                                                    ? 0.7
                                                    : 1,
                                                transition:
                                                    "background 0.2s, box-shadow 0.2s",
                                            }}
                                        >
                                            {profileLoading
                                                ? "Saving..."
                                                : "Save"}
                                        </button>
                                        <button
                                            onClick={handleProfileCancel}
                                            disabled={profileLoading}
                                            style={{
                                                padding: "0.5rem 1.5rem",
                                                borderRadius: 8,
                                                border: `1.5px solid ${theme.border}`,
                                                background: theme.surface,
                                                color: theme.textSecondary,
                                                fontWeight: 700,
                                                cursor: profileLoading
                                                    ? "not-allowed"
                                                    : "pointer",
                                                fontSize: 16,
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleProfileEdit}
                                        style={{
                                            padding: "0.5rem 1.5rem",
                                            borderRadius: 8,
                                            border: "none",
                                            background: theme.accent,
                                            color: "#fff",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            fontSize: 16,
                                            boxShadow: `0 2px 8px ${theme.accent}22`,
                                            transition:
                                                "background 0.2s, box-shadow 0.2s",
                                        }}
                                        title="Edit your profile information"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                )}
                {/* Divider */}
                <div
                    style={{
                        height: 0,
                        borderTop: `1.5px solid ${theme.border}33`,
                        margin: "-10px 0 36px 0",
                    }}
                />
                {/* Theme Section */}
                {activeSection === "theme" && (
                    <section
                        style={{
                            background: theme.surface,
                            borderRadius: 18,
                            boxShadow: "0 4px 32px 0 rgba(229,57,53,0.06)",
                            padding: "2.5rem 2.5rem 2rem 2.5rem",
                            marginBottom: 40,
                            border: `1.5px solid ${theme.border}`,
                            animation: "fadeIn 0.5s cubic-bezier(.4,0,.2,1)",
                        }}
                        aria-labelledby="theme-section-title"
                    >
                        <h3
                            id="theme-section-title"
                            style={{
                                fontWeight: 800,
                                fontSize: 22,
                                marginBottom: 18,
                                letterSpacing: 0.5,
                            }}
                        >
                            Theme & Appearance
                        </h3>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 32,
                                maxWidth: 700,
                            }}
                        >
                            {/* Theme grid */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(180px, 1fr))",
                                    gap: 24,
                                    marginBottom: 8,
                                }}
                            >
                                {themeOptions.map((opt) => (
                                    <label
                                        key={opt.value}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: 18,
                                            borderRadius: 12,
                                            border:
                                                themeEdit ||
                                                theme.name === opt.value
                                                    ? `2.5px solid ${accentForm}`
                                                    : `1.5px solid ${theme.border}`,
                                            background:
                                                themeEdit ||
                                                theme.name === opt.value
                                                    ? accentForm + "08"
                                                    : theme.surface,
                                            boxShadow:
                                                themeEdit ||
                                                theme.name === opt.value
                                                    ? `0 2px 12px ${accentForm}22`
                                                    : "0 1px 4px #0001",
                                            cursor: themeEdit
                                                ? "pointer"
                                                : "default",
                                            transition:
                                                "border 0.2s, box-shadow 0.2s, background 0.2s",
                                            position: "relative",
                                            outline:
                                                themeEdit &&
                                                themeForm === opt.value
                                                    ? `2px solid ${accentForm}`
                                                    : "none",
                                        }}
                                        title={opt.desc}
                                        tabIndex={0}
                                        aria-label={opt.label + " theme"}
                                    >
                                        <input
                                            type="radio"
                                            name="theme"
                                            value={opt.value}
                                            checked={
                                                themeEdit
                                                    ? themeForm === opt.value
                                                    : theme.name === opt.value
                                            }
                                            onChange={
                                                themeEdit
                                                    ? handleThemeChange
                                                    : undefined
                                            }
                                            disabled={!themeEdit}
                                            style={{ display: "none" }}
                                        />
                                        {/* Live preview */}
                                        <div
                                            style={{
                                                width: 60,
                                                height: 38,
                                                borderRadius: 8,
                                                border: `1.5px solid ${accentForm}`,
                                                background:
                                                    opt.value === "dark"
                                                        ? "#232526"
                                                        : opt.value === "light"
                                                        ? "#fff"
                                                        : "linear-gradient(90deg,#fff 50%,#232526 50%)",
                                                boxShadow: `0 2px 8px ${accentForm}18`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginBottom: 6,
                                            }}
                                        >
                                            {opt.value === "dark" ? (
                                                <svg
                                                    width="22"
                                                    height="22"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="8"
                                                        fill="#232526"
                                                        stroke={accentForm}
                                                        strokeWidth="1.5"
                                                    />
                                                </svg>
                                            ) : opt.value === "light" ? (
                                                <svg
                                                    width="22"
                                                    height="22"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="8"
                                                        fill="#fff"
                                                        stroke={accentForm}
                                                        strokeWidth="1.5"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    width="22"
                                                    height="22"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="8"
                                                        fill="url(#sys)"
                                                        stroke={accentForm}
                                                        strokeWidth="1.5"
                                                    />
                                                    <defs>
                                                        <linearGradient
                                                            id="sys"
                                                            x1="4"
                                                            y1="12"
                                                            x2="20"
                                                            y2="12"
                                                            gradientUnits="userSpaceOnUse"
                                                        >
                                                            <stop stopColor="#fff" />
                                                            <stop
                                                                offset="1"
                                                                stopColor="#232526"
                                                            />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                            )}
                                        </div>
                                        <span
                                            style={{
                                                fontWeight: 700,
                                                fontSize: 16,
                                                color:
                                                    themeEdit ||
                                                    theme.name === opt.value
                                                        ? accentForm
                                                        : theme.text,
                                            }}
                                        >
                                            {opt.label}
                                        </span>
                                        <span
                                            style={{
                                                color: theme.textSecondary,
                                                fontSize: 14,
                                                textAlign: "center",
                                            }}
                                        >
                                            {opt.desc}
                                        </span>
                                        {themeEdit &&
                                            themeForm === opt.value && (
                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        top: 10,
                                                        right: 10,
                                                        color: accentForm,
                                                        fontWeight: 700,
                                                        fontSize: 18,
                                                    }}
                                                    title="Selected"
                                                >
                                                    ✓
                                                </span>
                                            )}
                                    </label>
                                ))}
                            </div>
                            {/* Accent color picker */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                    marginTop: 8,
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 600,
                                        fontSize: 16,
                                        marginBottom: 2,
                                    }}
                                >
                                    Accent Color
                                </span>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 10,
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {accentSwatches.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() =>
                                                handleAccentSwatch(color)
                                            }
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: "50%",
                                                border:
                                                    color === accentForm
                                                        ? `2.5px solid ${color}`
                                                        : `1.5px solid ${theme.border}`,
                                                background: color,
                                                marginRight: 2,
                                                cursor: "pointer",
                                                outline:
                                                    color === accentForm
                                                        ? `2px solid ${color}`
                                                        : "none",
                                                boxShadow:
                                                    color === accentForm
                                                        ? `0 2px 8px ${color}33`
                                                        : "none",
                                                transition:
                                                    "border 0.2s, box-shadow 0.2s",
                                            }}
                                            aria-label={"Accent color " + color}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={accentForm}
                                        onChange={handleAccentChange}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            border: `1.5px solid ${theme.border}`,
                                            borderRadius: "50%",
                                            background: "none",
                                            cursor: "pointer",
                                        }}
                                        aria-label="Custom accent color"
                                    />
                                    <span
                                        style={{
                                            color: theme.textSecondary,
                                            fontSize: 13,
                                            marginLeft: 8,
                                        }}
                                        title="Pick a custom accent color."
                                    >
                                        <svg
                                            width="15"
                                            height="15"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke={accentForm}
                                                strokeWidth="1.5"
                                            />
                                            <path
                                                d="M12 7v5l3 3"
                                                stroke={accentForm}
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                            {themeMsg && (
                                <div
                                    style={{
                                        color: themeMsg.includes("updated")
                                            ? accentForm
                                            : theme.error || "#e53935",
                                        fontWeight: 600,
                                        marginBottom: 10,
                                        fontSize: 15,
                                    }}
                                >
                                    {themeMsg}
                                </div>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 14,
                                    marginTop: 18,
                                    justifyContent: "flex-end",
                                }}
                            >
                                {themeEdit ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleThemeSave}
                                            disabled={
                                                themeLoading || !themeChanged
                                            }
                                            style={{
                                                padding: "0.6rem 1.7rem",
                                                borderRadius: 8,
                                                border: "none",
                                                background: themeChanged
                                                    ? accentForm
                                                    : accentForm + "55",
                                                color: "#fff",
                                                fontWeight: 700,
                                                cursor:
                                                    themeLoading ||
                                                    !themeChanged
                                                        ? "not-allowed"
                                                        : "pointer",
                                                fontSize: 16,
                                                boxShadow: `0 2px 8px ${accentForm}22`,
                                                opacity: themeLoading ? 0.7 : 1,
                                                transition:
                                                    "background 0.2s, box-shadow 0.2s",
                                            }}
                                        >
                                            {themeLoading
                                                ? "Saving..."
                                                : "Save"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleThemeCancel}
                                            disabled={themeLoading}
                                            style={{
                                                padding: "0.6rem 1.7rem",
                                                borderRadius: 8,
                                                border: `1.5px solid ${theme.border}`,
                                                background: theme.surface,
                                                color: theme.textSecondary,
                                                fontWeight: 700,
                                                cursor: themeLoading
                                                    ? "not-allowed"
                                                    : "pointer",
                                                fontSize: 16,
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleThemeEdit}
                                        style={{
                                            padding: "0.6rem 1.7rem",
                                            borderRadius: 8,
                                            border: "none",
                                            background: accentForm,
                                            color: "#fff",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            fontSize: 16,
                                            boxShadow: `0 2px 8px ${accentForm}22`,
                                            transition:
                                                "background 0.2s, box-shadow 0.2s",
                                        }}
                                        title="Change theme preference"
                                    >
                                        Change Theme
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                )}
                {/* Divider */}
                <div
                    style={{
                        height: 0,
                        borderTop: `1.5px solid ${theme.border}33`,
                        margin: "-10px 0 36px 0",
                    }}
                />
                {/* Notifications Section */}
                {activeSection === "notifications" && (
                    <section
                        style={{
                            background: theme.surface,
                            borderRadius: 18,
                            boxShadow: "0 4px 32px 0 rgba(229,57,53,0.06)",
                            padding: "2.5rem 2.5rem 2rem 2.5rem",
                            marginBottom: 40,
                            border: `1.5px solid ${theme.border}`,
                            animation: "fadeIn 0.5s cubic-bezier(.4,0,.2,1)",
                        }}
                        aria-labelledby="notifications-section-title"
                    >
                        <h3
                            id="notifications-section-title"
                            style={{
                                fontWeight: 800,
                                fontSize: 22,
                                marginBottom: 18,
                                letterSpacing: 0.5,
                            }}
                        >
                            Notifications
                        </h3>
                        <form
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 28,
                                maxWidth: 420,
                            }}
                        >
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    fontSize: 17,
                                    fontWeight: 500,
                                    cursor: notifEdit ? "pointer" : "default",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    name="email"
                                    checked={
                                        notifEdit
                                            ? notifForm.email
                                            : notifications.email
                                    }
                                    onChange={
                                        notifEdit
                                            ? handleNotifToggle
                                            : undefined
                                    }
                                    disabled={!notifEdit}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        accentColor: theme.accent,
                                        cursor: notifEdit
                                            ? "pointer"
                                            : "not-allowed",
                                    }}
                                />
                                Email Notifications
                                <span
                                    style={{
                                        color: theme.textSecondary,
                                        fontSize: 15,
                                        marginLeft: 6,
                                    }}
                                    title="Receive important updates via email."
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke={theme.accent}
                                            strokeWidth="1.5"
                                        />
                                        <path
                                            d="M12 7v5l3 3"
                                            stroke={theme.accent}
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                            </label>
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    fontSize: 17,
                                    fontWeight: 500,
                                    cursor: notifEdit ? "pointer" : "default",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    name="sms"
                                    checked={
                                        notifEdit
                                            ? notifForm.sms
                                            : notifications.sms
                                    }
                                    onChange={
                                        notifEdit
                                            ? handleNotifToggle
                                            : undefined
                                    }
                                    disabled={!notifEdit}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        accentColor: theme.accent,
                                        cursor: notifEdit
                                            ? "pointer"
                                            : "not-allowed",
                                    }}
                                />
                                SMS Notifications
                                <span
                                    style={{
                                        color: theme.textSecondary,
                                        fontSize: 15,
                                        marginLeft: 6,
                                    }}
                                    title="Receive SMS alerts for critical events."
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke={theme.accent}
                                            strokeWidth="1.5"
                                        />
                                        <path
                                            d="M12 7v5l3 3"
                                            stroke={theme.accent}
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                            </label>
                            {notifMsg && (
                                <div
                                    style={{
                                        color: notifMsg.includes("saved")
                                            ? theme.accent
                                            : theme.error || "#e53935",
                                        fontWeight: 600,
                                        marginBottom: 10,
                                        fontSize: 15,
                                    }}
                                >
                                    {notifMsg}
                                </div>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 14,
                                    marginTop: 24,
                                    justifyContent: "flex-end",
                                }}
                            >
                                {notifEdit ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleNotifSave}
                                            disabled={
                                                notifLoading || !notifChanged
                                            }
                                            style={{
                                                padding: "0.6rem 1.7rem",
                                                borderRadius: 8,
                                                border: "none",
                                                background: notifChanged
                                                    ? theme.accent
                                                    : theme.accent + "55",
                                                color: "#fff",
                                                fontWeight: 700,
                                                cursor:
                                                    notifLoading ||
                                                    !notifChanged
                                                        ? "not-allowed"
                                                        : "pointer",
                                                fontSize: 16,
                                                boxShadow: `0 2px 8px ${theme.accent}22`,
                                                opacity: notifLoading ? 0.7 : 1,
                                                transition:
                                                    "background 0.2s, box-shadow 0.2s",
                                            }}
                                        >
                                            {notifLoading
                                                ? "Saving..."
                                                : "Save"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNotifCancel}
                                            disabled={notifLoading}
                                            style={{
                                                padding: "0.6rem 1.7rem",
                                                borderRadius: 8,
                                                border: `1.5px solid ${theme.border}`,
                                                background: theme.surface,
                                                color: theme.textSecondary,
                                                fontWeight: 700,
                                                cursor: notifLoading
                                                    ? "not-allowed"
                                                    : "pointer",
                                                fontSize: 16,
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleNotifEdit}
                                        style={{
                                            padding: "0.6rem 1.7rem",
                                            borderRadius: 8,
                                            border: "none",
                                            background: theme.accent,
                                            color: "#fff",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            fontSize: 16,
                                            boxShadow: `0 2px 8px ${theme.accent}22`,
                                            transition:
                                                "background 0.2s, box-shadow 0.2s",
                                        }}
                                        title="Edit notification preferences"
                                    >
                                        Edit Preferences
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>
                )}
                {/* Divider */}
                <div
                    style={{
                        height: 0,
                        borderTop: `1.5px solid ${theme.border}33`,
                        margin: "-10px 0 36px 0",
                    }}
                />
                {/* Security Section */}
                {activeSection === "security" && (
                    <section
                        style={{
                            background: theme.surface,
                            borderRadius: 18,
                            boxShadow: "0 4px 32px 0 rgba(229,57,53,0.06)",
                            padding: "2.5rem 2.5rem 2rem 2.5rem",
                            marginBottom: 40,
                            border: `1.5px solid ${theme.border}`,
                            animation: "fadeIn 0.5s cubic-bezier(.4,0,.2,1)",
                        }}
                        aria-labelledby="security-section-title"
                    >
                        <h3
                            id="security-section-title"
                            style={{
                                fontWeight: 800,
                                fontSize: 22,
                                marginBottom: 18,
                                letterSpacing: 0.5,
                            }}
                        >
                            Account & Security
                        </h3>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 22,
                                maxWidth: 420,
                            }}
                        >
                            <div
                                style={{
                                    color: theme.textSecondary,
                                    fontSize: 15,
                                    marginBottom: 8,
                                }}
                            >
                                Last password change: <b>{lastPwdChange}</b>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowChangePwd(true)}
                                style={{
                                    padding: "0.6rem 1.7rem",
                                    borderRadius: 8,
                                    border: "none",
                                    background: theme.accent,
                                    color: "#fff",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    fontSize: 16,
                                    boxShadow: `0 2px 8px ${theme.accent}22`,
                                    transition:
                                        "background 0.2s, box-shadow 0.2s",
                                }}
                            >
                                Change Password
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                style={{
                                    padding: "0.6rem 1.7rem",
                                    borderRadius: 8,
                                    border: `1.5px solid ${
                                        theme.error || "#e53935"
                                    }`,
                                    background: theme.surface,
                                    color: theme.error || "#e53935",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    fontSize: 16,
                                }}
                            >
                                Delete Account
                            </button>
                        </div>
                        <div
                            style={{
                                color: theme.textSecondary,
                                fontSize: 15,
                                marginTop: 22,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <svg
                                width="18"
                                height="18"
                                fill="none"
                                viewBox="0 0 24 24"
                                style={{ marginRight: 4 }}
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke={theme.accent}
                                    strokeWidth="1.5"
                                />
                                <path
                                    d="M12 7v5l3 3"
                                    stroke={theme.accent}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                            More security options coming soon
                        </div>
                        {/* Change Password Modal */}
                        {showChangePwd && (
                            <div
                                style={{
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    width: "100vw",
                                    height: "100vh",
                                    background: "rgba(0,0,0,0.18)",
                                    zIndex: 3000,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                onClick={() => setShowChangePwd(false)}
                            >
                                <form
                                    onClick={(e) => e.stopPropagation()}
                                    onSubmit={handlePwdSubmit}
                                    style={{
                                        background: theme.surface,
                                        borderRadius: 14,
                                        boxShadow: theme.shadow,
                                        padding: "2.2rem 2.2rem 1.5rem 2.2rem",
                                        minWidth: 320,
                                        maxWidth: 400,
                                        width: "95vw",
                                        position: "relative",
                                        color: theme.text,
                                    }}
                                    aria-modal="true"
                                    role="dialog"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setShowChangePwd(false)}
                                        style={{
                                            position: "absolute",
                                            top: 16,
                                            right: 16,
                                            background: "none",
                                            border: "none",
                                            fontSize: 22,
                                            color: theme.accent,
                                            cursor: "pointer",
                                            fontWeight: 700,
                                            zIndex: 10,
                                        }}
                                        aria-label="Close Change Password Modal"
                                    >
                                        ×
                                    </button>
                                    <h4
                                        style={{
                                            fontWeight: 800,
                                            fontSize: 20,
                                            marginBottom: 18,
                                        }}
                                    >
                                        Change Password
                                    </h4>
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 15,
                                            marginBottom: 6,
                                        }}
                                    >
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="current"
                                        value={pwdForm.current}
                                        onChange={handlePwdChange}
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            borderRadius: 6,
                                            border: `1.5px solid ${theme.border}`,
                                            marginBottom: 14,
                                            fontSize: 15,
                                            background:
                                                theme.inputBg || theme.surface,
                                            color: theme.text,
                                        }}
                                        autoFocus
                                    />
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 15,
                                            marginBottom: 6,
                                        }}
                                    >
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="new"
                                        value={pwdForm.new}
                                        onChange={handlePwdChange}
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            borderRadius: 6,
                                            border: `1.5px solid ${theme.border}`,
                                            marginBottom: 14,
                                            fontSize: 15,
                                            background:
                                                theme.inputBg || theme.surface,
                                            color: theme.text,
                                        }}
                                    />
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 15,
                                            marginBottom: 6,
                                        }}
                                    >
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirm"
                                        value={pwdForm.confirm}
                                        onChange={handlePwdChange}
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            borderRadius: 6,
                                            border: `1.5px solid ${theme.border}`,
                                            marginBottom: 18,
                                            fontSize: 15,
                                            background:
                                                theme.inputBg || theme.surface,
                                            color: theme.text,
                                        }}
                                    />
                                    {pwdMsg && (
                                        <div
                                            style={{
                                                color: pwdMsg.includes(
                                                    "success"
                                                )
                                                    ? theme.accent
                                                    : theme.error || "#e53935",
                                                fontWeight: 600,
                                                marginBottom: 10,
                                                fontSize: 15,
                                            }}
                                        >
                                            {pwdMsg}
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 12,
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowChangePwd(false)
                                            }
                                            disabled={pwdLoading}
                                            style={{
                                                padding: "0.5rem 1.5rem",
                                                borderRadius: 8,
                                                border: `1.5px solid ${theme.border}`,
                                                background: theme.surface,
                                                color: theme.textSecondary,
                                                fontWeight: 700,
                                                cursor: pwdLoading
                                                    ? "not-allowed"
                                                    : "pointer",
                                                fontSize: 15,
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={pwdLoading}
                                            style={{
                                                padding: "0.5rem 1.5rem",
                                                borderRadius: 8,
                                                border: "none",
                                                background: theme.accent,
                                                color: "#fff",
                                                fontWeight: 700,
                                                cursor: pwdLoading
                                                    ? "not-allowed"
                                                    : "pointer",
                                                fontSize: 15,
                                                boxShadow: `0 2px 8px ${theme.accent}22`,
                                                opacity: pwdLoading ? 0.7 : 1,
                                                transition:
                                                    "background 0.2s, box-shadow 0.2s",
                                            }}
                                        >
                                            {pwdLoading ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        {/* Delete Account Modal */}
                        {showDeleteConfirm && (
                            <div
                                style={{
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    width: "100vw",
                                    height: "100vh",
                                    background: "rgba(0,0,0,0.18)",
                                    zIndex: 3000,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        background: theme.surface,
                                        borderRadius: 14,
                                        boxShadow: theme.shadow,
                                        padding: "2.2rem 2.2rem 1.5rem 2.2rem",
                                        minWidth: 320,
                                        maxWidth: 400,
                                        width: "95vw",
                                        position: "relative",
                                        color: theme.text,
                                    }}
                                    aria-modal="true"
                                    role="dialog"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDeleteConfirm(false)
                                        }
                                        style={{
                                            position: "absolute",
                                            top: 16,
                                            right: 16,
                                            background: "none",
                                            border: "none",
                                            fontSize: 22,
                                            color: theme.error || "#e53935",
                                            cursor: "pointer",
                                            fontWeight: 700,
                                            zIndex: 10,
                                        }}
                                        aria-label="Close Delete Account Modal"
                                    >
                                        ×
                                    </button>
                                    <h4
                                        style={{
                                            fontWeight: 800,
                                            fontSize: 20,
                                            marginBottom: 18,
                                            color: theme.error || "#e53935",
                                        }}
                                    >
                                        Delete Account
                                    </h4>
                                    <div
                                        style={{
                                            color: theme.textSecondary,
                                            fontSize: 15,
                                            marginBottom: 18,
                                        }}
                                    >
                                        Are you sure you want to{" "}
                                        <b>delete your account</b>? This action
                                        cannot be undone.
                                    </div>
                                    {deleteMsg && (
                                        <div
                                            style={{
                                                color: deleteMsg.includes(
                                                    "deleted"
                                                )
                                                    ? theme.accent
                                                    : theme.error || "#e53935",
                                                fontWeight: 600,
                                                marginBottom: 10,
                                                fontSize: 15,
                                            }}
                                        >
                                            {deleteMsg}
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 12,
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowDeleteConfirm(false)
                                            }
                                            disabled={deleteLoading}
                                            style={{
                                                padding: "0.5rem 1.5rem",
                                                borderRadius: 8,
                                                border: `1.5px solid ${theme.border}`,
                                                background: theme.surface,
                                                color: theme.textSecondary,
                                                fontWeight: 700,
                                                cursor: deleteLoading
                                                    ? "not-allowed"
                                                    : "pointer",
                                                fontSize: 15,
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeleteAccount}
                                            disabled={deleteLoading}
                                            style={{
                                                padding: "0.5rem 1.5rem",
                                                borderRadius: 8,
                                                border: "none",
                                                background:
                                                    theme.error || "#e53935",
                                                color: "#fff",
                                                fontWeight: 700,
                                                cursor: deleteLoading
                                                    ? "not-allowed"
                                                    : "pointer",
                                                fontSize: 15,
                                                boxShadow: `0 2px 8px ${
                                                    theme.error || "#e53935"
                                                }22`,
                                                opacity: deleteLoading
                                                    ? 0.7
                                                    : 1,
                                                transition:
                                                    "background 0.2s, box-shadow 0.2s",
                                            }}
                                        >
                                            {deleteLoading
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                )}
                {/* Animations and Responsive Fixes */}
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(24px); }
                        to { opacity: 1; transform: none; }
                    }
                    /* --- Universal Styles --- */
                    section {
                        background: var(--settings-card-bg, #fff);
                        border-radius: 18px;
                        box-shadow: 0 4px 24px 0 rgba(229,57,53,0.08);
                        margin-bottom: 32px;
                        padding: 2.2rem 2rem 1.7rem 2rem;
                        border: 1.5px solid var(--settings-card-border, #eee);
                        transition: box-shadow 0.2s, border 0.2s;
                    }
                    section h3 {
                        font-size: 22px;
                        font-weight: 800;
                        margin-bottom: 18px;
                        letter-spacing: 0.5px;
                        color: var(--settings-title, #e53935);
                    }
                    section label {
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 6px;
                        color: var(--settings-label, #b71c1c);
                    }
                    section input,
                    section select {
                        font-size: 16px;
                        padding: 0.6rem 1rem;
                        border-radius: 8px;
                        border: 1.5px solid var(--settings-input-border, #ddd);
                        margin-bottom: 18px;
                        background: var(--settings-input-bg, #fafbfc);
                        color: var(--settings-input-text, #222);
                        width: 100%;
                        box-sizing: border-box;
                        transition: border 0.2s, box-shadow 0.2s;
                    }
                    section input:focus,
                    section select:focus {
                        border-color: var(--settings-accent, #e53935);
                        box-shadow: 0 0 0 2px rgba(229,57,53,0.12);
                        outline: none;
                    }
                    section button {
                        font-size: 16px;
                        font-weight: 700;
                        border-radius: 10px;
                        padding: 0.7rem 1.7rem;
                        margin-right: 10px;
                        margin-bottom: 8px;
                        min-width: 40px;
                        min-height: 40px;
                        box-shadow: 0 2px 8px #e5393522;
                        border: none;
                        background: var(--settings-accent, #e53935);
                        color: #fff;
                        cursor: pointer;
                        transition: background 0.18s, box-shadow 0.18s, color 0.18s;
                    }
                    section button:active,
                    section button:focus {
                        background: var(--settings-accent-dark, #b71c1c);
                        color: #fff;
                    }
                    section button[disabled] {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }
                    section .settings-divider {
                        height: 0;
                        border-top: 1.5px solid #e5393533;
                        margin: 18px 0 32px 0;
                    }
                    /* --- Profile Section --- */
                    .profile-section {
                        display: flex;
                        align-items: center;
                        gap: 40px;
                        flex-wrap: wrap;
                        padding: 2rem 2rem 1.5rem 2rem;
                        background: var(--settings-card-bg, #fff);
                        border-radius: 18px;
                        box-shadow: 0 4px 24px 0 rgba(229,57,53,0.08);
                        border: 1.5px solid var(--settings-card-border, #eee);
                        margin-bottom: 32px;
                        transition: box-shadow 0.2s, border 0.2s;
                    }
                    .profile-section img {
                        width: 96px;
                        height: 96px;
                        border-radius: 50%;
                        border: 3px solid var(--settings-accent, #e53935);
                        box-shadow: 0 2px 12px #e5393522;
                        object-fit: cover;
                        margin-bottom: 0;
                        margin-right: 0;
                    }
                    .profile-section h3 {
                        font-size: 22px;
                        font-weight: 800;
                        margin: 0 0 8px 0;
                        letter-spacing: 0.5px;
                    }
                    .profile-section p {
                        color: var(--settings-label, #b71c1c);
                        margin: 8px 0 22px 0;
                        font-size: 17px;
                        font-weight: 500;
                    }
                    .profile-section .profile-actions {
                        display: flex;
                        gap: 16px;
                        margin-top: 12px;
                    }
                    .profile-section input[type="text"],
                    .profile-section input[type="email"] {
                        font-size: 17px;
                        padding: 0.5rem 1rem;
                        border-radius: 8px;
                        border: 1.5px solid var(--settings-input-border, #ddd);
                        margin-bottom: 10px;
                        background: var(--settings-input-bg, #fafbfc);
                        color: var(--settings-input-text, #222);
                        width: 100%;
                        box-sizing: border-box;
                    }
                    .profile-section input[type="text"]:focus,
                    .profile-section input[type="email"]:focus {
                        border-color: var(--settings-accent, #e53935);
                        box-shadow: 0 0 0 2px rgba(229,57,53,0.12);
                        outline: none;
                    }
                    /* --- Drawer --- */
                    .settings-drawer {
                        width: 320px !important;
                        min-width: 0 !important;
                        padding: 2rem 1.2rem 2rem 1.2rem !important;
                        border-radius: 16px 0 0 16px;
                        box-shadow: 0 8px 32px 0 rgba(229,57,53,0.13);
                    }
                    .settings-drawer h2 {
                        font-size: 20px !important;
                        margin-bottom: 22px !important;
                    }
                    .settings-drawer button {
                        font-size: 16px !important;
                        padding: 0.9rem 1.3rem !important;
                        min-width: 44px;
                        min-height: 44px;
                        border-radius: 10px;
                    }
                    /* --- Responsive Styles --- */
                    @media (max-width: 700px) {
                        main {
                            padding: 0.7rem 0.2rem !important;
                        }
                        section, .profile-section {
                            padding: 1.1rem 0.5rem 0.8rem 0.5rem !important;
                            border-radius: 13px !important;
                            margin-bottom: 18px !important;
                            box-shadow: 0 2px 10px 0 rgba(229,57,53,0.07);
                        }
                        section h3, .profile-section h3 {
                            font-size: 17px !important;
                            margin-bottom: 8px !important;
                        }
                        section label, .profile-section label {
                            font-size: 14px !important;
                        }
                        section input, section select, .profile-section input, .profile-section select {
                            font-size: 15px !important;
                            padding: 0.5rem 0.7rem !important;
                            border-radius: 7px !important;
                        }
                        section button, .profile-section button, .settings-drawer button {
                            font-size: 15px !important;
                            padding: 0.6rem 1.1rem !important;
                            min-width: 40px !important;
                            min-height: 40px !important;
                        }
                        .profile-section {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                            gap: 18px !important;
                        }
                        .profile-section img {
                            width: 64px !important;
                            height: 64px !important;
                            margin-bottom: 8px !important;
                        }
                        .profile-section .profile-actions {
                            gap: 10px !important;
                            margin-top: 8px !important;
                        }
                        .settings-drawer {
                            width: 90vw !important;
                            min-width: 0 !important;
                            padding: 1.1rem 0.5rem 0.8rem 0.5rem !important;
                            border-radius: 0 13px 13px 0 !important;
                        }
                        .settings-drawer h2 {
                            font-size: 16px !important;
                            margin-bottom: 12px !important;
                        }
                        .settings-sidebar button span:not(:first-child),
                        .settings-drawer button span:not(:first-child) {
                            display: none !important;
                        }
                        .settings-sidebar button, .settings-drawer button {
                            justify-content: center !important;
                            padding-left: 0.5rem !important;
                            padding-right: 0.5rem !important;
                        }
                        .settings-sidebar {
                            width: 60px !important;
                            min-width: 60px !important;
                            padding: 1.2rem 0.2rem 1.2rem 0.2rem !important;
                            align-items: center !important;
                        }
                        .settings-drawer {
                            width: 60px !important;
                            min-width: 60px !important;
                            padding: 1.2rem 0.2rem 1.2rem 0.2rem !important;
                            align-items: center !important;
                        }
                        .settings-sidebar button, .settings-drawer button {
                            justify-content: center !important;
                            padding-left: 0.2rem !important;
                            padding-right: 0.2rem !important;
                            width: 40px !important;
                            height: 40px !important;
                            margin-bottom: 18px !important;
                        }
                        .settings-sidebar h2, .settings-drawer h2 {
                            display: none !important;
                        }
                        .settings-main-content {
                            margin-left: 16px !important;
                        }
                    }
                `}</style>
            </main>
        </div>
    );
};

export default Settings;
