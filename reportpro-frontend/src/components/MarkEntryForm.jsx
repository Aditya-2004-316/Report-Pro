import React, { useState, useEffect } from "react";
import { SUBJECTS } from "./subjects";
import { safeDivision, validateStudentData, GRADE_COLORS } from "./gradeUtils";

function MarkEntryForm({
    onSubmit,
    accent,
    accentDark,
    subject,
    setSubject,
    session,
    setSession,
    theme,
    students = [],
}) {
    const [rollNo, setRollNo] = useState("");
    const [name, setName] = useState("");
    const [examType, setExamType] = useState(() => {
        return localStorage.getItem("markentry_examType") || "Monthly Test";
    });
    const [theory, setTheory] = useState("");
    const [practical, setPractical] = useState("");
    const [validationError, setValidationError] = useState("");
    const [confirmModal, setConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState(null);
    const [studentClass, setStudentClass] = useState(() => {
        return localStorage.getItem("markentry_class") || "9th";
    });
    const [month, setMonth] = useState(() => {
        return localStorage.getItem("markentry_month") || "";
    });
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
    const [studentRegistryModal, setStudentRegistryModal] = useState(false);
    const [registryStudents, setRegistryStudents] = useState([]);
    const [loadingRegistry, setLoadingRegistry] = useState(false);
    const [registryError, setRegistryError] = useState("");
    const [editingStudent, setEditingStudent] = useState(null); // {rollNo, name, idx}
    const [newStudent, setNewStudent] = useState({ rollNo: "", name: "" });
    const [savingRegistry, setSavingRegistry] = useState(false);
    const [autoAddToRegistry, setAutoAddToRegistry] = useState(
        () => localStorage.getItem("markentry_autoAddToRegistry") === "true"
    );
    // Add function to calculate total and grade
    const calculateTotalAndGrade = (theoryMarks, practicalMarks) => {
        // Validate input values
        const theory =
            typeof theoryMarks === "number" ? theoryMarks : Number(theoryMarks);
        const practical =
            typeof practicalMarks === "number"
                ? practicalMarks
                : Number(practicalMarks);

        // Check for valid numbers
        if (isNaN(theory) || isNaN(practical)) {
            return { total: 0, grade: "E2" };
        }

        // Calculate total
        const total = theory + practical;

        // Calculate grade based on percentage (total out of 100)
        const percentage = safeDivision(total, 100, 0) * 100;

        // Grade assignment logic matching StudentList component
        let grade;
        if (percentage >= 91) grade = "A+";
        else if (percentage >= 81) grade = "A";
        else if (percentage >= 71) grade = "B+";
        else if (percentage >= 61) grade = "B";
        else if (percentage >= 51) grade = "C+";
        else if (percentage >= 41) grade = "C";
        else if (percentage >= 33) grade = "D";
        else if (percentage >= 21) grade = "E1";
        else grade = "E2";

        return { total: Math.round(total), grade };
    };

    // Responsive: update isMobile and isTablet on window resize (same pattern as DashboardLayout)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
    const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);

    // Only show sessions: currentYear-nextYear and nextYear-yearAfter
    const currentYear = new Date().getFullYear();
    const sessionOptions = [
        `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
        `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`,
    ];

    // Set default session to current year session
    useEffect(() => {
        if (!session) setSession(sessionOptions[0]);
    }, []);

    // Save form field values to localStorage when they change
    useEffect(() => {
        localStorage.setItem("markentry_examType", examType);
    }, [examType]);

    useEffect(() => {
        localStorage.setItem("markentry_class", studentClass);
    }, [studentClass]);

    useEffect(() => {
        localStorage.setItem("markentry_month", month);
    }, [month]);

    useEffect(() => {
        localStorage.setItem(
            "markentry_autoAddToRegistry",
            autoAddToRegistry.toString()
        );
    }, [autoAddToRegistry]);

    // Reset month when exam type changes
    useEffect(() => {
        if (examType !== "Monthly Test") {
            setMonth("");
        }
    }, [examType]);

    // Update the useEffect to fetch registry when session or class changes:
    useEffect(() => {
        if (!session || !studentClass) {
            setRegistryStudents([]);
            return;
        }
        setLoadingRegistry(true);
        setRegistryError("");
        const token = sessionStorage.getItem("token");
        fetch(
            `${API_BASE}/api/student-registry?session=${session}&class=${studentClass}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                setRegistryStudents(data && data.students ? data.students : []);
                setLoadingRegistry(false);
            })
            .catch((err) => {
                setRegistryError("Failed to fetch student list");
                setLoadingRegistry(false);
            });
    }, [session, studentClass]);

    // Add useEffect for responsive behavior (same pattern as DashboardLayout)
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 600);
            setIsTablet(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Prevent mouse wheel or arrow/page keys from changing number inputs when focused
    useEffect(() => {
        const handleWheel = (e) => {
            const active = document.activeElement;
            if (
                active &&
                active.tagName === "INPUT" &&
                active.getAttribute("type") === "number"
            ) {
                e.preventDefault();
            }
        };
        const handleKeydown = (e) => {
            const active = document.activeElement;
            if (
                active &&
                active.tagName === "INPUT" &&
                active.getAttribute("type") === "number" &&
                (e.key === "ArrowUp" ||
                    e.key === "ArrowDown" ||
                    e.key === "PageUp" ||
                    e.key === "PageDown")
            ) {
                e.preventDefault();
            }
        };
        document.addEventListener("wheel", handleWheel, { passive: false });
        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("wheel", handleWheel);
            document.removeEventListener("keydown", handleKeydown);
        };
    }, []);

    // Autocomplete for name/rollNo
    function handleSelectRegistryStudent(s) {
        setRollNo(s.rollNo);
        setName(s.name);
    }

    // Add/edit/delete in modal
    function handleAddStudent() {
        if (!newStudent.rollNo.trim() || !newStudent.name.trim()) return;
        setRegistryStudents([...registryStudents, { ...newStudent }]);
        setNewStudent({ rollNo: "", name: "" });
    }
    function handleEditStudent(idx) {
        setEditingStudent({ ...registryStudents[idx], idx });
    }
    function handleSaveEditStudent() {
        if (!editingStudent.rollNo.trim() || !editingStudent.name.trim())
            return;
        const updated = [...registryStudents];
        updated[editingStudent.idx] = {
            rollNo: editingStudent.rollNo,
            name: editingStudent.name,
        };
        setRegistryStudents(updated);
        setEditingStudent(null);
    }
    function handleDeleteStudent(idx) {
        setRegistryStudents(registryStudents.filter((_, i) => i !== idx));
    }
    function handleSaveRegistry() {
        setSavingRegistry(true);
        setRegistryError("");
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
                students: registryStudents,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setSavingRegistry(false);
                setStudentRegistryModal(false);
            })
            .catch((err) => {
                setRegistryError("Failed to save student list");
                setSavingRegistry(false);
            });
    }

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // Update the handleSubmit function to auto-add new students to registry:
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Step 1: Basic form validation
        if (
            (examType !== "Monthly Test" && !rollNo) ||
            !name ||
            !studentClass ||
            !examType ||
            !subject ||
            !session ||
            theory === "" ||
            practical === "" ||
            isNaN(Number(theory)) ||
            isNaN(Number(practical)) ||
            Number(theory) < 0 ||
            Number(theory) > 75 ||
            Number(practical) < 0 ||
            Number(practical) > 25 ||
            (examType === "Monthly Test" && !month)
        ) {
            setValidationError(
                "Please fill all fields with valid marks." +
                    (examType === "Monthly Test" && !month
                        ? " (Select month)"
                        : "")
            );
            return;
        }
        setValidationError("");

        // Step 2: Prepare data object early
        const data = {
            rollNo:
                examType === "Monthly Test"
                    ? rollNo.trim() || "N/A"
                    : rollNo.trim(),
            name: name.trim(),
            class: studentClass,
            examType: examType.trim(),
            subject: subject.trim(),
            session: session.trim(),
            theory: Number(theory),
            practical: Number(practical),
            ...(examType === "Monthly Test" ? { month } : {}),
        };

        // Step 3: Check for existing marks ONLY (no side effects)
        let exists = false;
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                exists = false;
            } else {
                // Construct API URL with proper filters including class and month
                let apiUrl = `${API_BASE}/api/students?session=${session}&class=${studentClass}&subject=${subject}&examType=${examType}`;
                if (examType === "Monthly Test" && month) {
                    apiUrl += `&month=${month}`;
                }

                const res = await fetch(apiUrl, {
                    method: "GET", // Explicitly specify GET to ensure read-only operation
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.status === 401) {
                    exists = false;
                } else if (res.ok) {
                    const studentsList = await res.json();

                    // Check if marks already exist for this specific student with actual scores
                    exists = studentsList.some((s) => {
                        // Must match on all key identifiers
                        const rollNoMatch =
                            String(s.rollNo).trim().toLowerCase() ===
                            String(data.rollNo).trim().toLowerCase();
                        const subjectMatch =
                            String(s.subject).trim() ===
                            String(data.subject).trim();
                        const examTypeMatch =
                            String(s.examType).trim() ===
                            String(data.examType).trim();
                        const sessionMatch =
                            String(s.session).trim() ===
                            String(data.session).trim();
                        const classMatch =
                            String(s.class).trim() ===
                            String(data.class).trim();

                        // For Monthly Test, also check month if both have month values
                        let monthMatch = true;
                        if (examType === "Monthly Test" && month && s.month) {
                            monthMatch =
                                String(s.month).trim() === String(month).trim();
                        }

                        // Only consider it a duplicate if it has actual numerical marks
                        const hasActualMarks =
                            typeof s.theory === "number" &&
                            s.theory >= 0 &&
                            typeof s.practical === "number" &&
                            s.practical >= 0;

                        return (
                            rollNoMatch &&
                            subjectMatch &&
                            examTypeMatch &&
                            sessionMatch &&
                            classMatch &&
                            monthMatch &&
                            hasActualMarks
                        );
                    });
                } else {
                    exists = false;
                }
            }
        } catch (err) {
            // fallback: allow submit if backend check fails
            exists = false;
        }

        // Step 4: Handle duplicate confirmation
        if (exists) {
            setPendingData(data);
            setConfirmModal(true);
            // Do NOT reset the form here and DO NOT perform any data operations
            return;
        }

        // Step 5: Submit data only if no duplicates found
        await submitStudentData(data);
    };

    // Separate function to handle actual data submission
    const submitStudentData = async (data) => {
        if (!onSubmit) {
            return;
        }

        try {
            // Submit the marks data and wait for result
            const result = await onSubmit(data);

            // Only proceed with registry addition if marks submission was successful
            if (!result || !result.success) {
                // Don't reset form on submission failure so user can retry
                return;
            }

            // ONLY after confirmed successful marks submission, handle auto-add to registry
            if (
                autoAddToRegistry &&
                data.rollNo.trim() &&
                data.rollNo.trim() !== "N/A" &&
                data.name.trim() &&
                session &&
                studentClass
            ) {
                const existingStudent = registryStudents.find(
                    (s) =>
                        s.rollNo.toLowerCase() ===
                        data.rollNo.trim().toLowerCase()
                );

                if (!existingStudent) {
                    try {
                        const token = sessionStorage.getItem("token");
                        const newRegistryStudents = [
                            ...registryStudents,
                            {
                                rollNo: data.rollNo.trim(),
                                name: data.name.trim(),
                            },
                        ];

                        const registryResponse = await fetch(
                            `${API_BASE}/api/student-registry`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    session,
                                    class: studentClass,
                                    students: newRegistryStudents,
                                }),
                            }
                        );

                        if (registryResponse.ok) {
                            // Update local registry state only if API call succeeded
                            setRegistryStudents(newRegistryStudents);
                        } else {
                        }
                    } catch (error) {
                        // Silently fail, registry will refresh on next session/class change
                    }
                } else {
                }
            } else {
                if (!autoAddToRegistry) {
                } else {
                }
            }

            // Reset only the data entry fields, not the form configuration fields
            setRollNo("");
            setName("");
            setTheory("");
            setPractical("");

            // Refresh registry data to ensure consistency
            if (session && studentClass) {
                const token = sessionStorage.getItem("token");
                try {
                    const response = await fetch(
                        `${API_BASE}/api/student-registry?session=${session}&class=${studentClass}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    if (response.ok) {
                        const refreshedData = await response.json();
                        setRegistryStudents(
                            refreshedData && refreshedData.students
                                ? refreshedData.students
                                : []
                        );
                    }
                } catch (error) {
                    // Silently fail, registry will refresh on next session/class change
                }
            }
        } catch (error) {
            // Don't reset form on error so user can retry
        }
    };

    function handleConfirmReplace() {
        if (pendingData) {
            // Use the same submission logic as normal submit
            submitStudentData(pendingData);
        }
        setConfirmModal(false);
        setPendingData(null);
    }
    function handleCancelReplace() {
        setConfirmModal(false);
        setPendingData(null);
        // Do NOT reset the form here
    }

    // Add function to auto-populate name when roll number is entered:
    function handleRollNoChange(value) {
        setRollNo(value);
        // Auto-populate name if roll number exists in registry
        if (value.trim() && registryStudents.length > 0) {
            const student = registryStudents.find(
                (s) => s.rollNo.toLowerCase() === value.trim().toLowerCase()
            );
            if (student) {
                setName(student.name);
            }
        }
    }

    // Add function to handle name selection from registry:
    function handleNameChange(value) {
        setName(value);
        // Auto-populate roll number if name exists in registry
        if (value.trim() && registryStudents.length > 0) {
            const student = registryStudents.find(
                (s) => s.name.toLowerCase() === value.trim().toLowerCase()
            );
            if (student) {
                setRollNo(student.rollNo);
            }
        }
    }

    // Add a function to suggest adding new students to registry:
    function suggestAddToRegistry() {
        if (
            rollNo.trim() &&
            name.trim() &&
            !registryStudents.find(
                (s) => s.rollNo.toLowerCase() === rollNo.trim().toLowerCase()
            )
        ) {
            // Show a subtle suggestion to add to registry
            return (
                <div
                    style={{
                        fontSize: 14,
                        color: theme.accent,
                        marginTop: 4,
                        fontStyle: "italic",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    💡 New student? Consider adding to the registry for future
                    use
                </div>
            );
        }
        return null;
    }

    // Card style for the form with gradient
    const formStyle = {
        background: theme.surface,
        borderRadius: 16,
        boxShadow: theme.shadow,
        width: "100%",
        maxWidth: 480,
        margin: "2rem auto",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 8,
        color: theme.text,
    };
    const labelStyle = {
        fontWeight: 700,
        color: "#e53935",
        marginBottom: 4,
        fontSize: 16,
    };
    const inputStyle = {
        width: "100%",
        padding: "12px 10px",
        borderRadius: 6,
        border: `1.5px solid ${theme.inputBorder}`,
        marginBottom: 16,
        fontSize: 16,
        boxSizing: "border-box",
        outline: "none",
        transition: "border 0.2s",
        background: theme.inputBg,
        color: theme.text,
    };
    const selectStyle = {
        ...inputStyle,
        fontWeight: 600,
    };
    const gradientBtn = {
        background: `linear-gradient(90deg, ${accent} 0%, ${accentDark} 100%)`,
        color: "#fff",
        border: "none",
        fontWeight: 700,
        fontSize: 16,
        borderRadius: 6,
        boxShadow: theme.shadow,
        transition: "background 0.2s",
        cursor: "pointer",
        width: "100%",
    };
    const submitBtnStyle = {
        ...gradientBtn,
        marginTop: 20,
        padding: "14px 0",
        fontSize: 18,
        letterSpacing: 1,
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

    // Responsive styles for MarkEntryForm
    const responsiveStyleTag = (
        <style>{`
            /* Large tablets and small desktops */
            @media (max-width: 1024px) {
                .markentry-form {
                    max-width: 95vw !important;
                    padding: 2rem 1.5rem !important;
                    margin: 1.5rem auto !important;
                }
                .markentry-title {
                    font-size: 24px !important;
                    margin-bottom: 16px !important;
                }
                .markentry-label {
                    font-size: 15px !important;
                    margin-bottom: 6px !important;
                }
                .markentry-input {
                    font-size: 15px !important;
                    padding: 12px 10px !important;
                    margin-bottom: 14px !important;
                }
                .markentry-submit {
                    padding: 16px 0 !important;
                    font-size: 17px !important;
                    margin-top: 24px !important;
                }
            }
            
            /* Tablets */
            @media (max-width: 768px) {
                .markentry-form {
                    max-width: 98vw !important;
                    padding: 1.8rem 1.2rem !important;
                    margin: 1rem auto !important;
                }
                .markentry-title {
                    font-size: 22px !important;
                    margin-bottom: 14px !important;
                }
                .markentry-label {
                    font-size: 14px !important;
                    margin-bottom: 5px !important;
                }
                .markentry-input {
                    font-size: 14px !important;
                    padding: 11px 9px !important;
                    margin-bottom: 12px !important;
                }
                .markentry-submit {
                    padding: 15px 0 !important;
                    font-size: 16px !important;
                    margin-top: 20px !important;
                }
                .markentry-marks-row {
                    flex-direction: column !important;
                    gap: 0 !important;
                }
                .markentry-marks-row > div {
                    flex: 1 !important;
                    width: 100% !important;
                }
            }
            
            /* Large phones */
            @media (max-width: 600px) {
                .markentry-form {
                    max-width: 100vw !important;
                    padding: 1.5rem 1rem !important;
                    margin: 0.5rem auto !important;
                    border-radius: 12px !important;
                }
                .markentry-title {
                    font-size: 20px !important;
                    margin-bottom: 12px !important;
                    letter-spacing: 0.5px !important;
                }
                .markentry-label {
                    font-size: 13px !important;
                    margin-bottom: 4px !important;
                }
                .markentry-input {
                    font-size: 13px !important;
                    padding: 10px 8px !important;
                    margin-bottom: 10px !important;
                    border-radius: 5px !important;
                }
                .markentry-submit {
                    padding: 14px 0 !important;
                    font-size: 15px !important;
                    margin-top: 18px !important;
                    border-radius: 5px !important;
                }
            }
            
            /* Small phones */
            @media (max-width: 480px) {
                .markentry-form {
                    padding: 1.2rem 0.8rem !important;
                    margin: 0.3rem auto !important;
                    border-radius: 10px !important;
                }
                .markentry-title {
                    font-size: 18px !important;
                    margin-bottom: 10px !important;
                }
                .markentry-label {
                    font-size: 12px !important;
                    margin-bottom: 3px !important;
                }
                .markentry-input {
                    font-size: 12px !important;
                    padding: 9px 7px !important;
                    margin-bottom: 8px !important;
                    border-radius: 4px !important;
                }
                .markentry-submit {
                    padding: 12px 0 !important;
                    font-size: 14px !important;
                    margin-top: 16px !important;
                    border-radius: 4px !important;
                }
            }
            
            /* Extra small phones */
            @media (max-width: 360px) {
                .markentry-form {
                    padding: 1rem 0.6rem !important;
                    margin: 0.2rem auto !important;
                }
                .markentry-title {
                    font-size: 16px !important;
                    margin-bottom: 8px !important;
                }
                .markentry-label {
                    font-size: 11px !important;
                    margin-bottom: 2px !important;
                }
                .markentry-input {
                    font-size: 11px !important;
                    padding: 8px 6px !important;
                    margin-bottom: 6px !important;
                }
                .markentry-submit {
                    padding: 11px 0 !important;
                    font-size: 13px !important;
                    margin-top: 14px !important;
                }
            }
            
            /* Landscape orientation on phones */
            @media (max-height: 500px) and (orientation: landscape) {
                .markentry-form {
                    margin: 0.5rem auto !important;
                    padding: 1rem 1.5rem !important;
                }
                .markentry-title {
                    font-size: 18px !important;
                    margin-bottom: 8px !important;
                }
                .markentry-input {
                    margin-bottom: 6px !important;
                }
                .markentry-submit {
                    margin-top: 12px !important;
                    padding: 10px 0 !important;
                }
            }
            
            /* Focus states for better accessibility */
            .markentry-input:focus {
                border-color: #e53935 !important;
                box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.2) !important;
                outline: none !important;
            }
            
            /* Hover effects for better interactivity */
            .markentry-input:hover {
                border-color: #b71c1c !important;
            }
            
            /* Smooth transitions */
            .markentry-form * {
                transition: all 0.2s ease-in-out !important;
            }
            
            /* Modal responsiveness */
            @media (max-width: 768px) {
                .markentry-modal {
                    padding: 1.5rem 1.2rem !important;
                    min-width: 280px !important;
                    max-width: 95vw !important;
                }
                .markentry-modal h3 {
                    font-size: 18px !important;
                }
                .markentry-modal div {
                    font-size: 14px !important;
                }
                .markentry-modal button {
                    padding: 6px 16px !important;
                    font-size: 14px !important;
                }
            }
            
            @media (max-width: 480px) {
                .markentry-modal {
                    padding: 1.2rem 1rem !important;
                    min-width: 260px !important;
                    max-width: 98vw !important;
                }
                .markentry-modal h3 {
                    font-size: 16px !important;
                }
                .markentry-modal div {
                    font-size: 13px !important;
                }
                .markentry-modal button {
                    padding: 5px 12px !important;
                    font-size: 13px !important;
                }
            }
        `}</style>
    );

    return (
        <>
            {confirmModal && (
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
                        className="markentry-modal"
                        style={{
                            background: theme.surface,
                            borderRadius: 14,
                            boxShadow: theme.shadow,
                            padding: "2rem 2.5rem",
                            minWidth: 320,
                            maxWidth: "90vw",
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
                            Marks Already Exist
                        </h3>
                        <div style={{ fontSize: 16, marginBottom: 12 }}>
                            Marks for this student/subject/exam type/session
                            already exist.
                            <br />
                            Do you want to replace them with the new marks?
                        </div>
                        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                            <button
                                onClick={handleConfirmReplace}
                                style={{
                                    background: accent,
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "8px 22px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    boxShadow: theme.shadow,
                                }}
                            >
                                Replace
                            </button>
                            <button
                                onClick={handleCancelReplace}
                                style={{
                                    background: theme.surface,
                                    color: accentDark,
                                    border: `2px solid ${accent}`,
                                    borderRadius: 6,
                                    padding: "8px 22px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    boxShadow: theme.shadow,
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {studentRegistryModal && (
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
                        className="markentry-modal"
                        style={{
                            position: "relative",
                            background: theme.surface,
                            borderRadius: 14,
                            boxShadow: theme.shadow,
                            padding: "2rem 2.5rem",
                            minWidth: 520,
                            maxWidth: "98vw",
                            color: theme.text,
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 18,
                        }}
                    >
                        {/* 4. Close button in top right */}
                        <button
                            onClick={() => setStudentRegistryModal(false)}
                            style={{
                                position: "absolute",
                                top: 12,
                                right: 16,
                                background: "transparent",
                                border: "none",
                                fontSize: 28,
                                color: accentDark,
                                cursor: "pointer",
                                fontWeight: 700,
                                zIndex: 10,
                                outline: "none",
                            }}
                            aria-label="Close"
                            onFocus={(e) => (e.target.style.border = "none")}
                            onBlur={(e) => (e.target.style.border = "none")}
                            onMouseDown={(e) =>
                                (e.target.style.border = "none")
                            }
                            onMouseUp={(e) => (e.target.style.border = "none")}
                            onMouseOver={(e) =>
                                (e.target.style.border = "none")
                            }
                        >
                            ×
                        </button>
                        <h3
                            style={{
                                color: accentDark,
                                fontWeight: 800,
                                fontSize: 20,
                                marginBottom: 8,
                            }}
                        >
                            Manage Student List
                        </h3>
                        {loadingRegistry ? (
                            <div>Loading...</div>
                        ) : (
                            <>
                                <div
                                    style={{
                                        maxHeight: 220,
                                        overflowY: "auto",
                                        width: "100%",
                                        marginBottom: 12,
                                    }}
                                >
                                    {registryStudents.length === 0 && (
                                        <div
                                            style={{
                                                color: theme.text,
                                                opacity: 0.7,
                                            }}
                                        >
                                            No students added yet.
                                        </div>
                                    )}
                                    {registryStudents.map((s, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: 8,
                                                padding: "4px 0",
                                            }}
                                        >
                                            {editingStudent &&
                                            editingStudent.idx === idx ? (
                                                <>
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
                                                            width: 120,
                                                            marginRight: 10,
                                                            fontSize: 16,
                                                            padding: "7px 10px",
                                                            background:
                                                                theme.inputBg,
                                                            color: theme.text,
                                                            border: `1.5px solid ${theme.inputBorder}`,
                                                            borderRadius: 6,
                                                        }}
                                                    />
                                                    <input
                                                        value={
                                                            editingStudent.name
                                                        }
                                                        onChange={(e) =>
                                                            setEditingStudent({
                                                                ...editingStudent,
                                                                name: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        style={{
                                                            flex: 1,
                                                            minWidth: 180,
                                                            fontSize: 16,
                                                            padding: "7px 10px",
                                                            background:
                                                                theme.inputBg,
                                                            color: theme.text,
                                                            border: `1.5px solid ${theme.inputBorder}`,
                                                            borderRadius: 6,
                                                        }}
                                                    />
                                                    <button
                                                        onClick={
                                                            handleSaveEditStudent
                                                        }
                                                        style={{
                                                            marginLeft: 6,
                                                            background: accent,
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 6,
                                                            padding: "6px 12px",
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
                                                            setEditingStudent(
                                                                null
                                                            )
                                                        }
                                                        style={{
                                                            marginLeft: 2,
                                                            background:
                                                                theme.surface,
                                                            color: accentDark,
                                                            border: `2px solid ${accent}`,
                                                            borderRadius: 6,
                                                            padding: "6px 12px",
                                                            fontWeight: 700,
                                                            fontSize: 14,
                                                            cursor: "pointer",
                                                            outline: "none",
                                                        }}
                                                        onMouseOver={(e) =>
                                                            (e.target.style.border = `2px solid ${accent}`)
                                                        }
                                                        onFocus={(e) =>
                                                            (e.target.style.border = `2px solid ${accent}`)
                                                        }
                                                        onBlur={(e) =>
                                                            (e.target.style.border = `2px solid ${accent}`)
                                                        }
                                                        onMouseDown={(e) =>
                                                            (e.target.style.border = `2px solid ${accent}`)
                                                        }
                                                        onMouseUp={(e) =>
                                                            (e.target.style.border = `2px solid ${accent}`)
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span
                                                        style={{
                                                            width: 120,
                                                            marginRight: 10,
                                                        }}
                                                    >
                                                        {s.rollNo}
                                                    </span>
                                                    <span
                                                        style={{
                                                            flex: 1,
                                                            minWidth: 180,
                                                        }}
                                                    >
                                                        {s.name}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleEditStudent(
                                                                idx
                                                            )
                                                        }
                                                        style={{
                                                            marginLeft: 6,
                                                            background: accent,
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 6,
                                                            padding: "6px 12px",
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
                                                            handleDeleteStudent(
                                                                idx
                                                            )
                                                        }
                                                        style={{
                                                            marginLeft: 2,
                                                            background:
                                                                theme.surface,
                                                            color: "#e53935",
                                                            border: `2px solid #e53935`,
                                                            borderRadius: 6,
                                                            padding: "6px 12px",
                                                            fontWeight: 700,
                                                            fontSize: 14,
                                                            cursor: "pointer",
                                                            outline: "none",
                                                        }}
                                                        onMouseOver={(e) =>
                                                            (e.target.style.border = `2px solid #e53935`)
                                                        }
                                                        onFocus={(e) =>
                                                            (e.target.style.border = `2px solid #e53935`)
                                                        }
                                                        onBlur={(e) =>
                                                            (e.target.style.border = `2px solid #e53935`)
                                                        }
                                                        onMouseDown={(e) =>
                                                            (e.target.style.border = `2px solid #e53935`)
                                                        }
                                                        onMouseUp={(e) =>
                                                            (e.target.style.border = `2px solid #e53935`)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                        width: "100%",
                                        marginBottom: 8,
                                    }}
                                >
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
                                            width: 120,
                                            marginRight: 10,
                                            fontSize: 16,
                                            padding: "7px 10px",
                                            background: theme.inputBg,
                                            color: theme.text,
                                            border: `1.5px solid ${theme.inputBorder}`,
                                            borderRadius: 6,
                                        }}
                                    />
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
                                            flex: 1,
                                            minWidth: 180,
                                            fontSize: 16,
                                            padding: "7px 10px",
                                            background: theme.inputBg,
                                            color: theme.text,
                                            border: `1.5px solid ${theme.inputBorder}`,
                                            borderRadius: 6,
                                        }}
                                    />
                                    <button
                                        onClick={handleAddStudent}
                                        style={{
                                            marginLeft: 6,
                                            background: accent,
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 6,
                                            fontWeight: 700,
                                            fontSize: 15,
                                            cursor: "pointer",
                                            boxShadow: theme.shadow,
                                            padding: "6px 12px",
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
                                </div>
                                {registryError && (
                                    <div
                                        style={{
                                            color: "#e53935",
                                            marginBottom: 8,
                                        }}
                                    >
                                        {registryError}
                                    </div>
                                )}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        marginTop: 8,
                                    }}
                                >
                                    <button
                                        onClick={handleSaveRegistry}
                                        disabled={savingRegistry}
                                        style={{
                                            background: accent,
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 6,
                                            padding: "8px 22px",
                                            fontWeight: 700,
                                            fontSize: 16,
                                            cursor: "pointer",
                                            boxShadow: theme.shadow,
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
                                        {savingRegistry
                                            ? "Saving..."
                                            : "Save List"}
                                    </button>
                                    <button
                                        onClick={() =>
                                            setStudentRegistryModal(false)
                                        }
                                        style={{
                                            background: theme.surface,
                                            color: accentDark,
                                            border: `2px solid ${accent}`,
                                            borderRadius: 6,
                                            padding: "8px 22px",
                                            fontWeight: 700,
                                            fontSize: 16,
                                            cursor: "pointer",
                                            boxShadow: theme.shadow,
                                            outline: "none",
                                        }}
                                        onMouseOver={(e) =>
                                            (e.target.style.border = `2px solid ${accent}`)
                                        }
                                        onFocus={(e) =>
                                            (e.target.style.border = `2px solid ${accent}`)
                                        }
                                        onBlur={(e) =>
                                            (e.target.style.border = `2px solid ${accent}`)
                                        }
                                        onMouseDown={(e) =>
                                            (e.target.style.border = `2px solid ${accent}`)
                                        }
                                        onMouseUp={(e) =>
                                            (e.target.style.border = `2px solid ${accent}`)
                                        }
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            <div
                style={{
                    background: theme.surface,
                    borderRadius: 16,
                    boxShadow: theme.shadow,
                    border: `1.5px solid ${theme.border}`,
                    color: theme.text,
                    maxWidth: 540,
                    width: "100%",
                    margin: "2rem auto",
                    padding: "2rem 1.5rem",
                    boxSizing: "border-box",
                }}
            >
                <form
                    onSubmit={handleSubmit}
                    className="markentry-form"
                    style={
                        {
                            // Remove marginLeft, marginRight, marginBottom for consistency
                        }
                    }
                >
                    {responsiveStyleTag}
                    <h2 className="markentry-title" style={gradientText}>
                        Enter Student Marks
                    </h2>
                    {/* Update the form layout to be responsive for the Manage Student List button: */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection:
                                isMobile || isTablet ? "column" : "row",
                            gap: isMobile || isTablet ? 16 : 12,
                            alignItems:
                                isMobile || isTablet ? "stretch" : "center",
                            marginBottom: 8,
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <label
                                className="markentry-label"
                                style={labelStyle}
                            >
                                Session
                            </label>
                            <select
                                value={session}
                                onChange={(e) => setSession(e.target.value)}
                                className="markentry-input"
                                style={selectStyle}
                                required
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
                                className="markentry-label"
                                style={labelStyle}
                            >
                                Class
                            </label>
                            <select
                                value={studentClass}
                                onChange={(e) =>
                                    setStudentClass(e.target.value)
                                }
                                className="markentry-input"
                                style={selectStyle}
                                required
                            >
                                <option value="9th">9th</option>
                                <option value="10th">10th</option>
                            </select>
                        </div>
                        {!(isMobile || isTablet) && (
                            <button
                                type="button"
                                onClick={() => setStudentRegistryModal(true)}
                                style={{
                                    background: accent,
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "8px 14px",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    cursor: "pointer",
                                    boxShadow: theme.shadow,
                                    marginTop: 6,
                                    height: 40,
                                    outline: "none",
                                    whiteSpace: "nowrap",
                                }}
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
                                Manage Student List
                            </button>
                        )}
                    </div>

                    {/* Mobile and Tablet Manage Student List button */}
                    {(isMobile || isTablet) && (
                        <button
                            type="button"
                            onClick={() => setStudentRegistryModal(true)}
                            style={{
                                background: accent,
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "12px 16px",
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: "pointer",
                                boxShadow: theme.shadow,
                                outline: "none",
                                width: "100%",
                                marginBottom: 16,
                            }}
                            onFocus={(e) => (e.target.style.border = "none")}
                            onBlur={(e) => (e.target.style.border = "none")}
                            onMouseDown={(e) =>
                                (e.target.style.border = "none")
                            }
                            onMouseUp={(e) => (e.target.style.border = "none")}
                        >
                            Manage Student List
                        </button>
                    )}

                    <div>
                        <label className="markentry-label" style={labelStyle}>
                            Exam Type
                        </label>
                        <select
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            className="markentry-input"
                            style={selectStyle}
                            required
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
                    {/* Month dropdown for Monthly Test */}
                    {examType === "Monthly Test" && (
                        <div>
                            <label
                                className="markentry-label"
                                style={labelStyle}
                            >
                                Month
                            </label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="markentry-input"
                                style={selectStyle}
                                required
                            >
                                <option value="" disabled>
                                    Select month
                                </option>
                                {MONTHS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="markentry-label" style={labelStyle}>
                            Subject
                        </label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="markentry-input"
                            style={selectStyle}
                        >
                            {SUBJECTS.map((subj) => (
                                <option key={subj} value={subj}>
                                    {subj}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="markentry-label" style={labelStyle}>
                            Roll No
                        </label>
                        <input
                            value={rollNo}
                            onChange={(e) => handleRollNoChange(e.target.value)}
                            required
                            className="markentry-input"
                            style={inputStyle}
                            // placeholder="Enter roll number to find student from registry"
                        />
                    </div>
                    <div>
                        <label className="markentry-label" style={labelStyle}>
                            Name
                        </label>
                        <input
                            id="student-name"
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            required
                            className="markentry-input"
                            style={inputStyle}
                        />
                    </div>
                    <div
                        className="markentry-marks-row"
                        style={{ display: "flex", gap: 12 }}
                    >
                        <div style={{ flex: 1 }}>
                            <label
                                className="markentry-label"
                                style={labelStyle}
                            >
                                Theory (out of 75)
                            </label>
                            <input
                                type="number"
                                inputMode="numeric"
                                step={1}
                                value={theory}
                                onChange={(e) => setTheory(e.target.value)}
                                onWheel={(e) => e.preventDefault()}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "ArrowUp" ||
                                        e.key === "ArrowDown" ||
                                        e.key === "PageUp" ||
                                        e.key === "PageDown"
                                    ) {
                                        e.preventDefault();
                                    }
                                }}
                                required
                                min={0}
                                max={75}
                                className="markentry-input"
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label
                                className="markentry-label"
                                style={labelStyle}
                            >
                                Practical (out of 25)
                            </label>
                            <input
                                type="number"
                                inputMode="numeric"
                                step={1}
                                value={practical}
                                onChange={(e) => setPractical(e.target.value)}
                                onWheel={(e) => e.preventDefault()}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "ArrowUp" ||
                                        e.key === "ArrowDown" ||
                                        e.key === "PageUp" ||
                                        e.key === "PageDown"
                                    ) {
                                        e.preventDefault();
                                    }
                                }}
                                required
                                min={0}
                                max={25}
                                className="markentry-input"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                    {validationError && (
                        <div
                            style={{
                                color: accent,
                                fontWeight: 600,
                                marginBottom: 8,
                                textAlign: "center",
                            }}
                        >
                            {validationError}
                        </div>
                    )}

                    {/* Auto-add to registry checkbox */}
                    <div
                        style={{
                            marginBottom: 20,
                            padding: "16px 20px",
                            background: theme.surface,
                            border: `2px solid ${theme.border}`,
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            boxShadow: theme.shadow,
                        }}
                    >
                        <input
                            type="checkbox"
                            id="auto-add-registry"
                            checked={autoAddToRegistry}
                            onChange={(e) =>
                                setAutoAddToRegistry(e.target.checked)
                            }
                            style={{
                                width: 18,
                                height: 18,
                                cursor: "pointer",
                                accentColor: accent,
                                transform: "scale(1.1)",
                            }}
                        />
                        <label
                            htmlFor="auto-add-registry"
                            style={{
                                fontSize: 15,
                                color: theme.text,
                                cursor: "pointer",
                                fontWeight: 600,
                                userSelect: "none",
                            }}
                        >
                            Automatically add new students to registry
                        </label>
                        <div
                            style={{
                                fontSize: 13,
                                color: theme.text,
                                opacity: 0.7,
                                marginLeft: "auto",
                                fontStyle: "italic",
                            }}
                        >
                            💡 New students will be automatically saved to your
                            class registry
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="markentry-submit"
                        style={submitBtnStyle}
                    >
                        Submit
                    </button>
                </form>
            </div>
        </>
    );
}

export default MarkEntryForm;
