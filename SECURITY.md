# Security Policy — Ghanem.one

## Responsible Disclosure Policy

Kami mengapresiasi upaya peneliti keamanan dan komunitas dalam menjaga keamanan platform Ghanem.one. Dokumen ini menjelaskan cara melaporkan kerentanan secara bertanggung jawab.

**Mohon jangan melaporkan kerentanan keamanan melalui GitHub Issues publik.**

---

## Cara Melaporkan Kerentanan

Kirim laporan ke:

**Email:** security@ghanemtech.co.id

Sertakan dalam laporan:
- Deskripsi kerentanan dan potensi dampaknya
- Langkah-langkah untuk mereproduksi (proof of concept jika ada)
- Versi atau endpoint yang terdampak
- Saran perbaikan jika ada

Untuk laporan yang sangat sensitif, gunakan enkripsi GPG (lihat bagian [GPG Key](#gpg-key) di bawah).

---

## SLA Respons

| Tahap | Target waktu |
|---|---|
| Konfirmasi penerimaan laporan | 48 jam kerja |
| Triage awal (severity + scope) | 5 hari kerja |
| Update berkala selama investigasi | Mingguan |
| Patch untuk severity Critical/High | 14 hari kalender |
| Patch untuk severity Medium | 30 hari kalender |
| Patch untuk severity Low | 90 hari kalender atau di release berikutnya |

Kami akan memberi tahu Anda saat patch dirilis dan (dengan izin Anda) mencantumkan nama di Hall of Fame.

---

## Scope

### In-Scope

Kerentanan pada sistem berikut masuk dalam lingkup program ini:

| Target | URL / Identifier |
|---|---|
| Web app (production) | https://ghanem.one |
| API gateway (production) | https://api.ghanem.one |
| Tile server (production) | https://tiles.ghanem.one |
| Admin panel (production) | https://admin.ghanem.one |
| Auth / SSO integration | OIDC flow dengan SKK Migas SSO |

Kategori kerentanan yang relevan:
- Autentikasi dan otorisasi (broken auth, privilege escalation, JWT misuse)
- Injeksi (SQL injection termasuk spatial queries, command injection, SSTI)
- Cross-Site Scripting (XSS) dan Cross-Site Request Forgery (CSRF)
- Insecure Direct Object Reference (IDOR) pada data geospasial sensitif
- Kebocoran data (data migas, informasi KKKS, koordinat sumur)
- Konfigurasi keamanan yang salah (open S3/MinIO bucket, exposed internal endpoints)
- Dependency dengan CVE yang diketahui (CVSS >= 7.0)

### Out-of-Scope

Hal berikut **tidak** masuk dalam scope program ini:

- Layanan pihak ketiga yang bukan dikelola oleh Ghanem.one (Cloudflare, GitHub, dll.)
- Social engineering terhadap karyawan atau kontraktor
- Serangan fisik terhadap infrastruktur SKK Migas
- Denial of Service (DoS/DDoS) — jangan lakukan pengujian ini
- Spam atau email phishing
- Kerentanan yang sudah diketahui publik dan belum ada patch dari upstream
- Environment non-production (dev.ghanem.one, staging.ghanem.one) kecuali jika menyebabkan pivoting ke production

---

## Versi yang Didukung

Saat ini semua versi aktif yang di-deploy di production didukung dengan patch keamanan.

| Versi | Status |
|---|---|
| main / latest | Didukung aktif |
| release sebelumnya | Patch critical only (max 60 hari setelah versi baru) |
| dev / staging | Tidak ada dukungan keamanan formal |

Setelah platform mencapai stable release (v1.0), tabel ini akan diperbarui dengan versi spesifik.

---

## GPG Key

Untuk laporan kerentanan yang sangat sensitif (misalnya yang melibatkan akses data migas atau koordinat rahasia), gunakan enkripsi GPG.

Fingerprint dan public key akan dipublikasikan di sini setelah setup GPG key resmi untuk security@ghanemtech.co.id.

**Status saat ini:** GPG key dalam proses pembuatan. Sementara, gunakan email biasa dengan catatan eksplisit bahwa laporan bersifat sensitif — kami akan minta enkripsi jika diperlukan.

---

## Bug Bounty

Program bug bounty untuk Ghanem.one saat ini bersifat **internal** (belum terbuka untuk publik eksternal).

Kontributor internal dan peneliti yang diundang dapat menerima:
- Pengakuan di Hall of Fame
- Hadiah internal (TBD — dibahas setelah launch v1.0)

Program publik akan diumumkan setelah platform mencapai general availability.

---

## Hal yang TIDAK Boleh Dilakukan

Saat melakukan security research:
- Jangan mengakses, mengunduh, atau memodifikasi data migas atau data KKKS
- Jangan mengganggu layanan production (no DoS, no fuzzing skala besar tanpa koordinasi)
- Jangan memublikasikan kerentanan sebelum patch dirilis (coordinated disclosure)
- Jangan mencoba mendapatkan akses ke infrastruktur SKK Migas di luar scope yang disebutkan

---

## Hall of Fame

Terima kasih kepada peneliti yang telah melaporkan kerentanan secara bertanggung jawab:

*(Akan diisi setelah program berjalan)*

---

## Referensi

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CVE Program](https://www.cve.org/)
- [Coordinated Vulnerability Disclosure — BSSN Indonesia](https://www.bssn.go.id/)
