const host = "https://codemotion.yurba.one/api";

export class _GetOrgAvatar {
    static async get(id, size = "default") {
        if (!id || id <= 0) return false;

        const url = `${host}/media/org-avatar/${id}.jpg?s=${size}&v=${Math.floor(Math.random() * 99999)}`;

        try {
            const response = await fetch(url, {
                method: "HEAD",
                cache: "no-cache",
            });

            return response.headers.get("X-Avatar-Exists") === "true" ? url : false;
        } catch {
            return false;
        }
    }
}