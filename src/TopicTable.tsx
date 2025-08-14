// src/components/TopicsTable.tsx
import React, { useState } from "react";
import Topic from "./TopicProps"; // Import the Topic class

const TopicsTable: React.FC = () => {
  // כאן יוצרים state עם מערך של נושאים
  const [topics, setTopics] = useState<Topic[]>([
    new Topic("1", "ADM", "מנהל מערכת"),
    new Topic("2", "TECH", "טכנולוגיה"),
    new Topic("3", "HR", "משאבי אנוש"),
  ]);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
      <table
        style={{
          width: "60%",
          borderCollapse: "collapse",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#3486e3", color: "#fff" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>קוד נושא</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>תיאור נושא</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <tr key={topic.id}>
              <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                {topic.code}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                {topic.label}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopicsTable;