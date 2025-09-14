import React, { useEffect, useState, useRef } from "react";
import { SUBJECTS } from "./subjects";
import {
    calculateStats,
    isPassingGrade,
    GRADE_COLORS,
    safeDivision,
    validateStudentData,
    getGradeColor,
    filterStudents,
} from "./gradeUtils";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Legend,
    Rectangle,
} from "recharts";
import {
    MdPeople,
    MdPercent,
    MdCheckCircle,
    MdCancel,
    MdEmojiEvents,
    MdBarChart,
    MdGrade,
} from "react-icons/md";

// Custom bar shape to prevent gray overlay on hover
const CustomBar = (props) => {
    return <Rectangle {...props} fill={props.fill} />;
};
// Custom active bar shape to match the bar color exactly
const CustomActiveBar = (props) => {
    return <Rectangle {...props} fill={props.fill} />;
};

function Dashboard({
    accent = "#e53935",
    accentDark = "#b71c1c",
    session,
    setSession,
    token,
    theme = "light",
    dataRefreshTrigger = 0, // Add this prop
}) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const csvLinkRef = useRef();
    const [selectedClass, setSelectedClass] = useState("9th");
    const [selectedExamType, setSelectedExamType] = useState("Monthly Test");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("All");
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
    // Reset month and subject when exam type changes
    useEffect(() => {
        setSelectedMonth("");
        setSelectedSubject("All");
    }, [selectedExamType]);
    // Set default month: last used or current month
    useEffect(() => {
        const lastUsedMonth = localStorage.getItem("statistics_last_month");
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
            localStorage.setItem("statistics_last_month", selectedMonth);
        }
    }, [selectedMonth, selectedExamType]);
    const [stats, setStats] = useState({
        passFail: { pass: 0, fail: 0 },
        classAverage: 0,
        gradeDist: {},
        topScorer: null,
    });
    const [registryStudents, setRegistryStudents] = useState([]);
    const [loadingRegistry, setLoadingRegistry] = useState(false);

    // Only show sessions: currentYear-nextYear and nextYear-yearAfter
    const currentYear = new Date().getFullYear();
    const sessionOptions = [
        `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
        `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`,
    ];

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        if (!session) setSession(sessionOptions[0]);
    }, []);
    useEffect(() => {
        if (!session || !token || !selectedClass) {
            console.log(
                "Dashboard: Skipping data fetch - missing required params:",
                { session, token: !!token, selectedClass }
            );
            return;
        }
        setLoading(true);
        console.log("Dashboard: Fetching data with params:", {
            session,
            selectedClass,
            selectedExamType,
            selectedSubject,
            selectedMonth,
        });

        // Fetch all students for the session/class (for general student list)
        fetch(
            `${API_BASE}/api/students?session=${session}&class=${selectedClass}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        )
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log(
                    "Dashboard: Students data received:",
                    data.length,
                    "students"
                );
                // Validate data structure with comprehensive checks
                if (Array.isArray(data)) {
                    const validStudents = data.filter(validateStudentData);
                    console.log(
                        "Dashboard: Valid students:",
                        validStudents.length,
                        "out of",
                        data.length
                    );
                    if (validStudents.length !== data.length) {
                        console.warn(
                            "Dashboard: Some students were filtered out due to missing/invalid fields"
                        );
                        const invalidStudent = data.find(
                            (s) => !validateStudentData(s)
                        );
                        if (invalidStudent) {
                            console.log(
                                "Dashboard: Sample invalid student:",
                                invalidStudent
                            );
                        }
                    }
                    setStudents(validStudents);
                } else {
                    console.error(
                        "Dashboard: Invalid data format received:",
                        typeof data
                    );
                    setStudents([]);
                }
                setLoading(false);
                setLastUpdated(new Date());
            })
            .catch((error) => {
                console.error("Dashboard: Error fetching students:", error);
                setLoading(false);
            });

        // Fetch statistics with current filters
        fetchFilteredStatistics();
    }, [session, token, selectedClass]);

    // Function to fetch statistics with current filters
    const fetchFilteredStatistics = async () => {
        if (!session || !token || !selectedClass) return;

        try {
            console.log("Dashboard: Fetching statistics with filters:", {
                session,
                selectedClass,
                selectedExamType,
                selectedSubject,
                selectedMonth,
            });

            const response = await fetch(
                `${API_BASE}/api/statistics?session=${session}&class=${selectedClass}&examType=${selectedExamType}&subject=${selectedSubject}${
                    selectedExamType === "Monthly Test" && selectedMonth
                        ? `&month=${selectedMonth}`
                        : ""
                }`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Validate API response structure
            const validatedStats = {
                topScorer: data.topScorer || null,
                classAverage:
                    typeof data.classAverage === "number"
                        ? data.classAverage
                        : 0,
                gradeDist:
                    data.gradeDist && typeof data.gradeDist === "object"
                        ? data.gradeDist
                        : {},
                passFail: {
                    pass:
                        typeof data.passFail?.pass === "number"
                            ? data.passFail.pass
                            : 0,
                    fail:
                        typeof data.passFail?.fail === "number"
                            ? data.passFail.fail
                            : 0,
                },
                totalStudents:
                    typeof data.totalStudents === "number"
                        ? data.totalStudents
                        : 0,
                totalSubjectRecords:
                    typeof data.totalSubjectRecords === "number"
                        ? data.totalSubjectRecords
                        : 0,
            };

            console.log(
                "Dashboard: Validated statistics received:",
                validatedStats
            );
            setStats(validatedStats);
        } catch (error) {
            console.error(
                "Dashboard: Error fetching filtered statistics:",
                error
            );
            // Set empty stats on error with proper structure
            setStats({
                topScorer: null,
                classAverage: 0,
                gradeDist: {},
                passFail: { pass: 0, fail: 0 },
                totalStudents: 0,
                totalSubjectRecords: 0,
            });
        }
    };

    // Refetch statistics when filters change
    useEffect(() => {
        fetchFilteredStatistics();
    }, [
        session,
        token,
        selectedClass,
        selectedExamType,
        selectedSubject,
        selectedMonth,
    ]);

    // Refresh data when dataRefreshTrigger changes (after mark entry)
    useEffect(() => {
        if (dataRefreshTrigger > 0) {
            console.log(
                "Dashboard: Refreshing data due to trigger:",
                dataRefreshTrigger
            );
            fetchFilteredStatistics();
        }
    }, [dataRefreshTrigger]);

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

    // Update the filtered students to use registry names when available and apply current filters
    const filteredStudents = filterStudents(
        students.map((student) => ({
            ...student,
            // Use registry name if available, otherwise fall back to stored name
            name:
                getStudentNameFromRegistry(student.rollNo) ||
                student.name ||
                "Unknown",
        })),
        {
            examType: selectedExamType,
            subject: selectedSubject,
            month: selectedMonth,
        }
    );

    // Debug logging
    console.log("Dashboard Debug:", {
        totalStudents: students.length,
        filteredStudents: filteredStudents.length,
        selectedExamType,
        selectedSubject,
        selectedMonth,
        filters: {
            examType: selectedExamType,
            subject: selectedSubject,
            month: selectedMonth,
        },
        currentSession: session,
        currentClass: selectedClass,
        token: token ? "Present" : "Missing",
        statsFromAPI: stats,
    });

    if (loading) return <div>Loading...</div>;

    // Use statistics from API instead of local calculations with safe division
    const totalStudents = stats.totalStudents || 0;
    const passCount = stats.passFail?.pass || 0;
    const failCount = stats.passFail?.fail || 0;
    const classAverage = stats.classAverage || 0;
    const overallAvg = classAverage; // Use classAverage as the overall average
    const overallPassRate = safeDivision(passCount, totalStudents, 0) * 100;

    // Grade distribution from API
    const gradeDist = stats.gradeDist || {};
    const gradeDistData = Object.entries(gradeDist).map(([grade, count]) => ({
        name: grade,
        value: count,
    }));

    const passFailData = [
        { name: "Pass", value: passCount },
        { name: "Fail", value: failCount },
    ];
    // Use centralized grade colors
    const passFailColors = ["#43ea7b", accent];

    // Use only grades present in the data for legend
    const gradesInData = Array.from(
        new Set(gradeDistData.map((g) => (g.name || "").trim().toUpperCase()))
    );

    // --- STYLES ---
    const containerStyle = {
        width: "100%",
        maxWidth: 1400,
        margin: "2rem auto",
        background: theme.background,
        borderRadius: 16,
        boxShadow: theme.shadow,
        padding: "2.5rem 1.5rem 2rem 1.5rem",
        boxSizing: "border-box",
        color: theme.text,
    };
    const summaryGrid = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 28,
        marginBottom: 36,
        alignItems: "center",
    };
    const summaryCard = {
        background: theme.surface,
        borderRadius: 14,
        boxShadow: theme.shadow,
        padding: "1.2rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120,
        border: `2px solid ${theme.border}`,
        position: "relative",
        color: theme.text,
    };
    const summaryIcon = {
        fontSize: 36,
        marginBottom: 8,
        color: accentDark,
    };
    const summaryValue = {
        fontWeight: 800,
        fontSize: 28,
        color: accentDark,
        marginBottom: 2,
    };
    const summaryLabel = {
        fontWeight: 600,
        fontSize: 16,
        color: accent,
        letterSpacing: 0.5,
        textAlign: "center",
    };
    const chartCard = {
        background: theme.surface,
        borderRadius: 14,
        boxShadow: theme.shadow,
        padding: "1.2rem 1rem",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${theme.border}`,
        marginBottom: 36,
        color: theme.text,
    };
    const subjectGrid = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: 32,
        marginTop: 18,
        alignItems: "stretch", // Ensure all cards have consistent height
    };
    const statCardStyle = {
        marginBottom: 36,
        fontSize: 18,
        padding: 24,
        background: theme.surface,
        borderRadius: 16,
        boxShadow: theme.shadow,
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        transition: "box-shadow 0.2s, transform 0.2s",
        border: `2.5px solid ${theme.border}`,
        borderLeft: `8px solid ${accent}`,
        position: "relative",
        marginTop: 18,
        color: theme.text,
        "--hover-shadow":
            theme.surface === "#32353b"
                ? "0 8px 32px #11182777"
                : "0 8px 32px #e5393533",
    };
    const statCardHover = {
        boxShadow: "0 8px 32px #e5393533",
        transform: "translateY(-2px) scale(1.01)",
        borderLeft: `8px solid ${accentDark}`,
    };
    const labelStyle = {
        color: accentDark,
        fontWeight: 700,
        fontSize: 17,
        marginBottom: 2,
        letterSpacing: 0.5,
        marginTop: 8,
    };
    const gradientValue = {
        background: "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: 800,
        fontSize: 22,
        marginBottom: 0,
        letterSpacing: 1,
        display: "inline-block",
    };
    const gradientText = {
        background: `linear-gradient(90deg, ${accent} 0%, ${accentDark} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: 800,
        fontSize: 28,
        marginBottom: 28,
        letterSpacing: 1,
        display: "inline-block",
        textAlign: "center",
        width: "100%",
    };
    const subjectTitle = {
        ...gradientText,
        fontSize: 24,
        marginBottom: 10,
        marginTop: 0,
        textAlign: "left",
        letterSpacing: 1.2,
        display: "flex",
        alignItems: "center",
        gap: 10,
    };
    const divider = {
        height: 2,
        background: "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
        opacity: 0.08,
        border: "none",
        margin: "32px 0 24px 0",
    };
    const gradeBarContainer = {
        display: "flex",
        gap: 8,
        alignItems: "center",
        margin: "8px 0 0 0",
        flexWrap: "wrap",
    };
    const gradeBar = (count, max) => ({
        height: 18,
        minWidth: 32,
        width: `${Math.max(12, (count / max) * 120)}px`,
        background: "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
        borderRadius: 8,
        color: "#fff",
        fontWeight: 700,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 4px #e5393511",
        marginRight: 6,
    });
    const passFailStyle = {
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginTop: 4,
    };
    const passIcon = {
        display: "inline-block",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #43ea7b 0%, #1de982 100%)",
        marginRight: 6,
        border: "1.5px solid #b2dfdb",
    };
    const failIcon = {
        display: "inline-block",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #e53935 0%, #b71c1c 100%)",
        marginRight: 6,
        border: "1.5px solid #ffcdd2",
    };
    const topScorerBox = {
        background: theme.surface === "#32353b" ? "#4a4e57" : "#fff5f5",
        borderRadius: 8,
        padding: "8px 14px",
        fontSize: 16,
        fontWeight: 600,
        color: accentDark,
        margin: "4px 0 0 0",
        boxShadow: "0 1px 4px #e5393511",
        display: "inline-block",
    };

    const subjectCardStyle = {
        ...statCardStyle,
        background: theme.surface,
        border: `2px solid ${theme.border}`,
        boxShadow: theme.shadow,
        minHeight: 380, // Ensure consistent height
    };
    const statGrid = {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 18,
        alignItems: "center",
        marginBottom: 8,
    };
    const badge = (bg, color = "#fff") => ({
        display: "inline-block",
        background: bg,
        color,
        borderRadius: 16,
        padding: "3px 12px",
        fontWeight: 700,
        fontSize: 15,
        marginRight: 8,
        marginBottom: 4,
        boxShadow: "0 1px 4px #e5393511",
        letterSpacing: 0.5,
    });
    const passBadge = badge("#43ea7b", "#222");
    const failBadge = badge("#e53935");
    // Responsive tweaks
    const responsive = {
        "@media (max-width: 600px)": {
            padding: "1rem 0.5rem",
            fontSize: 15,
        },
    };

    // Group students by subject
    const studentsBySubject = SUBJECTS.reduce((acc, subj) => {
        acc[subj] = filteredStudents.filter((s) => s.subject === subj);
        return acc;
    }, {});

    // Find max grade count for bar scaling with null check
    const maxGradeCount = (gradeDist) => {
        if (!gradeDist || typeof gradeDist !== "object") return 1;
        const values = Object.values(gradeDist);
        return values.length > 0 ? Math.max(1, ...values) : 1;
    };

    // Comprehensive responsive styles
    const responsiveStyleTag = (
        <style>{`
                .dashboard-container {
                transition: all 0.3s ease;
            }
            
            .dashboard-title {
                transition: all 0.3s ease;
            }
            
            .summary-grid {
                transition: all 0.3s ease;
            }
            
                .dashboard-card {
                transition: all 0.3s ease;
            }
            
            .chart-card {
                transition: all 0.3s ease;
            }
            
            .subject-grid {
                transition: all 0.3s ease;
            }
            
            .filters-container {
                transition: all 0.3s ease;
            }
            
            .filter-group {
                transition: all 0.3s ease;
            }
            
            .export-section {
                transition: all 0.3s ease;
            }
            
            /* Enhanced responsive styles for better dashboard layout */
            @media (max-width: 992px) {
                .dashboard-header {
                    flex-direction: column !important;
                    align-items: center !important;
                    gap: 16px !important;
                    position: static !important;
                }
                .dashboard-header-actions {
                    position: static !important;
                    width: 100% !important;
                    justify-content: flex-end !important;
                    flex-wrap: wrap !important;
                }
            }
            
            @media (max-width: 768px) {
                .dashboard-header-actions {
                    justify-content: center !important;
                    gap: 8px !important;
                }
            }
            
            /* Large Desktop (1400px and up) */
            @media (min-width: 1400px) {
                .dashboard-container {
                    max-width: 1600px;
                    padding: 3rem 2rem 2.5rem 2rem;
                }
                
                .dashboard-title {
                    font-size: 38px;
                    margin-bottom: 24px;
                }
                
                .summary-grid {
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 32px;
                    margin-bottom: 42px;
                }
                
                .dashboard-card {
                    min-height: 140px;
                    padding: 1.5rem 1.2rem;
                }
                
                .summary-icon {
                    font-size: 42px;
                }
                
                .summary-value {
                    font-size: 32px;
                }
                
                .summary-label {
                    font-size: 18px;
                }
                
                .chart-card {
                    min-height: 260px;
                    padding: 1.5rem 1.2rem;
                }
                
                .subject-grid {
                    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
                    gap: 36px;
                }
                
                .filters-container {
                    gap: 20px;
                    margin-bottom: 24px;
                }
                
                .filter-group {
                    max-width: 360px;
                }
                
                .filter-group select {
                    padding: 12px 10px;
                    font-size: 17px;
                }
            }
            
            /* Desktop (1024px to 1399px) */
            @media (min-width: 1024px) and (max-width: 1399px) {
                .dashboard-container {
                    max-width: 1200px;
                    padding: 2.5rem 1.8rem 2rem 1.8rem;
                }
                
                .dashboard-title {
                    font-size: 36px;
                    margin-bottom: 20px;
                }
                
                .summary-grid {
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 28px;
                    margin-bottom: 36px;
                }
                
                .dashboard-card {
                    min-height: 130px;
                    padding: 1.3rem 1rem;
                }
                
                .subject-card {
                    min-height: 400px !important;
                }
                
                .summary-icon {
                    font-size: 38px;
                }
                
                .summary-value {
                    font-size: 30px;
                }
                
                .summary-label {
                    font-size: 17px;
                }
                
                .chart-card {
                    min-height: 240px;
                    padding: 1.3rem 1rem;
                }
                
                .subject-grid {
                    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
                    gap: 32px;
                    align-items: stretch;
                }
                
                .filters-container {
                    gap: 18px;
                    margin-bottom: 20px;
                }
                
                .filter-group {
                    max-width: 320px;
                }
                
                .filter-group select {
                    padding: 11px 9px;
                    font-size: 16px;
                }
            }
            
            /* Tablet Landscape (768px to 1023px) */
            @media (min-width: 768px) and (max-width: 1023px) {
                .dashboard-container {
                    max-width: 100%;
                    padding: 2rem 1.5rem 1.8rem 1.5rem;
                    margin: 1.5rem auto;
                }
                
                .dashboard-title {
                    font-size: 32px;
                    margin-bottom: 18px;
                }
                
                .summary-grid {
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }
                
                .dashboard-card {
                    min-height: 120px;
                    padding: 1.2rem 0.9rem;
                }
                
                .subject-card {
                    min-height: 380px !important;
                }
                
                .summary-icon {
                    font-size: 34px;
                }
                
                .summary-value {
                    font-size: 26px;
                }
                
                .summary-label {
                    font-size: 15px;
                }
                
                .chart-card {
                    min-height: 220px;
                    padding: 1.2rem 0.9rem;
                }
                
                .subject-grid {
                    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
                    gap: 28px;
                    align-items: stretch;
                }
                
                .filters-container {
                    gap: 16px;
                    margin-bottom: 18px;
                    flex-wrap: wrap;
                }
                
                .filter-group {
                    max-width: 280px;
                    flex: 1 1 200px;
                }
                
                .filter-group select {
                    padding: 10px 8px;
                    font-size: 15px;
                }
                
                .export-section {
                    flex: 1 1 100%;
                    justify-content: center;
                    margin-top: 12px;
                }
            }
            
            /* Tablet Portrait (600px to 767px) */
            @media (min-width: 600px) and (max-width: 767px) {
                .dashboard-container {
                    max-width: 100%;
                    padding: 1.8rem 1.2rem 1.5rem 1.2rem;
                    margin: 1rem auto;
                }
                
                .dashboard-title {
                    font-size: 28px;
                    margin-bottom: 16px;
                }
                
                .summary-grid {
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 20px;
                    margin-bottom: 28px;
                }
                
                .dashboard-card {
                    min-height: 110px;
                    padding: 1rem 0.8rem;
                }
                
                .subject-card {
                    min-height: 360px !important;
                }
                
                .summary-icon {
                    font-size: 30px;
                }
                
                .summary-value {
                    font-size: 24px;
                }
                
                .summary-label {
                    font-size: 14px;
                }
                
                .chart-card {
                    min-height: 200px;
                    padding: 1rem 0.8rem;
                }
                
                .subject-grid {
                    grid-template-columns: 1fr;
                    gap: 24px;
                    align-items: stretch;
                }
                
                .filters-container {
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                
                .filter-group {
                    max-width: 100%;
                    flex: 1 1 auto;
                }
                
                .filter-group select {
                    padding: 12px 10px;
                    font-size: 16px;
                }
                
                .export-section {
                    flex-direction: column;
                    gap: 12px;
                    align-items: center;
                }
                
                .export-section span {
                    text-align: center;
                }
            }
            
            /* Mobile Large (480px to 599px) */
            @media (min-width: 480px) and (max-width: 599px) {
                .dashboard-container {
                    max-width: 100%;
                    padding: 1.5rem 1rem 1.2rem 1rem;
                    margin: 0.8rem auto;
                }
                
                .dashboard-title {
                    font-size: 26px;
                    margin-bottom: 14px;
                }
                
                .summary-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .dashboard-card {
                    min-height: 100px;
                    padding: 0.9rem 0.7rem;
                }
                
                .summary-icon {
                    font-size: 28px;
                }
                
                .summary-value {
                    font-size: 22px;
                }
                
                .summary-label {
                    font-size: 13px;
                }
                
                .chart-card {
                    min-height: 180px;
                    padding: 0.9rem 0.7rem;
                }
                
                .subject-grid {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .filters-container {
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 14px;
                }
                
                .filter-group {
                    max-width: 100%;
                }
                
                .filter-group select {
                    padding: 11px 9px;
                    font-size: 15px;
                }
                
                .export-section {
                    flex-direction: column;
                    gap: 10px;
                    align-items: center;
                }
                
                .export-section span {
                    text-align: center;
                    font-size: 14px;
                }
            }
            
            /* Mobile Small (320px to 479px) */
            @media (max-width: 479px) {
                .dashboard-container {
                    max-width: 100%;
                    padding: 1.2rem 0.8rem 1rem 0.8rem;
                    margin: 0.5rem auto;
                }
                
                .dashboard-title {
                    font-size: 24px;
                    margin-bottom: 12px;
                }
                
                .summary-grid {
                    grid-template-columns: 1fr;
                    gap: 14px;
                    margin-bottom: 20px;
                }
                
                .dashboard-card {
                    min-height: 90px;
                    padding: 0.8rem 0.6rem;
                }
                
                .summary-icon {
                    font-size: 26px;
                }
                
                .summary-value {
                    font-size: 20px;
                }
                
                .summary-label {
                    font-size: 12px;
                }
                
                .chart-card {
                    min-height: 160px;
                    padding: 0.8rem 0.6rem;
                }
                
                .subject-grid {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                
                .filters-container {
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                
                .filter-group {
                    max-width: 100%;
                }
                
                .filter-group select {
                    padding: 10px 8px;
                    font-size: 14px;
                }
                
                .export-section {
                    flex-direction: column;
                    gap: 8px;
                    align-items: center;
                }
                
                .export-section span {
                    text-align: center;
                    font-size: 13px;
                }
                
                .export-csv-btn {
                    padding: 8px 16px !important;
                    font-size: 14px !important;
                }
            }
            
            /* Touch-friendly improvements */
            @media (hover: none) and (pointer: coarse) {
                .dashboard-card:hover {
                    transform: none !important;
                }
                
                .filter-group select {
                    min-height: 44px;
                }
                
                .export-csv-btn {
                    min-height: 44px;
                    min-width: 120px;
                }
            }
            
            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .dashboard-card {
                    border-width: 3px;
                }
                
                .chart-card {
                    border-width: 3px;
                }
            }
            
            /* Chart container responsive improvements */
            .chart-container {
                transition: all 0.3s ease;
            }
            
            /* Subject card responsive improvements */
            .subject-card {
                transition: all 0.3s ease;
            }
            
            /* Subject stats container responsive */
            .subject-stats-container {
                transition: all 0.3s ease;
            }
            
            @media (max-width: 767px) {
                .subject-stats-container {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }
                
                .subject-stats-container > div {
                    flex: 1 1 auto !important;
                    min-width: auto !important;
                }
                
                .grade-legend {
                    gap: 8px;
                    margin-top: 8px;
                }
                
                .grade-legend span {
                    font-size: 12px !important;
                }
                
                .grade-legend span span {
                    width: 12px !important;
                    height: 12px !important;
                    border-radius: 6px !important;
                }
                
                .bar-chart-legend {
                    gap: 8px;
                    margin-top: 4px;
                    font-size: 12px !important;
                }
                
                .bar-chart-legend span span {
                    width: 12px !important;
                    height: 12px !important;
                    border-radius: 6px !important;
                }
                
                .pass-fail-display {
                    flex-direction: column;
                    gap: 8px;
                    align-items: flex-start;
                }
                
                .pass-fail-display span {
                    font-size: 14px !important;
                }
            }
            
            /* Responsive chart heights and subject card improvements */
            @media (max-width: 767px) {
                .chart-container {
                    height: 160px !important;
                }
                
                .subject-card {
                    min-width: 320px !important;
                    padding: 20px !important;
                }
                
                .subject-grid {
                    grid-template-columns: 1fr !important;
                    gap: 20px !important;
                }
            }
            
            @media (min-width: 768px) and (max-width: 1023px) {
                .subject-card {
                    min-width: 360px !important;
                    padding: 22px !important;
                }
            }
            
            @media (min-width: 1024px) {
                .subject-card {
                    min-width: 400px !important;
                }
            }
            
            @media (max-width: 479px) {
                .chart-container {
                    height: 140px !important;
                }
            }
            
            /* Improved touch targets for mobile */
            @media (max-width: 767px) {
                .dashboard-card {
                    cursor: pointer;
                }
                
                .dashboard-card:active {
                    transform: scale(0.98);
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .dashboard-container,
                .dashboard-title,
                .summary-grid,
                .dashboard-card,
                .chart-card,
                .subject-grid,
                .filters-container,
                .filter-group,
                .export-section,
                .chart-container,
                .subject-card {
                    transition: none !important;
                }
            }
            
            /* Responsive bar chart improvements for larger datasets */
            @media (min-width: 1200px) {
                .subject-card .recharts-bar-rectangle {
                    transition: opacity 0.2s ease;
                }
                
                .subject-card .recharts-bar-rectangle:hover {
                    opacity: 0.8;
                }
            }
            
            /* Ensure bar charts scale properly with data */
            .subject-card .recharts-responsive-container {
                min-height: 120px !important;
                max-height: 350px !important;
            }
        `}</style>
    );

    // CSV Export logic
    function exportCSV() {
        // Create header information based on selected filters
        const headerInfo = [
            `Session: ${session || "All Sessions"}`,
            `Class: ${selectedClass}`,
            `Exam Type: ${selectedExamType}`,
            ...(selectedExamType === "Monthly Test" && selectedMonth
                ? [`Month: ${selectedMonth}`]
                : []),
            `Export Date: ${new Date().toLocaleDateString()}`,
            `Export Time: ${new Date().toLocaleTimeString()}`,
            "", // Empty line for spacing
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
            ...filteredStudents.map((s) => [
                s.rollNo || "",
                s.name || "",
                s.class || "",
                s.subject || "",
                s.examType || "",
                ...(selectedExamType === "Monthly Test" ? [s.month || ""] : []),
                s.theory || "",
                s.practical || "",
                s.total || "",
                s.grade || "",
                s.session || "",
            ]),
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
        a.download = `statistics_${
            session || "all"
        }_${selectedClass}_${selectedExamType}${
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

    return (
        <div className="dashboard-container" style={containerStyle}>
            {responsiveStyleTag}
            <style>{`
                .${exportBtnClass}:active {
                    border: 2px solid #fff !important;
                }
            `}</style>

            <div
                className="dashboard-header"
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
                    className="dashboard-title"
                    style={{
                        background:
                            "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: 800,
                        fontSize: 34,
                        margin: 0,
                        letterSpacing: 1,
                        textAlign: "center",
                        flex: "1 1 auto",
                    }}
                >
                    School Statistics
                </h2>
                <div
                    className="dashboard-header-actions"
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
                                color: accentDark,
                                fontWeight: 500,
                                fontSize: 13,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={exportCSV}
                        className={exportBtnClass}
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
                className="filters-container"
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
                <div className="filter-group">
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
                <div className="filter-group">
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
                <div className="filter-group">
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
                        {/* <option value="All">All Exam Types</option> */}
                    </select>
                </div>
                {/* Subject filter */}
                <div className="filter-group">
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
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
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
                {/* Month filter for Monthly Test */}
                {selectedExamType === "Monthly Test" && (
                    <div className="filter-group">
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
            <div className="summary-grid" style={summaryGrid}>
                <div className="dashboard-card" style={summaryCard}>
                    <MdPeople
                        className="summary-icon"
                        style={summaryIcon}
                        title="Total Students"
                    />
                    <span className="summary-value" style={summaryValue}>
                        {totalStudents}
                    </span>
                    <span className="summary-label" style={summaryLabel}>
                        Total Students
                    </span>
                </div>
                <div className="dashboard-card" style={summaryCard}>
                    <MdPercent
                        className="summary-icon"
                        style={summaryIcon}
                        title="Overall Average"
                    />
                    <span className="summary-value" style={summaryValue}>
                        {overallAvg.toFixed(2)}%
                    </span>
                    <span className="summary-label" style={summaryLabel}>
                        Overall Average
                    </span>
                </div>
                <div className="dashboard-card" style={summaryCard}>
                    <MdCheckCircle
                        className="summary-icon"
                        style={{ ...summaryIcon, color: "#43ea7b" }}
                        title="Pass Count"
                    />
                    <span className="summary-value" style={summaryValue}>
                        {passCount}
                    </span>
                    <span className="summary-label" style={summaryLabel}>
                        Pass Count
                    </span>
                </div>
                <div className="dashboard-card" style={summaryCard}>
                    <MdCancel
                        className="summary-icon"
                        style={{ ...summaryIcon, color: accent }}
                        title="Fail Count"
                    />
                    <span className="summary-value" style={summaryValue}>
                        {failCount}
                    </span>
                    <span className="summary-label" style={summaryLabel}>
                        Fail Count
                    </span>
                </div>
                <div className="dashboard-card" style={summaryCard}>
                    <MdBarChart
                        className="summary-icon"
                        style={summaryIcon}
                        title="Pass Rate"
                    />
                    <span className="summary-value" style={summaryValue}>
                        {overallPassRate.toFixed(2)}%
                    </span>
                    <span className="summary-label" style={summaryLabel}>
                        Pass Rate
                    </span>
                </div>
            </div>
            <div className="summary-grid" style={summaryGrid}>
                <div className="chart-card" style={chartCard}>
                    <h4
                        style={{
                            fontWeight: 700,
                            color: accentDark,
                            marginBottom: 8,
                        }}
                    >
                        Overall Grade Distribution
                    </h4>
                    <ResponsiveContainer
                        width="100%"
                        height={180}
                        className="chart-container"
                    >
                        <PieChart>
                            <Pie
                                data={gradeDistData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                label
                            >
                                {gradeDistData.map((entry) => (
                                    <Cell
                                        key={`cell-${entry.name}`}
                                        fill={getGradeColor(entry.name)}
                                    />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Grade color legend */}
                    <div
                        className="grade-legend"
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 10,
                            marginTop: 10,
                            justifyContent: "center",
                        }}
                    >
                        {gradesInData.map((grade) => (
                            <span
                                key={grade}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 14,
                                    fontWeight: 600,
                                }}
                            >
                                <span
                                    style={{
                                        width: 16,
                                        height: 16,
                                        background: getGradeColor(grade),
                                        borderRadius: 8,
                                        display: "inline-block",
                                        marginRight: 4,
                                        border: "1px solid #eee",
                                    }}
                                ></span>
                                {grade}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="chart-card" style={chartCard}>
                    <h4
                        style={{
                            fontWeight: 700,
                            color: accentDark,
                            marginBottom: 8,
                        }}
                    >
                        Overall Pass/Fail
                    </h4>
                    <ResponsiveContainer
                        width="100%"
                        height={180}
                        className="chart-container"
                    >
                        <PieChart>
                            <Pie
                                data={passFailData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                label
                            >
                                {passFailData.map((entry) => (
                                    <Cell
                                        key={`cell-pf-${entry.name}`}
                                        fill={
                                            passFailColors[
                                                entry.name === "Pass" ? 0 : 1
                                            ]
                                        }
                                    />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="subject-grid" style={subjectGrid}>
                {/* Show only the selected subject if a specific subject is chosen, otherwise show all */}
                {(selectedSubject === "All" ? SUBJECTS : [selectedSubject]).map(
                    (subj, idx) => {
                        const subjectStudents = studentsBySubject[subj] || [];
                        const stats = calculateStats(subjectStudents); // Use centralized function
                        const maxCount = maxGradeCount(stats.gradeDist);
                        const gradeDistData = Object.entries(
                            stats.gradeDist
                        ).map(([grade, count]) => ({
                            name: grade,
                            value: count,
                        }));
                        const classAvg = stats.classAverage || 0;
                        const pass = stats.passFail.pass || 0;
                        const fail = stats.passFail.fail || 0;
                        const topScorer = stats.topScorer;

                        // Handle edge case: no students for this subject
                        const hasStudents = subjectStudents.length > 0;

                        // Grouped bar chart data: for each grade, count pass/fail with null checks
                        const gradePassFailData = gradeDistData.map(
                            ({ name }) => {
                                const grade = (name || "").trim().toUpperCase();
                                const studentsForGrade = subjectStudents.filter(
                                    (s) =>
                                        (s.grade || "").trim().toUpperCase() ===
                                        grade
                                );
                                const passCount = studentsForGrade.filter(
                                    (s) => isPassingGrade(s.grade) // Use centralized function
                                ).length;
                                const failCount = studentsForGrade.filter(
                                    (s) => !isPassingGrade(s.grade) // Use centralized function
                                ).length;
                                return {
                                    name: grade,
                                    Pass: passCount,
                                    Fail: failCount,
                                };
                            }
                        );
                        return (
                            <div
                                className="dashboard-card subject-card"
                                style={{
                                    ...statCardStyle,
                                    minWidth: 380,
                                    maxWidth: "100%",
                                    height: "auto",
                                    minHeight: 420, // Set consistent minimum height for all cards
                                    padding: "24px 28px 28px 28px",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                                key={subj}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        marginBottom: 8,
                                    }}
                                >
                                    <MdGrade
                                        style={{
                                            color: accentDark,
                                            fontSize: 28,
                                        }}
                                        title="Subject"
                                    />
                                    <span
                                        style={{
                                            ...subjectTitle,
                                            fontSize: 22,
                                            margin: 0,
                                        }}
                                    >
                                        {subj}
                                    </span>
                                </div>
                                <div
                                    className="subject-stats-container"
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 18,
                                        alignItems: "center",
                                        marginBottom: 10,
                                    }}
                                >
                                    <div
                                        style={{
                                            flex: "1 1 120px",
                                            minWidth: 120,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color: accentDark,
                                            }}
                                        >
                                            Class Avg
                                        </span>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={60}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        {
                                                            name: "Avg",
                                                            value: classAvg,
                                                        },
                                                        {
                                                            name: "Rest",
                                                            value:
                                                                100 - classAvg,
                                                        },
                                                    ]}
                                                    dataKey="value"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={18}
                                                    outerRadius={28}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                >
                                                    <Cell
                                                        key={`cell-bar-pass-${subj}`}
                                                        fill="#43ea7b"
                                                    />
                                                    <Cell
                                                        key={`cell-bar-fail-${subj}`}
                                                        fill="#bdbdbd"
                                                    />
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                color: accentDark,
                                                fontSize: 18,
                                                textAlign: "center",
                                            }}
                                        >
                                            {classAvg.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            flex: "1 1 120px",
                                            minWidth: 120,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color: accentDark,
                                            }}
                                        >
                                            Top Scorer
                                        </span>
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                color: accent,
                                                fontSize: 16,
                                                marginBottom: 2,
                                            }}
                                        >
                                            {topScorer ? (
                                                <span>
                                                    <MdEmojiEvents
                                                        style={{
                                                            color: "#ffd700",
                                                            fontSize: 18,
                                                            verticalAlign:
                                                                "middle",
                                                        }}
                                                        title="Top Scorer"
                                                    />{" "}
                                                    {topScorer.rollNo} (
                                                    {topScorer.total})
                                                </span>
                                            ) : (
                                                "N/A"
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            flex: "1 1 120px",
                                            minWidth: 120,
                                        }}
                                    >
                                        <div
                                            className="pass-fail-display"
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 18,
                                                margin: "10px 0 10px 0",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    color: accentDark,
                                                    fontSize: 15,
                                                }}
                                            >
                                                Pass:
                                            </span>
                                            <span
                                                style={{
                                                    color: "#43ea7b",
                                                    fontWeight: 700,
                                                    fontSize: 16,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    marginLeft: "-1rem",
                                                }}
                                            >
                                                <MdCheckCircle
                                                    style={{
                                                        color: "#43ea7b",
                                                        verticalAlign: "middle",
                                                    }}
                                                />{" "}
                                                {pass}
                                            </span>
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    color: accentDark,
                                                    fontSize: 15,
                                                    marginLeft: 20,
                                                }}
                                            >
                                                Fail:
                                            </span>
                                            <span
                                                style={{
                                                    color: accent,
                                                    fontWeight: 700,
                                                    fontSize: 16,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    marginLeft: "-1rem",
                                                }}
                                            >
                                                <MdCancel
                                                    style={{
                                                        color: accent,
                                                        verticalAlign: "middle",
                                                    }}
                                                />{" "}
                                                {fail}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            color: accentDark,
                                        }}
                                    >
                                        Grade Distribution
                                    </span>
                                    {hasStudents ? (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={Math.max(
                                                120,
                                                Math.min(
                                                    300,
                                                    gradePassFailData.length *
                                                        40 +
                                                        60
                                                )
                                            )}
                                        >
                                            <BarChart
                                                data={gradePassFailData}
                                                margin={{
                                                    top: 15,
                                                    right: 15,
                                                    left: 10,
                                                    bottom: 5,
                                                }}
                                                barGap={6}
                                                maxBarSize={60}
                                            >
                                                <XAxis
                                                    dataKey="name"
                                                    stroke={accentDark}
                                                    fontSize={13}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    fontSize={13}
                                                />
                                                <Bar
                                                    dataKey="Pass"
                                                    stackId="a"
                                                    shape={<CustomBar />}
                                                    activeBar={
                                                        <CustomActiveBar />
                                                    }
                                                >
                                                    {gradePassFailData.map(
                                                        (entry) => (
                                                            <Cell
                                                                key={`cell-bar-pass-${entry.name}`}
                                                                fill={getGradeColor(
                                                                    entry.name
                                                                )}
                                                            />
                                                        )
                                                    )}
                                                </Bar>
                                                <Bar
                                                    dataKey="Fail"
                                                    stackId="a"
                                                    shape={<CustomBar />}
                                                    activeBar={
                                                        <CustomActiveBar />
                                                    }
                                                >
                                                    {gradePassFailData.map(
                                                        (entry) => (
                                                            <Cell
                                                                key={`cell-bar-fail-${entry.name}`}
                                                                fill="#bdbdbd"
                                                            />
                                                        )
                                                    )}
                                                </Bar>
                                                {/* <RechartsTooltip /> */}
                                            </BarChart>
                                            <div
                                                className="bar-chart-legend"
                                                style={{
                                                    display: "flex",
                                                    gap: 12,
                                                    marginTop: -16,
                                                    fontSize: 13,
                                                    alignItems: "center",
                                                    padding: "0 8px",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        fontSize: 13,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            width: 14,
                                                            height: 14,
                                                            background:
                                                                getGradeColor(
                                                                    "A+"
                                                                ),
                                                            borderRadius: 7,
                                                            display:
                                                                "inline-block",
                                                            marginRight: 4,
                                                            border: "1px solid #eee",
                                                            flexShrink: 0,
                                                        }}
                                                    ></span>
                                                    Pass
                                                </span>
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        fontSize: 13,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            width: 14,
                                                            height: 14,
                                                            background:
                                                                "#bdbdbd",
                                                            borderRadius: 7,
                                                            display:
                                                                "inline-block",
                                                            marginRight: 4,
                                                            border: "1px solid #eee",
                                                            flexShrink: 0,
                                                        }}
                                                    ></span>
                                                    Fail
                                                </span>
                                            </div>
                                        </ResponsiveContainer>
                                    ) : (
                                        // No data message with filter information
                                        <div
                                            style={{
                                                height: 180, // Fixed height to match chart area
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                background: theme.surface,
                                                border: `1px solid ${theme.border}`,
                                                borderRadius: 8,
                                                marginTop: 8,
                                                color:
                                                    theme.textSecondary ||
                                                    "#666",
                                                fontStyle: "italic",
                                                padding: "16px",
                                                textAlign: "center",
                                                flex: "1", // Allow it to expand to fill remaining space
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                No student data available
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    opacity: 0.8,
                                                }}
                                            >
                                                {selectedExamType ===
                                                    "Monthly Test" &&
                                                selectedMonth
                                                    ? `${selectedExamType} - ${selectedMonth}`
                                                    : selectedExamType}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
}

export default Dashboard;
