export function initActions() {
    document.querySelectorAll("[action]").forEach((e) => {
        const Id = e.getAttribute("action");

        e.addEventListener("click", async () => {
            console.log(Id);
            if (Id == "logout") {
                await window.electron.logout();
                await window.electron.reload();
            }
            if (Id == "appclose") {
                window.electron.close();
            }
            if (Id == "appminimize") {
                window.electron.minimize();
            }
            if (Id == "appmaximize") {
                window.electron.maximize();
            }
            if (Id == "appreload") {
                window.electron.reload();
            }
        });
    });
}
