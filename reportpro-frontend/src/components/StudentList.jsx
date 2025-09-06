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
    dataRefreshTrigger = 0, // Add this prop
    subject, // Add global subject state (from marks entry form - not used for filtering)
    setSubject, // Add global subject setter (not used for filtering)
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
    // Add local subject filter for results page (independent from global subject)
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
    // Reset month when exam type changes
    useEffect(() => {
        setSelectedMonth("");
    }, [selectedExamType]);
    // Set default month: last used or current month
    useEffect(() => {
        // Try to get last used month from localStorage (use same key as MarkEntryForm)
        const lastUsedMonth = localStorage.getItem("markentry_month");
        if (selectedExamType === "Monthly Test") {
            if (lastUsedMonth && MONTHS.includes(lastUsedMonth)) {
                setSelectedMonth(lastUsedMonth);
            } else {
                // Default to current month
                const now = new Date();
                const currentMonth = MONTHS[now.getMonth()];
                setSelectedMonth(currentMonth);
            }
        } else {
            setSelectedMonth("");
        }
    }, [selectedExamType]);
    // Save last used month when changed (use same key as MarkEntryForm)
    useEffect(() => {
        if (selectedExamType === "Monthly Test" && selectedMonth) {
            localStorage.setItem("markentry_month", selectedMonth);
        }
    }, [selectedMonth, selectedExamType]);
    const [deleteStudentModal, setDeleteStudentModal] = useState({
        open: false,
        rollNo: null,
    });
    const [selectedRows, setSelectedRows] = useState([]);
    const [popupMsg, setPopupMsg] = useState("");
    const [registryStudents, setRegistryStudents] = useState([]);
    const [loadingRegistry, setLoadingRegistry] = useState(false);

    // Only show sessions: currentYear-nextYear and nextYear-yearAfter
    const currentYear = new Date().getFullYear();
    const sessionOptions = [
        `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
        `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`,
    ];

    useEffect(() => {
        if (!session) setSession(sessionOptions[0]);
    }, []);
    // Create a function to fetch students that can be reused
    const fetchStudents = async () => {
        if (!session || !token || !selectedClass) {
            console.log(
                "StudentList: Skipping data fetch - missing required params:",
                { session, token: !!token, selectedClass }
            );
            return;
        }

        console.log("StudentList: Fetching data with params:", {
            session,
            selectedClass,
            selectedExamType,
            localSubjectFilter,
            selectedMonth,
        });

        try {
            // Fetch actual marks data
            const apiUrl = `${API_BASE}/api/students?session=${session}&class=${selectedClass}&examType=${selectedExamType}&subject=${localSubjectFilter}${
                selectedExamType === "Monthly Test" && selectedMonth
                    ? `&month=${selectedMonth}`
                    : ""
            }`;

            console.log("StudentList: API URL:", apiUrl);

            const response = await fetch(apiUrl, {
                method: "GET", // Explicitly specify GET method
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const marksData = await response.json();
            console.log("StudentList: Raw marks API response:", {
                totalCount: marksData.length,
                firstFewStudents: marksData.slice(0, 3).map((s) => ({
                    rollNo: s.rollNo,
                    name: s.name,
                    subject: s.subject,
                    theory: s.theory,
                    practical: s.practical,
                    total: s.total,
                    isAbsent: s.isAbsent,
                })),
            });

            // Validate marks data structure
            const validMarksData = Array.isArray(marksData)
                ? marksData.filter(
                      (student) =>
                          student &&
                          typeof student === "object" &&
                          student.rollNo &&
                          student.subject &&
                          student.examType &&
                          // Allow absent students (marks can be 0/null) OR students with valid marks
                          (student.isAbsent ||
                              (typeof student.theory === "number" &&
                                  typeof student.practical === "number" &&
                                  student.theory >= 0 &&
                                  student.practical >= 0))
                  )
                : [];

            // Create a combined student list that includes registry students even if they don't have marks
            const combinedStudents = [];

            // First, add all students who have marks
            const studentsWithMarks = new Set();
            validMarksData.forEach((student) => {
                combinedStudents.push(student);
                studentsWithMarks.add(student.rollNo.toLowerCase());
            });

            // Then, add registry students who don't have marks yet for this exam type
            if (registryStudents && registryStudents.length > 0) {
                console.log(
                    "StudentList: Adding registry students without marks:",
                    {
                        totalRegistryStudents: registryStudents.length,
                        studentsWithMarks: studentsWithMarks.size,
                    }
                );

                registryStudents.forEach((registryStudent) => {
                    const rollNoKey = registryStudent.rollNo.toLowerCase();

                    // Only add if this student doesn't already have marks for ANY subject in this exam type
                    if (!studentsWithMarks.has(rollNoKey)) {
                        // Create placeholder records for each subject to show in summary
                        const SUBJECTS = [
                            "Mathematics",
                            "Science",
                            "English",
                            "Hindi",
                            "Social Science",
                            "Sanskrit",
                            "Computer Science",
                            "Physical Education",
                            "Art",
                            "Music",
                        ];

                        // Only add if the subject filter allows it
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
                                theory: null, // null indicates no marks entered yet
                                practical: null,
                                total: null,
                                grade: null,
                                session: session,
                                isAbsent: false,
                                isPlaceholder: true, // Flag to identify registry-only students
                                ...(selectedExamType === "Monthly Test" &&
                                selectedMonth
                                    ? { month: selectedMonth }
                                    : {}),
                            };
                            combinedStudents.push(placeholderStudent);
                        });

                        studentsWithMarks.add(rollNoKey); // Mark as processed
                    }
                });
            }

            console.log("StudentList: Combined student data:", {
                totalCombined: combinedStudents.length,
                withMarks: validMarksData.length,
                placeholders: combinedStudents.filter((s) => s.isPlaceholder)
                    .length,
                absent: combinedStudents.filter((s) => s.isAbsent).length,
            });

            setStudents(combinedStudents);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("StudentList: Error fetching students:", error);
            setStudents([]);
        }
    };

    // Combined effect for fetching students when any dependency changes OR when dataRefreshTrigger changes
    useEffect(() => {
        fetchStudents();
    }, [
        session,
        token,
        selectedClass,
        selectedExamType,
        localSubjectFilter, // Use local subject filter instead of global subject
        selectedMonth,
        dataRefreshTrigger, // Include dataRefreshTrigger in the main dependency array
        registryStudents, // Include registryStudents to refetch when registry changes
    ]);

    // Fetch student registry when session or class changes
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

    // Function to get student name from registry
    function getStudentNameFromRegistry(rollNo) {
        if (!registryStudents.length) return null;
        const student = registryStudents.find(
            (s) => s.rollNo.toLowerCase() === rollNo.toLowerCase()
        );
        return student ? student.name : null;
    }

    // No need for additional filtering since API handles it
    // Just map to add registry names when available
    const filtered = students.map((student) => ({
        ...student,
        // Use registry name if available, otherwise fall back to stored name
        name:
            getStudentNameFromRegistry(student.rollNo) ||
            student.name ||
            "Unknown",
    }));

    // Debug logging
    console.log("StudentList Debug:", {
        totalStudents: students.length,
        apiFilteredStudents: filtered.length,
        selectedExamType,
        localSubjectFilter: localSubjectFilter,
        selectedMonth,
        filters: {
            examType: selectedExamType,
            subject: localSubjectFilter,
            month: selectedMonth,
        },
        currentSession: session,
        currentClass: selectedClass,
        token: token ? "Present" : "Missing",
    });

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

    // Group students by rollNo and examType for summary table
    const studentsByRollNo = {};
    filtered.forEach((s) => {
        const key = `${s.rollNo}-${s.examType}`;
        if (!studentsByRollNo[key]) {
            studentsByRollNo[key] = {
                rollNo: s.rollNo,
                name: s.name,
                examType: s.examType,
                subjects: {},
                total: 0,
                maxTotal: 0,
            };
        }

        // Handle different types of students
        if (s.isPlaceholder) {
            // Placeholder student (from registry, no marks yet)
            studentsByRollNo[key].subjects[s.subject] = {
                theory: null,
                practical: null,
                total: null,
                grade: null,
                isPlaceholder: true,
            };
            // Don't add to total for placeholder students
        } else if (s.isAbsent) {
            // Absent student
            studentsByRollNo[key].subjects[s.subject] = {
                theory: 0,
                practical: 0,
                total: 0,
                grade: "AB",
                isAbsent: true,
            };
            // Don't add to total for absent students, but count max possible
            studentsByRollNo[key].maxTotal += 100;
        } else {
            // Regular student with marks
            studentsByRollNo[key].subjects[s.subject] = {
                theory: s.theory,
                practical: s.practical,
                total: s.total,
                grade: s.grade,
            };
            if (s.total !== null && s.total !== undefined) {
                studentsByRollNo[key].total += s.total;
            }
            studentsByRollNo[key].maxTotal += 100; // Each subject max 100
        }
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
            /* Enhanced responsive styles for better layout */
            @media (max-width: 992px) {
                .results-header {
                    flex-direction: column !important;
                    align-items: center !important;
                    gap: 16px !important;
                    position: static !important;
                }
                .results-header-actions {
                    position: static !important;
                    width: 100% !important;
                    justify-content: center !important;
                    margin-left: 0 !important;
                    flex-wrap: wrap !important;
                }
                .results-title {
                    text-align: center !important;
                }
            }
            
            @media (max-width: 768px) {
                .results-header-actions {
                    justify-content: center !important;
                    gap: 8px !important;
                }
            }
            
            @media (max-width: 1200px) {
                .results-container {
                    max-width: 95vw !important;
                    padding: 2rem 1.5rem !important;
                }
                .results-filters {
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
                    gap: 14px !important;
                }
            }
            
            @media (max-width: 992px) {
                .results-container {
                    max-width: 98vw !important;
                    padding: 1.8rem 1.2rem !important;
                }
                .results-header {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 16px !important;
                }
                .results-header-actions {
                    width: 100% !important;
                    justify-content: flex-end !important;
                    margin-left: 0 !important;
                    flex-wrap: wrap !important;
                }
                .results-filters {
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
                    padding: 16px !important;
                }
                .summary-card {
                    padding: 20px 16px !important;
                }
                .subject-card {
                    padding: 20px 16px !important;
                }
            }
            
            @media (max-width: 768px) {
                .results-container {
                    max-width: 100vw !important;
                    padding: 1.5rem 1rem !important;
                    margin: 1rem auto !important;
                }
                .results-header {
                    gap: 12px !important;
                }
                .results-title {
                    font-size: 22px !important;
                }
                .results-filters {
                    grid-template-columns: 1fr !important;
                    gap: 12px !important;
                    padding: 16px !important;
                }
                .results-search {
                    padding: 12px 14px !important;
                    font-size: 14px !important;
                }
                .results-table th, .results-table td {
                    font-size: 13px !important;
                    padding: 8px 6px !important;
                }
                .summary-card {
                    padding: 16px 12px !important;
                }
                .subject-card {
                    padding: 16px 12px !important;
                }
                .subject-cards-container {
                    gap: 16px !important;
                }
            }
            
            @media (max-width: 600px) {
                .results-container {
                    padding: 1.2rem 0.8rem !important;
                    margin: 0.5rem auto !important;
                }
                .results-title {
                    font-size: 20px !important;
                }
                .results-header-actions {
                    gap: 8px !important;
                }
                .results-filters {
                    padding: 12px !important;
                }
                .results-search {
                    padding: 10px 12px !important;
                    font-size: 13px !important;
                }
                .results-table th, .results-table td {
                    font-size: 11px !important;
                    padding: 6px 4px !important;
                }
                .summary-card, .subject-card {
                    padding: 12px 8px !important;
                    border-radius: 12px !important;
                }
                .subject-cards-container {
                    gap: 12px !important;
                }
            }
            
            @media (max-width: 480px) {
                .results-container {
                    padding: 1rem 0.6rem !important;
                }
                .results-title {
                    font-size: 18px !important;
                }
                .results-table th, .results-table td {
                    font-size: 10px !important;
                    padding: 4px 2px !important;
                }
                .summary-card, .subject-card {
                    padding: 10px 6px !important;
                }
            }
            
            /* Focus states for better accessibility */
            .results-search:focus, .results-filter-item select:focus {
                outline: none !important;
            }
            
            /* Smooth transitions for better UX */
            .results-container *, .subject-card, .summary-card {
                transition: all 0.2s ease-in-out !important;
            }
            
            /* Table scroll styling */
            .results-table-container {
                -webkit-overflow-scrolling: touch !important;
                scrollbar-width: thin !important;
                scrollbar-color: rgba(229, 57, 53, 0.3) transparent !important;
            }
            
            .results-table-container::-webkit-scrollbar {
                height: 6px !important;
                width: 6px !important;
            }
            
            .results-table-container::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.05) !important;
                border-radius: 3px !important;
            }
            
            .results-table-container::-webkit-scrollbar-thumb {
                background: rgba(229, 57, 53, 0.4) !important;
                border-radius: 3px !important;
            }
            
            .results-table-container::-webkit-scrollbar-thumb:hover {
                background: rgba(229, 57, 53, 0.6) !important;
            }
        `}</style>
    );

    // Helper to get unique key for a student row
    function getStudentKey(stu) {
        return `${stu.rollNo}-${stu.examType}`;
    }

    // CSV Export logic
    function exportCSV() {
        // Create header information based on selected filters
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
            "", // Empty line for spacing
        ];
        // Only export selected students if any are checked, else all filtered
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
                ...(selectedExamType === "Monthly Test" ? ["Month"] : []),
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
                    ...(selectedExamType === "Monthly Test"
                        ? [stu.subjects[subj]?.month || ""]
                        : []),
                    stu.subjects[subj]?.theory ?? "",
                    stu.subjects[subj]?.practical ?? "",
                    stu.subjects[subj]?.total ?? "",
                    stu.subjects[subj]?.grade ?? "",
                    session || "",
                ])
            ),
        ];
        // Combine header info and data rows
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
        }_${selectedClass}_${subject}_${selectedExamType}${
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

    // Function to mark selected students as absent
    async function handleMarkAsAbsent() {
        if (selectedRows.length === 0) {
            alert("Please select students to mark as absent.");
            return;
        }

        const confirmMsg = `Are you sure you want to mark ${
            selectedRows.length
        } student(s) as absent for ${selectedExamType}${
            selectedExamType === "Monthly Test" && selectedMonth
                ? ` (${selectedMonth})`
                : ""
        }?\n\nThis will create absent records for all subjects.`;

        if (!window.confirm(confirmMsg)) {
            return;
        }

        try {
            // Get unique students from selected rows
            const uniqueStudents = new Map();
            selectedRows.forEach((rowKey) => {
                const student = Object.values(studentsByRollNo).find(
                    (s) => getStudentKey(s) === rowKey
                );
                if (student && !uniqueStudents.has(student.rollNo)) {
                    uniqueStudents.set(student.rollNo, {
                        rollNo: student.rollNo,
                        name: student.name,
                    });
                }
            });

            const studentsArray = Array.from(uniqueStudents.values());

            const requestBody = {
                students: studentsArray,
                examType: selectedExamType,
                session: session,
                class: selectedClass,
                ...(selectedExamType === "Monthly Test" && selectedMonth
                    ? { month: selectedMonth }
                    : {}),
            };

            console.log("Marking students as absent:", requestBody);

            const res = await fetch(`${API_BASE}/api/students/absent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Failed to mark students as absent.");
                return;
            }

            const result = await res.json();
            console.log("Students marked as absent:", result);

            // Clear selections and refresh data
            setSelectedRows([]);
            fetchStudents();

            // Show success message
            setPopupMsg(
                `Successfully marked ${studentsArray.length} students as absent for ${selectedExamType}`
            );
            setTimeout(() => setPopupMsg(""), 4000);
        } catch (err) {
            console.error("Error marking students as absent:", err);
            alert("Failed to mark students as absent. Please try again.");
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
                setPopupMsg(
                    `Successfully deleted ${successCount} subject(s) for student ${rollNo}`
                );
                setTimeout(() => setPopupMsg(""), 2500);
            } else {
                setPopupMsg("Failed to delete any subjects for this student.");
                setTimeout(() => setPopupMsg(""), 2500);
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
            <div
                className="results-header"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    marginBottom: 24,
                    gap: 20,
                    flexWrap: "wrap",
                    position: "relative",
                }}
            >
                <h2
                    className="results-title"
                    style={{
                        ...gradientText,
                        fontSize: 34,
                        margin: 0,
                        textAlign: "center",
                        flex: "1 1 auto",
                    }}
                >
                    Student Results
                </h2>
                <div
                    className="results-header-actions"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        flex: "0 0 auto",
                        position: "absolute",
                        right: 0,
                        top: 0,
                    }}
                >
                    {lastUpdated && (
                        <span
                            style={{
                                ...lastUpdatedStyle,
                                fontSize: 13,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    {selectedRows.length > 0 && (
                        <button
                            onClick={handleMarkAsAbsent}
                            className="mark-absent-btn"
                            style={{
                                background: "#ff9800",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "10px 16px",
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: "pointer",
                                boxShadow: "0 2px 4px rgba(255, 152, 0, 0.3)",
                                transition: "all 0.2s ease",
                                whiteSpace: "nowrap",
                            }}
                            title={`Mark selected ${selectedRows.length} student(s) as absent for ${selectedExamType}`}
                        >
                            Mark Absent ({selectedRows.length})
                        </button>
                    )}
                    <button
                        onClick={exportCSV}
                        className={`${exportBtnClass} results-export-btn`}
                        style={{
                            ...exportBtnStyle,
                            padding: "10px 16px",
                            fontSize: 14,
                            fontWeight: 600,
                            borderRadius: 8,
                            boxShadow: "0 2px 4px rgba(229, 57, 53, 0.3)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <div
                className="results-filters"
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
                <div className="results-filter-item">
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
                <div className="results-filter-item">
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
                <div className="results-filter-item">
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
                        <option value="All">All Exam Types</option>
                    </select>
                </div>
                {/* Month filter for Monthly Test */}
                {selectedExamType === "Monthly Test" && (
                    <div className="results-filter-item">
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
                {/* Subject filter */}
                <div className="results-filter-item">
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
            </div>

            <div
                className="results-search-container"
                style={{
                    marginBottom: 24,
                }}
            >
                <input
                    type="text"
                    className="results-search"
                    placeholder="Search by roll no, name, or subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        ...searchStyle,
                        padding: "14px 16px",
                        fontSize: 15,
                        borderRadius: 10,
                        border: `2px solid ${theme.border}`,
                        background: theme.inputBg,
                        transition: "all 0.2s ease",
                        marginBottom: 0,
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = accent;
                        e.target.style.boxShadow = `0 0 0 3px ${accent}20`;
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = theme.border;
                        e.target.style.boxShadow = "none";
                    }}
                />
            </div>
            {/* Summary Table */}
            <div
                className="results-card summary-card"
                style={{
                    marginBottom: 32,
                    background: theme.surface,
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    padding: "28px 24px",
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                        flexWrap: "wrap",
                        gap: 12,
                    }}
                >
                    <h3
                        className="results-summary-title"
                        style={{
                            ...gradientText,
                            fontSize: 20,
                            marginBottom: 0,
                            textAlign: "left",
                            letterSpacing: 0.5,
                            flex: "1 1 auto",
                        }}
                    >
                        All Subjects Summary
                    </h3>
                    {Object.values(studentsByRollNo).length > 0 && (
                        <div
                            style={{
                                color: theme.textSecondary,
                                fontSize: 14,
                                fontWeight: 500,
                                flex: "0 0 auto",
                            }}
                        >
                            {Object.values(studentsByRollNo).length} student
                            {Object.values(studentsByRollNo).length === 1
                                ? ""
                                : "s"}
                        </div>
                    )}
                </div>
                <div
                    className="results-table-container"
                    style={{
                        overflowX: "auto",
                        marginTop: 16,
                        borderRadius: 12,
                        border: `1px solid ${theme.border}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                >
                    <table className="results-table" style={summaryTableStyle}>
                        <thead>
                            <tr>
                                <th style={{ ...summaryThStyle }} rowSpan={2}>
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedRows.length ===
                                                Object.values(studentsByRollNo)
                                                    .length &&
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
                                <th style={{ ...summaryThStyle }} rowSpan={2}>
                                    Exam Type
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
                                Object.values(studentsByRollNo).map(
                                    (stu, idx) => {
                                        const percentage = stu.maxTotal
                                            ? (stu.total / stu.maxTotal) * 100
                                            : 0;
                                        const key = getStudentKey(stu);
                                        return (
                                            <tr
                                                key={key}
                                                style={
                                                    idx % 2 === 1
                                                        ? trAltStyle
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
                                                <td style={summaryTdStyle}>
                                                    {stu.examType || "-"}
                                                </td>
                                                {SUBJECTS.map((subj) => {
                                                    const subjectData =
                                                        stu.subjects[subj];
                                                    const isPlaceholder =
                                                        subjectData?.isPlaceholder;
                                                    const isAbsent =
                                                        subjectData?.isAbsent;

                                                    // Different styling for different student types
                                                    const cellStyle = {
                                                        ...summaryTdStyle,
                                                        ...(isPlaceholder
                                                            ? {
                                                                  background:
                                                                      "#f5f5f5",
                                                                  color: "#666",
                                                                  fontStyle:
                                                                      "italic",
                                                              }
                                                            : {}),
                                                        ...(isAbsent
                                                            ? {
                                                                  background:
                                                                      "#ffebee",
                                                                  color: "#d32f2f",
                                                                  fontWeight:
                                                                      "bold",
                                                              }
                                                            : {}),
                                                    };

                                                    return [
                                                        <td
                                                            key={`${stu.rollNo}-${subj}-theory`}
                                                            style={cellStyle}
                                                        >
                                                            {isPlaceholder
                                                                ? "-"
                                                                : isAbsent
                                                                ? "AB"
                                                                : subjectData?.theory ??
                                                                  "-"}
                                                        </td>,
                                                        <td
                                                            key={`${stu.rollNo}-${subj}-practical`}
                                                            style={cellStyle}
                                                        >
                                                            {isPlaceholder
                                                                ? "-"
                                                                : isAbsent
                                                                ? "AB"
                                                                : subjectData?.practical ??
                                                                  "-"}
                                                        </td>,
                                                        <td
                                                            key={`${stu.rollNo}-${subj}-total`}
                                                            style={cellStyle}
                                                        >
                                                            {isPlaceholder
                                                                ? "-"
                                                                : isAbsent
                                                                ? "AB"
                                                                : subjectData?.total ??
                                                                  "-"}
                                                        </td>,
                                                        <td
                                                            key={`${stu.rollNo}-${subj}-grade`}
                                                            style={cellStyle}
                                                        >
                                                            {isPlaceholder
                                                                ? "-"
                                                                : isAbsent
                                                                ? "AB"
                                                                : subjectData?.grade ??
                                                                  "-"}
                                                        </td>,
                                                    ];
                                                })}
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
            <div
                className="subject-cards-container"
                style={{
                    display: "grid",
                    gap: 24,
                    marginTop: 32,
                }}
            >
                {SUBJECTS.map((subj, idx) => (
                    <div
                        key={subj}
                        className="results-card subject-card"
                        style={{
                            ...cardStyle,
                            marginBottom: 0,
                            padding: "24px 28px",
                            background: theme.surface,
                            border: `1px solid ${theme.border}`,
                            borderRadius: 16,
                            boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
                            transition: "all 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform =
                                "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                                "0 6px 20px rgba(0,0,0,0.1)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                                "0 3px 10px rgba(0,0,0,0.06)";
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 20,
                                paddingBottom: 12,
                                borderBottom: `2px solid ${theme.border}20`,
                            }}
                        >
                            <h3
                                style={{
                                    ...subjectTitle,
                                    fontSize: 18,
                                    marginBottom: 0,
                                    flex: "1 1 auto",
                                }}
                            >
                                {subj}
                            </h3>
                            {studentsBySubject[subj].length > 0 && (
                                <div
                                    style={{
                                        color: theme.textSecondary,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        flex: "0 0 auto",
                                    }}
                                >
                                    {studentsBySubject[subj].length} student
                                    {studentsBySubject[subj].length === 1
                                        ? ""
                                        : "s"}
                                </div>
                            )}
                        </div>
                        <div
                            className="results-table-container"
                            style={{
                                overflowX: "auto",
                                borderRadius: 10,
                                border: `1px solid ${theme.border}`,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                            }}
                        >
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
                                        <th style={subjectThStyle}>
                                            Practical
                                        </th>
                                        <th style={subjectThStyle}>Total</th>
                                        <th style={subjectThStyle}>Grade</th>
                                        <th style={subjectThStyle}>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsBySubject[subj].length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
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
                                        studentsBySubject[subj].map(
                                            (s, idx2) => (
                                                <tr
                                                    key={s.rollNo}
                                                    style={
                                                        idx2 % 2 === 1
                                                            ? trAltStyle
                                                            : {}
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
                                                            whiteSpace:
                                                                "normal",
                                                            wordBreak:
                                                                "break-word",
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
                                                                    theme ===
                                                                    "dark"
                                                                        ? "#ff6f60"
                                                                        : "#e53935",
                                                                border: "none",
                                                                borderRadius: 0,
                                                                padding: "8px",
                                                                fontWeight: 400,
                                                                fontSize: 16,
                                                                cursor: "pointer",
                                                                boxShadow:
                                                                    "none",
                                                                minWidth:
                                                                    "auto",
                                                                minHeight:
                                                                    "auto",
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
                                                            aria-label={`Delete marks for ${s.subject} (Roll No: ${s.rollNo})`}
                                                        >
                                                            <MdDelete
                                                                size={22}
                                                                color={
                                                                    theme ===
                                                                    "dark"
                                                                        ? "#ff6f60"
                                                                        : "#e53935"
                                                                }
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
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
            {/* Popup Snackbar */}
            {popupMsg && (
                <div
                    style={{
                        position: "fixed",
                        left: "50%",
                        bottom: 32,
                        transform: "translateX(-50%)",
                        background: accentDark,
                        color: "#fff",
                        padding: "14px 32px",
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: 16,
                        boxShadow: "0 4px 24px #e5393533",
                        zIndex: 3000,
                        minWidth: 220,
                        textAlign: "center",
                        animation: "fadeInUp 0.3s cubic-bezier(.4,0,.2,1)",
                    }}
                >
                    {popupMsg}
                </div>
            )}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(32px); }
                    to { opacity: 1; transform: none; }
                }
            `}</style>
        </div>
    );
}

export default StudentList;
