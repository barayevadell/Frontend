import React from "react";

const Footer: React.FC = () => (
  <footer
    style={{
      background: "#3486e3ff",
      color: "#fff",
      textAlign: "center",
      padding: "1rem 0",
      position: "fixed",
      left: 0,
      bottom: 0,
      width: "100%",
    }}
  >
    <span>&copy; {new Date().getFullYear()} כל הזכויות שמורות לאדל ואאליטה</span>
  </footer>
);

export default Footer;
