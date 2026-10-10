/**
 * Removes the type declarations generated from the JSDoc, so the next generation starts clean.
 *
 * Runs before every generation. A declaration beside a source is what tsc reads for an import of
 * that source, and tsc refuses to write a file its own program has read as an input.
 */
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const declarations = [
	"index.d.ts",
	"browser.d.ts",
	...readdirSync(resolve(root, "src"), { recursive: true })
		.filter((file) => file.endsWith(".d.ts"))
		.map((file) => join("src", file)),
].filter((file) => existsSync(resolve(root, file)));

for (const file of declarations) rmSync(resolve(root, file));
console.log(`${declarations.length} declarations removed`);
