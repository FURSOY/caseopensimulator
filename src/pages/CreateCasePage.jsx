import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import '../style/pages/AdminPage.css';

function CreateCasePage() {
    const [caseName, setCaseName] = useState('');
    const [casePrice, setCasePrice] = useState(0);
    const [caseColor, setCaseColor] = useState('#ff9800');
    const [items, setItems] = useState([{ itemId: '', chance: 0 }]);
    const [availableItems, setAvailableItems] = useState([]);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'items'), (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAvailableItems(itemsData);
        });
        return () => unsubscribe();
    }, []);

    const calculateAndSetCaseDetails = (currentItems) => {
        const itemsWithFullDetails = currentItems.map(item => {
            const fullItem = availableItems.find(availItem => availItem.id === item.itemId);
            return { ...item, ...fullItem };
        });

        const selectedItemsForCalculation = itemsWithFullDetails.filter(item => item.id);

        if (selectedItemsForCalculation.length === 0) {
            setCasePrice(0);
            return currentItems; // Return original items if no valid items for calculation
        }

        const totalValue = selectedItemsForCalculation.reduce((sum, item) => sum + item.price, 0);
        const casePrice = totalValue * 0.7;
        setCasePrice(casePrice);

        const totalInversePrice = selectedItemsForCalculation.reduce((sum, item) => sum + (totalValue / item.price), 0);

        const itemsWithCalculatedChance = itemsWithFullDetails.map(item => {
            if (item.id) {
                return {
                    itemId: item.id,
                    chance: (totalValue / item.price) / totalInversePrice
                };
            } else {
                return { itemId: '', chance: 0 }; // Preserve empty items
            }
        });
        return itemsWithCalculatedChance;
    };
    
    useEffect(() => {
        if(availableItems.length > 0) {
            const updatedItems = calculateAndSetCaseDetails(items);
            // Only update if the items have actually changed to prevent infinite re-renders
            if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
                setItems(updatedItems);
            }
        }
    }, [items, availableItems]);


    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        const updatedItemsWithChance = calculateAndSetCaseDetails(newItems);
        setItems(updatedItemsWithChance);
    };

    const handleAddItem = () => {
        setItems([...items, { itemId: '', chance: 0 }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        const updatedItemsWithChance = calculateAndSetCaseDetails(newItems);
        setItems(updatedItemsWithChance);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback('Kasa ekleniyor...');

        if (!caseName || items.some(item => !item.itemId)) {
            setFeedback('Lütfen kasa adını girin ve en az bir ürün seçin.');
            return;
        }

        try {
            await addDoc(collection(db, 'cases'), {
                name: caseName,
                price: Number(casePrice),
                color: caseColor,
                items: items,
            });

            setFeedback('Kasa başarıyla eklendi!');
            setCaseName('');
            setCasePrice(0);
            setCaseColor('#ff9800');
            setItems([{ itemId: '', chance: 0 }]);
        } catch (error) {
            console.error("Kasa eklenirken hata:", error);
            setFeedback(`Hata: ${error.message}`);
        }
    };


    return (
        <div className="admin-page">
            <h1>Kasa Oluştur</h1>
            <nav className="admin-nav">
                <Link to="/create-item" className="admin-link">Yeni Ürün Ekle</Link>
            </nav>

            <form onSubmit={handleSubmit} className="admin-form">
                <h2>Yeni Kasa Ekle</h2>
                <div className="form-group">
                    <label>Kasa Adı:</label>
                    <input type="text" value={caseName} onChange={(e) => setCaseName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Kasa Fiyatı:</label>
                    <input type="number" value={casePrice.toFixed(2)} disabled />
                </div>
                <div className="form-group">
                    <label>Kasa Rengi:</label>
                    <input type="color" value={caseColor} onChange={(e) => setCaseColor(e.target.value)} />
                </div>

                <h3>İçerik</h3>
                {items.map((item, index) => {
                    const selectedItemDetails = availableItems.find(availItem => availItem.id === item.itemId);
                    return (
                        <div key={index} className="item-input">
                            <select value={item.itemId} onChange={(e) => handleItemChange(index, 'itemId', e.target.value)} required>
                                <option value="" disabled className="default-option">Bir ürün seçin</option>
                                {availableItems.map(availItem => (
                                    <option key={availItem.id} value={availItem.id}>
                                        {availItem.name} ({availItem.price.toFixed(2)} ₺)
                                    </option>
                                ))}
                            </select>
                            {selectedItemDetails && (
                                <span>Şans: {(item.chance * 100).toFixed(2)}%</span>
                            )}
                            <button type="button" onClick={() => handleRemoveItem(index)}>Sil</button>
                        </div>
                    );
                })}
                <button type="button" onClick={handleAddItem} className="add-item-btn">İçerik Ekle</button>
                <button type="submit" className="submit-btn">Kasayı Kaydet</button>
                {feedback && <p className="feedback-message">{feedback}</p>}
            </form>
        </div>
    );
}

export default CreateCasePage;