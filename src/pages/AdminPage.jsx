import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import '../style/pages/AdminPage.css';

function AdminPage() {
    const [caseName, setCaseName] = useState('');
    const [casePrice, setCasePrice] = useState(0);
    const [caseColor, setCaseColor] = useState('#ff9800');
    const [items, setItems] = useState([{ itemId: '', weight: '' }]);
    const [availableItems, setAvailableItems] = useState([]);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'items'), (snapshot) => {
            const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAvailableItems(itemsData);
        });
        return () => unsubscribe();
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([...items, { itemId: '', weight: '' }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback('Kasa ekleniyor...');

        if (!caseName || casePrice <= 0 || items.some(item => !item.itemId || !item.weight)) {
            setFeedback('Lütfen tüm alanları doldurun, fiyatın 0dan büyük olduğundan ve tüm ürünlerin seçili ve ağırlıklarının girili olduğundan emin olun.');
            return;
        }

        try {
            const formattedItems = items.map(item => ({
                itemId: item.itemId,
                weight: Number(item.weight)
            }));

            await addDoc(collection(db, 'cases'), {
                name: caseName,
                price: Number(casePrice),
                color: caseColor,
                items: formattedItems,
            });

            setFeedback('Kasa başarıyla eklendi!');
            setCaseName('');
            setCasePrice(0);
            setCaseColor('#ff9800');
            setItems([{ itemId: '', chance: '' }]);
        } catch (error) {
            console.error("Kasa eklenirken hata:", error);
            setFeedback(`Hata: ${error.message}`);
        }
    };

    return (
        <div className="admin-page">
            <h1>Admin Paneli</h1>
            <nav className="admin-nav">
                <Link to="/admin/add-item" className="admin-link">Yeni Ürün Ekle</Link>
            </nav>

            <form onSubmit={handleSubmit} className="admin-form">
                <h2>Yeni Kasa Ekle</h2>
                <div className="form-group">
                    <label>Kasa Adı:</label>
                    <input type="text" value={caseName} onChange={(e) => setCaseName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Kasa Fiyatı:</label>
                    <input type="number" value={casePrice} onChange={(e) => setCasePrice(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Kasa Rengi:</label>
                    <input type="color" value={caseColor} onChange={(e) => setCaseColor(e.target.value)} />
                </div>

                <h3>İçerik</h3>
                {items.map((item, index) => (
                    <div key={index} className="item-input">
                        <select value={item.itemId} onChange={(e) => handleItemChange(index, 'itemId', e.target.value)} required>
                            <option value="" disabled>Bir ürün seçin</option>
                            {availableItems.map(availItem => (
                                <option key={availItem.id} value={availItem.id}>
                                    {availItem.name}
                                </option>
                            ))}
                        </select>
                        <input type="number" placeholder="Ağırlık" value={item.weight} onChange={(e) => handleItemChange(index, 'weight', e.target.value)} required />
                        <button type="button" onClick={() => handleRemoveItem(index)}>Sil</button>
                    </div>
                ))}

                <button type="button" onClick={handleAddItem} className="add-item-btn">İçerik Ekle</button>
                <button type="submit" className="submit-btn">Kasayı Kaydet</button>
                {feedback && <p className="feedback-message">{feedback}</p>}
            </form>
        </div>
    );
}

export default AdminPage;
