import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CaseSpinner from '../components/CaseSpinner';

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
                            return { ...itemSnap.data(), chance: item.chance };
                        }
                        return null;
                    });

                    const resolvedItems = (await Promise.all(itemPromises)).filter(Boolean);
                    setItems(resolvedItems);
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
                    <h1>{caseData.name}</h1>
                    <p>Price: {caseData.price} ₺</p>
                    <CaseSpinner caseId={id} />
                    <div className="item-list">
                        <h2>Possible Items</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Chance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td><img src={item.imageURL} alt={item.name} style={{ width: '50px' }} /></td>
                                        <td>{item.name}</td>
                                        <td>{item.price} ₺</td>
                                        <td>{item.chance}%</td>
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
