import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import StudentsTable from "./StudentsTable";

export default function App() {
  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        alignItems: "stretch",   // במקום center – מאפשר להדר להימתח לרוחב מלא
        textAlign: "center",
      }}
    >
      <Header />

      {/* אזור התוכן */}
      <main
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",   // מרכז את התוכן האמצעי
          alignItems: "flex-start",
          padding: "2rem 1rem 5rem",  // רווח לפוטר הקבוע
          boxSizing: "border-box",
        }}
      >
        {/* קונטיינר ממורכז ברוחב נוח */}
        <div style={{ width: "100%", maxWidth: 900 }}>
          <StudentsTable />
        </div>
      </main>

      <Footer />
    </div>
  );
}