import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Topic = {
  id: string;
  code: string;
  label: string;
};

// Generic Action Button component
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
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic[]>([]); // state for topics

  // Load from localStorage
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
        { id: "1", code: "ADM", label: "System Administrator" },
        { id: "2", code: "TECH", label: "Technology" },
        { id: "3", code: "HR", label: "Human Resources" },
      ]);
    }
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem("topic", JSON.stringify(topic));
  }, [topic]);

  // Add random topic
  const addRandomTopic = () => {
    const id = Date.now().toString();
    const code = "CODE" + Math.floor(Math.random() * 100);
    const label = "Random Topic " + Math.floor(Math.random() * 1000);
    setTopic([...topic, { id, code, label }]);
  };

  // Clear all topics
  const clearTopic = () => {
    setTopic([]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2rem" }}>
      {/* Back to Home (right aligned) */}
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
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
          }}
        >
          חזרה לדף הבית
        </button>
      </div>

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
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Topic Code</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Topic Description</th>
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

      {/* Buttons */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <ActionButton text="Add Random Topic" color="#3486e3" onClick={addRandomTopic} />
        <ActionButton text="Clear All Topics" color="#e3342f" onClick={clearTopic} />
      </div>
    </div>
  );
};

export default TopicTable;
