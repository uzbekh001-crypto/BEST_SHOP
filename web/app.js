
// =========================================
// 🎮 DONAT KANALLARI
// URL'LARNI FAQAT SHU YERDAN O'ZGARTIRING
// =========================================

const DONAT_CHANNELS = {

    pubg:
        "https://t.me/cwfamily",

    efootball:
        "https://t.me/cwfamily",

    brawlStars:
        "https://t.me/cwfamily",

    other:
        "https://t.me/cwfamily"

};


// =========================================
// TELEGRAM
// =========================================

const tg = window.Telegram?.WebApp;

if (tg) {

    tg.ready();
    tg.expand();

    if (tg.enableClosingConfirmation) {
        tg.enableClosingConfirmation();
    }

}


// =========================================
// ELEMENTS
// =========================================

const pages =
    document.querySelectorAll(".page");

const navButtons =
    document.querySelectorAll(".nav-btn");

const toast =
    document.getElementById("toast");


// =========================================
// TELEGRAM USER
// =========================================

const user =
    tg?.initDataUnsafe?.user || null;


function setupTelegramUser() {

    if (!user) {
        return;
    }


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

    const username =
        user.username
            ? `@${user.username}`
            : "Username mavjud emas";


    const profileUsername =
        document.getElementById("profile-username");

    if (profileUsername) {

        profileUsername.textContent =
            username;

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

        const headerAvatar =
            document.getElementById("header-avatar");


        if (avatar) {

            avatar.innerHTML = "";

            const img =
                document.createElement("img");

            img.src =
                user.photo_url;

            img.alt =
                "avatar";

            avatar.appendChild(img);

        }


        if (headerAvatar) {

            headerAvatar.innerHTML = "";

            const img =
                document.createElement("img");

            img.src =
                user.photo_url;

            img.alt =
                "avatar";

            headerAvatar.appendChild(img);

        }

    }

}


setupTelegramUser();


// =========================================
// NAVIGATION
// =========================================

function openPage(pageId) {

    const target =
        document.getElementById(pageId);

    if (!target) {
        return;
    }


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


    updateTelegramBackButton(pageId);

}


function updateTelegramBackButton(pageId) {

    if (!tg?.BackButton) {
        return;
    }


    const rootPages = [
        "home",
        "services",
        "games",
        "profile"
    ];


    if (rootPages.includes(pageId)) {

        tg.BackButton.hide();

    } else {

        tg.BackButton.show();

    }

}


// =========================================
// BOTTOM NAV
// =========================================

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
// DATA-PAGE BUTTONS
// =========================================

document
    .querySelectorAll("[data-page]")
    .forEach(button => {

        if (button.classList.contains("nav-btn")) {
            return;
        }


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
// SERVICES
// =========================================

document
    .querySelectorAll("[data-service]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const service =
                    button.dataset.service;


                if (service === "premium") {

                    openPage("premium");

                    return;

                }


                if (service === "stars") {

                    openPage("stars");

                    return;

                }


                if (service === "gifts") {

                    openPage("gifts");

                    return;

                }

            }
        );

    });


// =========================================
// PREMIUM
// =========================================

document
    .querySelectorAll(".premium-plan")
    .forEach(plan => {

        plan.addEventListener(
            "click",
            () => {

                const months =
                    plan.dataset.plan;


                showToast(
                    `${months} oylik Premium tanlandi`
                );


                /*
                 * PAYMENT / ORDER
                 * keyin shu joyga ulanadi.
                 *
                 * Hozircha mavjud invoice
                 * tizimiga tegilmaydi.
                 */

            }
        );

    });


// =========================================
// STARS
// =========================================

let selectedStars = 0;


const starsButtons =
    document.querySelectorAll(
        "[data-stars]"
    );


const selectedStarsElement =
    document.getElementById(
        "selected-stars"
    );


starsButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            starsButtons.forEach(
                item => {

                    item.classList.remove(
                        "selected"
                    );

                }
            );


            button.classList.add(
                "selected"
            );


            selectedStars =
                Number(
                    button.dataset.stars
                );


            if (selectedStarsElement) {

                selectedStarsElement.textContent =
                    `${selectedStars} ⭐`;

            }

        }
    );

});


const starsContinue =
    document.getElementById(
        "stars-continue"
    );


if (starsContinue) {

    starsContinue.addEventListener(
        "click",
        () => {

            const input =
                document.getElementById(
                    "stars-username"
                );


            const username =
                input
                    ? input.value.trim()
                    : "";


            if (!username) {

                showToast(
                    "Avval username kiriting"
                );

                input?.focus();

                return;

            }


            if (!selectedStars) {

                showToast(
                    "Stars miqdorini tanlang"
                );

                return;

            }


            showToast(
                `@${username} uchun ${selectedStars} ⭐ tanlandi`
            );


            /*
             * Keyinchalik:
             * order yaratish →
             * invoice →
             * payment
             * shu yerga ulanadi.
             */

        }
    );

}


// =========================================
// GIFTS
// =========================================

document
    .querySelectorAll(".gift-item")
    .forEach(gift => {

        gift.addEventListener(
            "click",
            () => {

                const name =
                    gift.querySelector(
                        "strong"
                    )?.textContent || "Gift";


                const price =
                    gift.querySelector(
                        "small"
                    )?.textContent || "";


                showToast(
                    `${name} — ${price}`
                );


                /*
                 * Keyinchalik gift order
                 * tizimiga ulanadi.
                 */

            }
        );

    });


// =========================================
// 🎮 GAMES / DONAT
// =========================================

document
    .querySelectorAll(".game-row")
    .forEach(game => {

        game.addEventListener(
            "click",
            () => {

                const gameName =
                    game.dataset.game;


                let channelUrl = null;


                // PUBG Mobile

                if (
                    gameName === "PUBG Mobile"
                ) {

                    channelUrl =
                        DONAT_CHANNELS.pubg;

                }


                // eFootball

                if (
                    gameName === "eFootball"
                ) {

                    channelUrl =
                        DONAT_CHANNELS.efootball;

                }


                // Brawl Stars

                if (
                    gameName === "Brawl Stars"
                ) {

                    channelUrl =
                        DONAT_CHANNELS.brawlStars;

                }


                // URL tekshirish

                if (
                    !channelUrl ||
                    channelUrl.startsWith(
                        "BU_YERGA_"
                    )
                ) {

                    showToast(
                        "Bu o‘yin kanali hali sozlanmagan"
                    );

                    return;

                }


                // Telegram kanalini ochish

                if (tg?.openTelegramLink) {

                    tg.openTelegramLink(
                        channelUrl
                    );

                } else {

                    window.open(
                        channelUrl,
                        "_blank"
                    );

                }

            }
        );

    });


// =========================================
// 🎮 BOSHQA O'YINLAR
// =========================================

const otherGames =
    document.getElementById(
        "other-games"
    );


if (otherGames) {

    otherGames.addEventListener(
        "click",
        () => {

            const channelUrl =
                DONAT_CHANNELS.other;


            if (
                !channelUrl ||
                channelUrl.startsWith(
                    "BU_YERGA_"
                )
            ) {

                showToast(
                    "Boshqa o‘yinlar kanali hali sozlanmagan"
                );

                return;

            }


            if (tg?.openTelegramLink) {

                tg.openTelegramLink(
                    channelUrl
                );

            } else {

                window.open(
                    channelUrl,
                    "_blank"
                );

            }

        }
    );

}


// =========================================
// PROFILE LINKS
// =========================================

const profileButton =
    document.querySelector(
        "[data-profile]"
    );


if (profileButton) {

    profileButton.addEventListener(
        "click",
        () => {

            openPage("profile");

        }
    );

}


// =========================================
// PROFILE MENU
// =========================================

document
    .querySelectorAll(
        "[data-profile-page]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const type =
                    button.dataset.profilePage;


                const messages = {

                    orders:
                        "Buyurtmalar tarixi tez orada",

                    bonus:
                        "Bonuslar bo‘limi tez orada",

                    referral:
                        "Referal tizimi tez orada",

                    settings:
                        "Sozlamalar tez orada",

                    help:
                        "Yordam bo‘limi tez orada"

                };


                showToast(
                    messages[type] ||
                    "Tez orada"
                );

            }
        );

    });


// =========================================
// TELEGRAM PROFILE
// =========================================

const telegramProfile =
    document.querySelector(
        "#telegram-profile"
    );


if (telegramProfile) {

    telegramProfile.addEventListener(
        "click",
        () => {

            if (!user?.id) {

                showToast(
                    "Telegram profil aniqlanmadi"
                );

                return;

            }


            const url =
                `tg://user?id=${user.id}`;


            if (tg?.openTelegramLink) {

                tg.openTelegramLink(
                    url
                );

            } else {

                window.location.href =
                    url;

            }

        }
    );

}


// =========================================
// BEST SHOP CHANNEL
// =========================================

const bestshopChannel =
    document.getElementById(
        "bestshop-channel"
    );


if (bestshopChannel) {

    bestshopChannel.addEventListener(
        "click",
        () => {

            /*
             * DIQQAT:
             * Kanal username'i aniq bo‘lganda
             * shu URL'ni almashtiramiz.
             */

            const channelUrl =
                "https://t.me/bestshop";


            if (tg?.openTelegramLink) {

                tg.openTelegramLink(
                    channelUrl
                );

            } else {

                window.open(
                    channelUrl,
                    "_blank"
                );

            }

        }
    );

}


// =========================================
// TELEGRAM BACK BUTTON
// =========================================

if (tg?.BackButton) {

    tg.BackButton.onClick(
        () => {

            const activePage =
                document.querySelector(
                    ".page.active"
                );


            const pageId =
                activePage?.id;


            if (
                pageId === "premium" ||
                pageId === "stars" ||
                pageId === "gifts"
            ) {

                openPage("services");

                return;

            }


            openPage("home");

        }
    );

}


// =========================================
// TOAST
// =========================================

let toastTimer = null;


function showToast(message) {

    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


// =========================================
// DARK MODE
// =========================================

document.documentElement.style.colorScheme =
    "dark";


// =========================================
// START
// =========================================

openPage("home");
