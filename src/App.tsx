// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import TopicTable from "./components/Topic";
import StudentsTable from "./components/StudentsTable";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, padding: "2rem", textAlign: "center" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/topics" element={<TopicTable />} />
            <Route path="/students" element={<StudentsTable />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
