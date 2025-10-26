import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, getDoc, runTransaction, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const inventoryCollectionRef = collection(db, 'users', currentUser.uid, 'inventory');
        const q = query(inventoryCollectionRef, orderBy('wonAt', 'desc'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            setLoading(true);
            const inventoryPromises = snapshot.docs.map(async (inventoryDoc) => {
                const inventoryItem = { id: inventoryDoc.id, ...inventoryDoc.data() };
                const itemRef = doc(db, 'items', inventoryItem.itemId);
                const itemSnap = await getDoc(itemRef);
                if (itemSnap.exists()) {
                    return { ...inventoryItem, ...itemSnap.data() };
                }
                return null;
            });

            const resolvedItems = (await Promise.all(inventoryPromises)).filter(Boolean);
            setInventory(resolvedItems);
            setLoading(false);
        }, (error) => {
            console.error("Envanter çekilirken hata:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const sellItem = async (inventoryItemId, price) => {
        if (!currentUser) return;

        const userDocRef = doc(db, 'users', currentUser.uid);
        const inventoryItemRef = doc(db, 'users', currentUser.uid, 'inventory', inventoryItemId);

        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) {
                    throw "User does not exist!";
                }

                const newBalance = userDoc.data().balance + price;
                transaction.update(userDocRef, { balance: newBalance });
                transaction.delete(inventoryItemRef);
            });
        } catch (e) {
            console.error("Satış işlemi başarısız: ", e);
        }
    };


    if (loading) {
        return <div className="container">Envanter yükleniyor...</div>;
    }

    if (!currentUser) {
        return <div className="container">Envanterinizi görmek için lütfen giriş yapın.</div>;
    }

    return (
        <div className="inventory-page container">
            <h1>Envanter</h1>
            {inventory.length === 0 ? (
                <p>Henüz hiç eşyanız yok.</p>
            ) : (
                <div className="inventory-grid">
                    {inventory.map(item => (
                        <div key={item.id} className="inventory-item">
                            <img src={item.imageURL} alt={item.name} />
                            <div className="item-name">{item.name}</div>
                            <div className="item-price">{item.price} ₺</div>
                            <button onClick={() => sellItem(item.id, item.price)} className="sell-btn">
                                Sat
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default InventoryPage;
