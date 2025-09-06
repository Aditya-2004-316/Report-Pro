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

    return (
        <div
            style={{
                maxWidth: 700,
                margin: "2rem auto",
                background: theme?.surface || "#fff",
                borderRadius: 16,
                boxShadow: theme?.shadow || "0 2px 12px #0001",
                padding: "2rem 2.5rem",
                color: theme?.text || "#222",
            }}
        >
            <h2
                style={{
                    color: ACCENT_DARK,
                    fontWeight: 800,
                    fontSize: 26,
                    marginBottom: 18,
                    textAlign: "center",
                }}
            >
                Student Registry
            </h2>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                    <label
                        style={{
                            fontWeight: 700,
                            color: ACCENT,
                            marginBottom: 4,
                            fontSize: 16,
                        }}
                    >
                        Session
                    </label>
                    <select
                        value={session}
                        onChange={(e) => setSession(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 8px",
                            borderRadius: 6,
                            border: `1.5px solid ${
                                theme?.inputBorder || "#ccc"
                            }`,
                            fontSize: 16,
                            marginBottom: 0,
                            background: theme?.inputBg || "#fff",
                            color: theme?.text || "#222",
                        }}
                    >
                        {sessionOptions.map((sess) => (
                            <option key={sess} value={sess}>
                                {sess}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label
                        style={{
                            fontWeight: 700,
                            color: ACCENT,
                            marginBottom: 4,
                            fontSize: 16,
                        }}
                    >
                        Class
                    </label>
                    <select
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 8px",
                            borderRadius: 6,
                            border: `1.5px solid ${
                                theme?.inputBorder || "#ccc"
                            }`,
                            fontSize: 16,
                            marginBottom: 0,
                            background: theme?.inputBg || "#fff",
                            color: theme?.text || "#222",
                        }}
                    >
                        <option value="9th">9th</option>
                        <option value="10th">10th</option>
                    </select>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 24,
                    justifyContent: "flex-end",
                }}
            >
                <button
                    onClick={handleSaveRegistry}
                    disabled={saving}
                    style={{
                        background: ACCENT,
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "10px 18px",
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: "pointer",
                        boxShadow: theme?.shadow,
                        outline: "none",
                    }}
                    onMouseOver={(e) => (e.target.style.border = "none")}
                    onFocus={(e) => (e.target.style.border = "none")}
                    onBlur={(e) => (e.target.style.border = "none")}
                    onMouseDown={(e) => (e.target.style.border = "none")}
                    onMouseUp={(e) => (e.target.style.border = "none")}
                >
                    {saving ? "Saving..." : "Save List"}
                </button>
                <button
                    onClick={() => setShowRemoveConfirm(true)}
                    disabled={
                        students.length === 0 || !session || !studentClass
                    }
                    style={{
                        background: "#e53935",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "8px 16px",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor:
                            students.length === 0 || !session || !studentClass
                                ? "not-allowed"
                                : "pointer",
                        boxShadow: theme?.shadow,
                        opacity:
                            students.length === 0 || !session || !studentClass
                                ? 0.5
                                : 1,
                        outline: "none",
                    }}
                    onMouseOver={(e) => (e.target.style.border = "none")}
                    onFocus={(e) => (e.target.style.border = "none")}
                    onBlur={(e) => (e.target.style.border = "none")}
                    onMouseDown={(e) => (e.target.style.border = "none")}
                    onMouseUp={(e) => (e.target.style.border = "none")}
                >
                    Remove Registry
                </button>
            </div>
            {error && (
                <div style={{ color: ACCENT, marginBottom: 12 }}>{error}</div>
            )}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginBottom: 18,
                    }}
                >
                    <thead>
                        <tr style={{ background: theme?.inputBg || "#f7f7f7" }}>
                            <th
                                style={{
                                    padding: "8px 6px",
                                    fontWeight: 700,
                                    color: ACCENT_DARK,
                                    fontSize: 15,
                                    borderBottom: `2px solid ${ACCENT}`,
                                }}
                            >
                                Roll No
                            </th>
                            <th
                                style={{
                                    padding: "8px 6px",
                                    fontWeight: 700,
                                    color: ACCENT_DARK,
                                    fontSize: 15,
                                    borderBottom: `2px solid ${ACCENT}`,
                                }}
                            >
                                Name
                            </th>
                            <th
                                style={{
                                    padding: "8px 6px",
                                    fontWeight: 700,
                                    color: ACCENT_DARK,
                                    fontSize: 15,
                                    borderBottom: `2px solid ${ACCENT}`,
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
                                        opacity: 0.7,
                                        padding: 16,
                                    }}
                                >
                                    No students added yet.
                                </td>
                            </tr>
                        )}
                        {students.map((s, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: "8px 6px" }}>
                                    {editingIdx === idx ? (
                                        <input
                                            value={editingStudent.rollNo}
                                            onChange={(e) =>
                                                setEditingStudent({
                                                    ...editingStudent,
                                                    rollNo: e.target.value,
                                                })
                                            }
                                            style={{
                                                width: 100,
                                                fontSize: 15,
                                                padding: "6px 8px",
                                                borderRadius: 5,
                                                border: `1.5px solid ${
                                                    theme?.inputBorder || "#ccc"
                                                }`,
                                                background:
                                                    theme?.inputBg || "#fff",
                                                color: theme?.text || "#222",
                                            }}
                                        />
                                    ) : (
                                        s.rollNo
                                    )}
                                </td>
                                <td style={{ padding: "8px 6px" }}>
                                    {editingIdx === idx ? (
                                        <input
                                            value={editingStudent.name}
                                            onChange={(e) =>
                                                setEditingStudent({
                                                    ...editingStudent,
                                                    name: e.target.value,
                                                })
                                            }
                                            style={{
                                                width: 180,
                                                fontSize: 15,
                                                padding: "6px 8px",
                                                borderRadius: 5,
                                                border: `1.5px solid ${
                                                    theme?.inputBorder || "#ccc"
                                                }`,
                                                background:
                                                    theme?.inputBg || "#fff",
                                                color: theme?.text || "#222",
                                            }}
                                        />
                                    ) : (
                                        s.name
                                    )}
                                </td>
                                <td style={{ padding: "8px 6px" }}>
                                    {editingIdx === idx ? (
                                        <>
                                            <button
                                                onClick={handleSaveEditStudent}
                                                style={{
                                                    marginRight: 6,
                                                    background: ACCENT,
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: 5,
                                                    padding: "6px 14px",
                                                    fontWeight: 700,
                                                    fontSize: 14,
                                                    cursor: "pointer",
                                                    outline: "none",
                                                }}
                                                onMouseOver={(e) =>
                                                    (e.target.style.border =
                                                        "none")
                                                }
                                                onFocus={(e) =>
                                                    (e.target.style.border =
                                                        "none")
                                                }
                                                onBlur={(e) =>
                                                    (e.target.style.border =
                                                        "none")
                                                }
                                                onMouseDown={(e) =>
                                                    (e.target.style.border =
                                                        "none")
                                                }
                                                onMouseUp={(e) =>
                                                    (e.target.style.border =
                                                        "none")
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
                                                        theme?.surface ||
                                                        "#fff",
                                                    color: ACCENT_DARK,
                                                    border: `2px solid ${ACCENT}`,
                                                    borderRadius: 5,
                                                    padding: "6px 14px",
                                                    fontWeight: 700,
                                                    fontSize: 14,
                                                    cursor: "pointer",
                                                    outline: "none",
                                                }}
                                                onMouseOver={(e) =>
                                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                                }
                                                onFocus={(e) =>
                                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                                }
                                                onBlur={(e) =>
                                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                                }
                                                onMouseDown={(e) =>
                                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                                }
                                                onMouseUp={(e) =>
                                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                                }
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleEditStudent(idx)
                                                }
                                                style={{
                                                    marginRight: 6,
                                                    background: ACCENT,
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: 5,
                                                    padding: "6px 14px",
                                                    fontWeight: 700,
                                                    fontSize: 14,
                                                    cursor: "pointer",
                                                    outline: "none",
                                                }}
                                                onMouseOver={(e) =>
                                                    (e.target.style.border =
                                                        "none")
                                                }
                                                onFocus={(e) =>
                                                    (e.target.style.border =
                                                        "none")
                                                }
                                                onBlur={(e) =>
                                                    (e.target.style.border =
                                                        "none")
                                                }
                                                onMouseDown={(e) =>
                                                    (e.target.style.border =
                                                        "none")
                                                }
                                                onMouseUp={(e) =>
                                                    (e.target.style.border =
                                                        "none")
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteStudent(idx)
                                                }
                                                style={{
                                                    background:
                                                        theme?.surface ||
                                                        "#fff",
                                                    color: ACCENT_DARK,
                                                    border: `2px solid ${ACCENT}`,
                                                    borderRadius: 5,
                                                    padding: "6px 14px",
                                                    fontWeight: 700,
                                                    fontSize: 14,
                                                    cursor: "pointer",
                                                    outline: "none",
                                                }}
                                                onMouseOver={(e) =>
                                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                                }
                                                onFocus={(e) =>
                                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                                }
                                                onBlur={(e) =>
                                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                                }
                                                onMouseDown={(e) =>
                                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                                }
                                                onMouseUp={(e) =>
                                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td style={{ padding: "8px 6px" }}>
                                <input
                                    value={newStudent.rollNo}
                                    onChange={(e) =>
                                        setNewStudent({
                                            ...newStudent,
                                            rollNo: e.target.value,
                                        })
                                    }
                                    placeholder="Roll No"
                                    style={{
                                        width: 100,
                                        fontSize: 15,
                                        padding: "6px 8px",
                                        borderRadius: 5,
                                        border: `1.5px solid ${
                                            theme?.inputBorder || "#ccc"
                                        }`,
                                        background: theme?.inputBg || "#fff",
                                        color: theme?.text || "#222",
                                    }}
                                />
                            </td>
                            <td style={{ padding: "8px 6px" }}>
                                <input
                                    value={newStudent.name}
                                    onChange={(e) =>
                                        setNewStudent({
                                            ...newStudent,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Name"
                                    style={{
                                        width: 180,
                                        fontSize: 15,
                                        padding: "6px 8px",
                                        borderRadius: 5,
                                        border: `1.5px solid ${
                                            theme?.inputBorder || "#ccc"
                                        }`,
                                        background: theme?.inputBg || "#fff",
                                        color: theme?.text || "#222",
                                    }}
                                />
                            </td>
                            <td style={{ padding: "8px 6px" }}>
                                <button
                                    onClick={handleAddStudent}
                                    style={{
                                        background: ACCENT,
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 5,
                                        padding: "6px 14px",
                                        fontWeight: 700,
                                        fontSize: 14,
                                        cursor: "pointer",
                                        outline: "none",
                                    }}
                                    onMouseOver={(e) =>
                                        (e.target.style.border = "none")
                                    }
                                    onFocus={(e) =>
                                        (e.target.style.border = "none")
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.border = "none")
                                    }
                                    onMouseDown={(e) =>
                                        (e.target.style.border = "none")
                                    }
                                    onMouseUp={(e) =>
                                        (e.target.style.border = "none")
                                    }
                                >
                                    Add
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
            {showRemoveConfirm && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.25)",
                        zIndex: 3000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            background: theme?.surface || "#fff",
                            borderRadius: 14,
                            boxShadow: theme?.shadow || "0 2px 12px #0001",
                            padding: "2rem 2.5rem",
                            minWidth: 400,
                            maxWidth: "90vw",
                            color: theme?.text || "#222",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 18,
                        }}
                    >
                        <h3
                            style={{
                                color: "#e53935",
                                fontWeight: 800,
                                fontSize: 20,
                                marginBottom: 8,
                            }}
                        >
                            Remove Student Registry
                        </h3>
                        <div
                            style={{
                                fontSize: 16,
                                marginBottom: 20,
                                lineHeight: 1.5,
                            }}
                        >
                            Are you sure you want to remove the student list for{" "}
                            <strong>{studentClass}</strong> class,{" "}
                            <strong>{session}</strong> session?
                            <br />
                            This action cannot be undone and will permanently
                            delete all {students.length} student(s) from this
                            registry.
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                            <button
                                onClick={handleRemoveRegistry}
                                disabled={removing}
                                style={{
                                    background: "#e53935",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "8px 22px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    boxShadow: theme?.shadow,
                                    outline: "none",
                                }}
                                onMouseOver={(e) =>
                                    (e.target.style.border = "none")
                                }
                                onFocus={(e) =>
                                    (e.target.style.border = "none")
                                }
                                onBlur={(e) => (e.target.style.border = "none")}
                                onMouseDown={(e) =>
                                    (e.target.style.border = "none")
                                }
                                onMouseUp={(e) =>
                                    (e.target.style.border = "none")
                                }
                            >
                                {removing ? "Removing..." : "Remove Registry"}
                            </button>
                            <button
                                onClick={() => setShowRemoveConfirm(false)}
                                style={{
                                    background: theme?.surface || "#fff",
                                    color: ACCENT_DARK,
                                    border: `2px solid ${ACCENT}`,
                                    borderRadius: 6,
                                    padding: "8px 22px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    boxShadow: theme?.shadow,
                                    outline: "none",
                                }}
                                onMouseOver={(e) =>
                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                }
                                onFocus={(e) =>
                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                }
                                onBlur={(e) =>
                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                }
                                onMouseDown={(e) =>
                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                }
                                onMouseUp={(e) =>
                                    (e.target.style.border = `2px solid ${ACCENT}`)
                                }
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentRegistry;
