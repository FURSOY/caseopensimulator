import React from 'react';
import './ItemPopup.css';

const ItemPopup = ({ item, onSell, onKeep }) => {
    if (!item) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content" style={{ borderColor: item.color || '#fff' }}>
                <div className="popup-header">
                    <h3>{item.name}</h3>
                </div>
                <div className="popup-body">
                    <img src={item.imageURL} alt={item.name} className="popup-item-image" />
                    <p className="popup-item-price">{item.price} ₺</p>
                </div>
                <div className="popup-footer">
                    <button onClick={onSell} className="popup-btn sell-btn">Eşyayı Sat</button>
                    <button onClick={onKeep} className="popup-btn keep-btn">Eşyayı Sakla</button>
                </div>
            </div>
        </div>
    );
};

export default ItemPopup;
