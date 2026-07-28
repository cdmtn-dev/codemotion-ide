import { GLS } from "../lib.js";
import {
    disableButtons,
    emailInput,
    errorBlock,
    getFormLabel,
    initInputs,
    passwordInput,
    showErrBlock,
    submitBtn,
    unDisableButtons,
    usernameInput,
} from "./authRenderer.js";

document.addEventListener("DOMContentLoaded", async () => {
    const gls = await GLS.init();

    initInputs();

    const params = new URLSearchParams(window.location.search);

    getFormLabel(emailInput).textContent = gls.get("auth.login.inputs.email");
    getFormLabel(passwordInput).textContent = gls.get("auth.login.inputs.password");

    submitBtn.textContent = gls.get("auth.login.inputs.submitBtn");

    document.querySelector(".user-logo__title").textContent = gls.get("auth.login.title");
    document.querySelector(".user-logo__desc").textContent = gls.get("auth.login.description");

    if (params.get("email") != null) {
        emailInput.value = params.get("email");
        emailInput.classList.add("focused");
    }
    if (params.get("password") != null) {
        passwordInput.value = params.get("password");
        passwordInput.classList.add("focused");
    }

    window.electron.oncb("auth-msg", (data) => {
        const type = data.type;

        if (type == "error") {
            showErrBlock(data.content);
        }
    });

    submitBtn.addEventListener("click", async () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        disableButtons();

        const res = await window.electron.login(email, password);
        console.log(res);

        if (res.success) {
            errorBlock.classList.add("hidden");
            await window.electron.reload();
        } else {
            showErrBlock(res.result);
        }

        unDisableButtons();
    });
});
