import React from "react";

function Welcome() {
    return (
        <>
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <h2
                    style={{
                        color: "#b71c1c",
                        fontWeight: 700,
                        fontSize: 28,
                        margin: "2rem 0 1rem",
                    }}
                >
                    Welcome to Report Pro
                </h2>
                <p style={{ color: "#666", fontSize: 18 }}>
                    Select an option above to get started.
                </p>
            </div>
            <div style={{ minHeight: "50vh" }} />
        </>
    );
}

export default Welcome;
