import React from "react";

const students = [
  { id: 1, name: "אדל", grade: 95 },
  { id: 2, name: "גל", grade: 88 },
  { id: 3, name: "רון", grade: 76 },
];

function StudentsTable() {
  return (
    <table border="1" style={{ margin: "auto", width: "50%", textAlign: "center" }}>
      <thead>
        <tr>
          <th>מספר זהות</th>
          <th>שם</th>
          <th>ציון</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id}>
            <td>{student.id}</td>
            <td>{student.name}</td>
            <td>{student.grade}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default StudentsTable;
