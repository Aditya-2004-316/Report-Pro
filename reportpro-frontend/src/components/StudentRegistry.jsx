import React, { useState, useEffect } from "react";

const ACCENT = "#e53935";
const ACCENT_DARK = "#b71c1c";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StudentRegistry({ theme }) {
    const [session, setSession] = useState("");
    const [studentClass, setStudentClass] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [newStudent, setNewStudent] = useState({ rollNo: "", name: "" });
    const [editingIdx, setEditingIdx] = useState(null);
    const [editingStudent, setEditingStudent] = useState({
        rollNo: "",
        name: "",
    });
    const [saving, setSaving] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [removing, setRemoving] = useState(false);

    // Session options (current and next year)
    const currentYear = new Date().getFullYear();
    const sessionOptions = [
        `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
        `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`,
    ];

    // Set default values
    useEffect(() => {
        if (!session) setSession(sessionOptions[0]);
        if (!studentClass) setStudentClass("9th");
    }, []);

    // Fetch registry when session/class changes
    useEffect(() => {
        if (!session || !studentClass) {
            setStudents([]);
            return;
        }
        setLoading(true);
        setError("");
        const token = sessionStorage.getItem("token");
        fetch(
            `${API_BASE}/api/student-registry?session=${session}&class=${studentClass}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                setStudents(data && data.students ? data.students : []);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch student list");
                setLoading(false);
            });
    }, [session, studentClass]);

    function handleAddStudent() {
        if (!newStudent.rollNo.trim() || !newStudent.name.trim()) return;
        setStudents([...students, { ...newStudent }]);
        setNewStudent({ rollNo: "", name: "" });
    }
    function handleEditStudent(idx) {
        setEditingIdx(idx);
        setEditingStudent({ ...students[idx] });
    }
    function handleSaveEditStudent() {
        if (!editingStudent.rollNo.trim() || !editingStudent.name.trim())
            return;
        const updated = [...students];
        updated[editingIdx] = { ...editingStudent };
        setStudents(updated);
        setEditingIdx(null);
        setEditingStudent({ rollNo: "", name: "" });
    }
    function handleDeleteStudent(idx) {
        setStudents(students.filter((_, i) => i !== idx));
    }
    function handleSaveRegistry() {
        if (!session || !studentClass) return;
        setSaving(true);
        setError("");
        const token = sessionStorage.getItem("token");
        fetch(`${API_BASE}/api/student-registry`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                session,
                class: studentClass,
                students,
            }),
        })
            .then((res) => res.json())
            .then(() => {
                setSaving(false);
            })
            .catch(() => {
                setError("Failed to save student list");
                setSaving(false);
            });
    }

    function handleRemoveRegistry() {
        if (!session || !studentClass) return;
        setRemoving(true);
        setError("");
        const token = sessionStorage.getItem("token");
        fetch(`${API_BASE}/api/student-registry`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                session,
                class: studentClass,
            }),
        })
            .then((res) => {
                if (res.ok) {
                    setStudents([]);
                    setShowRemoveConfirm(false);
                } else {
                    throw new Error("Failed to remove registry");
                }
            })
            .catch(() => {
                setError("Failed to remove student list");
            })
            .finally(() => {
                setRemoving(false);
            });
    }

    // Helper function to get theme-aware colors
    const getThemedColors = (theme) => {
        if (theme?.name === "dark") {
            return {
                // Slightly darker than outermost container but lighter than input backgrounds
                sectionBg: "#2a2d30",
                sectionBorder: "#4a4d52",
                // Same color as School Statistics heading in dark mode
                headingColor: "#ff6f61",
                // Same as other dropdown options
                dropdownOptionBg: "#232526",
            };
        } else {
            return {
                sectionBg: "#fff8f8",
                sectionBorder: "#ffe0e0",
                headingColor: ACCENT_DARK,
                dropdownOptionBg: "#fff",
            };
        }
    };

    const themedColors = getThemedColors(theme);

    // Responsive styles (mirrors approach used in other pages)
    const responsiveStyleTag = (
        <style>{`
            /* Large tablets and down */
            @media (max-width: 1024px) {
                .registry-container {
                    max-width: 95vw !important;
                    padding: 1.5rem !important;
                }
                .registry-title {
                    font-size: 24px !important;
                }
            }

            /* Tablets */
            @media (max-width: 768px) {
                .registry-container {
                    max-width: 98vw !important;
                    padding: 1.2rem !important;
                    border-radius: 14px !important;
                }
                .registry-title {
                    font-size: 22px !important;
                    margin-bottom: 18px !important;
                }
                .registry-config-grid,
                .registry-add-row {
                    flex-direction: column !important;
                    gap: 12px !important;
                    align-items: stretch !important;
                }
                .registry-actions {
                    flex-direction: column !important;
                    align-items: stretch !important;
                    gap: 12px !important;
                }
                .registry-btn {
                    width: 100% !important;
                }
                .registry-table th,
                .registry-table td {
                    padding: 10px 8px !important;
                    font-size: 14px !important;
                }
            }

            /* Phones */
            @media (max-width: 480px) {
                .registry-container {
                    padding: 1rem !important;
                    border-radius: 12px !important;
                }
                .registry-title {
                    font-size: 20px !important;
                    margin-bottom: 14px !important;
                }
                .registry-table {
                    min-width: 520px !important; /* keep horizontal scroll but slightly smaller */
                }
                .registry-table th,
                .registry-table td {
                    padding: 8px 6px !important;
                    font-size: 13px !important;
                }
            }

            /* Extra small phones */
            @media (max-width: 360px) {
                .registry-title {
                    font-size: 18px !important;
                }
            }
        `}</style>
    );

    return (
        <>
            {responsiveStyleTag}
            <div
                className="registry-container"
                style={{
                    maxWidth: 900,
                    margin: "2rem auto",
                    background: theme?.surface || "#fff",
                    borderRadius: 16,
                    boxShadow: theme?.shadow || "0 2px 12px #0001",
                    padding: "2rem",
                    color: theme?.text || "#222",
                }}
            >
            <h2
                className="registry-title"
                style={{
                    color: themedColors.headingColor,
                    fontWeight: 800,
                    fontSize: 28,
                    marginBottom: 24,
                    textAlign: "center",
                    paddingBottom: 16,
                    borderBottom: `2px solid ${ACCENT}`,
                }}
            >
                Student Registry Management
            </h2>

            {/* Configuration Section */}
            <div
                className="registry-section registry-config"
                style={{
                    background: themedColors.sectionBg,
                    borderRadius: 12,
                    padding: "20px",
                    marginBottom: 24,
                    border: `1px solid ${themedColors.sectionBorder}`,
                }}
            >
                <h3
                    style={{
                        color: themedColors.headingColor,
                        fontWeight: 700,
                        fontSize: 20,
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <span
                        style={{
                            background: ACCENT,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 14,
                            marginRight: 10,
                        }}
                    >
                        1
                    </span>
                    Configuration
                </h3>
                <div className="registry-config-grid" style={{ display: "flex", gap: 20, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                        <label
                            style={{
                                fontWeight: 600,
                                color: themedColors.headingColor,
                                marginBottom: 6,
                                fontSize: 16,
                                display: "block",
                            }}
                        >
                            Session
                        </label>
                        <select
                            value={session}
                            onChange={(e) => setSession(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 10px",
                                borderRadius: 8,
                                border: `2px solid ${ACCENT}`,
                                fontSize: 16,
                                background: theme?.inputBg || "#fff",
                                color: theme?.text || "#222",
                                fontWeight: 500,
                            }}
                        >
                            {sessionOptions.map((sess) => (
                                <option
                                    key={sess}
                                    value={sess}
                                    style={{ background: themedColors.dropdownOptionBg }}
                                >
                                    {sess}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label
                            style={{
                                fontWeight: 600,
                                color: themedColors.headingColor,
                                marginBottom: 6,
                                fontSize: 16,
                                display: "block",
                            }}
                        >
                            Class
                        </label>
                        <select
                            value={studentClass}
                            onChange={(e) => setStudentClass(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 10px",
                                borderRadius: 8,
                                border: `2px solid ${ACCENT}`,
                                fontSize: 16,
                                background: theme?.inputBg || "#fff",
                                color: theme?.text || "#222",
                                fontWeight: 500,
                            }}
                        >
                            <option value="9th" style={{ background: themedColors.dropdownOptionBg }}>9th</option>
                            <option value="10th" style={{ background: themedColors.dropdownOptionBg }}>10th</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Add Student Section */}
            <div
                className="registry-section registry-add"
                style={{
                    background: themedColors.sectionBg,
                    borderRadius: 12,
                    padding: "20px",
                    marginBottom: 24,
                    border: `1px solid ${themedColors.sectionBorder}`,
                }}
            >
                <h3
                    style={{
                        color: theme?.name === "dark" ? "#64b5f6" : "#1976d2",
                        fontWeight: 700,
                        fontSize: 20,
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <span
                        style={{
                            background: theme?.name === "dark" ? "#64b5f6" : "#1976d2",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 14,
                            marginRight: 10,
                        }}
                    >
                        2
                    </span>
                    Add New Student
                </h3>
                <div className="registry-add-row" style={{ display: "flex", gap: 12, alignItems: "end" }}>
                    <div style={{ flex: 1 }}>
                        <label
                            style={{
                                fontWeight: 600,
                                color: theme?.name === "dark" ? "#64b5f6" : "#1976d2",
                                marginBottom: 6,
                                fontSize: 16,
                                display: "block",
                            }}
                        >
                            Roll No
                        </label>
                        <input
                            value={newStudent.rollNo}
                            onChange={(e) =>
                                setNewStudent({ ...newStudent, rollNo: e.target.value })
                            }
                            placeholder="Enter roll number"
                            style={{
                                width: "100%",
                                fontSize: 16,
                                padding: "12px 10px",
                                borderRadius: 8,
                                border: `2px solid ${theme?.name === "dark" ? "#64b5f6" : "#1976d2"}`,
                                background: theme?.inputBg || "#fff",
                                color: theme?.text || "#222",
                                fontWeight: 500,
                            }}
                        />
                    </div>
                    <div style={{ flex: 2 }}>
                        <label
                            style={{
                                fontWeight: 600,
                                color: theme?.name === "dark" ? "#64b5f6" : "#1976d2",
                                marginBottom: 6,
                                fontSize: 16,
                                display: "block",
                            }}
                        >
                            Full Name
                        </label>
                        <input
                            value={newStudent.name}
                            onChange={(e) =>
                                setNewStudent({ ...newStudent, name: e.target.value })
                            }
                            placeholder="Enter student name"
                            style={{
                                width: "100%",
                                fontSize: 16,
                                padding: "12px 10px",
                                borderRadius: 8,
                                border: `2px solid ${theme?.name === "dark" ? "#64b5f6" : "#1976d2"}`,
                                background: theme?.inputBg || "#fff",
                                color: theme?.text || "#222",
                                fontWeight: 500,
                            }}
                        />
                    </div>
                    <div>
                        <button
                            className="registry-btn"
                            onClick={handleAddStudent}
                            style={{
                                background: theme?.name === "dark" ? "#64b5f6" : "#1976d2",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "12px 20px",
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: "pointer",
                                boxShadow: theme?.shadow,
                                outline: "none",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                            }}
                            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
                            onMouseOut={(e) => (e.target.style.opacity = "1")}
                        >
                            Add Student
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div
                className="registry-actions"
                style={{
                    display: "flex",
                    gap: 16,
                    marginBottom: 24,
                    justifyContent: "flex-end",
                }}
            >
                <button
                    className="registry-btn"
                    onClick={handleSaveRegistry}
                    disabled={saving}
                    style={{
                        background: ACCENT,
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "12px 24px",
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: "pointer",
                        boxShadow: theme?.shadow,
                        outline: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                    onMouseOver={(e) => (e.target.style.opacity = "0.9")}
                    onMouseOut={(e) => (e.target.style.opacity = "1")}
                >
                    {saving ? (
                        <>
                            <span
                                className="spinner"
                                style={{
                                    border: "2px solid #fff",
                                    borderTop: "2px solid transparent",
                                    borderRadius: "50%",
                                    width: 16,
                                    height: 16,
                                    animation: "spin 1s linear infinite",
                                }}
                            ></span>
                            Saving...
                        </>
                    ) : (
                        "Save Registry"
                    )}
                </button>
                <button
                    className="registry-btn"
                    onClick={() => setShowRemoveConfirm(true)}
                    disabled={students.length === 0 || !session || !studentClass}
                    style={{
                        background: "#f44336",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "12px 24px",
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: students.length === 0 || !session || !studentClass ? "not-allowed" : "pointer",
                        boxShadow: theme?.shadow,
                        opacity: students.length === 0 || !session || !studentClass ? 0.5 : 1,
                        outline: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                    onMouseOver={(e) => (e.target.style.opacity = students.length === 0 || !session || !studentClass ? "0.5" : "0.9")}
                    onMouseOut={(e) => (e.target.style.opacity = students.length === 0 || !session || !studentClass ? "0.5" : "1")}
                >
                    Remove Registry
                </button>
            </div>

            {error && (
                <div
                    style={{
                        color: "#f44336",
                        marginBottom: 16,
                        padding: "12px",
                        background:
                            theme?.name === "dark" ? "#424242" : "#ffebee",
                        borderRadius: 8,
                        border:
                            theme?.name === "dark"
                                ? "1px solid #616161"
                                : "1px solid #ffcdd2",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Student List Section */}
            <div
                className="registry-section registry-list"
                style={{
                    background: themedColors.sectionBg,
                    borderRadius: 12,
                    padding: "20px",
                    border: `1px solid ${themedColors.sectionBorder}`,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <h3
                        style={{
                            color:
                                theme?.name === "dark" ? "#81c784" : "#388e3c",
                            fontWeight: 700,
                            fontSize: 20,
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <span
                            style={{
                                background:
                                    theme?.name === "dark"
                                        ? "#81c784"
                                        : "#388e3c",
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: 14,
                                marginRight: 10,
                            }}
                        >
                            3
                        </span>
                        Student List
                    </h3>
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: themedColors.headingColor,
                        }}
                    >
                        Total Students: {students.length}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "30px" }}>
                        <div
                            className="spinner"
                            style={{
                                border: "4px solid #f3f3f3",
                                borderTop: `4px solid ${ACCENT}`,
                                borderRadius: "50%",
                                width: 40,
                                height: 40,
                                animation: "spin 1s linear infinite",
                                margin: "0 auto 15px",
                            }}
                        ></div>
                        <p>Loading students...</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            className="registry-table"
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                marginBottom: 0,
                                minWidth: 600,
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background:
                                            theme?.name === "dark"
                                                ? "#383838"
                                                : "#e8f5e9",
                                    }}
                                >
                                    <th
                                        style={{
                                            padding: "14px 10px",
                                            fontWeight: 700,
                                            color:
                                                theme?.name === "dark"
                                                    ? "#81c784"
                                                    : "#388e3c",
                                            fontSize: 15,
                                            borderBottom: `2px solid ${
                                                theme?.name === "dark"
                                                    ? "#81c784"
                                                    : "#388e3c"
                                            }`,
                                            textAlign: "left",
                                        }}
                                    >
                                        Roll No
                                    </th>
                                    <th
                                        style={{
                                            padding: "14px 10px",
                                            fontWeight: 700,
                                            color:
                                                theme?.name === "dark"
                                                    ? "#81c784"
                                                    : "#388e3c",
                                            fontSize: 15,
                                            borderBottom: `2px solid ${
                                                theme?.name === "dark"
                                                    ? "#81c784"
                                                    : "#388e3c"
                                            }`,
                                            textAlign: "left",
                                        }}
                                    >
                                        Name
                                    </th>
                                    <th
                                        style={{
                                            padding: "14px 10px",
                                            fontWeight: 700,
                                            color:
                                                theme?.name === "dark"
                                                    ? "#81c784"
                                                    : "#388e3c",
                                            fontSize: 15,
                                            borderBottom: `2px solid ${
                                                theme?.name === "dark"
                                                    ? "#81c784"
                                                    : "#388e3c"
                                            }`,
                                            textAlign: "center",
                                        }}
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            style={{
                                                textAlign: "center",
                                                color: theme?.text,
                                                padding: "30px 16px",
                                                fontStyle: "italic",
                                            }}
                                        >
                                            No students found. Add students
                                            using the form above.
                                        </td>
                                    </tr>
                                )}
                                {students.map((s, idx) => (
                                    <tr
                                        key={idx}
                                        style={{
                                            background:
                                                idx % 2 === 0
                                                    ? theme?.name === "dark"
                                                        ? "#2a2d30"
                                                        : "#ffffff"
                                                    : theme?.name === "dark"
                                                    ? "#3a3d40"
                                                    : "#f9f9f9",
                                            transition: "background 0.2s",
                                        }}
                                        onMouseOver={(e) =>
                                            (e.target.closest(
                                                "tr"
                                            ).style.background =
                                                theme?.name === "dark"
                                                    ? "#3d3d3d"
                                                    : "#fff3e0")
                                        }
                                        onMouseOut={(e) =>
                                            (e.target.closest(
                                                "tr"
                                            ).style.background =
                                                idx % 2 === 0
                                                    ? theme?.name === "dark"
                                                        ? "#2a2d30"
                                                        : "#ffffff"
                                                    : theme?.name === "dark"
                                                    ? "#3a3d40"
                                                    : "#f9f9f9")
                                        }
                                    >
                                        <td
                                            style={{
                                                padding: "12px 10px",
                                                fontWeight: 500,
                                                border:
                                                    theme?.name === "dark"
                                                        ? "1px solid #4a4d52"
                                                        : "1px solid #eee",
                                                color: theme?.text,
                                            }}
                                        >
                                            {editingIdx === idx ? (
                                                <input
                                                    value={
                                                        editingStudent.rollNo
                                                    }
                                                    onChange={(e) =>
                                                        setEditingStudent({
                                                            ...editingStudent,
                                                            rollNo: e.target
                                                                .value,
                                                        })
                                                    }
                                                    style={{
                                                        width: 100,
                                                        fontSize: 15,
                                                        padding: "8px 10px",
                                                        borderRadius: 5,
                                                        border: `1.5px solid ${
                                                            theme?.name ===
                                                            "dark"
                                                                ? "#64b5f6"
                                                                : "#1976d2"
                                                        }`,
                                                        background:
                                                            theme?.inputBg ||
                                                            "#fff",
                                                        color:
                                                            theme?.text ||
                                                            "#222",
                                                    }}
                                                />
                                            ) : (
                                                s.rollNo
                                            )}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px 10px",
                                                border:
                                                    theme?.name === "dark"
                                                        ? "1px solid #4a4d52"
                                                        : "1px solid #eee",
                                                color: theme?.text,
                                            }}
                                        >
                                            {editingIdx === idx ? (
                                                <input
                                                    value={editingStudent.name}
                                                    onChange={(e) =>
                                                        setEditingStudent({
                                                            ...editingStudent,
                                                            name: e.target
                                                                .value,
                                                        })
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        fontSize: 15,
                                                        padding: "8px 10px",
                                                        borderRadius: 5,
                                                        border: `1.5px solid ${
                                                            theme?.name ===
                                                            "dark"
                                                                ? "#64b5f6"
                                                                : "#1976d2"
                                                        }`,
                                                        background:
                                                            theme?.inputBg ||
                                                            "#fff",
                                                        color:
                                                            theme?.text ||
                                                            "#222",
                                                    }}
                                                />
                                            ) : (
                                                s.name
                                            )}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px 10px",
                                                textAlign: "center",
                                                border:
                                                    theme?.name === "dark"
                                                        ? "1px solid #4a4d52"
                                                        : "1px solid #eee",
                                                color: theme?.text,
                                            }}
                                        >
                                            {editingIdx === idx ? (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        justifyContent:
                                                            "center",
                                                    }}
                                                >
                                                    <button
                                                        onClick={
                                                            handleSaveEditStudent
                                                        }
                                                        style={{
                                                            background:
                                                                theme?.name ===
                                                                "dark"
                                                                    ? "#81c784"
                                                                    : "#388e3c",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 5,
                                                            padding: "8px 16px",
                                                            fontWeight: 600,
                                                            fontSize: 14,
                                                            cursor: "pointer",
                                                            outline: "none",
                                                        }}
                                                        onMouseOver={(e) =>
                                                            (e.target.style.opacity =
                                                                "0.9")
                                                        }
                                                        onMouseOut={(e) =>
                                                            (e.target.style.opacity =
                                                                "1")
                                                        }
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setEditingIdx(null)
                                                        }
                                                        style={{
                                                            background:
                                                                theme?.name ===
                                                                "dark"
                                                                    ? "#424242"
                                                                    : "#f5f5f5",
                                                            color:
                                                                theme?.name ===
                                                                "dark"
                                                                    ? "#e0e0e0"
                                                                    : "#666",
                                                            border:
                                                                theme?.name ===
                                                                "dark"
                                                                    ? `1px solid #616161`
                                                                    : `1px solid #ddd`,
                                                            borderRadius: 5,
                                                            padding: "8px 16px",
                                                            fontWeight: 600,
                                                            fontSize: 14,
                                                            cursor: "pointer",
                                                            outline: "none",
                                                        }}
                                                        onMouseOver={(e) =>
                                                            (e.target.style.background =
                                                                theme?.name ===
                                                                "dark"
                                                                    ? "#616161"
                                                                    : "#e0e0e0")
                                                        }
                                                        onMouseOut={(e) =>
                                                            (e.target.style.background =
                                                                theme?.name ===
                                                                "dark"
                                                                    ? "#424242"
                                                                    : "#f5f5f5")
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        justifyContent:
                                                            "center",
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleEditStudent(
                                                                idx
                                                            )
                                                        }
                                                        style={{
                                                            background:
                                                                theme?.name ===
                                                                "dark"
                                                                    ? "#64b5f6"
                                                                    : "#1976d2",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 5,
                                                            padding: "8px 16px",
                                                            fontWeight: 600,
                                                            fontSize: 14,
                                                            cursor: "pointer",
                                                            outline: "none",
                                                        }}
                                                        onMouseOver={(e) =>
                                                            (e.target.style.opacity =
                                                                "0.9")
                                                        }
                                                        onMouseOut={(e) =>
                                                            (e.target.style.opacity =
                                                                "1")
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteStudent(
                                                                idx
                                                            )
                                                        }
                                                        style={{
                                                            background:
                                                                "#f44336",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 5,
                                                            padding: "8px 16px",
                                                            fontWeight: 600,
                                                            fontSize: 14,
                                                            cursor: "pointer",
                                                            outline: "none",
                                                        }}
                                                        onMouseOver={(e) =>
                                                            (e.target.style.opacity =
                                                                "0.9")
                                                        }
                                                        onMouseOut={(e) =>
                                                            (e.target.style.opacity =
                                                                "1")
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showRemoveConfirm && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 3000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            background: theme?.surface || "#fff",
                            borderRadius: 16,
                            boxShadow: theme?.shadow || "0 4px 20px #0003",
                            padding: "2rem",
                            maxWidth: 500,
                            width: "90%",
                            color: theme?.text || "#222",
                            textAlign: "center",
                        }}
                    >
                        <h3
                            style={{
                                color: "#f44336",
                                fontWeight: 800,
                                fontSize: 24,
                                marginBottom: 16,
                            }}
                        >
                            Confirm Removal
                        </h3>
                        <div
                            style={{
                                fontSize: 17,
                                marginBottom: 24,
                                lineHeight: 1.6,
                            }}
                        >
                            Are you sure you want to remove the student registry
                            for <strong>{studentClass}</strong> class,{" "}
                            <strong>{session}</strong> session?
                            <br />
                            <span style={{ color: "#f44336", fontWeight: 600 }}>
                                This action cannot be undone and will
                                permanently delete all {students.length}{" "}
                                student(s).
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 16,
                                justifyContent: "center",
                            }}
                        >
                            <button
                                onClick={handleRemoveRegistry}
                                disabled={removing}
                                style={{
                                    background: "#f44336",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "12px 24px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    boxShadow: theme?.shadow,
                                    outline: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                                onMouseOver={(e) =>
                                    (e.target.style.opacity = "0.9")
                                }
                                onMouseOut={(e) =>
                                    (e.target.style.opacity = "1")
                                }
                            >
                                {removing ? (
                                    <>
                                        <span
                                            className="spinner"
                                            style={{
                                                border: "2px solid #fff",
                                                borderTop:
                                                    "2px solid transparent",
                                                borderRadius: "50%",
                                                width: 16,
                                                height: 16,
                                                animation:
                                                    "spin 1s linear infinite",
                                            }}
                                        ></span>
                                        Removing...
                                    </>
                                ) : (
                                    "Remove Registry"
                                )}
                            </button>
                            <button
                                onClick={() => setShowRemoveConfirm(false)}
                                style={{
                                    background:
                                        theme?.name === "dark"
                                            ? "#424242"
                                            : "#f5f5f5",
                                    color:
                                        theme?.name === "dark"
                                            ? "#e0e0e0"
                                            : "#666",
                                    border:
                                        theme?.name === "dark"
                                            ? `1px solid #616161`
                                            : `1px solid #ddd`,
                                    borderRadius: 8,
                                    padding: "12px 24px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    boxShadow: theme?.shadow,
                                    outline: "none",
                                }}
                                onMouseOver={(e) =>
                                    (e.target.style.background =
                                        theme?.name === "dark"
                                            ? "#616161"
                                            : "#e0e0e0")
                                }
                                onMouseOut={(e) =>
                                    (e.target.style.background =
                                        theme?.name === "dark"
                                            ? "#424242"
                                            : "#f5f5f5")
                                }
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .spinner {
                    display: inline-block;
                }
            `}</style>
            </div>
        </>
    );
}

export default StudentRegistry;
