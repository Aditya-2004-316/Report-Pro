import React from "react";

export default function AdmissionDetails({ theme }) {
    return (
        <div
            style={{
                width: "100%",
                maxWidth: 600,
                margin: "0 auto",
                padding: 24,
            }}
        >
            <style>{`
                .admission-details-container {
                    background: ${theme?.surface || "#fff"};
                    border-radius: 16px;
                    box-shadow: ${theme?.shadow || "0 2px 16px #0001"};
                    padding: 2.5rem 2rem;
                    max-width: 520px;
                    margin: 2rem auto;
                    color: ${theme?.text || "#222"};
                    transition: all 0.3s ease;
                }
                .admission-details-title {
                    color: ${theme?.accentDark || "#b71c1c"};
                    font-weight: 800;
                    font-size: 2rem;
                    margin-bottom: 1.2rem;
                    letter-spacing: 1px;
                    text-align: center;
                }
                .admission-details-desc {
                    color: ${theme?.accent || "#e53935"};
                    font-size: 1.15rem;
                    font-weight: 600;
                    text-align: center;
                }
                @media (max-width: 600px) {
                    .admission-details-container {
                        padding: 1.5rem 0.7rem;
                        max-width: 98vw;
                    }
                    .admission-details-title {
                        font-size: 1.3rem;
                    }
                    .admission-details-desc {
                        font-size: 1rem;
                    }
                }
            `}</style>
            <h2 className="admission-details-title">Admission Details</h2>
            <p className="admission-details-desc">
                This feature will be added soon.
            </p>
            {/* Spacer for scrollability */}
            <div style={{ minHeight: "50vh" }} />
        </div>
    );
}
