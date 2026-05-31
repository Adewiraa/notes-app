# Notes Apps - Back-End Service

Layanan Back-End API untuk aplikasi **Notes Apps** yang dikembangkan menggunakan **Laravel 10**, terhubung dengan database MySQL, terotentikasi menggunakan JSON Web Token (JWT), serta dilengkapi dengan **Kong API Gateway** sebagai *entrypoint proxy* yang aman, andal, dan berkinerja tinggi.

---

## 🌟 Fitur Unggulan (Core Features)

Layanan backend ini mengimplementasikan fitur lengkap sesuai standar PRD:

### 1. 🔑 Autentikasi JWT & Keamanan Tingkat Tinggi
*   **JSON Web Token (JWT)**: Otentikasi stateless menggunakan `tymon/jwt-auth`.
*   **Role-Based Access Control (RBAC)**: Pengelompokan peran terstruktur (Super Admin, Admin, dan User).
*   **Scope Isolation**: Pembatasan ketat di level database sehingga data catatan antar-departemen dan pengguna terisolasi dengan aman.

### 2. 📝 Manajemen Catatan Dinamis (Keep-Style Notes)
*   **Tipe Catatan**: Mendukung catatan Tipe `text`, `checklist` (todo-list), maupun `mixed`.
*   **Siklus Hidup**: Mendukung Pin/Unpin (prioritas), Archive (arsip), Soft Delete (Trash), dan Restore.
*   **Master Warna**: Pewarnaan catatan dinamis menggunakan palet warna terstandarisasi.

### 3. 🏷️ Kategori & Labelisasi
*   **Label Personal**: Dibuat oleh pengguna biasa untuk mengorganisir catatannya sendiri.
*   **Label Global**: Dibuat oleh Admin/Super Admin untuk konsistensi kategori di seluruh organisasi.

### 4. ⏱️ Pengingat Cerdas (Timezone-Aware Reminders)
*   **Reminders**: Penyetelan tenggat waktu pengingat yang terintegrasi dengan timezone.
*   **Automated Dispatcher**: Pemicu notifikasi in-app otomatis saat jatuh tempo menggunakan background worker Laravel Scheduler.

### 5. 🤝 Kolaborasi & Berbagi Fleksibel
*   **Granular Sharing**: Berbagi catatan ke pengguna lain, peran (Role), atau divisi (Department) tertentu.
*   **Tingkat Hak Akses**: Izin akses khusus sebagai `viewer`, `editor`, atau `commenter`.

### 6. 🛡️ Audit Trail Otomatis (DIPA Standard)
*   **Audit Logs**: Setiap aksi manipulasi data penting (pembuatan, perubahan, penghapusan, sharing) direkam secara transparan pada tabel `note_audit_logs`.
*   **Detail Metadata**: Menyimpan status data lama & baru (`old_values`, `new_values`), alamat IP aktor, serta User Agent browser/sistem.

### 7. 🚀 Kong API Gateway Integration
*   **Kong Gateway**: Mode DB-less di port `8000`.
*   **Plugin CORS**: Mengizinkan frontend Next.js melakukan request secara aman.
*   **Plugin Rate-Limiting**: Membatasi serangan brute-force (Maksimal 5 request per detik per IP).

---

## 📡 Panduan REST API Endpoints (v1)

Semua endpoint ber-prefix `/api/v1/` dan dilindungi oleh otentikasi Bearer Token (JWT).

### 🔐 Autentikasi (`/api/v1/auth`)
*   `POST /auth/register` : Pendaftaran user baru.
*   `POST /auth/login` : Autentikasi user & pengambilan token JWT.
*   `GET /auth/me` : Informasi profil pengguna terlogin.
*   `POST /auth/refresh` : Refresh masa aktif token.
*   `POST /auth/logout` : Menghapus session token JWT.

### 📓 Manajemen Catatan (`/api/v1/notes`)
*   `GET /notes` : Mendapatkan list catatan terfilter & paginated.
*   `POST /notes` : Membuat catatan baru (Tipe teks/checklist).
*   `GET /notes/{uuid}` : Detail catatan lengkap dengan lampiran dan audit trail.
*   `PATCH /notes/{uuid}` : Memperbarui judul, konten, warna, atau label.
*   `DELETE /notes/{uuid}` : Memindahkan catatan ke Trash (Soft delete).
*   `POST /notes/{uuid}/restore` : Memulihkan catatan dari Trash.
*   `DELETE /notes/{uuid}/force` : Menghapus catatan secara permanen (Owner/Admin).
*   `POST /notes/{uuid}/pin` : Toggle pin/unpin catatan.
*   `POST /notes/{uuid}/archive` : Toggle arsip catatan.
*   `GET /notes-summary` : Statistik ringkasan data catatan untuk widget Dashboard.

### 📎 Lampiran Dokumen (`/api/v1/attachments`)
*   `POST /notes/{uuid}/attachments` : Mengunggah lampiran gambar/PDF/Docx (Maks 5MB).
*   `GET /attachments/{id}/download` : Mengunduh lampiran secara aman (divalidasi hak aksesnya).

### 🏷️ Pengelolaan Kategori (`/api/v1/labels`)
*   `GET /labels` : List label aktif (Personal & Global).
*   `POST /labels` : Membuat label baru.
*   `PATCH /labels/{id}` : Mengubah nama atau warna label.
*   `DELETE /labels/{id}` : Menghapus label.

### ⏱️ Pengingat & Kolaborator
*   `POST /notes/{uuid}/reminders` : Menyimpan reminder baru.
*   `POST /reminders/{id}/complete` : Menandai pengingat telah selesai/dibaca.
*   `POST /notes/{uuid}/collaborators` : Membagikan catatan ke user/divisi lain.

---

## 🛠️ Cara Menjalankan Layanan Backend

### 1. Inisialisasi & Install Dependensi
```bash
composer install
npm install && npm run build
```

### 2. Jalankan Database Migration & Seeders
Pastikan Anda sudah membuat database bernama `notesapp` di MySQL lokal (Laragon/XAMPP), lalu eksekusi:
```bash
php artisan migrate --seed
```

### 3. Jalankan Server Utama (Laravel)
```bash
php artisan serve --port=8001
```

### 4. Aktifkan Background Scheduler (Untuk Reminder & Housekeeping)
```bash
php artisan schedule:work
```

### 5. Jalankan Kong Gateway (Docker)
```bash
docker-compose up -d
```

### 6. Akses Halaman Dokumentasi Interaktif (Swagger UI)
Buka browser Anda dan akses:
👉 **`http://localhost:8001/api/documentation`**
