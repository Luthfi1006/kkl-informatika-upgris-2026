// KKL Informatika UPGRIS 2026 - Main Interactive Controller
(function() {
    function init() {
        // 1. Feedback sent alert
        const params = new URLSearchParams(window.location.search);
        if (params.get("sent")) {
            alert("Terima kasih! Feedback Anda telah berhasil dikirim dan menunggu persetujuan admin.");
        }

        // 2. Count-up Timer: Jejak Kenangan Terukir (Sejak 18 Agustus 2026 06:00 WIB)
        const startDate = new Date("2026-08-18T06:00:00+07:00").getTime();
        const cdDays = document.getElementById("cdDays");
        const cdHours = document.getElementById("cdHours");
        const cdMinutes = document.getElementById("cdMinutes");
        const cdSeconds = document.getElementById("cdSeconds");

        if (cdDays && cdHours && cdMinutes && cdSeconds) {
            function updateMemoryCounter() {
                const now = new Date().getTime();
                const diff = now - startDate;

                if (diff >= 0) {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    cdDays.textContent = String(days).padStart(2, "0");
                    cdHours.textContent = String(hours).padStart(2, "0");
                    cdMinutes.textContent = String(minutes).padStart(2, "0");
                    cdSeconds.textContent = String(seconds).padStart(2, "0");
                } else {
                    const absDiff = Math.abs(diff);
                    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

                    cdDays.textContent = String(days).padStart(2, "0");
                    cdHours.textContent = String(hours).padStart(2, "0");
                    cdMinutes.textContent = String(minutes).padStart(2, "0");
                    cdSeconds.textContent = String(seconds).padStart(2, "0");
                }
            }
            updateMemoryCounter();
            setInterval(updateMemoryCounter, 1000);
        }

        // 3. Day Switcher Tabs & Live Search
        const tabButtons = document.querySelectorAll(".day-tab-btn");
        const dayCards = document.querySelectorAll(".itinerary-day-card");
        const searchInput = document.getElementById("itinerarySearch");
        const searchStatus = document.getElementById("searchStatus");

        let currentDay = "all";

        function updateScheduleView() {
            const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
            let matchCount = 0;

            dayCards.forEach(card => {
                const cardDay = card.getAttribute("data-day");
                const items = card.querySelectorAll(".schedule-item");
                let cardHasMatches = 0;

                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    const isMatch = (query === "" || text.includes(query));

                    if (isMatch) {
                        item.style.display = "";
                        cardHasMatches++;
                        matchCount++;
                    } else {
                        item.style.display = "none";
                    }
                });

                if (query !== "") {
                    card.style.display = cardHasMatches > 0 ? "" : "none";
                } else {
                    card.style.display = (currentDay === "all" || cardDay === currentDay) ? "" : "none";
                }
            });

            if (searchStatus) {
                if (query !== "") {
                    searchStatus.style.display = "block";
                    searchStatus.textContent = matchCount > 0 
                        ? `Ditemukan ${matchCount} agenda untuk pencarian "${searchInput.value}"` 
                        : `Tidak ditemukan agenda untuk pencarian "${searchInput.value}"`;
                } else {
                    searchStatus.style.display = "none";
                }
            }
        }

        tabButtons.forEach(btn => {
            btn.addEventListener("click", function(e) {
                e.preventDefault();
                tabButtons.forEach(b => b.classList.remove("active"));
                this.classList.add("active");

                currentDay = this.getAttribute("data-day") || "all";

                if (searchInput && searchInput.value !== "") {
                    searchInput.value = "";
                }

                updateScheduleView();
            });
        });

        if (searchInput) {
            searchInput.addEventListener("input", updateScheduleView);
            searchInput.addEventListener("keyup", updateScheduleView);
            searchInput.addEventListener("search", updateScheduleView);
        }

        // 4. Lightbox Gallery Modal
        const lightbox = document.getElementById("galleryLightbox");
        const lightboxImg = document.getElementById("lightboxImg");
        const lightboxTitle = document.getElementById("lightboxTitle");
        const lightboxLoc = document.getElementById("lightboxLoc");
        const lightboxClose = document.getElementById("lightboxClose");

        if (lightbox && lightboxImg) {
            document.querySelectorAll(".gallery-card").forEach(card => {
                card.addEventListener("click", () => {
                    const img = card.querySelector("img");
                    const title = card.querySelector("strong")?.textContent || "";
                    const loc = card.querySelector("span")?.textContent || "";

                    if (img && img.src) {
                        lightboxImg.src = img.src;
                        if (lightboxTitle) lightboxTitle.textContent = title;
                        if (lightboxLoc) lightboxLoc.textContent = loc;
                        lightbox.classList.add("active");
                    }
                });
            });

            const closeLightbox = () => {
                lightbox.classList.remove("active");
            };

            if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
            lightbox.addEventListener("click", (e) => {
                if (e.target === lightbox) closeLightbox();
            });
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && lightbox.classList.contains("active")) {
                    closeLightbox();
                }
            });
        }

        // 5. Back to Top Button
        const backToTopBtn = document.getElementById("backToTop");
        if (backToTopBtn) {
            window.addEventListener("scroll", () => {
                if (window.scrollY > 350) {
                    backToTopBtn.classList.add("show");
                } else {
                    backToTopBtn.classList.remove("show");
                }
            });

            backToTopBtn.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
