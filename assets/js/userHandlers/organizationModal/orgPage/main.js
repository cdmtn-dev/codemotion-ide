import { GetOrgAvatar, GLS } from "../../../lib.js";
import { Modal } from "../../../modalsHandler/engine.js";
import { renderAboutPage } from "./about.js";

export async function createOrgPage(data = {}) {
    Modal.destroy("orgPage")

    const gls = GLS.initLocal()

    function lgls(key, replacements = {}) {
        return gls.get(`modals.organizations.orgPage.${key}`, replacements)
    }

    const id = data.id
    const name = data.name
    const avatar = await GetOrgAvatar.get(data.avatarID, "large")
    const desc = data.description

    const modal = Modal.create(
        {
            id: "orgPage",
            name: name,
            modalClassList: ["window"],
            title: name,
            titleAvatar: avatar,

            pages: [
                {
                    name: lgls("about.title"),
                    icon: "info",

                    content: [
                        {
                            type: "row-clear",
                            gap: 10,
                            items: await renderAboutPage(lgls, {
                                ...data,
                                avatar: avatar
                            })
                        }
                    ]
                },
            ]
        }
    )

    return modal
}