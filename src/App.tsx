import TopicTable from "./TopicTable";
import Header from "./Header";
import Footer from "./Footer";

function App() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh"
    }}>
      <Header />
      
      {/* אזור התוכן */}
      <main style={{ flex: 1, padding: "2rem", textAlign: "center" }}>
  <TopicTable />
</main>


      <Footer />
    </div>
  );
}

export default App;
