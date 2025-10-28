import { Routes, Route, Link } from "react-router-dom";
import "./style/style.css";
import HomePage from "./pages/HomePage";
import CasePage from "./pages/CasePage";
import CreateCasePage from "./pages/CreateCasePage";
import CreateItemPage from "./pages/CreateItemPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import InventoryPage from "./pages/InventoryPage"; // Eklendi
import { useAuth } from "./context/AuthContext";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import ProtectedRoute from "./components/ProtectedRoute";

import SuperAdminPage from "./pages/SuperAdminPage";

function App() {
  const { currentUser, userData } = useAuth();

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error("Logout Error:", error));
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/">Ana Sayfa</Link>
        {currentUser && <Link to="/inventory">Envanter</Link>}
        {currentUser && <Link to="/create-case">Kasa Oluştur</Link>}
        {userData && userData.role === 'admin' && <Link to="/super-admin">Süper Admin</Link>}
        <div className="user-info">
          {currentUser && userData ? (
            <>
              <span className="user-balance">{userData.balance.toFixed(2)} ₺</span>
              <span>{userData.username}</span>
              <button onClick={handleLogout} className="logout-btn">Çıkış Yap</button>
            </>
          ) : (
            <Link to="/login">Giriş Yap</Link>
          )}
        </div>
      </nav>
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/case/:id" element={<CasePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/create-case" element={<CreateCasePage />} />
          <Route path="/create-item" element={<CreateItemPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/super-admin" element={<ProtectedRoute><SuperAdminPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}

export default App;