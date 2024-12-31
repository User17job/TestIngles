import React, { useState } from "react";
import Welcome from "./pages/Welcome";
import Admin from "./pages/Admin";
import Test from "./pages/Test";
import Login from "./components/Login";

const App = () => {
  const [currentPage, setCurrentPage] = useState("welcome");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "admin":
        return isAuthenticated ? (
          <Admin onBack={() => setCurrentPage("welcome")} />
        ) : (
          <Login
            onLogin={() => setIsAuthenticated(true)}
            onBack={() => setCurrentPage("welcome")}
          />
        );
      case "test":
        return <Test onBack={() => setCurrentPage("welcome")} />;
      default:
        return <Welcome onNavigate={setCurrentPage} />;
    }
  };

  return <div className="min-h-screen">{renderPage()}</div>;
};

export default App;
