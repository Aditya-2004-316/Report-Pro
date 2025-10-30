// Centralized grade utilities for consistent logic across components

// Single source of truth for grade color mapping
export const GRADE_COLORS = {
    "A+": "#43ea7b", // green
    A: "#4fc3f7", // sky blue
    "B+": "#66bb6a", // light green
    B: "#ffd600", // yellow
    "C+": "#ffb74d", // light orange
    C: "#ff7043", // orange
    D: "#ba68c8", // purple
    E1: "#e57373", // light red
    E2: "#b71c1c", // dark red
    // Add legacy support for alternative naming
    A1: "#43ea7b",
    A2: "#4fc3f7",
    B1: "#66bb6a",
    B2: "#ffd600",
    C1: "#ffb74d",
    C2: "#ff7043",
};

// Centralized pass/fail determination function
export function isPassingGrade(grade) {
    if (!grade || typeof grade !== "string") return false;
    const normalizedGrade = grade.trim().toUpperCase();
    return normalizedGrade !== "E1" && normalizedGrade !== "E2";
}

// Centralized statistics calculation function
export function calculateStats(students) {
    if (!Array.isArray(students) || students.length === 0) {
        return {
            topScorer: null,
            classAverage: 0,
            gradeDist: {},
            passFail: { pass: 0, fail: 0 },
            totalStudents: 0,
        };
    }

    let topScorer = students[0];
    let totalMarks = 0;
    let validStudents = 0;
    let gradeDist = {};
    let pass = 0;
    let fail = 0;

    students.forEach((student) => {
        // Null checks for critical fields
        if (
            !student ||
            typeof student.total !== "number" ||
            isNaN(student.total)
        ) {
            return; // Skip invalid students
        }

        validStudents++;
        totalMarks += student.total;

        // Grade distribution
        const grade = student.grade
            ? student.grade.trim().toUpperCase()
            : "UNKNOWN";
        gradeDist[grade] = (gradeDist[grade] || 0) + 1;

        // Pass/fail counting
        if (isPassingGrade(student.grade)) {
            pass++;
        } else {
            fail++;
        }

        // Top scorer determination
        if (!topScorer || student.total > topScorer.total) {
            topScorer = student;
        }
    });

    return {
        topScorer: validStudents > 0 ? topScorer : null,
        classAverage: validStudents > 0 ? totalMarks / validStudents : 0,
        gradeDist,
        passFail: { pass, fail },
        totalStudents: validStudents,
    };
}

// Safe division utility
export function safeDivision(numerator, denominator, defaultValue = 0) {
    if (!denominator || denominator === 0) return defaultValue;
    return numerator / denominator;
}

// Validate student data
export function validateStudentData(student) {
    return (
        student &&
        typeof student === "object" &&
        student.rollNo &&
        student.subject &&
        student.examType &&
        typeof student.total === "number" &&
        !isNaN(student.total)
    );
}

// Get grade color with fallback
export function getGradeColor(grade, fallback = "#bdbdbd") {
    if (!grade) return fallback;
    const normalizedGrade = grade.trim().toUpperCase();
    return GRADE_COLORS[normalizedGrade] || fallback;
}

// Calculate grade for a subject based on marks and exam type
export function calculateSubjectGrade(total, theory, examType) {
    // Special grading system for Monthly Tests (out of 20)
    if (examType === "Monthly Test") {
        // For Monthly Tests, grade based on theory marks (out of 20)
        const marks = theory ?? total ?? 0;
        if (marks >= 17) return "A+";
        if (marks >= 15) return "A";
        if (marks >= 12) return "B";
        if (marks >= 9) return "C";
        if (marks >= 7) return "D";
        if (marks >= 4) return "E1";
        return "E2";
    }

    // For other exam types, check theory failure rule first
    const theoryMarks = theory ?? 0;
    if (theoryMarks < 25) {
        // If theory marks are less than 25 (failing), grade should be E1
        // unless total marks would result in E2
        let normalGrade;
        if (total >= 85) normalGrade = "A+";
        else if (total >= 75) normalGrade = "A";
        else if (total >= 60) normalGrade = "B";
        else if (total >= 45) normalGrade = "C";
        else if (total >= 33) normalGrade = "D";
        else if (total >= 20) normalGrade = "E1";
        else normalGrade = "E2";

        return normalGrade === "E2" ? "E2" : "E1";
    }

    // Normal grading if theory is not failing
    if (total >= 85) return "A+";
    if (total >= 75) return "A";
    if (total >= 60) return "B";
    if (total >= 45) return "C";
    if (total >= 33) return "D";
    if (total >= 20) return "E1";
    return "E2";
}

// Filter students by current selections
export function filterStudents(students, filters) {
    if (!Array.isArray(students)) return [];

    return students.filter((student) => {
        // Validate student data first
        if (!validateStudentData(student)) return false;

        // Apply exam type filter
        if (
            filters.examType &&
            filters.examType !== "All" &&
            student.examType !== filters.examType
        ) {
            return false;
        }

        // Apply subject filter
        if (
            filters.subject &&
            filters.subject !== "All" &&
            student.subject !== filters.subject
        ) {
            return false;
        }

        // Apply month filter for Monthly Test
        if (filters.examType === "Monthly Test" && filters.month) {
            if (student.month !== filters.month) {
                return false;
            }
        }

        return true;
    });
}
