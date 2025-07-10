import React from "react";

function ThemeToggle({ theme, setTheme }) {
    const isDark = theme === "dark";
    return (
        <button
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            style={{
                background: isDark ? "#232526" : "#fff",
                border: "none",
                borderRadius: 20,
                width: 48,
                height: 28,
                display: "flex",
                alignItems: "center",
                position: "relative",
                cursor: "pointer",
                boxShadow: isDark ? "0 2px 8px #0002" : "0 2px 8px #e5393533",
                transition: "background 0.3s, box-shadow 0.3s",
                outline: "none",
                marginRight: 10,
                padding: 0,
            }}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    setTheme(isDark ? "light" : "dark");
                }
            }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <span
                style={{
                    position: "absolute",
                    left: isDark ? 24 : 4,
                    top: 3,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: isDark ? "#ffeaea" : "#b71c1c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isDark ? "#b71c1c" : "#fff",
                    fontSize: 16,
                    transition: "left 0.3s, background 0.3s, color 0.3s",
                    boxShadow: isDark
                        ? "0 2px 8px #b71c1c33"
                        : "0 2px 8px #e5393533",
                }}
            >
                {isDark ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="5" fill="#b71c1c" />
                        <g stroke="#b71c1c" strokeWidth="2">
                            <line x1="12" y1="2" x2="12" y2="5" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                            <line x1="2" y1="12" x2="5" y2="12" />
                            <line x1="19" y1="12" x2="22" y2="12" />
                            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
                            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
                            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
                            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
                        </g>
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                            fill="#fff"
                            stroke="#fff"
                            strokeWidth="2"
                        />
                    </svg>
                )}
            </span>
        </button>
    );
}

export default ThemeToggle;
