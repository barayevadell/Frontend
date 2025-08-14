import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Topic from "./TopicProps"; 

function App() {
  // יצירת state עם מערך נושאים לדוגמה
  const [topics, setTopics] = useState<Topic[]>([
    new Topic("1", "ADM", "ניהול אדמיניסטרטיבי"),
    new Topic("2", "TECH", "נושאים טכנולוגיים"),
    new Topic("3", "HR", "משאבי אנוש"),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      {/* אזור התוכן */}
      <main style={{ flex: 1, padding: "2rem", textAlign: "center" }}>
        <h1>ברוכה הבאה!</h1>
        <p>כאן יהיה התוכן של האפליקציה שלך ✨</p>

        {/* הטבלה */}
        <table style={{ margin: "20px auto", borderCollapse: "collapse", width: "60%" }}>
          <thead>
            <tr style={{ backgroundColor: "#3486e3", color: "#fff" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>קוד נושא</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>תיאור נושא</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{topic.code}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{topic.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <Footer />
    </div>
  );
}

export default App;