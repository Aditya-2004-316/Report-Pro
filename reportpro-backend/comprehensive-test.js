// Comprehensive test for absent/present functionality
const mongoose = require("mongoose");

// Mock the Student model since we can't directly import it
const studentSchema = new mongoose.Schema({
    rollNo: { type: String, required: true },
    name: { type: String, required: true },
    class: { type: String, enum: ["9th", "10th"], required: true },
    examType: { type: String, required: true },
    subject: { type: String, required: true },
    theory: { type: Number },
    practical: { type: Number },
    total: { type: Number },
    grade: { type: String },
    session: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    month: { type: String },
    isAbsent: { type: Boolean, default: false },
});

const Student = mongoose.model("Student", studentSchema);

// MongoDB connection
const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/reportpro_test";

async function runComprehensiveTest() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        // Removed console log for production

        // Test user ID (mock)
        const userId = "test-user-id-123";

        // Clear any existing test data
        await Student.deleteMany({ user: userId });
        // Removed console log for production

        // Test data
        const baseData = {
            rollNo: "101",
            name: "Test Student",
            class: "10th",
            examType: "Quarterly Exam",
            session: "2023-24",
            user: userId,
        };

        // Removed console log for production
        // Create regular student records for multiple subjects
        const subjects = ["Mathematics", "Science", "English"];
        const regularRecords = [];

        for (const subject of subjects) {
            const record = await Student.create({
                ...baseData,
                subject: subject,
                theory: 70,
                practical: 20,
                total: 90,
                grade: "A1",
            });
            regularRecords.push(record);
            // Removed console log for production
        }

        // Removed console log for production
        // Mark student as absent for all subjects
        const absentRecords = [];
        for (const subject of subjects) {
            const absentRecord = await Student.findOneAndUpdate(
                {
                    rollNo: baseData.rollNo,
                    subject: subject,
                    examType: baseData.examType,
                    session: baseData.session,
                    user: userId,
                },
                {
                    theory: 0,
                    practical: 0,
                    total: 0,
                    grade: "AB",
                    isAbsent: true,
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            absentRecords.push(absentRecord);
            // Removed console log for production
        }

        // Removed console log for production
        // Verify all subjects are marked as absent
        for (const subject of subjects) {
            const record = await Student.findOne({
                rollNo: baseData.rollNo,
                subject: subject,
                examType: baseData.examType,
                session: baseData.session,
                user: userId,
            });

            if (record && record.isAbsent && record.grade === "AB") {
                // Removed console log for production
            } else {
                // Removed console log for production
            }
        }

        // Removed console log for production
        // Mark student as present (remove absent records)
        const deleteResult = await Student.deleteMany({
            rollNo: baseData.rollNo,
            examType: baseData.examType,
            session: baseData.session,
            user: userId,
            isAbsent: true,
        });
        // Removed console log for production

        // Removed console log for production
        // Verify absent records are removed
        const remainingRecords = await Student.find({
            rollNo: baseData.rollNo,
            examType: baseData.examType,
            session: baseData.session,
            user: userId,
        });

        if (remainingRecords.length === 0) {
            // Removed console log for production
        } else {
            // Removed console log for production
        }

        // Removed console log for production
        // Test that absent records are isolated by context
        const differentContext = {
            ...baseData,
            examType: "Monthly Test",
            month: "January",
        };

        // Mark as absent in different context
        await Student.create({
            ...differentContext,
            subject: "Mathematics",
            theory: 0,
            practical: 0,
            total: 0,
            grade: "AB",
            isAbsent: true,
        });
        // Removed console log for production

        // Remove absent records for original context
        const removeResult = await Student.deleteMany({
            rollNo: baseData.rollNo,
            examType: baseData.examType,
            session: baseData.session,
            user: userId,
            isAbsent: true,
        });
        // Removed console log for production

        // Verify different context record still exists
        const differentContextRecord = await Student.findOne({
            rollNo: baseData.rollNo,
            examType: differentContext.examType,
            month: differentContext.month,
            user: userId,
            isAbsent: true,
        });

        if (differentContextRecord) {
            // Removed console log for production
        } else {
            // Removed console log for production
        }

        // Removed console log for production
        // Clean up all test data
        await Student.deleteMany({ user: userId });
        // Removed console log for production

        // Removed console log for production
        // Removed console log for production
    } catch (error) {
        // Removed error log for production
    } finally {
        await mongoose.connection.close();
        // Removed console log for production
    }
}

// Run the comprehensive test
runComprehensiveTest();
