const url = "https://api.mojang.com/profiles/minecraft";

/**
 *
 * @param {string} url
 * @param {string[]} body
 * @returns
 */
async function safeFetch(url, body) {
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        method: "POST",
    });
    const text = await res.text();
    if (res.status === 429) {
        // console.error(text);
        return null;
    }
    /** @type {{id: string; name: string; demo?: true}[]} */
    let json;
    try {
        if (!res.ok) throw new Error("Error Status Code " + res.status);
        json = JSON.parse(text);
    } catch (error) {
        console.error(text);
        throw error;
    }
    return json;
}

console.log(await safeFetch(url, ["xm1", "e22"]));
