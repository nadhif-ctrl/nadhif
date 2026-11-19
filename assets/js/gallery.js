/*
 * Galeri Pagani - lightbox sederhana (tanpa plugin tambahan)
 * Fitur: klik foto untuk memperbesar, tombol sebelumnya/berikutnya,
 * keyboard (← → Esc), geser (swipe) di HP, klik latar untuk menutup.
 */
(function () {
    "use strict";

    var cards = Array.prototype.slice.call(
        document.querySelectorAll(".gallery_area .single_gallery")
    );
    if (!cards.length) return;

    // Kumpulkan data foto dari HTML
    var photos = cards.map(function (card) {
        var link = card.querySelector(".gallery_link");
        var img = card.querySelector("img");
        return {
            src: link.getAttribute("href"),
            caption: link.getAttribute("data-caption") || "",
            alt: img.getAttribute("alt") || ""
        };
    });

    // Buat elemen lightbox
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Penampil foto galeri");
    box.innerHTML =
        '<button type="button" class="lightbox_btn lightbox_close" aria-label="Tutup"><i class="lni lni-close"></i></button>' +
        '<button type="button" class="lightbox_btn lightbox_prev" aria-label="Foto sebelumnya"><i class="lni lni-chevron-left"></i></button>' +
        '<figure class="lightbox_figure">' +
        '<img class="lightbox_img" src="" alt="">' +
        '<figcaption class="lightbox_info"><span class="lightbox_caption"></span><span class="lightbox_count"></span></figcaption>' +
        '</figure>' +
        '<button type="button" class="lightbox_btn lightbox_next" aria-label="Foto berikutnya"><i class="lni lni-chevron-right"></i></button>';
    document.body.appendChild(box);

    var imgEl = box.querySelector(".lightbox_img");
    var capEl = box.querySelector(".lightbox_caption");
    var countEl = box.querySelector(".lightbox_count");
    var btnClose = box.querySelector(".lightbox_close");
    var btnPrev = box.querySelector(".lightbox_prev");
    var btnNext = box.querySelector(".lightbox_next");

    var current = 0;
    var lastFocus = null;

    function preload(i) {
        var n = (i + photos.length) % photos.length;
        var tmp = new Image();
        tmp.src = photos[n].src;
    }

    function show(index) {
        current = (index + photos.length) % photos.length;
        var p = photos[current];

        imgEl.classList.add("loading");
        imgEl.onload = function () { imgEl.classList.remove("loading"); };
        imgEl.src = p.src;
        imgEl.alt = p.alt;
        capEl.textContent = p.caption;
        countEl.textContent = (current + 1) + " / " + photos.length;

        preload(current + 1);
        preload(current - 1);
    }

    function open(index) {
        lastFocus = document.activeElement;
        show(index);
        box.classList.add("show");
        document.body.classList.add("lightbox-open");
        btnClose.focus();
    }

    function close() {
        box.classList.remove("show");
        document.body.classList.remove("lightbox-open");
        imgEl.removeAttribute("src");
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function isOpen() {
        return box.classList.contains("show");
    }

    // Klik kartu (atau tombol zoom) -> buka lightbox
    cards.forEach(function (card, i) {
        card.addEventListener("click", function (e) {
            e.preventDefault();
            open(i);
        });
    });

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () { show(current - 1); });
    btnNext.addEventListener("click", function () { show(current + 1); });

    // Klik area gelap di luar foto untuk menutup
    box.addEventListener("click", function (e) {
        if (e.target === box) close();
    });

    // Keyboard
    document.addEventListener("keydown", function (e) {
        if (!isOpen()) return;
        if (e.key === "Escape") {
            close();
        } else if (e.key === "ArrowLeft") {
            show(current - 1);
        } else if (e.key === "ArrowRight") {
            show(current + 1);
        } else if (e.key === "Tab") {
            // Jaga fokus tetap di dalam lightbox
            var f = [btnClose, btnPrev, btnNext];
            var idx = f.indexOf(document.activeElement);
            e.preventDefault();
            if (e.shiftKey) {
                f[(idx <= 0 ? f.length : idx) - 1].focus();
            } else {
                f[(idx + 1) % f.length].focus();
            }
        }
    });

    // Swipe di layar sentuh
    var startX = null;
    box.addEventListener("touchstart", function (e) {
        startX = e.changedTouches[0].clientX;
    }, { passive: true });
    box.addEventListener("touchend", function (e) {
        if (startX === null) return;
        var diff = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(diff) < 50) return;
        show(diff > 0 ? current - 1 : current + 1);
    }, { passive: true });
})();
