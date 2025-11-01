import React, { useState, useEffect, useMemo, useCallback } from "react";
import { SUBJECTS } from "./subjects";
import { calculateSubjectGrade } from "./gradeUtils";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function PreviousYearsModal({ open, onClose, theme, session }) {
    const [selectedSession, setSelectedSession] = useState("");
    const [selectedClass, setSelectedClass] = useState("9th");
    const [selectedExamType, setSelectedExamType] = useState("Monthly Test");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [search, setSearch] = useState("");
    const [students, setStudents] = useState([]);
    const [registryStudents, setRegistryStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);

    const MONTHS = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    // Generate session options - only current session since no previous data exists
    const sessionOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        // Only include current session 2025-26
        return [`${currentYear}-${(currentYear + 1).toString().slice(-2)}`];
    }, []);

    // Set default session when modal opens
    useEffect(() => {
        if (open && sessionOptions.length > 0) {
            setSelectedSession(sessionOptions[0]);
        }
    }, [open, sessionOptions]);

    // Fetch students data when filters change
    const fetchStudentsData = useCallback(async () => {
        if (!open || !selectedSession) return;

        setLoading(true);
        setError("");

        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                setError("Authentication required");
                setLoading(false);
                return;
            }

            // Build API URL with filters
            let apiUrl = `${API_BASE}/api/students?session=${selectedSession}&class=${selectedClass}`;

            if (selectedExamType) {
                apiUrl += `&examType=${selectedExamType}`;
            }

            if (selectedExamType === "Monthly Test" && selectedMonth) {
                apiUrl += `&month=${selectedMonth}`;
            }

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const marksData = await response.json();
            setStudents(Array.isArray(marksData) ? marksData : []);

            // Fetch registry students as well
            try {
                const registryResponse = await fetch(
                    `${API_BASE}/api/student-registry?session=${selectedSession}&class=${selectedClass}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (registryResponse.ok) {
                    const registryData = await registryResponse.json();
                    setRegistryStudents(
                        registryData && registryData.students
                            ? registryData.students
                            : []
                    );
                }
            } catch (registryError) {
                // Silently fail registry fetch, not critical
                setRegistryStudents([]);
            }
        } catch (err) {
            setError("Failed to fetch student data: " + err.message);
            setStudents([]);
            setRegistryStudents([]);
        } finally {
            setLoading(false);
        }
    }, [open, selectedSession, selectedClass, selectedExamType, selectedMonth]);

    // Fetch data when dependencies change
    useEffect(() => {
        if (!open || !selectedSession) return;

        const handler = setTimeout(() => {
            fetchStudentsData();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [fetchStudentsData]);

    // Function to get student name from registry
    const getStudentNameFromRegistry = useCallback(
        (rollNo) => {
            if (!registryStudents || !registryStudents.length) return null;
            const student = registryStudents.find(
                (s) =>
                    s &&
                    s.rollNo &&
                    s.rollNo.toLowerCase() === rollNo.toLowerCase()
            );
            return student ? student.name : null;
        },
        [registryStudents]
    );

    // Ensure students is an array before filtering
    const filtered = useMemo(() => {
        return (students || []).filter(
            (s) =>
                s && // Check if student object exists
                (s.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
                    s.subject?.toLowerCase().includes(search.toLowerCase()))
        );
    }, [students, search]);

    // Group students by rollNo and examType for summary table and sort by roll number
    const studentsByRollNo = useMemo(() => {
        const result = {};
        filtered.forEach((s) => {
            // Skip if student object is invalid
            if (!s || !s.rollNo || !s.examType) return;

            const key = `${s.rollNo}-${s.examType}`;
            if (!result[key]) {
                result[key] = {
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

            // Safely add subject data
            if (s.subject) {
                // Recalculate grade based on exam type - for Monthly Tests, use theory marks
                const grade = calculateSubjectGrade(s.total, s.theory, s.examType);
                result[key].subjects[s.subject] = {
                    theory: s.theory,
                    practical: s.practical,
                    total: s.total,
                    grade: grade,
                };
                result[key].total += s.total || 0;
                // For Monthly Tests, max total is 20, otherwise 100
                result[key].maxTotal += s.examType === "Monthly Test" ? 20 : 100;
            }
        });
        return result;
    }, [filtered]);

    // Create a sorted array of students by roll number
    const sortedStudents = useMemo(() => {
        const studentArray = Object.values(studentsByRollNo);
        return studentArray.sort((a, b) => {
            // Extract numeric part from roll numbers for proper sorting
            const rollA = parseInt(a.rollNo.replace(/\D/g, ""), 10) || 0;
            const rollB = parseInt(b.rollNo.replace(/\D/g, ""), 10) || 0;
            return rollA - rollB;
        });
    }, [studentsByRollNo]);

    const getStudentKey = useCallback((stu) => {
        return `${stu.rollNo}-${stu.examType}`;
    }, []);

    const exportCSV = useCallback(() => {
        const studentsToExport = (students || []).map((student) => ({
            ...student,
            // Use registry name if available, otherwise fall back to stored name
            name:
                getStudentNameFromRegistry(student.rollNo) ||
                student.name ||
                "Unknown",
        }));

        const headerInfo = [
            `Session: ${selectedSession || "All Sessions"}`,
            `Class: ${selectedClass}`,
            `Exam Type: ${selectedExamType}`,
            `Export Date: ${new Date().toLocaleDateString()}`,
            `Export Time: ${new Date().toLocaleTimeString()}`,
            "",
        ];

        const rows = [
            [
                "Roll No",
                "Name",
                "Class",
                "Subject",
                "Exam Type",
                ...(selectedExamType === "Monthly Test" ? ["Month"] : []),
                "Theory",
                "Practical",
                "Total",
                "Grade",
                "Session",
            ],
            ...studentsToExport.flatMap((stu) =>
                SUBJECTS.map((subj) => {
                    const subjectData = stu.subjects?.[subj];
                    const isAbsent = stu.isAbsent || (subjectData && subjectData.grade === "AB");
                    return [
                        stu.rollNo || "",
                        stu.name || "",
                        stu.class || selectedClass || "",
                        subj,
                        stu.examType || "",
                        ...(selectedExamType === "Monthly Test"
                            ? [subjectData?.month || ""]
                            : []),
                        isAbsent ? "AB" : (subjectData?.theory ?? ""),
                        isAbsent ? (stu.examType === "Monthly Test" ? "N/A" : "AB") : (subjectData?.practical ?? ""),
                        isAbsent ? "AB" : (subjectData?.total ?? ""),
                        isAbsent ? "AB" : (subjectData?.grade ?? ""),
                        stu.session || selectedSession || "",
                    ];
                })
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
        a.download = `previous_years_results_${
            selectedSession || "all"
        }_${selectedClass}_${selectedExamType}.csv`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }, [
        students,
        selectedClass,
        selectedExamType,
        selectedMonth,
        selectedSession,
        getStudentNameFromRegistry,
    ]);

    // Update the select all checkbox to use sortedStudents
    const selectAllChecked =
        selectedRows.length === sortedStudents.length &&
        sortedStudents.length > 0;

    // Update the select all handler to use sortedStudents
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(sortedStudents.map(getStudentKey));
        } else {
            setSelectedRows([]);
        }
    };

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
        padding: "1.5rem",
        width: "90%",
        maxWidth: 1200,
        position: "relative",
        margin: "2rem auto",
        boxSizing: "border-box",
        color: theme.text,
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
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
                aria-labelledby="previous-years-modal-title"
            >
                <button
                    onClick={onClose}
                    style={closeBtnStyle}
                    aria-label="Close Previous Years Results Modal"
                >
                    ×
                </button>
                <h2
                    id="previous-years-modal-title"
                    style={{ fontWeight: 700, marginBottom: 16 }}
                >
                    Previous Years Results
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
                            value={selectedSession}
                            onChange={(e) => {
                                setSelectedSession(e.target.value);
                            }}
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
                            <option value="">Select Session</option>
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
                            onChange={(e) => {
                                setSelectedClass(e.target.value);
                            }}
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
                            onChange={(e) => {
                                setSelectedExamType(e.target.value);
                                if (e.target.value !== "Monthly Test") {
                                    setSelectedMonth("");
                                }
                            }}
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
                        </select>
                    </div>
                    {selectedExamType === "Monthly Test" && (
                        <div>
                            <label
                                style={{
                                    fontWeight: 700,
                                    color: theme.accent,
                                    marginBottom: 4,
                                    fontSize: 15,
                                }}
                            >
                                Month
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) =>
                                    setSelectedMonth(e.target.value)
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
                                <option value="">All Months</option>
                                {MONTHS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
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
                            overflowY: "auto",
                            maxHeight: 450,
                            marginBottom: 16,
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
                                    <th rowSpan={2} style={summaryThStyle}>
                                        <input
                                            type="checkbox"
                                            checked={selectAllChecked}
                                            onChange={handleSelectAll}
                                            aria-label="Select all students"
                                        />
                                    </th>
                                    <th rowSpan={2} style={summaryThStyle}>Roll No</th>
                                    <th rowSpan={2} style={summaryThStyle}>Name</th>
                                    <th rowSpan={2} style={summaryThStyle}>Exam Type</th>
                                    {SUBJECTS.map((subj) => (
                                        <th key={`${subj}-header`} colSpan={4} style={summaryThStyle}>
                                            {subj}
                                        </th>
                                    ))}
                                    <th rowSpan={2} style={summaryThStyle}>Overall Total</th>
                                    <th rowSpan={2} style={summaryThStyle}>Percentage</th>
                                    <th rowSpan={2} style={summaryThStyle}>Actions</th>
                                </tr>
                                <tr>
                                    {SUBJECTS.map((subj) => [
                                        <th key={`${subj}-theory`} style={summaryThStyle}>Theory</th>,
                                        <th key={`${subj}-practical`} style={summaryThStyle}>Practical</th>,
                                        <th key={`${subj}-total`} style={summaryThStyle}>Total</th>,
                                        <th key={`${subj}-grade`} style={summaryThStyle}>Grade</th>,
                                    ])}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStudents.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={31}
                                            style={{
                                                textAlign: "center",
                                                padding: 16,
                                                color: theme.textSecondary,
                                                background: theme.surface,
                                            }}
                                        >
                                            No students found. Only the current
                                            session (2025-26) is available for
                                            viewing.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedStudents.map((stu, idx) => {
                                        const key = getStudentKey(stu);
                                        const percentage = stu.maxTotal
                                            ? (stu.total / stu.maxTotal) * 100
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
                                                                e.target.checked
                                                            ) {
                                                                setSelectedRows(
                                                                    (prev) => [
                                                                        ...prev,
                                                                        key,
                                                                    ]
                                                                );
                                                            } else {
                                                                setSelectedRows(
                                                                    (prev) =>
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
                                                {SUBJECTS.map((subj) => {
                                                    const subjectData = stu.subjects[subj];
                                                    const isAbsent = subjectData?.grade === "AB";
                                                    return [
                                                        <td key={`${key}-${subj}-theory`} style={summaryTdStyle}>
                                                            {isAbsent ? "AB" : (subjectData?.theory ?? "-")}
                                                        </td>,
                                                        <td key={`${key}-${subj}-practical`} style={summaryTdStyle}>
                                                            {isAbsent
                                                                ? (stu.examType === "Monthly Test" ? "N/A" : "AB")
                                                                : (stu.examType === "Monthly Test" ? "N/A" : (subjectData?.practical ?? "-"))}
                                                        </td>,
                                                        <td key={`${key}-${subj}-total`} style={summaryTdStyle}>
                                                            {isAbsent ? "AB" : (subjectData?.total ?? "-")}
                                                        </td>,
                                                        <td key={`${key}-${subj}-grade`} style={summaryTdStyle}>
                                                            {isAbsent ? "AB" : (subjectData?.grade ?? "-")}
                                                        </td>,
                                                    ];
                                                })}
                                                <td style={summaryTdStyle}>
                                                    {stu.total}
                                                </td>
                                                <td style={summaryTdStyle}>
                                                    {stu.total === 0 && Object.values(stu.subjects || {}).some(s => s.grade === "AB") ? "AB" : `${percentage.toFixed(2)}%`}
                                                </td>
                                                <td style={summaryTdStyle}>
                                                    <button
                                                        style={{
                                                            padding: "4px 8px",
                                                            fontSize: "12px",
                                                            borderRadius: 4,
                                                            border: "none",
                                                            background: theme.accent,
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => {
                                                            const isSelected = selectedRows.includes(key);
                                                            if (isSelected) {
                                                                setSelectedRows(prev => prev.filter(k => k !== key));
                                                            } else {
                                                                setSelectedRows(prev => [...prev, key]);
                                                            }
                                                        }}
                                                    >
                                                        {selectedRows.includes(key) ? "Deselect" : "Select"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
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
                        Close
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
                        disabled={loading || sortedStudents.length === 0}
                    >
                        Export CSV
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PreviousYearsModal;
