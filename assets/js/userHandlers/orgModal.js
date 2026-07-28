import { createNotify, GetOrgAvatar, GLS, getInitials, Options, truncateString } from "../lib.js";
import { Modal } from "../modalsHandler/engine.js";
import { createNewModalHandle, createNewModalObject } from "./organizationModal/create-new.js";
import { dashboardModalHandle, dashboardModalObject } from "./organizationModal/dashboard.js";
import { joinModalHandle, joinModalObject } from "./organizationModal/join.js";
import { searchModalHandle, searchModalObject } from "./organizationModal/search.js";

export async function getModalOrgStructure(organizationData) {
    const gls = GLS.initLocal();
    const isOwner = organizationData.is_owner;

    const preparedData = {
        type: "organization",

        name: organizationData.name,

        description: organizationData.description,

        website: organizationData.website,

        columns: [
            {
                name: gls.get("modals.organizations.membersLabel"),

                value: organizationData.members_count,
            },
        ],

        badgeOwner: isOwner,

        badgeVerified: organizationData.verified == 1,
    };

    const orgAvatar = await GetOrgAvatar.get(organizationData.avatarID, "large");
    if (orgAvatar) {
        preparedData["avatar"] = orgAvatar;
    }

    if ("github_repos" in organizationData) {
        preparedData["repos"] = organizationData.github_repos;
    }

    return preparedData;
}

export async function createUserOrgsModalStructure({ userOrgs, userJSON, roleVisible }) {
    const gls = GLS.initLocal();

    roleVisible = roleVisible == undefined ? true : roleVisible;

    const organizationsModalData = await Promise.all(
        userOrgs.map(async (organization) => {
            const organizationReq = await window.electron.getOrgDataFromAPI(organization.id);

            if (!organizationReq.success) {
                createNotify({
                    type: "warn",
                    icon: "close",
                    title: "Organization Fetch Error",
                    content: `Error getting organization data: ${organization.id}`,
                });
            }

            const organizationData = organizationReq.msg;

            const organizationRole = organization.role?.length > 0 ? organization.role : "No role";

            const isOwner = organizationData.is_owner;

            // get modal structure
            const preparedData = await getModalOrgStructure(organizationData);

            // set role
            preparedData["columns"].push({
                name: gls.get("modals.organizations.roleLabel"),

                value: isOwner ? gls.get("modals.organizations.ownerRoleLabel") : organizationRole,
            });

            const orgAvatar = await GetOrgAvatar.get(organizationData.avatarID, "large");
            if (orgAvatar) {
                preparedData["avatar"] = orgAvatar;
            }

            if ("github_repos" in organizationData) {
                preparedData["repos"] = organizationData.github_repos;
            }

            if (!roleVisible) {
                delete preparedData["columns"][1];
            }

            if (isOwner) {
                preparedData.note = `
                    ${gls.get("modals.organizations.ownerLabel")}
                    ${
                        organization.role?.length > 0
                            ? gls.get("modals.organizations.ownerLabel", {
                                  role: organization.role,
                              })
                            : ""
                    }
                `.trim();
            }

            return preparedData;
        }),
    );

    return organizationsModalData;
}

export async function createUserOrgModal({ userOrgs, userJSON }) {
    const gls = GLS.initLocal();

    function lgls(string, variables = {}) {
        return gls.get(`modals.organizations.${string}`, variables);
    }

    const exploreOrganizationsRes = await window.electron.requestExploreOrganizations();

    const errorPlaceholder = {
        type: "placeholder",
        title: gls.get("errorPlaceholder.title"),
        description: gls.get("errorPlaceholder.description"),
    };

    let exploreItems = [];
    let membershipItems = [];

    if (exploreOrganizationsRes.success) {
        if (exploreOrganizationsRes.msg.length == 0) {
            exploreItems = [
                {
                    type: "centered",
                    icon: "explore",
                },
            ];
        } else {
            exploreItems = await createUserOrgsModalStructure({
                userOrgs: exploreOrganizationsRes.msg,
                userJSON,
                roleVisible: false,
            });
        }
    } else {
        exploreItems = [errorPlaceholder];
    }

    if (Object.keys(userOrgs).length == 0) {
        membershipItems = [
            {
                type: "centered",
                icon: "group",
            },
        ];
    } else {
        membershipItems = await createUserOrgsModalStructure({
            userOrgs,
            userJSON,
        });
    }

    const orgModal = Modal.create({
        id: "organizations",
        name: "Organizations",
        modalClassList: ["window"],
        title: lgls("title"),

        pages: [
            {
                name: lgls("explore.title"),
                icon: "explore",
                label: exploreOrganizationsRes.success
                    ? Object.keys(exploreOrganizationsRes.msg).length
                    : 0,

                content: [
                    {
                        type: "columns",
                        cols: 2,
                        gap: 10,
                        items: exploreItems,
                    },
                ],
            },
            {
                name: lgls("membership.title"),
                icon: "group",
                label: Object.keys(userOrgs).length,

                content: [
                    {
                        type: "row",
                        gap: 10,
                        items: membershipItems,
                    },
                ],
            },
            dashboardModalObject({ lgls }),
            {
                divider: true,
            },
            createNewModalObject({ lgls }),
            joinModalObject({ lgls }),
            {
                divider: true,
            },
            searchModalObject({ lgls }),
            {
                divider: true,
            },
        ],
    });

    const element = orgModal.el;
    const createOrgNameField = element.querySelector("#orgName");
    const createOrgDescField = element.querySelector("#orgDesc");
    const createOrgWebsiteField = element.querySelector("#orgWebsite");
    const createOrgSubmitBtn = element.querySelector("#orgConfirm");
    const modalPreview = element.querySelector(".modal-org#orgPreview");

    // create organization

    createNewModalHandle({
        lgls,
        modalPreview,
        createOrgNameField,
        createOrgDescField,
        createOrgWebsiteField,
        createOrgSubmitBtn,
        orgModal,
        element,
    });

    // dashboard

    dashboardModalHandle({
        userOrgs,
        element,
        orgModal,
    });

    //

    // join

    joinModalHandle({
        element,
        lgls,
    });

    //

    // search

    searchModalHandle({
        modal: orgModal,
        element,
        lgls,
    });

    return orgModal;
}
