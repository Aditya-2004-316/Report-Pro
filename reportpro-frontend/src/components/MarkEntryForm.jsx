import React, { useState, useEffect } from "react";
import { SUBJECTS } from "./subjects";

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
    const [examType, setExamType] = useState("Monthly Test");
    const [theory, setTheory] = useState("");
    const [practical, setPractical] = useState("");
    const [validationError, setValidationError] = useState("");
    const [confirmModal, setConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState(null);
    const [studentClass, setStudentClass] = useState("9th");

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

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            Number(practical) > 25
        ) {
            setValidationError("Please fill all fields with valid marks.");
            return;
        }
        setValidationError("");
        // Fetch students for the session from backend
        let exists = false;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE}/api/students?session=${session}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const studentsList = await res.json();
            exists = studentsList.some(
                (s) =>
                    (examType === "Monthly Test" ||
                        String(s.rollNo).trim().toLowerCase() ===
                            String(rollNo).trim().toLowerCase()) &&
                    String(s.subject).trim() === String(subject).trim() &&
                    String(s.examType).trim() === String(examType).trim() &&
                    String(s.session).trim() === String(session).trim()
            );
        } catch (err) {
            // fallback: allow submit if backend check fails
            exists = false;
        }
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
        };
        if (exists) {
            setPendingData(data);
            setConfirmModal(true);
            // Do NOT reset the form here
            return;
        }
        if (onSubmit) {
            onSubmit(data);
            setRollNo("");
            setName("");
            setStudentClass("9th");
            setExamType("Monthly Test");
            setTheory("");
            setPractical("");
            // session and subject remain sticky
        }
    };

    function handleConfirmReplace() {
        if (onSubmit && pendingData) {
            onSubmit(pendingData);
            setRollNo("");
            setName("");
            setStudentClass("9th");
            setExamType("Monthly Test");
            setTheory("");
            setPractical("");
        }
        setConfirmModal(false);
        setPendingData(null);
    }
    function handleCancelReplace() {
        setConfirmModal(false);
        setPendingData(null);
        // Do NOT reset the form here
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
                    <div>
                        <label className="markentry-label" style={labelStyle}>
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
                    <div>
                        <label className="markentry-label" style={labelStyle}>
                            Class
                        </label>
                        <select
                            value={studentClass}
                            onChange={(e) => setStudentClass(e.target.value)}
                            className="markentry-input"
                            style={selectStyle}
                            required
                        >
                            <option value="9th">9th</option>
                            <option value="10th">10th</option>
                        </select>
                    </div>
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
                            Roll No{" "}
                            {examType === "Monthly Test" && "(Optional)"}
                        </label>
                        <input
                            value={rollNo}
                            onChange={(e) => setRollNo(e.target.value)}
                            required={examType !== "Monthly Test"}
                            className="markentry-input"
                            style={inputStyle}
                            placeholder={
                                examType === "Monthly Test"
                                    ? "Optional for Monthly Test"
                                    : "Enter roll number"
                            }
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
                            onChange={(e) => setName(e.target.value)}
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
                                value={theory}
                                onChange={(e) => setTheory(e.target.value)}
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
                                value={practical}
                                onChange={(e) => setPractical(e.target.value)}
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
