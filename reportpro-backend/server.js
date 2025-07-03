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

// Middleware
app.use(cors());
app.use(bodyParser.json());

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
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

connectDB();

// Student Schema
const studentSchema = new mongoose.Schema(
    {
        rollNo: { type: String, required: true },
        subject: { type: String, required: true },
        theory: { type: Number, required: true, min: 0, max: 75 },
        practical: { type: Number, required: true, min: 0, max: 25 },
        total: { type: Number },
        grade: { type: String },
        session: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create a compound index for rollNo, subject, session, and user (per-user uniqueness)
studentSchema.index(
    { rollNo: 1, subject: 1, session: 1, user: 1 },
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
        const { rollNo, subject, theory, practical, session } = req.body;
        const theoryNum = Number(theory);
        const practicalNum = Number(practical);

        // Specific validation for each field
        if (!rollNo || typeof rollNo !== "string" || !rollNo.trim()) {
            return res.status(400).json({ error: "Roll number is required." });
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
            return res
                .status(400)
                .json({ error: "Practical marks must be between 0 and 25." });
        }

        const total = theoryNum + practicalNum;
        const grade = calculateGrade(total, theoryNum);
        const filter = { rollNo, subject, session, user: req.userId };
        const update = {
            rollNo,
            subject,
            session,
            theory: theoryNum,
            practical: practicalNum,
            total,
            grade,
            user: req.userId,
        };
        const student = await Student.findOneAndUpdate(filter, update, {
            upsert: true,
            new: true,
        });

        console.log("Student saved successfully:", student);
        res.json(student);
    } catch (error) {
        console.error("Error saving student:", error);
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
        const filter = { user: req.userId };
        if (req.query.session) {
            filter.session = req.query.session;
        }
        const students = await Student.find(filter);
        res.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
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
        console.error("Error fetching student:", error);
        res.status(500).json({
            error: "Server error",
            details: error.message,
        });
    }
});

// Get school statistics
app.get("/api/statistics", requireAuth, async (req, res) => {
    try {
        const students = await Student.find({ user: req.userId });

        if (!students.length) {
            return res.json({
                topScorer: null,
                classAverage: 0,
                gradeDist: {},
                passFail: { pass: 0, fail: 0 },
            });
        }

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

        res.json({
            topScorer,
            classAverage,
            gradeDist,
            passFail: { pass, fail },
        });
    } catch (error) {
        console.error("Error fetching statistics:", error);
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
        console.error("Error clearing students:", error);
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
