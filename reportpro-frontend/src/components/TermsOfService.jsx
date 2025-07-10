import React from "react";
const TermsOfService = ({ theme }) => (
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
        <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Terms of Service</h2>
        <p>Last updated: March 2024</p>
        <section style={{ marginBottom: 24 }}>
            <h3>1. Acceptance of Terms</h3>
            <p>
                By accessing or using Report Pro ("the Service"), you agree to
                be bound by these Terms of Service. If you do not agree, please
                do not use the Service.
            </p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>2. Use of the Service</h3>
            <ul>
                <li>
                    You must provide accurate information during registration.
                </li>
                <li>
                    You are responsible for maintaining the confidentiality of
                    your account.
                </li>
                <li>
                    You agree not to misuse the Service or attempt unauthorized
                    access.
                </li>
            </ul>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>3. Intellectual Property</h3>
            <p>
                All content, trademarks, and data on the Service are the
                property of Report Pro or its licensors. You may not reproduce
                or distribute any part of the Service without permission.
            </p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>4. User Content</h3>
            <p>
                You retain ownership of content you submit, but grant us a
                license to use it for operating and improving the Service.
            </p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>5. Termination</h3>
            <p>
                We reserve the right to suspend or terminate your access for
                violations of these Terms or for any reason at our discretion.
            </p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>6. Disclaimer & Limitation of Liability</h3>
            <p>
                The Service is provided "as is" without warranties. We are not
                liable for any damages arising from your use of the Service.
            </p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>7. Changes to Terms</h3>
            <p>
                We may update these Terms from time to time. Continued use of
                the Service constitutes acceptance of the new Terms.
            </p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>8. Governing Law</h3>
            <p>These Terms are governed by the laws of your jurisdiction.</p>
        </section>
        <section style={{ marginBottom: 24 }}>
            <h3>9. Contact</h3>
            <p>
                For questions about these Terms, please contact us via the
                Contact Us page or at{" "}
                <a href="mailto:support@reportpro.com">support@reportpro.com</a>
                .
            </p>
        </section>
    </div>
);
export default TermsOfService;
