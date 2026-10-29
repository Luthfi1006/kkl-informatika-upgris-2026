<?php
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/helpers.php";
$pageTitle = "KKL Informatika UPGRIS 2026";
$profiles = $pdo->query("SELECT * FROM profiles ORDER BY sort_order, id")->fetchAll(PDO::FETCH_ASSOC);

try {
    $destinations = $pdo->query("SELECT * FROM destinations ORDER BY day_no, sort_order, id")->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $destinations = $pdo->query("SELECT * FROM destinations ORDER BY visit_date, name")->fetchAll(PDO::FETCH_ASSOC);
}

$gallery = $pdo->query("SELECT g.*, d.name AS destination_name FROM gallery g LEFT JOIN destinations d ON d.id=g.destination_id ORDER BY g.created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
$videos = $pdo->query("SELECT * FROM videos ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
$feedbacks = $pdo->query("SELECT * FROM feedback WHERE approved=1 ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

// Group itinerary by day
$itineraryByDay = [];
foreach ($destinations as $d) {
    $day = (int)($d['day_no'] ?: 1);
    $itineraryByDay[$day][] = $d;
}

$dayRoutes = [
    1 => 'Semarang → Bali',
    2 => 'Penyeberangan & Eksplorasi Wisata Bali',
    3 => 'Kunjungan Industri, Budaya & Pantai Bali',
    4 => 'Bali → Perjalanan Pulang ke Semarang',
    5 => 'Tiba Kembali di Kampus Tercinta UPGRIS'
];

require __DIR__ . "/partials/header.php";
?>
<!-- Hero Section -->
<section class="hero">
  <div class="container hero-content">
    <span class="eyebrow">18—22 AGUSTUS 2026 • BALI</span>
    <h1>Satu Perjalanan.<br><em>Seribu Kenangan.</em></h1>
    <p>Portal resmi dokumentasi Kuliah Kerja Lapangan (KKL) Program Studi Informatika Universitas PGRI Semarang 2026.</p>
    
    <div class="hero-actions">
      <a class="btn btn-primary" href="#timeline">Jelajahi Itinerary</a>
      <a class="btn btn-ghost" href="#galeri">Lihat Dokumentasi</a>
    </div>

    <!-- Live Countdown Timer Widget -->
    <div class="hero-countdown">
      <span class="countdown-title">✨ Jejak Kenangan Terukir Bersama</span>
      <div class="countdown-grid">
        <div class="countdown-item">
          <span class="countdown-num" id="cdDays">00</span>
          <span class="countdown-lbl">Hari</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-item">
          <span class="countdown-num" id="cdHours">00</span>
          <span class="countdown-lbl">Jam</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-item">
          <span class="countdown-num" id="cdMinutes">00</span>
          <span class="countdown-lbl">Menit</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-item">
          <span class="countdown-num" id="cdSeconds">00</span>
          <span class="countdown-lbl">Detik</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Tentang Section & Stats -->
<section id="tentang" class="section">
  <div class="container two-col">
    <div>
      <span class="eyebrow">TENTANG PERJALANAN</span>
      <h2>Belajar di luar kelas, tumbuh bersama.</h2>
    </div>
    <div>
      <p>Website ini menjadi ruang digital untuk menyimpan cerita, dokumentasi visual, video, dan kesan mendalam dari seluruh rangkaian perjalanan KKL Informatika UPGRIS 2026.</p>
      <p class="muted">Perjalanan memadukan kunjungan industri teknologi informasi, eksplorasi kebudayaan nusantara di Pulau Dewata, serta kebersamaan mahasiswa.</p>
    </div>
  </div>

  <!-- Key Metrics Strip -->
  <div class="container">
    <div class="stats-strip">
      <div class="stat-box">
        <span class="stat-num">5</span>
        <span class="stat-lbl">Hari Penjelajahan</span>
      </div>
      <div class="stat-box">
        <span class="stat-num"><?= count($destinations) ?></span>
        <span class="stat-lbl">Titik Agenda Terjadwal</span>
      </div>
      <div class="stat-box">
        <span class="stat-num"><?= count($profiles) ?></span>
        <span class="stat-lbl">Mahasiswa Tim Pengembang</span>
      </div>
      <div class="stat-box">
        <span class="stat-num">1000+</span>
        <span class="stat-lbl">Momen Kenangan Indah</span>
      </div>
    </div>
  </div>
</section>

<!-- Itinerary Section -->
<section id="timeline" class="section section-soft">
  <div class="container">
    <span class="eyebrow">ITINERARY PERJALANAN</span>
    <h2>Jejak Langkah KKL</h2>
    <p class="section-intro">Susunan lengkap rencana perjalanan dari pemberangkatan di Semarang hingga kepulangan ke kampus UPGRIS. Gunakan filter tab hari atau kotak pencarian untuk mencari agenda.</p>

    <!-- Interactive Toolbar: Day Switcher Tabs & Live Search -->
    <div class="itinerary-toolbar">
      <div class="day-tabs">
        <button type="button" class="day-tab-btn active" data-day="all">Semua Hari <small><?= count($destinations) ?></small></button>
        <?php foreach ($itineraryByDay as $dayNo => $items): ?>
          <button type="button" class="day-tab-btn" data-day="<?= $dayNo ?>">Hari <?= $dayNo ?> <small><?= count($items) ?></small></button>
        <?php endforeach; ?>
      </div>

      <div class="search-box-wrap">
        <span class="search-icon">🔍</span>
        <input type="text" id="itinerarySearch" placeholder="Cari kegiatan (Pantai, Joger, Makan)..." autocomplete="off">
      </div>
    </div>

    <!-- Search Status Alert -->
    <div id="searchStatus" class="search-status"></div>

    <!-- Day Cards Grid -->
    <div class="itinerary-grid">
      <?php foreach ($itineraryByDay as $dayNo => $items): 
          $firstDate = $items[0]['visit_date'] ?? '';
          $dateLabel = formatTanggalIndo($firstDate);
          $routeTitle = $dayRoutes[$dayNo] ?? ('Perjalanan Hari ke-' . $dayNo);
      ?>
        <article class="itinerary-day-card" data-day="<?= $dayNo ?>" id="hari-<?= $dayNo ?>">
          <div class="itinerary-day-header">
            <span class="day-badge">HARI <?= $dayNo ?> • <?= strtoupper(e($dateLabel)) ?></span>
            <h3><?= e($routeTitle) ?></h3>
          </div>
          <div class="itinerary-schedule">
            <?php foreach ($items as $item): 
                $timeText = cleanTimeBadge($item['description']);
                $showRoute = !empty($item['route']) && strtolower(trim($item['route'])) !== strtolower(trim($item['name']));
                $cat = getActivityCategory($item['name'], $item['route'] ?? '');
            ?>
              <div class="schedule-item">
                <div class="schedule-time">
                  <span class="schedule-time-badge"><?= e($timeText) ?></span>
                </div>
                <div class="schedule-content">
                  <span class="cat-pill cat-<?= $cat['type'] ?>"><?= $cat['icon'] ?> <?= e($cat['label']) ?></span>
                  <h4><?= e($item['name']) ?></h4>
                  <?php if ($showRoute): ?>
                    <p><?= e($item['route']) ?></p>
                  <?php endif; ?>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- Profil Pembuat Section -->
<section id="profil" class="section">
<div class="container">
  <span class="eyebrow">THE CREW</span>
  <h2>11 pembuat cerita</h2>
  <p class="section-intro">Profil pengembang dan kru di balik dokumentasi digital KKL Informatika UPGRIS 2026.</p>
  <div class="profile-grid">
    <?php foreach ($profiles as $profile): 
        $photoPath = (!empty($profile['photo']) && file_exists(__DIR__ . '/' . $profile['photo']))
            ? $profile['photo']
            : 'assets/img/profile-placeholder.svg';
    ?>
      <article class="profile-card">
        <img src="<?= e($photoPath) ?>" alt="<?= e($profile['name']) ?>" loading="lazy">
        <div class="profile-info">
          <h3><?= e($profile['name']) ?></h3>
          <p><?= e($profile['role']) ?></p>
          <small><?= e($profile['bio']) ?></small>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
</div>
</section>

<!-- Galeri Dokumentasi Section -->
<section id="galeri" class="section section-soft">
<div class="container">
  <span class="eyebrow">DESTINASI & VISUAL JOURNAL</span>
  <h2>Dokumentasi tiap perjalanan</h2>
  
  <?php
  $hasDestinationPhotos = false;
  $assignedPhotoIds = [];

  // Display photos grouped by destinations that actually have photos
  foreach ($destinations as $destination):
      $destPhotos = array_filter($gallery, function($item) use ($destination) {
          return (int)($item['destination_id'] ?? 0) === (int)$destination['id'];
      });
      if (empty($destPhotos)) continue;
      $hasDestinationPhotos = true;
      foreach ($destPhotos as $dp) {
          $assignedPhotoIds[$dp['id']] = true;
      }
  ?>
    <div class="destination-block">
      <h3><?= e($destination["name"]) ?></h3>
      <?php if (!empty($destination["description"])): ?><p><?= e($destination["description"]) ?></p><?php endif; ?>
      <div class="gallery-grid">
        <?php foreach ($destPhotos as $item): 
            $gPhoto = (!empty($item['photo']) && file_exists(__DIR__ . '/' . $item['photo'])) ? $item['photo'] : 'assets/img/profile-placeholder.svg';
        ?>
          <figure class="gallery-card">
            <img src="<?= e($gPhoto) ?>" alt="<?= e($item['title']) ?>" loading="lazy">
            <figcaption>
              <strong><?= e($item['title']) ?></strong>
              <span><?= e($item['location']) ?></span>
            </figcaption>
          </figure>
        <?php endforeach; ?>
      </div>
    </div>
  <?php endforeach; ?>

  <?php
  // Photos not assigned to any displayed destination
  $otherPhotos = array_filter($gallery, function($item) use ($assignedPhotoIds) {
      return !isset($assignedPhotoIds[$item['id']]);
  });
  ?>

  <?php if (!empty($otherPhotos)): ?>
    <?php if ($hasDestinationPhotos): ?>
      <div class="destination-block">
        <h3>Dokumentasi Lainnya</h3>
      </div>
    <?php endif; ?>
    <div class="gallery-grid">
      <?php foreach ($otherPhotos as $item): 
          $gPhoto = (!empty($item['photo']) && file_exists(__DIR__ . '/' . $item['photo'])) ? $item['photo'] : 'assets/img/profile-placeholder.svg';
      ?>
        <figure class="gallery-card">
          <img src="<?= e($gPhoto) ?>" alt="<?= e($item['title']) ?>" loading="lazy">
          <figcaption>
            <strong><?= e($item['title']) ?></strong>
            <span><?= e($item['location']) ?></span>
          </figcaption>
        </figure>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <?php if (empty($gallery)): ?>
    <div class="empty">Belum ada dokumentasi foto. Tambahkan melalui admin dashboard.</div>
  <?php endif; ?>
</div>
</section>

<!-- Video Kenangan Section -->
<section class="section">
<div class="container">
  <span class="eyebrow">VIDEO KENANGAN</span>
  <h2>Video kenangan perjalanan</h2>
  <div class="video-grid">
    <?php foreach ($videos as $video): ?>
      <div class="video-card">
        <iframe src="<?= e($video['embed_url']) ?>" title="<?= e($video['title']) ?>" allowfullscreen loading="lazy"></iframe>
        <h3><?= e($video['title']) ?></h3>
      </div>
    <?php endforeach; ?>
    <?php if (!$videos): ?>
      <div class="empty">Belum ada video YouTube. Tambahkan melalui admin dashboard.</div>
    <?php endif; ?>
  </div>
</div>
</section>

<!-- Feedback Form & Testimonials -->
<section id="feedback" class="section section-soft">
<div class="container feedback-layout">
  <div>
    <span class="eyebrow">SHARE YOUR STORY</span>
    <h2>Bagaimana perjalananmu?</h2>
    <p>Tuliskan kesan, pesan, pengalaman seru, atau momen favoritmu selama kegiatan KKL berlangsung.</p>
  </div>
  <form class="feedback-form" action="submit_feedback.php" method="post">
    <?= csrf_field() ?>
    <div style="display:none;" aria-hidden="true">
      <input type="text" name="user_honeypot" tabindex="-1" autocomplete="off">
    </div>
    <label>Nama Lengkap<input name="name" required maxlength="100" placeholder="Nama kamu"></label>
    <label>Rating Pengalaman<select name="rating" required>
      <option value="">Pilih rating</option>
      <option value="5">★★★★★ — Sangat Berkesan</option>
      <option value="4">★★★★☆ — Berkesan</option>
      <option value="3">★★★☆☆ — Cukup Menyenangkan</option>
      <option value="2">★★☆☆☆ — Kurang</option>
      <option value="1">★☆☆☆☆ — Perlu Peningkatan</option>
    </select></label>
    <label>Cerita / Feedback<textarea name="message" required maxlength="1000" rows="5" placeholder="Ceritakan pengalamanmu..."></textarea></label>
    <button class="btn btn-primary" type="submit">Kirim Feedback</button>
  </form>
</div>
<div class="container feedback-list">
  <h3>Suara dari perjalanan</h3>
  <?php foreach ($feedbacks as $fb): ?>
    <div class="feedback-card">
      <div><strong><?= e($fb['name']) ?></strong><span class="stars"><?= str_repeat("★", (int)$fb['rating']) . str_repeat("☆", 5-(int)$fb['rating']) ?></span></div>
      <p><?= nl2br(e($fb['message'])) ?></p>
    </div>
  <?php endforeach; ?>
  <?php if (!$feedbacks): ?><p class="muted">Belum ada feedback yang disetujui.</p><?php endif; ?>
</div>
</section>

<!-- Lightbox Modal for Gallery Images -->
<div id="galleryLightbox" class="lightbox-modal">
  <div class="lightbox-content">
    <button type="button" id="lightboxClose" class="lightbox-close" aria-label="Tutup">✕</button>
    <img id="lightboxImg" src="" alt="Preview">
    <div class="lightbox-meta">
      <h4 id="lightboxTitle"></h4>
      <span id="lightboxLoc"></span>
    </div>
  </div>
</div>

<!-- Back to Top Floating Button -->
<button type="button" id="backToTop" class="back-to-top" title="Kembali ke atas">↑</button>

<?php require __DIR__ . "/partials/footer.php"; ?>

