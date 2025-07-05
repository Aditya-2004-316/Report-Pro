import React, { useEffect, useState, useRef } from "react";
import { SUBJECTS } from "./subjects";
import { MdDelete } from "react-icons/md";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StudentList({
    accent = "#e53935",
    accentDark = "#b71c1c",
    session,
    setSession,
    token,
    theme = "light",
}) {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const csvLinkRef = useRef();
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        rollNo: null,
        subject: null,
        session: null,
    });
    const [subject, setSubject] = useState("Science");
    const [selectedClass, setSelectedClass] = useState("9th");
    const [deleteStudentModal, setDeleteStudentModal] = useState({
        open: false,
        rollNo: null,
    });

    // Only show sessions: currentYear-nextYear and nextYear-yearAfter
    const currentYear = new Date().getFullYear();
    const sessionOptions = [
        `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
        `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`,
    ];

    useEffect(() => {
        if (!session) setSession(sessionOptions[0]);
    }, []);
    useEffect(() => {
        if (!session || !token || !selectedClass) return;
        fetch(
            `${API_BASE}/api/students?session=${session}&class=${selectedClass}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                setStudents(data);
                setLastUpdated(new Date());
            });
    }, [session, token, selectedClass]);

    const filtered = students.filter(
        (s) =>
            s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
            s.subject.toLowerCase().includes(search.toLowerCase())
    );

    const containerStyle = {
        width: "100%",
        maxWidth: 1400,
        margin: "2rem auto",
        background: theme.background,
        borderRadius: 16,
        boxShadow: theme.shadow,
        padding: "2rem 1.5rem",
        boxSizing: "border-box",
        color: theme.text,
    };
    const cardStyle = {
        background: theme.surface,
        borderRadius: 16,
        boxShadow: theme.shadow,
        marginBottom: 36,
        padding: 24,
        transition: "box-shadow 0.2s, transform 0.2s",
        border: `1.5px solid ${theme.border}`,
        position: "relative",
        color: theme.text,
    };
    const cardHover = {
        boxShadow: theme.shadow,
        transform: "translateY(-2px) scale(1.01)",
    };
    const tableStyle = {
        width: "100%",
        borderCollapse: "collapse",
        background: "transparent",
        borderRadius: 12,
        overflow: "hidden",
        fontSize: 16,
        marginBottom: 0,
        marginTop: 8,
        boxShadow: theme.shadow,
        color: theme.text,
    };
    const thStyle = {
        padding: 14,
        textAlign: "left",
        background: theme.surface,
        color: theme.text,
        fontWeight: 700,
        border: `1px solid ${theme.border}`,
        fontSize: 16,
        letterSpacing: 0.5,
    };
    const tdStyle = {
        padding: 12,
        textAlign: "left",
        borderBottom: `1px solid ${theme.border}`,
        wordBreak: "break-word",
        whiteSpace: "normal",
        fontSize: 15,
        background: theme.surface,
        color: theme.text,
    };
    const trAltStyle = {
        background: theme.background,
    };
    const searchStyle = {
        marginBottom: 18,
        padding: 12,
        width: "100%",
        borderRadius: 8,
        border: `1.5px solid ${accent}`,
        fontSize: 16,
        boxSizing: "border-box",
        outline: "none",
        transition: "border 0.2s, box-shadow 0.2s",
        boxShadow: theme.shadow,
        background: theme.inputBg,
        color: theme.text,
    };
    const gradientText = {
        background: "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: 800,
        fontSize: 26,
        marginBottom: 18,
        letterSpacing: 1,
        display: "inline-block",
        textAlign: "center",
        width: "100%",
    };
    const subjectTitle = {
        ...gradientText,
        fontSize: 22,
        marginBottom: 8,
        marginTop: 0,
        textAlign: "left",
    };
    const divider = {
        height: 2,
        background: "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
        opacity: 0.08,
        border: "none",
        margin: "32px 0 24px 0",
    };

    // Group students by subject
    const studentsBySubject = SUBJECTS.reduce((acc, subj) => {
        acc[subj] = filtered.filter((s) => s.subject === subj);
        return acc;
    }, {});

    // Group students by rollNo for summary table
    const studentsByRollNo = {};
    filtered.forEach((s) => {
        if (!studentsByRollNo[s.rollNo]) {
            studentsByRollNo[s.rollNo] = {
                rollNo: s.rollNo,
                name: s.name, // Store the name at the student level
                subjects: {},
                total: 0,
                maxTotal: 0,
            };
        }
        studentsByRollNo[s.rollNo].subjects[s.subject] = {
            theory: s.theory,
            practical: s.practical,
            total: s.total,
            grade: s.grade,
        };
        studentsByRollNo[s.rollNo].total += s.total;
        studentsByRollNo[s.rollNo].maxTotal += 100; // Each subject max 100
    });
    // Helper to get overall grade from percentage with subject failure rule
    function getOverallGrade(percentage, studentSubjects) {
        // Rule 2: If student fails in any subject (E1 or E2), overall grade should be E1
        // unless the percentage would result in E2, then it should be E2
        const hasFailedSubject = Object.values(studentSubjects).some(
            (subject) => subject.grade === "E1" || subject.grade === "E2"
        );

        if (hasFailedSubject) {
            // Check what grade the percentage would normally get
            let normalGrade;
            if (percentage >= 91) normalGrade = "A1";
            else if (percentage >= 81) normalGrade = "A2";
            else if (percentage >= 71) normalGrade = "B1";
            else if (percentage >= 61) normalGrade = "B2";
            else if (percentage >= 51) normalGrade = "C1";
            else if (percentage >= 41) normalGrade = "C2";
            else if (percentage >= 33) normalGrade = "D";
            else if (percentage >= 21) normalGrade = "E1";
            else normalGrade = "E2";

            // If normal grade would be E2, return E2, otherwise return E1
            return normalGrade === "E2" ? "E2" : "E1";
        }

        // Normal grading if no subject failures
        if (percentage >= 91) return "A1";
        if (percentage >= 81) return "A2";
        if (percentage >= 71) return "B1";
        if (percentage >= 61) return "B2";
        if (percentage >= 51) return "C1";
        if (percentage >= 41) return "C2";
        if (percentage >= 33) return "D";
        if (percentage >= 21) return "E1";
        return "E2";
    }

    // Update table styles for summary table
    const summaryTableStyle = {
        ...tableStyle,
        border: "1px solid #f5c6cb",
        minWidth: 900,
    };
    const summaryThBorderColor = "#ef9a9a"; // slightly darker, still subtle
    const summaryThStyle = {
        ...thStyle,
        border: `1px solid ${summaryThBorderColor}`,
        borderBottom: `2px solid ${summaryThBorderColor}`,
        borderRight: `1px solid ${summaryThBorderColor}`,
        borderLeft: `1px solid ${summaryThBorderColor}`,
        borderTop: `1px solid ${summaryThBorderColor}`,
        textAlign: "center",
        verticalAlign: "middle",
        background: theme.surface,
        color: theme.text,
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: 0.5,
    };
    const summaryTdStyle = {
        ...tdStyle,
        border: `1px solid ${summaryThBorderColor}`,
        textAlign: "center",
        background: theme.surface,
        color: theme.text,
        fontSize: 15,
        padding: 12,
    };

    // Add centered styles for per-subject tables
    const subjectThStyle = {
        ...thStyle,
        textAlign: "center",
        verticalAlign: "middle",
        border: `1px solid ${theme.border}`,
        background: theme.surface,
        color: theme.text,
    };
    const subjectTdStyle = {
        ...tdStyle,
        textAlign: "center",
        verticalAlign: "middle",
        border: `1px solid ${theme.border}`,
        background: theme.surface,
        color: theme.text,
    };

    // Heading border style for all table headings
    const headingBorderStyle = {
        borderBottom: "1px solid #fbe9e7",
        paddingBottom: 6,
        marginBottom: 14,
        display: "inline-block",
        width: "auto",
    };

    // Responsive tweaks for mobile/tablet
    const responsiveContainer = {
        ...containerStyle,
        // These will be overridden by media queries below
    };
    // Add responsive styles via a <style> tag
    const responsiveStyleTag = (
        <style>{`
            @media (max-width: 900px) {
                .results-container {
                    max-width: 98vw !important;
                    padding: 1.2rem 0.5rem !important;
                }
                .results-card {
                    padding: 14px !important;
                    margin-bottom: 18px !important;
                }
                .results-table th, .results-table td {
                    font-size: 14px !important;
                    padding: 8px !important;
                }
                .results-header-right {
                    flex-direction: column !important;
                    align-items: flex-end !important;
                    gap: 10px !important;
                    padding-right: 0 !important;
                }
            }
            @media (max-width: 600px) {
                .results-container {
                    max-width: 100vw !important;
                    padding: 0.5rem 0.2rem !important;
                }
                .results-card {
                    padding: 8px !important;
                    margin-bottom: 10px !important;
                }
                .results-table th, .results-table td {
                    font-size: 12px !important;
                    padding: 5px !important;
                }
                .results-summary-title {
                    font-size: 16px !important;
                }
                .results-header-right {
                    flex-direction: column !important;
                    align-items: flex-end !important;
                    gap: 8px !important;
                    padding-right: 0 !important;
                }
            }
        `}</style>
    );

    // CSV Export logic
    function exportCSV() {
        // Only export filtered students
        const rows = [
            [
                "Roll No",
                "Name",
                "Subject",
                "Theory",
                "Practical",
                "Total",
                "Grade",
                "Session",
            ],
            ...filtered.map((s) => [
                s.rollNo,
                s.name,
                s.subject,
                s.theory,
                s.practical,
                s.total,
                s.grade,
                s.session,
            ]),
        ];
        const csvContent = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `students_${session || "all"}.csv`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

    // Add a <style> tag for the Export CSV button active state
    const exportBtnClass = "export-csv-btn";
    const exportBtnStyle = {
        background: theme.surface === "#32353b" ? "#b71c1c" : accent,
        color: "#fff",
        border: "none",
        borderRadius: 6,
        padding: "8px 18px",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
        boxShadow: theme.shadow,
        transition: "background 0.2s, border 0.2s",
    };
    const rightSectionStyle = {
        display: "flex",
        alignItems: "center",
        gap: 24,
        flex: 1,
        justifyContent: "flex-end",
        minWidth: 220,
        paddingRight: 32,
    };
    const lastUpdatedStyle = {
        color: accentDark,
        fontWeight: 500,
        fontSize: 15,
        marginRight: 8,
    };

    // Add this function inside StudentList
    async function handleDeleteStudent(rollNo, subject, session) {
        setDeleteModal({ open: true, rollNo, subject, session });
    }
    async function confirmDeleteStudent() {
        const { rollNo, subject, session } = deleteModal;
        try {
            const res = await fetch(`${API_BASE}/api/students`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rollNo, subject, session }),
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Failed to delete student.");
                setDeleteModal({
                    open: false,
                    rollNo: null,
                    subject: null,
                    session: null,
                });
                return;
            }
            setStudents((prev) =>
                prev.filter(
                    (s) =>
                        !(
                            s.rollNo === rollNo &&
                            s.subject === subject &&
                            s.session === session
                        )
                )
            );
        } catch (err) {
            alert("Failed to delete student.");
        }
        setDeleteModal({
            open: false,
            rollNo: null,
            subject: null,
            session: null,
        });
    }
    function cancelDeleteStudent() {
        setDeleteModal({
            open: false,
            rollNo: null,
            subject: null,
            session: null,
        });
    }

    async function handleDeleteEntireStudent(rollNo) {
        if (
            !window.confirm(
                "Are you sure you want to delete all marks for this student?"
            )
        )
            return;
        try {
            const res = await fetch(`${API_BASE}/api/students/all`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rollNo, session }),
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Failed to delete student.");
                return;
            }
            setStudents((prev) =>
                prev.filter((s) => s.rollNo !== rollNo || s.session !== session)
            );
        } catch (err) {
            alert("Failed to delete student.");
        }
    }

    async function confirmDeleteEntireStudent() {
        const { rollNo } = deleteStudentModal;
        try {
            // Get all subjects for this student
            const studentSubjects = students.filter(
                (s) =>
                    s.rollNo === rollNo &&
                    s.session === session &&
                    s.class === selectedClass
            );

            // Delete each subject individually (temporary workaround until backend is deployed)
            let successCount = 0;
            for (const student of studentSubjects) {
                try {
                    const res = await fetch(`${API_BASE}/api/students`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            rollNo: student.rollNo,
                            subject: student.subject,
                            session: student.session,
                        }),
                    });
                    if (res.ok) {
                        successCount++;
                    }
                } catch (err) {
                    console.error(`Failed to delete ${student.subject}:`, err);
                }
            }

            if (successCount > 0) {
                // Update the UI
                setStudents((prev) =>
                    prev.filter(
                        (s) =>
                            s.rollNo !== rollNo ||
                            s.session !== session ||
                            s.class !== selectedClass
                    )
                );
                alert(
                    `Successfully deleted ${successCount} subject(s) for student ${rollNo}`
                );
            } else {
                alert("Failed to delete any subjects for this student.");
            }
        } catch (err) {
            alert("Failed to delete student.");
        }
        setDeleteStudentModal({ open: false, rollNo: null });
    }
    function cancelDeleteEntireStudent() {
        setDeleteStudentModal({ open: false, rollNo: null });
    }

    return (
        <div className="results-container" style={containerStyle}>
            {responsiveStyleTag}
            <style>{`
                .${exportBtnClass}:active {
                    border: 2px solid #fff !important;
                }
                /* Remove the black border on active state for delete buttons */
                button:active {
                    border: none !important;
                    outline: none !important;
                }
            `}</style>
            <h2 style={gradientText}>Student Results</h2>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 18,
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                <div style={{ maxWidth: 320, flex: 1 }}>
                    <label
                        style={{
                            fontWeight: 700,
                            color: accentDark,
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
                            border: `1.5px solid ${accent}`,
                            fontSize: 16,
                            fontWeight: 600,
                            color: accentDark,
                            background: theme.inputBg,
                            marginTop: 4,
                            marginBottom: 0,
                        }}
                        required
                    >
                        {sessionOptions.map((sess) => (
                            <option key={sess} value={sess}>
                                {sess}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ maxWidth: 180, flex: 1 }}>
                    <label
                        style={{
                            fontWeight: 700,
                            color: accentDark,
                            marginBottom: 4,
                            fontSize: 16,
                        }}
                    >
                        Class
                    </label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 8px",
                            borderRadius: 6,
                            border: `1.5px solid ${accent}`,
                            fontSize: 16,
                            fontWeight: 600,
                            color: accentDark,
                            background: theme.inputBg,
                            marginTop: 4,
                            marginBottom: 0,
                        }}
                        required
                    >
                        <option value="9th">9th</option>
                        <option value="10th">10th</option>
                    </select>
                </div>
                <div className="results-header-right" style={rightSectionStyle}>
                    {lastUpdated && (
                        <span style={lastUpdatedStyle}>
                            Last updated: {lastUpdated.toLocaleString()}
                        </span>
                    )}
                    <button
                        onClick={exportCSV}
                        className={exportBtnClass}
                        style={exportBtnStyle}
                    >
                        Export CSV
                    </button>
                </div>
            </div>
            <input
                type="text"
                placeholder="Search by roll no or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchStyle}
            />
            {/* Summary Table */}
            <div
                className="results-card"
                style={{
                    marginBottom: 36,
                    background: theme.surface,
                    borderRadius: 16,
                    boxShadow: theme.shadow,
                    padding: 24,
                    color: theme.text,
                }}
            >
                <h3
                    className="results-summary-title"
                    style={{
                        ...gradientText,
                        fontSize: 22,
                        marginBottom: 12,
                        textAlign: "left",
                        letterSpacing: 0.5,
                        ...headingBorderStyle,
                    }}
                >
                    All Subjects Summary
                </h3>
                <div style={{ overflowX: "auto" }}>
                    <table className="results-table" style={summaryTableStyle}>
                        <thead
                            style={{
                                borderBottom: `2.5px solid ${summaryThBorderColor}`,
                            }}
                        >
                            <tr>
                                <th style={{ ...summaryThStyle }} rowSpan={2}>
                                    Roll No
                                </th>
                                <th
                                    style={{
                                        ...summaryThStyle,
                                        minWidth: 120,
                                        maxWidth: 300,
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                    }}
                                    rowSpan={2}
                                >
                                    Name
                                </th>
                                {SUBJECTS.map((subj) => (
                                    <th
                                        key={subj}
                                        style={{ ...summaryThStyle }}
                                        colSpan={4}
                                    >
                                        {subj}
                                    </th>
                                ))}
                                <th style={{ ...summaryThStyle }} rowSpan={2}>
                                    Total
                                </th>
                                <th
                                    style={{ ...summaryThStyle, minWidth: 90 }}
                                    rowSpan={2}
                                >
                                    Percentage
                                </th>
                                <th style={{ ...summaryThStyle }} rowSpan={2}>
                                    Grade
                                </th>
                                <th style={{ ...summaryThStyle }} rowSpan={2}>
                                    Delete
                                </th>
                            </tr>
                            <tr>
                                {SUBJECTS.map((subj) => [
                                    <th
                                        key={`${subj}-theory`}
                                        style={summaryThStyle}
                                    >
                                        Theory
                                    </th>,
                                    <th
                                        key={`${subj}-practical`}
                                        style={summaryThStyle}
                                    >
                                        Practical
                                    </th>,
                                    <th
                                        key={`${subj}-total`}
                                        style={summaryThStyle}
                                    >
                                        Total
                                    </th>,
                                    <th
                                        key={`${subj}-grade`}
                                        style={summaryThStyle}
                                    >
                                        Grade
                                    </th>,
                                ])}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(studentsByRollNo).length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={SUBJECTS.length * 4 + 4}
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
                                        const percentage = stu.maxTotal
                                            ? (stu.total / stu.maxTotal) * 100
                                            : 0;
                                        return (
                                            <tr
                                                key={stu.rollNo}
                                                style={
                                                    idx % 2 === 1
                                                        ? trAltStyle
                                                        : {}
                                                }
                                            >
                                                <td style={summaryTdStyle}>
                                                    {stu.rollNo}
                                                </td>
                                                <td
                                                    style={{
                                                        ...summaryTdStyle,
                                                        minWidth: 120,
                                                        maxWidth: 300,
                                                        whiteSpace: "normal",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {stu.name || "-"}
                                                </td>
                                                {SUBJECTS.map((subj) => [
                                                    <td
                                                        key={`${stu.rollNo}-${subj}-theory`}
                                                        style={summaryTdStyle}
                                                    >
                                                        {stu.subjects[subj]
                                                            ?.theory ?? "-"}
                                                    </td>,
                                                    <td
                                                        key={`${stu.rollNo}-${subj}-practical`}
                                                        style={summaryTdStyle}
                                                    >
                                                        {stu.subjects[subj]
                                                            ?.practical ?? "-"}
                                                    </td>,
                                                    <td
                                                        key={`${stu.rollNo}-${subj}-total`}
                                                        style={summaryTdStyle}
                                                    >
                                                        {stu.subjects[subj]
                                                            ?.total ?? "-"}
                                                    </td>,
                                                    <td
                                                        key={`${stu.rollNo}-${subj}-grade`}
                                                        style={summaryTdStyle}
                                                    >
                                                        {stu.subjects[subj]
                                                            ?.grade ?? "-"}
                                                    </td>,
                                                ])}
                                                <td style={summaryTdStyle}>
                                                    {stu.total}
                                                </td>
                                                <td
                                                    style={{
                                                        ...summaryTdStyle,
                                                        minWidth: 90,
                                                    }}
                                                >
                                                    {percentage.toFixed(2)}%
                                                </td>
                                                <td style={summaryTdStyle}>
                                                    {getOverallGrade(
                                                        percentage,
                                                        stu.subjects
                                                    )}
                                                </td>
                                                <td style={summaryTdStyle}>
                                                    <button
                                                        onClick={() =>
                                                            setDeleteStudentModal(
                                                                {
                                                                    open: true,
                                                                    rollNo: stu.rollNo,
                                                                }
                                                            )
                                                        }
                                                        style={{
                                                            background:
                                                                "transparent",
                                                            color:
                                                                theme === "dark"
                                                                    ? "#ff6f60"
                                                                    : "#e53935",
                                                            border: "none",
                                                            borderRadius: 0,
                                                            padding: "8px",
                                                            fontWeight: 400,
                                                            fontSize: 16,
                                                            cursor: "pointer",
                                                            boxShadow: "none",
                                                            minWidth: "auto",
                                                            minHeight: "auto",
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            marginLeft: 4,
                                                            letterSpacing: 0,
                                                            transition:
                                                                "color 0.2s",
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                        aria-label="Delete all marks for this student"
                                                    >
                                                        <MdDelete
                                                            size={22}
                                                            color={
                                                                theme === "dark"
                                                                    ? "#ff6f60"
                                                                    : "#e53935"
                                                            }
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Per-subject tables/cards */}
            {SUBJECTS.map((subj, idx) => (
                <div
                    key={subj}
                    className="results-card"
                    style={cardStyle}
                    onMouseOver={(e) =>
                        Object.assign(e.currentTarget.style, cardHover)
                    }
                    onMouseOut={(e) =>
                        Object.assign(e.currentTarget.style, cardStyle)
                    }
                >
                    <h3 style={{ ...subjectTitle, ...headingBorderStyle }}>
                        {subj}
                    </h3>
                    <div style={{ overflowX: "auto" }}>
                        <table className="results-table" style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={subjectThStyle}>Roll No</th>
                                    <th
                                        style={{
                                            ...subjectThStyle,
                                            minWidth: 120,
                                            maxWidth: 300,
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        Name
                                    </th>
                                    <th style={subjectThStyle}>Theory</th>
                                    <th style={subjectThStyle}>Practical</th>
                                    <th style={subjectThStyle}>Total</th>
                                    <th style={subjectThStyle}>Grade</th>
                                    <th style={subjectThStyle}>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsBySubject[subj].length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            style={{
                                                textAlign: "center",
                                                padding: 16,
                                                color: theme.textSecondary,
                                                background: theme.surface,
                                                fontSize: 16,
                                                fontWeight: 500,
                                            }}
                                        >
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    studentsBySubject[subj].map((s, idx2) => (
                                        <tr
                                            key={s.rollNo}
                                            style={
                                                idx2 % 2 === 1 ? trAltStyle : {}
                                            }
                                        >
                                            <td style={subjectTdStyle}>
                                                {s.rollNo}
                                            </td>
                                            <td
                                                style={{
                                                    ...subjectTdStyle,
                                                    minWidth: 120,
                                                    maxWidth: 300,
                                                    whiteSpace: "normal",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {s.name || "-"}
                                            </td>
                                            <td style={subjectTdStyle}>
                                                {s.theory}
                                            </td>
                                            <td style={subjectTdStyle}>
                                                {s.practical}
                                            </td>
                                            <td style={subjectTdStyle}>
                                                {s.total}
                                            </td>
                                            <td style={subjectTdStyle}>
                                                {s.grade}
                                            </td>
                                            <td style={subjectTdStyle}>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteStudent(
                                                            s.rollNo,
                                                            s.subject,
                                                            s.session
                                                        )
                                                    }
                                                    style={{
                                                        background:
                                                            "transparent",
                                                        color:
                                                            theme === "dark"
                                                                ? "#ff6f60"
                                                                : "#e53935",
                                                        border: "none",
                                                        borderRadius: 0,
                                                        padding: "8px",
                                                        fontWeight: 400,
                                                        fontSize: 16,
                                                        cursor: "pointer",
                                                        boxShadow: "none",
                                                        minWidth: "auto",
                                                        minHeight: "auto",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        marginLeft: 4,
                                                        letterSpacing: 0,
                                                        transition:
                                                            "color 0.2s",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                    aria-label={`Delete marks for ${s.subject} (Roll No: ${s.rollNo})`}
                                                >
                                                    <MdDelete
                                                        size={22}
                                                        color={
                                                            theme === "dark"
                                                                ? "#ff6f60"
                                                                : "#e53935"
                                                        }
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {idx !== SUBJECTS.length - 1 && <hr style={divider} />}
                </div>
            ))}
            {/* Individual Subject Delete Modal */}
            {deleteModal.open && (
                <div
                    style={{
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
                    }}
                >
                    <div
                        style={{
                            background: theme.surface,
                            borderRadius: 14,
                            boxShadow: theme.shadow,
                            padding: "2rem 2.5rem",
                            minWidth: 320,
                            color: theme.text,
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 18,
                        }}
                    >
                        <h3
                            style={{
                                color: accentDark,
                                fontWeight: 800,
                                fontSize: 20,
                                marginBottom: 8,
                            }}
                        >
                            Delete Subject Marks
                        </h3>
                        <div style={{ fontSize: 16, marginBottom: 12 }}>
                            Are you sure you want to delete marks for{" "}
                            <b>{deleteModal.subject}</b> (Roll No:{" "}
                            <b>{deleteModal.rollNo}</b>)?
                        </div>
                        <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
                            <button
                                onClick={cancelDeleteStudent}
                                style={{
                                    background: "#eee",
                                    color: accentDark,
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "8px 20px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    minWidth: 80,
                                    transition: "background 0.2s, color 0.2s",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteStudent}
                                style={{
                                    background: accent,
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "8px 20px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    minWidth: 80,
                                    transition:
                                        "background 0.2s, box-shadow 0.2s",
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete All Student Marks Modal */}
            {deleteStudentModal.open && (
                <div
                    style={{
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
                    }}
                >
                    <div
                        style={{
                            background: theme.surface,
                            borderRadius: 14,
                            boxShadow: theme.shadow,
                            padding: "2rem 2.5rem",
                            minWidth: 320,
                            color: theme.text,
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 18,
                        }}
                    >
                        <h3
                            style={{
                                color: accentDark,
                                fontWeight: 800,
                                fontSize: 20,
                                marginBottom: 8,
                            }}
                        >
                            Delete Student
                        </h3>
                        <div style={{ fontSize: 16, marginBottom: 12 }}>
                            Are you sure you want to <b>delete all marks</b> for
                            student with Roll No:{" "}
                            <b>{deleteStudentModal.rollNo}</b>?
                        </div>
                        <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
                            <button
                                onClick={cancelDeleteEntireStudent}
                                style={{
                                    background: "#eee",
                                    color: accentDark,
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "8px 20px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    minWidth: 80,
                                    transition: "background 0.2s, color 0.2s",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteEntireStudent}
                                style={{
                                    background: accent,
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "8px 20px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    minWidth: 80,
                                    transition:
                                        "background 0.2s, box-shadow 0.2s",
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentList;
