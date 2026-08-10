const tg = window.Telegram?.WebApp;
const API_URL = "http://127.0.0.1:8000"; // Tunnel ishga tushganda o'zgartirishingiz mumkin

let cachedProducts = [];
let navigationHistory = ["home"];

if (tg) {
    tg.ready();
    tg.expand();
}

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
            renderFallbackUser();
        }
    } else {
        renderFallbackUser();
    }
    await loadProducts();
}

function renderUserData(dbUser) {
    const greeting = document.getElementById("greeting");
    if (greeting) greeting.textContent = `Salom, ${dbUser.first_name || "Foydalanuvchi"} 👋`;

    const profileName = document.getElementById("profile-name");
    if (profileName) profileName.textContent = dbUser.first_name || "Foydalanuvchi";

    const profileUsername = document.getElementById("profile-username");
    if (profileUsername) profileUsername.textContent = dbUser.username ? `@${dbUser.username}` : "@username";

    const profileId = document.getElementById("profile-id");
    if (profileId) profileId.textContent = `ID: ${dbUser.telegram_id}`;
}

function renderFallbackUser() {
    const user = tg?.initDataUnsafe?.user;
    const firstName = user?.first_name || "Mehmon";

    const greeting = document.getElementById("greeting");
    if (greeting) greeting.textContent = `Salom, ${firstName} 👋`;

    const profileName = document.getElementById("profile-name");
    if (profileName) profileName.textContent = firstName;

    const profileUsername = document.getElementById("profile-username");
    if (profileUsername) profileUsername.textContent = user?.username ? `@${user.username}` : "@user";

    const profileId = document.getElementById("profile-id");
    if (profileId) profileId.textContent = `ID: ${user?.id || "12345678"}`;
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
            const data = await response.json();
            cachedProducts = data.products || [];
            renderProductsToUI(cachedProducts);
        }
    } catch (error) {
        console.error("Mahsulotlar yuklanmadi:", error);
    }
}

function renderProductsToUI(products) {
    const premiumContainer = document.getElementById("premium-options-list");
    if (premiumContainer) {
        const premiumProducts = products.filter(p => p.category === "premium");
        if (premiumProducts.length > 0) {
            premiumContainer.innerHTML = premiumProducts.map(prod => `
                <button class="list-card" onclick="selectProduct(${prod.id})">
                    <div class="list-icon premium-icon">💎</div>
                    <div class="list-info">
                        <h3>${prod.title}</h3>
                        <p>${prod.price.toLocaleString('uz-UZ')} so'm</p>
                    </div>
                    <span class="list-arrow">→</span>
                </button>
            `).join('');
        }
    }

    const gamesContainer = document.getElementById("games-options-list");
    if (gamesContainer) {
        const gameProducts = products.filter(p => p.category === "games");
        if (gameProducts.length > 0) {
            gamesContainer.innerHTML = gameProducts.map(prod => `
                <button class="list-card" onclick="selectProduct(${prod.id})">
                    <div class="list-icon">🎮</div>
                    <div class="list-info">
                        <h3>${prod.title}</h3>
                        <p>${prod.price.toLocaleString('uz-UZ')} so'm</p>
                    </div>
                    <span class="list-arrow">→</span>
                </button>
            `).join('');
        }
    }
}

function selectProduct(productId) {
    const product = cachedProducts.find(p => p.id === productId);
    if (!product) return;

    if (tg?.showConfirm) {
        tg.showConfirm(`🛒 ${product.title}\n💰 Narxi: ${product.price.toLocaleString('uz-UZ')} so'm\n\nXaridni tasdiqlaysizmi?`, (confirmed) => {
            if (confirmed && tg?.showAlert) {
                tg.showAlert(`✅ Buyurtma qabul qilindi!`);
            }
        });
    } else {
        if (confirm(`🛒 ${product.title}\n💰 Narxi: ${product.price.toLocaleString('uz-UZ')} so'm\n\nXaridni tasdiqlaysizmi?`)) {
            alert(`✅ Buyurtma qabul qilindi!`);
        }
    }
}

function openPage(pageId, pushToHistory = true) {
    const currentPage = navigationHistory[navigationHistory.length - 1];
    if (pushToHistory && currentPage !== pageId) {
        navigationHistory.push(pageId);
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.toggle("active", page.id === pageId);
    });

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.toggle("active", button.dataset.page === pageId);
    });

    if (tg?.BackButton) {
        pageId === "home" ? tg.BackButton.hide() : tg.BackButton.show();
    }
}

function goBack() {
    if (navigationHistory.length > 1) {
        navigationHistory.pop();
        openPage(navigationHistory[navigationHistory.length - 1], false);
    } else {
        openPage("home", false);
    }
}

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        openPage(button.dataset.page);
    });
});

document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (btn) {
        e.preventDefault();
        const action = btn.dataset.action;
        if (action === "premium") return openPage("premium");
        if (action === "games") return openPage("games");
        if (action === "stars" || action === "gifts") {
            tg?.showAlert ? tg.showAlert("Tez orada ishga tushadi!") : alert("Tez orada ishga tushadi!");
        }
    }

    if (e.target.closest(".back-button")) {
        e.preventDefault();
        goBack();
    }
});

if (tg?.BackButton) {
    tg.BackButton.onClick(goBack);
}

document.addEventListener("DOMContentLoaded", () => {
    openPage("home", false);
    initApp();
});