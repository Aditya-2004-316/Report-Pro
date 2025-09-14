import React, { useState, useEffect, useRef } from "react";
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
    dataRefreshTrigger = 0,
    subject,
    setSubject,
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
    const [selectedClass, setSelectedClass] = useState("9th");
    const [selectedExamType, setSelectedExamType] = useState("Monthly Test");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [localSubjectFilter, setLocalSubjectFilter] = useState("All");
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

    const [deleteStudentModal, setDeleteStudentModal] = useState({
        open: false,
        rollNo: null,
    });
    const [selectedRows, setSelectedRows] = useState([]);
    const [popupMsg, setPopupMsg] = useState("");
    const [registryStudents, setRegistryStudents] = useState([]);
    const [loadingRegistry, setLoadingRegistry] = useState(false);
    const [markingAbsent, setMarkingAbsent] = useState(false);
    const [absentModal, setAbsentModal] = useState({
        open: false,
        students: [],
    });

    const currentYear = new Date().getFullYear();
    const sessionOptions = [
        `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
        `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`,
    ];

    useEffect(() => {
        if (!session) setSession(sessionOptions[0]);
    }, []);

    useEffect(() => {
        setSelectedMonth("");
    }, [selectedExamType]);

    useEffect(() => {
        const lastUsedMonth = localStorage.getItem("markentry_month");
        if (selectedExamType === "Monthly Test") {
            if (lastUsedMonth && MONTHS.includes(lastUsedMonth)) {
                setSelectedMonth(lastUsedMonth);
            } else {
                const now = new Date();
                const currentMonth = MONTHS[now.getMonth()];
                setSelectedMonth(currentMonth);
            }
        } else {
            setSelectedMonth("");
        }
    }, [selectedExamType]);

    useEffect(() => {
        if (selectedExamType === "Monthly Test" && selectedMonth) {
            localStorage.setItem("markentry_month", selectedMonth);
        }
    }, [selectedMonth, selectedExamType]);

    const fetchStudents = async () => {
        if (!session || !token || !selectedClass) {
            console.log(
                "StudentList: Skipping data fetch - missing required params:",
                { session, token: !!token, selectedClass }
            );
            return;
        }

        try {
            const apiUrl = `${API_BASE}/api/students?session=${session}&class=${selectedClass}&examType=${selectedExamType}&subject=${localSubjectFilter}${
                selectedExamType === "Monthly Test" && selectedMonth
                    ? `&month=${selectedMonth}`
                    : ""
            }`;

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const marksData = await response.json();

            const validMarksData = Array.isArray(marksData)
                ? marksData.filter((student) => {
                      return (
                          student &&
                          student.rollNo &&
                          student.subject &&
                          student.examType
                      );
                  })
                : [];

            const combinedStudents = [];
            const studentsWithMarks = new Set();
            validMarksData.forEach((student) => {
                combinedStudents.push(student);
                studentsWithMarks.add(student.rollNo.toLowerCase());
            });

            if (registryStudents && registryStudents.length > 0) {
                registryStudents.forEach((registryStudent) => {
                    const rollNoKey = registryStudent.rollNo.toLowerCase();

                    if (!studentsWithMarks.has(rollNoKey)) {
                        const subjectsToAdd =
                            localSubjectFilter === "All"
                                ? SUBJECTS
                                : [localSubjectFilter];

                        subjectsToAdd.forEach((subject) => {
                            const placeholderStudent = {
                                rollNo: registryStudent.rollNo,
                                name: registryStudent.name,
                                class: selectedClass,
                                examType: selectedExamType,
                                subject: subject,
                                theory: null,
                                practical: null,
                                total: null,
                                grade: null,
                                session: session,
                                isAbsent: false,
                                isPlaceholder: true,
                                ...(selectedExamType === "Monthly Test" &&
                                selectedMonth
                                    ? { month: selectedMonth }
                                    : {}),
                            };
                            combinedStudents.push(placeholderStudent);
                        });

                        studentsWithMarks.add(rollNoKey);
                    }
                });
            }

            setStudents(combinedStudents);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("StudentList: Error fetching students:", error);
            setStudents([]);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [
        session,
        token,
        selectedClass,
        selectedExamType,
        localSubjectFilter,
        selectedMonth,
        dataRefreshTrigger,
        registryStudents,
    ]);

    useEffect(() => {
        if (!session || !selectedClass) {
            setRegistryStudents([]);
            return;
        }
        setLoadingRegistry(true);
        const token = sessionStorage.getItem("token");
        fetch(
            `${API_BASE}/api/student-registry?session=${session}&class=${selectedClass}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                setRegistryStudents(data && data.students ? data.students : []);
                setLoadingRegistry(false);
            })
            .catch(() => {
                setRegistryStudents([]);
                setLoadingRegistry(false);
            });
    }, [session, selectedClass]);

    function getStudentNameFromRegistry(rollNo) {
        if (!registryStudents.length) return null;
        const student = registryStudents.find(
            (s) => s.rollNo.toLowerCase() === rollNo.toLowerCase()
        );
        return student ? student.name : null;
    }

    const filtered = students
        .map((student) => ({
            ...student,
            name:
                getStudentNameFromRegistry(student.rollNo) ||
                student.name ||
                "Unknown",
        }))
        .filter((student) => {
            if (!search.trim()) return true;
            const searchTerm = search.toLowerCase().trim();
            const rollNo = (student.rollNo || "").toString().toLowerCase();
            const name = (student.name || "").toLowerCase();
            const subject = (student.subject || "").toLowerCase();
            return (
                rollNo.includes(searchTerm) ||
                name.includes(searchTerm) ||
                subject.includes(searchTerm)
            );
        })
        .sort((a, b) => {
            const rollA = parseInt(a.rollNo) || 0;
            const rollB = parseInt(b.rollNo) || 0;
            return rollA - rollB;
        });

    const studentsBySubject = SUBJECTS.reduce((acc, subj) => {
        // Start with all registry students for this subject
        const allStudentsForSubject = [];

        if (registryStudents && registryStudents.length > 0) {
            registryStudents.forEach((registryStudent) => {
                // Check if this student already has marks for this subject
                const existingStudent = filtered.find(
                    (s) =>
                        s.rollNo.toLowerCase() ===
                            registryStudent.rollNo.toLowerCase() &&
                        s.subject === subj
                );

                if (existingStudent) {
                    // Student has marks, use the existing data
                    allStudentsForSubject.push(existingStudent);
                } else {
                    // Student doesn't have marks, create placeholder
                    const placeholderStudent = {
                        rollNo: registryStudent.rollNo,
                        name: registryStudent.name,
                        class: selectedClass,
                        examType: selectedExamType,
                        subject: subj,
                        theory: null,
                        practical: null,
                        total: null,
                        grade: null,
                        session: session,
                        isAbsent: false,
                        isPlaceholder: true,
                        ...(selectedExamType === "Monthly Test" && selectedMonth
                            ? { month: selectedMonth }
                            : {}),
                    };
                    allStudentsForSubject.push(placeholderStudent);
                }
            });
        }

        // Filter by search if applicable
        const searchFiltered = allStudentsForSubject.filter((student) => {
            if (!search.trim()) return true;
            const searchTerm = search.toLowerCase().trim();
            const rollNo = (student.rollNo || "").toString().toLowerCase();
            const name = (student.name || "").toLowerCase();
            const subject = (student.subject || "").toLowerCase();
            return (
                rollNo.includes(searchTerm) ||
                name.includes(searchTerm) ||
                subject.includes(searchTerm)
            );
        });

        // Sort by roll number
        acc[subj] = searchFiltered.sort((a, b) => {
            const rollA = parseInt(a.rollNo) || 0;
            const rollB = parseInt(b.rollNo) || 0;
            return rollA - rollB;
        });

        return acc;
    }, {});

    const getSubjectsWithResults = () => {
        if (!search.trim()) {
            return localSubjectFilter === "All"
                ? SUBJECTS
                : [localSubjectFilter];
        }
        const subjectsWithResults = SUBJECTS.filter(
            (subj) => studentsBySubject[subj].length > 0
        );
        if (localSubjectFilter === "All") {
            return subjectsWithResults;
        } else {
            return subjectsWithResults.filter(
                (subj) => subj === localSubjectFilter
            );
        }
    };

    const studentsByRollNo = {};
    filtered.forEach((s) => {
        if (!s || !s.rollNo || !s.examType || !s.subject) {
            console.warn("StudentList: Skipping invalid student data:", s);
            return;
        }

        const key = `${s.rollNo}-${s.examType}`;
        if (!studentsByRollNo[key]) {
            studentsByRollNo[key] = {
                rollNo: s.rollNo,
                name: s.name || "Unknown",
                examType: s.examType,
                subjects: {},
                total: 0,
                maxTotal: 0,
            };
        }

        if (s.isPlaceholder) {
            studentsByRollNo[key].subjects[s.subject] = {
                theory: null,
                practical: null,
                total: null,
                grade: null,
                isPlaceholder: true,
            };
        } else if (s.isAbsent) {
            studentsByRollNo[key].subjects[s.subject] = {
                theory: 0,
                practical: 0,
                total: 0,
                grade: "AB",
                isAbsent: true,
            };
            studentsByRollNo[key].maxTotal += 100;
        } else {
            const theory = s.theory || 0;
            const practical = s.practical || 0;
            const total = s.total || 0;
            const grade = s.grade || "E2";

            studentsByRollNo[key].subjects[s.subject] = {
                theory,
                practical,
                total,
                grade,
            };
            if (total > 0) {
                studentsByRollNo[key].total += total;
            }
            studentsByRollNo[key].maxTotal += 100;
        }
    });

    function getOverallGrade(percentage, studentSubjects) {
        // Original grade logic with custom mark ranges
        const hasFailedSubject = Object.values(studentSubjects).some(
            (subject) => subject.grade === "E1" || subject.grade === "E2"
        );

        if (hasFailedSubject) {
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
            return normalGrade === "E2" ? "E2" : "E1";
        }

        // Original custom mark ranges
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

    function getStudentKey(stu) {
        return `${stu.rollNo}-${stu.examType}`;
    }

    function exportCSV() {
        const headerInfo = [
            `Session: ${session || "All Sessions"}`,
            `Class: ${selectedClass}`,
            `Subject: ${localSubjectFilter}`,
            `Exam Type: ${selectedExamType}`,
            ...(selectedExamType === "Monthly Test" && selectedMonth
                ? [`Month: ${selectedMonth}`]
                : []),
            `Export Date: ${new Date().toLocaleDateString()}`,
            `Export Time: ${new Date().toLocaleTimeString()}`,
            "",
        ];

        const studentsToExport =
            selectedRows.length > 0
                ? Object.values(studentsByRollNo)
                      .filter((stu) => {
                          if (!stu || !stu.rollNo) return false;
                          return selectedRows.includes(getStudentKey(stu));
                      })
                      .sort((a, b) => {
                          const rollA = parseInt(a.rollNo) || 0;
                          const rollB = parseInt(b.rollNo) || 0;
                          return rollA - rollB;
                      })
                : Object.values(studentsByRollNo)
                      .filter((stu) => stu && stu.rollNo)
                      .sort((a, b) => {
                          const rollA = parseInt(a.rollNo) || 0;
                          const rollB = parseInt(b.rollNo) || 0;
                          return rollA - rollB;
                      });

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
                SUBJECTS.filter((subj) => {
                    const subjectData = stu.subjects && stu.subjects[subj];
                    return subjectData && !subjectData.isPlaceholder;
                }).map((subj) => {
                    const subjectData = stu.subjects[subj] || {};
                    return [
                        stu.rollNo || "",
                        stu.name || "",
                        selectedClass || "",
                        subj,
                        stu.examType || "",
                        ...(selectedExamType === "Monthly Test"
                            ? [selectedMonth || ""]
                            : []),
                        subjectData.theory ?? "",
                        subjectData.practical ?? "",
                        subjectData.total ?? "",
                        subjectData.grade ?? "",
                        session || "",
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
        a.download = `students_${
            session || "all"
        }_${selectedClass}_${localSubjectFilter}_${selectedExamType}${
            selectedExamType === "Monthly Test" && selectedMonth
                ? `_${selectedMonth}`
                : ""
        }.csv`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

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

    // Function to mark selected students as absent
    async function handleMarkAsAbsent() {
        const selectedStudents = selectedRows
            .map((key) => {
                const [rollNo] = key.split("-");
                const registryStudent = registryStudents.find(
                    (s) => s.rollNo === rollNo
                );
                return registryStudent
                    ? { rollNo, name: registryStudent.name }
                    : null;
            })
            .filter(Boolean);

        if (selectedStudents.length === 0) {
            alert("Please select students to mark as absent.");
            return;
        }

        setAbsentModal({ open: true, students: selectedStudents });
    }

    async function confirmMarkAsAbsent() {
        setMarkingAbsent(true);
        try {
            const response = await fetch(`${API_BASE}/api/students/absent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    students: absentModal.students.map((s) => s.rollNo),
                    session,
                    class: selectedClass,
                    examType: selectedExamType,
                    ...(selectedExamType === "Monthly Test" && selectedMonth
                        ? { month: selectedMonth }
                        : {}),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to mark students as absent"
                );
            }

            // Refresh student data
            await fetchStudents();
            setSelectedRows([]);
            setAbsentModal({ open: false, students: [] });
            setPopupMsg(
                `Successfully marked ${absentModal.students.length} students as absent.`
            );
            setTimeout(() => setPopupMsg(""), 3000);
        } catch (error) {
            console.error("Error marking students as absent:", error);
            alert("Failed to mark students as absent: " + error.message);
        }
        setMarkingAbsent(false);
    }

    // Get theme-aware colors for row headings
    const getRowHeadingColors = () => {
        if (theme.name === "dark") {
            return {
                background: "#3a3d42",
                color: "#ffffff",
                border: "#4a4d52",
            };
        } else {
            return {
                background: "#fce4ec",
                color: "#000000",
                border: "#ef9a9a",
            };
        }
    };

// NEW: Helper function for consistent table cell styling
const getTableCellStyle = (idx, isPlaceholder = false, isAbsent = false) => {
    // Enforce a single background color for all rows/cells
    const baseStyle = {
        padding: 12,
        textAlign: "center",
        fontSize: 15,
        color: theme.text,
        background: theme.surface,
        border: theme.name === "dark" ? "1px solid #4a4d52" : "1px solid #ef9a9a",
    };

    // Optional textual hints without changing the background color
    if (isAbsent) {
        baseStyle.color = theme.name === "dark" ? "#ff6f60" : "#d32f2f";
        baseStyle.fontWeight = "bold";
    } else if (isPlaceholder) {
        baseStyle.color = theme.textSecondary || (theme.name === "dark" ? "#bbbbbb" : "#666");
        baseStyle.fontStyle = "italic";
    }

    return baseStyle;
};

const rowHeadingColors = getRowHeadingColors();

return (
    <div
        style={{
            width: "100%",
            maxWidth: 1400,
            margin: "2rem auto",
            background: theme.background,
            borderRadius: 16,
            boxShadow: theme.shadow,
            padding: "2rem 1.5rem",
            boxSizing: "border-box",
            color: theme.text,
        }}
    >
        <div
            style={{
                width: "100%",
                maxWidth: 1400,
                margin: "2rem auto",
                background: theme.background,
                borderRadius: 16,
                boxShadow: theme.shadow,
                padding: "2rem 1.5rem",
                boxSizing: "border-box",
                color: theme.text,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 24,
                    position: "relative",
                }}
            >
                <h1
                    style={{
                        background:
                            "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: 800,
                        fontSize: 28,
                        margin: 0,
                        letterSpacing: 1,
                    }}
                >
                    Student Results
                </h1>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        position: "absolute",
                        right: 0,
                    }}
                >
                    {lastUpdated && (
                        <span
                            style={{
                                color: accentDark,
                                fontWeight: 500,
                                fontSize: 15,
                            }}
                        >
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={exportCSV}
                        style={{
                            background:
                                theme.surface === "#32353b"
                                    ? "#b71c1c"
                                    : accent,
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "10px 16px",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(229, 57, 53, 0.3)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 16,
                    marginBottom: 24,
                    padding: 20,
                    background: theme.surface,
                    borderRadius: 12,
                    border: `1px solid ${theme.border}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column" }}>
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
                        required
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
                    >
                        {sessionOptions.map((sess) => (
                            <option key={sess} value={sess}>
                                {sess}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
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
                        required
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
                    >
                        <option value="9th">9th</option>
                        <option value="10th">10th</option>
                    </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label
                        style={{
                            fontWeight: 700,
                            color: accentDark,
                            marginBottom: 4,
                            fontSize: 16,
                        }}
                    >
                        Exam Type
                    </label>
                    <select
                        value={selectedExamType}
                        onChange={(e) => setSelectedExamType(e.target.value)}
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
                    >
                        <option value="Monthly Test">Monthly Test</option>
                        <option value="Quarterly Exam">Quarterly Exam</option>
                        <option value="Half Monthly Exam">
                            Half Monthly Exam
                        </option>
                        <option value="Annual Exam">Annual Exam</option>
                    </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label
                        style={{
                            fontWeight: 700,
                            color: accentDark,
                            marginBottom: 4,
                            fontSize: 16,
                        }}
                    >
                        Subject
                    </label>
                    <select
                        value={localSubjectFilter}
                        onChange={(e) => setLocalSubjectFilter(e.target.value)}
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
                    >
                        <option value="All">All Subjects</option>
                        {SUBJECTS.map((subj) => (
                            <option key={subj} value={subj}>
                                {subj}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedExamType === "Monthly Test" && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <label
                            style={{
                                fontWeight: 700,
                                color: accentDark,
                                marginBottom: 4,
                                fontSize: 16,
                            }}
                        >
                            Month
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
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
                        >
                            {MONTHS.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                            <option value="">All Months</option>
                        </select>
                    </div>
                )}
            </div>

            <input
                type="text"
                placeholder="Search students by roll number, name, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
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
                }}
            />

            {popupMsg && (
                <div
                    style={{
                        background: "#d4edda",
                        color: "#155724",
                        padding: "12px",
                        borderRadius: 8,
                        marginBottom: 16,
                        border: "1px solid #c3e6cb",
                    }}
                >
                    {popupMsg}
                </div>
            )}

            {/* Summary Table */}
            {Object.values(studentsByRollNo).length > 0 && (
                <div
                    style={{
                        background: theme.surface,
                        borderRadius: 16,
                        boxShadow: theme.shadow,
                        marginBottom: 36,
                        padding: 24,
                        transition: "box-shadow 0.2s, transform 0.2s",
                        border: `1.5px solid ${theme.border}`,
                        position: "relative",
                        color: theme.text,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 16,
                            position: "relative",
                        }}
                    >
                        <h3
                            style={{
                                background:
                                    "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 800,
                                fontSize: 20,
                                margin: 0,
                                textAlign: "center",
                            }}
                        >
                            All Subjects Summary
                        </h3>
                        {selectedRows.length > 0 && (
                            <button
                                onClick={handleMarkAsAbsent}
                                disabled={markingAbsent}
                                style={{
                                    background: "#ff9800",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "8px 16px",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    boxShadow:
                                        "0 2px 4px rgba(255, 152, 0, 0.3)",
                                    opacity: markingAbsent ? 0.6 : 1,
                                    position: "absolute",
                                    right: 0,
                                }}
                            >
                                {markingAbsent
                                    ? "Marking..."
                                    : `Mark ${selectedRows.length} as Absent`}
                            </button>
                        )}
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            color: accentDark,
                            marginBottom: 12,
                        }}
                    >
                        Total Students: {Object.values(studentsByRollNo).length}
                    </div>
                    <div
                        className="summary-table-scroll"
                        style={{
                            overflowX: "auto",
                            marginBottom: 24,
                        }}
                    >
                        <style>
                            {`
                            .summary-table-scroll::-webkit-scrollbar {
                                height: 12px;
                            }
                            
                            .summary-table-scroll::-webkit-scrollbar-track {
                                background: #f8d7da;
                                border-radius: 6px;
                            }
                            
                            .summary-table-scroll::-webkit-scrollbar-thumb {
                                background: #e91e63;
                                border-radius: 6px;
                                border: 2px solid #f8d7da;
                            }
                            
                            .summary-table-scroll::-webkit-scrollbar-thumb:hover {
                                background: #c2185b;
                            }
                            
                            .summary-table-scroll::-webkit-scrollbar-corner {
                                background: #f8d7da;
                            }
                            
                            /* Firefox */
                            .summary-table-scroll {
                                scrollbar-width: thin;
                                scrollbar-color: #e91e63 #f8d7da;
                            }
                            `}
                        </style>
                        <table
                            style={{
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
                                border: theme.name === "dark" ? "1px solid #4a4d52" : "1px solid #f5c6cb",
                                minWidth: 900,
                            }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        rowSpan={2}
                                        style={{
                                            padding: 14,
                                            textAlign: "center",
                                            background: rowHeadingColors.background,
                                            color: rowHeadingColors.color,
                                            fontWeight: 700,
                                            border: `1px solid ${rowHeadingColors.border}`,
                                            fontSize: 15,
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Select
                                    </th>
                                    <th
                                        rowSpan={2}
                                        style={{
                                            padding: 14,
                                            textAlign: "center",
                                            background: rowHeadingColors.background,
                                            color: rowHeadingColors.color,
                                            fontWeight: 700,
                                            border: `1px solid ${rowHeadingColors.border}`,
                                            fontSize: 15,
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Roll No
                                    </th>
                                    <th
                                        rowSpan={2}
                                        style={{
                                            padding: 14,
                                            textAlign: "center",
                                            background: rowHeadingColors.background,
                                            color: rowHeadingColors.color,
                                            fontWeight: 700,
                                            border: `1px solid ${rowHeadingColors.border}`,
                                            fontSize: 15,
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Name
                                    </th>
                                    <th
                                        rowSpan={2}
                                        style={{
                                            padding: 14,
                                            textAlign: "center",
                                            background: rowHeadingColors.background,
                                            color: rowHeadingColors.color,
                                            fontWeight: 700,
                                            border: `1px solid ${rowHeadingColors.border}`,
                                            fontSize: 15,
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Exam Type
                                    </th>
                                    {SUBJECTS.map((subj) => (
                                        <th
                                            key={`${subj}-header`}
                                            colSpan={4}
                                            style={{
                                                padding: 14,
                                                textAlign: "center",
                                                background: rowHeadingColors.background,
                                                color: rowHeadingColors.color,
                                                fontWeight: 700,
                                                border: `1px solid ${rowHeadingColors.border}`,
                                                fontSize: 15,
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            {subj}
                                        </th>
                                    ))}
                                    <th
                                        rowSpan={2}
                                        style={{
                                            padding: 14,
                                            textAlign: "center",
                                            background: rowHeadingColors.background,
                                            color: rowHeadingColors.color,
                                            fontWeight: 700,
                                            border: `1px solid ${rowHeadingColors.border}`,
                                            fontSize: 15,
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Overall Total
                                    </th>
                                    <th
                                        rowSpan={2}
                                        style={{
                                            padding: 14,
                                            textAlign: "center",
                                            background: rowHeadingColors.background,
                                            color: rowHeadingColors.color,
                                            fontWeight: 700,
                                            border: `1px solid ${rowHeadingColors.border}`,
                                            fontSize: 15,
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Percentage
                                    </th>
                                    <th
                                        rowSpan={2}
                                        style={{
                                            padding: 14,
                                            textAlign: "center",
                                            background: rowHeadingColors.background,
                                            color: rowHeadingColors.color,
                                            fontWeight: 700,
                                            border: `1px solid ${rowHeadingColors.border}`,
                                            fontSize: 15,
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Overall Grade
                                    </th>
                                    <th
                                        rowSpan={2}
                                        style={{
                                            padding: 14,
                                            textAlign: "center",
                                            background: rowHeadingColors.background,
                                            color: rowHeadingColors.color,
                                            fontWeight: 700,
                                            border: `1px solid ${rowHeadingColors.border}`,
                                            fontSize: 15,
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Actions
                                    </th>
                                </tr>
                                <tr>
                                    {SUBJECTS.map((subj) => [
                                        <th
                                            key={`${subj}-theory`}
                                            style={{
                                                padding: 14,
                                                textAlign: "center",
                                                background: rowHeadingColors.background,
                                                color: rowHeadingColors.color,
                                                fontWeight: 700,
                                                border: `1px solid ${rowHeadingColors.border}`,
                                                fontSize: 15,
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Theory
                                        </th>,
                                        <th
                                            key={`${subj}-practical`}
                                            style={{
                                                padding: 14,
                                                textAlign: "center",
                                                background: rowHeadingColors.background,
                                                color: rowHeadingColors.color,
                                                fontWeight: 700,
                                                border: `1px solid ${rowHeadingColors.border}`,
                                                fontSize: 15,
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Practical
                                        </th>,
                                        <th
                                            key={`${subj}-total`}
                                            style={{
                                                padding: 14,
                                                textAlign: "center",
                                                background: rowHeadingColors.background,
                                                color: rowHeadingColors.color,
                                                fontWeight: 700,
                                                border: `1px solid ${rowHeadingColors.border}`,
                                                fontSize: 15,
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Total
                                        </th>,
                                        <th
                                            key={`${subj}-grade`}
                                            style={{
                                                padding: 14,
                                                textAlign: "center",
                                                background: rowHeadingColors.background,
                                                color: rowHeadingColors.color,
                                                fontWeight: 700,
                                                border: `1px solid ${rowHeadingColors.border}`,
                                                fontSize: 15,
                                                letterSpacing: 0.5,
                                            }}
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
                                            colSpan={SUBJECTS.length * 4 + 6}
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
                                    Object.values(studentsByRollNo)
                                        .sort((a, b) => {
                                            const rollA = parseInt(a.rollNo) || 0;
                                            const rollB = parseInt(b.rollNo) || 0;
                                            return rollA - rollB;
                                        })
                                        .map((stu, idx) => {
                                            const percentage = ((stu.total || 0) / (stu.maxTotal || 1)) * 100;
                                            const key = getStudentKey(stu);
                                            return (
                                                <tr key={key}>
                                                    <td style={getTableCellStyle(idx)}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.includes(key)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedRows((prev) => [...prev, key]);
                                                                } else {
                                                                    setSelectedRows((prev) =>
                                                                        prev.filter((k) => k !== key)
                                                                    );
                                                                }
                                                            }}
                                                            aria-label={`Select student ${stu.rollNo}`}
                                                        />
                                                    </td>
                                                    <td style={getTableCellStyle(idx)}>{stu.rollNo}</td>
                                                    <td style={{
                                                        ...getTableCellStyle(idx),
                                                        minWidth: 120,
                                                        maxWidth: 300,
                                                        whiteSpace: "normal",
                                                        wordBreak: "break-word",
                                                    }}>
                                                        {stu.name || "-"}
                                                    </td>
                                                    <td style={getTableCellStyle(idx)}>{stu.examType || "-"}</td>
                                                    {SUBJECTS.map((subj) => {
                                                        const subjectData = stu.subjects[subj];
                                                        const isPlaceholder = subjectData?.isPlaceholder;
                                                        const isAbsent = subjectData?.isAbsent;
                                                        return [
                                                            <td key={`${stu.rollNo}-${subj}-theory`} 
                                                                style={getTableCellStyle(idx, isPlaceholder, isAbsent)}>
                                                                {isPlaceholder ? "-" : isAbsent ? "AB" : subjectData?.theory ?? "-"}
                                                            </td>,
                                                            <td key={`${stu.rollNo}-${subj}-practical`} 
                                                                style={getTableCellStyle(idx, isPlaceholder, isAbsent)}>
                                                                {isPlaceholder ? "-" : isAbsent ? "AB" : subjectData?.practical ?? "-"}
                                                            </td>,
                                                            <td key={`${stu.rollNo}-${subj}-total`} 
                                                                style={getTableCellStyle(idx, isPlaceholder, isAbsent)}>
                                                                {isPlaceholder ? "-" : isAbsent ? "AB" : subjectData?.total ?? "-"}
                                                            </td>,
                                                            <td key={`${stu.rollNo}-${subj}-grade`} 
                                                                style={getTableCellStyle(idx, isPlaceholder, isAbsent)}>
                                                                {isPlaceholder ? "-" : isAbsent ? "AB" : subjectData?.grade ?? "-"}
                                                            </td>,
                                                        ];
                                                    })}
                                                    <td style={getTableCellStyle(idx)}>{stu.total}</td>
                                                    <td style={{...getTableCellStyle(idx), minWidth: 90}}>
                                                        {percentage.toFixed(2)}%
                                                    </td>
                                                    <td style={getTableCellStyle(idx)}>
                                                        {getOverallGrade(percentage, stu.subjects)}
                                                    </td>
                                                    <td style={getTableCellStyle(idx)}>
                                                        <button
                                                            onClick={() =>
                                                                setDeleteStudentModal({
                                                                    open: true,
                                                                    rollNo: stu.rollNo,
                                                                })
                                                            }
                                                            style={{
                                                                background: "transparent",
                                                                color: theme.name === "dark" ? "#ff6f61" : "#e53935",
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
                                                                justifyContent: "center",
                                                                marginLeft: 4,
                                                                letterSpacing: 0,
                                                                transition: "color 0.2s",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                            aria-label="Delete all marks for this student"
                                                        >
                                                            <MdDelete
                                                                size={22}
                                                                color={theme.name === "dark" ? "#ff6f60" : "#e53935"}
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {getSubjectsWithResults().map((subj) => {
                const subjectStudents = studentsBySubject[subj] || [];
                const hasResults = subjectStudents.length > 0;
                return (
                    <div
                        key={subj}
                        style={{
                            background: theme.surface,
                            borderRadius: 16,
                            boxShadow: theme.shadow,
                            marginBottom: 36,
                            padding: 24,
                            transition: "box-shadow 0.2s, transform 0.2s",
                            border: `1.5px solid ${theme.border}`,
                            position: "relative",
                            color: theme.text,
                        }}
                    >
                        <h3
                            style={{
                                background:
                                    "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 800,
                                fontSize: 22,
                                marginTop: 0,
                                textAlign: "center",
                                borderBottom: "1px solid #fbe9e7",
                                paddingBottom: 6,
                                marginBottom: 14,
                            }}
                        >
                            {subj}
                        </h3>

                        {!hasResults ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px 20px",
                                    color: theme.textSecondary || "#666",
                                    background: theme.surface,
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: 8,
                                    fontStyle: "italic",
                                    fontSize: 16,
                                }}
                            >
                                {search.trim() ? (
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 18,
                                                fontWeight: 600,
                                                marginBottom: 8,
                                            }}
                                        >
                                            No matching results
                                        </div>
                                        <div>
                                            No students found for "{search}" in {subj}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 18,
                                                fontWeight: 600,
                                                marginBottom: 8,
                                            }}
                                        >
                                            No students found
                                        </div>
                                        <div>
                                            No student data available for {subj} in the selected filters
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table
                                    style={{
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
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                style={{
                                                    padding: 14,
                                                    textAlign: "center",
                                                    background: rowHeadingColors.background,
                                                    color: rowHeadingColors.color,
                                                    fontWeight: 700,
                                                    border: `1px solid ${rowHeadingColors.border}`,
                                                    fontSize: 16,
                                                    letterSpacing: 0.5,
                                                }}
                                            >
                                                Roll No
                                            </th>
                                            <th
                                                style={{
                                                    padding: 14,
                                                    textAlign: "center",
                                                    background: rowHeadingColors.background,
                                                    color: rowHeadingColors.color,
                                                    fontWeight: 700,
                                                    border: `1px solid ${rowHeadingColors.border}`,
                                                    fontSize: 16,
                                                    letterSpacing: 0.5,
                                                }}
                                            >
                                                Name
                                            </th>
                                            <th
                                                style={{
                                                    padding: 14,
                                                    textAlign: "center",
                                                    background: rowHeadingColors.background,
                                                    color: rowHeadingColors.color,
                                                    fontWeight: 700,
                                                    border: `1px solid ${rowHeadingColors.border}`,
                                                    fontSize: 16,
                                                    letterSpacing: 0.5,
                                                }}
                                            >
                                                Theory
                                            </th>
                                            <th
                                                style={{
                                                    padding: 14,
                                                    textAlign: "center",
                                                    background: rowHeadingColors.background,
                                                    color: rowHeadingColors.color,
                                                    fontWeight: 700,
                                                    border: `1px solid ${rowHeadingColors.border}`,
                                                    fontSize: 16,
                                                    letterSpacing: 0.5,
                                                }}
                                            >
                                                Practical
                                            </th>
                                            <th
                                                style={{
                                                    padding: 14,
                                                    textAlign: "center",
                                                    background: rowHeadingColors.background,
                                                    color: rowHeadingColors.color,
                                                    fontWeight: 700,
                                                    border: `1px solid ${rowHeadingColors.border}`,
                                                    fontSize: 16,
                                                    letterSpacing: 0.5,
                                                }}
                                            >
                                                Total
                                            </th>
                                            <th
                                                style={{
                                                    padding: 14,
                                                    textAlign: "center",
                                                    background: rowHeadingColors.background,
                                                    color: rowHeadingColors.color,
                                                    fontWeight: 700,
                                                    border: `1px solid ${rowHeadingColors.border}`,
                                                    fontSize: 16,
                                                    letterSpacing: 0.5,
                                                }}
                                            >
                                                Grade
                                            </th>
                                            <th
                                                style={{
                                                    padding: 14,
                                                    textAlign: "center",
                                                    background: rowHeadingColors.background,
                                                    color: rowHeadingColors.color,
                                                    fontWeight: 700,
                                                    border: `1px solid ${rowHeadingColors.border}`,
                                                    fontSize: 16,
                                                    letterSpacing: 0.5,
                                                }}
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subjectStudents.map((student, idx) => {
                                            const isPlaceholder = student.isPlaceholder;
                                            const isAbsent = student.isAbsent;
                                            return (
                                                <tr key={`${student.rollNo}-${student.subject}`}>
                                                    <td style={{ ...getTableCellStyle(idx, isPlaceholder, isAbsent), fontStyle: "normal" }}>
                                                        {student.rollNo}
                                                    </td>
                                                    <td style={{ ...getTableCellStyle(idx, isPlaceholder, isAbsent), fontStyle: "normal" }}>
                                                        {student.name || "-"}
                                                    </td>
                                                    <td style={{ ...getTableCellStyle(idx, isPlaceholder, isAbsent), fontStyle: "normal" }}>
                                                        {isPlaceholder ? "-" : isAbsent ? "AB" : student.theory ?? "-"}
                                                    </td>
                                                    <td style={{ ...getTableCellStyle(idx, isPlaceholder, isAbsent), fontStyle: "normal" }}>
                                                        {isPlaceholder ? "-" : isAbsent ? "AB" : student.practical ?? "-"}
                                                    </td>
                                                    <td style={{ ...getTableCellStyle(idx, isPlaceholder, isAbsent), fontStyle: "normal" }}>
                                                        {isPlaceholder ? "-" : isAbsent ? "AB" : student.total ?? "-"}
                                                    </td>
                                                    <td style={{ ...getTableCellStyle(idx, isPlaceholder, isAbsent), fontStyle: "normal" }}>
                                                        {isPlaceholder ? "-" : isAbsent ? "AB" : student.grade ?? "-"}
                                                    </td>
                                                    <td style={{ ...getTableCellStyle(idx, isPlaceholder, isAbsent), fontStyle: "normal" }}>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteStudent(
                                                                    student.rollNo,
                                                                    student.subject,
                                                                    student.session
                                                                )
                                                            }
                                                            style={{
                                                                background: "transparent",
                                                                color: theme.name === "dark" ? "#ff6f60" : "#e53935",
                                                                border: "none",
                                                                padding: "4px",
                                                                cursor: "pointer",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                            aria-label={`Delete ${student.rollNo} from ${student.subject}`}
                                                        >
                                                            <MdDelete size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}

            {deleteModal.open && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: theme.surface,
                            padding: "24px",
                            borderRadius: "12px",
                            maxWidth: "400px",
                            width: "90%",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                        }}
                    >
                        <h3 style={{ marginTop: 0, color: theme.text }}>
                            Confirm Deletion
                        </h3>
                        <p style={{ color: theme.text }}>
                            Are you sure you want to delete the record for Roll
                            No: {deleteModal.rollNo} in {deleteModal.subject}?
                        </p>
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                onClick={cancelDeleteStudent}
                                style={{
                                    padding: "8px 16px",
                                    border: `1px solid ${theme.border}`,
                                    background: theme.surface,
                                    color: theme.text,
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteStudent}
                                style={{
                                    padding: "8px 16px",
                                    border: "none",
                                    background: "#e53935",
                                    color: "#fff",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Absent Marking Modal */}
            {absentModal.open && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: theme.surface,
                            padding: "24px",
                            borderRadius: "12px",
                            maxWidth: "500px",
                            width: "90%",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                            color: theme.text,
                        }}
                    >
                        <h3 style={{ marginTop: 0, color: theme.text }}>
                            Mark Students as Absent
                        </h3>
                        <p style={{ color: theme.text, marginBottom: 16 }}>
                            Are you sure you want to mark the following{" "}
                            {absentModal.students.length} student(s) as absent?
                        </p>
                        <div
                            style={{
                                maxHeight: "200px",
                                overflowY: "auto",
                                background: theme.background,
                                padding: "12px",
                                borderRadius: "8px",
                                marginBottom: "16px",
                                border: `1px solid ${theme.border}`,
                            }}
                        >
                            {absentModal.students.map((student, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: "4px 0",
                                        borderBottom:
                                            idx < absentModal.students.length - 1
                                                ? `1px solid ${theme.border}`
                                                : "none",
                                        color: theme.text,
                                    }}
                                >
                                    <strong>Roll No:</strong> {student.rollNo} -{" "}
                                    <strong>Name:</strong> {student.name}
                                </div>
                            ))}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                onClick={() =>
                                    setAbsentModal({
                                        open: false,
                                        students: [],
                                    })
                                }
                                style={{
                                    padding: "8px 16px",
                                    border: `1px solid ${theme.border}`,
                                    background: theme.surface,
                                    color: theme.text,
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmMarkAsAbsent}
                                disabled={markingAbsent}
                                style={{
                                    padding: "8px 16px",
                                    border: "none",
                                    background: "#ff9800",
                                    color: "#fff",
                                    borderRadius: "6px",
                                    cursor: markingAbsent ? "not-allowed" : "pointer",
                                    opacity: markingAbsent ? 0.6 : 1,
                                }}
                            >
                                {markingAbsent ? "Marking..." : "Mark as Absent"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Student Modal */}
            {deleteStudentModal.open && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: theme.surface,
                            padding: "24px",
                            borderRadius: "12px",
                            maxWidth: "400px",
                            width: "90%",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                            color: theme.text,
                        }}
                    >
                        <h3 style={{ marginTop: 0, color: theme.text }}>
                            Delete All Student Records
                        </h3>
                        <p style={{ color: theme.text }}>
                            Are you sure you want to delete ALL records for Roll
                            No: {deleteStudentModal.rollNo}? This will remove
                            all subject records for this student.
                        </p>
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                onClick={() =>
                                    setDeleteStudentModal({
                                        open: false,
                                        rollNo: null,
                                    })
                                }
                                style={{
                                    padding: "8px 16px",
                                    border: `1px solid ${theme.border}`,
                                    background: theme.surface,
                                    color: theme.text,
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(
                                            `${API_BASE}/api/students/all`,
                                            {
                                                method: "DELETE",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    Authorization: `Bearer ${token}`,
                                                },
                                                body: JSON.stringify({
                                                    rollNo: deleteStudentModal.rollNo,
                                                    session,
                                                    class: selectedClass,
                                                    examType: selectedExamType,
                                                    ...(selectedExamType === "Monthly Test" &&
                                                    selectedMonth
                                                        ? { month: selectedMonth }
                                                        : {}),
                                                }),
                                            }
                                        );
                                        if (!response.ok) {
                                            const data = await response.json();
                                            alert(
                                                data.error ||
                                                    "Failed to delete student records."
                                            );
                                            return;
                                        }
                                        await fetchStudents();
                                        setPopupMsg(
                                            `Successfully deleted all records for Roll No: ${deleteStudentModal.rollNo}`
                                        );
                                        setTimeout(() => setPopupMsg(""), 3000);
                                    } catch (error) {
                                        console.error(
                                            "Error deleting student records:",
                                            error
                                        );
                                        alert("Failed to delete student records.");
                                    }
                                    setDeleteStudentModal({
                                        open: false,
                                        rollNo: null,
                                    });
                                }}
                                style={{
                                    padding: "8px 16px",
                                    border: "none",
                                    background: "#e53935",
                                    color: "#fff",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
}

export default StudentList;