// Copies the country flag images into public/flags/ so the phone number
// country picker can show real flags (Windows doesn't draw flag emoji).
// Runs automatically before `npm run dev` and `npm run build`.
import { cpSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const src = join(dirname(require.resolve("country-flag-icons/package.json")), "3x2");
const dest = new URL("../public/flags/", import.meta.url).pathname;
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("Flags copied to public/flags/");
