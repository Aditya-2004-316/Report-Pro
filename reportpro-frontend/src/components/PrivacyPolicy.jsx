import React from "react";
const PrivacyPolicy = ({ theme }) => (
    <div
        style={{
            maxWidth: 800,
            margin: "2rem auto",
            padding: "2rem",
            background: theme.surface,
            color: theme.text,
            borderRadius: 12,
            boxShadow: theme.shadow,
            fontFamily: "Segoe UI, Arial, sans-serif",
        }}
    >
        <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Privacy Policy</h2>
        <p>Last updated: March 2024</p>
        <section style={{ marginBottom: 24 }}>
            <h3>1. Introduction</h3>
            <p>
                Report Pro ("we", "us", or "our") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                platform.
            </p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>2. Information We Collect</h3>
            <ul>
                <li>
                    <strong>Personal Information:</strong> Name, email address,
                    and profile details provided during registration.
                </li>
                <li>
                    <strong>Usage Data:</strong> Information about how you use
                    the platform, including log data and device information.
                </li>
                <li>
                    <strong>Cookies:</strong> We use cookies to enhance your
                    experience and analyze usage.
                </li>
            </ul>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>3. How We Use Your Information</h3>
            <ul>
                <li>To provide and maintain our services</li>
                <li>To communicate with you about your account or updates</li>
                <li>To improve our platform and user experience</li>
                <li>To comply with legal obligations</li>
            </ul>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>4. Information Sharing</h3>
            <p>
                We do not sell or rent your personal information. We may share
                information with service providers who help us operate the
                platform, or if required by law.
            </p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>5. Data Security</h3>
            <p>
                We implement industry-standard security measures to protect your
                data. However, no method of transmission over the Internet is
                100% secure.
            </p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>6. Your Rights</h3>
            <ul>
                <li>Access, update, or delete your personal information</li>
                <li>Opt out of non-essential communications</li>
                <li>Request a copy of your data</li>
            </ul>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>7. Children's Privacy</h3>
            <p>
                Our platform is intended for educational use. We do not
                knowingly collect data from children under 13 without parental
                consent.
            </p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>8. Changes to This Policy</h3>
            <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any significant changes by posting the new policy
                on this page.
            </p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>9. Contact Us</h3>
            <p>
                If you have questions about this Privacy Policy, please contact
                us via the Contact Us page or at{" "}
                <a href="mailto:support@reportpro.com">support@reportpro.com</a>
                .
            </p>
        </section>
    </div>
);
export default PrivacyPolicy;
