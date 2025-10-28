import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CreateItemPage = () => {
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState(0);
    const [itemImage, setItemImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setItemImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!itemName || itemPrice <= 0 || !itemImage) {
            setError('Lütfen tüm alanları doldurun ve bir resim seçin.');
            return;
        }
        if (itemPrice > 10000) {
            setError('Eşya fiyatı 10000 den fazla olamaz.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Upload image to Firebase Storage
            const imageRef = ref(storage, `items/${itemImage.name}`);
            await uploadBytes(imageRef, itemImage);
            const imageURL = await getDownloadURL(imageRef);

            // Add item to Firestore
            await addDoc(collection(db, 'items'), {
                name: itemName,
                price: Number(itemPrice),
                imageURL: imageURL,
            });

            setSuccess('Item added successfully!');
            setItemName('');
            setItemPrice(0);
            setItemImage(null);
            e.target.reset();
        } catch (err) {
            setError('Failed to add item. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Yeni Ürün Ekle</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Item Name</label>
                    <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Item Price</label>
                    <input
                        type="number"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Item Image</label>
                    <input type="file" onChange={handleImageChange} required />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Item'}
                </button>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
            </form>
        </div>
    );
};

export default CreateItemPage;
