import React, { useState, useEffect } from "react";

type Topic = {
  id: string;
  code: string;
  label: string;
};

// קומפוננטת כפתור כללית
type ActionButtonProps = {
  text: string;
  color: string;
  onClick: () => void;
};

const ActionButton: React.FC<ActionButtonProps> = ({ text, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "0.5rem 1rem",
      backgroundColor: color,
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    }}
  >
    {text}
  </button>
);

const TopicTable: React.FC = () => {
  const [topic, setTopic] = useState<Topic[]>([]); // שיניתי לשם ללא S

  // טעינה מ-localStorage
  useEffect(() => {
    const stored = localStorage.getItem("topic");
    if (stored) {
      try {
        const parsed: Topic[] = JSON.parse(stored);
        setTopic(parsed);
      } catch (error) {
        console.error("Error parsing topics from localStorage", error);
      }
    } else {
      setTopic([
        { id: "1", code: "ADM", label: "מנהל מערכת" },
        { id: "2", code: "TECH", label: "טכנולוגיה" },
        { id: "3", code: "HR", label: "משאבי אנוש" },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("topic", JSON.stringify(topic));
  }, [topic]);

  const addRandomTopic = () => {
    const id = Date.now().toString();
    const code = "CODE" + Math.floor(Math.random() * 100);
    const label = "נושא אקראי " + Math.floor(Math.random() * 1000);
    setTopic([...topic, { id, code, label }]);
  };

  const clearTopic = () => {
    setTopic([]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2rem" }}>
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
          {topic.map((t) => (
            <tr key={t.id}>
              <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>{t.code}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>{t.label}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* כפתורים */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <ActionButton text="הוסף נושא אקראי" color="#3486e3" onClick={addRandomTopic} />
        <ActionButton text="מחק את כל הנושאים" color="#e3342f" onClick={clearTopic} />
      </div>
    </div>
  );
};

export default TopicTable;
