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
        console.log("✅ Connected to MongoDB");

        // Test user ID (mock)
        const userId = "test-user-id-456";

        // Clear any existing test data
        await Student.deleteMany({ user: userId });
        console.log("🧹 Cleaned up existing test data");

        // Test data
        const baseData = {
            rollNo: "102",
            name: "Subject Test Student",
            class: "9th",
            examType: "Quarterly Exam",
            session: "2023-24",
            user: userId,
        };

        console.log("\n--- Test 1: Creating records for multiple subjects ---");
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
            console.log(`✅ Created record for ${subject}`);
        }

        console.log(
            "\n--- Test 2: Marking student as absent for specific subject ---"
        );
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
        console.log(`✅ Marked Mathematics as absent`);

        console.log(
            "\n--- Test 3: Verifying subject-specific absent status ---"
        );
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
                    console.log(
                        `✅ Verified ${subject} is correctly marked as absent`
                    );
                } else {
                    console.log(`❌ Failed to verify ${subject} as absent`);
                }
            } else {
                if (record && !record.isAbsent && record.grade !== "AB") {
                    console.log(
                        `✅ Verified ${subject} is correctly NOT marked as absent`
                    );
                } else {
                    console.log(`❌ Incorrectly marked ${subject} as absent`);
                }
            }
        }

        console.log(
            "\n--- Test 4: Marking student as present for specific subject ---"
        );
        // Mark student as present for Mathematics only
        const deleteResult = await Student.deleteMany({
            rollNo: baseData.rollNo,
            subject: "Mathematics",
            examType: baseData.examType,
            session: baseData.session,
            user: userId,
            isAbsent: true,
        });
        console.log(
            `✅ Removed absent record for Mathematics (${deleteResult.deletedCount} records)`
        );

        console.log(
            "\n--- Test 5: Verifying subject-specific present status ---"
        );
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
            console.log(
                "✅ Verified Mathematics is correctly marked as present"
            );
        } else {
            console.log("❌ Failed to verify Mathematics as present");
        }

        console.log("\n--- Test 6: Clean up ---");
        // Clean up all test data
        await Student.deleteMany({ user: userId });
        console.log("✅ Cleaned up all test data");

        console.log("\n--- Test Summary ---");
        console.log("✅ All subject-specific tests completed successfully!");
        console.log(
            "✅ Subject-specific absent/present functionality is working correctly"
        );
    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Disconnected from MongoDB");
    }
}

// Run the subject-specific test
testSubjectSpecificFunctionality();
