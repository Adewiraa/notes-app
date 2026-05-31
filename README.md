# Notes Apps

Notes App adalah aplikasi manajemen catatan internal yang aman, terstruktur, dan kolaboratif. Aplikasi ini terinspirasi dari fungsionalitas utama Google Keep (catatan, checklist, label, warna, pin, arsip, reminder, pencarian, lampiran, dan kolaborasi) namun disesuaikan untuk kebutuhan kepatuhan data organisasi dengan menyertakan fitur otentikasi JWT yang aman, kontrol akses RBAC (Role-Based Access Control), dan Audit Trail (pencatatan riwayat aktivitas).

Repository ini menggunakan struktur **Monorepo** yang memisahkan kode sumber backend dan frontend ke dalam subfolder terpisah agar mempermudah deployment dan pemeliharaan jangka panjang.

## 📁 Struktur Folder
```text
notes-app/
├── Back-End/   # Layanan API berbasis Laravel 10 & Kong API Gateway
└── README.md   # Dokumentasi utama aplikasi
```

---

## 🚀 Memulai Backend (Back-End)

Aplikasi backend menggunakan framework **Laravel 10** dengan PHP 8.1 dan database MySQL. Seluruh komunikasi API dapat diproxy secara aman menggunakan **Kong API Gateway**.

### Persyaratan Sistem
* PHP >= 8.1
* Composer
* MySQL Database
* Docker Desktop (Opsional, untuk menjalankan Kong Gateway)

### Setup Awal
1. Masuk ke folder backend:
   ```bash
   cd Back-End
   ```
2. Pasang dependensi PHP:
   ```bash
   composer install
   ```
3. Konfigurasikan `.env` Anda (atur host database Anda menjadi `localhost` atau `127.0.0.1`).
4. Jalankan migrasi database dan pengisian data demo (seeder):
   ```bash
   php artisan migrate --seed
   ```
5. Jalankan server Laravel lokal:
   ```bash
   php artisan serve --port=8001
   ```
6. Jalankan Kong Gateway (Opsional):
   ```bash
   docker-compose up -d
   ```

### 🔑 Akun Uji Coba Demo
Tabel database telah diisi dengan pengguna default berikut untuk testing awal:
* **Super Admin**: `superadmin@notesapp.com` (password: `password`)
* **Admin**: `admin@notesapp.com` (password: `password`)
* **User Demo**: `user@notesapp.com` (password: `password`)

---

## 📡 Gateway & Endpoint Dokumentasi
* **Kong API Gateway Proxy**: `http://localhost:8000/api/v1` (Direkomendasikan untuk frontend)
* **Laravel Direct API**: `http://localhost:8001/api/v1`
* **Dokumentasi Swagger UI Interaktif**: `http://localhost:8001/api/documentation`
