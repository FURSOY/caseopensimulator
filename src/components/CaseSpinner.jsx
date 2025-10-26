import React, { useState, useRef, useEffect } from 'react';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const CaseSpinner = ({ caseId }) => {
    const [currentCase, setCurrentCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [feedback, setFeedback] = useState('');
    const caseRef = useRef(null);
    const wrapperRef = useRef(null);

    const { currentUser, userData } = useAuth();

    useEffect(() => {
        const fetchCaseData = async () => {
            if (!caseId) return;
            setLoading(true);
            const caseDocRef = doc(db, 'cases', caseId);
            const caseDocSnap = await getDoc(caseDocRef);

            if (caseDocSnap.exists()) {
                const caseData = { id: caseDocSnap.id, ...caseDocSnap.data() };
                const itemPromises = caseData.items.map(async (item) => {
                    const itemRef = doc(db, 'items', item.itemId);
                    const itemSnap = await getDoc(itemRef);
                    return itemSnap.exists() ? { ...itemSnap.data(), id: itemSnap.id, chance: item.chance } : null;
                });
                const items = (await Promise.all(itemPromises)).filter(Boolean);
                setCurrentCase({ ...caseData, items });
            } else {
                setFeedback("Kasa bulunamadı!");
            }
            setLoading(false);
        };

        fetchCaseData();
    }, [caseId]);

    function weightedRandom(list) {
        const total = list.reduce((sum, i) => sum + i.chance, 0);
        let r = Math.random() * total;
        for (const i of list) {
            if (r < i.chance) return i;
            r -= i.chance;
        }
        return list[0];
    }

    const handleSpinEnd = async (selectedItem) => {
        setIsSpinning(false);
        setWinner(selectedItem);

        if (currentUser) {
            try {
                const inventoryCollectionRef = collection(db, 'users', currentUser.uid, 'inventory');
                await addDoc(inventoryCollectionRef, {
                    itemId: selectedItem.id,
                    caseId: currentCase.id,
                    caseName: currentCase.name,
                    wonAt: serverTimestamp(),
                });
                setFeedback('Eşya envanterine eklendi!');
            } catch (error) {
                console.error("Envantere eklenirken hata:", error);
                setFeedback('Eşya envantere eklenemedi.');
            }
        }
    };

    const spin = async () => {
        if (isSpinning || !wrapperRef.current || !currentCase) return;

        if (!currentUser || !userData) {
            setFeedback('Kasa açmak için giriş yapmalısınız.');
            return;
        }

        if (userData.balance < currentCase.price) {
            setFeedback('Yetersiz bakiye!');
            return;
        }

        setIsSpinning(true);
        setWinner(null);
        setFeedback('');

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const newBalance = userData.balance - currentCase.price;
            await updateDoc(userDocRef, { balance: newBalance });
        } catch (error) {
            console.error("Bakiye güncellenirken hata:", error);
            setFeedback('Bakiye güncellenemedi, lütfen tekrar deneyin.');
            setIsSpinning(false);
            return;
        }

        const items = currentCase.items;
        const selected = weightedRandom(items);

        const itemWidth = 100;
        const gap = 6;
        const totalWidth = itemWidth + gap;
        const totalItems = 150;
        const winnerIndex = Math.floor(Math.random() * 30) + 110;

        const reel = Array.from({ length: totalItems }, (_, i) =>
            i === winnerIndex ? selected : items[Math.floor(Math.random() * items.length)]
        );

        const caseEl = caseRef.current;
        if (caseEl) {
            caseEl.innerHTML = "";
            reel.forEach((box) => {
                const div = document.createElement("div");
                div.className = "case-item";
                const img = document.createElement('img');
                img.src = box.imageURL;
                img.alt = box.name;
                div.appendChild(img);
                caseEl.appendChild(div);
            });
            caseEl.style.transition = "none";
            caseEl.style.transform = "translateX(0)";
        }

        const wrapperWidth = wrapperRef.current.offsetWidth;
        const centerPosition = wrapperWidth / 2;
        const winnerLeftEdge = winnerIndex * totalWidth;
        const randomStop = Math.random() * itemWidth * 0.8 - itemWidth * 0.4;
        const targetX_Stage1 = centerPosition - winnerLeftEdge - itemWidth / 2 + randomStop;
        const targetX_Stage2 = centerPosition - winnerLeftEdge - itemWidth / 2;

        const finalHandler = () => {
            caseEl.removeEventListener("transitionend", finalHandler);
            handleSpinEnd(selected);
        };

        const firstHandler = () => {
            caseEl.removeEventListener("transitionend", firstHandler);
            caseEl.style.transition = "transform 0.3s ease-out";
            caseEl.style.transform = `translateX(${targetX_Stage2}px)`;
            caseEl.addEventListener("transitionend", finalHandler);
        };

        requestAnimationFrame(() => {
            if (caseEl) {
                caseEl.style.transition = "transform 5s cubic-bezier(0.05, 0.95, 0.1, 1)";
                caseEl.style.transform = `translateX(${targetX_Stage1}px)`;
                caseEl.addEventListener("transitionend", firstHandler);
            }
        });
    };

    if (loading) {
        return <div>Kasa yükleniyor...</div>;
    }

    if (!currentCase) {
        return <div>Kasa bulunamadı!</div>;
    }

    return (
        <div className="app">
            <h2 style={{ color: currentCase.color }}>{currentCase.name}</h2>
            <div className="case-price">{currentCase.price} ₺</div>

            <button onClick={spin} disabled={isSpinning || !currentUser} className={`spin-btn ${isSpinning ? "disabled" : ""}`}>
                {isSpinning ? "Dönüyor..." : "🎰 Kasa Aç"}
            </button>

            {feedback && <p className="feedback-message">{feedback}</p>}

            <div ref={wrapperRef} className="case-wrapper">
                <div ref={caseRef} className="case-reel"></div>
                <div className="pointer"></div>
            </div>

            {winner && !isSpinning && (
                <div className="winner-text">
                    🎉 Kazandığın: <img src={winner.imageURL} alt={winner.name} style={{ width: '30px', verticalAlign: 'middle' }} /> {winner.name}
                </div>
            )}
        </div>
    );
};

export default CaseSpinner;
