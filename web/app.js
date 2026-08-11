javascript
// =========================================
// BEST SHOP — APP.JS
// =========================================

// =========================================
// 🎮 DONAT KANALLARI
// =========================================

const DONAT_CHANNELS = {
    pubg: "https://t.me/cwfamily",

    efootball: "https://t.me/cwfamily",

    brawlStars: "https://t.me/cwfamily",

    other: "BU_YERGA_BOSHQA_O'YINLAR_KANAL_URL"
};


// =========================================
// 🌐 BACKEND API
// =========================================

const API_BASE_URL = "";

// =========================================
// TELEGRAM WEB APP
// =========================================

const tg = window.Telegram?.WebApp || null;

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

const pages = document.querySelectorAll(".page");

const navButtons = document.querySelectorAll(".nav-btn");

const toast = document.getElementById("toast");


// =========================================
// TELEGRAM USER
// =========================================

const user = tg?.initDataUnsafe?.user || null;


function setupTelegramUser() {

    if (!user) {
        return;
    }


    const firstName =
        user.first_name || "Foydalanuvchi";


    const greeting =
        document.getElementById("greeting");

    if (greeting) {
        greeting.textContent =
            `Salom, ${firstName} 👋`;
    }


    const profileName =
        document.getElementById("profile-name");

    if (profileName) {

        const fullName =
            `${user.first_name || ""} ${user.last_name || ""}`
                .trim();

        profileName.textContent =
            fullName || "Foydalanuvchi";
    }


    const username =
        user.username
            ? `@${user.username}`
            : "Username mavjud emas";


    const profileUsername =
        document.getElementById(
            "profile-username"
        );

    if (profileUsername) {
        profileUsername.textContent =
            username;
    }


    const profileId =
        document.getElementById(
            "profile-id"
        );

    if (profileId) {

        profileId.textContent =
            `Telegram ID: ${user.id || "—"}`;
    }


    if (user.photo_url) {

        const avatar =
            document.getElementById(
                "avatar"
            );

        const headerAvatar =
            document.getElementById(
                "header-avatar"
            );


        if (avatar) {

            avatar.innerHTML = "";

            const img =
                document.createElement(
                    "img"
                );

            img.src =
                user.photo_url;

            img.alt =
                "Telegram avatar";

            avatar.appendChild(img);
        }


        if (headerAvatar) {

            headerAvatar.innerHTML = "";

            const img =
                document.createElement(
                    "img"
                );

            img.src =
                user.photo_url;

            img.alt =
                "Telegram avatar";

            headerAvatar.appendChild(img);
        }
    }
}


setupTelegramUser();


// =========================================
// PAGE NAVIGATION
// =========================================

function openPage(pageId) {

    const target =
        document.getElementById(
            pageId
        );

    if (!target) {
        return;
    }


    pages.forEach(page => {

        page.classList.toggle(
            "active",
            page.id === pageId
        );

    });


    const rootPages = [
        "home",
        "services",
        "games",
        "profile"
    ];


    navButtons.forEach(button => {

        const buttonPage =
            button.dataset.page;

        button.classList.toggle(
            "active",
            buttonPage === pageId
        );


        if (
            !rootPages.includes(pageId) &&
            buttonPage === "services"
        ) {
            button.classList.remove(
                "active"
            );
        }

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    updateTelegramBackButton(
        pageId
    );
}


// =========================================
// TELEGRAM BACK BUTTON
// =========================================

function updateTelegramBackButton(
    pageId
) {

    if (!tg?.BackButton) {
        return;
    }


    const rootPages = [
        "home",
        "services",
        "games",
        "profile"
    ];


    if (
        rootPages.includes(pageId)
    ) {

        tg.BackButton.hide();

    } else {

        tg.BackButton.show();

    }
}


// =========================================
// BOTTOM NAVIGATION
// =========================================

navButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.page;

            if (!page) {
                return;
            }

            openPage(page);
        }
    );

});


// =========================================
// DATA-PAGE BUTTONS
// =========================================

document
    .querySelectorAll("[data-page]")
    .forEach(button => {

        if (
            button.classList.contains(
                "nav-btn"
            )
        ) {
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


                switch (service) {

                    case "premium":

                        openPage(
                            "premium"
                        );

                        break;


                    case "stars":

                        openPage(
                            "stars"
                        );

                        break;


                    case "gifts":

                        openPage(
                            "gifts"
                        );

                        break;


                    default:

                        showToast(
                            "Bu xizmat hali mavjud emas"
                        );
                }

            }
        );

    });


// =========================================
// 💎 PREMIUM
// =========================================

document
    .querySelectorAll(".premium-plan")
    .forEach(plan => {

        plan.addEventListener(
            "click",
            async () => {

                const months =
                    Number(
                        plan.dataset.plan
                    );


                if (!months) {
                    return;
                }


                // ---------------------------------
                // LOADING
                // ---------------------------------

                plan.disabled = true;


                showToast(
                    "Invoice tayyorlanmoqda..."
                );


                try {

                    // ---------------------------------
                    // TELEGRAM INIT DATA
                    // ---------------------------------

                    if (!tg) {

                        throw new Error(
                            "Telegram WebApp topilmadi."
                        );
                    }


                    const initData =
                        tg.initData;


                    if (!initData) {

                        throw new Error(
                            "Telegram initData topilmadi."
                        );
                    }


                    // ---------------------------------
                    // BACKEND REQUEST
                    // ---------------------------------

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/orders/premium-invoice?months=${months}`,
                            {
                                method: "POST",

                                headers: {
                                    "X-Telegram-Init-Data":
                                        initData
                                }
                            }
                        );


                    // ---------------------------------
                    // RESPONSE
                    // ---------------------------------

                    let result = null;


                    try {

                        result =
                            await response.json();

                    } catch {

                        throw new Error(
                            "Serverdan noto‘g‘ri javob keldi."
                        );
                    }


                    // ---------------------------------
                    // SERVER ERROR
                    // ---------------------------------

                    if (!response.ok) {

                        throw new Error(
                            result?.detail ||
                            "Invoice yaratilmadi."
                        );
                    }


                    // ---------------------------------
                    // INVOICE LINK
                    // ---------------------------------

                    const invoiceLink =
                        result?.invoice_link;


                    if (!invoiceLink) {

                        throw new Error(
                            "Invoice link olinmadi."
                        );
                    }


                    // ---------------------------------
                    // OPEN TELEGRAM INVOICE
                    // ---------------------------------

                    if (
                        tg.openInvoice
                    ) {

                        tg.openInvoice(
                            invoiceLink,
                            (status) => {

                                console.log(
                                    "Telegram invoice status:",
                                    status
                                );


                                if (
                                    status ===
                                    "paid"
                                ) {

                                    showToast(
                                        "✅ To‘lov muvaffaqiyatli!"
                                    );

                                }


                                else if (
                                    status ===
                                    "cancelled"
                                ) {

                                    showToast(
                                        "To‘lov bekor qilindi."
                                    );

                                }


                                else if (
                                    status ===
                                    "failed"
                                ) {

                                    showToast(
                                        "❌ To‘lov amalga oshmadi."
                                    );

                                }

                            }
                        );

                    } else {

                        // ---------------------------------
                        // FALLBACK
                        // ---------------------------------

                        window.open(
                            invoiceLink,
                            "_blank"
                        );

                    }


                } catch (error) {

                    console.error(
                        "Premium invoice error:",
                        error
                    );


                    showToast(
                        error.message ||
                        "Invoice yaratishda xatolik."
                    );


                } finally {

                    plan.disabled = false;

                }

            }
        );

    });


// =========================================
// ⭐ STARS
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

            starsButtons.forEach(item => {

                item.classList.remove(
                    "selected"
                );

            });


            button.classList.add(
                "selected"
            );


            selectedStars =
                Number(
                    button.dataset.stars
                );


            if (
                selectedStarsElement
            ) {

                selectedStarsElement.textContent =
                    `${selectedStars} ⭐`;

            }

        }
    );

});


// =========================================
// ⭐ STARS CONTINUE
// =========================================

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


            const cleanUsername =
                username.replace(
                    /^@/,
                    ""
                );


            showToast(
                `@${cleanUsername} uchun ${selectedStars} ⭐ tanlandi`
            );

        }
    );

}


// =========================================
// 🎁 GIFTS
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
                    )?.textContent ||
                    "Gift";


                const price =
                    gift.querySelector(
                        "small"
                    )?.textContent ||
                    "";


                showToast(
                    `${name} — ${price}`
                );

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


                let channelUrl =
                    null;


                if (
                    gameName ===
                    "PUBG Mobile"
                ) {

                    channelUrl =
                        DONAT_CHANNELS.pubg;

                }


                if (
                    gameName ===
                    "eFootball"
                ) {

                    channelUrl =
                        DONAT_CHANNELS.efootball;

                }


                if (
                    gameName ===
                    "Brawl Stars"
                ) {

                    channelUrl =
                        DONAT_CHANNELS.brawlStars;

                }


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


                if (
                    tg?.openTelegramLink
                ) {

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
// 🎮 OTHER GAMES
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


            if (
                tg?.openTelegramLink
            ) {

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
// 👤 PROFILE BUTTON
// =========================================

const profileButton =
    document.querySelector(
        "[data-profile]"
    );


if (profileButton) {

    profileButton.addEventListener(
        "click",
        () => {

            openPage(
                "profile"
            );

        }
    );

}


// =========================================
// 👤 PROFILE MENU
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
                        "Bonuslar tez orada",

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
// 👤 TELEGRAM PROFILE
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


            if (
                tg?.openTelegramLink
            ) {

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
// 📢 BEST SHOP CHANNEL
// =========================================

const bestshopChannel =
    document.querySelector(
        "#bestshop-channel"
    );


if (bestshopChannel) {

    bestshopChannel.addEventListener(
        "click",
        () => {

            const channelUrl =
                "https://t.me/bestshop";


            if (
                tg?.openTelegramLink
            ) {

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

                openPage(
                    "services"
                );

                return;
            }


            openPage(
                "home"
            );

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
// INITIAL PAGE
// =========================================

openPage(
    "home"
);

