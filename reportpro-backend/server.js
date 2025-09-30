require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// CORS configuration
const corsOptions = {
    origin: [
        "https://report-pro-mm9o.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// MongoDB Connection with better error handling
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            process.env.MONGODB_URI || "mongodb://localhost:27017/reportpro"
            // {
            //     useNewUrlParser: true,
            //     useUnifiedTopology: true,
            // }
        );
        // Removed console log for production
    } catch (error) {
        // Removed error log for production
        process.exit(1);
    }
};

connectDB();

// Student Schema
const studentSchema = new mongoose.Schema(
    {
        rollNo: { type: String, required: true },
        name: { type: String, required: true, default: "Unknown" },
        class: { type: String, enum: ["9th", "10th"], required: true },
        examType: {
            type: String,
            enum: [
                "Monthly Test",
                "Quarterly Exam",
                "Half Monthly Exam",
                "Annual Exam",
            ],
            required: true,
        },
        subject: { type: String, required: true },
        theory: { type: Number, min: 0, max: 75 },
        practical: { type: Number, min: 0, max: 25 },
        total: { type: Number },
        grade: { type: String },
        session: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        month: { type: String }, // <-- add month field
        isAbsent: { type: Boolean, default: false }, // <-- add absent status
    },
    {
        timestamps: true,
    }
);

// Create a compound index for rollNo, subject, examType, session, and user (per-user uniqueness)
studentSchema.index(
    { rollNo: 1, subject: 1, examType: 1, session: 1, user: 1 },
    { unique: true }
);

const Student = mongoose.model("Student", studentSchema);

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String },
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
});
const User = mongoose.model("User", userSchema);

// Student Registry Schema
const studentRegistrySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        session: { type: String, required: true },
        class: { type: String, required: true },
        students: [
            {
                rollNo: { type: String, required: true },
                name: { type: String, required: true },
            },
        ],
    },
    { timestamps: true }
);
studentRegistrySchema.index(
    { user: 1, session: 1, class: 1 },
    { unique: true }
);
const StudentRegistry = mongoose.model(
    "StudentRegistry",
    studentRegistrySchema
);

// Helper: Calculate grade based on total marks with theory failure rule
function calculateGrade(total, theory) {
    // Rule 1: If theory marks are less than 25 (failing), grade should be E1
    // unless total marks would result in E2, then it should be E2
    if (theory < 25) {
        // Check what grade the total would normally get
        let normalGrade;
        if (total >= 85) normalGrade = "A+";
        else if (total >= 75) normalGrade = "A";
        else if (total >= 60) normalGrade = "B";
        else if (total >= 45) normalGrade = "C";
        else if (total >= 33) normalGrade = "D";
        else if (total >= 20) normalGrade = "E1";
        else normalGrade = "E2";

        // If normal grade would be E2, return E2, otherwise return E1
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

// Health check route with DB status
app.get("/api/health", async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        res.json({
            status: "Server is running",
            database: dbState === 1 ? "Connected" : "Disconnected",
            dbState,
        });
    } catch (error) {
        res.status(500).json({
            status: "Server error",
            error: error.message,
        });
    }
});

// Auth middleware
function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid token" });
    }
    try {
        const token = auth.split(" ")[1];
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

// Add or update student marks for a subject
app.post("/api/students", requireAuth, async (req, res) => {
    try {
        let {
            rollNo,
            name,
            class: studentClass,
            examType,
            subject,
            theory,
            practical,
            session,
            month,
            isAbsent = false, // Add isAbsent field
        } = req.body;
        if (!name || typeof name !== "string" || !name.trim()) {
            name = "Unknown";
        }
        if (!studentClass || !["9th", "10th"].includes(studentClass)) {
            return res
                .status(400)
                .json({ error: "Class must be '9th' or '10th'." });
        }
        if (
            !examType ||
            ![
                "Monthly Test",
                "Quarterly Exam",
                "Half Monthly Exam",
                "Annual Exam",
            ].includes(examType)
        ) {
            return res.status(400).json({
                error: "Exam type must be one of: Monthly Test, Quarterly Exam, Half Monthly Exam, Annual Exam.",
            });
        }
        // Validate month for Monthly Test
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
        if (examType === "Monthly Test") {
            if (!month || !MONTHS.includes(month)) {
                return res.status(400).json({
                    error: "Month is required and must be valid for Monthly Test.",
                });
            }
        } else {
            month = undefined; // Only store month for Monthly Test
        }

        // For absent students, set default values
        if (isAbsent) {
            theory = 0;
            practical = 0;
        } else {
            // Validate marks only for non-absent students
            const theoryNum = Number(theory);
            const practicalNum = Number(practical);

            // Specific validation for each field
            if (
                examType !== "Monthly Test" &&
                (!rollNo || typeof rollNo !== "string" || !rollNo.trim())
            ) {
                return res.status(400).json({
                    error: "Roll number is required for all exam types except Monthly Test.",
                });
            }
            // For Monthly Test, if rollNo is empty, set it to "N/A"
            if (examType === "Monthly Test" && (!rollNo || !rollNo.trim())) {
                rollNo = "N/A";
            }
            if (!subject || typeof subject !== "string" || !subject.trim()) {
                return res.status(400).json({ error: "Subject is required." });
            }
            if (!session || typeof session !== "string" || !session.trim()) {
                return res.status(400).json({ error: "Session is required." });
            }
            if (
                theory === undefined ||
                theory === null ||
                theory === "" ||
                isNaN(theoryNum)
            ) {
                return res.status(400).json({
                    error: "Theory marks must be a number between 0 and 75.",
                });
            }
            if (theoryNum < 0 || theoryNum > 75) {
                return res
                    .status(400)
                    .json({ error: "Theory marks must be between 0 and 75." });
            }
            if (
                practical === undefined ||
                practical === null ||
                practical === "" ||
                isNaN(practicalNum)
            ) {
                return res.status(400).json({
                    error: "Practical marks must be a number between 0 and 25.",
                });
            }
            if (practicalNum < 0 || practicalNum > 25) {
                return res.status(400).json({
                    error: "Practical marks must be between 0 and 25.",
                });
            }
        }

        // Basic validation for all students
        if (
            examType !== "Monthly Test" &&
            (!rollNo || typeof rollNo !== "string" || !rollNo.trim())
        ) {
            return res.status(400).json({
                error: "Roll number is required for all exam types except Monthly Test.",
            });
        }
        // For Monthly Test, if rollNo is empty, set it to "N/A"
        if (examType === "Monthly Test" && (!rollNo || !rollNo.trim())) {
            rollNo = "N/A";
        }
        if (!subject || typeof subject !== "string" || !subject.trim()) {
            return res.status(400).json({ error: "Subject is required." });
        }
        if (!session || typeof session !== "string" || !session.trim()) {
            return res.status(400).json({ error: "Session is required." });
        }

        const theoryNum = Number(theory);
        const practicalNum = Number(practical);
        const total = theoryNum + practicalNum;
        const grade = isAbsent ? "AB" : calculateGrade(total, theoryNum);

        // Auto-fetch student name from registry if roll number is provided
        if (rollNo && rollNo.trim() !== "N/A" && rollNo.trim() !== "") {
            try {
                const registry = await StudentRegistry.findOne({
                    user: req.userId,
                    session: session.trim(),
                    class: studentClass,
                });

                if (registry && registry.students) {
                    const registryStudent = registry.students.find(
                        (s) =>
                            s.rollNo.toLowerCase() ===
                            rollNo.trim().toLowerCase()
                    );

                    if (registryStudent) {
                        // Use the name from registry instead of submitted name
                        name = registryStudent.name;
                    }
                }
            } catch (registryError) {
                // If registry lookup fails, continue with submitted name
                // If registry lookup fails, continue with submitted name
                // Removed error log for production
            }
        }

        if (!name || typeof name !== "string" || !name.trim()) {
            name = "Unknown";
        }

        // When creating/updating, include month if present
        const update = {
            rollNo: rollNo.trim(),
            name: name.trim(), // This will now be the registry name if available
            class: studentClass,
            examType,
            subject: subject.trim(),
            theory: theoryNum,
            practical: practicalNum,
            total,
            grade,
            session: session.trim(),
            user: req.userId,
            isAbsent: isAbsent || false,
        };
        if (examType === "Monthly Test") update.month = month;
        const student = await Student.findOneAndUpdate(
            {
                rollNo: rollNo.trim(),
                subject: subject.trim(),
                examType,
                session: session.trim(),
                user: req.userId,
            },
            update,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Removed success log for production
        res.json(student);
    } catch (error) {
        // Removed error log for production
        res.status(500).json({
            error: "Server error",
            details: error.message,
            code: error.code,
        });
    }
});

// Get all students (optionally filter by session)
app.get("/api/students", requireAuth, async (req, res) => {
    try {
        const {
            session,
            class: studentClass,
            examType,
            subject,
            month,
        } = req.query;
        const query = { user: req.userId };
        if (session) query.session = session;
        if (studentClass) query.class = studentClass;
        if (examType) query.examType = examType;
        if (subject && subject !== "All") query.subject = subject;
        if (examType === "Monthly Test" && month) query.month = month;

        // Removed debug log for production
        const students = await Student.find(query);
        // Removed debug log for production
        res.json(students);
    } catch (error) {
        // Removed error log for production
        res.status(500).json({
            error: "Server error",
            details: error.message,
        });
    }
});

// Get single student by rollNo
app.get("/api/students/:rollNo", requireAuth, async (req, res) => {
    try {
        const students = await Student.find({
            rollNo: req.params.rollNo,
            user: req.userId,
        });
        if (!students.length)
            return res.status(404).json({ error: "Not found" });
        res.json(students);
    } catch (error) {
        // Removed error log for production
        res.status(500).json({
            error: "Server error",
            details: error.message,
        });
    }
});

// Get school statistics
app.get("/api/statistics", requireAuth, async (req, res) => {
    try {
        const { class: studentClass, examType, subject, month } = req.query;
        const filter = { user: req.userId };
        if (studentClass) filter.class = studentClass;
        if (examType && examType !== "All") filter.examType = examType;
        if (subject && subject !== "All") filter.subject = subject;
        if (examType === "Monthly Test" && month) filter.month = month;

        // Removed debug log for production
        const students = await Student.find(filter);
        // Removed debug log for production

        if (!students.length) {
            return res.json({
                topScorer: null,
                classAverage: 0,
                gradeDist: {},
                passFail: { pass: 0, fail: 0 },
                totalStudents: 0,
                totalSubjectRecords: 0,
            });
        }

        // Group by rollNo to get unique students
        const studentsByRollNo = {};
        students.forEach((s) => {
            const key = `${s.rollNo}_${s.examType}_${s.session}_${s.class}`;
            if (!studentsByRollNo[key]) {
                studentsByRollNo[key] = {
                    rollNo: s.rollNo,
                    name: s.name,
                    class: s.class,
                    examType: s.examType,
                    session: s.session,
                    subjects: [],
                    totalMarks: 0,
                    subjectCount: 0,
                };
            }
            studentsByRollNo[key].subjects.push(s);
            studentsByRollNo[key].totalMarks += s.total;
            studentsByRollNo[key].subjectCount++;
        });

        const uniqueStudents = Object.values(studentsByRollNo);
        // Removed debug log for production

        // Calculate pass/fail based on unique students
        let pass = 0,
            fail = 0;
        uniqueStudents.forEach((student) => {
            // A student fails if they have any E1 or E2 grade in any subject
            const hasFail = student.subjects.some(
                (s) => s.grade === "E1" || s.grade === "E2"
            );
            if (hasFail) {
                fail++;
            } else {
                pass++;
            }
        });

        // Find top scorer from all subject records
        let topScorer = students[0];
        let totalMarks = 0;
        let gradeDist = {};

        students.forEach((s) => {
            totalMarks += s.total;
            gradeDist[s.grade] = (gradeDist[s.grade] || 0) + 1;
            if (s.total > topScorer.total) topScorer = s;
        });

        const classAverage =
            students.length > 0 ? totalMarks / students.length : 0;

        const result = {
            topScorer,
            classAverage: Math.round(classAverage * 100) / 100, // Round to 2 decimal places
            gradeDist,
            passFail: { pass, fail },
            totalStudents: uniqueStudents.length,
            totalSubjectRecords: students.length,
        };

        // Removed debug log for production

        res.json(result);
    } catch (error) {
        // Removed error log for production
        res.status(500).json({
            error: "Server error",
            details: error.message,
        });
    }
});

// Endpoint to clear all student data (for development/testing)
app.post("/api/clear-students", requireAuth, async (req, res) => {
    try {
        await Student.deleteMany({ user: req.userId });
        res.json({ success: true });
    } catch (error) {
        // Removed error log for production
        res.status(500).json({
            error: "Server error",
            details: error.message,
        });
    }
});

// Signup endpoint
app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "Email already in use." });
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.json({ id: user._id, name: user.name, email: user.email, token });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password required." });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ error: "Invalid email or password." });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res
                .status(400)
                .json({ error: "Invalid email or password." });
        }
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.json({ id: user._id, name: user.name, email: user.email, token });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// Password reset request
app.post("/api/request-reset", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required." });
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ error: "No user with that email." });
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetCode = code;
        user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
        await user.save();
        // In real app, send code via email. For demo, return code.
        res.json({ message: "Reset code generated.", code });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// Password reset
app.post("/api/reset-password", async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword)
            return res.status(400).json({ error: "All fields required." });
        const user = await User.findOne({ email });
        if (!user || !user.resetCode || !user.resetCodeExpires)
            return res.status(400).json({ error: "Invalid reset request." });
        if (user.resetCode !== code)
            return res.status(400).json({ error: "Invalid code." });
        if (user.resetCodeExpires < new Date())
            return res.status(400).json({ error: "Code expired." });
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await user.save();
        res.json({ message: "Password reset successful." });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// Serve uploaded profile pictures statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup for profile picture uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `user_${req.userId}_${Date.now()}${ext}`);
    },
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed!"));
        }
        cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

// Upload profile picture endpoint
app.post(
    "/api/profile-picture",
    requireAuth,
    upload.single("profilePicture"),
    async (req, res) => {
        try {
            const user = await User.findById(req.userId);
            if (!user)
                return res.status(404).json({ error: "User not found." });
            user.profilePicture = `/uploads/${req.file.filename}`;
            await user.save();
            res.json({ profilePicture: user.profilePicture });
        } catch (err) {
            res.status(500).json({
                error: "Server error",
                details: err.message,
            });
        }
    }
);

// Get user profile
app.get("/api/profile", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found." });
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// Update user profile
app.put("/api/profile", requireAuth, async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword, profilePicture } =
            req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found." });
        if (name) user.name = name;
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists)
                return res.status(400).json({ error: "Email already in use." });
            user.email = email;
        }
        if (profilePicture) user.profilePicture = profilePicture;
        if (newPassword) {
            if (!currentPassword)
                return res
                    .status(400)
                    .json({ error: "Current password required." });
            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match)
                return res
                    .status(400)
                    .json({ error: "Current password incorrect." });
            user.password = await bcrypt.hash(newPassword, 10);
        }
        await user.save();
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// Delete a student by rollNo, subject, session (and user)
app.delete("/api/students", requireAuth, async (req, res) => {
    try {
        const { rollNo, subject, session } = req.body;
        if (!rollNo || !subject || !session) {
            return res.status(400).json({ error: "Missing required fields." });
        }
        const result = await Student.findOneAndDelete({
            rollNo,
            subject,
            session,
            user: req.userId,
        });
        if (!result) {
            return res.status(404).json({ error: "Student not found." });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Delete all students by rollNo, session, and class (and user)
app.delete("/api/students/all", requireAuth, async (req, res) => {
    try {
        const { rollNo, session, class: studentClass } = req.body;
        if (!rollNo || !session) {
            return res
                .status(400)
                .json({ error: "Roll number and session are required." });
        }

        const filter = {
            rollNo,
            session,
            user: req.userId,
        };

        // Add class filter if provided
        if (studentClass) {
            filter.class = studentClass;
        }

        const result = await Student.deleteMany(filter);
        if (result.deletedCount === 0) {
            return res
                .status(404)
                .json({ error: "No students found to delete." });
        }
        res.json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Get student registry for a session/class
app.get("/api/student-registry", requireAuth, async (req, res) => {
    try {
        const { session, class: className } = req.query;
        if (!session || !className) {
            return res
                .status(400)
                .json({ error: "Session and class are required." });
        }
        const registry = await StudentRegistry.findOne({
            user: req.userId,
            session,
            class: className,
        });
        res.json(registry || { students: [] });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Add or update student registry for a session/class
app.post("/api/student-registry", requireAuth, async (req, res) => {
    try {
        const { session, class: className, students } = req.body;
        if (!session || !className || !Array.isArray(students)) {
            return res.status(400).json({
                error: "Session, class, and students array are required.",
            });
        }
        // Validate students array
        for (const s of students) {
            if (!s.rollNo || !s.name) {
                return res
                    .status(400)
                    .json({ error: "Each student must have rollNo and name." });
            }
        }
        const registry = await StudentRegistry.findOneAndUpdate(
            { user: req.userId, session, class: className },
            { students },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json(registry);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Delete student registry for a session/class
app.delete("/api/student-registry", requireAuth, async (req, res) => {
    try {
        const { session, class: className } = req.body;
        if (!session || !className) {
            return res
                .status(400)
                .json({ error: "Session and class are required." });
        }
        const result = await StudentRegistry.findOneAndDelete({
            user: req.userId,
            session,
            class: className,
        });
        if (!result) {
            return res
                .status(404)
                .json({ error: "Student registry not found." });
        }
        res.json({
            success: true,
            message: "Student registry removed successfully.",
        });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Mark students as absent for a specific exam type
app.post("/api/students/absent", requireAuth, async (req, res) => {
    try {
        const {
            students,
            examType,
            session,
            class: studentClass,
            month,
            subject, // Optional subject parameter for subject-specific marking
        } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res
                .status(400)
                .json({ error: "Students array is required." });
        }

        if (!examType || !session || !studentClass) {
            return res
                .status(400)
                .json({ error: "examType, session, and class are required." });
        }

        const VALID_EXAM_TYPES = [
            "Monthly Test",
            "Quarterly Exam",
            "Half Monthly Exam",
            "Annual Exam",
        ];

        if (!VALID_EXAM_TYPES.includes(examType)) {
            return res.status(400).json({ error: "Invalid exam type." });
        }

        // Validate month for Monthly Test
        if (examType === "Monthly Test" && !month) {
            return res
                .status(400)
                .json({ error: "Month is required for Monthly Test." });
        }

        // If subject is specified, only mark for that subject, otherwise mark for all subjects
        let SUBJECTS = [
            "Mathematics",
            "Science",
            "English",
            "Hindi",
            "Social Science",
            "Sanskrit",
            "Computer Science",
            "Physical Education",
            "Art",
            "Music",
        ];

        // If subject is provided, only use that subject
        if (subject && SUBJECTS.includes(subject)) {
            SUBJECTS = [subject];
        }

        const results = [];

        // Check if students array contains objects or strings
        const isObjectArray =
            students.length > 0 &&
            typeof students[0] === "object" &&
            students[0] !== null;

        // Mark each student as absent for specified subjects
        for (const studentInfo of students) {
            // Handle both formats: array of objects {rollNo, name} or array of strings (rollNo only)
            const rollNo = isObjectArray ? studentInfo.rollNo : studentInfo;
            const name = isObjectArray ? studentInfo.name : "Unknown";

            if (!rollNo) {
                continue; // Skip invalid student entries
            }

            // Create absent records for each subject
            for (const subj of SUBJECTS) {
                const absentRecord = {
                    rollNo: rollNo.trim(),
                    name: name.trim(),
                    class: studentClass,
                    examType,
                    subject: subj.trim(),
                    theory: 0,
                    practical: 0,
                    total: 0,
                    grade: "AB", // AB for Absent
                    session: session.trim(),
                    user: req.userId,
                    isAbsent: true,
                };

                if (examType === "Monthly Test") {
                    absentRecord.month = month;
                }

                try {
                    // Use upsert to update existing record or create new one
                    const result = await Student.findOneAndUpdate(
                        {
                            rollNo: rollNo.trim(),
                            subject: subj.trim(),
                            examType,
                            session: session.trim(),
                            user: req.userId,
                            ...(examType === "Monthly Test" ? { month } : {}),
                        },
                        absentRecord,
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );

                    results.push(result);
                } catch (error) {
                    // Removed error log for production
                }
            }
        }

        res.json({
            success: true,
            message: `Marked ${
                students.length
            } students as absent for ${examType}${
                subject ? ` in ${subject}` : " in all subjects"
            }`,
            recordsCreated: results.length,
        });
    } catch (error) {
        // Removed error log for production
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Mark students as present (reverse of absent) for a specific exam type
app.post("/api/students/present", requireAuth, async (req, res) => {
    try {
        const {
            students,
            examType,
            session,
            class: studentClass,
            month,
            subject, // Optional subject parameter for subject-specific marking
        } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res
                .status(400)
                .json({ error: "Students array is required." });
        }

        if (!examType || !session || !studentClass) {
            return res
                .status(400)
                .json({ error: "examType, session, and class are required." });
        }

        const VALID_EXAM_TYPES = [
            "Monthly Test",
            "Quarterly Exam",
            "Half Monthly Exam",
            "Annual Exam",
        ];

        if (!VALID_EXAM_TYPES.includes(examType)) {
            return res.status(400).json({ error: "Invalid exam type." });
        }

        // Validate month for Monthly Test
        if (examType === "Monthly Test" && !month) {
            return res
                .status(400)
                .json({ error: "Month is required for Monthly Test." });
        }

        // Remove absent records for each student
        let recordsRemoved = 0;

        // Check if students array contains objects or strings
        const isObjectArray =
            students.length > 0 &&
            typeof students[0] === "object" &&
            students[0] !== null;

        for (const studentInfo of students) {
            // Handle both formats: array of objects {rollNo, name} or array of strings (rollNo only)
            const rollNo = isObjectArray ? studentInfo.rollNo : studentInfo;

            if (!rollNo) continue;

            try {
                // Build the query for deleting absent records
                const deleteQuery = {
                    rollNo: rollNo.trim(),
                    examType,
                    session: session.trim(),
                    class: studentClass,
                    user: req.userId,
                    isAbsent: true,
                    ...(examType === "Monthly Test" ? { month } : {}),
                };

                // If subject is specified, only delete for that subject
                // If no subject is specified, we should delete absent records for ALL subjects
                if (subject) {
                    deleteQuery.subject = subject;
                }

                // Delete all absent records for this student in the current context
                const deleteResult = await Student.deleteMany(deleteQuery);

                recordsRemoved += deleteResult.deletedCount;
            } catch (error) {
                // Removed error log for production
            }
        }

        res.json({
            success: true,
            message: `Marked ${
                students.length
            } students as present for ${examType}${
                subject ? ` in ${subject}` : " in all subjects"
            }`,
            recordsRemoved: recordsRemoved,
        });
    } catch (error) {
        // Removed error log for production
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

app.listen(PORT, () => {
    // Removed console log for production
});
