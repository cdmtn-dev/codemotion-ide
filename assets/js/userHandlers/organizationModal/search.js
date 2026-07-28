import { sendEvent } from "../../bus.js";
import { createNotify, formatUnix, Options, truncateString } from "../../lib.js";
import { renderOrganization } from "../../modalsHandler/components/organization.js";
import { renderPlaceholder } from "../../modalsHandler/components/placeholder.js";
import { Modal } from "../../modalsHandler/engine.js";
import { renderSidebarItem } from "../../modalsHandler/handlers/sidebarHandler.js";
import { getModalOrgStructure } from "../orgModal.js";
import { createOrgPage } from "./orgPage/main.js";

export function searchModalObject({ lgls }) {
    return {
        name: lgls("search.title"),
        icon: "search",

        content: [
            {
                type: "row-clear",
                gap: 10,
                items: [
                    {
                        type: "placeholder",
                        title: lgls("search.title"),
                        description: lgls("search.description"),
                    },
                    {
                        type: "input",
                        placeholder: lgls("search.inputs.search"),
                        id: "searchInput",
                    },
                    {
                        type: "placeholder",
                        id: "searchResults",
                    },
                ],
            },
        ],
    };
}

export function searchModalHandle({ modal, element, lgls }) {
    const searchInput = element.querySelector("#searchInput");
    const searchResults = element.querySelector("#searchResults");

    searchInput.addEventListener("change", async (e) => {
        searchResults.innerHTML = "";

        const value = e.target.value;

        const res = await window.electron.searchOrg(value);

        console.log(res);

        if (res.success) {
            const results = res.msg;

            if (results.length > 0) {
                results.forEach(async (org) => {
                    const struct = await getModalOrgStructure(org);
                    const render = renderOrganization(struct);

                    searchResults.appendChild(render);

                    render.onclick = async () => {
                        modal.close();

                        const orgPageModal = await createOrgPage(org);
                        orgPageModal.open();
                    };
                });
            } else {
                const noResulstPlaceholder = renderPlaceholder({
                    description: lgls("search.noResults.text", { name: value }),
                });

                searchResults.appendChild(noResulstPlaceholder);
            }
        }
    });
}
