import { generateAvatar, truncateString, GLOBAL, GLS } from "./lib.js";
import { Modal } from "./modalsHandler/engine.js";

import { spawnSideBarOrganizationsButton } from "./userHandlers/spawn.js"
import { createUserOrgsModalStructure } from "./userHandlers/orgModal.js";
import { appendBugs } from "./userHandlers/appendBugs.js"
import { createUserOrgModal } from "./userHandlers/orgModal.js";

import { bus } from "./bus.js";
import { setUserPcInfo } from "./userHandlers/userPC.js";

export async function requestUser() {
    const user = await window.electron.getCurrentUserDataFromAPI();

    if (user.success) {
        return {
            success: user.success,
            data: user,
            user: user.result.result.user,
            organizations: user.result.result.organizations,
            bugsCreated: user.result.result.bugs.created,
            bugsAssigned: user.result.result.bugs.assigned
        }
    }
    else {
        return {
            success: false,
            result: user.result.result
        }
    }
}

export async function getCurrentUserDataFromAPI(properties = {}) {
    const gls = GLS.initLocal()
    const user = await requestUser()
    const greeting = document.querySelector("#greeting")

    bus.addEventListener("org-created", async () => {
        await getCurrentUserDataFromAPI({ orgsModalOpen: true })
    })
    bus.addEventListener("org-removed", async () => {
        await getCurrentUserDataFromAPI({ orgsModalOpen: true })
    })
    bus.addEventListener("org-joined", async () => {
        await getCurrentUserDataFromAPI({ orgsModalOpen: true })
    })
    bus.addEventListener("org-update", async () => {
        await getCurrentUserDataFromAPI({ orgsModalOpen: true })
    })

    setUserPcInfo()

    if (!user.success) return user;

    const userJSON = user.user;
    const userOrgs = user.organizations;
    const bugsCreated = user.bugsCreated
    const bugsAssigned = user.bugsAssigned

    GLOBAL["user"] = userJSON

    // organizations

    spawnSideBarOrganizationsButton({ userOrgs: userOrgs })

    Modal.destroy("organizations")
    const organizationsModal = await createUserOrgModal(
        {
            userOrgs: userOrgs,
            userJSON: userJSON
        }
    )
    organizationsModal.bind(document.querySelectorAll("#yourOrganizations"))

    if ("orgsModalOpen" in properties && properties.orgsModalOpen) {
        organizationsModal.open()
    }

    // 

    document.querySelectorAll("#username").forEach(e => e.textContent = userJSON.name);
    document.querySelectorAll("#greeting").forEach(e => e.textContent = gls.get("greeting.default", { name: userJSON.name }));
    document.querySelectorAll("#bug_counter").forEach(e => {
        e.innerHTML = `
            <div class="bugs-assigned">${Object.keys(bugsAssigned).length}</div>
            <div class="bugs-created">${Object.keys(bugsCreated).length}</div>
            <div class="divider"></div>
            <div class="bugs-all">${Object.keys({...bugsAssigned, ...bugsCreated}).length}</div>
        `
    });
    document.querySelector("#userAvatar").innerHTML = generateAvatar(userJSON.name)

    appendBugs(bugsCreated, "created")
    appendBugs(bugsAssigned, "assigned")

    return user.data;
}