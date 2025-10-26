import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import '../style/pages/HomePage.css';

function HomePage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const casesCollectionRef = collection(db, 'cases');
    const unsubscribe = onSnapshot(casesCollectionRef, (snapshot) => {
      const casesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCases(casesData);
      setLoading(false);
    }, (error) => {
      console.error("Kasaları çekerken hata:", error);
      setLoading(false);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Kasalar yükleniyor...</div>;
  }

  return (
    <>
      <h1 className="title">Kasalar</h1>
      <div className="case-grid">
        {cases.map((caseInfo) => (
          <Link to={`/case/${caseInfo.id}`} key={caseInfo.id} className="case-card-link">
            <div
              className="case-card"
              style={{
                borderColor: caseInfo.color,
                background: `linear-gradient(135deg, ${caseInfo.color}22, ${caseInfo.color}44)`,
              }}
            >
              <h2 style={{ color: caseInfo.color }}>{caseInfo.name}</h2>
              <div className="case-price">{caseInfo.price} ₺</div>
              <div className="case-items">
                {caseInfo.items.map((item, idx) => (
                  <div key={idx} className="item-tag" style={{ background: item.color }}>
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default HomePage;
