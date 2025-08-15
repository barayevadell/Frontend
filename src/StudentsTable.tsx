import React, { useState } from "react";

const StudentsTable = () => {
  // Initial list of students (default data)
  const [students, setStudents] = useState([
    { id: 213233047, name: "אדל בר", email: "adell.bar@example.com", role: "סטודנט" },
    { id: 213803048, name: "גל אסרף", email: "gal.asraf@example.com", role: "סטודנט" },
    { id: 313233049, name: "רן בר", email: "ran.bar@example.com", role: "סטודנט" },
    { id: 313295649, name: "אריה כהן", email: "arya.cohen@example.com", role: "מנהל" },
    { id: 313234549, name: "אביב לוי", email: "aviv.levi@example.com", role: "מנהל" },
    { id: 313239049, name: "אורלי ישראלי", email: "orly.israeli@example.com", role: "מנהל" },
  ]);

  // Function to add a random student to the table
  const addRandomStudent = () => {
    // Generate a random 9-digit ID
    const randomId = Math.floor(100000000 + Math.random() * 900000000);

    // Arrays of Hebrew first and last names
    const firstNames = ["דנה", "יואב", "נועה", "איתי", "מאיה", "אדם", "יעל", "ליאור"];
    const lastNames = ["כהן", "לוי", "ברק", "רוזן", "שחר", "גולדמן", "אורן", "פרץ"];

    // Arrays of English transliterations for the same names (same indexes)
    const firstNamesEng = ["dana", "yoav", "noa", "itai", "maya", "adam", "yael", "lior"];
    const lastNamesEng = ["cohen", "levi", "barak", "rozen", "shahar", "goldman", "oren", "peretz"];

    // Pick a random first and last name index
    const firstIndex = Math.floor(Math.random() * firstNames.length);
    const lastIndex = Math.floor(Math.random() * lastNames.length);

    // Combine Hebrew full name
    const fullNameHeb = `${firstNames[firstIndex]} ${lastNames[lastIndex]}`;

    // Create an email in English based on transliteration + random number
    const email = `${firstNamesEng[firstIndex]}.${lastNamesEng[lastIndex]}${Math.floor(Math.random() * 100)}@example.com`;

    // Create new student object
    const newStudent = {
      id: randomId,
      name: fullNameHeb,
      email: email,
      role: Math.random() > 0.5 ? "סטודנט" : "מנהל",
    };

    // Add new student to the existing list
    setStudents([...students, newStudent]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2rem" }}>
      {/* Students table */}
      <table
        style={{
          width: "100%",
          maxWidth: "800px",
          borderCollapse: "collapse",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          fontFamily: "Arial, sans-serif",
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
          {students.map((student, index) => (
            <tr
              key={student.id}
              style={{
                backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
              }}
            >
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{student.id}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{student.name}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{student.email}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{student.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Single button to add a random student */}
      <button
        onClick={addRandomStudent}
        style={{
          marginTop: "1rem",
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
    </div>
  );
};

export default StudentsTable;
