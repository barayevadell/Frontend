// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./pages/Home";           // ← this is the new Home page you created
import TopicTable from "./TopicTable";     // temporary page showing your TopicTable

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />

        {/* Main content area */}
        <main style={{ flex: 1, padding: "2rem", textAlign: "center" }}>
          <Routes>
            {/* Home page route */}
            <Route path="/" element={<Home />} />

            {/* Page that shows the existing TopicTable */}
            <Route path="/topics" element={<TopicTable />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
