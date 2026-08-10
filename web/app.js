const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();


// =========================================
// API
// =========================================

const API_URL = "http://127.0.0.1:8000";


// =========================================
// TELEGRAM USER
// =========================================

const user = tg.initDataUnsafe?.user;


// =========================================
// UI USER DATA
// =========================================

if (user) {

    const firstName =
        user.first_name || "Foydalanuvchi";


    // Greeting

    const greeting =
        document.getElementById("greeting");

    if (greeting) {

        greeting.textContent =
            `Salom, ${firstName} 👋`;
    }


    // Profile name

    const profileName =
        document.getElementById("profile-name");

    if (profileName) {

        const fullName =
            `${user.first_name || ""} ${user.last_name || ""}`
                .trim();

        profileName.textContent =
            fullName || "Foydalanuvchi";
    }


    // Username

    const profileUsername =
        document.getElementById("profile-username");

    if (profileUsername) {

        profileUsername.textContent =
            user.username
                ? `@${user.username}`
                : "Username mavjud emas";
    }


    // Telegram ID

    const profileId =
        document.getElementById("profile-id");

    if (profileId) {

        profileId.textContent =
            `Telegram ID: ${user.id || "—"}`;
    }


    // Avatar

    if (user.photo_url) {

        const avatar =
            document.getElementById("avatar");

        if (avatar) {

            avatar.innerHTML =
                `<img src="${user.photo_url}" alt="avatar">`;
        }


        const headerAvatar =
            document.getElementById("header-avatar");

        if (headerAvatar) {

            headerAvatar.innerHTML =
                `<img src="${user.photo_url}" alt="avatar">`;
        }
    }
}


// =========================================
// BACKEND USER SYNC
// =========================================

async function syncUserWithBackend() {

    if (!tg.initData) {

        console.warn(
            "Telegram initData mavjud emas."
        );

        return null;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/users/me`,
                {
                    method: "GET",

                    headers: {
                        "X-Telegram-Init-Data":
                            tg.initData
                    }
                }
            );


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(
                `Backend xatosi: ${error}`
            );
        }


        const data =
            await response.json();


        console.log(
            "BEST SHOP user:",
            data
        );


        return data;

    } catch (error) {

        console.error(
            "User backendga yuborilmadi:",
            error
        );

        return null;
    }
}


// =========================================
// NAVIGATION
// =========================================

const navButtons =
    document.querySelectorAll(".nav-btn");

const pages =
    document.querySelectorAll(".page");


function openPage(pageId) {

    pages.forEach(page => {

        page.classList.toggle(
            "active",
            page.id === pageId
        );
    });


    navButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );
    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


navButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.page;

            if (page) {

                openPage(page);
            }
        }
    );
});


// =========================================
// SERVICE ACTIONS
// =========================================

const actionButtons =
    document.querySelectorAll("[data-action]");


actionButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const action =
                button.dataset.action;


            // PREMIUM

            if (action === "premium") {

                openPage("premium");

                return;
            }


            // STARS

            if (action === "stars") {

                showComingSoon(
                    "⭐ Telegram Stars",
                    "Stars xarid qilish oynasi tez orada ishga tushadi."
                );

                return;
            }


            // GIFTS

            if (action === "gifts") {

                showComingSoon(
                    "🎁 Telegram Gifts",
                    "Gift xarid qilish oynasi tez orada ishga tushadi."
                );

                return;
            }


            // GAMES

            if (action === "games") {

                openPage("games");

                return;
            }

        }
    );
});


// =========================================
// PREMIUM BACK BUTTON
// =========================================

const backButtons =
    document.querySelectorAll(".back-button");


backButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.page;

            if (page) {

                openPage(page);
            }
        }
    );
});


// =========================================
// PREMIUM PLAN CLICK
// =========================================

const premiumPlans =
    document.querySelectorAll(".premium-plan");


premiumPlans.forEach(plan => {

    plan.addEventListener(
        "click",
        () => {

            showComingSoon(
                "💎 Telegram Premium",
                "Hozircha paket narxlari ulanmoqda."
            );
        }
    );
});


// =========================================
// TEMPORARY MESSAGE
// =========================================

function showComingSoon(
    title,
    message
) {

    if (tg.showAlert) {

        tg.showAlert(
            `${title}\n\n${message}`
        );

        return;
    }


    alert(
        `${title}\n\n${message}`
    );
}


// =========================================
// TELEGRAM BACK BUTTON
// =========================================

if (tg.BackButton) {

    tg.BackButton.onClick(
        () => {

            openPage("home");

            tg.BackButton.hide();
        }
    );
}


// =========================================
// DARK THEME
// =========================================

document.documentElement.style.colorScheme =
    "dark";


// =========================================
// START
// =========================================

openPage("home");


// =========================================
// START BACKEND SYNC
// =========================================

syncUserWithBackend();