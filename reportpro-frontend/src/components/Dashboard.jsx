import React, { useEffect, useState, useRef } from "react";
import { SUBJECTS } from "./subjects";
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
}) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const csvLinkRef = useRef();

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
        if (!session || !token) return;
        setLoading(true);
        fetch(`http://localhost:5000/api/students?session=${session}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setStudents(data);
                setLoading(false);
                setLastUpdated(new Date());
            });
    }, [session, token]);

    if (loading) return <div>Loading...</div>;

    // --- SUMMARY CALCULATIONS ---
    const totalStudents = new Set(students.map((s) => s.rollNo)).size;
    const totalMarks = students.reduce((sum, s) => sum + (s.total || 0), 0);
    const maxMarks = students.length * 100;
    const overallAvg = students.length ? (totalMarks / maxMarks) * 100 : 0;
    const passCount = students.filter(
        (s) => s.grade !== "E1" && s.grade !== "E2"
    ).length;
    const failCount = students.length - passCount;
    const overallPassRate = students.length
        ? (passCount / students.length) * 100
        : 0;
    // For overall grade distribution
    const gradeDist = students.reduce((acc, s) => {
        acc[s.grade] = (acc[s.grade] || 0) + 1;
        return acc;
    }, {});
    const gradeDistData = Object.entries(gradeDist).map(([grade, count]) => ({
        name: grade,
        value: count,
    }));
    const passFailData = [
        { name: "Pass", value: passCount },
        { name: "Fail", value: failCount },
    ];
    // Use only grades present in the data for color mapping and legend
    const gradesInData = Array.from(
        new Set(gradeDistData.map((g) => (g.name || "").trim().toUpperCase()))
    );
    const gradeColors = {
        "A+": "#43ea7b", // green
        A: "#4fc3f7", // sky blue
        B: "#ffd600", // yellow
        C: "#ff7043", // orange
        D: "#ba68c8", // purple
        E1: "#e57373", // light red
        E2: "#b71c1c", // dark red
    };
    const passFailColors = ["#43ea7b", accent];

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
        gridTemplateColumns: "repeat(auto-fit, minmax(370px, 1fr))",
        gap: 32,
        marginTop: 18,
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
        background: "#fff5f5",
        borderRadius: 8,
        padding: "8px 14px",
        fontSize: 16,
        fontWeight: 600,
        color: accentDark,
        margin: "4px 0 0 0",
        boxShadow: "0 1px 4px #e5393511",
        display: "inline-block",
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
    const gradeBadgeColors = {
        A1: "#43ea7b",
        A2: "#8bc34a",
        B1: "#ffeb3b",
        B2: "#ffc107",
        C1: "#ff9800",
        C2: "#ff5722",
        D: "#e57373",
        E1: "#b71c1c",
        E2: "#880000",
    };
    // Responsive tweaks
    const responsive = {
        "@media (max-width: 600px)": {
            padding: "1rem 0.5rem",
            fontSize: 15,
        },
    };

    // Helper to calculate stats for a subject
    function getStats(students) {
        if (!students.length)
            return {
                topScorer: null,
                classAverage: 0,
                gradeDist: {},
                passFail: { pass: 0, fail: 0 },
            };
        let topScorer = students[0];
        let totalMarks = 0;
        let gradeDist = {};
        let pass = 0,
            fail = 0;
        students.forEach((s) => {
            totalMarks += s.total;
            gradeDist[s.grade] = (gradeDist[s.grade] || 0) + 1;
            if (s.grade !== "E2" && s.grade !== "E1") pass++;
            else fail++;
            if (s.total > topScorer.total) topScorer = s;
        });
        const classAverage = totalMarks / students.length;
        return {
            topScorer,
            classAverage,
            gradeDist,
            passFail: { pass, fail },
        };
    }

    // Group students by subject
    const studentsBySubject = SUBJECTS.reduce((acc, subj) => {
        acc[subj] = students.filter((s) => s.subject === subj);
        return acc;
    }, {});

    // Find max grade count for bar scaling
    const maxGradeCount = (gradeDist) =>
        Math.max(1, ...Object.values(gradeDist));

    // Responsive styles for Dashboard
    const responsiveStyleTag = (
        <style>{`
            @media (max-width: 900px) {
                .dashboard-container {
                    max-width: 98vw !important;
                    padding: 1.2rem 0.5rem !important;
                }
                .dashboard-card {
                    padding: 14px !important;
                    margin-bottom: 18px !important;
                }
                .dashboard-title {
                    font-size: 22px !important;
                }
            }
            @media (max-width: 600px) {
                .dashboard-container {
                    max-width: 100vw !important;
                    padding: 0.5rem 0.2rem !important;
                }
                .dashboard-card {
                    padding: 8px !important;
                    margin-bottom: 10px !important;
                    min-width: 0 !important;
                    width: 100% !important;
                }
                .dashboard-title {
                    font-size: 16px !important;
                }
                .dashboard-label {
                    font-size: 13px !important;
                }
                .dashboard-value {
                    font-size: 15px !important;
                }
                .summary-grid, .subject-grid {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 14px !important;
                }
                .chart-card, .dashboard-card {
                    width: 100% !important;
                    min-width: 0 !important;
                    overflow-x: auto !important;
                }
                .recharts-responsive-container {
                    width: 100% !important;
                    min-width: 0 !important;
                }
            }
        `}</style>
    );

    // CSV Export logic
    function exportCSV() {
        const rows = [
            [
                "Roll No",
                "Subject",
                "Theory",
                "Practical",
                "Total",
                "Grade",
                "Session",
            ],
            ...students.map((s) => [
                s.rollNo,
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
        a.download = `statistics_${session || "all"}.csv`;
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
            <h2
                className="dashboard-title"
                style={{
                    background:
                        "linear-gradient(90deg, #e53935 0%, #b71c1c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 800,
                    fontSize: 34,
                    marginBottom: 18,
                    letterSpacing: 1,
                    textAlign: "center",
                    width: "100%",
                }}
            >
                School Statistics
            </h2>
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
                            background: "#fff",
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
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        flex: 1,
                        justifyContent: "flex-end",
                        minWidth: 220,
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
            <div className="summary-grid" style={summaryGrid}>
                <div className="dashboard-card" style={summaryCard}>
                    <MdPeople style={summaryIcon} title="Total Students" />
                    <span style={summaryValue}>{totalStudents}</span>
                    <span style={summaryLabel}>Total Students</span>
                </div>
                <div className="dashboard-card" style={summaryCard}>
                    <MdPercent style={summaryIcon} title="Overall Average" />
                    <span style={summaryValue}>{overallAvg.toFixed(2)}%</span>
                    <span style={summaryLabel}>Overall Average</span>
                </div>
                <div className="dashboard-card" style={summaryCard}>
                    <MdCheckCircle
                        style={{ ...summaryIcon, color: "#43ea7b" }}
                        title="Pass Count"
                    />
                    <span style={summaryValue}>{passCount}</span>
                    <span style={summaryLabel}>Pass Count</span>
                </div>
                <div className="dashboard-card" style={summaryCard}>
                    <MdCancel
                        style={{ ...summaryIcon, color: accent }}
                        title="Fail Count"
                    />
                    <span style={summaryValue}>{failCount}</span>
                    <span style={summaryLabel}>Fail Count</span>
                </div>
                <div className="dashboard-card" style={summaryCard}>
                    <MdBarChart style={summaryIcon} title="Pass Rate" />
                    <span style={summaryValue}>
                        {overallPassRate.toFixed(2)}%
                    </span>
                    <span style={summaryLabel}>Pass Rate</span>
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
                    <ResponsiveContainer width="100%" height={180}>
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
                                        fill={
                                            gradeColors[
                                                (entry.name || "")
                                                    .trim()
                                                    .toUpperCase()
                                            ] || "#bdbdbd"
                                        }
                                    />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Grade color legend */}
                    <div
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
                                        background:
                                            gradeColors[grade] || "#bdbdbd",
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
                    <ResponsiveContainer width="100%" height={180}>
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
                {SUBJECTS.map((subj, idx) => {
                    const stats = getStats(studentsBySubject[subj]);
                    const maxCount = maxGradeCount(stats.gradeDist);
                    const gradeDistData = Object.entries(stats.gradeDist).map(
                        ([grade, count]) => ({ name: grade, value: count })
                    );
                    const classAvg = stats.classAverage;
                    const pass = stats.passFail.pass;
                    const fail = stats.passFail.fail;
                    const topScorer = stats.topScorer;
                    // Grouped bar chart data: for each grade, count pass/fail
                    const gradePassFailData = gradeDistData.map(({ name }) => {
                        const grade = (name || "").trim().toUpperCase();
                        const studentsForGrade = studentsBySubject[subj].filter(
                            (s) =>
                                (s.grade || "").trim().toUpperCase() === grade
                        );
                        const passCount = studentsForGrade.filter(
                            (s) => grade !== "E1" && grade !== "E2"
                        ).length;
                        const failCount = studentsForGrade.filter(
                            (s) => grade === "E1" || grade === "E2"
                        ).length;
                        return {
                            name: grade,
                            Pass: passCount,
                            Fail: failCount,
                        };
                    });
                    return (
                        <div
                            className="dashboard-card"
                            style={{ ...statCardStyle, minWidth: 320 }}
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
                                    style={{ color: accentDark, fontSize: 28 }}
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
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 18,
                                    alignItems: "center",
                                    marginBottom: 10,
                                }}
                            >
                                <div
                                    style={{ flex: "1 1 120px", minWidth: 120 }}
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
                                                        value: 100 - classAvg,
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
                                                    fill={
                                                        gradeColors[subj] ||
                                                        "#43ea7b"
                                                    }
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
                                    style={{ flex: "1 1 120px", minWidth: 120 }}
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
                                                        verticalAlign: "middle",
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
                                    style={{ flex: "1 1 120px", minWidth: 120 }}
                                >
                                    <div
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
                                <ResponsiveContainer width="100%" height={120}>
                                    <BarChart
                                        data={gradePassFailData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                        barGap={4}
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
                                            activeBar={<CustomActiveBar />}
                                        >
                                            {gradePassFailData.map((entry) => (
                                                <Cell
                                                    key={`cell-bar-pass-${entry.name}`}
                                                    fill={
                                                        gradeColors[
                                                            entry.name
                                                        ] || "#bdbdbd"
                                                    }
                                                />
                                            ))}
                                        </Bar>
                                        <Bar
                                            dataKey="Fail"
                                            stackId="a"
                                            shape={<CustomBar />}
                                            activeBar={<CustomActiveBar />}
                                        >
                                            {gradePassFailData.map((entry) => (
                                                <Cell
                                                    key={`cell-bar-fail-${entry.name}`}
                                                    fill="#bdbdbd"
                                                />
                                            ))}
                                        </Bar>
                                        {/* <RechartsTooltip /> */}
                                    </BarChart>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 10,
                                            marginTop: 6,
                                            fontSize: 13,
                                            alignItems: "center",
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 14,
                                                    height: 14,
                                                    background:
                                                        gradeColors["A"] ||
                                                        "#43ea7b",
                                                    borderRadius: 7,
                                                    display: "inline-block",
                                                    marginRight: 4,
                                                    border: "1px solid #eee",
                                                }}
                                            ></span>
                                            Pass
                                        </span>
                                        <span
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 14,
                                                    height: 14,
                                                    background: "#bdbdbd",
                                                    borderRadius: 7,
                                                    display: "inline-block",
                                                    marginRight: 4,
                                                    border: "1px solid #eee",
                                                }}
                                            ></span>
                                            Fail
                                        </span>
                                    </div>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Dashboard;
