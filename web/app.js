const tg = window.Telegram?.WebApp;

// ⚠️ ngrok HTTPS havolangiz
const API_URL = "https://cauterize-maritime-showroom.ngrok-free.dev";

let cachedProducts = [];
let navigationHistory = ["home"];

if (tg) {
    tg.ready();
    tg.expand();
}

// 1. App va Autentifikatsiya
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

    // Mahsulotlarni bazadan olib kelish va ekranga chizish
    await loadProducts();
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
        profileId.textContent = `ID: ${dbUser.telegram_id} | Balans: ${dbUser.balance ? dbUser.balance.toLocaleString('uz-UZ') : 0} so'm`;
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

// 2. Mahsulotlarni bazadan yuklash va dinamik chizish
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
            const data = await response.json();
            cachedProducts = data.products || [];
            renderProductsToUI(cachedProducts);
        }
    } catch (error) {
        console.error("Mahsulotlarni olishda xatolik:", error);
    }
}

// Mahsulotlarni sahifalarga joylashtirish
function renderProductsToUI(products) {
    // 1. Premium mahsulotlarini render qilish
    const premiumContainer = document.getElementById("premium-options-list");
    if (premiumContainer) {
        const premiumProducts = products.filter(p => p.category === "premium");
        if (premiumProducts.length > 0) {
            premiumContainer.innerHTML = premiumProducts.map(prod => `
                <button class="premium-plan ${prod.title.includes('12') ? 'popular' : ''}" onclick="selectProduct(${prod.id})">
                    ${prod.title.includes('12') ? '<div class="popular-badge">ENG MASHHUR</div>' : ''}
                    <div class="plan-icon">💎</div>
                    <div class="plan-info">
                        <h3>${prod.title}</h3>
                        <p>${prod.description || 'Rasmiy obuna'}</p>
                    </div>
                    <div class="plan-price">
                        <span>Narx</span>
                        <strong>${prod.price.toLocaleString('uz-UZ')} so'm</strong>
                    </div>
                </button>
            `).join('');
        }
    }

    // 2. O'yinlar (Games) mahsulotlarini render qilish
    const gamesContainer = document.getElementById("games-options-list");
    if (gamesContainer) {
        const gameProducts = products.filter(p => p.category === "games");
        if (gameProducts.length > 0) {
            gamesContainer.innerHTML = gameProducts.map(prod => `
                <button class="game-card" onclick="selectProduct(${prod.id})">
                    <div class="game-icon">🎮</div>
                    <div class="game-info">
                        <h3>${prod.title}</h3>
                        <p>${prod.description} — <strong>${prod.price.toLocaleString('uz-UZ')} so'm</strong></p>
                    </div>
                    <span class="list-arrow">→</span>
                </button>
            `).join('');
        }
    }
}

// Mahsulot bosilganda modal yoki xarid oynasini chiqarish
function selectProduct(productId) {
    const product = cachedProducts.find(p => p.id === productId);
    if (!product) return;

    if (tg?.showConfirm) {
        tg.showConfirm(
            `🛒 ${product.title}\n💰 Narxi: ${product.price.toLocaleString('uz-UZ')} so'm\n\nXaridni tasdiqlaysizmi?`,
            (confirmed) => {
                if (confirmed) {
                    processOrder(product);
                }
            }
        );
    } else {
        if (confirm(`🛒 ${product.title}\n💰 Narxi: ${product.price.toLocaleString('uz-UZ')} so'm\n\nXaridni tasdiqlaysizmi?`)) {
            processOrder(product);
        }
    }
}

function processOrder(product) {
    if (tg?.showAlert) {
        tg.showAlert(`✅ Buyurtmangiz qabul qilindi!\n\n${product.title} tez orada yetkazib beriladi.`);
    } else {
        alert(`✅ Buyurtmangiz qabul qilindi!\n\n${product.title} tez orada yetkazib beriladi.`);
    }
}

// 3. Sahifalar o'rtasida o'tish va Navigatsiya mantiqi
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

function openPage(pageId, pushToHistory = true) {
    const currentPage = navigationHistory[navigationHistory.length - 1];
    
    if (pushToHistory && currentPage !== pageId) {
        navigationHistory.push(pageId);
    }

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

    // Native Telegram Back Button boshqaruvi
    if (tg?.BackButton) {
        if (pageId === "home") {
            tg.BackButton.hide();
        } else {
            tg.BackButton.show();
        }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
    if (navigationHistory.length > 1) {
        navigationHistory.pop();
        const previousPage = navigationHistory[navigationHistory.length - 1];
        openPage(previousPage, false);
    } else {
        openPage("home", false);
    }
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
document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (btn) {
        e.preventDefault();
        const action = btn.dataset.action;
        if (action === "premium") return openPage("premium");
        if (action === "games") return openPage("games");
        if (action === "stars") {
            return showComingSoon("⭐ Telegram Stars", "Stars xarid qilish oynasi tez orada ishga tushadi.");
        }
        if (action === "gifts") {
            return showComingSoon("🎁 Telegram Gifts", "Gift xarid qilish oynasi tez orada ishga tushadi.");
        }
    }

    // Orqaga qaytish tugmasi hodisasi
    const backBtn = e.target.closest(".back-button");
    if (backBtn) {
        e.preventDefault();
        goBack();
    }
});

// Telegram Native Back Button Handler
if (tg?.BackButton) {
    tg.BackButton.onClick(() => {
        goBack();
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
    openPage("home", false);
    initApp();
});