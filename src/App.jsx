import { Routes, Route, Link } from "react-router-dom";
import "./style/style.css";
import HomePage from "./pages/HomePage";
import CasePage from "./pages/CasePage";
import AdminPage from "./pages/AdminPage";
import AddItemPage from "./pages/AddItemPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import InventoryPage from "./pages/InventoryPage"; // Eklendi
import { useAuth } from "./context/AuthContext";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import ProtectedRoute from "./components/ProtectedRoute";

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
        {userData && userData.role === 'admin' && <Link to="/admin">Admin</Link>}
        <div className="user-info">
          {currentUser && userData ? (
            <>
              <span className="user-balance">{userData.balance} ₺</span>
              <span>{currentUser.email}</span>
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
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/admin/add-item" element={<ProtectedRoute><AddItemPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;