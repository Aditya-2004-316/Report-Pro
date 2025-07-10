import React, { useState, useEffect } from "react";
import { SUBJECTS } from "./subjects";

// Dummy API_BASE for demonstration; replace with actual API if needed
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ExportDataModal({ open, onClose, theme }) {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [session, setSession] = useState("");
    const [selectedClass, setSelectedClass] = useState("9th");
    const [selectedExamType, setSelectedExamType] = useState("Monthly Test");
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Only show sessions: currentYear-nextYear and nextYear-yearAfter
    const currentYear = new Date().getFullYear();
    const sessionOptions = [
        `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
        `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`,
    ];

    useEffect(() => {
        setSession(sessionOptions[0]);
    }, []);

    useEffect(() => {
        if (!session || !selectedClass) return;
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        fetch(
            `${API_BASE}/api/students?session=${session}&class=${selectedClass}`,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
        )
            .then(async (res) => {
                if (!res.ok) {
                    if (res.status === 401) {
                        throw new Error(
                            "Unauthorized: Please log in to export data."
                        );
                    }
                    throw new Error("Failed to fetch students.");
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setStudents(data);
                } else {
                    setStudents([]);
                    setError("Unexpected response from server.");
                }
                setLoading(false);
            })
            .catch((err) => {
                setStudents([]);
                setError(err.message || "Failed to fetch students.");
                setLoading(false);
            });
    }, [session, selectedClass]);

    const filtered = students.filter(
        (s) =>
            (selectedExamType === "All" || s.examType === selectedExamType) &&
            (s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
                s.subject.toLowerCase().includes(search.toLowerCase()))
    );

    // Group students by rollNo and examType for summary table
    const studentsByRollNo = {};
    filtered.forEach((s) => {
        const key = `${s.rollNo}-${s.examType}`;
        if (!studentsByRollNo[key]) {
            studentsByRollNo[key] = {
                rollNo: s.rollNo,
                name: s.name,
                examType: s.examType,
                class: s.class,
                session: s.session,
                subjects: {},
                total: 0,
                maxTotal: 0,
            };
        }
        studentsByRollNo[key].subjects[s.subject] = {
            theory: s.theory,
            practical: s.practical,
            total: s.total,
            grade: s.grade,
        };
        studentsByRollNo[key].total += s.total;
        studentsByRollNo[key].maxTotal += 100; // Each subject max 100
    });

    function getStudentKey(stu) {
        return `${stu.rollNo}-${stu.examType}`;
    }

    function exportCSV() {
        const headerInfo = [
            `Session: ${session || "All Sessions"}`,
            `Class: ${selectedClass}`,
            `Export Date: ${new Date().toLocaleDateString()}`,
            `Export Time: ${new Date().toLocaleTimeString()}`,
            "",
        ];
        const studentsToExport =
            selectedRows.length > 0
                ? Object.values(studentsByRollNo).filter((stu) =>
                      selectedRows.includes(getStudentKey(stu))
                  )
                : Object.values(studentsByRollNo);
        const rows = [
            [
                "Roll No",
                "Name",
                "Class",
                "Subject",
                "Exam Type",
                "Theory",
                "Practical",
                "Total",
                "Grade",
                "Session",
            ],
            ...studentsToExport.flatMap((stu) =>
                SUBJECTS.map((subj) => [
                    stu.rollNo || "",
                    stu.name || "",
                    stu.class || selectedClass || "",
                    subj,
                    stu.examType || "",
                    stu.subjects[subj]?.theory ?? "",
                    stu.subjects[subj]?.practical ?? "",
                    stu.subjects[subj]?.total ?? "",
                    stu.subjects[subj]?.grade ?? "",
                    stu.session || session || "",
                ])
            ),
        ];
        const csvContent = [
            ...headerInfo,
            ...rows.map((r) => r.join(",")),
        ].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `students_${session || "all"}_${selectedClass}.csv`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

    // Modal styles
    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.25)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 0",
        boxSizing: "border-box",
    };
    const modalStyle = {
        background: theme.surface,
        borderRadius: 16,
        boxShadow: theme.shadow,
        padding: "2.5rem 2rem 2rem 2rem",
        minWidth: 320,
        maxWidth: 900,
        width: "95vw",
        position: "relative",
        margin: "3rem auto",
        boxSizing: "border-box",
        color: theme.text,
        maxHeight: "90vh",
        overflowY: "auto",
    };
    const closeBtnStyle = {
        position: "absolute",
        top: 18,
        right: 18,
        background: "none",
        border: "none",
        fontSize: 22,
        color: theme.accent,
        cursor: "pointer",
        fontWeight: 700,
    };
    const thStyle = {
        padding: 10,
        textAlign: "left",
        background: theme.surface,
        color: theme.text,
        fontWeight: 700,
        border: `1px solid ${theme.border}`,
        fontSize: 15,
        letterSpacing: 0.5,
    };
    const tdStyle = {
        padding: 8,
        textAlign: "left",
        borderBottom: `1px solid ${theme.border}`,
        wordBreak: "break-word",
        whiteSpace: "normal",
        fontSize: 14,
        background: theme.surface,
        color: theme.text,
    };
    const summaryTdStyle = {
        ...tdStyle,
        textAlign: "center",
    };
    const summaryThStyle = {
        ...thStyle,
        textAlign: "center",
    };

    if (!open) return null;
    return (
        <div style={overlayStyle} onClick={onClose}>
            <div
                style={modalStyle}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="export-modal-title"
            >
                <button
                    onClick={onClose}
                    style={closeBtnStyle}
                    aria-label="Close Export Data Modal"
                >
                    ×
                </button>
                <h2
                    id="export-modal-title"
                    style={{ fontWeight: 700, marginBottom: 16 }}
                >
                    Export Data
                </h2>
                <div
                    style={{
                        display: "flex",
                        gap: 16,
                        flexWrap: "wrap",
                        marginBottom: 18,
                    }}
                >
                    <div>
                        <label
                            style={{
                                fontWeight: 700,
                                color: theme.accent,
                                marginBottom: 4,
                                fontSize: 15,
                            }}
                        >
                            Session
                        </label>
                        <select
                            value={session}
                            onChange={(e) => setSession(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 6px",
                                borderRadius: 6,
                                border: `1.5px solid ${theme.accent}`,
                                fontSize: 15,
                                fontWeight: 600,
                                color: theme.accent,
                                background: theme.inputBg,
                                marginTop: 4,
                                marginBottom: 0,
                            }}
                        >
                            {sessionOptions.map((sess) => (
                                <option key={sess} value={sess}>
                                    {sess}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label
                            style={{
                                fontWeight: 700,
                                color: theme.accent,
                                marginBottom: 4,
                                fontSize: 15,
                            }}
                        >
                            Class
                        </label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 6px",
                                borderRadius: 6,
                                border: `1.5px solid ${theme.accent}`,
                                fontSize: 15,
                                fontWeight: 600,
                                color: theme.accent,
                                background: theme.inputBg,
                                marginTop: 4,
                                marginBottom: 0,
                            }}
                        >
                            <option value="9th">9th</option>
                            <option value="10th">10th</option>
                        </select>
                    </div>
                    <div>
                        <label
                            style={{
                                fontWeight: 700,
                                color: theme.accent,
                                marginBottom: 4,
                                fontSize: 15,
                            }}
                        >
                            Exam Type
                        </label>
                        <select
                            value={selectedExamType}
                            onChange={(e) =>
                                setSelectedExamType(e.target.value)
                            }
                            style={{
                                width: "100%",
                                padding: "8px 6px",
                                borderRadius: 6,
                                border: `1.5px solid ${theme.accent}`,
                                fontSize: 15,
                                fontWeight: 600,
                                color: theme.accent,
                                background: theme.inputBg,
                                marginTop: 4,
                                marginBottom: 0,
                            }}
                        >
                            <option value="Monthly Test">Monthly Test</option>
                            <option value="Quarterly Exam">
                                Quarterly Exam
                            </option>
                            <option value="Half Monthly Exam">
                                Half Monthly Exam
                            </option>
                            <option value="Annual Exam">Annual Exam</option>
                            <option value="All">All Exam Types</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label
                            style={{
                                fontWeight: 700,
                                color: theme.accent,
                                marginBottom: 4,
                                fontSize: 15,
                            }}
                        >
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by roll no or subject..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "100%",
                                padding: 8,
                                borderRadius: 6,
                                border: `1.5px solid ${theme.accent}`,
                                fontSize: 15,
                                background: theme.inputBg,
                                color: theme.text,
                                marginTop: 4,
                            }}
                        />
                    </div>
                </div>
                {loading ? (
                    <div style={{ textAlign: "center", margin: 24 }}>
                        Loading...
                    </div>
                ) : error ? (
                    <div
                        style={{
                            color: theme.error,
                            textAlign: "center",
                            margin: 24,
                        }}
                    >
                        {error}
                    </div>
                ) : (
                    <div
                        style={{
                            overflowX: "auto",
                            maxHeight: 350,
                            marginBottom: 18,
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                background: "transparent",
                                borderRadius: 12,
                                overflow: "hidden",
                                fontSize: 15,
                                boxShadow: theme.shadow,
                                color: theme.text,
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={summaryThStyle}>
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedRows.length ===
                                                    Object.values(
                                                        studentsByRollNo
                                                    ).length &&
                                                Object.values(studentsByRollNo)
                                                    .length > 0
                                            }
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedRows(
                                                        Object.values(
                                                            studentsByRollNo
                                                        ).map(getStudentKey)
                                                    );
                                                } else {
                                                    setSelectedRows([]);
                                                }
                                            }}
                                            aria-label="Select all students"
                                        />
                                    </th>
                                    <th style={summaryThStyle}>Roll No</th>
                                    <th style={summaryThStyle}>Name</th>
                                    <th style={summaryThStyle}>Exam Type</th>
                                    <th style={summaryThStyle}>Total</th>
                                    <th style={summaryThStyle}>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(studentsByRollNo).length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            style={{
                                                textAlign: "center",
                                                padding: 16,
                                                color: theme.textSecondary,
                                                background: theme.surface,
                                            }}
                                        >
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    Object.values(studentsByRollNo).map(
                                        (stu, idx) => {
                                            const key = getStudentKey(stu);
                                            const percentage = stu.maxTotal
                                                ? (stu.total / stu.maxTotal) *
                                                  100
                                                : 0;
                                            return (
                                                <tr
                                                    key={key}
                                                    style={
                                                        idx % 2 === 1
                                                            ? {
                                                                  background:
                                                                      theme.background,
                                                              }
                                                            : {}
                                                    }
                                                >
                                                    <td style={summaryTdStyle}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.includes(
                                                                key
                                                            )}
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    setSelectedRows(
                                                                        (
                                                                            prev
                                                                        ) => [
                                                                            ...prev,
                                                                            key,
                                                                        ]
                                                                    );
                                                                } else {
                                                                    setSelectedRows(
                                                                        (
                                                                            prev
                                                                        ) =>
                                                                            prev.filter(
                                                                                (
                                                                                    k
                                                                                ) =>
                                                                                    k !==
                                                                                    key
                                                                            )
                                                                    );
                                                                }
                                                            }}
                                                            aria-label={`Select student ${stu.rollNo}`}
                                                        />
                                                    </td>
                                                    <td style={summaryTdStyle}>
                                                        {stu.rollNo}
                                                    </td>
                                                    <td style={summaryTdStyle}>
                                                        {stu.name}
                                                    </td>
                                                    <td style={summaryTdStyle}>
                                                        {stu.examType}
                                                    </td>
                                                    <td style={summaryTdStyle}>
                                                        {stu.total}
                                                    </td>
                                                    <td style={summaryTdStyle}>
                                                        {percentage.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 12,
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: "0.5rem 1.5rem",
                            borderRadius: 8,
                            border: "none",
                            background: theme.error || "#e53935",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={exportCSV}
                        style={{
                            padding: "0.5rem 1.5rem",
                            borderRadius: 8,
                            border: "none",
                            background: theme.accent,
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                        disabled={
                            loading ||
                            Object.values(studentsByRollNo).length === 0
                        }
                    >
                        Export CSV
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExportDataModal;
