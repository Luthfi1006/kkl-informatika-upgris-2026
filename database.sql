CREATE TABLE IF NOT EXISTS settings (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) UNIQUE NOT NULL,
 value TEXT
);
INSERT INTO settings(name,value) VALUES
('site_title','KKL Informatika UPGRIS 2026'),
('logo','')
ON DUPLICATE KEY UPDATE value=VALUES(value);

CREATE TABLE IF NOT EXISTS admins (
 id INT AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(80) UNIQUE NOT NULL,
 password VARCHAR(255) NOT NULL
);
INSERT INTO admins(username,password) VALUES
('admin', '$2y$10$M4qrHi4M5jU5px6uxyvEAuwsnUJqqj3BCAqBW3sq54X7Sj4JGc0wy')
ON DUPLICATE KEY UPDATE password=VALUES(password);
-- Default login: admin / password

CREATE TABLE IF NOT EXISTS profiles (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(120) NOT NULL,
 role VARCHAR(120),
 bio TEXT,
 photo VARCHAR(255),
 sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS destinations (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(160) NOT NULL,
 visit_date DATE NULL,
 description TEXT,
 day_no INT NOT NULL DEFAULT 1,
 route VARCHAR(255) NULL,
 sort_order INT NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
 id INT AUTO_INCREMENT PRIMARY KEY,
 destination_id INT NULL,
 title VARCHAR(160) NOT NULL,
 location VARCHAR(160),
 photo VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
 id INT AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(160) NOT NULL,
 embed_url VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
 id INT AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 rating TINYINT NOT NULL,
 message TEXT NOT NULL,
 approved TINYINT(1) DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Profiles
INSERT INTO profiles(name, role, bio, photo, sort_order) SELECT * FROM (
 SELECT 'Luthfi' AS col_name, 'Mahasiswa Informatika' AS col_role, 'Engginer' AS col_bio, 'assets/uploads/profiles/profile_1793046726_5e708eca.jpeg' AS col_photo, 1 AS col_sort UNION ALL
 SELECT 'Dita Nur Ristiyana', 'Mahasiswa Informatika', 'Edit profil ini melalui admin.', 'assets/img/profile-placeholder.svg', 2 UNION ALL
 SELECT 'Maeladia Zaskia Saputri', 'Mahasiswa Informatika', 'Edit profil ini melalui admin.', 'assets/img/profile-placeholder.svg', 3 UNION ALL
 SELECT 'Deva ubadah surul anamta', 'Mahasiswa Informatika', 'Edit profil ini melalui admin.', 'assets/img/profile-placeholder.svg', 4 UNION ALL
 SELECT 'Panji Choirul Anam', 'Mahasiswa Informatika', 'Edit profil ini melalui admin.', 'assets/img/profile-placeholder.svg', 5 UNION ALL
 SELECT 'Ridho Dwiki Zakaria', 'Mahasiswa Informatika', 'Edit profil ini melalui admin.', 'assets/img/profile-placeholder.svg', 6 UNION ALL
 SELECT 'Andrey Raditya Al Hakim', 'Mahasiswa Informatika', 'Edit profil ini melalui admin.', 'assets/img/profile-placeholder.svg', 7 UNION ALL
 SELECT 'Danar Bhanu Setiawan', 'Mahasiswa Informatika', 'Edit profil ini melalui admin.', 'assets/img/profile-placeholder.svg', 8 UNION ALL
 SELECT 'Moch Afrizal Ferlindo', 'Mahasiswa Informatika', 'Edit profil ini melalui admin.', 'assets/img/profile-placeholder.svg', 9 UNION ALL
 SELECT 'Ismail Maulid Riwanto', 'Mahasiswa Informatika', 'Edit profil ini melalui admin.', 'assets/img/profile-placeholder.svg', 10 UNION ALL
 SELECT 'Muhammad Nur Rizki', 'Mahasiswa Informatika', 'Edit profil ini melalui admin.', 'assets/img/profile-placeholder.svg', 11 UNION ALL
 SELECT 'Abdullah Faza', 'Mahasiswa Informatika', '', 'assets/img/profile-placeholder.svg', 11
) AS seed_profiles WHERE NOT EXISTS (SELECT 1 FROM profiles);

-- Seed Destinations / Itinerary
INSERT INTO destinations(name, visit_date, description, day_no, route, sort_order) SELECT * FROM (
 SELECT 'Persiapan Pemberangkatan Di kampus 1 Upgris' AS c_name, '2026-08-18' AS c_date, 'Pukul 06.00-07.00' AS c_desc, 1 AS c_day, NULL AS c_route, 1 AS c_sort UNION ALL
 SELECT 'PT. Victoria Care Indonesia', '2026-08-18', 'Pukul 07.00-08.00', 1, 'Menuju PT. Victoria care Indonesia', 2 UNION ALL
 SELECT 'PT. Victoria care Indonesia', '2026-08-18', 'Pukul 08.00-09.00', 1, 'Kunjungan di PT. Victoria care Indonesia', 3 UNION ALL
 SELECT 'R.M. Titin Caruban', '2026-08-18', 'Pukul 09.00 - 12.00', 1, 'Perjalanan menuju R.M. Titin Caruban', 4 UNION ALL
 SELECT 'R.M. Titin Caruban', '2026-08-18', 'Pukul 12.00-13.00', 1, 'Menikmati R.M. Titin Caruban', 5 UNION ALL
 SELECT 'R.M. Puritama untuk makan malam', '2026-08-18', 'Pukul 13.00-18.00', 1, 'Melanjutkan perjalanan menuju Pulau Dewata Bali    (Singgah di R.M. Puritama untuk makan malam)', 6 UNION ALL
 SELECT 'Pelabuhan Ketapang', '2026-08-18', 'Pukul 23.00', 1, 'Diharapkan telah tiba di Pelabuhan Ketapang', 7 UNION ALL
 SELECT 'pelabuhan Gilimanuk-Bali dan melanjutkan perjalanan menuju Hotel Made Bali', '2026-08-19', 'Pukul 04.00-05.00', 2, 'Dini hari diharapkan telah menyebrang ke pelabuhan Gilimanuk-Bali dan melanjutkan perjalanan menuju Hotel Made Bali', 1 UNION ALL
 SELECT 'Hotel Made Bali', '2026-08-19', 'Pukul 05.00-08.00', 2, 'Transit dan makan pagi di Hotel Made Bali', 2 UNION ALL
 SELECT 'Joger', '2026-08-19', 'Pukul 08.00-09.30', 2, 'Perjalanan menuju Joger Luwus', 3 UNION ALL
 SELECT 'pabrik Kata-kata Joger Luwus', '2026-08-19', 'Pukul 09.30-11.00', 2, 'Eksplorasi pabrik Kata-kata Joger Luwus', 4 UNION ALL
 SELECT 'menuju Candi Kuning Ulundanu Bratan', '2026-08-19', 'Pukul 11.00-11.30', 2, 'Perjalanan menuju Candi Kuning Ulundanu Bratan', 5 UNION ALL
 SELECT 'Candi Kuning', '2026-08-19', 'Pukul 11.30-12.30', 2, 'Eksplorasi Candi Kuning', 6 UNION ALL
 SELECT 'makan siang di Ulundanu Beratan', '2026-08-19', 'Pukul 12.30-13.30', 2, 'Menikmati makan siang di Ulundanu Beratan', 7 UNION ALL
 SELECT 'menuju Dewata Oleh-oleh khas bali', '2026-08-19', 'Pukul 13.30-16.00', 2, 'Perjalanan menuju Dewata Oleh-oleh khas bali', 8 UNION ALL
 SELECT 'makan malam dan belanja Oleh-oleh khas Bali di Dewata', '2026-08-19', 'Pukul 16.00-18.00', 2, 'Menikmati makan malam dan belanja Oleh-oleh khas Bali di Dewata', 9 UNION ALL
 SELECT 'Nusa Dua', '2026-08-19', 'Pukul 18.00-19.00', 2, 'Perjalanan menuju Nusa Dua', 10 UNION ALL
 SELECT 'pertunjukan Tari Devdan Show', '2026-08-19', 'Pukul 19.00-20.00', 2, 'Eksplorasi pertunjukan Tari Devdan Show', 11 UNION ALL
 SELECT 'Hotel Quest san Denpasar', '2026-08-19', 'Pukul 20.00-21.00', 2, 'Perjalanan menuju Hotel Quest san Denpasar', 12 UNION ALL
 SELECT 'Check in Hotel Quest san Denpasar', '2026-08-19', 'Pukul 20.00-pagi', 2, 'Check in Hotel Quest san Denpasar dilanjutkan istirahat malam', 13 UNION ALL
 SELECT 'Breakfast di Hotel Quest san Denpasar', '2026-08-20', 'Pukul 05.00 - 08.00', 3, 'Breakfast di Hotel Quest san Denpasar', 1 UNION ALL
 SELECT 'Balai Diklat Industri Denpasar', '2026-08-20', 'Pukul 08.00-09.00', 3, 'Perjalanan menuju Kunjungan Balai Diklat Industri Denpasar', 2 UNION ALL
 SELECT 'Balai Diklat Industri Denpasar', '2026-08-20', 'Pukul 09.00-10.30', 3, 'Kunjungan di Balai Diklat Industri Denpasar', 3 UNION ALL
 SELECT 'Krisna Oleh-oleh khas bali', '2026-08-20', 'Pukul 10.30-11.00', 3, 'Perjalanan menuju Krisna Oleh-oleh khas bali', 4 UNION ALL
 SELECT 'makan siang dan belanja Oleh-oleh khas Bali di Krisna Sunset road', '2026-08-20', 'Pukul 11.00-13.00', 3, 'Menikmati makan siang dan belanja Oleh-oleh khas Bali di Krisna Sunset road', 5 UNION ALL
 SELECT 'Pantai Kuta', '2026-08-20', 'Pukul 13.00 - 14.00', 3, 'Perjalanan Menuju Pantai Kuta', 6 UNION ALL
 SELECT 'Pantai Kuta', '2026-08-20', 'Pukul 14.00-15.30', 3, 'Eksplorasi Pantai Kuta', 7 UNION ALL
 SELECT 'Pantai Pandawa', '2026-08-20', 'Pukul 15.30-16.00', 3, 'Perjalanan Menuju Pantai Pandawa', 8 UNION ALL
 SELECT 'Pantai Pandawa', '2026-08-20', 'Pukul 16.00-17.30', 3, 'Eksplorasi Pantai Pandawa', 9 UNION ALL
 SELECT 'pementasan Tari Kecak di Pandawa', '2026-08-20', 'Pukul 17.30-18.00', 3, 'Persiapan menuju tempat pementasan Tari Kecak di Pandawa', 10 UNION ALL
 SELECT 'Tari Kecak di Pandawa', '2026-08-20', 'Pukul 18.00-19.00', 3, 'Eksplorasi budaya Tari Kecak di Pandawa', 11 UNION ALL
 SELECT 'Cafe â€œTepi Pantaiâ€ di Jimbaran', '2026-08-20', 'Pukul 18.00-19.00', 3, 'Melanjutkan perjalanan menuju Cafe â€œTepi Pantaiâ€ di Jimbaran', 12 UNION ALL
 SELECT 'makrab di Cafe â€œTepi Pantaiâ€ di Jimbaran', '2026-08-20', 'Pukul 19.00-22.30', 3, 'Menikmati dinner dilanjutkan makrab di Cafe â€œTepi Pantaiâ€ di Jimbaran', 13 UNION ALL
 SELECT 'Hotel Quest san Denpasar', '2026-08-20', 'Pukul 21.30-05.00', 3, 'Melanjutkan perjalanan  menuju Hotel Quest san Denpasar untuk Istirahat', 14 UNION ALL
 SELECT 'Hotel Quest San Denpasar', '2026-08-21', 'Pukul 05.00-06.00', 4, 'Persiapan pribadi', 1 UNION ALL
 SELECT 'Hotel Quest San Denpasar', '2026-08-21', 'Pukul 06.00-08.00', 4, 'Breakfast di Hotel Quest San Denpasar dan check-out', 2 UNION ALL
 SELECT 'Karang kurnia', '2026-08-21', 'Pukul 10.30-11.00', 4, 'Perjalanan menuju Karang kurnia Oleh-oleh khas bali', 3 UNION ALL
 SELECT 'Karang kurnia', '2026-08-21', 'Pukul 11.00-13.00', 4, 'Belanja Oleh-oleh khas Bali di Karang kurnia', 4 UNION ALL
 SELECT 'Singgah makan siang di RM. Soka Indah', '2026-08-21', 'Pukul 11.00', 4, 'Dilanjutkan perjalanan menuju Pelabuhan Gilimanuk (Singgah makan siang di RM. Soka Indah)', 5 UNION ALL
 SELECT 'pelabuhan ketapang', '2026-08-21', 'Pukul 17.00', 4, 'Sore hari diharapkan telah menyeberang pelabuhan ketapang untuk meneruskan perjalanan ke  Semarang', 6 UNION ALL
 SELECT 'Local Resto', '2026-08-21', 'Pukul 20.00-21.30', 4, 'Singgah sejenak di Local Resto untuk makan malam', 7 UNION ALL
 SELECT 'Semarang', '2026-08-21', 'Pukul 21.30', 4, 'Melanjutkan perjalanan pulang ke Semarang', 8 UNION ALL
 SELECT 'UPGRIS', '2026-08-22', 'Pukul 05.00', 5, 'Pagi hari diharapkan telah tiba di Kampus Tercinta UPGRIS', 1
) AS seed_destinations WHERE NOT EXISTS (SELECT 1 FROM destinations);
