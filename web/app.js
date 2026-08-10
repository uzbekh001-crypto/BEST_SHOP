const tg = window.Telegram?.WebApp;

// ⚠️ BU YERGA tunnel bergan HTTPS linkni qo'yasan (oxirida slasx "/" bo'lmasin)
const API_URL = "https://cauterize-maritime-showroom.ngrok-free.dev"; 

if (tg) {
    tg.ready();
    tg.expand();
}

// 1. Backend bilan bog'lanish va foydalanuvchini autentifikatsiya qilish
async function initApp() {
    const initData = tg?.initData;

    // Telegram ichida ochilgan bo'lsa, backendga xavfsiz so'rov yuboramiz
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
                console.warn("Backend auth xatosi, mahalliy ma'lumotlar ishlatilmoqda.");
                renderFallbackUser();
            }
        } catch (error) {
            console.error("Backend serverga bog'lanib bo'lmadi:", error);
            renderFallbackUser();
        }
    } else {
        // Brauzerda test qilganda
        renderFallbackUser();
    }

    // Mahsulotlarni bazadan yuklab olish
    loadProducts();
}

// User ma'lumotlarini ekranga chiqarish (Backend orqali)
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

// Telegram tashqarisida (Brauzerda) test qilish uchun
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

// 2. Mahsulot va Xizmatlarni backend serverdan yuklash va ekranga chiqarish
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
            const data = await response.json();
            const products = data.products || data; // backend javob strukturasiga moslash
            renderProducts(products);
        }
    } catch (error) {
        console.error("Mahsulotlarni olishda xatolik:", error);
    }
}

// Mahsulotlarni HTML ga joylash
function renderProducts(products) {
    const container = document.getElementById("products-list") || document.getElementById("services-grid");
    
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px;'>Hozircha mahsulotlar mavjud emas.</p>";
        return;
    }

    container.innerHTML = products.map(item => `
        <div class="card" onclick="buyProduct(${item.id})">
            <div class="card-title">${item.title || item.name}</div>
            <div class="card-price">${item.price} so'm</div>
            <button class="buy-btn">Sotib olish</button>
        </div>
    `).join('');
}

// Sotib olish harakatini boshqarish
async function buyProduct(productId) {
    if (tg?.showConfirm) {
        tg.showConfirm("Ushbu mahsulotni sotib olishni tasdiqlaysizmi?", async (confirmed) => {
            if (confirmed) {
                showComingSoon("Xarid", "Xarid so'rovi yuborildi!");
            }
        });
    } else {
        showComingSoon("Xarid", "Xarid so'rovi yuborildi!");
    }
}

// Page Navigation Logic
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

function openPage(pageId) {
    pages.forEach(page => {
        page.classList.toggle("active", page.id === pageId);
    });

    navButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.page === pageId);
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

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const page = button.dataset.page;
        if (page) openPage(page);
    });
});

// Service Actions Handler
const actionButtons = document.querySelectorAll("[data-action]");
actionButtons.forEach(button => {
    button.addEventListener("click", () => {
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

// Back Buttons
const backButtons = document.querySelectorAll(".back-button");
backButtons.forEach(button => {
    button.addEventListener("click", () => {
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

// Temporary Alert Helper
function showComingSoon(title, message) {
    if (tg?.showAlert) {
        tg.showAlert(`${title}\n\n${message}`);
    } else {
        alert(`${title}\n\n${message}`);
    }
}

// Initializing Theme and View
document.documentElement.style.colorScheme = "dark";
openPage("home");
initApp();