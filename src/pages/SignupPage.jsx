import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from '../firebase';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Kullanıcı için Firestore'da bir doküman oluştur
      await setDoc(doc(db, "users", user.uid), {
        balance: 100, // Başlangıç parası
        role: "user",   // Varsayılan rol
        email: user.email // Email bilgisini de saklayalım
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
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
