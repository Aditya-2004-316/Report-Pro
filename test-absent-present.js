// Test script to verify absent/present functionality
const mongoose = require("mongoose");
const { Student } = require("./reportpro-backend/server");

// MongoDB connection
const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/reportpro_test";

async function testAbsentPresentFunctionality() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        // Test user ID (mock)
        const userId = "test-user-id";

        // Test data
        const testData = {
            rollNo: "101",
            name: "Test Student",
            class: "10th",
            examType: "Quarterly Exam",
            session: "2023-24",
            subject: "Mathematics",
            theory: 70,
            practical: 20,
            total: 90,
            grade: "A1",
            user: userId,
        };

        console.log("Creating test student record...");
        // Create a test student record
        const student = await Student.create(testData);
        console.log("Created student record:", student.rollNo, student.subject);

        // Test absent functionality
        console.log("Testing absent functionality...");
        const absentData = {
            ...testData,
            theory: 0,
            practical: 0,
            total: 0,
            grade: "AB",
            isAbsent: true,
        };

        // Update the student record to mark as absent
        const absentStudent = await Student.findOneAndUpdate(
            {
                rollNo: testData.rollNo,
                subject: testData.subject,
                examType: testData.examType,
                session: testData.session,
                user: userId,
            },
            absentData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(
            "Marked student as absent:",
            absentStudent.rollNo,
            absentStudent.isAbsent
        );

        // Verify the student is marked as absent
        const verifyAbsent = await Student.findOne({
            rollNo: testData.rollNo,
            subject: testData.subject,
            examType: testData.examType,
            session: testData.session,
            user: userId,
        });
        console.log("Verification - isAbsent:", verifyAbsent.isAbsent);
        console.log("Verification - grade:", verifyAbsent.grade);

        // Test present functionality
        console.log("Testing present functionality...");
        // Remove the absent record (mark as present)
        const deleteResult = await Student.deleteMany({
            rollNo: testData.rollNo,
            examType: testData.examType,
            session: testData.session,
            user: userId,
            isAbsent: true,
        });
        console.log("Removed absent records:", deleteResult.deletedCount);

        // Verify the record is removed
        const verifyPresent = await Student.findOne({
            rollNo: testData.rollNo,
            subject: testData.subject,
            examType: testData.examType,
            session: testData.session,
            user: userId,
        });
        console.log("Verification after marking present:", verifyPresent);

        // Clean up test data
        await Student.deleteMany({
            rollNo: testData.rollNo,
            user: userId,
        });
        console.log("Cleaned up test data");

        console.log("Test completed successfully!");
    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Disconnected from MongoDB");
    }
}

// Run the test
testAbsentPresentFunctionality();
