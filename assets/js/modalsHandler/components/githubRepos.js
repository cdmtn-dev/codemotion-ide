import { createDIV, createLink, createParagraph, svgToElement } from "../handlers/helpers.js";

export function renderGithubRepos(properties = {}) {
    const id = properties.id;
    const urls = properties.urls;

    const wrapper = createDIV();
    wrapper.classList.add("modal-githubrepos");
    wrapper.id = id;

    urls.forEach(async (repo) => {
        const githubRepoEl = createLink("https://github.com/" + repo);
        githubRepoEl.classList.add("modal-githubrepos__item");

        const githubIcon = await svgToElement("../assets/media/external/github.svg");
        githubIcon.classList.add("modal-githubrepos__icon");

        const githubUrl = createParagraph(repo);

        githubRepoEl.appendChild(githubIcon);
        githubRepoEl.appendChild(githubUrl);

        wrapper.appendChild(githubRepoEl);
    });

    return wrapper;
}
