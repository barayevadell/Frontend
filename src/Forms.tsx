// NewRequest.tsx
import React from "react";

const NewRequest: React.FC = () => (
  <div style={{ padding: "20px" }}>
    <h1>פנייה חדשה</h1>
    <form>
      <div>
        <label>נושא:</label>
        <input type="text" />
      </div>
      <div>
        <label>תיאור:</label>
        <textarea />
      </div>
      <button type="submit">שלח</button>
    </form>
  </div>
);

export default NewRequest;
