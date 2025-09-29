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
        // Removed console log for production

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

        // Removed console log for production
        // Create a test student record
        const student = await Student.create(testData);
        // Removed console log for production

        // Test absent functionality
        // Removed console log for production
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
        // Removed console log for production

        // Verify the student is marked as absent
        const verifyAbsent = await Student.findOne({
            rollNo: testData.rollNo,
            subject: testData.subject,
            examType: testData.examType,
            session: testData.session,
            user: userId,
        });
        // Removed console log for production
        // Removed console log for production

        // Test present functionality
        // Removed console log for production
        // Remove the absent record (mark as present)
        const deleteResult = await Student.deleteMany({
            rollNo: testData.rollNo,
            examType: testData.examType,
            session: testData.session,
            user: userId,
            isAbsent: true,
        });
        // Removed console log for production

        // Verify the record is removed
        const verifyPresent = await Student.findOne({
            rollNo: testData.rollNo,
            subject: testData.subject,
            examType: testData.examType,
            session: testData.session,
            user: userId,
        });
        // Removed console log for production

        // Clean up test data
        await Student.deleteMany({
            rollNo: testData.rollNo,
            user: userId,
        });
        // Removed console log for production

        // Removed console log for production
    } catch (error) {
        // Removed error log for production
    } finally {
        await mongoose.connection.close();
        // Removed console log for production
    }
}

// Run the test
testAbsentPresentFunctionality();
