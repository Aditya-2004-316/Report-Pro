import React from "react";
import { Link } from "react-router-dom";

const HelpSupport = ({ theme }) => (
    <div
        style={{
            maxWidth: 800,
            margin: "2rem auto",
            padding: "2rem",
            background: theme.surface,
            color: theme.text,
            borderRadius: 12,
            boxShadow: theme.shadow,
        }}
    >
        <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Help & Support</h2>
        <p style={{ marginBottom: 24 }}>
            Welcome to the Report Pro Help & Support Center. Here you'll find
            answers to common questions, troubleshooting tips, and ways to
            contact our support team.
        </p>

        <h3 style={{ fontWeight: 600, marginTop: 32, marginBottom: 12 }}>
            Frequently Asked Questions
        </h3>
        <ul style={{ paddingLeft: 20, marginBottom: 28 }}>
            <li style={{ marginBottom: 12 }}>
                <strong>How do I add a new student?</strong>
                <br />
                Go to the "Admission Details" section and fill out the required
                information. Click "Save" to add the student to the system.
            </li>
            <li style={{ marginBottom: 12 }}>
                <strong>How can I enter or update marks?</strong>
                <br />
                Use the "Enter Marks" button on the dashboard. Select the
                student, subject, and exam type, then enter the marks and
                submit.
            </li>
            <li style={{ marginBottom: 12 }}>
                <strong>How do I export student results?</strong>
                <br />
                Click the "Export Data" button in the footer. You can download
                results as a CSV file for offline use or reporting.
            </li>
            <li style={{ marginBottom: 12 }}>
                <strong>How do I reset my password?</strong>
                <br />
                Go to the login page and click "Forgot Password?". Follow the
                instructions sent to your registered email address.
            </li>
            <li style={{ marginBottom: 12 }}>
                <strong>Who can I contact for technical support?</strong>
                <br />
                Email us at{" "}
                <a
                    href="mailto:support@reportpro.com"
                    style={{ color: theme.accent }}
                >
                    support@reportpro.com
                </a>{" "}
                or use the{" "}
                <Link to="/contact" style={{ color: theme.accent }}>
                    Contact Us
                </Link>{" "}
                page.
            </li>
        </ul>

        <h3 style={{ fontWeight: 600, marginTop: 32, marginBottom: 12 }}>
            Troubleshooting Tips
        </h3>
        <ul style={{ paddingLeft: 20, marginBottom: 28 }}>
            <li style={{ marginBottom: 12 }}>
                <strong>Page not loading or slow?</strong>
                <br />
                Try refreshing the page or checking your internet connection. If
                the issue persists, clear your browser cache and try again.
            </li>
            <li style={{ marginBottom: 12 }}>
                <strong>Unable to log in?</strong>
                <br />
                Make sure your username and password are correct. If you forgot
                your password, use the "Forgot Password?" link on the login
                page.
            </li>
            <li style={{ marginBottom: 12 }}>
                <strong>Exported CSV file is empty or missing data?</strong>
                <br />
                Ensure you have selected the correct filters and that there is
                data available for export. Try again or contact support if the
                problem continues.
            </li>
        </ul>

        <h3 style={{ fontWeight: 600, marginTop: 32, marginBottom: 12 }}>
            Contact Support
        </h3>
        <p style={{ marginBottom: 8 }}>
            <strong>Email:</strong>{" "}
            <a
                href="mailto:support@reportpro.com"
                style={{ color: theme.accent }}
            >
                support@reportpro.com
            </a>
        </p>
        <p style={{ marginBottom: 8 }}>
            <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM
            (IST)
        </p>
        <p style={{ marginBottom: 8 }}>
            <strong>Contact Form:</strong>{" "}
            <Link to="/contact" style={{ color: theme.accent }}>
                Contact Us
            </Link>
        </p>
    </div>
);

export default HelpSupport;
