# TV+ Sosyal İzleme Platformu

Arkadaşlarla aynı anda TV+ içeriklerini izleme, sohbet etme ve masrafları paylaşma platformu.

## 🚀 Özellikler

### ✅ Tamamlanan MVP Özellikleri:
- **Oda Yönetimi**: Oda oluşturma ve davet sistemi
- **İçerik Oylaması**: TV+ kataloğundan içerik seçimi ve oylama
- **Senkron Oynatma**: Real-time video senkronizasyonu (mock player)
- **Sohbet Sistemi**: Real-time chat ve emoji tepkileri
- **Masraf Paylaşımı**: Gider ekleme ve otomatik bakiye hesaplama
- **Rate Limiting**: 2 saniye spam koruması

## 🛠 Teknoloji Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL (Supabase)
- WebSocket (Real-time communication)
- Async/Await

**Frontend:**
- Vanilla JavaScript
- Modern CSS (Responsive)
- WebSocket Client

## 📦 Kurulum

### 1. Gereksinimler
```bash
pip install -r requirements.txt
```

### 2. Veritabanı Konfigürasyonu
`.env` dosyası oluşturun:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### 3. Mock Data Ekleme
```bash
python add_mock_data.py
```

### 4. Server Başlatma
```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 5. Uygulama Erişimi
http://localhost:8000

## 🎮 Kullanım

### Ana Arayüz
- **Sol Panel**: Mock video player (play/pause/seek)
- **Sağ Panel**: 3 sekme (Oylama/Sohbet/Masraf)

### Özellik Kullanımı
1. **Oylama**: İçerik seçimi ve oy verme
2. **Sohbet**: Real-time mesajlaşma ve emoji tepkileri
3. **Masraf**: Gider ekleme ve bakiye görüntüleme

## 🔧 API Endpoints

### Rooms
- `GET /rooms` - Odaları listele
- `POST /rooms` - Yeni oda oluştur

### Voting
- `GET /votes/{room_id}/candidates` - Aday içerikleri listele
- `POST /votes` - Oy ver
- `GET /votes/{room_id}/tally` - Oy sayımı

### Expenses
- `GET /expenses/{room_id}` - Masrafları listele
- `POST /expenses` - Masraf ekle
- `GET /expenses/{room_id}/balances` - Bakiyeleri hesapla

### Chat
- `GET /chat/{room_id}/messages` - Mesajları getir
- `POST /chat/message` - Mesaj gönder
- `POST /chat/emoji` - Emoji gönder

### WebSocket
- `ws://localhost:8000/ws/{room_id}/{user_id}` - Real-time bağlantı

## 📊 Veritabanı Şeması

### Ana Tablolar:
- `users` - Kullanıcı bilgileri
- `rooms` - Oda bilgileri
- `catalog` - İçerik kataloğu
- `candidates` - Oylama adayları
- `votes` - Kullanıcı oyları
- `expenses` - Masraf kayıtları
- `chat` - Sohbet mesajları
- `emojis` - Emoji tepkileri
- `sync_events` - Video senkronizasyon olayları

## 🎯 Gereksinim Karşılama

### MVP Özellikleri (✅ Tamamlandı):
- [x] Oda & Davet sistemi
- [x] İçerik oylaması
- [x] Senkron oynatma (mock)
- [x] Sohbet & emoji tepkileri
- [x] Masraf paylaşımı
- [x] Rate limiting (2 saniye)
- [x] Responsive UI
- [x] WebSocket real-time communication

## 🚦 Test Durumu

Tüm API endpoint'leri test edildi ve çalışır durumda:
- ✅ Database bağlantısı
- ✅ CRUD operasyonları
- ✅ WebSocket bağlantısı
- ✅ Frontend arayüzü
- ✅ Real-time özellikler

## 📝 Geliştirme Notları

- **Rate Limiting**: Chat ve emoji için 2 saniye kısıtlama
- **Video Senkronizasyon**: Mock player ile simüle edildi
- **Responsive Design**: Mobil uyumlu arayüz
- **Error Handling**: Graceful error handling ve reconnection
- **Database**: Supabase PostgreSQL kullanımı

## 🔮 Gelecek Özellikler

- Gerçek video player entegrasyonu
- Push notification sistemi
- Kullanıcı profil yönetimi
- Oda moderasyon araçları
- Gelişmiş masraf paylaşım seçenekleri

---

**Geliştirme Süresi**: 6-8 saat (MVP)
**Durum**: ✅ Tamamlandı ve test edildi
