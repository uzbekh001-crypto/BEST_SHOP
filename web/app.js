const tg = window.Telegram?.WebApp;

// ⚠️ ngrok HTTPS havolangiz
const API_URL = "https://cauterize-maritime-showroom.ngrok-free.dev"; 

if (tg) {
    tg.ready();
    tg.expand();
}

// 1. Backend bilan bog'lanish va foydalanuvchini autentifikatsiya qilish
async function initApp() {
    const initData = tg?.initData;

    if (initData) {
        try {
            const response = await fetch(`${API_URL}/api/auth`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Init-Data": initData
                }
            });

            if (response.ok) {
                const data = await response.json();
                renderUserData(data.user);
            } else {
                renderFallbackUser();
            }
        } catch (error) {
            console.error("Backend serverga bog'lanib bo'lmadi:", error);
            renderFallbackUser();
        }
    } else {
        renderFallbackUser();
    }

    // Mahsulotlarni bazadan olib kelish
    loadProducts();
}

// User ma'lumotlarini ekranga chiqarish
function renderUserData(dbUser) {
    const greeting = document.getElementById("greeting");
    if (greeting) greeting.textContent = `Salom, ${dbUser.first_name || "Foydalanuvchi"} 👋`;

    const profileName = document.getElementById("profile-name");
    if (profileName) profileName.textContent = dbUser.first_name || "Foydalanuvchi";

    const profileUsername = document.getElementById("profile-username");
    if (profileUsername) {
        profileUsername.textContent = dbUser.username ? `@${dbUser.username}` : "Username mavjud emas";
    }

    const profileId = document.getElementById("profile-id");
    if (profileId) {
        profileId.textContent = `ID: ${dbUser.telegram_id} | Balans: ${dbUser.balance || 0} so'm`;
    }

    const telegramUser = tg?.initDataUnsafe?.user;
    if (telegramUser?.photo_url) {
        const avatar = document.getElementById("avatar");
        if (avatar) avatar.innerHTML = `<img src="${telegramUser.photo_url}" alt="avatar">`;

        const headerAvatar = document.getElementById("header-avatar");
        if (headerAvatar) headerAvatar.innerHTML = `<img src="${telegramUser.photo_url}" alt="avatar">`;
    }
}

function renderFallbackUser() {
    const user = tg?.initDataUnsafe?.user;
    const firstName = user?.first_name || "Mehmon";

    const greeting = document.getElementById("greeting");
    if (greeting) greeting.textContent = `Salom, ${firstName} 👋`;

    const profileName = document.getElementById("profile-name");
    if (profileName) profileName.textContent = firstName;

    const profileUsername = document.getElementById("profile-username");
    if (profileUsername) profileUsername.textContent = user?.username ? `@${user.username}` : "@demo_user";

    const profileId = document.getElementById("profile-id");
    if (profileId) profileId.textContent = `Telegram ID: ${user?.id || "12345678"}`;
}

// 2. Mahsulotlarni yuklash (Dizaynni buzmasdan)
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
            const data = await response.json();
            console.log("Bazadagi mahsulotlar:", data);
        }
    } catch (error) {
        console.error("Mahsulotlarni olishda xatolik:", error);
    }
}

// 3. Sahifalar o'rtasida o'tish (Page Navigation Logic)
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

function openPage(pageId) {
    pages.forEach(page => {
        if (page.id === pageId) {
            page.classList.add("active");
            page.style.display = "block";
        } else {
            page.classList.remove("active");
            page.style.display = "none";
        }
    });

    navButtons.forEach(button => {
        if (button.dataset.page === pageId) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });

    if (tg?.BackButton) {
        if (pageId === "home") {
            tg.BackButton.hide();
        } else {
            tg.BackButton.show();
        }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Navigatsiya tugmalariga hodisa biriktirish
navButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        const page = button.dataset.page;
        if (page) openPage(page);
    });
});

// Xizmatlar tugmalariga hodisa biriktirish
const actionButtons = document.querySelectorAll("[data-action]");
actionButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        const action = button.dataset.action;
        if (action === "premium") return openPage("premium");
        if (action === "games") return openPage("games");
        if (action === "stars") {
            return showComingSoon("⭐ Telegram Stars", "Stars xarid qilish oynasi tez orada ishga tushadi.");
        }
        if (action === "gifts") {
            return showComingSoon("🎁 Telegram Gifts", "Gift xarid qilish oynasi tez orada ishga tushadi.");
        }
    });
});

// Orqaga qaytish tugmalari
const backButtons = document.querySelectorAll(".back-button");
backButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        const page = button.dataset.page;
        if (page) openPage(page);
    });
});

// Telegram Native Back Button Handler
if (tg?.BackButton) {
    tg.BackButton.onClick(() => {
        openPage("home");
    });
}

// Ogohlantirish oynasi
function showComingSoon(title, message) {
    if (tg?.showAlert) {
        tg.showAlert(`${title}\n\n${message}`);
    } else {
        alert(`${title}\n\n${message}`);
    }
}

// Ilovani ishga tushirish va Bosh sahifani ko'rsatish
document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.style.colorScheme = "dark";
    openPage("home");
    initApp();
});