import React from "react";

const Header: React.FC = () => {
  return (
    <header
      style={{
        backgroundColor: "#3486e3ff",
        color: "white",
        padding: "1rem",
        textAlign: "center",
        width: "100%",
        alignSelf: "stretch",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "2rem" }}>
        רשימת משתמשים 
      </h1>
    </header>
  );
};

export default Header;