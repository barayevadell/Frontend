import React from "react";

const students = [
  { id: 213233047, name: "אדל בר", email: "adell@gmail.com", role: "סטודנט" },
  { id: 213803048, name: "גל אסרף", email: "gal@gmail.com", role: "סטודנט" },
  { id: 313233049, name: "רן בר", email: "ran@gmail.com", role: "סטודנט" },
  { id: 313295649, name: "אריה כהן", email: "arya@gmail.com", role: "מנהל" },
  { id: 313234549, name: "אביב לוי", email: "aviv@gmail.com", role: "מנהל" },
  { id: 313239049, name: "אורלי ישראלי", email: "orly@gmail.com", role: "מנהל" },
];

const StudentsTable = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
      <table
        style={{
          width: "100%",
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
                transition: "background-color 0.3s",
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
    </div>
  );
};

export default StudentsTable;
