const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();


// =========================================
// TELEGRAM USER
// =========================================

const user = tg.initDataUnsafe?.user;

if (user) {

    const firstName = user.first_name || "Foydalanuvchi";

    // Greeting
    const greeting = document.getElementById("greeting");

    if (greeting) {
        greeting.textContent = `Salom, ${firstName} 👋`;
    }


    // Profile name
    const profileName =
        document.getElementById("profile-name");

    if (profileName) {

        const fullName =
            `${user.first_name || ""} ${user.last_name || ""}`.trim();

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


    // Profile avatar
    if (user.photo_url) {

        const avatar =
            document.getElementById("avatar");

        if (avatar) {

            avatar.innerHTML =
                `<img src="${user.photo_url}" alt="avatar">`;
        }


        // Header avatar
        const headerAvatar =
            document.getElementById("header-avatar");

        if (headerAvatar) {

            headerAvatar.innerHTML =
                `<img src="${user.photo_url}" alt="avatar">`;
        }
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

    // Buttons
    navButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );
    });


    // Pages
    pages.forEach(page => {

        page.classList.toggle(
            "active",
            page.id === pageId
        );
    });


    // Scroll top
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const page =
            button.dataset.page;

        if (page) {
            openPage(page);
        }
    });
});


// =========================================
// SERVICE BUTTONS
// =========================================

const actionButtons =
    document.querySelectorAll("[data-action]");


actionButtons.forEach(button => {

    button.addEventListener("click", () => {

        const action =
            button.dataset.action;


        // Premium
        if (action === "premium") {

            showComingSoon(
                "💎 Telegram Premium",
                "Premium xarid qilish oynasi tez orada ishga tushadi."
            );

            return;
        }


        // Stars
        if (action === "stars") {

            showComingSoon(
                "⭐ Telegram Stars",
                "Stars xarid qilish oynasi tez orada ishga tushadi."
            );

            return;
        }


        // Gifts
        if (action === "gifts") {

            showComingSoon(
                "🎁 Telegram Gifts",
                "Gift xarid qilish oynasi tez orada ishga tushadi."
            );

            return;
        }


        // Games
        if (action === "games") {

            openPage("games");

            return;
        }
    });
});


// =========================================
// TEMPORARY MESSAGE
// =========================================

function showComingSoon(title, message) {

    // Telegram alert
    if (tg.showAlert) {

        tg.showAlert(
            `${title}\n\n${message}`
        );

        return;
    }


    // Browser fallback
    alert(
        `${title}\n\n${message}`
    );
}


// =========================================
// TELEGRAM BACK BUTTON
// =========================================

if (tg.BackButton) {

    tg.BackButton.onClick(() => {

        openPage("home");

        tg.BackButton.hide();
    });
}


// =========================================
// THEME
// =========================================

document.documentElement.style.colorScheme = "dark";


// =========================================
// START
// =========================================

openPage("home");