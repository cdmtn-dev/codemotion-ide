import { createDIV, createLink, createParagraph, svgToElement } from "../handlers/helpers.js";

export function renderInfoBlocks(properties = {}) {
    const id = properties.id;
    const blocks = properties.blocks;

    const wrapper = createDIV();
    wrapper.classList.add("modal-infoblocks");
    wrapper.id = id;

    blocks.forEach((block) => {
        const title = block.title;
        const description = block.description;

        const infoBlock = createDIV();
        infoBlock.classList.add("modal-infoblocks__item");

        const titleEl = createParagraph(title);
        titleEl.classList.add("modal-infoblocks__title");

        const descEl = createParagraph(description);
        descEl.classList.add("modal-infoblocks__desc");

        infoBlock.appendChild(titleEl);
        infoBlock.appendChild(descEl);

        wrapper.appendChild(infoBlock);
    });

    return wrapper;
}
