document.addEventListener("DOMContentLoaded", function () {

    const toggles = document.querySelectorAll(".toggle");

    toggles.forEach(function (toggle) {

        const wrapper = toggle.closest(".has-sub");

        // guard: skip if the expected wrapper/submenu isn't in the HTML
        if (!wrapper) return;

        const subMenu = wrapper.querySelector(".sub-menu");

        if (!subMenu) return;

        // Hide submenu initially
        subMenu.style.display = "none";
        toggle.textContent = "+";

        toggle.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (subMenu.style.display === "none") {
                subMenu.style.display = "block";
                toggle.textContent = "−";
            } else {
                subMenu.style.display = "none";
                toggle.textContent = "+";
            }
        });

    });

    // Click outside any open submenu closes it (helps on mobile)
    document.addEventListener("click", function (e) {

        document.querySelectorAll(".sub-menu").forEach(function (subMenu) {

            if (subMenu.style.display === "block" && !subMenu.closest(".has-sub").contains(e.target)) {
                subMenu.style.display = "none";

                const relatedToggle = subMenu.closest(".has-sub").querySelector(".toggle");
                if (relatedToggle) relatedToggle.textContent = "+";
            }

        });

    });

});

/** for the image moving */
const slides = document.querySelectorAll(".slide");
let current = 0;
let autoSlideTimer = null;

function showSlide(index){
    if (!slides.length) return;
    slides[current].classList.remove("active");
    current = index;
    slides[current].classList.add("active");
}

// Auto slide
function nextSlide(){
    showSlide((current + 1) % slides.length);
}

function previousSlide(){
    showSlide((current - 1 + slides.length) % slides.length);
}

function goToSlide(index){
    showSlide(index % slides.length);
}

// Expose slide controls for inline onclick="" handlers in HTML
window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.goToSlide = goToSlide;

function startAutoSlide(){
    stopAutoSlide();
    if (slides.length > 1) {
        autoSlideTimer = setInterval(nextSlide, 3000);
    }
}

function stopAutoSlide(){
    if (autoSlideTimer) {
        clearInterval(autoSlideTimer);
        autoSlideTimer = null;
    }
}

startAutoSlide();

// Swipe control
const sliderEl = document.querySelector(".slider");
let startX = 0;

if (sliderEl) {

    sliderEl.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
        stopAutoSlide(); // pause auto-advance while the user is interacting
    });

    sliderEl.addEventListener("touchend", e => {
        let endX = e.changedTouches[0].clientX;

        if(startX > endX + 50){
            // swipe left → next image
            nextSlide();
        }
        else if(startX < endX - 50){
            // swipe right → previous image
            showSlide((current - 1 + slides.length) % slides.length);
        }

        startAutoSlide(); // resume auto-advance after the swipe finishes
    });

}

/** catagory  */
// ================= SEARCH =================

const searchInput = document.querySelector(".search-bar input");
const tiles = document.querySelectorAll(".tile");

if (searchInput) {
    searchInput.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        tiles.forEach(tile => {

            const text = tile.innerText.toLowerCase();

            if (text.includes(value)) {
                tile.classList.remove("hide");
            } else {
                tile.classList.add("hide");
            }

        });

    });
}

// ================= BOTTOM TAB ACTIVE =================

const tabLinks = document.querySelectorAll(".tab-bar a, .main-nav a");

tabLinks.forEach(link => {

    link.addEventListener("click", function () {

        tabLinks.forEach(item => item.classList.remove("active"));

        this.classList.add("active");

    });

});

// ================= TILE HOVER EFFECT =================

tiles.forEach(tile => {

    tile.addEventListener("mouseenter", () => {
        tile.style.transform = "translateY(-8px) scale(1.03)";
    });

    tile.addEventListener("mouseleave", () => {
        tile.style.transform = "translateY(0) scale(1)";
    });

});

// ================= SMOOTH PAGE LOAD =================

document.body.style.opacity = "0";

window.addEventListener("load", () => {

    document.body.style.transition = "opacity 0.5s ease";
    document.body.style.opacity = "1";

});

/** cart  */
document.querySelectorAll(".qty").forEach(qty => {

    // Prefer explicit classes if present in the HTML...
    let minus = qty.querySelector(".minus");
    let plus = qty.querySelector(".plus");
    let count = qty.querySelector(".count") || qty.querySelector("span");

    // ...fall back to plain button order (matches the .qty button / .qty span CSS)
    // so this still works even without .minus/.plus/.count classes in the markup.
    if (!minus || !plus) {
        const buttons = qty.querySelectorAll("button");
        minus = minus || buttons[0];
        plus = plus || buttons[1];
    }

    if (!minus || !plus || !count) return; // guard: skip malformed markup

    plus.onclick = function () {
        count.innerText = parseInt(count.innerText) + 1;
    };

    minus.onclick = function () {

        let value = parseInt(count.innerText);

        if (value > 1) {
            count.innerText = value - 1;
        }

    };

});

document.querySelectorAll(".remove").forEach(btn => {

    btn.onclick = function () {
        this.parentElement.remove();
    };

});
