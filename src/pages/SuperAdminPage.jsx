import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

function SuperAdminPage() {
    const [cases, setCases] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCasesAndUsers = async () => {
            setLoading(true);
            const casesSnapshot = await getDocs(collection(db, 'cases'));
            setCases(casesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            const usersSnapshot = await getDocs(collection(db, 'users'));
            setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        };
        fetchCasesAndUsers();
    }, []);

    const handleDeleteCase = async (caseId) => {
        if (window.confirm('Bu kasayı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteDoc(doc(db, 'cases', caseId));
                setCases(cases.filter(c => c.id !== caseId));
                alert('Kasa başarıyla silindi!');
            } catch (error) {
                console.error("Kasa silinirken hata:", error);
                alert('Kasa silinirken bir hata oluştu.');
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                setUsers(users.filter(u => u.id !== userId));
                alert('Kullanıcı başarıyla silindi!');
            } catch (error) {
                console.error("Kullanıcı silinirken hata:", error);
                alert('Kullanıcı silinirken bir hata oluştu.');
            }
        }
    };

    const handleBalanceChange = async (userId, newBalance) => {
        const balance = prompt('Yeni bakiye miktarını girin:', newBalance);
        if (balance !== null) {
            try {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, { balance: Number(balance) });
                setUsers(users.map(u => u.id === userId ? { ...u, balance: Number(balance) } : u));
                alert('Bakiye başarıyla güncellendi!');
            } catch (error) {
                console.error("Bakiye güncellenirken hata:", error);
                alert('Bakiye güncellenirken bir hata oluştu.');
            }
        }
    };

    if (loading) {
        return <div>Yükleniyor...</div>;
    }

    return (
        <div className="super-admin-page">
            <h1>Süper Admin Paneli</h1>

            <div className="admin-section">
                <h2>Kasaları Yönet</h2>
                <ul>
                    {cases.map(c => (
                        <li key={c.id}>
                            {c.name} - {c.price} ₺
                            <button onClick={() => handleDeleteCase(c.id)}>Sil</button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="admin-section">
                <h2>Kullanıcıları Yönet</h2>
                <ul>
                    {users.map(user => (
                        <li key={user.id}>
                            {user.username} - Bakiye: {user.balance} ₺
                            <button onClick={() => handleBalanceChange(user.id, user.balance)}>Bakiye Düzenle</button>
                            <button onClick={() => handleDeleteUser(user.id)}>Kullanıcıyı Sil</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SuperAdminPage;
