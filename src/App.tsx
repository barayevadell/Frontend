import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import StudentsTable from "./StudentsTable";

function App() {
  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",     // מרכז אופקי של הקונטיינר הפנימי
          alignItems: "flex-start",
          padding: "2rem 1rem 5rem",    // רווח לפוטר הקבוע
          boxSizing: "border-box",
        }}
      >
        {/* קונטיינר רוחב קבוע שמרכז את הטבלה */}
        <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
          <StudentsTable />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;