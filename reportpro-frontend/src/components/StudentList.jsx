import React, { useState, useEffect, useRef } from "react";
import { SUBJECTS } from "./subjects";
import { MdDelete } from "react-icons/md";
import PreviousYearsModal from "./PreviousYearsModal";
import { calculateSubjectGrade } from "./gradeUtils";

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
        subject: undefined, // Add subject property for subject-specific marking
    });
    const [presentModal, setPresentModal] = useState({
        open: false,
        students: [],
        subject: undefined, // Add subject property for subject-specific marking
    });
    // State for subject-specific selected rows
    const [subjectSelectedRows, setSubjectSelectedRows] = useState({});
    const [showPreviousYearsModal, setShowPreviousYearsModal] = useState(false);

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
            // Removed console log for production
            return;
        }

        try {
            // Always fetch all subjects to ensure complete data for subject-specific tables
            // The localSubjectFilter is only used for UI filtering, not for API calls
            const apiUrl = `${API_BASE}/api/students?session=${session}&class=${selectedClass}&examType=${selectedExamType}${
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
                        // Always create placeholders for ALL subjects, not just the filtered ones
                        // This ensures that subject-specific tables have complete data
                        SUBJECTS.forEach((subject) => {
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
            // Removed error log for production
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
                // Check if this student already has marks for THIS SPECIFIC subject
                const existingStudent = filtered.find(
                    (s) =>
                        s.rollNo.toLowerCase() ===
                            registryStudent.rollNo.toLowerCase() &&
                        s.subject === subj
                );

                if (existingStudent) {
                    // Student has marks for this specific subject, use the existing data
                    allStudentsForSubject.push(existingStudent);
                } else {
                    // Student doesn't have marks for this specific subject, create placeholder
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
                practical: s.examType === "Monthly Test" ? "N/A" : 0,
                total: 0,
                grade: "AB",
                isAbsent: true,
            };
            // For Monthly Tests, max total is 20, otherwise 100
            studentsByRollNo[key].maxTotal +=
                s.examType === "Monthly Test" ? 20 : 100;
        } else {
            const theory = s.theory || 0;
            // For Monthly Tests, practical is N/A
            const practical =
                s.examType === "Monthly Test" ? "N/A" : s.practical || 0;
            const total = s.total || 0;
            // Recalculate grade based on exam type - for Monthly Tests, use theory marks
            const grade = calculateSubjectGrade(total, theory, s.examType);

            studentsByRollNo[key].subjects[s.subject] = {
                theory,
                practical,
                total,
                grade,
            };
            if (total > 0) {
                studentsByRollNo[key].total += total;
            }
            // For Monthly Tests, max total is 20, otherwise 100
            studentsByRollNo[key].maxTotal +=
                s.examType === "Monthly Test" ? 20 : 100;
        }
    });

    function getOverallGrade(percentage, studentSubjects, examType) {
        // Check if any subject is marked as absent - if so, treat as E2
        const hasAbsentSubject = Object.values(studentSubjects).some(
            (subject) => subject.isAbsent
        );

        // Special grading system for Monthly Tests
        if (examType === "Monthly Test") {
            // Check if any subject has a failing grade (E1 or E2)
            const hasFailedSubject = Object.values(studentSubjects).some(
                (subject) =>
                    subject.grade === "E1" ||
                    subject.grade === "E2" ||
                    subject.isAbsent
            );

            // Calculate the average per subject based on theory marks (out of 20)
            const subjectCount = Object.values(studentSubjects).filter(
                (s) => !s.isAbsent && s.total !== null
            ).length;
            const actualTotal = Object.values(studentSubjects).reduce(
                (sum, subject) => {
                    if (subject.isAbsent) return sum;
                    return sum + (subject.total || 0);
                },
                0
            );
            const averagePerSubject =
                subjectCount > 0 ? actualTotal / subjectCount : 0;

            // If student has failed any subject or is absent, cap at E1 or E2
            if (hasFailedSubject || hasAbsentSubject) {
                // Calculate what the normal grade would be
                let normalGrade;
                if (averagePerSubject >= 17) normalGrade = "A+";
                else if (averagePerSubject >= 15) normalGrade = "A";
                else if (averagePerSubject >= 12) normalGrade = "B";
                else if (averagePerSubject >= 9) normalGrade = "C";
                else if (averagePerSubject >= 7) normalGrade = "D";
                else if (averagePerSubject >= 4) normalGrade = "E1";
                else normalGrade = "E2";

                // Return E2 if absent or normal grade is E2, otherwise E1
                return normalGrade === "E2" || hasAbsentSubject ? "E2" : "E1";
            }

            // If no failed subjects, apply normal Monthly Test grading
            if (averagePerSubject >= 17) return "A+";
            if (averagePerSubject >= 15) return "A";
            if (averagePerSubject >= 12) return "B";
            if (averagePerSubject >= 9) return "C";
            if (averagePerSubject >= 7) return "D";
            if (averagePerSubject >= 4) return "E1";
            return "E2";
        }

        // Original grade logic with custom mark ranges for other exam types
        const hasFailedSubject = Object.values(studentSubjects).some(
            (subject) =>
                subject.grade === "E1" ||
                subject.grade === "E2" ||
                subject.isAbsent
        );

        if (hasFailedSubject || hasAbsentSubject) {
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
            return normalGrade === "E2" || hasAbsentSubject ? "E2" : "E1";
        }

        // Original custom mark ranges for other exam types
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
            ...(selectedExamType === "Monthly Test"
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
                    // For Monthly Tests, show "N/A" for practical marks
                    const practicalValue =
                        stu.examType === "Monthly Test"
                            ? "N/A"
                            : subjectData.practical ?? "";

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
                        practicalValue,
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

    // Function to check if any selected student is already marked as absent
    const checkIfAnySelectedAbsent = () => {
        if (selectedRows.length === 0) return false;

        // Check if any of the selected students are marked as absent in the current context
        for (const key of selectedRows) {
            const studentData = studentsByRollNo[key];

            if (studentData) {
                // Check if any subject for this student is marked as absent
                for (const subject in studentData.subjects) {
                    if (
                        studentData.subjects[subject] &&
                        studentData.subjects[subject].isAbsent
                    ) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    // Function to get selected students info with validation
    const getSelectedStudentsInfo = () => {
        return selectedRows
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
    };

    // Function to mark selected students as absent
    async function handleMarkAsAbsent() {
        const selectedStudents = getSelectedStudentsInfo();

        if (selectedStudents.length === 0) {
            alert("Please select students to mark as absent.");
            return;
        }

        // Additional validation
        if (!session || !selectedClass || !selectedExamType) {
            alert(
                "Please select session, class, and exam type before marking students as absent."
            );
            return;
        }

        // For Monthly Test, ensure month is selected
        if (selectedExamType === "Monthly Test" && !selectedMonth) {
            alert(
                "Please select a month for Monthly Test before marking students as absent."
            );
            return;
        }

        setAbsentModal({ open: true, students: selectedStudents });
    }

    // Function to mark selected students as present (reverse of absent)
    async function handleMarkAsPresent() {
        const selectedStudents = getSelectedStudentsInfo();

        if (selectedStudents.length === 0) {
            alert("Please select students to mark as present.");
            return;
        }

        // Additional validation
        if (!session || !selectedClass || !selectedExamType) {
            alert(
                "Please select session, class, and exam type before marking students as present."
            );
            return;
        }

        // For Monthly Test, ensure month is selected
        if (selectedExamType === "Monthly Test" && !selectedMonth) {
            alert(
                "Please select a month for Monthly Test before marking students as present."
            );
            return;
        }

        // Show confirmation modal for marking as present
        setPresentModal({ open: true, students: selectedStudents });
    }

    // Function to toggle subject-specific row selection
    const toggleSubjectRowSelection = (subject, studentKey) => {
        setSubjectSelectedRows((prev) => {
            const currentSelections = prev[subject] || [];
            if (currentSelections.includes(studentKey)) {
                // Remove from selection
                return {
                    ...prev,
                    [subject]: currentSelections.filter(
                        (key) => key !== studentKey
                    ),
                };
            } else {
                // Add to selection
                return {
                    ...prev,
                    [subject]: [...currentSelections, studentKey],
                };
            }
        });
    };

    // Function to check if any selected student is absent for a specific subject
    const checkIfAnySubjectSelectedAbsent = (subject) => {
        const selectedKeys = subjectSelectedRows[subject] || [];
        if (selectedKeys.length === 0) return false;

        // Check if any of the selected students are marked as absent in this subject
        for (const key of selectedKeys) {
            const [rollNo, studentSubject] = key.split("-");
            const student = students.find(
                (s) => s.rollNo === rollNo && s.subject === studentSubject
            );

            if (student && student.isAbsent) {
                return true;
            }
        }

        return false;
    };

    // Function to get selected students info for a specific subject
    const getSubjectSelectedStudentsInfo = (subject) => {
        const selectedKeys = subjectSelectedRows[subject] || [];
        return selectedKeys
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
    };

    // Function to mark selected students as absent for a specific subject
    const handleSubjectMarkAsAbsent = (subject) => {
        const selectedStudents = getSubjectSelectedStudentsInfo(subject);

        if (selectedStudents.length === 0) {
            alert(`Please select students to mark as absent for ${subject}.`);
            return;
        }

        // Additional validation
        if (!session || !selectedClass || !selectedExamType) {
            alert(
                "Please select session, class, and exam type before marking students as absent."
            );
            return;
        }

        // For Monthly Test, ensure month is selected
        if (selectedExamType === "Monthly Test" && !selectedMonth) {
            alert(
                "Please select a month for Monthly Test before marking students as absent."
            );
            return;
        }

        setAbsentModal({ open: true, students: selectedStudents, subject });
    };

    // Function to mark selected students as present for a specific subject
    const handleSubjectMarkAsPresent = (subject) => {
        const selectedStudents = getSubjectSelectedStudentsInfo(subject);

        if (selectedStudents.length === 0) {
            alert(`Please select students to mark as present for ${subject}.`);
            return;
        }

        // Additional validation
        if (!session || !selectedClass || !selectedExamType) {
            alert(
                "Please select session, class, and exam type before marking students as present."
            );
            return;
        }

        // For Monthly Test, ensure month is selected
        if (selectedExamType === "Monthly Test" && !selectedMonth) {
            alert(
                "Please select a month for Monthly Test before marking students as present."
            );
            return;
        }

        setPresentModal({ open: true, students: selectedStudents, subject });
    };

    // Modify the confirmMarkAsAbsent function to handle subject-specific marking
    async function confirmMarkAsAbsent() {
        setMarkingAbsent(true);
        try {
            // Check if this is a subject-specific marking
            const isSubjectSpecific = absentModal.subject !== undefined;

            // Extract just the rollNo values for the backend
            const studentRollNos = absentModal.students.map(
                (student) => student.rollNo
            );

            const response = await fetch(`${API_BASE}/api/students/absent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    students: studentRollNos, // Send array of rollNo strings instead of objects
                    session,
                    class: selectedClass,
                    examType: selectedExamType,
                    ...(selectedExamType === "Monthly Test" && selectedMonth
                        ? { month: selectedMonth }
                        : {}),
                    ...(isSubjectSpecific
                        ? { subject: absentModal.subject }
                        : {}),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to mark students as absent"
                );
            }

            const result = await response.json();
            // Removed console log for production

            // Refresh student data
            await fetchStudents();
            setSelectedRows([]);

            // Clear subject-specific selections if applicable
            if (isSubjectSpecific) {
                setSubjectSelectedRows((prev) => ({
                    ...prev,
                    [absentModal.subject]: [],
                }));
            }

            setAbsentModal({ open: false, students: [] });
            setPopupMsg(
                `Successfully marked ${
                    absentModal.students.length
                } students as absent for ${selectedExamType}${
                    selectedExamType === "Monthly Test" && selectedMonth
                        ? ` in ${selectedMonth}`
                        : ""
                }${isSubjectSpecific ? ` in ${absentModal.subject}` : ""}.`
            );
            setTimeout(() => setPopupMsg(""), 3000);
        } catch (error) {
            // Removed console error for production
            alert("Failed to mark students as absent: " + error.message);
        }
        setMarkingAbsent(false);
    }

    // Modify the confirmMarkAsPresent function to handle subject-specific marking
    async function confirmMarkAsPresent() {
        setMarkingAbsent(true);
        try {
            // Check if this is a subject-specific marking
            const isSubjectSpecific = presentModal.subject !== undefined;

            // Extract just the rollNo values for the backend
            const studentRollNos = presentModal.students.map(
                (student) => student.rollNo
            );

            const response = await fetch(`${API_BASE}/api/students/present`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    students: studentRollNos, // Send array of rollNo strings instead of objects
                    session,
                    class: selectedClass,
                    examType: selectedExamType,
                    ...(selectedExamType === "Monthly Test" && selectedMonth
                        ? { month: selectedMonth }
                        : {}),
                    ...(isSubjectSpecific
                        ? { subject: presentModal.subject }
                        : {}),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to mark students as present"
                );
            }

            const result = await response.json();
            // Removed console log for production

            // Refresh student data
            await fetchStudents();
            setSelectedRows([]);

            // Clear subject-specific selections if applicable
            if (isSubjectSpecific) {
                setSubjectSelectedRows((prev) => ({
                    ...prev,
                    [presentModal.subject]: [],
                }));
            }

            setPresentModal({ open: false, students: [] });
            setPopupMsg(
                `Successfully marked ${
                    presentModal.students.length
                } students as present for ${selectedExamType}${
                    selectedExamType === "Monthly Test" && selectedMonth
                        ? ` in ${selectedMonth}`
                        : ""
                }${isSubjectSpecific ? ` in ${presentModal.subject}` : ""}.`
            );
            setTimeout(() => setPopupMsg(""), 3000);
        } catch (error) {
            // Removed console error for production
            alert("Failed to mark students as present: " + error.message);
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
    const getTableCellStyle = (
        idx,
        isPlaceholder = false,
        isAbsent = false
    ) => {
        // Enforce a single background color for all rows/cells
        const baseStyle = {
            padding: 12,
            textAlign: "center",
            fontSize: 15,
            color: theme.text,
            background: theme.surface,
            border:
                theme.name === "dark"
                    ? "1px solid #4a4d52"
                    : "1px solid #ef9a9a",
        };

        // Optional textual hints without changing the background color
        if (isAbsent) {
            baseStyle.color = theme.name === "dark" ? "#ff6f60" : "#d32f2f";
            baseStyle.fontWeight = "bold";
        } else if (isPlaceholder) {
            baseStyle.color =
                theme.textSecondary ||
                (theme.name === "dark" ? "#bbbbbb" : "#666");
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
            {/* Comprehensive responsive styles for Student Results page - matching Statistics page exactly */}
            <style>{`
                /* Header Styles */
                .student-results-header {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    gap: 20px;
                    flex-wrap: wrap;
                    position: relative;
                }
                
                .student-results-title {
                    background: linear-gradient(90deg, #e53935 0%, #b71c1c 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 800;
                    font-size: 28px;
                    margin: 0;
                    letter-spacing: 1;
                    flex: 1 1 auto;
                    text-align: center;
                }
                
                .student-results-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex: 0 0 auto;
                    position: absolute;
                    right: 0;
                    top: 0;
                }
                
                .student-results-updated-time {
                    color: #b71c1c;

                    font-weight: 500;
                    font-size: 13px;
                    white-space: nowrap;
                }
                
                /* Summary Header Styles */
                .summary-header-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 16px;
                    gap: 20px;
                    flex-wrap: wrap;
                    position: relative;
                }
                
                .summary-title {
                    background: linear-gradient(90deg, #e53935 0%, #b71c1c 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 800;
                    font-size: 20px;
                    margin: 0;
                    text-align: center;
                    flex: 1 1 auto;
                }
                
                .mark-absent-button-container {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex: 0 0 auto;
                    position: absolute;
                    right: 0;
                    top: 0;
                }
                
                /* Enhanced responsive styles to match Statistics page exactly */
                @media (max-width: 992px) {
                    .student-results-header,
                    .summary-header-container {
                        flex-direction: column !important;
                        align-items: center !important;
                        gap: 16px !important;
                        position: static !important;
                    }
                    
                    .student-results-header-actions,
                    .mark-absent-button-container {
                        position: static !important;
                        width: 100% !important;
                        justify-content: flex-end !important;
                        flex-wrap: wrap !important;
                    }
                }
                
                @media (max-width: 768px) {
                    .student-results-header-actions,
                    .mark-absent-button-container {
                        justify-content: center !important;
                        gap: 8px !important;
                    }
                    
                    .student-results-title {
                        font-size: 24px;
                    }
                    
                    .summary-title {
                        font-size: 18px;
                    }
                }
                
                /* Large Desktop (1400px and up) */
                @media (min-width: 1400px) {
                    .student-results-title {
                        font-size: 34px;
                    }
                }
                
                /* Desktop (1024px to 1399px) */
                @media (min-width: 1024px) and (max-width: 1399px) {
                    .student-results-title {
                        font-size: 32px;
                    }
                }
                
                /* Tablet Landscape (768px to 1023px) */
                @media (min-width: 768px) and (max-width: 1023px) {
                    .student-results-title {
                        font-size: 28px;
                    }
                }
                
                @media (max-width: 480px) {
                    .student-results-header-actions,
                    .mark-absent-button-container {
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .student-results-updated-time {
                        font-size: 13px;
                    }
                }
            `}</style>
            <div className="student-results-header">
                <h1 className="student-results-title">Student Results</h1>
                <div className="student-results-header-actions">
                    {lastUpdated && (
                        <span className="student-results-updated-time">
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
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18,
                    gap: 16,
                }}
            >
                <input
                    type="text"
                    placeholder="Search students by roll number, name, or subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 1,
                        padding: 12,
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
                <button
                    onClick={() => setShowPreviousYearsModal(true)}
                    style={{
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "none",
                        background:
                            theme.surface === "#32353b" ? "#5d5d5d" : "#757575",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: theme.shadow,
                        whiteSpace: "nowrap",
                        fontSize: 14,
                    }}
                >
                    Previous Years
                </button>
            </div>
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
                    <div className="summary-header-container">
                        <h3 className="summary-title">All Subjects Summary</h3>
                        {selectedRows.length > 0 && (
                            <div className="mark-absent-button-container">
                                {checkIfAnySelectedAbsent() ? (
                                    <button
                                        onClick={handleMarkAsPresent}
                                        disabled={markingAbsent}
                                        style={{
                                            background: "#4caf50", // Green color for present
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 8,
                                            padding: "8px 16px",
                                            fontSize: 14,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            boxShadow:
                                                "0 2px 4px rgba(76, 175, 80, 0.3)",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Mark as Present
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleMarkAsAbsent}
                                        disabled={markingAbsent}
                                        style={{
                                            background: "#f44336", // Red color for absent
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 8,
                                            padding: "8px 16px",
                                            fontSize: 14,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            boxShadow:
                                                "0 2px 4px rgba(76, 175, 80, 0.3)",
                                            opacity: markingAbsent ? 0.6 : 1,
                                        }}
                                    >
                                        {markingAbsent
                                            ? "Marking..."
                                            : `Mark ${selectedRows.length} as Absent`}
                                    </button>
                                )}
                            </div>
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
                                border:
                                    theme.name === "dark"
                                        ? "1px solid #4a4d52"
                                        : "1px solid #f5c6cb",
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
                                            background:
                                                rowHeadingColors.background,
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
                                            background:
                                                rowHeadingColors.background,
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
                                            background:
                                                rowHeadingColors.background,
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
                                            background:
                                                rowHeadingColors.background,
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
                                                background:
                                                    rowHeadingColors.background,
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
                                            background:
                                                rowHeadingColors.background,
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
                                            background:
                                                rowHeadingColors.background,
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
                                            background:
                                                rowHeadingColors.background,
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
                                            background:
                                                rowHeadingColors.background,
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
                                                background:
                                                    rowHeadingColors.background,
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
                                                background:
                                                    rowHeadingColors.background,
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
                                                background:
                                                    rowHeadingColors.background,
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
                                                background:
                                                    rowHeadingColors.background,
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
                                {Object.values(studentsByRollNo).length ===
                                0 ? (
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
                                            const rollA =
                                                parseInt(a.rollNo) || 0;
                                            const rollB =
                                                parseInt(b.rollNo) || 0;
                                            return rollA - rollB;
                                        })
                                        .map((stu, idx) => {
                                            const percentage =
                                                ((stu.total || 0) /
                                                    (stu.maxTotal || 1)) *
                                                100;
                                            const key = getStudentKey(stu);
                                            return (
                                                <tr key={key}>
                                                    <td
                                                        style={getTableCellStyle(
                                                            idx
                                                        )}
                                                    >
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
                                                    <td
                                                        style={getTableCellStyle(
                                                            idx
                                                        )}
                                                    >
                                                        {stu.rollNo}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...getTableCellStyle(
                                                                idx
                                                            ),
                                                            minWidth: 120,
                                                            maxWidth: 300,
                                                            whiteSpace:
                                                                "normal",
                                                            wordBreak:
                                                                "break-word",
                                                        }}
                                                    >
                                                        {stu.name || "-"}
                                                    </td>
                                                    <td
                                                        style={getTableCellStyle(
                                                            idx
                                                        )}
                                                    >
                                                        {stu.examType || "-"}
                                                    </td>
                                                    {SUBJECTS.map((subj) => {
                                                        const subjectData =
                                                            stu.subjects[subj];
                                                        const isPlaceholder =
                                                            subjectData?.isPlaceholder;
                                                        const isAbsent =
                                                            subjectData?.isAbsent;
                                                        return [
                                                            <td
                                                                key={`${stu.rollNo}-${subj}-theory`}
                                                                style={getTableCellStyle(
                                                                    idx,
                                                                    isPlaceholder,
                                                                    isAbsent
                                                                )}
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
                                                                style={getTableCellStyle(
                                                                    idx,
                                                                    isPlaceholder,
                                                                    isAbsent
                                                                )}
                                                            >
                                                                {isPlaceholder
                                                                    ? "-"
                                                                    : isAbsent
                                                                    ? stu.examType ===
                                                                      "Monthly Test"
                                                                        ? "N/A"
                                                                        : "AB"
                                                                    : stu.examType ===
                                                                      "Monthly Test"
                                                                    ? "N/A"
                                                                    : subjectData?.practical ??
                                                                      "-"}
                                                            </td>,
                                                            <td
                                                                key={`${stu.rollNo}-${subj}-total`}
                                                                style={getTableCellStyle(
                                                                    idx,
                                                                    isPlaceholder,
                                                                    isAbsent
                                                                )}
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
                                                                style={getTableCellStyle(
                                                                    idx,
                                                                    isPlaceholder,
                                                                    isAbsent
                                                                )}
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
                                                    <td
                                                        style={getTableCellStyle(
                                                            idx
                                                        )}
                                                    >
                                                        {stu.total}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...getTableCellStyle(
                                                                idx
                                                            ),
                                                            minWidth: 90,
                                                        }}
                                                    >
                                                        {percentage.toFixed(2)}%
                                                    </td>
                                                    <td
                                                        style={getTableCellStyle(
                                                            idx
                                                        )}
                                                    >
                                                        {getOverallGrade(
                                                            percentage,
                                                            stu.subjects,
                                                            stu.examType
                                                        )}
                                                    </td>
                                                    <td
                                                        style={getTableCellStyle(
                                                            idx
                                                        )}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteStudent(
                                                                    stu.rollNo,
                                                                    stu.subject,
                                                                    stu.session
                                                                )
                                                            }
                                                            style={{
                                                                background:
                                                                    "transparent",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                color: "#e53935",
                                                                fontSize: 18,
                                                            }}
                                                            aria-label="Delete student"
                                                        >
                                                            <MdDelete />
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
                                            No students found for "{search}" in{" "}
                                            {subj}
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
                                            No student data available for {subj}{" "}
                                            in the selected filters
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                style={{ overflowX: "auto" }}
                                className="subject-table-scroll"
                            >
                                <style>
                                    {`
                                    .subject-table-scroll::-webkit-scrollbar {
                                        height: 12px;
                                    }
                                    
                                    .subject-table-scroll::-webkit-scrollbar-track {
                                        background: #f8d7da;
                                        border-radius: 6px;
                                    }
                                    
                                    .subject-table-scroll::-webkit-scrollbar-thumb {
                                        background: #e91e63;
                                        border-radius: 6px;
                                        border: 2px solid #f8d7da;
                                    }
                                    
                                    .subject-table-scroll::-webkit-scrollbar-thumb:hover {
                                        background: #c2185b;
                                    }
                                    
                                    .subject-table-scroll::-webkit-scrollbar-corner {
                                        background: #f8d7da;
                                    }
                                    
                                    /* Firefox */
                                    .subject-table-scroll {
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
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                style={{
                                                    padding: 14,
                                                    textAlign: "center",
                                                    background:
                                                        rowHeadingColors.background,
                                                    color: rowHeadingColors.color,
                                                    fontWeight: 700,
                                                    border: `1px solid ${rowHeadingColors.border}`,
                                                    fontSize: 16,
                                                    letterSpacing: 0.5,
                                                }}
                                            >
                                                Select
                                            </th>
                                            <th
                                                style={{
                                                    padding: 14,
                                                    textAlign: "center",
                                                    background:
                                                        rowHeadingColors.background,
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
                                                    background:
                                                        rowHeadingColors.background,
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
                                                    background:
                                                        rowHeadingColors.background,
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
                                                    background:
                                                        rowHeadingColors.background,
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
                                                    background:
                                                        rowHeadingColors.background,
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
                                                    background:
                                                        rowHeadingColors.background,
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
                                                    background:
                                                        rowHeadingColors.background,
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
                                            const isPlaceholder =
                                                student.isPlaceholder;
                                            const isAbsent = student.isAbsent;
                                            const studentKey = `${student.rollNo}-${student.subject}`;
                                            const isSelected = (
                                                subjectSelectedRows[subj] || []
                                            ).includes(studentKey);
                                            return (
                                                <tr key={studentKey}>
                                                    <td
                                                        style={{
                                                            ...getTableCellStyle(
                                                                idx,
                                                                isPlaceholder,
                                                                isAbsent
                                                            ),
                                                            fontStyle: "normal",
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                toggleSubjectRowSelection(
                                                                    subj,
                                                                    studentKey
                                                                )
                                                            }
                                                            style={{
                                                                cursor: "pointer",
                                                                transform:
                                                                    "scale(1.2)",
                                                            }}
                                                        />
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...getTableCellStyle(
                                                                idx,
                                                                isPlaceholder,
                                                                isAbsent
                                                            ),
                                                            fontStyle: "normal",
                                                        }}
                                                    >
                                                        {student.rollNo}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...getTableCellStyle(
                                                                idx,
                                                                isPlaceholder,
                                                                isAbsent
                                                            ),
                                                            fontStyle: "normal",
                                                        }}
                                                    >
                                                        {student.name || "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...getTableCellStyle(
                                                                idx,
                                                                isPlaceholder,
                                                                isAbsent
                                                            ),
                                                            fontStyle: "normal",
                                                        }}
                                                    >
                                                        {isPlaceholder
                                                            ? "-"
                                                            : isAbsent
                                                            ? "AB"
                                                            : student.theory ??
                                                              "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...getTableCellStyle(
                                                                idx,
                                                                isPlaceholder,
                                                                isAbsent
                                                            ),
                                                            fontStyle: "normal",
                                                        }}
                                                    >
                                                        {isPlaceholder
                                                            ? "-"
                                                            : isAbsent
                                                            ? "AB"
                                                            : student.practical ??
                                                              "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...getTableCellStyle(
                                                                idx,
                                                                isPlaceholder,
                                                                isAbsent
                                                            ),
                                                            fontStyle: "normal",
                                                        }}
                                                    >
                                                        {isPlaceholder
                                                            ? "-"
                                                            : isAbsent
                                                            ? "AB"
                                                            : student.total ??
                                                              "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...getTableCellStyle(
                                                                idx,
                                                                isPlaceholder,
                                                                isAbsent
                                                            ),
                                                            fontStyle: "normal",
                                                        }}
                                                    >
                                                        {isPlaceholder
                                                            ? "-"
                                                            : isAbsent
                                                            ? "AB"
                                                            : student.grade ??
                                                              "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...getTableCellStyle(
                                                                idx,
                                                                isPlaceholder,
                                                                isAbsent
                                                            ),
                                                            fontStyle: "normal",
                                                        }}
                                                    >
                                                        {isPlaceholder
                                                            ? "-"
                                                            : isAbsent
                                                            ? student.examType ===
                                                              "Monthly Test"
                                                                ? "N/A"
                                                                : "AB"
                                                            : student.examType ===
                                                              "Monthly Test"
                                                            ? "N/A"
                                                            : student.practical ??
                                                              "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...getTableCellStyle(
                                                                idx,
                                                                isPlaceholder,
                                                                isAbsent
                                                            ),
                                                            fontStyle: "normal",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteStudent(
                                                                    student.rollNo,
                                                                    student.subject,
                                                                    student.session
                                                                )
                                                            }
                                                            style={{
                                                                background:
                                                                    "transparent",
                                                                color:
                                                                    theme.name ===
                                                                    "dark"
                                                                        ? "#ff6f60"
                                                                        : "#e53935",
                                                                border: "none",
                                                                padding: "4px",
                                                                cursor: "pointer",
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                            }}
                                                            aria-label={`Delete ${student.rollNo} from ${student.subject}`}
                                                        >
                                                            <MdDelete
                                                                size={18}
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {/* Subject-specific absent/present buttons */}
                                {(subjectSelectedRows[subj] || []).length >
                                    0 && (
                                    <div
                                        style={{
                                            marginTop: 16,
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 12,
                                        }}
                                    >
                                        {checkIfAnySubjectSelectedAbsent(
                                            subj
                                        ) ? (
                                            <button
                                                onClick={() =>
                                                    handleSubjectMarkAsPresent(
                                                        subj
                                                    )
                                                }
                                                disabled={markingAbsent}
                                                style={{
                                                    background: "#4caf50", // Green color for present
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: 8,
                                                    padding: "8px 16px",
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    cursor: "pointer",
                                                    boxShadow:
                                                        "0 2px 4px rgba(76, 175, 80, 0.3)",
                                                    opacity: markingAbsent
                                                        ? 0.6
                                                        : 1,
                                                }}
                                            >
                                                {markingAbsent
                                                    ? "Marking..."
                                                    : `Mark ${subjectSelectedRows[subj].length} as Present`}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    handleSubjectMarkAsAbsent(
                                                        subj
                                                    )
                                                }
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
                                                    opacity: markingAbsent
                                                        ? 0.6
                                                        : 1,
                                                }}
                                            >
                                                {markingAbsent
                                                    ? "Marking..."
                                                    : `Mark ${subjectSelectedRows[subj].length} as Absent`}
                                            </button>
                                        )}
                                    </div>
                                )}
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
                            {absentModal.students.length} student(s) as absent{" "}
                            {absentModal.subject
                                ? `in ${absentModal.subject} for`
                                : "for"}{" "}
                            {selectedExamType}
                            {selectedExamType === "Monthly Test" &&
                            selectedMonth
                                ? ` in ${selectedMonth}`
                                : ""}
                            ?
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
                                            idx <
                                            absentModal.students.length - 1
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
                                        subject: absentModal.subject,
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
                                    cursor: markingAbsent
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity: markingAbsent ? 0.6 : 1,
                                }}
                            >
                                {markingAbsent
                                    ? "Marking..."
                                    : "Mark as Absent"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mark as Present Modal */}
            {presentModal && presentModal.open && (
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
                            Mark Students as Present
                        </h3>
                        <p style={{ color: theme.text, marginBottom: 16 }}>
                            Are you sure you want to mark the following{" "}
                            {presentModal.students.length} student(s) as present{" "}
                            {presentModal.subject
                                ? `in ${presentModal.subject} for`
                                : "for"}{" "}
                            {selectedExamType}
                            {selectedExamType === "Monthly Test" &&
                            selectedMonth
                                ? ` in ${selectedMonth}`
                                : ""}
                            ?
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
                            {presentModal.students.map((student, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: "4px 0",
                                        borderBottom:
                                            idx <
                                            presentModal.students.length - 1
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
                                    setPresentModal({
                                        open: false,
                                        students: [],
                                        subject: presentModal.subject,
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
                                onClick={confirmMarkAsPresent}
                                disabled={markingAbsent}
                                style={{
                                    padding: "8px 16px",
                                    border: "none",
                                    background: "#4caf50",
                                    color: "#fff",
                                    borderRadius: "6px",
                                    cursor: markingAbsent
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity: markingAbsent ? 0.6 : 1,
                                }}
                            >
                                {markingAbsent
                                    ? "Marking..."
                                    : "Mark as Present"}
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
                                                    "Content-Type":
                                                        "application/json",
                                                    Authorization: `Bearer ${token}`,
                                                },
                                                body: JSON.stringify({
                                                    rollNo: deleteStudentModal.rollNo,
                                                    session,
                                                    class: selectedClass,
                                                    examType: selectedExamType,
                                                    ...(selectedExamType ===
                                                        "Monthly Test" &&
                                                    selectedMonth
                                                        ? {
                                                              month: selectedMonth,
                                                          }
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
                                        alert(
                                            "Failed to delete student records."
                                        );
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
            {showPreviousYearsModal && (
                <PreviousYearsModal
                    open={showPreviousYearsModal}
                    onClose={() => setShowPreviousYearsModal(false)}
                    theme={theme}
                    session={session}
                />
            )}
        </div>
    );
}

export default StudentList;
