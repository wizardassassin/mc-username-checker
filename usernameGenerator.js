import { readFileSync } from "fs";

/**
 *
 * @param {number} length
 * @param {string[][]} wordlist
 * @returns {Generator<string, void, unknown>}
 */
export function* genAllUsernames(length, wordlist = [validChars]) {
    if (length <= 0) return;
    if (length === 1) {
        for (const c of wordlist[0]) yield c;
        return;
    }
    const newWordlist = wordlist.length === 1 ? wordlist : wordlist.slice(1);
    for (const c of wordlist[0])
        for (const username of genAllUsernames(length - 1, newWordlist))
            yield c + username;
    return;
}

/**
 *
 * @param {string} filename
 */
export function* genFromFile(filename) {
    const file = readFileSync(filename, "utf-8")
        .trim()
        .replace(/\r/g, "")
        .split(/\n+/)
        .map((x) => x.trim().toLowerCase())
        .filter((x) => x.length !== 0);
    yield* file;
}

export const letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
];
export const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
export const underscore = ["_"];
export const validChars = [...letters, ...numbers, ...underscore];
