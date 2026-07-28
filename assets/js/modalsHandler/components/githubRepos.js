import { createNotify, getGithubToken, GLS, Task, linkify } from "../../lib.js";
import { Modal } from "../engine.js";
import {
    createDIV,
    createIcon,
    createLink,
    createParagraph,
    svgToElement,
} from "../handlers/helpers.js";

export function renderGithubRepos(properties = {}) {
    const gls = GLS.initLocal();

    function lgls(key, replacements = {}) {
        return gls.get(`taskProgress.githubFork.${key}`, replacements);
    }

    const id = properties.id;
    const urls = properties.urls;
    const forkable = properties.forkable;

    const wrapper = createDIV();
    wrapper.classList.add("modal-githubrepos");
    wrapper.id = id;

    urls.forEach(async (repo) => {
        const itemWrapper = createDIV();
        itemWrapper.classList.add("modal-githubrepos__item-wrapper");

        const githubRepoEl = createLink("https://github.com/" + repo);
        githubRepoEl.classList.add("modal-githubrepos__item");

        const githubIcon = await svgToElement("../assets/media/external/github.svg");
        githubIcon.classList.add("modal-githubrepos__icon");

        const githubUrl = createParagraph(repo);

        githubRepoEl.appendChild(githubIcon);
        githubRepoEl.appendChild(githubUrl);

        itemWrapper.appendChild(githubRepoEl);

        wrapper.appendChild(itemWrapper);

        const githubToken = await getGithubToken();

        if (forkable && githubToken) {
            const forkBtn = document.createElement("button");
            forkBtn.classList.add("modal-githubrepos__forkbtn");

            const forkIcon = createIcon("commit");
            const forkText = createParagraph("Fork");

            forkBtn.appendChild(forkIcon);
            forkBtn.appendChild(forkText);

            forkBtn.onclick = async () => {
                const currentModal = Modal.get("orgPage");
                currentModal.close();

                const task = new Task("githubFork");
                task.title(lgls("waiting.title", { name: repo }));
                task.description(lgls("waiting.description"));
                task.show();

                function error(title, desc) {
                    createNotify({
                        type: "danger",
                        icon: "cancel",
                        title: lgls("error.title", { name: repo }),
                        content: `Github: ${data.message}`,
                    });

                    task.finish();
                    task.hide();

                    currentModal.open();
                }

                const response = await fetch(`https://api.github.com/repos/${repo}/forks`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${githubToken}`,
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    error(lgls("error.title", { name: repo }), `Github: ${data.message}`);
                } else if ("fork" in data && data.fork) {
                    task.title(lgls("done.title"));
                    task.description();

                    task.buttons([
                        {
                            text: lgls("buttons.open"),
                            type: "primary",
                            action: () => {
                                const a = document.createElement("a");
                                a.href = data.html_url;
                                a.target = "_blank";

                                a.click();
                                a.remove();
                            },
                        },
                        {
                            text: lgls("buttons.cloneAndOpen"),
                            type: "secondary",
                            action: () => {
                                const a = document.createElement("a");
                                a.href = data.html_url;
                                a.target = "_blank";

                                a.click();
                                a.remove();
                            },
                        },
                    ]);

                    task.finish();
                } else {
                    error(lgls("errorAny.title", { name: repo }), lgls("errorAny.description"));
                }
            };

            itemWrapper.appendChild(forkBtn);
        }
    });

    return wrapper;
}
