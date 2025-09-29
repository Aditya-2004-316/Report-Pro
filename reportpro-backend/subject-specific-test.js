// Test for subject-specific absent/present functionality
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

async function testSubjectSpecificFunctionality() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        // Removed console log for production

        // Test user ID (mock)
        const userId = "test-user-id-456";

        // Clear any existing test data
        await Student.deleteMany({ user: userId });
        // Removed console log for production

        // Test data
        const baseData = {
            rollNo: "102",
            name: "Subject Test Student",
            class: "9th",
            examType: "Quarterly Exam",
            session: "2023-24",
            user: userId,
        };

        // Removed console log for production
        // Create records for multiple subjects
        const subjects = ["Mathematics", "Science", "English"];
        const createdRecords = [];

        for (const subject of subjects) {
            const record = await Student.create({
                ...baseData,
                subject: subject,
                theory: subject === "Mathematics" ? 75 : 65,
                practical: subject === "Mathematics" ? 25 : 20,
                total: subject === "Mathematics" ? 100 : 85,
                grade: subject === "Mathematics" ? "A+" : "A",
            });
            createdRecords.push(record);
            // Removed console log for production
        }

        // Removed console log for production
        // Mark student as absent for Mathematics only
        const mathAbsentRecord = await Student.findOneAndUpdate(
            {
                rollNo: baseData.rollNo,
                subject: "Mathematics",
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
        // Removed console log for production

        // Removed console log for production
        // Verify Mathematics is absent but others are not
        for (const subject of subjects) {
            const record = await Student.findOne({
                rollNo: baseData.rollNo,
                subject: subject,
                examType: baseData.examType,
                session: baseData.session,
                user: userId,
            });

            if (subject === "Mathematics") {
                if (record && record.isAbsent && record.grade === "AB") {
                    // Removed console log for production
                } else {
                    // Removed console log for production
                }
            } else {
                if (record && !record.isAbsent && record.grade !== "AB") {
                    // Removed console log for production
                } else {
                    // Removed console log for production
                }
            }
        }

        // Removed console log for production
        // Mark student as present for Mathematics only
        const deleteResult = await Student.deleteMany({
            rollNo: baseData.rollNo,
            subject: "Mathematics",
            examType: baseData.examType,
            session: baseData.session,
            user: userId,
            isAbsent: true,
        });
        // Removed console log for production

        // Removed console log for production
        // Verify Mathematics is no longer absent
        const mathRecord = await Student.findOne({
            rollNo: baseData.rollNo,
            subject: "Mathematics",
            examType: baseData.examType,
            session: baseData.session,
            user: userId,
        });

        // Since we deleted the absent record, we should either have no record or a non-absent record
        if (!mathRecord || (mathRecord && !mathRecord.isAbsent)) {
            // Removed console log for production
        } else {
            // Removed console log for production
        }

        // Removed console log for production
        // Clean up all test data
        await Student.deleteMany({ user: userId });
        // Removed console log for production

        // Removed console log for production
    } catch (error) {
        // Removed error log for production
    } finally {
        await mongoose.connection.close();
        // Removed console log for production
    }
}

// Run the subject-specific test
testSubjectSpecificFunctionality();
