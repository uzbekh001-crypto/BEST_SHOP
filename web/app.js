const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();


// Telegram user
const user = tg.initDataUnsafe?.user;

if (user) {

    const firstName = user.first_name || "Foydalanuvchi";

    document.getElementById("greeting").textContent =
        `Salom, ${firstName} 👋`;

    document.getElementById("profile-name").textContent =
        `${user.first_name || ""} ${user.last_name || ""}`.trim();

    if (user.username) {
        document.getElementById("profile-username").textContent =
            `@${user.username}`;
    }

    if (user.photo_url) {
        document.getElementById("avatar").innerHTML =
            `<img src="${user.photo_url}" alt="avatar">`;

        const image = document.querySelector("#avatar img");

        image.style.width = "100%";
        image.style.height = "100%";
        image.style.objectFit = "cover";
        image.style.borderRadius = "50%";
    }
}


// Navigation
const buttons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const target = button.dataset.page;

        buttons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        pages.forEach(page => {
            page.classList.remove("active");
        });

        const targetPage = document.getElementById(target);

        if (targetPage) {
            targetPage.classList.add("active");
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

});