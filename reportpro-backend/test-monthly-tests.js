// Test script to verify Monthly Test grading logic
const fs = require("fs");

// Extract the calculateGrade function from server.js
const serverCode = fs.readFileSync("./server.js", "utf8");
const calculateGradeMatch = serverCode.match(
    /function calculateGrade\([^}]+\}/s
);

if (calculateGradeMatch) {
    // Create a testable version of the function
    const calculateGrade = eval("(" + calculateGradeMatch[0] + ")");

    console.log("Testing Monthly Test grades:");
    console.log(
        "Grade for total 18 (theory 18):",
        calculateGrade(18, 18, "Monthly Test")
    ); // Should be A+
    console.log(
        "Grade for total 15 (theory 15):",
        calculateGrade(15, 15, "Monthly Test")
    ); // Should be A
    console.log(
        "Grade for total 12 (theory 12):",
        calculateGrade(12, 12, "Monthly Test")
    ); // Should be B
    console.log(
        "Grade for total 10 (theory 10):",
        calculateGrade(10, 10, "Monthly Test")
    ); // Should be C
    console.log(
        "Grade for total 7 (theory 7):",
        calculateGrade(7, 7, "Monthly Test")
    ); // Should be D
    console.log(
        "Grade for total 5 (theory 5):",
        calculateGrade(5, 5, "Monthly Test")
    ); // Should be E1
    console.log(
        "Grade for total 2 (theory 2):",
        calculateGrade(2, 2, "Monthly Test")
    ); // Should be E2

    console.log("\nTesting Regular Exam grades:");
    console.log(
        "Grade for total 85 (theory 60):",
        calculateGrade(85, 60, "Quarterly Exam")
    ); // Should be A+
    console.log(
        "Grade for total 75 (theory 60):",
        calculateGrade(75, 60, "Quarterly Exam")
    ); // Should be A
    console.log(
        "Grade for total 30 (theory 20):",
        calculateGrade(30, 20, "Quarterly Exam")
    ); // Should be E1 (theory < 25)
    console.log(
        "Grade for total 15 (theory 10):",
        calculateGrade(15, 10, "Quarterly Exam")
    ); // Should be E2 (theory < 25 and normal grade would be E2)
} else {
    console.log("Could not find calculateGrade function in server.js");
}
