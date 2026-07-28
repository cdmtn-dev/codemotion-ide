import { formatUnix } from "../../../lib.js";

export async function renderAboutPage(lgls, data = {}) {
    const name = data.name;
    const avatar = data.avatar;
    const desc = data.description;
    const isVerified = data.verified;
    const ownerId = data.ownerID;

    const ownerRes = await window.electron.getUser(ownerId);
    const additionalInfoBlocks = [];

    if (ownerRes.success) {
        additionalInfoBlocks.push({
            title: lgls("about.page.info.owner"),
            description: ownerRes.msg.name,
        });

        console.log(additionalInfoBlocks);
    }

    let avatarData = {};

    if (avatar) {
        avatarData = {
            type: "image",
            src: avatar,
            styles: {
                width: "50px",
                height: "50px",
                borderRadius: "10px",
            },
        };
    }

    const about = [
        {
            type: "placeholder",
            title: lgls("about.page.title", { name }),
            description: lgls("about.page.description"),
        },

        {
            type: "divider",
        },

        avatarData,

        {
            type: "placeholder",
            title: name,
            titleBadge: isVerified ? "verified" : "",
            description: desc,
        },

        {
            type: "divider",
        },

        {
            type: "infoBlocks",
            id: "orgPageInfoBlocks",
            blocks: [
                ...additionalInfoBlocks,
                {
                    title: lgls("about.page.info.members"),
                    description: data.members_count,
                },
                {
                    title: lgls("about.page.info.createdAt"),
                    description: formatUnix(data.created_at, "{dd}.{mm}.{yyyy}, {hh}:{ii}"),
                },
                {
                    title: lgls("about.page.info.repos"),
                    description: data.github_repos.length,
                },
            ],
        },
    ];

    if (data.website) {
        about.push({
            type: "divider",
        });
        about.push({
            type: "placeholder",
            title: lgls("about.page.website.title"),
            link: data.website,
        });
    }

    console.log(data);

    if (data.github_repos && data.github_repos.length > 0) {
        const repos = data.github_repos;

        about.push({
            type: "divider",
        });
        about.push({
            type: "placeholder",
            title: lgls("about.page.githubRepos.title"),
        });
        about.push({
            type: "githubRepos",
            id: "orgPageGithubRepos",
            urls: repos,
            forkable: true,
        });
    }

    return about;
}
