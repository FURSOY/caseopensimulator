import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    doc,
    getDoc,
    updateDoc,
    addDoc,
    collection,
    serverTimestamp,
    query,
    where,
    getDocs,
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ItemPopup from './ItemPopup';

const CaseSpinner = ({ caseId }) => {
    const [currentCase, setCurrentCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [pendingWinningsId, setPendingWinningsId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [feedback, setFeedback] = useState('');
    const caseRef = useRef(null);
    const wrapperRef = useRef(null);

    const { currentUser, userData, refreshUserData } = useAuth();

    const checkForPendingWinnings = useCallback(async (user) => {
        if (!user) return;
        const pendingWinningsRef = collection(db, 'users', user.uid, 'pendingWinnings');
        const q = query(pendingWinningsRef, where("caseId", "==", caseId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const pendingDoc = querySnapshot.docs[0];
            const pendingData = pendingDoc.data();

            const itemRef = doc(db, 'items', pendingData.itemId);
            const itemSnap = await getDoc(itemRef);

            if (itemSnap.exists()) {
                setWinner({ ...itemSnap.data(), id: itemSnap.id });
                setPendingWinningsId(pendingDoc.id);
                setShowPopup(true);
            }
        }
    }, [caseId]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!caseId) return;
            setLoading(true);

            // Önce bekleyen bir kazanım var mı diye kontrol et
            if (currentUser) {
                await checkForPendingWinnings(currentUser);
            }

            // Kasa verilerini çek
            const caseDocRef = doc(db, 'cases', caseId);
            const caseDocSnap = await getDoc(caseDocRef);

            if (caseDocSnap.exists()) {
                const caseData = { id: caseDocSnap.id, ...caseDocSnap.data() };
                const itemPromises = caseData.items.map(async (item) => {
                    const itemRef = doc(db, 'items', item.itemId);
                    const itemSnap = await getDoc(itemRef);
                    return itemSnap.exists() ? { ...itemSnap.data(), id: itemSnap.id, weight: item.weight } : null;
                });
                const items = (await Promise.all(itemPromises)).filter(Boolean);
                setCurrentCase({ ...caseData, items });
            } else {
                setFeedback("Kasa bulunamadı!");
            }
            setLoading(false);
        };

        fetchInitialData();
    }, [caseId, currentUser, checkForPendingWinnings]);


    function weightedRandom(list) {
        const total = list.reduce((sum, i) => sum + i.weight, 0);
        let r = Math.random() * total;
        for (const i of list) {
            if (r < i.weight) return i;
            r -= i.weight;
        }
        return list[0];
    }

    const handleSpinEnd = async (selectedItem) => {
        setIsSpinning(false);

        if (!currentUser) return;

        try {
            // Kazanılan eşyayı geçici koleksiyona yaz
            const pendingWinningsRef = collection(db, 'users', currentUser.uid, 'pendingWinnings');
            const pendingDocRef = await addDoc(pendingWinningsRef, {
                itemId: selectedItem.id,
                caseId: currentCase.id,
                wonAt: serverTimestamp(),
            });

            setWinner(selectedItem);
            setPendingWinningsId(pendingDocRef.id);

            setTimeout(() => {
                setShowPopup(true);
            }, 500);

        } catch (error) {
            console.error("Geçici kazanım kaydedilirken hata:", error);
            setFeedback("Bir hata oluştu, lütfen tekrar deneyin.");
        }
    };

    const handleKeep = async () => {
        if (!currentUser || !winner || !pendingWinningsId) return;
        try {
            const batch = writeBatch(db);

            // 1. Envantere yeni döküman oluştur
            const inventoryCollectionRef = collection(db, 'users', currentUser.uid, 'inventory');
            const newInventoryRef = doc(inventoryCollectionRef); // Otomatik ID ile yeni ref
            batch.set(newInventoryRef, {
                itemId: winner.id,
                itemName: winner.name,
                itemImage: winner.imageURL,
                itemPrice: winner.price,
                caseId: currentCase.id,
                caseName: currentCase.name,
                wonAt: serverTimestamp(),
            });

            // 2. Geçici kazanımı sil
            const pendingDocRef = doc(db, 'users', currentUser.uid, 'pendingWinnings', pendingWinningsId);
            batch.delete(pendingDocRef);

            await batch.commit();
            setFeedback('Eşya envanterine eklendi!');

        } catch (error) {
            console.error("Envantere eklenirken hata:", error);
            setFeedback('Eşya envantere eklenemedi.');
        } finally {
            setShowPopup(false);
            setWinner(null);
            setPendingWinningsId(null);
        }
    };

    const handleSell = async () => {
        if (!currentUser || !winner || !pendingWinningsId) return;
        try {
            const batch = writeBatch(db);

            // 1. Kullanıcı bakiyesini güncelle
            const userDocRef = doc(db, 'users', currentUser.uid);
            const newBalance = (userData.balance || 0) + winner.price;
            batch.update(userDocRef, { balance: newBalance });

            // 2. Geçici kazanımı sil
            const pendingDocRef = doc(db, 'users', currentUser.uid, 'pendingWinnings', pendingWinningsId);
            batch.delete(pendingDocRef);

            await batch.commit();
            await refreshUserData();
            setFeedback(`Eşya satıldı! +${winner.price} ₺`);

        } catch (error) {
            console.error("Eşya satılırken hata:", error);
            setFeedback('Eşya satılamadı.');
        } finally {
            setShowPopup(false);
            setWinner(null);
            setPendingWinningsId(null);
        }
    };


    const spin = async () => {
        if (isSpinning || !wrapperRef.current || !currentCase || showPopup) return;

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
        setShowPopup(false);
        setFeedback('');

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const newBalance = userData.balance - currentCase.price;
            await updateDoc(userDocRef, { balance: newBalance });
            await refreshUserData();
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

    if (!currentCase && !showPopup) {
        return <div>Kasa bulunamadı!</div>;
    }

    return (
        <div className="app">
            {currentCase && (
                <>
                    <h2 style={{ color: currentCase.color }}>{currentCase.name}</h2>
                    <div className="case-price">{currentCase.price} ₺</div>
                </>
            )}

            <button onClick={spin} disabled={isSpinning || !currentUser || showPopup} className={`spin-btn ${isSpinning || showPopup ? "disabled" : ""}`}>
                {isSpinning ? "Dönüyor..." : "🎰 Kasa Aç"}
            </button>

            {feedback && <p className="feedback-message">{feedback}</p>}

            <div ref={wrapperRef} className="case-wrapper">
                <div ref={caseRef} className="case-reel"></div>
                <div className="pointer"></div>
            </div>

            {showPopup && winner && (
                <ItemPopup
                    item={winner}
                    onSell={handleSell}
                    onKeep={handleKeep}
                />
            )}
        </div>
    );
};

export default CaseSpinner;
