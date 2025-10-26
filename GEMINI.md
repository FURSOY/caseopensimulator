# Proje Yol Haritası

## Aşama 1: Temel Kurulum ve Sayfa Yönlendirme
- [ ] `react-router-dom` kütüphanesini kur.
- [ ] Temel sayfa bileşenlerini oluştur (HomePage, CasePage, AdminPage, LoginPage).
- [ ] App.jsx içinde temel router yapısını kur.

## Aşama 2: Firebase Entegrasyonu
- [ ] Firebase projesi oluştur ve konfigürasyon bilgilerini al.
- [ ] Firebase SDK'sını projeye ekle.
- [ ] Firebase config dosyasını oluştur.
- [ ] Firebase Authentication'ı kur (Email/Password).

## Aşama 3: Kullanıcı İşlemleri
- [ ] Kayıt olma ve giriş yapma formlarını oluştur.
- [ ] Kullanıcı oluşturulduğunda Firestore'a başlangıç verilerini (bakiye: 100, rol: 'user') kaydet.
- [ ] Çıkış yapma işlevselliği.
- [ ] Aktif kullanıcı durumunu global olarak yönet (Context API veya benzeri).

## Aşama 4: Kasa İşlemleri
- [ ] Ana sayfada Firestore'dan kasaları çek ve listele.
- [ ] Kasa detay sayfasına (`/case/:id`) tıklandığında ilgili kasa verisini göster.

## Aşama 5: Admin Paneli
- [ ] Admin rolüne sahip kullanıcılar için korumalı `/admin` rotası oluştur.
- [ ] Admin panelinde yeni kasa oluşturma formu yap.
- [ ] Formdan gelen veriyi Firestore'daki `cases` koleksiyonuna kaydet.
