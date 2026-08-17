# Autonomous High-Performance Engineering Guidelines

Peraturan ini wajib dipatuhi secara konsisten untuk setiap interaksi dan tugas coding pada proyek ini. Tujuannya adalah memastikan setiap pengerjaan mencapai standar kualitas tertinggi (frontier-grade) secara mandiri tanpa memerlukan micro-management dari pengguna (*zero-babysitting*).

---

## 1. Autonomous Execution & Self-Correction Protocol (Zero-Babysitting)
- **Eksekusi Mandiri Penuh**: Jangan meminta konfirmasi untuk langkah-langkah teknis perantara (seperti izin membaca file, izin mengedit, atau izin menjalankan build). Jalankan seluruh rantai kerja hingga tuntas.
- **Siklus Kerja Standar**:
  1. **Investigasi & Analisis**: Baca file terkait, petakan dependensi, dan pahami konteks seutuhnya sebelum mengubah apa pun.
  2. **Implementasi Presisi**: Terapkan perubahan kode secara bersih, modular, dan teliti.
  3. **Verifikasi Wajib**: Setiap kali selesai memodifikasi kode, **WAJIB** jalankan perintah verifikasi (seperti `npm run build`, `tsc`, linter) di terminal untuk memastikan tidak ada kesalahan kompilasi atau tipe data.
  4. **Self-Correction Loop**: Jika build/test menghasilkan error atau warning, baca log error secara mandiri, temukan akar permasalahannya (*root cause*), dan perbaiki langsung hingga lulus (exit code 0).
  5. **Laporan Akhir**: Hanya laporkan hasil akhir kepada pengguna setelah perubahan terverifikasi berhasil 100%.

---

## 2. Standar Kualitas Rekayasa Kode (*Engineering Excellence*)
- **Dilarang Menggunakan Placeholder**: Jangan tinggalkan `// TODO`, `/* tambahkan di sini */`, atau fungsi tiruan (*mock*) kecuali diminta secara eksplisit. Tulis implementasi yang utuh dan berfungsi.
- **No Band-Aid Fixes**: Selesaikan masalah hingga ke akarnya. Hindari *quick hacks* yang merusak arsitektur atau menimbulkan regresi di masa depan.
- **Edge-Case & Defensive Handling**: Selalu pertimbangkan kondisi ekstrim: nilai `null`/`undefined`, array kosong, error jaringan, loading state, dan validasi input.
- **Preservasi Logika**: Jaga fungsi dan fitur yang sudah berjalan dengan baik. Jangan menghapus fungsionalitas yang tidak terkait dengan tugas yang diberikan.

---

## 3. Standar Desain & UI/UX
- **Visual & Tipografi**: Pastikan hierarki teks jelas, proporsi kontainer seimbang, dan responsif di semua ukuran layar (mobile hingga desktop).
- **Format Teks**: Pada bagian kartu penjelasan atau artikel, pastikan tulisan memanfaatkan lebar penuh kontainer secara harmonis dengan perataan yang rapi.
- **Mikro-interaksi & State**: Komponen interaktif harus memiliki hover, active, focus, dan transition state yang halus.

---

## 4. Multi-Agent & Subagent Delegation
- Untuk tugas riset berskala besar atau refaktor multi-file yang masif, gunakan subagent (misalnya role *Researcher* atau *Auditor*) untuk memproses data di latar belakang.
- Hal ini menjaga *context window* agen utama tetap bersih sehingga daya penalaran (*reasoning*) tetap maksimal dan tajam.
