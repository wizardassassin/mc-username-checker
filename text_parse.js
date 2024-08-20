import fs from "fs/promises";

const file = await fs.readFile("raw_input.txt", "utf-8");

const words = file.match(/\w+/g);

const words2 = new Set([...words].map((x) => String(x).trim().toLowerCase()));
const output = [...words2].sort().join("\n");
await fs.writeFile("raw_output.txt", output);
const output2 = [...words2]
    .sort()
    .filter((x) => x.length >= 3 && x.length <= 16)
    .join("\n");
await fs.writeFile("wordlist.txt", output2);
