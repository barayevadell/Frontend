import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ← NEW: navigate back to Home
import User from "../models/User";

const STORAGE_KEY = "students_v1";

/** Returns the 6 default rows when no data exists in localStorage */
function getInitialStudents(): User[] {
  return [
    new User(213233047, "אדל בר", "adell.bar@example.com", "סטודנט"),
    new User(213803048, "גל אסרף", "gal.asraf@example.com", "סטודנט"),
    new User(313233049, "רן בר", "ran.bar@example.com", "סטודנט"),
    new User(313295649, "אריה כהן", "arya.cohen@example.com", "מנהל"),
    new User(313234549, "אביב לוי", "aviv.levi@example.com", "מנהל"),
    new User(313239049, "אורלי ישראלי", "orly.israeli@example.com", "מנהל"),
  ];
}

const StudentsTable: React.FC = () => {
  const navigate = useNavigate(); // ← NEW

  // State that holds an array of User objects
  const [students, setStudents] = useState<User[]>([]);

  // Load from localStorage on first render; if nothing (or empty), fallback to default 6 rows
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setStudents(getInitialStudents());
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setStudents(getInitialStudents());
        return;
      }
      // Convert plain objects to User instances
      setStudents(parsed.map((o: any) => User.from(o)));
    } catch {
      // On any error, start with default rows
      setStudents(getInitialStudents());
    }
  }, []);

  // Auto-save to localStorage whenever students changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(students.map((s) => s.toJSON()))
    );
  }, [students]);

  // Adds a random student to the state
  const addRandomStudent = () => {
    const id = Math.floor(100000000 + Math.random() * 900000000);
    const firstNames = ["דנה", "יואב", "נועה", "איתי", "מאיה", "אדם", "יעל", "ליאור"];
    const lastNames = ["כהן", "לוי", "ברק", "רוזן", "שחר", "גולדמן", "אורן", "פרץ"];
    const firstEn = ["dana", "yoav", "noa", "itai", "maya", "adam", "yael", "lior"];
    const lastEn = ["cohen", "levi", "barak", "rozen", "shahar", "goldman", "oren", "peretz"];
    const i = Math.floor(Math.random() * firstNames.length);
    const j = Math.floor(Math.random() * lastNames.length);
    const name = `${firstNames[i]} ${lastNames[j]}`;
    const email = `${firstEn[i]}.${lastEn[j]}${Math.floor(Math.random() * 100)}@example.com`;
    const role = Math.random() > 0.5 ? "סטודנט" : "מנהל";

    const newUser = new User(id, name, email, role);
    setStudents((prev) => [...prev, newUser]);
  };

  // Manual save button handler
  const saveToLocalStorage = () => {
    const json = JSON.stringify(students.map((s) => s.toJSON()));
    localStorage.setItem(STORAGE_KEY, json);
    alert("Saved current table to localStorage.");
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2rem" }}
    >
      {/* Back to Home button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#555",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "1rem",
          alignSelf: "flex-start",
        }}
      >
        חזרה לדף הבית
      </button>

      {/* Students table */}
      <table
        style={{
          width: "100%",
          maxWidth: "800px",
          borderCollapse: "collapse",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          fontFamily: "Arial, sans-serif",
          background: "#fff",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#3486e3", color: "#fff" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>מספר זהות</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>שם</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>מייל</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>תפקיד</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => (
            <tr key={s.id} style={{ backgroundColor: idx % 2 === 0 ? "#f2f2f2" : "#fff" }}>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.id}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.name}</td>
              {/* Force LTR so the email displays nicely */}
              <td style={{ padding: "10px", border: "1px solid #ddd", direction: "ltr" }}>
                {s.email}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button
          type="button"
          onClick={addRandomStudent}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3486e3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          הוסף משתמש אקראי
        </button>

        <button
          type="button"
          onClick={saveToLocalStorage}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#2e7d32",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          שמור נתונים
        </button>
      </div>
    </div>
  );
};

export default StudentsTable;
