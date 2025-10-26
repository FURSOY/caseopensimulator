import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CaseSpinner from '../components/CaseSpinner';
import '../style/pages/CasePage.css';

function CasePage() {
    const { id } = useParams();
    const [caseData, setCaseData] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCaseData = async () => {
            try {
                const caseRef = doc(db, 'cases', id);
                const caseSnap = await getDoc(caseRef);

                if (caseSnap.exists()) {
                    const caseDetails = { id: caseSnap.id, ...caseSnap.data() };
                    setCaseData(caseDetails);

                    // Fetch item details
                    const itemPromises = caseDetails.items.map(async (item) => {
                        const itemRef = doc(db, 'items', item.itemId);
                        const itemSnap = await getDoc(itemRef);
                        if (itemSnap.exists()) {
                            return { ...itemSnap.data(), weight: item.weight };
                        }
                        return null;
                    });

                    const resolvedItems = (await Promise.all(itemPromises)).filter(Boolean);

                    // Calculate total weight
                    const totalWeight = resolvedItems.reduce((sum, item) => sum + item.weight, 0);

                    // Calculate percentage chance for each item
                    const itemsWithChance = resolvedItems.map(item => ({
                        ...item,
                        percentageChance: totalWeight > 0 ? (item.weight / totalWeight) * 100 : 0
                    }));

                    setItems(itemsWithChance);
                } else {
                    setError('Case not found.');
                }
            } catch (err) {
                setError('Failed to fetch case data. ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCaseData();
    }, [id]);

    if (loading) {
        return <div className="container">Loading...</div>;
    }

    if (error) {
        return <div className="container error">{error}</div>;
    }

    return (
        <div className="container">
            {caseData && (
                <>
                    <CaseSpinner caseId={id} />
                    <div className="item-list">
                        <h2>Kasa İçeriği</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Resim</th>
                                    <th>İsim</th>
                                    <th>Fiyat</th>
                                    <th>Şans</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td><img src={item.imageURL} alt={item.name} style={{ width: '50px' }} /></td>
                                        <td>{item.name}</td>
                                        <td>{item.price} ₺</td>
                                        <td>{item.percentageChance.toFixed(2)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default CasePage;
