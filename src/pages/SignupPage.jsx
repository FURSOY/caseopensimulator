import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from '../firebase';
import '../style/pages/Auth.css';

function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const emailForFirebase = `${username}@caseopensimulator.com`; // Construct email from username
      const userCredential = await createUserWithEmailAndPassword(auth, emailForFirebase, password);
      const user = userCredential.user;

      // Kullanıcı için Firestore'da bir doküman oluştur
      await setDoc(doc(db, "users", user.uid), {
        balance: 100, // Başlangıç parası
        role: "user",   // Varsayılan rol
        username: username // Kullanıcı adını saklayalım
      });

      console.log('Kayıt başarılı ve kullanıcı verisi oluşturuldu!', user);
      navigate('/'); // Kayıt sonrası ana sayfaya yönlendir

    } catch (error) {
      console.error("Kayıt sırasında hata:", error);
      setError(error.message);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSignup}>
        <h2>Kayıt Ol</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Kayıt Ol</button>
        <p>
          Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;
