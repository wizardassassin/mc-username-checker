import fs from "fs/promises";
import crypto from "crypto";

import {
    genAllUsernames,
    genFromFile,
    letters,
    numbers,
    underscore,
} from "./usernameGenerator.js";
import { PingCounter } from "./pingCounter.js";

const url = "https://api.mojang.com/profiles/minecraft";
// const url =
//     "https://api.minecraftservices.com/minecraft/profile/lookup/bulk/byname";

const pingCounter = new PingCounter();

/**
 *
 * @param {string} url
 * @param {string[]} body
 * @returns
 */
async function safeFetch(url, body) {
    pingCounter.ping();
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
    if (!res.ok) {
        await fs.writeFile(
            crypto.randomUUID() + ".json",
            JSON.stringify(
                {
                    statusCode: res.status,
                    headers: res.headers,
                    response: text,
                },
                null,
                4
            )
        );
        console.error(`Invalid Status Code ${res.status}. Waiting 60 seconds.`);
        await sleep(60000);
        return null;
    }
    /** @type {{id: string; name: string; demo?: true}[]} */
    let json;
    try {
        // if (!res.ok) throw new Error("Error Status Code " + res.status);
        json = JSON.parse(text);
    } catch (error) {
        console.error(text);
        throw error;
    }
    pingCounter.pingSuccess();
    return json;
}

/**
 *
 * @param {string} filename
 * @param {any[]} arr
 */
async function appendToArray(filename, arr) {
    const file = await fs.readFile(filename, "utf-8");
    const json = JSON.parse(file);
    const newJson = [...json, ...arr];
    await fs.writeFile(filename, JSON.stringify(newJson, null, 4));
}

/**
 *
 * @param {number} ms
 */
function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

/**
 *
 * @param {string[]} usernames
 */
async function fetchUsernameData(usernames) {
    console.time("Fetch");
    const json = await safeFetch(url, usernames);
    console.timeEnd("Fetch");
    if (!json) {
        console.error("Hit Rate Limit. Waiting 5 seconds.");
        console.log(pingCounter.getStats());
        await sleep(5000);
        await fetchUsernameData(usernames);
        return;
    }
    const takenUsernames = new Set(json.map((x) => x.name.toLowerCase()));
    const availableUsernames = usernames.filter((x) => !takenUsernames.has(x));
    if (availableUsernames.length !== 0) {
        console.log("Available", availableUsernames);
        // await appendToArray("avail.json", availableUsernames);
        await fs.appendFile("avail.txt", availableUsernames.join("\n") + "\n");
    }
    const demoAccounts = json.filter((x) => x.demo);
    if (demoAccounts.length !== 0) {
        console.log("Demo", demoAccounts);
        // await appendToArray("demo.json", demoAccounts);
        await fs.appendFile(
            "demo.txt",
            demoAccounts.map((x) => JSON.stringify(x)).join("\n") + "\n"
        );
    }
}

/**
 *
 * @template T
 * @param {number} length
 * @param {Generator<T, void, unknown>} gen
 */
function* paginateResults(length, gen) {
    while (true) {
        const arr = [];
        for (let i = 0; i < length; i++) {
            const username = gen.next();
            if (username.done) {
                if (arr.length !== 0) yield arr;
                return;
            }
            arr.push(username.value);
        }
        yield arr;
    }
}

let count = 0;
/**
 *
 * @param {string} filename
 * @param {any} data
 */
async function delayedSave(filename, data) {
    if (++count < 10) return;
    count = 0;
    if (prevSize === checked.size) return;
    prevSize = checked.size;
    await fs.writeFile(filename, JSON.stringify(data, null, 4));
}

await fs.appendFile("avail.txt", "");
await fs.appendFile("checked.txt", "");
await fs.appendFile("demo.txt", "");

const checked = new Set([...genFromFile("checked.txt")]);
let prevSize = checked.size;

async function testUsernames() {
    const gen = genAllUsernames(3);
    // const gen = genFromFile("wordlist.txt");
    const page = paginateResults(10, gen);
    for (const usernames of page) {
        if (!checked.has(usernames[0])) {
            await fetchUsernameData(usernames);
        }
        console.log("Tried:", usernames.join(", "));
        // await delayedSave("checked.json", [...checked]);
        await fs.appendFile("checked.txt", usernames[0] + "\n");
        if (!checked.has(usernames[0])) {
            await sleep(500);
        }
        checked.add(usernames[0]);
    }
}
testUsernames();
